// lib/auditLogger.js
import AuditLog from '@/models/AuditLog';

/**
 * Log an audit entry
 * @param {Object} params - Audit log parameters
 */
export async function logAudit({
  userId,
  userEmail,
  userName,
  userRole,
  action,
  entityType,
  entityId,
  entityName,
  oldValues,
  newValues,
  ipAddress,
  userAgent,
  requestMethod,
  requestPath,
  statusCode,
  errorMessage,
  description
}) {
  try {
    // Calculate changes if both old and new values provided
    let changes = [];
    if (oldValues && newValues) {
      changes = calculateChanges(oldValues, newValues);
    }
    
    await AuditLog.create({
      userId,
      userEmail,
      userName,
      userRole,
      action,
      entityType,
      entityId,
      entityName,
      oldValues,
      newValues,
      changes,
      ipAddress,
      userAgent,
      requestMethod,
      requestPath,
      statusCode,
      errorMessage,
      description
    });
    
    console.log(`✅ Audit logged: ${action} ${entityType} by ${userName || userEmail}`);
  } catch (error) {
    console.error('❌ Failed to log audit:', error);
    // Don't throw - audit logging should not break main flow
  }
}

/**
 * Calculate field-level changes between old and new values
 */
function calculateChanges(oldValues, newValues) {
  const changes = [];
  
  // Convert to plain objects if mongoose documents
  const oldObj = oldValues.toObject ? oldValues.toObject() : oldValues;
  const newObj = newValues.toObject ? newValues.toObject() : newValues;
  
  const allKeys = new Set([...Object.keys(oldObj), ...Object.keys(newObj)]);
  
  for (const key of allKeys) {
    // Skip internal fields
    if (key === '_id' || key === '__v' || key === 'updatedAt' || key === 'createdAt') {
      continue;
    }
    
    const oldVal = oldObj[key];
    const newVal = newObj[key];
    
    // Deep comparison for objects and arrays
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes.push({
        field: key,
        oldValue: oldVal,
        newValue: newVal
      });
    }
  }
  
  return changes;
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs({
  userId,
  entityType,
  entityId,
  action,
  startDate,
  endDate,
  page = 1,
  limit = 50
}) {
  const query = {};
  
  if (userId) query.userId = userId;
  if (entityType) query.entityType = entityType;
  if (entityId) query.entityId = entityId;
  if (action) query.action = action;
  
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  
  const skip = (page - 1) * limit;
  
  const [logs, total] = await Promise.all([
    AuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(query)
  ]);
  
  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

/**
 * Get audit trail for a specific entity
 */
export async function getEntityAuditTrail(entityType, entityId) {
  return await AuditLog.find({ entityType, entityId })
    .sort({ createdAt: -1 })
    .lean();
}
