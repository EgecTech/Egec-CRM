// pages/api/crm/system-settings/index.js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import SystemSetting from '@/models/SystemSetting';
import { checkPermission } from '@/lib/permissions';
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
  
  // GET - Get all settings or specific setting
  if (method === 'GET') {
    try {
      const { key } = req.query;
      
      if (key) {
        // Get specific setting
        const setting = await SystemSetting.findOne({ settingKey: key, isActive: true }).lean();
        
        if (!setting) {
          return res.status(404).json({ error: 'Setting not found' });
        }
        
        return res.status(200).json({
          success: true,
          data: setting
        });
      } else {
        // Get all settings
        const settings = await SystemSetting.find({ isActive: true })
          .sort({ settingKey: 1 })
          .lean();
        
        return res.status(200).json({
          success: true,
          data: settings
        });
      }
      
    } catch (error) {
      console.error('Error fetching settings:', error);
      return res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
    }
  }
  
  // POST - Create new setting (superadmin only)
  if (method === 'POST') {
    try {
      if (!checkPermission(role, 'settings', 'manage')) {
        return res.status(403).json({ error: 'Forbidden: Only superadmin can manage settings' });
      }
      
      const { settingKey, settingValue, settingType, description } = req.body;
      
      if (!settingKey || !settingValue) {
        return res.status(400).json({ error: 'settingKey and settingValue are required' });
      }
      
      // Check if setting already exists
      const existing = await SystemSetting.findOne({ settingKey });
      if (existing) {
        return res.status(409).json({ error: 'Setting with this key already exists' });
      }
      
      const setting = await SystemSetting.create({
        settingKey,
        settingValue,
        settingType: settingType || 'dropdown_options',
        description,
        updatedBy: userId
      });
      
      // Log audit
      await logAudit({
        userId,
        userEmail,
        userName,
        userRole: role,
        action: 'CREATE',
        entityType: 'system_setting',
        entityId: setting._id,
        entityName: settingKey,
        newValues: setting.toObject(),
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        requestMethod: 'POST',
        requestPath: '/api/crm/system-settings'
      });
      
      return res.status(201).json({
        success: true,
        data: setting,
        message: 'Setting created successfully'
      });
      
    } catch (error) {
      console.error('Error creating setting:', error);
      return res.status(500).json({ error: 'Failed to create setting', details: error.message });
    }
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}

// Apply rate limiting
export default withRateLimit(handler, {
  maxRequests: 100,
  windowMs: 60000
});
