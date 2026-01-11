// scripts/updateTo153Universities.js
// Complete update to 153 universities with colleges

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'egec_crm';

// Complete universities data (153 universities)
const UNIVERSITIES_DATA = require('./universities153.json');

console.log('🎓 UPDATING TO 153 UNIVERSITIES');
console.log('='.repeat(70));
console.log('');

async function updateUniversities() {
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
    const universitiesCollection = db.collection('universities');
    
    // Step 1: Delete all existing universities
    console.log('Step 1: Deleting old universities...');
    const deleteResult = await universitiesCollection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} old universities\n`);
    
    // Step 2: Insert new universities
    console.log(`Step 2: Inserting ${UNIVERSITIES_DATA.length} new universities...`);
    console.log('');
    
    let inserted = 0;
    const countryCounts = {};
    
    for (const uni of UNIVERSITIES_DATA) {
      // Count by country
      countryCounts[uni.country] = (countryCounts[uni.country] || 0) + 1;
      
      // Prepare colleges with ObjectId
      const colleges = uni.colleges.map(college => ({
        collegeId: new ObjectId(),
        collegeName: college.collegeName || college,
        degreecollegeunversityinfo: []
      }));
      
      // Insert university
      await universitiesCollection.insertOne({
        name: uni.name,
        country: uni.country,
        universityType: uni.universityType || 'Public',
        accreditation: uni.accreditation || 'Accredited',
        status: uni.status || 'Active',
        colleges: colleges,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      inserted++;
      
      // Progress indicator every 10 universities
      if (inserted % 10 === 0) {
        process.stdout.write(`  Progress: ${inserted}/${UNIVERSITIES_DATA.length}\r`);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${inserted} universities\n`);
    
    // Step 3: Update study_destinations
    console.log('Step 3: Updating study_destinations...');
    
    const systemSettings = db.collection('systemsettings');
    const countries = Object.keys(countryCounts).sort();
    
    await systemSettings.deleteMany({ settingKey: 'study_destinations' });
    
    await systemSettings.insertOne({
      settingKey: 'study_destinations',
      settingValue: countries,
      settingType: 'dropdown_options',
      description: 'Study destinations (الوجهة الدراسية) - Updated',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`✅ Updated study_destinations with ${countries.length} countries\n`);
    
    // Step 4: Display summary
    console.log('='.repeat(70));
    console.log('📊 SUMMARY BY COUNTRY');
    console.log('='.repeat(70));
    console.log('');
    
    const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
    
    let totalCount = 0;
    sortedCountries.forEach(([country, count]) => {
      console.log(`  ${country.padEnd(30)} ${count.toString().padStart(3)} universities`);
      totalCount += count;
    });
    
    console.log('');
    console.log('='.repeat(70));
    console.log(`✅ TOTAL: ${totalCount} universities`);
    console.log('='.repeat(70));
    console.log('');
    console.log('🎉 UPDATE COMPLETE!');
    console.log('');
    console.log('📋 NEXT STEPS:');
    console.log('  1. Restart dev server: npm run dev');
    console.log('  2. Test customer creation form');
    console.log('  3. Verify dropdowns work correctly');
    console.log('  4. Test cascading: Country → Universities → Colleges');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Connection closed\n');
  }
}

updateUniversities();
