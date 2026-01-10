// pages/api/crm/customers/[id]/reassign.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import Customer from '@/models/Customer';
import { Profile } from '@/models/Profile';
import { checkPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/auditLogger';
import { mongooseConnect } from '@/lib/mongoose';
import { checkDirectAccess } from '@/lib/apiProtection';

export default async function handler(req, res) {
  // Block direct browser access
  if (checkDirectAccess(req, res)) return;
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  await mongooseConnect();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { id } = req.query;
  const { role, id: userId, name: userName, email: userEmail } = session.user;
  
  try {
    // Check permission (only admin, superadmin, superagent can reassign)
    const canReassign = ['admin', 'superadmin', 'superagent'].includes(role);
    
    if (!canReassign) {
      return res.status(403).json({ 
        error: 'Forbidden: You do not have permission to reassign customers' 
      });
    }
    
    const { newAgentId, reason } = req.body;
    
    if (!newAgentId) {
      return res.status(400).json({ error: 'New agent ID is required' });
    }
    
    // Validate new agent exists and is active
    const newAgent = await Profile.findOne({
      _id: newAgentId,
      isActive: true,
      role: { $in: ['agent', 'superagent'] }
    }).select('name email role').lean();
    
    if (!newAgent) {
      return res.status(404).json({ error: 'New agent not found or inactive' });
    }
    
    // Find customer
    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Get current assignment details
    const oldAgentId = customer.assignment?.assignedAgentId;
    const oldAgentName = customer.assignment?.assignedAgentName;
    
    // Initialize assignment structure if needed
    if (!customer.assignment) {
      customer.assignment = {};
    }
    if (!customer.assignment.assignedAgents) {
      customer.assignment.assignedAgents = [];
    }
    if (!customer.assignment.assignmentHistory) {
      customer.assignment.assignmentHistory = [];
    }
    
    // Check if new agent is already assigned
    const alreadyAssigned = customer.assignment.assignedAgents.some(
      a => a.agentId.toString() === newAgentId && a.isActive
    );
    
    if (alreadyAssigned) {
      return res.status(400).json({ 
        error: 'This agent is already assigned to this customer',
        message: 'Use the customer view to see all assigned agents'
      });
    }
    
    // Store old values for audit
    const oldValues = {
      assignedAgentId: oldAgentId,
      assignedAgentName: oldAgentName
    };
    
    // **KEY CHANGE: ADD new agent to assignedAgents array (don't replace)**
    customer.assignment.assignedAgents.push({
      agentId: newAgentId,
      agentName: newAgent.name,
      assignedAt: new Date(),
      assignedBy: userId,
      assignedByName: userName,
      counselorStatus: '', // New agent starts with empty status
      isActive: true
    });
    
    // Update primary agent (for backwards compatibility)
    customer.assignment.assignedAgentId = newAgentId;
    customer.assignment.assignedAgentName = newAgent.name;
    customer.assignment.assignedAt = new Date();
    customer.assignment.assignedBy = userId;
    customer.assignment.assignedByName = userName;
    
    // Add to assignment history
    customer.assignment.assignmentHistory.push({
      action: 'assigned',
      agentId: newAgentId,
      agentName: newAgent.name,
      performedBy: userId,
      performedByName: userName,
      performedAt: new Date(),
      reason: reason || 'Agent added via reassign'
    });
    
    // Update marketingData counselor if this is the first agent
    if (customer.marketingData && !customer.marketingData.counselorId) {
      customer.marketingData.counselorId = newAgentId;
      customer.marketingData.counselorName = newAgent.name;
    }
    
    // ✅ IMPORTANT: Each agent has their own counselorStatus in assignedAgents array
    // The new agent's counselorStatus is already set to empty string (reset)
    // This allows the new agent to set their own status without affecting other agents
    
    // Update updatedBy
    customer.updatedBy = userId;
    customer.updatedByName = userName;
    
    // Mark as modified to ensure save
    customer.markModified('assignment');
    customer.markModified('marketingData');
    
    await customer.save();
    
    // Log audit
    await logAudit({
      userId,
      userEmail,
      userName,
      userRole: role,
      action: 'AGENT_ADDED',
      entityType: 'customer',
      entityId: customer._id,
      entityName: customer.basicData?.customerName,
      oldValues: oldValues,
      newValues: {
        addedAgentId: newAgentId,
        addedAgentName: newAgent.name,
        totalAgents: customer.assignment.assignedAgents.filter(a => a.isActive).length
      },
      description: `Added agent ${newAgent.name} to customer. Previous agent ${oldAgentName || 'None'} retains access.`,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestMethod: 'POST',
      requestPath: `/api/crm/customers/${id}/reassign`
    });
    
    return res.status(200).json({
      success: true,
      data: customer,
      message: `Agent ${newAgent.name} added successfully. ${oldAgentName ? oldAgentName + ' still has access.' : ''}`,
      assignmentDetails: {
        previousPrimaryAgent: oldAgentName || 'Unassigned',
        newAgentAdded: newAgent.name,
        newPrimaryAgent: newAgent.name,
        bothAgentsHaveAccess: true,
        totalActiveAgents: customer.assignment.assignedAgents.filter(a => a.isActive).length,
        assignedBy: userName,
        assignedAt: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error reassigning customer:', error);
    return res.status(500).json({ 
      error: 'Failed to reassign customer',
      details: error.message
    });
  }
}
