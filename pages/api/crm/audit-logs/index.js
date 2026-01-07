// pages/api/crm/audit-logs/index.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import { getAuditLogs } from '@/lib/auditLogger';
import { checkPermission } from '@/lib/permissions';
import { mongooseConnect } from '@/lib/mongoose';
import { withRateLimit } from '@/lib/rateLimit';

async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  await mongooseConnect();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { role } = session.user;
  
  try {
    // Only superadmin can view audit logs
    if (!checkPermission(role, 'audit', 'view_all')) {
      return res.status(403).json({ error: 'Forbidden: Only superadmin can view audit logs' });
    }
    
    const { 
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate,
      search,
      page = 1,
      limit = 50
    } = req.query;
    
    const result = await getAuditLogs({
      userId,
      entityType,
      entityId,
      action,
      startDate,
      endDate,
      page: parseInt(page),
      limit: parseInt(limit)
    });
    
    // Apply text search if provided
    if (search && result.logs) {
      result.logs = result.logs.filter(log => {
        const searchLower = search.toLowerCase();
        return (
          log.userEmail?.toLowerCase().includes(searchLower) ||
          log.userName?.toLowerCase().includes(searchLower) ||
          log.action?.toLowerCase().includes(searchLower) ||
          log.entityType?.toLowerCase().includes(searchLower) ||
          log.entityName?.toLowerCase().includes(searchLower)
        );
      });
    }
    
    return res.status(200).json({
      success: true,
      data: result.logs,
      pagination: result.pagination
    });
    
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ error: 'Failed to fetch audit logs', details: error.message });
  }
}

// Apply rate limiting
export default withRateLimit(handler, {
  maxRequests: 50,
  windowMs: 60000
});
