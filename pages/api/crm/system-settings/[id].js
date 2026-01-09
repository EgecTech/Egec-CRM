// pages/api/crm/system-settings/[id].js
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]';
import SystemSetting from '@/models/SystemSetting';
import { logAudit } from '@/lib/auditLogger';
import { mongooseConnect } from '@/lib/mongoose';
import { withRateLimit } from '@/lib/rateLimit';
import { checkDirectAccess } from '@/lib/apiProtection';
import { cacheDelPattern } from '@/lib/cache';

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
  
  // Only superadmin can modify settings
  if (role !== 'superadmin') {
    return res.status(403).json({ error: 'Forbidden: Only superadmin can modify system settings' });
  }

  // GET - Get specific setting
  if (method === 'GET') {
    try {
      const setting = await SystemSetting.findById(id).lean();
      
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }
      
      return res.status(200).json({
        success: true,
        data: setting
      });
      
    } catch (error) {
      console.error('Error fetching setting:', error);
      return res.status(500).json({ error: 'Failed to fetch setting', details: error.message });
    }
  }

  // PUT - Update setting
  if (method === 'PUT') {
    try {
      const updates = req.body;
      
      const setting = await SystemSetting.findById(id);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }

      // Store old values for audit log
      const oldValues = {
        settingValue: setting.settingValue,
        isActive: setting.isActive
      };

      // Update fields
      if (updates.settingValue !== undefined) {
        setting.settingValue = updates.settingValue;
      }
      if (updates.description !== undefined) {
        setting.description = updates.description;
      }
      if (updates.isActive !== undefined) {
        setting.isActive = updates.isActive;
      }
      if (updates.settingType !== undefined) {
        setting.settingType = updates.settingType;
      }

      setting.updatedBy = userId;
      await setting.save();

      // Clear cache for system settings
      await cacheDelPattern('system_settings:*', 'crm');

      // Log audit
      await logAudit({
        userId,
        userName,
        userEmail,
        userRole: role,
        action: 'UPDATE_SYSTEM_SETTING',
        resource: 'SystemSettings',
        resourceId: setting._id,
        details: {
          settingKey: setting.settingKey,
          oldValues,
          newValues: {
            settingValue: setting.settingValue,
            isActive: setting.isActive
          }
        },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      return res.status(200).json({
        success: true,
        data: setting
      });
      
    } catch (error) {
      console.error('Error updating setting:', error);
      return res.status(500).json({ error: 'Failed to update setting', details: error.message });
    }
  }

  // DELETE - Delete setting
  if (method === 'DELETE') {
    try {
      const setting = await SystemSetting.findById(id);
      if (!setting) {
        return res.status(404).json({ error: 'Setting not found' });
      }

      const settingKey = setting.settingKey;
      await SystemSetting.findByIdAndDelete(id);

      // Clear cache for system settings
      await cacheDelPattern('system_settings:*', 'crm');

      // Log audit
      await logAudit({
        userId,
        userName,
        userEmail,
        userRole: role,
        action: 'DELETE_SYSTEM_SETTING',
        resource: 'SystemSettings',
        resourceId: id,
        details: {
          settingKey,
          settingValue: setting.settingValue,
          description: setting.description
        },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent']
      });

      return res.status(200).json({
        success: true,
        message: 'Setting deleted successfully'
      });
      
    } catch (error) {
      console.error('Error deleting setting:', error);
      return res.status(500).json({ error: 'Failed to delete setting', details: error.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

// Apply rate limiting
export default withRateLimit(handler, {
  maxRequests: 100,
  windowMs: 60000
});
