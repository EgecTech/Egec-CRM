// scripts/migrateToEgecCRM.js
// Migrate ALL data from 'test' database to 'egec_crm' database

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const SOURCE_DB = 'test';
const TARGET_DB = 'egec_crm';

console.log('🔄 DATABASE MIGRATION: test → egec_crm');
console.log('='.repeat(70));
console.log('');

async function migrateDatabase() {
  // Build connection URI
  let uri = MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI not found in environment variables');
  }

  const client = new MongoClient(uri);
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    await client.connect();
    console.log('✅ Connected successfully\n');
    
    const sourceDb = client.db(SOURCE_DB);
    const targetDb = client.db(TARGET_DB);
    
    // Step 1: List all collections in source database
    console.log('='.repeat(70));
    console.log(`STEP 1: Analyzing ${SOURCE_DB} database`);
    console.log('='.repeat(70));
    
    const collections = await sourceDb.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(`\nFound ${collectionNames.length} collections:\n`);
    
    // Get document counts
    const collectionStats = [];
    for (const collName of collectionNames) {
      const count = await sourceDb.collection(collName).countDocuments();
      collectionStats.push({ name: collName, count });
      console.log(`  📁 ${collName.padEnd(30)} ${count.toString().padStart(8)} documents`);
    }
    
    // Step 2: Check target database
    console.log('\n' + '='.repeat(70));
    console.log(`STEP 2: Checking ${TARGET_DB} database`);
    console.log('='.repeat(70));
    
    const targetCollections = await targetDb.listCollections().toArray();
    const targetCollectionNames = targetCollections.map(c => c.name);
    
    if (targetCollectionNames.length === 0) {
      console.log('\n✅ Target database is empty - safe to migrate');
    } else {
      console.log(`\n⚠️  Target database has ${targetCollectionNames.length} collections:\n`);
      
      for (const collName of targetCollectionNames) {
        const count = await targetDb.collection(collName).countDocuments();
        console.log(`  📁 ${collName.padEnd(30)} ${count.toString().padStart(8)} documents`);
      }
      
      console.log('\n⚠️  WARNING: Target database is NOT empty!');
      console.log('Migration will SKIP existing collections to avoid data loss.');
    }
    
    // Step 3: Confirm migration
    console.log('\n' + '='.repeat(70));
    console.log('STEP 3: Migration Plan');
    console.log('='.repeat(70));
    console.log('\nThe following collections will be migrated:\n');
    
    const toMigrate = collectionStats.filter(c => 
      !targetCollectionNames.includes(c.name) || c.name === 'systemsettings'
    );
    
    toMigrate.forEach(c => {
      const action = c.name === 'systemsettings' ? 
        'MERGE (update systemsettings with English)' : 
        'COPY';
      console.log(`  ✓ ${c.name.padEnd(30)} ${c.count.toString().padStart(8)} docs  [${action}]`);
    });
    
    const toSkip = collectionStats.filter(c => 
      targetCollectionNames.includes(c.name) && c.name !== 'systemsettings'
    );
    
    if (toSkip.length > 0) {
      console.log('\nThe following collections will be SKIPPED (already exist):\n');
      toSkip.forEach(c => {
        console.log(`  ⊗ ${c.name.padEnd(30)} ${c.count.toString().padStart(8)} docs  [SKIP]`);
      });
    }
    
    // Step 4: Execute migration
    console.log('\n' + '='.repeat(70));
    console.log('STEP 4: Executing Migration');
    console.log('='.repeat(70));
    console.log('');
    
    let migratedCollections = 0;
    let migratedDocuments = 0;
    let skippedCollections = 0;
    
    for (const collStat of collectionStats) {
      const collName = collStat.name;
      
      // Special handling for systemsettings
      if (collName === 'systemsettings') {
        console.log(`\n📝 Processing systemsettings (special handling)...`);
        
        const sourceSystemSettings = await sourceDb.collection('systemsettings').find().toArray();
        const targetSystemSettings = await targetDb.collection('systemsettings').find().toArray();
        
        // Get English study_destinations from target
        const englishStudyDest = targetSystemSettings.find(s => 
          s.settingKey === 'study_destinations' && 
          !s.settingValue.some(val => /[\u0600-\u06FF]/.test(val))
        );
        
        if (englishStudyDest) {
          console.log('  ✓ Found English study_destinations in target');
          
          // Copy all settings from source EXCEPT study_destinations
          const settingsToCopy = sourceSystemSettings.filter(s => 
            s.settingKey !== 'study_destinations'
          );
          
          if (settingsToCopy.length > 0) {
            // Delete existing non-study_destinations from target
            await targetDb.collection('systemsettings').deleteMany({
              settingKey: { $ne: 'study_destinations' }
            });
            
            // Insert from source
            await targetDb.collection('systemsettings').insertMany(settingsToCopy);
            console.log(`  ✓ Copied ${settingsToCopy.length} systemsettings (kept English study_destinations)`);
          }
          
          // Delete Arabic study_destinations from target if any
          const arabicDocs = await targetDb.collection('systemsettings')
            .find({ settingKey: 'study_destinations' })
            .toArray();
          
          for (const doc of arabicDocs) {
            const hasArabic = doc.settingValue.some(val => /[\u0600-\u06FF]/.test(val));
            if (hasArabic) {
              await targetDb.collection('systemsettings').deleteOne({ _id: doc._id });
            }
          }
          
          console.log('  ✓ systemsettings merged successfully');
        } else {
          // No English study_destinations in target, just copy everything
          await targetDb.collection('systemsettings').deleteMany({});
          await targetDb.collection('systemsettings').insertMany(sourceSystemSettings);
          console.log('  ✓ Copied all systemsettings from source');
        }
        
        migratedCollections++;
        migratedDocuments += sourceSystemSettings.length;
        continue;
      }
      
      // Skip if already exists in target
      if (targetCollectionNames.includes(collName)) {
        console.log(`\n⊗ Skipping ${collName} (already exists in target)`);
        skippedCollections++;
        continue;
      }
      
      // Copy collection
      console.log(`\n📦 Migrating ${collName}...`);
      
      if (collStat.count === 0) {
        console.log('  ⚠️  Empty collection - creating structure only');
        // Just create the collection
        await targetDb.createCollection(collName);
      } else {
        // Copy all documents
        const docs = await sourceDb.collection(collName).find().toArray();
        
        if (docs.length > 0) {
          await targetDb.collection(collName).insertMany(docs);
          console.log(`  ✓ Copied ${docs.length} documents`);
          migratedDocuments += docs.length;
        }
      }
      
      migratedCollections++;
    }
    
    // Step 5: Verify migration
    console.log('\n' + '='.repeat(70));
    console.log('STEP 5: Verification');
    console.log('='.repeat(70));
    console.log('');
    
    const finalCollections = await targetDb.listCollections().toArray();
    console.log(`Target database now has ${finalCollections.length} collections:\n`);
    
    for (const coll of finalCollections) {
      const count = await targetDb.collection(coll.name).countDocuments();
      console.log(`  📁 ${coll.name.padEnd(30)} ${count.toString().padStart(8)} documents`);
    }
    
    // Verify study_destinations is English
    const finalStudyDest = await targetDb.collection('systemsettings')
      .findOne({ settingKey: 'study_destinations' });
    
    if (finalStudyDest) {
      const hasArabic = finalStudyDest.settingValue.some(val => /[\u0600-\u06FF]/.test(val));
      console.log(`\n  Study Destinations: ${hasArabic ? '❌ ARABIC' : '✅ ENGLISH'}`);
      console.log(`  First 3 values: ${JSON.stringify(finalStudyDest.settingValue.slice(0, 3))}`);
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(70));
    console.log(`\n  Source database:        ${SOURCE_DB}`);
    console.log(`  Target database:        ${TARGET_DB}`);
    console.log(`  Collections migrated:   ${migratedCollections}`);
    console.log(`  Collections skipped:    ${skippedCollections}`);
    console.log(`  Total documents:        ${migratedDocuments}`);
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ MIGRATION COMPLETE');
    console.log('='.repeat(70));
    
    console.log('\n📋 NEXT STEPS:');
    console.log('  1. VERIFY: Run npm run fix:db');
    console.log('  2. RESTART: Stop and start dev server (npm run dev)');
    console.log('  3. TEST: Login and check customers, users, systemsettings');
    console.log('  4. BACKUP: Once confirmed, backup test database');
    console.log('  5. CLEANUP: Optionally delete test database later');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Migration Error:', error);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Connection closed\n');
  }
}

migrateDatabase();
