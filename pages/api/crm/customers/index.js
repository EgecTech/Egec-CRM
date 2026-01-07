// pages/api/crm/customers/index.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import Customer from '@/models/Customer';
import { buildCustomerQuery, checkPermission } from '@/lib/permissions';
import { generateCustomerNumber, checkDuplicateCustomer, validateCustomerData } from '@/lib/customerUtils';
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
  
  // GET - List customers
  if (method === 'GET') {
    try {
      // Build base query based on role
      const baseQuery = buildCustomerQuery(role, userId);
      
      // Apply filters from query params
      const { 
        search, 
        salesStatus, 
        interestRate, 
        assignedAgent,
        country,
        nationality,
        source,
        desiredUniversity,
        desiredSpecialization,
        createdFrom,
        createdTo,
        nextFollowupFrom,
        nextFollowupTo,
        page = 1, 
        limit = 20,
        sort = '-createdAt'
      } = req.query;
      
      const query = { ...baseQuery };
      
      // Text search
      if (search) {
        query.$text = { $search: search };
      }
      
      // Filters
      if (salesStatus) {
        query['evaluation.salesStatus'] = salesStatus;
      }
      if (interestRate) {
        query['evaluation.interestRate'] = interestRate;
      }
      if (assignedAgent) {
        query['assignment.assignedAgentId'] = assignedAgent;
      }
      if (country) {
        query['basicData.country'] = country;
      }
      if (nationality) {
        query['basicData.nationality'] = nationality;
      }
      if (source) {
        query['marketingData.source'] = source;
      }
      if (desiredUniversity) {
        query['desiredProgram.desiredUniversity'] = desiredUniversity;
      }
      if (desiredSpecialization) {
        query['desiredProgram.desiredSpecialization'] = desiredSpecialization;
      }
      
      // Date range filters
      if (createdFrom || createdTo) {
        query.createdAt = {};
        if (createdFrom) query.createdAt.$gte = new Date(createdFrom);
        if (createdTo) query.createdAt.$lte = new Date(createdTo);
      }
      
      if (nextFollowupFrom || nextFollowupTo) {
        query['evaluation.nextFollowupDate'] = {};
        if (nextFollowupFrom) query['evaluation.nextFollowupDate'].$gte = new Date(nextFollowupFrom);
        if (nextFollowupTo) query['evaluation.nextFollowupDate'].$lte = new Date(nextFollowupTo);
      }
      
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const [customers, total] = await Promise.all([
        Customer.find(query)
          .select('customerNumber basicData evaluation assignment createdAt updatedAt stats')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Customer.countDocuments(query)
      ]);
      
      return res.status(200).json({
        success: true,
        data: customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
      
    } catch (error) {
      console.error('Error fetching customers:', error);
      return res.status(500).json({ error: 'Failed to fetch customers', details: error.message });
    }
  }
  
  // POST - Create customer
  if (method === 'POST') {
    try {
      // Check permission
      if (!checkPermission(role, 'customers', 'create')) {
        return res.status(403).json({ error: 'Forbidden: You do not have permission to create customers' });
      }
      
      const customerData = req.body;
      
      // Validate customer data
      const validation = validateCustomerData(customerData);
      if (!validation.isValid) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          errors: validation.errors 
        });
      }
      
      // Check for duplicates
      const duplicate = await checkDuplicateCustomer(
        customerData.basicData?.customerPhone,
        customerData.basicData?.email
      );
      
      if (duplicate) {
        return res.status(409).json({ 
          error: 'Duplicate customer found',
          duplicate: {
            id: duplicate._id,
            customerNumber: duplicate.customerNumber,
            name: duplicate.basicData?.customerName,
            phone: duplicate.basicData?.customerPhone,
            email: duplicate.basicData?.email,
            assignedAgent: duplicate.assignment?.assignedAgentName,
            status: duplicate.evaluation?.salesStatus
          }
        });
      }
      
      // Generate customer number
      const customerNumber = await generateCustomerNumber();
      
      // Prepare customer data with assignment if counselor is selected
      const customerToCreate = {
        ...customerData,
        customerNumber,
        createdBy: userId,
        createdByName: userName
      };
      
      // If counselor is assigned, also set assignment field
      if (customerData.marketingData?.counselorId) {
        customerToCreate.assignment = {
          assignedAgentId: customerData.marketingData.counselorId,
          assignedAgentName: customerData.marketingData.counselorName,
          assignedAt: new Date(),
          assignedBy: userId,
          assignedByName: userName
        };
      }
      
      // Create customer
      const customer = await Customer.create(customerToCreate);
      
      // Log audit
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'CREATE',
        entityType: 'customer',
        entityId: customer._id,
        entityName: customer.basicData?.customerName,
        newValues: customer.toObject(),
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestMethod: 'POST',
        requestPath: '/api/crm/customers'
      });
      
      return res.status(201).json({
        success: true,
        data: customer,
        message: 'Customer created successfully'
      });
      
    } catch (error) {
      console.error('Error creating customer:', error);
      
      // Log failed attempt
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'CREATE',
        entityType: 'customer',
        errorMessage: error.message,
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestMethod: 'POST',
        requestPath: '/api/crm/customers',
        statusCode: 500
      });
      
      return res.status(500).json({ 
        error: 'Failed to create customer', 
        details: error.message 
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Apply rate limiting
export default withRateLimit(handler, {
  maxRequests: 100,
  windowMs: 60000
});
