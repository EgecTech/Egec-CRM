// scripts/updateStudyDestinations.js
// Run this script to update study destinations in system settings

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'egec_crm';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Updated list of study destinations based on universities (English names)
const studyDestinations = [
  'Egypt',                    // مصر
  'Jordan',                   // الأردن
  'Germany',                  // ألمانيا
  'Hungary',                  // هنغاريا
  'United Arab Emirates',     // الإمارات
  'Cyprus',                   // قبرص
  'USA',                      // أمريكا
  'UK',                       // بريطانيا
  'Canada',                   // كندا
  'France',                   // فرنسا
  'Italy',                    // إيطاليا
  'Spain',                    // إسبانيا
  'Malaysia',                 // ماليزيا
  'Turkey',                   // تركيا
  'China',                    // الصين
  'Russia',                   // روسيا
  'Australia',                // أستراليا
  'New Zealand'               // نيوزيلندا
];

async function updateStudyDestinations() {
  console.log('🔗 Connecting to MongoDB...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DATABASE_NAME);
    const settingsCollection = db.collection('systemsettings');
    
    console.log('📊 Updating study destinations...\n');
    
    // Update or insert study destinations
    const result = await settingsCollection.updateOne(
      { settingKey: 'study_destinations' },
      {
        $set: {
          settingKey: 'study_destinations',
          settingValue: studyDestinations,
          description: 'Available study destinations for customer registration',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    if (result.upsertedCount > 0) {
      console.log('✅ Study destinations created');
    } else if (result.modifiedCount > 0) {
      console.log('✅ Study destinations updated');
    } else {
      console.log('ℹ️  Study destinations unchanged (already up to date)');
    }
    
    console.log('\n📋 Study Destinations List:');
    studyDestinations.forEach((dest, index) => {
      console.log(`   ${index + 1}. ${dest}`);
    });
    
    // Verify
    const saved = await settingsCollection.findOne({ settingKey: 'study_destinations' });
    console.log(`\n✅ Verified: ${saved.settingValue.length} destinations saved\n`);
    
    // Also update countries (English names for university filtering)
    const countries = [
      'Egypt',
      'Jordan', 
      'Germany',
      'Hungary',
      'United Arab Emirates',
      'Cyprus'
    ];
    
    await settingsCollection.updateOne(
      { settingKey: 'university_countries' },
      {
        $set: {
          settingKey: 'university_countries',
          settingValue: countries,
          description: 'Countries with universities in the system (for filtering)',
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    
    console.log('✅ University countries updated\n');
    console.log('📋 Countries with universities:');
    countries.forEach((country, index) => {
      console.log(`   ${index + 1}. ${country}`);
    });
    
    console.log('\n✅ Study destinations updated successfully!\n');
    
  } catch (error) {
    console.error('❌ Error updating study destinations:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Connection closed');
  }
}

// Run
updateStudyDestinations();
