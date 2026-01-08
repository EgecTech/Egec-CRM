// scripts/seed153Universities.js
// Quick script to update study destinations and prepare for new universities

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'egec_crm';

// New study destinations (6 countries)
const STUDY_DESTINATIONS = [
  'Cyprus',
  'Egypt',
  'Germany',
  'Hungary',
  'Jordan',
  'United Arab Emirates'
];

console.log('🎓 UPDATING UNIVERSITIES SYSTEM');
console.log('='.repeat(70));
console.log('');

async function updateSystem() {
  // Build connection URI
  let uri = MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not found');
  }
  
  const databaseName = DATABASE_NAME;
  if (!uri.includes(`/${databaseName}`)) {
    uri = uri.replace(/\/$/, '');
    if (uri.includes('?')) {
      uri = uri.replace(/\?/, `/${databaseName}?`);
    } else {
      uri = `${uri}/${databaseName}`;
    }
  }

  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log(`✅ Connected to: ${databaseName}\n`);
    
    const db = client.db(databaseName);
    
    // Step 1: Update study_destinations
    console.log('Step 1: Updating Study Destinations...');
    const systemSettings = db.collection('systemsettings');
    
    await systemSettings.deleteMany({ settingKey: 'study_destinations' });
    
    await systemSettings.insertOne({
      settingKey: 'study_destinations',
      settingValue: STUDY_DESTINATIONS,
      settingType: 'dropdown_options',
      description: 'Study destinations (الوجهة الدراسية) - 6 Countries',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`✅ Study destinations updated to ${STUDY_DESTINATIONS.length} countries:`);
    STUDY_DESTINATIONS.forEach((c, i) => console.log(`  ${i + 1}. ${c}`));
    
    // Step 2: Check current universities
    console.log('\nStep 2: Checking current universities...');
    const universities = db.collection('universities');
    
    const currentCount = await universities.countDocuments();
    console.log(`📊 Current universities in database: ${currentCount}`);
    
    if (currentCount > 0) {
      // Group by country
      const byCountry = await universities.aggregate([
        { $group: { _id: '$country', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]).toArray();
      
      console.log('\nCurrent distribution:');
      byCountry.forEach(c => {
        console.log(`  ${c._id}: ${c.count} universities`);
      });
    }
    
    // Step 3: Instructions for adding new universities
    console.log('\n' + '='.repeat(70));
    console.log('📋 NEXT STEPS TO ADD 153 UNIVERSITIES');
    console.log('='.repeat(70));
    console.log('');
    console.log('You have 3 options:');
    console.log('');
    console.log('Option 1: MongoDB Compass (EASIEST)');
    console.log('  1. Prepare JSON file with all 153 universities');
    console.log('  2. Open MongoDB Compass');
    console.log('  3. Navigate to egec_crm → universities');
    console.log('  4. Click "ADD DATA" → "Import File"');
    console.log('  5. Select your JSON file');
    console.log('  6. Import!');
    console.log('');
    console.log('Option 2: Via Admin UI (GRADUAL)');
    console.log('  1. Login as SuperAdmin');
    console.log('  2. Go to Settings → Universities');
    console.log('  3. Add universities one by one');
    console.log('  4. Add colleges for each university');
    console.log('');
    console.log('Option 3: Bulk Script (NEED DATA FILE)');
    console.log('  1. Prepare CSV/Excel with all data');
    console.log('  2. Convert to JSON format');
    console.log('  3. Use import script');
    console.log('');
    console.log('='.repeat(70));
    console.log('✅ Study Destinations are ready!');
    console.log('🎯 System is configured for 6 countries');
    console.log('📝 You can now add universities via any method above');
    console.log('='.repeat(70));
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Connection closed\n');
  }
}

updateSystem();
