// models/Followup.js
import mongoose from 'mongoose';

const followupSchema = new mongoose.Schema({
  customerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Customer',
    required: true,
    index: true
  },
  customerName: String,
  customerPhone: String,
  customerNumber: String,
  
  agentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Profile',
    required: true,
    index: true
  },
  agentName: String,
  
  followupType: {
    type: String,
    enum: ['Call', 'WhatsApp', 'Meeting', 'Email', 'SMS', 'Note'],
    required: true
  },
  
  followupDate: { 
    type: Date, 
    required: true,
    index: true
  },
  
  nextFollowupDate: { 
    type: Date,
    index: true
  },
  
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending',
    index: true
  },
  
  notes: { 
    type: String, 
    required: true 
  },
  
  outcome: String,
  durationMinutes: Number,
  
  completedAt: Date,
  completedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }
}, {
  timestamps: true
});

// Compound indexes for common queries
followupSchema.index({ agentId: 1, status: 1, followupDate: 1 });
followupSchema.index({ customerId: 1, createdAt: -1 });
followupSchema.index({ status: 1, followupDate: 1 });

// Virtual for overdue status
followupSchema.virtual('isOverdue').get(function() {
  if (this.status !== 'Pending') return false;
  return this.followupDate < new Date();
});

// Virtual for days until followup
followupSchema.virtual('daysUntilFollowup').get(function() {
  if (this.status !== 'Pending') return null;
  const now = new Date();
  const followupDate = new Date(this.followupDate);
  const diffTime = followupDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtuals are included in JSON
followupSchema.set('toJSON', { virtuals: true });
followupSchema.set('toObject', { virtuals: true });

const Followup = mongoose.models?.Followup || mongoose.model('Followup', followupSchema);

export default Followup;
