// pages/api/crm/customers/[id]/add-agent.js
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
    // Check permission (only admin, superadmin, superagent can add agents)
    if (!checkPermission(role, 'customers', 'assign')) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'You do not have permission to add agents to customers' 
      });
    }

    const { agentId, reason = '' } = req.body;

    // Validate input
    if (!agentId) {
      return res.status(400).json({ 
        error: 'Validation Error', 
        message: 'Agent ID is required' 
      });
    }

    // Fetch customer
    const customer = await Customer.findOne({ 
      _id: id, 
      isDeleted: false 
    });

    if (!customer) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Customer not found' 
      });
    }

    // Fetch new agent details
    const newAgent = await Profile.findById(agentId);
    if (!newAgent) {
      return res.status(404).json({ 
        error: 'Not Found', 
        message: 'Agent not found' 
      });
    }

    // Validate that the new user is actually an agent
    const validAgentRoles = ['agent', 'egecagent', 'studyagent', 'edugateagent', 'superagent'];
    if (!validAgentRoles.includes(newAgent.role)) {
      return res.status(400).json({ 
        error: 'Invalid Agent', 
        message: 'The selected user is not an agent' 
      });
    }

    // Initialize assignedAgents array if it doesn't exist
    if (!customer.assignment) {
      customer.assignment = {};
    }
    if (!customer.assignment.assignedAgents) {
      customer.assignment.assignedAgents = [];
    }
    if (!customer.assignment.assignmentHistory) {
      customer.assignment.assignmentHistory = [];
    }

    // Check if agent is already assigned
    const existingAgent = customer.assignment.assignedAgents.find(
      a => a.agentId.toString() === agentId && a.isActive
    );

    if (existingAgent) {
      return res.status(400).json({ 
        error: 'Already Assigned', 
        message: 'This agent is already assigned to this customer' 
      });
    }

    // Add new agent to the assignedAgents array
    customer.assignment.assignedAgents.push({
      agentId: newAgent._id,
      agentName: newAgent.name,
      assignedAt: new Date(),
      assignedBy: userId,
      assignedByName: userName,
      counselorStatus: '', // Each agent starts with empty status
      isActive: true,
    });

    // If this is the first agent, also set as primary agent
    if (!customer.assignment.assignedAgentId) {
      customer.assignment.assignedAgentId = newAgent._id;
      customer.assignment.assignedAgentName = newAgent.name;
      customer.assignment.assignedAt = new Date();
      customer.assignment.assignedBy = userId;
      customer.assignment.assignedByName = userName;
    }

    // Add to assignment history
    customer.assignment.assignmentHistory.push({
      action: 'assigned',
      agentId: newAgent._id,
      agentName: newAgent.name,
      performedBy: userId,
      performedByName: userName,
      performedAt: new Date(),
      reason,
    });

    await customer.save();

    // Log audit
    await logAudit({
      action: 'CUSTOMER_AGENT_ADDED',
      entityType: 'Customer',
      entityId: customer._id,
      entityName: customer.basicData.customerName,
      userId,
      userName,
      userEmail,
      details: {
        customerNumber: customer.customerNumber,
        addedAgentId: newAgent._id,
        addedAgentName: newAgent.name,
        reason,
        totalAgents: customer.assignment.assignedAgents.filter(a => a.isActive).length,
      },
    });

    return res.status(200).json({
      success: true,
      message: `Agent ${newAgent.name} added successfully`,
      customer,
    });

  } catch (error) {
    console.error('Error adding agent to customer:', error);
    return res.status(500).json({ 
      error: 'Server Error', 
      message: error.message 
    });
  }
}
