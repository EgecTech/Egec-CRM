// scripts/fixDatabaseStructure.js
// Fix database structure - ensure correct database is used

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI_RAW = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'egec_crm';

console.log('🔧 DATABASE STRUCTURE FIX');
console.log('='.repeat(70));
console.log('');

// Function to ensure URI has database name
function fixMongoURI(uri, dbName) {
  if (!uri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }

  // Check if URI already has a database name
  const hasDbName = uri.includes('mongodb.net/') && !uri.endsWith('mongodb.net/');
  
  if (!hasDbName) {
    // Remove trailing slash if exists
    uri = uri.replace(/\/$/, '');
    // Append database name
    if (uri.includes('?')) {
      // Has query params, insert before them
      uri = uri.replace(/\?/, `/${dbName}?`);
    } else {
      // No query params, just append
      uri = `${uri}/${dbName}`;
    }
  }
  
  return uri;
}

async function fixDatabaseStructure() {
  const uri = fixMongoURI(MONGODB_URI_RAW, DATABASE_NAME);
  const client = new MongoClient(uri);
  
  try {
    console.log(`🔌 Connecting to MongoDB...`);
    console.log(`📦 Target Database: ${DATABASE_NAME}`);
    console.log('');
    
    await client.connect();
    console.log('✅ Connected successfully');
    console.log('');
    
    // Get both databases
    const targetDb = client.db(DATABASE_NAME);
    const testDb = client.db('test');
    
    // Step 1: Check study_destinations in target database
    console.log('='.repeat(70));
    console.log(`STEP 1: Checking ${DATABASE_NAME} database`);
    console.log('='.repeat(70));
    
    const targetCollection = targetDb.collection('systemsettings');
    const targetDocs = await targetCollection.find({ settingKey: 'study_destinations' }).toArray();
    
    console.log(`\nFound ${targetDocs.length} study_destinations document(s)`);
    
    if (targetDocs.length === 0) {
      console.log('❌ NO study_destinations found! Need to seed.');
    } else {
      targetDocs.forEach((doc, i) => {
        const hasArabic = doc.settingValue.some(val => /[\u0600-\u06FF]/.test(val));
        console.log(`\n  Document ${i + 1}:`);
        console.log(`    _id: ${doc._id}`);
        console.log(`    Language: ${hasArabic ? 'ARABIC ❌' : 'ENGLISH ✅'}`);
        console.log(`    Values count: ${doc.settingValue.length}`);
        console.log(`    First 3: ${JSON.stringify(doc.settingValue.slice(0, 3))}`);
      });
    }
    
    // Step 2: Check test database
    console.log('\n' + '='.repeat(70));
    console.log('STEP 2: Checking TEST database (old/wrong database)');
    console.log('='.repeat(70));
    
    const testCollection = testDb.collection('systemsettings');
    const testDocs = await testCollection.find({ settingKey: 'study_destinations' }).toArray();
    
    console.log(`\nFound ${testDocs.length} study_destinations document(s) in TEST`);
    
    if (testDocs.length > 0) {
      console.log('\n⚠️  WARNING: Found documents in TEST database!');
      testDocs.forEach((doc, i) => {
        const hasArabic = doc.settingValue.some(val => /[\u0600-\u06FF]/.test(val));
        console.log(`\n  Document ${i + 1}:`);
        console.log(`    _id: ${doc._id}`);
        console.log(`    Language: ${hasArabic ? 'ARABIC ❌' : 'ENGLISH ✅'}`);
        console.log(`    First 3: ${JSON.stringify(doc.settingValue.slice(0, 3))}`);
      });
      
      console.log('\n⚠️  These documents are in the WRONG database!');
    }
    
    // Step 3: Check if target database has English data
    console.log('\n' + '='.repeat(70));
    console.log('STEP 3: Verification & Fix');
    console.log('='.repeat(70));
    
    const targetHasEnglish = targetDocs.some(doc => 
      !doc.settingValue.some(val => /[\u0600-\u06FF]/.test(val))
    );
    
    if (targetDocs.length === 0 || !targetHasEnglish) {
      console.log('\n❌ Target database needs English data!');
      console.log('\n📋 Actions needed:');
      console.log('  1. Run: npm run seed:destinations');
      console.log('  2. Run: npm run seed:universities');
      console.log('  3. Restart dev server');
    } else {
      console.log('\n✅ Target database has correct English data!');
    }
    
    // Step 4: Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SUMMARY');
    console.log('='.repeat(70));
    console.log(`\n  Target DB (${DATABASE_NAME}):`);
    console.log(`    study_destinations: ${targetDocs.length} document(s) ${targetHasEnglish ? '✅ ENGLISH' : '❌ ARABIC/MISSING'}`);
    console.log(`\n  Test DB (test):`);
    console.log(`    study_destinations: ${testDocs.length} document(s) ${testDocs.length > 0 ? '⚠️  Should be empty' : '✅ Empty'}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ DATABASE STRUCTURE CHECK COMPLETE');
    console.log('='.repeat(70));
    
    if (targetDocs.length > 0 && targetHasEnglish) {
      console.log('\n🎉 Database is correctly configured!');
      console.log('\n📋 FINAL STEPS:');
      console.log('  1. STOP dev server (Ctrl+C)');
      console.log('  2. START dev server: npm run dev');
      console.log('  3. Wait for "✓ Ready"');
      console.log('  4. Check console logs for: "Using database: egec_crm"');
      console.log('  5. Test in browser');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed\n');
  }
}

fixDatabaseStructure();
