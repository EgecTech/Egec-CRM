// scripts/seedAllUniversitiesNew.js
// Seed complete universities data (153 universities with colleges)

const { MongoClient, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'egec_crm';

console.log('🎓 SEEDING COMPLETE UNIVERSITIES DATA');
console.log('='.repeat(70));
console.log('');

async function seedUniversities() {
  // Build connection URI
  let uri = MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }
  
  // Ensure database name in URI
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
    console.log(`✅ Connected to database: ${databaseName}\n`);
    
    const db = client.db(databaseName);
    const universitiesCollection = db.collection('universities');
    
    // Step 1: Delete all existing universities
    console.log('Step 1: Clearing existing universities...');
    const deleteResult = await universitiesCollection.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} old universities\n`);
    
    // Step 2: Read universities data from external file
    const universities = require('./universitiesData.json');
    
    console.log(`Step 2: Inserting ${universities.length} universities...`);
    console.log('');
    
    let inserted = 0;
    let countryCounts = {};
    
    for (const uni of universities) {
      // Count by country
      countryCounts[uni.country] = (countryCounts[uni.country] || 0) + 1;
      
      // Prepare colleges
      const colleges = uni.colleges.map((c, idx) => ({
        collegeId: new ObjectId(),
        collegeName: c.collegeName || c,
        degreecollegeunversityinfo: []
      }));
      
      // Insert university
      await universitiesCollection.insertOne({
        name: uni.name,
        country: uni.country,
        universityType: 'Public',
        accreditation: 'Accredited',
        status: 'Active',
        colleges: colleges,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      inserted++;
      
      // Progress indicator
      if (inserted % 10 === 0) {
        process.stdout.write(`  Inserted: ${inserted}/${universities.length}\r`);
      }
    }
    
    console.log(`\n✅ Successfully inserted ${inserted} universities\n`);
    
    // Step 3: Display summary
    console.log('='.repeat(70));
    console.log('📊 SUMMARY BY COUNTRY');
    console.log('='.repeat(70));
    console.log('');
    
    const sortedCountries = Object.entries(countryCounts).sort((a, b) => b[1] - a[1]);
    
    sortedCountries.forEach(([country, count]) => {
      console.log(`  ${country.padEnd(30)} ${count.toString().padStart(4)} universities`);
    });
    
    console.log('');
    console.log('='.repeat(70));
    console.log(`✅ TOTAL: ${inserted} universities inserted`);
    console.log('='.repeat(70));
    
    // Step 4: Update study_destinations
    console.log('\nStep 3: Updating study_destinations...');
    
    const systemSettingsCollection = db.collection('systemsettings');
    
    const countries = Object.keys(countryCounts).sort();
    
    await systemSettingsCollection.deleteMany({ settingKey: 'study_destinations' });
    
    await systemSettingsCollection.insertOne({
      settingKey: 'study_destinations',
      settingValue: countries,
      settingType: 'dropdown_options',
      description: 'Study destinations (الوجهة الدراسية) - English',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    console.log(`✅ Updated study_destinations with ${countries.length} countries:`);
    countries.forEach(c => console.log(`  - ${c}`));
    
    console.log('\n' + '='.repeat(70));
    console.log('🎉 SEEDING COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n📋 NEXT STEPS:');
    console.log('  1. Restart dev server: npm run dev');
    console.log('  2. Test dropdowns in customer creation form');
    console.log('  3. Verify cascading: Country → Universities → Colleges');
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

seedUniversities();
