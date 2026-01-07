// pages/api/crm/followups/index.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import Followup from '@/models/Followup';
import Customer from '@/models/Customer';
import { buildFollowupQuery, checkPermission, canEditCustomer } from '@/lib/permissions';
import { updateCustomerStats } from '@/lib/customerUtils';
import { logAudit } from '@/lib/auditLogger';
import { mongooseConnect } from '@/lib/mongoose';
import { withRateLimit } from '@/lib/rateLimit';

async function handler(req, res) {
  await mongooseConnect();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { method } = req;
  const { role, id: userId, name: userName, email: userEmail } = session.user;
  
  // GET - List followups
  if (method === 'GET') {
    try {
      // Build base query based on role
      const baseQuery = buildFollowupQuery(role, userId);
      
      // Apply filters from query params
      const { 
        status,
        customerId,
        followupType,
        overdue,
        today,
        thisWeek,
        page = 1, 
        limit = 20,
        sort = 'followupDate'
      } = req.query;
      
      const query = { ...baseQuery };
      
      if (status) query.status = status;
      if (customerId) query.customerId = customerId;
      if (followupType) query.followupType = followupType;
      
      // Overdue followups
      if (overdue === 'true') {
        query.status = 'Pending';
        query.followupDate = { $lt: new Date() };
      }
      
      // Today's followups
      if (today === 'true') {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date();
        todayEnd.setHours(23, 59, 59, 999);
        
        query.followupDate = { $gte: todayStart, $lte: todayEnd };
      }
      
      // This week's followups
      if (thisWeek === 'true') {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        
        query.followupDate = { $gte: weekStart, $lt: weekEnd };
      }
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [followups, total] = await Promise.all([
        Followup.find(query)
          .populate('customerId', 'customerNumber basicData evaluation')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Followup.countDocuments(query)
      ]);
      
      return res.status(200).json({
        success: true,
        data: followups,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
      
    } catch (error) {
      console.error('Error fetching followups:', error);
      return res.status(500).json({ error: 'Failed to fetch followups', details: error.message });
    }
  }
  
  // POST - Create followup
  if (method === 'POST') {
    try {
      const { 
        customerId, 
        followupType, 
        followupDate, 
        nextFollowupDate, 
        notes, 
        outcome, 
        durationMinutes,
        status = 'Pending'
      } = req.body;
      
      // Validate required fields
      if (!customerId || !followupType || !followupDate || !notes) {
        return res.status(400).json({ 
          error: 'Missing required fields',
          required: ['customerId', 'followupType', 'followupDate', 'notes']
        });
      }
      
      // Verify customer exists
      const customer = await Customer.findOne({ _id: customerId, isDeleted: false });
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      // Check if user can add followup to this customer
      if (role === 'agent' || role === 'egecagent' || role === 'studyagent' || role === 'edugateagent') {
        if (customer.assignment?.assignedAgentId?.toString() !== userId) {
          return res.status(403).json({ error: 'Forbidden: Customer not assigned to you' });
        }
      }
      
      // Create followup
      const followup = await Followup.create({
        customerId,
        customerName: customer.basicData?.customerName,
        customerPhone: customer.basicData?.customerPhone,
        customerNumber: customer.customerNumber,
        agentId: userId,
        agentName: userName,
        followupType,
        followupDate: new Date(followupDate),
        nextFollowupDate: nextFollowupDate ? new Date(nextFollowupDate) : null,
        status,
        notes,
        outcome,
        durationMinutes,
        completedAt: status === 'Completed' ? new Date() : null,
        completedBy: status === 'Completed' ? userId : null,
        createdBy: userId
      });
      
      // Update customer's next followup date if provided
      if (nextFollowupDate) {
        customer.evaluation.nextFollowupDate = new Date(nextFollowupDate);
        await customer.save();
      }
      
      // Update customer stats
      await updateCustomerStats(customerId);
      
      // Log audit
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'CREATE',
        entityType: 'followup',
        entityId: followup._id,
        entityName: `${followupType} - ${customer.basicData?.customerName}`,
        newValues: followup.toObject(),
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestMethod: 'POST',
        requestPath: '/api/crm/followups'
      });
      
      return res.status(201).json({
        success: true,
        data: followup,
        message: 'Follow-up created successfully'
      });
      
    } catch (error) {
      console.error('Error creating followup:', error);
      return res.status(500).json({ error: 'Failed to create followup', details: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Apply rate limiting
export default withRateLimit(handler, {
  maxRequests: 100,
  windowMs: 60000
});
