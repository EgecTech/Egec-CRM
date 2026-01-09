// pages/api/crm/dashboard/stats.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import Customer from '@/models/Customer';
import Followup from '@/models/Followup';
import { buildCustomerQuery, buildFollowupQuery } from '@/lib/permissions';
import { mongooseConnect } from '@/lib/mongoose';
import { withRateLimit } from '@/lib/rateLimit';
import { checkDirectAccess } from '@/lib/apiProtection';

async function handler(req, res) {
  // Block direct browser access
  if (checkDirectAccess(req, res)) return;
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  await mongooseConnect();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { role, id: userId } = session.user;
  
  try {
    // Build queries based on role
    const customerQuery = buildCustomerQuery(role, userId);
    const followupQuery = buildFollowupQuery(role, userId);
    
    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    // Parallel queries for better performance
    const [
      totalCustomers,
      customersByStatus,
      customersByInterest,
      unassignedCustomers,
      overdueFollowups,
      todayFollowups,
      thisWeekFollowups,
      completedFollowupsThisMonth,
      newCustomersThisMonth,
      convertedThisMonth
    ] = await Promise.all([
      // Total customers
      Customer.countDocuments(customerQuery),
      
      // Customers by sales status
      Customer.aggregate([
        { $match: customerQuery },
        { $group: { _id: '$evaluation.salesStatus', count: { $sum: 1 } } }
      ]),
      
      // Customers by interest rate
      Customer.aggregate([
        { $match: customerQuery },
        { $group: { _id: '$evaluation.interestRate', count: { $sum: 1 } } }
      ]),
      
      // Unassigned customers (admin/superadmin only)
      role === 'admin' || role === 'superadmin'
        ? Customer.countDocuments({ 
            ...customerQuery, 
            'assignment.assignedAgentId': { $exists: false } 
          })
        : 0,
      
      // Overdue followups
      Followup.countDocuments({
        ...followupQuery,
        status: 'Pending',
        followupDate: { $lt: today }
      }),
      
      // Today's followups
      Followup.countDocuments({
        ...followupQuery,
        status: 'Pending',
        followupDate: { $gte: today, $lt: tomorrow }
      }),
      
      // This week's followups
      Followup.countDocuments({
        ...followupQuery,
        status: 'Pending',
        followupDate: { $gte: today, $lt: weekEnd }
      }),
      
      // Completed followups this month
      Followup.countDocuments({
        ...followupQuery,
        status: 'Completed',
        completedAt: { $gte: monthStart, $lte: monthEnd }
      }),
      
      // New customers this month
      Customer.countDocuments({
        ...customerQuery,
        createdAt: { $gte: monthStart, $lte: monthEnd }
      }),
      
      // Converted customers this month
      Customer.countDocuments({
        ...customerQuery,
        'evaluation.salesStatus': 'Converted',
        updatedAt: { $gte: monthStart, $lte: monthEnd }
      })
    ]);
    
    // Format status counts
    const statusCounts = customersByStatus.reduce((acc, item) => {
      acc[item._id || 'Unknown'] = item.count;
      return acc;
    }, {});
    
    // Format interest counts
    const interestCounts = customersByInterest.reduce((acc, item) => {
      acc[item._id || 'Unknown'] = item.count;
      return acc;
    }, {});
    
    // Calculate conversion rate
    const qualifiedCount = statusCounts['Qualified'] || 0;
    const convertedCount = statusCounts['Converted'] || 0;
    const conversionRate = qualifiedCount > 0 
      ? ((convertedCount / qualifiedCount) * 100).toFixed(1)
      : 0;
    
    return res.status(200).json({
      success: true,
      data: {
        customers: {
          total: totalCustomers,
          byStatus: statusCounts,
          byInterest: interestCounts,
          unassigned: unassignedCustomers,
          newThisMonth: newCustomersThisMonth,
          convertedThisMonth
        },
        followups: {
          overdue: overdueFollowups,
          today: todayFollowups,
          thisWeek: thisWeekFollowups,
          completedThisMonth: completedFollowupsThisMonth
        },
        performance: {
          conversionRate: parseFloat(conversionRate)
        }
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard stats', details: error.message });
  }
}

// Apply rate limiting
export default withRateLimit(handler, {
  maxRequests: 100,
  windowMs: 60000
});
