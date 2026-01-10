// pages/api/crm/reports/counselor-status.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import Customer from '@/models/Customer';
import { Profile } from '@/models/Profile';
import { mongooseConnect } from '@/lib/mongoose';
import { checkDirectAccess } from '@/lib/apiProtection';
import { checkPermission } from '@/lib/permissions';

export default async function handler(req, res) {
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
  const { agentId, startDate, endDate, filterType = 'all' } = req.query;
  // filterType: 'primary', 'assigned', or 'all'
  
  try {
    // Build base query
    let matchQuery = { isDeleted: false };
    
    // Date filtering
    if (startDate || endDate) {
      matchQuery.createdAt = {};
      if (startDate) matchQuery.createdAt.$gte = new Date(startDate);
      if (endDate) matchQuery.createdAt.$lte = new Date(endDate);
    }
    
    // If regular agent, only show their own report
    let targetAgentId = agentId;
    if (role === 'agent') {
      targetAgentId = userId;
    }
    
    // ✅ Filter by Primary Agent or Assigned Agents
    if (targetAgentId) {
      if (filterType === 'primary') {
        // Only primary agent
        matchQuery['assignment.assignedAgentId'] = targetAgentId;
      } else if (filterType === 'assigned') {
        // Only in assignedAgents array
        matchQuery['assignment.assignedAgents'] = {
          $elemMatch: {
            agentId: targetAgentId,
            isActive: true
          }
        };
      } else {
        // Both (default - backwards compatibility)
        matchQuery.$or = [
          { 'assignment.assignedAgentId': targetAgentId },
          {
            'assignment.assignedAgents': {
              $elemMatch: {
                agentId: targetAgentId,
                isActive: true
              }
            }
          }
        ];
      }
    }
    
    // Get all customers matching criteria
    const customers = await Customer.find(matchQuery)
      .select('marketingData.degreeType assignment.assignedAgentId assignment.assignedAgentName assignment.assignedAgents')
      .lean();
    
    // Process data per agent based on filterType
    const agentReports = {};
    const allAgentIds = new Set();
    
    customers.forEach(customer => {
      const degreeType = customer.marketingData?.degreeType || 'Unknown';
      const primaryAgentId = customer.assignment?.assignedAgentId;
      const primaryAgentName = customer.assignment?.assignedAgentName;
      const assignedAgents = customer.assignment?.assignedAgents || [];
      
      // ✅ Handle based on filterType
      if (filterType === 'primary') {
        // Only process primary agent
        if (primaryAgentId) {
          const agentIdStr = primaryAgentId.toString();
          
          // Find counselorStatus from assignedAgents array for this agent
          const agentData = assignedAgents.find(a => a.agentId && a.agentId.toString() === agentIdStr);
          const counselorStatus = agentData?.counselorStatus || 'blank';
          
          allAgentIds.add(agentIdStr);
          
          if (!agentReports[agentIdStr]) {
            agentReports[agentIdStr] = {
              agentId: agentIdStr,
              agentName: primaryAgentName || 'Unknown',
              statusBreakdown: {},
              totalCustomers: 0
            };
          }
          
          if (!agentReports[agentIdStr].statusBreakdown[counselorStatus]) {
            agentReports[agentIdStr].statusBreakdown[counselorStatus] = {
              total: 0,
              بكالوريوس: 0,
              ماجستير: 0,
              دكتوراه: 0
            };
          }
          
          agentReports[agentIdStr].statusBreakdown[counselorStatus].total++;
          agentReports[agentIdStr].totalCustomers++;
          
          if (degreeType === 'Bachelor') {
            agentReports[agentIdStr].statusBreakdown[counselorStatus].بكالوريوس++;
          } else if (degreeType === 'Master') {
            agentReports[agentIdStr].statusBreakdown[counselorStatus].ماجستير++;
          } else if (degreeType === 'PhD') {
            agentReports[agentIdStr].statusBreakdown[counselorStatus].دكتوراه++;
          }
        }
      } else {
        // 'assigned' or 'all' - process assignedAgents array
        assignedAgents.forEach(agent => {
          if (!agent.isActive) return;
          
          // Filter by target agent if specified
          if (targetAgentId && agent.agentId.toString() !== targetAgentId) return;
          
          const agentIdStr = agent.agentId.toString();
          allAgentIds.add(agentIdStr);
          
          if (!agentReports[agentIdStr]) {
            agentReports[agentIdStr] = {
              agentId: agentIdStr,
              agentName: agent.agentName,
              statusBreakdown: {},
              totalCustomers: 0
            };
          }
          
          const counselorStatus = agent.counselorStatus || 'blank';
          
          if (!agentReports[agentIdStr].statusBreakdown[counselorStatus]) {
            agentReports[agentIdStr].statusBreakdown[counselorStatus] = {
              total: 0,
              بكالوريوس: 0,
              ماجستير: 0,
              دكتوراه: 0
            };
          }
          
          // Increment counts
          agentReports[agentIdStr].statusBreakdown[counselorStatus].total++;
          agentReports[agentIdStr].totalCustomers++;
          
          // Increment degree type count
          if (degreeType === 'Bachelor') {
            agentReports[agentIdStr].statusBreakdown[counselorStatus].بكالوريوس++;
          } else if (degreeType === 'Master') {
            agentReports[agentIdStr].statusBreakdown[counselorStatus].ماجستير++;
          } else if (degreeType === 'PhD') {
            agentReports[agentIdStr].statusBreakdown[counselorStatus].دكتوراه++;
          }
        });
      }
    });
    
    // Calculate system-wide totals (all agents combined)
    const systemTotals = {
      statusBreakdown: {},
      totalCustomers: 0,
      totalAgents: allAgentIds.size
    };
    
    Object.values(agentReports).forEach(agentReport => {
      Object.entries(agentReport.statusBreakdown).forEach(([status, counts]) => {
        if (!systemTotals.statusBreakdown[status]) {
          systemTotals.statusBreakdown[status] = {
            total: 0,
            بكالوريوس: 0,
            ماجستير: 0,
            دكتوراه: 0
          };
        }
        
        systemTotals.statusBreakdown[status].total += counts.total;
        systemTotals.statusBreakdown[status].بكالوريوس += counts.بكالوريوس;
        systemTotals.statusBreakdown[status].ماجستير += counts.ماجستير;
        systemTotals.statusBreakdown[status].دكتوراه += counts.دكتوراه;
        systemTotals.totalCustomers += counts.total;
      });
    });
    
    // Sort statuses by total count (descending)
    const sortedStatuses = Object.entries(systemTotals.statusBreakdown)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([status]) => status);
    
    // Prepare response
    const response = {
      success: true,
      generatedAt: new Date().toISOString(),
      filters: {
        agentId: targetAgentId || 'all',
        startDate: startDate || null,
        endDate: endDate || null
      },
      systemTotals: {
        totalCustomers: systemTotals.totalCustomers,
        totalAgents: systemTotals.totalAgents,
        statusBreakdown: systemTotals.statusBreakdown,
        sortedStatuses
      },
      agentReports: Object.values(agentReports).map(report => ({
        ...report,
        sortedStatuses
      }))
    };
    
    // If specific agent requested, return only that agent's report
    if (targetAgentId) {
      const agentReport = agentReports[targetAgentId];
      if (!agentReport) {
        return res.status(404).json({
          error: 'No data found for this agent',
          agentId: targetAgentId
        });
      }
      
      return res.status(200).json({
        success: true,
        generatedAt: response.generatedAt,
        filters: response.filters,
        agentReport: {
          ...agentReport,
          sortedStatuses
        }
      });
    }
    
    return res.status(200).json(response);
    
  } catch (error) {
    console.error('Error generating counselor status report:', error);
    return res.status(500).json({
      error: 'Failed to generate report',
      details: error.message
    });
  }
}
