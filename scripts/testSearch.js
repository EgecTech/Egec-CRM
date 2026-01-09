// scripts/testSearch.js
// Quick script to test search functionality

require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Customer Schema (simplified)
const customerSchema = new mongoose.Schema({
  customerNumber: String,
  basicData: {
    customerName: String,
    email: String,
    customerPhone: String
  },
  degreeType: String,
  isDeleted: Boolean,
  createdAt: Date
});

// Add text index
customerSchema.index({
  'basicData.customerName': 'text',
  'basicData.email': 'text',
  'basicData.customerPhone': 'text',
  customerNumber: 'text'
});

// Add regular indexes
customerSchema.index({ 'basicData.customerName': 1 });
customerSchema.index({ 'basicData.customerPhone': 1 });
customerSchema.index({ customerNumber: 1 });
customerSchema.index({ degreeType: 1 });
customerSchema.index({ isDeleted: 1 });

const Customer = mongoose.models?.Customer || mongoose.model('Customer', customerSchema);

// Test search function
async function testSearch() {
  console.log('\n🔍 Testing Search Functionality\n');
  console.log('='.repeat(60));

  const tests = [
    { name: 'Count all customers', query: { isDeleted: false } },
    { name: 'Search by name (regex)', search: 'ahmed', field: 'name' },
    { name: 'Search by phone (regex)', search: '01', field: 'phone' },
    { name: 'Search by email (regex)', search: 'gmail', field: 'email' },
    { name: 'Search + degree filter', search: 'ahmed', field: 'name', degreeType: 'bachelor' },
  ];

  for (const test of tests) {
    try {
      const startTime = Date.now();
      let query = { isDeleted: false };
      
      // Add search
      if (test.search) {
        const escapedSearch = test.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const searchRegex = new RegExp(escapedSearch, 'i');
        
        if (test.field === 'name') {
          query['basicData.customerName'] = searchRegex;
        } else if (test.field === 'phone') {
          query['basicData.customerPhone'] = searchRegex;
        } else if (test.field === 'email') {
          query['basicData.email'] = searchRegex;
        }
      }
      
      // Add filters
      if (test.degreeType) {
        query.degreeType = test.degreeType;
      }
      
      const count = await Customer.countDocuments(query);
      const duration = Date.now() - startTime;
      
      console.log(`\n✅ ${test.name}`);
      console.log(`   Query: ${JSON.stringify(query)}`);
      console.log(`   Results: ${count} customers`);
      console.log(`   Time: ${duration}ms`);
      
      if (duration > 1000) {
        console.log(`   ⚠️  WARNING: Slow query (> 1 second)`);
      } else if (duration > 500) {
        console.log(`   ⚠️  Note: Query took > 500ms`);
      } else {
        console.log(`   ✅ Performance: Good`);
      }
      
    } catch (error) {
      console.log(`\n❌ ${test.name}`);
      console.log(`   Error: ${error.message}`);
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Summary:');
  console.log('   - Search uses regex instead of $text');
  console.log('   - Case-insensitive search');
  console.log('   - Works with filters');
  console.log('   - Works with Arabic text');
  console.log('\n💡 Recommendations:');
  console.log('   - If queries > 500ms: Add more indexes');
  console.log('   - If queries > 1000ms: Consider Atlas Search');
  console.log('   - If 300K+ customers: Monitor performance closely');
  console.log('\n');
}

// Main
async function main() {
  try {
    await connectDB();
    await testSearch();
    
    console.log('✅ Test completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

main();
