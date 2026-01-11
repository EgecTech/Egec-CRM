// scripts/updateStudyTimes.js
// Update the study_times setting with new Arabic values

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables manually
try {
  const envFiles = ['.env.local', '.env'];
  let envLoaded = false;
  
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        
        const equalIndex = line.indexOf('=');
        if (equalIndex === -1) return;
        
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      });
      console.log(`✅ Loaded ${envFile}`);
      envLoaded = true;
      break;
    }
  }
  
  if (!envLoaded) {
    console.error('❌ No .env or .env.local file found!');
    process.exit(1);
  }
} catch (err) {
  console.error('Error loading env file:', err);
  process.exit(1);
}

const newStudyTimesValue = [
  'الان',
  'اسرع وقت ممكن',
  'الترم الحالي',
  'الترم القادم',
  'العام القادم'
];

async function updateStudyTimes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const SystemSetting = mongoose.model('SystemSetting', new mongoose.Schema({
      settingKey: { type: String, unique: true, required: true },
      settingValue: mongoose.Schema.Types.Mixed,
      settingType: String,
      description: String,
      isActive: Boolean
    }, { timestamps: true }));
    
    console.log('🔄 Updating study_times setting...');
    
    const result = await SystemSetting.findOneAndUpdate(
      { settingKey: 'study_times' },
      {
        settingValue: newStudyTimesValue,
        settingType: 'dropdown_options',
        description: 'Study time preferences (وقت الدراسة)',
        isActive: true
      },
      { upsert: true, new: true }
    );
    
    console.log('✅ Study times setting updated successfully!');
    console.log(`📊 Total study times: ${newStudyTimesValue.length}`);
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error updating study times:', error);
    process.exit(1);
  }
}

updateStudyTimes();
