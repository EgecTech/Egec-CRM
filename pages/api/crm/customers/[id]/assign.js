// pages/api/crm/customers/[id]/assign.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]';
import Customer from '@/models/Customer';
import { Profile } from '@/models/Profile';
import { checkPermission } from '@/lib/permissions';
import { logAudit } from '@/lib/auditLogger';
import { mongooseConnect } from '@/lib/mongoose';

export default async function handler(req, res) {
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
      role: { $in: ['agent', 'egecagent', 'studyagent', 'edugateagent'] }
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
    
    // Update assignment
    customer.assignment = {
      assignedAgentId,
      assignedAgentName: agent.name,
      assignedAt: new Date(),
      assignedBy: userId,
      assignedByName: userName
    };
    
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

