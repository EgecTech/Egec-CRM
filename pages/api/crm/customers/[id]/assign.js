// pages/api/crm/customers/[id]/assign.js
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
  const { assignedAgentId } = req.body;
  const { role, id: userId, name: userName, email: userEmail } = session.user;
  
  try {
    // Check permission (only admin and superadmin can assign)
    if (!checkPermission(role, 'customers', 'assign')) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to assign customers' });
    }
    
    // Validate agent exists and is active
    const agent = await Profile.findOne({
      _id: assignedAgentId,
      isActive: true,
      role: 'agent' // Only regular agents can be assigned to customers
    }).select('name email role').lean();
    
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found or inactive' });
    }
    
    // Find customer
    const customer = await Customer.findOne({ _id: id, isDeleted: false });
    
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    
    // Store old values for audit
    const oldValues = customer.toObject();
    
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
    
    // Check if agent is already in assignedAgents array
    const existingAgentIndex = customer.assignment.assignedAgents.findIndex(
      a => a.agentId.toString() === assignedAgentId
    );
    
    if (existingAgentIndex >= 0) {
      // Reactivate if exists but inactive
      customer.assignment.assignedAgents[existingAgentIndex].isActive = true;
      customer.assignment.assignedAgents[existingAgentIndex].assignedAt = new Date();
      customer.assignment.assignedAgents[existingAgentIndex].assignedBy = userId;
      customer.assignment.assignedAgents[existingAgentIndex].assignedByName = userName;
    } else {
      // Add new agent to assignedAgents array
      customer.assignment.assignedAgents.push({
        agentId: assignedAgentId,
        agentName: agent.name,
        assignedAt: new Date(),
        assignedBy: userId,
        assignedByName: userName,
        counselorStatus: '',
        isActive: true
      });
    }
    
    // Set as primary agent (for backwards compatibility)
    customer.assignment.assignedAgentId = assignedAgentId;
    customer.assignment.assignedAgentName = agent.name;
    customer.assignment.assignedAt = new Date();
    customer.assignment.assignedBy = userId;
    customer.assignment.assignedByName = userName;
    
    // Add to assignment history
    customer.assignment.assignmentHistory.push({
      action: 'assigned',
      agentId: assignedAgentId,
      agentName: agent.name,
      performedBy: userId,
      performedByName: userName,
      performedAt: new Date(),
      reason: 'Initial assignment'
    });
    
    await customer.save();
    
    // Log audit
    await logAudit({
      userId,
      userEmail,
      userName,
      userRole: role,
      action: 'ASSIGN',
      entityType: 'customer',
      entityId: customer._id,
      entityName: customer.basicData?.customerName,
      oldValues: oldValues.assignment,
      newValues: customer.assignment,
      description: `Assigned customer to ${agent.name}`,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestMethod: 'POST',
      requestPath: `/api/crm/customers/${id}/assign`
    });
    
    return res.status(200).json({
      success: true,
      data: customer,
      message: `Customer assigned to ${agent.name} successfully`
    });
    
  } catch (error) {
    console.error('Error assigning customer:', error);
    return res.status(500).json({ error: 'Failed to assign customer', details: error.message });
  }
}

