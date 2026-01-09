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
      role: { $in: ['agent', 'egecagent', 'studyagent', 'edugateagent', 'superagent'] }
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
    const oldCounselorStatus = customer.evaluation?.counselorStatus;
    
    // Cannot reassign to same agent
    if (oldAgentId && oldAgentId.toString() === newAgentId) {
      return res.status(400).json({ 
        error: 'Customer is already assigned to this agent' 
      });
    }
    
    // Store old values for audit
    const oldValues = {
      assignedAgentId: oldAgentId,
      assignedAgentName: oldAgentName,
      counselorStatus: oldCounselorStatus
    };
    
    // Update assignment
    if (!customer.assignment) {
      customer.assignment = {};
    }
    
    customer.assignment.assignedAgentId = newAgentId;
    customer.assignment.assignedAgentName = newAgent.name;
    customer.assignment.assignedAt = new Date();
    customer.assignment.assignedBy = userId;
    customer.assignment.assignedByName = userName;
    
    // Initialize reassignment history if doesn't exist
    if (!customer.assignment.reassignmentHistory) {
      customer.assignment.reassignmentHistory = [];
    }
    
    // Add to reassignment history
    customer.assignment.reassignmentHistory.push({
      fromAgentId: oldAgentId,
      fromAgentName: oldAgentName || 'Unassigned',
      toAgentId: newAgentId,
      toAgentName: newAgent.name,
      reassignedAt: new Date(),
      reassignedBy: userId,
      reassignedByName: userName,
      reason: reason || 'Reassignment by admin',
      previousCounselorStatus: oldCounselorStatus || ''
    });
    
    // Update marketingData counselor if exists
    if (customer.marketingData) {
      customer.marketingData.counselorId = newAgentId;
      customer.marketingData.counselorName = newAgent.name;
    }
    
    // RESET ONLY counselorStatus in evaluation
    if (!customer.evaluation) {
      customer.evaluation = {};
    }
    customer.evaluation.counselorStatus = '';
    
    // Update updatedBy
    customer.updatedBy = userId;
    customer.updatedByName = userName;
    
    // Mark as modified to ensure save
    customer.markModified('assignment');
    customer.markModified('marketingData');
    customer.markModified('evaluation');
    
    await customer.save();
    
    // Log audit
    await logAudit({
      userId,
      userEmail,
      userName,
      userRole: role,
      action: 'REASSIGN',
      entityType: 'customer',
      entityId: customer._id,
      entityName: customer.basicData?.customerName,
      oldValues: oldValues,
      newValues: {
        assignedAgentId: newAgentId,
        assignedAgentName: newAgent.name,
        counselorStatus: '' // Reset
      },
      description: `Reassigned customer from ${oldAgentName || 'Unassigned'} to ${newAgent.name}. Counselor status reset.`,
      ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
      userAgent: req.headers['user-agent'],
      requestMethod: 'POST',
      requestPath: `/api/crm/customers/${id}/reassign`
    });
    
    return res.status(200).json({
      success: true,
      data: customer,
      message: `Customer reassigned to ${newAgent.name} successfully. Counselor status has been reset.`,
      reassignmentDetails: {
        from: oldAgentName || 'Unassigned',
        to: newAgent.name,
        counselorStatusReset: true,
        previousCounselorStatus: oldCounselorStatus || 'None',
        reassignedBy: userName,
        reassignedAt: new Date()
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
