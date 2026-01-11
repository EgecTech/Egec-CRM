// scripts/createIndexes.js
// Run this script to create all necessary indexes in MongoDB

const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'egec_crm';

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function createIndexes() {
  console.log('🔗 Connecting to MongoDB...\n');
  
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB\n');
    
    const db = client.db(DATABASE_NAME);
    const customersCollection = db.collection('customers');
    
    console.log('📊 Creating indexes for customers collection...\n');
    
    // 1. Agent queries
    console.log('Creating index: assignment.assignedAgentId...');
    await customersCollection.createIndex({ 
      'assignment.assignedAgentId': 1 
    });
    console.log('✅ Done\n');
    
    // 2. Data entry queries
    console.log('Creating index: createdBy...');
    await customersCollection.createIndex({ 
      createdBy: 1 
    });
    console.log('✅ Done\n');
    
    // 3. Date sorting
    console.log('Creating index: createdAt...');
    await customersCollection.createIndex({ 
      createdAt: -1 
    });
    console.log('✅ Done\n');
    
    // 4. Degree type filtering
    console.log('Creating index: degreeType...');
    await customersCollection.createIndex({ 
      degreeType: 1 
    });
    console.log('✅ Done\n');
    
    // 5. Counselor status filtering
    console.log('Creating index: evaluation.counselorStatus...');
    await customersCollection.createIndex({ 
      'evaluation.counselorStatus': 1 
    });
    console.log('✅ Done\n');
    
    // 6. Soft delete
    console.log('Creating index: isDeleted...');
    await customersCollection.createIndex({ 
      isDeleted: 1 
    });
    console.log('✅ Done\n');
    
    // 7. Compound: agent + degree
    console.log('Creating compound index: assignedAgentId + degreeType...');
    await customersCollection.createIndex({ 
      'assignment.assignedAgentId': 1, 
      degreeType: 1 
    });
    console.log('✅ Done\n');
    
    // 8. Compound: active customers sorted
    console.log('Creating compound index: isDeleted + createdAt...');
    await customersCollection.createIndex({ 
      isDeleted: 1, 
      createdAt: -1 
    });
    console.log('✅ Done\n');
    
    // 9. Customer number (unique)
    console.log('Creating unique index: customerNumber...');
    await customersCollection.createIndex(
      { customerNumber: 1 },
      { unique: true, sparse: true }
    );
    console.log('✅ Done\n');
    
    // 10. Text search index (if not exists)
    console.log('Creating text search index...');
    try {
      await customersCollection.createIndex({
        'basicData.customerName': 'text',
        'basicData.email': 'text',
        'basicData.customerPhone': 'text',
        customerNumber: 'text',
      }, {
        name: 'customer_search',
        default_language: 'none' // Support both Arabic and English
      });
      console.log('✅ Done\n');
    } catch (e) {
      if (e.code === 85) {
        console.log('ℹ️  Text index already exists\n');
      } else {
        throw e;
      }
    }
    
    // 11. Duplicate detection (unique compound)
    console.log('Creating duplicate detection index...');
    try {
      await customersCollection.createIndex(
        { 
          'basicData.customerPhone': 1, 
          'basicData.email': 1 
        },
        {
          unique: true,
          sparse: true,
          partialFilterExpression: { isDeleted: false }
        }
      );
      console.log('✅ Done\n');
    } catch (e) {
      if (e.code === 85 || e.code === 86) {
        console.log('ℹ️  Duplicate detection index already exists\n');
      } else {
        throw e;
      }
    }
    
    // List all indexes
    console.log('📋 All indexes in customers collection:\n');
    const indexes = await customersCollection.indexes();
    indexes.forEach((index, i) => {
      console.log(`${i + 1}. ${index.name}`);
      console.log(`   Keys: ${JSON.stringify(index.key)}`);
      if (index.unique) console.log(`   ✓ Unique`);
      if (index.sparse) console.log(`   ✓ Sparse`);
      console.log();
    });
    
    console.log('✅ All indexes created successfully!\n');
    
    // Stats
    const stats = await customersCollection.stats();
    console.log('📊 Collection Stats:');
    console.log(`   Documents: ${stats.count.toLocaleString()}`);
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Indexes: ${stats.nindexes}`);
    console.log(`   Index Size: ${(stats.totalIndexSize / 1024 / 1024).toFixed(2)} MB\n`);
    
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('🔒 Connection closed');
  }
}

// Run
createIndexes();
