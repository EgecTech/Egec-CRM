// lib/customerUtils.js
import Customer from '@/models/Customer';

/**
 * Generate unique customer number
 * Format: CUS-YYYY-####
 */
export async function generateCustomerNumber() {
  const year = new Date().getFullYear();
  
  // Find the last customer number for this year
  const lastCustomer = await Customer.findOne({
    customerNumber: new RegExp(`^CUS-${year}-`)
  })
  .sort({ customerNumber: -1 })
  .select('customerNumber')
  .lean();
  
  let sequence = 1;
  if (lastCustomer) {
    const lastSequence = parseInt(lastCustomer.customerNumber.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  const customerNumber = `CUS-${year}-${String(sequence).padStart(4, '0')}`;
  return customerNumber;
}

/**
 * Check for duplicate customers
 * Returns existing customer if found
 */
export async function checkDuplicateCustomer(phone, email) {
  if (!phone && !email) {
    return null;
  }
  
  const query = { isDeleted: false };
  
  if (phone && email) {
    query.$or = [
      { 'basicData.customerPhone': phone },
      { 'basicData.email': email }
    ];
  } else if (phone) {
    query['basicData.customerPhone'] = phone;
  } else if (email) {
    query['basicData.email'] = email;
  }
  
  const duplicate = await Customer.findOne(query)
    .select('customerNumber basicData assignment evaluation')
    .lean();
  
  return duplicate;
}

/**
 * Get customer statistics
 */
export async function getCustomerStats(agentId = null) {
  const query = { isDeleted: false };
  if (agentId) {
    query['assignment.assignedAgentId'] = agentId;
  }
  
  const [
    total,
    byStatus,
    byInterest,
    unassigned
  ] = await Promise.all([
    Customer.countDocuments(query),
    Customer.aggregate([
      { $match: query },
      { $group: { _id: '$evaluation.salesStatus', count: { $sum: 1 } } }
    ]),
    Customer.aggregate([
      { $match: query },
      { $group: { _id: '$evaluation.interestRate', count: { $sum: 1 } } }
    ]),
    Customer.countDocuments({ 
      ...query, 
      'assignment.assignedAgentId': { $exists: false } 
    })
  ]);
  
  return {
    total,
    byStatus: byStatus.reduce((acc, item) => {
      acc[item._id || 'Unknown'] = item.count;
      return acc;
    }, {}),
    byInterest: byInterest.reduce((acc, item) => {
      acc[item._id || 'Unknown'] = item.count;
      return acc;
    }, {}),
    unassigned
  };
}

/**
 * Get overdue followups count
 */
export async function getOverdueFollowupsCount(agentId = null) {
  const query = {
    isDeleted: false,
    'evaluation.nextFollowupDate': { $lt: new Date() },
    'evaluation.salesStatus': { $nin: ['Converted', 'Lost'] }
  };
  
  if (agentId) {
    query['assignment.assignedAgentId'] = agentId;
  }
  
  return await Customer.countDocuments(query);
}

/**
 * Get today's followups count
 */
export async function getTodayFollowupsCount(agentId = null) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const query = {
    isDeleted: false,
    'evaluation.nextFollowupDate': { 
      $gte: today,
      $lt: tomorrow
    },
    'evaluation.salesStatus': { $nin: ['Converted', 'Lost'] }
  };
  
  if (agentId) {
    query['assignment.assignedAgentId'] = agentId;
  }
  
  return await Customer.countDocuments(query);
}

/**
 * Update customer stats after followup
 */
export async function updateCustomerStats(customerId) {
  const Followup = (await import('@/models/Followup')).default;
  
  const [totalFollowups, completedFollowups, lastFollowup] = await Promise.all([
    Followup.countDocuments({ customerId }),
    Followup.countDocuments({ customerId, status: 'Completed' }),
    Followup.findOne({ customerId }).sort({ createdAt: -1 }).select('createdAt').lean()
  ]);
  
  const stats = {
    totalFollowups,
    completedFollowups,
    lastFollowupDate: lastFollowup?.createdAt || null
  };
  
  if (stats.lastFollowupDate) {
    const now = new Date();
    const lastContact = new Date(stats.lastFollowupDate);
    stats.daysSinceLastContact = Math.floor((now - lastContact) / (1000 * 60 * 60 * 24));
  }
  
  await Customer.findByIdAndUpdate(customerId, { stats });
}

/**
 * Validate customer data
 */
export function validateCustomerData(data) {
  const errors = [];
  
  // Required fields
  if (!data.basicData?.customerName) {
    errors.push('Customer name is required');
  }
  
  if (!data.basicData?.customerPhone) {
    errors.push('Customer phone is required');
  }
  
  // Phone format validation (basic)
  if (data.basicData?.customerPhone) {
    const phone = data.basicData.customerPhone.replace(/\s/g, '');
    if (!/^\+?[1-9]\d{1,14}$/.test(phone)) {
      errors.push('Invalid phone number format');
    }
  }
  
  // Email validation
  if (data.basicData?.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.basicData.email)) {
      errors.push('Invalid email format');
    }
  }
  
  // Sales status validation
  if (data.evaluation?.salesStatus === 'Lost' && !data.lossData?.lossReason) {
    errors.push('Loss reason is required when status is Lost');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
