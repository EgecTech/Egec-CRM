// scripts/verifyStudyDestinations.js
// Verify that study destinations and university countries are properly configured

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'egec_crm';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

// Note: Study destinations are now in English directly (no mapping needed)

async function verifyStudyDestinations() {
  console.log('🔍 Verifying Study Destinations Configuration...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DATABASE_NAME);
    const settingsCollection = db.collection('systemsettings');
    const universitiesCollection = db.collection('universities');
    
    // 1. Check study_destinations in settings
    console.log('📊 Checking study_destinations setting...');
    const studyDestSettings = await settingsCollection.findOne({ settingKey: 'study_destinations' });
    
    if (!studyDestSettings) {
      console.log('❌ study_destinations setting not found!');
      console.log('💡 Run: npm run update:study-destinations\n');
    } else {
      console.log(`✅ Found ${studyDestSettings.settingValue.length} study destinations:`);
      studyDestSettings.settingValue.forEach((dest, idx) => {
        console.log(`   ${idx + 1}. ${dest}`);
      });
      console.log('');
    }
    
    // 2. Check actual countries in universities collection
    console.log('🏛️  Checking universities by country...');
    const universitiesByCountry = await universitiesCollection.aggregate([
      {
        $group: {
          _id: '$country',
          count: { $sum: 1 },
          universities: { $push: '$name' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]).toArray();
    
    console.log(`✅ Found universities in ${universitiesByCountry.length} countries:\n`);
    
    let totalUniversities = 0;
    universitiesByCountry.forEach(({ _id: country, count }, idx) => {
      totalUniversities += count;
      
      console.log(`   ${idx + 1}. ${country}`);
      console.log(`      → ${count} universities`);
    });
    
    console.log(`\n📊 Total: ${totalUniversities} universities\n`);
    
    // 3. Check for study destinations without universities
    if (studyDestSettings) {
      console.log('🔍 Checking for study destinations without universities...');
      const universityCountries = universitiesByCountry.map(u => u._id);
      const destinationsWithoutUniversities = studyDestSettings.settingValue.filter(dest => {
        return !universityCountries.includes(dest);
      });
      
      if (destinationsWithoutUniversities.length > 0) {
        console.log(`⚠️  Found ${destinationsWithoutUniversities.length} destinations without universities:`);
        destinationsWithoutUniversities.forEach(dest => {
          console.log(`   - ${dest}`);
        });
        console.log('');
      } else {
        console.log('✅ All study destinations have universities\n');
      }
    }
    
    // 4. Test API filtering
    console.log('🧪 Testing country filtering for API...');
    const testDestinations = ['Egypt', 'Germany', 'Jordan', 'Hungary'];
    
    for (const dest of testDestinations) {
      const count = await universitiesCollection.countDocuments({ country: dest });
      console.log(`   ${dest}: ${count} universities`);
    }
    
    console.log('\n✅ Verification complete!\n');
    
    // Summary
    console.log('📋 SUMMARY:');
    console.log(`   - Study destinations configured: ${studyDestSettings ? studyDestSettings.settingValue.length : 0}`);
    console.log(`   - Countries with universities: ${universitiesByCountry.length}`);
    console.log(`   - Total universities: ${totalUniversities}`);
    
    if (totalUniversities > 0 && studyDestSettings && studyDestSettings.settingValue.length > 0) {
      console.log('\n✅ System is ready for production!\n');
    } else {
      console.log('\n⚠️  Action required: Please run "npm run seed:universities" to add universities\n');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Connection closed');
  }
}

// Run if called directly
if (require.main === module) {
  verifyStudyDestinations();
}
