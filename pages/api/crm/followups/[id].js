// pages/api/crm/followups/[id].js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import Followup from '@/models/Followup';
import Customer from '@/models/Customer';
import { updateCustomerStats } from '@/lib/customerUtils';
import { logAudit } from '@/lib/auditLogger';
import { mongooseConnect } from '@/lib/mongoose';
import { withRateLimit } from '@/lib/rateLimit';
import { checkDirectAccess } from '@/lib/apiProtection';

async function handler(req, res) {
  // Block direct browser access
  if (checkDirectAccess(req, res)) return;
  
  await mongooseConnect();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { method, query: { id } } = req;
  const { role, id: userId, name: userName, email: userEmail } = session.user;
  
  // GET - Get followup details
  if (method === 'GET') {
    try {
      const followup = await Followup.findById(id)
        .populate('customerId', 'customerNumber basicData evaluation')
        .lean();
      
      if (!followup) {
        return res.status(404).json({ error: 'Follow-up not found' });
      }
      
      // Check permission
      if (role === 'agent' || role === 'egecagent' || role === 'studyagent' || role === 'edugateagent') {
        if (followup.agentId?.toString() !== userId) {
          return res.status(403).json({ error: 'Forbidden: Not your follow-up' });
        }
      }
      
      return res.status(200).json({
        success: true,
        data: followup
      });
      
    } catch (error) {
      console.error('Error fetching followup:', error);
      return res.status(500).json({ error: 'Failed to fetch followup', details: error.message });
    }
  }
  
  // PUT - Update followup
  if (method === 'PUT') {
    try {
      const followup = await Followup.findById(id);
      
      if (!followup) {
        return res.status(404).json({ error: 'Follow-up not found' });
      }
      
      // Check permission (only owner or admin/superadmin can edit)
      if (role === 'agent' || role === 'egecagent' || role === 'studyagent' || role === 'edugateagent') {
        if (followup.agentId?.toString() !== userId) {
          return res.status(403).json({ error: 'Forbidden: Not your follow-up' });
        }
      }
      
      // Store old values for audit
      const oldValues = followup.toObject();
      
      // Update followup
      const updateData = req.body;
      Object.assign(followup, updateData);
      
      // If marking as completed, set completedAt
      if (updateData.status === 'Completed' && !followup.completedAt) {
        followup.completedAt = new Date();
        followup.completedBy = userId;
      }
      
      await followup.save();
      
      // Update customer's next followup date if provided
      if (updateData.nextFollowupDate) {
        await Customer.findByIdAndUpdate(followup.customerId, {
          'evaluation.nextFollowupDate': new Date(updateData.nextFollowupDate)
        });
      }
      
      // Update customer stats
      await updateCustomerStats(followup.customerId);
      
      // Log audit
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'UPDATE',
        entityType: 'followup',
        entityId: followup._id,
        entityName: `${followup.followupType} - ${followup.customerName}`,
        oldValues,
        newValues: followup.toObject(),
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestMethod: 'PUT',
        requestPath: `/api/crm/followups/${id}`
      });
      
      return res.status(200).json({
        success: true,
        data: followup,
        message: 'Follow-up updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating followup:', error);
      return res.status(500).json({ error: 'Failed to update followup', details: error.message });
    }
  }
  
  // DELETE - Delete followup (admin/superadmin only)
  if (method === 'DELETE') {
    try {
      if (role !== 'admin' && role !== 'superadmin') {
        return res.status(403).json({ error: 'Forbidden: Only admin can delete follow-ups' });
      }
      
      const followup = await Followup.findById(id);
      
      if (!followup) {
        return res.status(404).json({ error: 'Follow-up not found' });
      }
      
      const oldValues = followup.toObject();
      
      await followup.deleteOne();
      
      // Update customer stats
      await updateCustomerStats(followup.customerId);
      
      // Log audit
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'DELETE',
        entityType: 'followup',
        entityId: followup._id,
        entityName: `${followup.followupType} - ${followup.customerName}`,
        oldValues,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestMethod: 'DELETE',
        requestPath: `/api/crm/followups/${id}`
      });
      
      return res.status(200).json({
        success: true,
        message: 'Follow-up deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting followup:', error);
      return res.status(500).json({ error: 'Failed to delete followup', details: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Apply rate limiting
export default withRateLimit(handler, {
  maxRequests: 100,
  windowMs: 60000
});
