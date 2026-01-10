// pages/api/crm/customers/[id].js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import Customer from '@/models/Customer';
import { canViewCustomer, canEditCustomer, checkPermission } from '@/lib/permissions';
import { validateCustomerData } from '@/lib/customerUtils';
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
  
  // GET - Get customer details
  if (method === 'GET') {
    try {
      const customer = await Customer.findOne({ 
        _id: id, 
        isDeleted: false 
      }).lean();
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      // Check permission
      if (!canViewCustomer(role, userId, customer)) {
        return res.status(403).json({ error: 'Forbidden: You do not have access to this customer' });
      }
      
      return res.status(200).json({
        success: true,
        data: customer
      });
      
    } catch (error) {
      console.error('Error fetching customer:', error);
      return res.status(500).json({ error: 'Failed to fetch customer', details: error.message });
    }
  }
  
  // PUT - Update customer
  if (method === 'PUT') {
    try {
      const customer = await Customer.findOne({ _id: id, isDeleted: false });
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      // Check permission
      if (!canEditCustomer(role, userId, customer)) {
        // Check if it's a data entry user outside edit window
        if (role === 'dataentry') {
          const createdAt = new Date(customer.createdAt);
          const now = new Date();
          const minutesSinceCreation = (now - createdAt) / 1000 / 60;
          
          if (minutesSinceCreation > 15) {
            return res.status(403).json({ 
              error: 'Edit window expired',
              message: 'You can only edit customers within 15 minutes of creation'
            });
          }
        }
        
        return res.status(403).json({ error: 'Forbidden: You do not have permission to edit this customer' });
      }
      
      // Store old values for audit
      const oldValues = customer.toObject();
      
      // Validate update data
      const updateData = req.body;
      const validation = validateCustomerData(updateData);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          errors: validation.errors 
        });
      }
      
      // ⚠️ IMPORTANT: Remove old counselorStatus from evaluation if present
      // It's now stored per-agent in assignedAgents array, not at root level
      const counselorStatusToTrack = updateData.evaluation?.counselorStatus;
      
      if (updateData.evaluation && 'counselorStatus' in updateData.evaluation) {
        delete updateData.evaluation.counselorStatus;
      }
      
      // Update customer
      Object.assign(customer, updateData);
      customer.updatedBy = userId;
      customer.updatedByName = userName;
      
      // ✅ SPECIAL HANDLING: Track counselorStatus updates per agent
      // If the user is an agent updating the customer, update their counselorStatus tracking
      if (
        counselorStatusToTrack !== undefined &&
        customer.assignment?.assignedAgents?.length > 0
      ) {
        // Find this agent in the assignedAgents array
        const agentIndex = customer.assignment.assignedAgents.findIndex(
          a => a.agentId && a.agentId.toString() === userId && a.isActive
        );
        
        if (agentIndex !== -1 && agentIndex !== undefined) {
          const currentTime = new Date();
          
          // Update this agent's counselorStatus and tracking fields
          customer.assignment.assignedAgents[agentIndex].counselorStatus = counselorStatusToTrack || '';
          customer.assignment.assignedAgents[agentIndex].counselorStatusLastUpdatedBy = userId;
          customer.assignment.assignedAgents[agentIndex].counselorStatusLastUpdatedByName = userName;
          customer.assignment.assignedAgents[agentIndex].counselorStatusLastUpdatedAt = currentTime;
          
          // 🎯 UPDATE MAIN STATUS: Set this as the latest status update
          if (!customer.assignment.latestCounselorStatus) {
            customer.assignment.latestCounselorStatus = {};
          }
          customer.assignment.latestCounselorStatus.status = counselorStatusToTrack || '';
          customer.assignment.latestCounselorStatus.agentId = userId;
          customer.assignment.latestCounselorStatus.agentName = userName;
          customer.assignment.latestCounselorStatus.updatedAt = currentTime;
          
          // Mark as modified to ensure save
          customer.markModified('assignment.assignedAgents');
          customer.markModified('assignment.latestCounselorStatus');
          
          // Add to assignment history
          if (!customer.assignment.assignmentHistory) {
            customer.assignment.assignmentHistory = [];
          }
          customer.assignment.assignmentHistory.push({
            action: 'status_updated',
            agentId: userId,
            agentName: userName,
            performedBy: userId,
            performedByName: userName,
            performedAt: currentTime,
            reason: `Updated counselorStatus to: ${counselorStatusToTrack || 'empty'}`
          });
        }
      }
      
      await customer.save();
      
      // Log audit
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'UPDATE',
        entityType: 'customer',
        entityId: customer._id,
        entityName: customer.basicData?.customerName,
        oldValues,
        newValues: customer.toObject(),
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestMethod: 'PUT',
        requestPath: `/api/crm/customers/${id}`
      });
      
      return res.status(200).json({
        success: true,
        data: customer,
        message: 'Customer updated successfully'
      });
      
    } catch (error) {
      console.error('Error updating customer:', error);
      
      // Log failed attempt
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'UPDATE',
        entityType: 'customer',
        entityId: id,
        errorMessage: error.message,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestMethod: 'PUT',
        requestPath: `/api/crm/customers/${id}`,
        statusCode: 500
      });
      
      return res.status(500).json({ error: 'Failed to update customer', details: error.message });
    }
  }
  
  // DELETE - Soft delete (superadmin only)
  if (method === 'DELETE') {
    try {
      if (!checkPermission(role, 'customers', 'delete')) {
        return res.status(403).json({ error: 'Forbidden: Only superadmin can delete customers' });
      }
      
      const customer = await Customer.findById(id);
      
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      
      if (customer.isDeleted) {
        return res.status(400).json({ error: 'Customer already deleted' });
      }
      
      // Store old values for audit
      const oldValues = customer.toObject();
      
      // Soft delete
      customer.isDeleted = true;
      customer.deletedAt = new Date();
      customer.deletedBy = userId;
      customer.deletedByName = userName;
      
      await customer.save();
      
      // Log audit
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'DELETE',
        entityType: 'customer',
        entityId: customer._id,
        entityName: customer.basicData?.customerName,
        oldValues,
        newValues: customer.toObject(),
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestMethod: 'DELETE',
        requestPath: `/api/crm/customers/${id}`
      });
      
      return res.status(200).json({
        success: true,
        message: 'Customer deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting customer:', error);
      return res.status(500).json({ error: 'Failed to delete customer', details: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Apply rate limiting
export default withRateLimit(handler, {
  maxRequests: 100,
  windowMs: 60000
});
