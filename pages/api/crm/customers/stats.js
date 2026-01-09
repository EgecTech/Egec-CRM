// pages/api/crm/customers/stats.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import Customer from '@/models/Customer';
import { buildCustomerQuery } from '@/lib/permissions';
import { mongooseConnect } from '@/lib/mongoose';
import { withRateLimit } from '@/lib/rateLimit';
import { cacheGet, cacheSet } from '@/lib/cache';
import { checkDirectAccess } from '@/lib/apiProtection';

async function handler(req, res) {
  // Block direct browser access
  if (checkDirectAccess(req, res)) return;
  
  await mongooseConnect();
  
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { method } = req;
  const { role, id: userId } = session.user;
  
  // GET - Get degree type statistics
  if (method === 'GET') {
    try {
      // Try to get from cache first (cache for 5 minutes)
      const cacheKey = `degree_stats:${role}:${userId}`;
      const cached = await cacheGet(cacheKey, 'crm');
      if (cached) {
        return res.status(200).json({
          success: true,
          stats: cached,
          cached: true
        });
      }

      // Build base query based on role
      const baseQuery = buildCustomerQuery(role, userId);
      
      // Get counts for each degree type
      const [all, bachelor, master, phd] = await Promise.all([
        Customer.countDocuments(baseQuery),
        Customer.countDocuments({ ...baseQuery, degreeType: 'bachelor' }),
        Customer.countDocuments({ ...baseQuery, degreeType: 'master' }),
        Customer.countDocuments({ ...baseQuery, degreeType: 'phd' })
      ]);
      
      const stats = {
        all,
        bachelor,
        master,
        phd
      };

      // Cache the results for 5 minutes (300 seconds)
      await cacheSet(cacheKey, stats, 300, 'crm');
      
      return res.status(200).json({
        success: true,
        stats,
        cached: false
      });
      
    } catch (error) {
      console.error('Error fetching degree stats:', error);
      return res.status(500).json({ 
        error: 'Failed to fetch degree statistics', 
        details: error.message 
      });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Apply rate limiting
export default withRateLimit(handler, {
  maxRequests: 200,
  windowMs: 60000
});
