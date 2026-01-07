// models/AuditLog.js
import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  // User info
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Profile',
    index: true
  },
  userEmail: String,
  userName: String,
  userRole: String,
  
  // Action details
  action: { 
    type: String, 
    required: true,
    index: true
  },
  entityType: { 
    type: String, 
    required: true,
    index: true
  },
  entityId: mongoose.Schema.Types.ObjectId,
  entityName: String,
  
  // Change tracking
  oldValues: mongoose.Schema.Types.Mixed,
  newValues: mongoose.Schema.Types.Mixed,
  changes: [{
    field: String,
    oldValue: mongoose.Schema.Types.Mixed,
    newValue: mongoose.Schema.Types.Mixed
  }],
  
  // Request metadata
  ipAddress: String,
  userAgent: String,
  requestMethod: String,
  requestPath: String,
  statusCode: Number,
  errorMessage: String,
  
  // Additional context
  description: String
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

// Compound indexes for common queries
auditLogSchema.index({ entityType: 1, entityId: 1 });
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, entityType: 1 });

// Text search index
auditLogSchema.index({ 
  userEmail: 'text', 
  userName: 'text',
  action: 'text', 
  entityType: 'text',
  entityName: 'text'
});

// TTL index - auto-delete logs older than 2 years (optional)
// auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 });

const AuditLog = mongoose.models?.AuditLog || mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
