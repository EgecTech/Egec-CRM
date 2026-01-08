// scripts/updateSources.js
// Update the sources setting with new values

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

const newSourcesValue = [
  'ab-W EGY',
  'ab-C EGY',
  'CRM',
  'C EGY',
  'INS',
  'W EGY',
  'website',
  'SNAP',
  'C UAE',
  'Twitter',
  'W UAE',
  'Google UAE',
  'F-EGEC',
  'G-Instgram',
  'social Media Egec',
  'W site',
  'G-Master',
  'IG-PHD',
  'G-PHD',
  'CHAT GPT',
  'IG-Master',
  'Google',
  'G-MasterENG',
  'Google-Master',
  'G-MA-Calls',
  'G-google',
  'Google-PHD',
  'G-PHD-Calls',
  'G-BA',
  'Google-Jeddah',
  'X-Jeddah',
  'X-Master',
  'Twitter-Master',
  'LinkedIn-MA',
  'G-BA-Calls',
  'ma calls bacloria',
  'G-Calls',
  'ma calls phd',
  'Ig'
];

async function updateSources() {
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
    
    console.log('🔄 Updating sources setting...');
    
    const result = await SystemSetting.findOneAndUpdate(
      { settingKey: 'sources' },
      {
        settingValue: newSourcesValue,
        settingType: 'dropdown_options',
        description: 'Lead sources (المصدر)',
        isActive: true
      },
      { upsert: true, new: true }
    );
    
    console.log('✅ Sources setting updated successfully!');
    console.log(`📊 Total sources: ${newSourcesValue.length}`);
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
  } catch (error) {
    console.error('❌ Error updating sources:', error);
    process.exit(1);
  }
}

updateSources();
