// models/Team.js
import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  description: String,
  
  managerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Profile',
    index: true
  },
  managerName: String,
  
  isActive: { 
    type: Boolean, 
    default: true,
    index: true
  },
  
  // Stats (updated periodically)
  stats: {
    memberCount: { type: Number, default: 0 },
    activeCustomersCount: { type: Number, default: 0 },
    totalCustomersCount: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 }
  },
  
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }
}, {
  timestamps: true
});

const Team = mongoose.models?.Team || mongoose.model('Team', teamSchema);

export default Team;
