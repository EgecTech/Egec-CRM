// models/SystemSetting.js
import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  settingKey: { 
    type: String, 
    required: true,
    unique: true,
    index: true
  },
  settingValue: mongoose.Schema.Types.Mixed,
  settingType: {
    type: String,
    enum: ['dropdown_options', 'system_config', 'feature_flag', 'text'],
    default: 'dropdown_options'
  },
  description: String,
  isActive: { 
    type: Boolean, 
    default: true 
  },
  
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' }
}, {
  timestamps: true
});

const SystemSetting = mongoose.models?.SystemSetting || mongoose.model('SystemSetting', systemSettingSchema);

export default SystemSetting;
