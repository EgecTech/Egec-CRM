// scripts/testQueryPerformance.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import { mongooseConnect } from '../lib/mongoose.js';

async function measureQuery(name, description, queryFn) {
  const start = Date.now();
  try {
    const result = await queryFn();
    const duration = Date.now() - start;
    
    const status = duration < 100 ? '✅ PASS' : duration < 500 ? '⚠️  SLOW' : '❌ FAIL';
    const count = Array.isArray(result) ? result.length : (typeof result === 'number' ? result : 1);
    
    console.log(`${name}`);
    console.log(`  📝 ${description}`);
    console.log(`  ⏱️  Time: ${duration}ms`);
    console.log(`  📊 Results: ${count.toLocaleString()}`);
    console.log(`  ${status}`);
    console.log('');
    
    return { name, duration, count, passed: duration < 100 };
  } catch (error) {
    console.log(`${name}`);
    console.log(`  ❌ ERROR: ${error.message}`);
    console.log('');
    return { name, duration: -1, count: 0, passed: false, error: error.message };
  }
}

async function testPerformance() {
  await mongooseConnect();
  
  console.log('\n🚀 Starting Performance Tests\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const results = [];
  
  // Test 1: Count all customers
  results.push(await measureQuery(
    '1️⃣  Count All Customers',
    'Total count with isDeleted filter',
    () => Customer.countDocuments({ isDeleted: false })
  ));
  
  // Test 2: Paginated list (first page)
  results.push(await measureQuery(
    '2️⃣  Get First Page (20 items)',
    'Most common query - first page with sort',
    () => Customer.find({ isDeleted: false })
      .limit(20)
      .sort('-createdAt')
      .select('customerNumber basicData.customerName basicData.customerPhone degreeType evaluation.counselorStatus')
      .lean()
  ));
  
  // Test 3: Paginated list (middle page)
  results.push(await measureQuery(
    '3️⃣  Get Middle Page (Page 25,000)',
    'Testing deep pagination performance',
    () => Customer.find({ isDeleted: false })
      .skip(499980)
      .limit(20)
      .sort('-createdAt')
      .select('customerNumber basicData.customerName basicData.customerPhone')
      .lean()
  ));
  
  // Test 4: Search by name (regex)
  results.push(await measureQuery(
    '4️⃣  Search by Name (Regex)',
    'Search customers by name pattern',
    () => Customer.find({
      'basicData.customerName': /Ahmed/i,
      isDeleted: false
    })
    .limit(50)
    .lean()
  ));
  
  // Test 5: Search by phone
  const sampleCustomer = await Customer.findOne({ isDeleted: false }).lean();
  if (sampleCustomer) {
    results.push(await measureQuery(
      '5️⃣  Search by Phone (Indexed)',
      'Exact match on indexed phone field',
      () => Customer.findOne({
        'basicData.customerPhone': sampleCustomer.basicData.customerPhone,
        isDeleted: false
      }).lean()
    ));
  }
  
  // Test 6: Filter by degree type
  results.push(await measureQuery(
    '6️⃣  Filter by Degree Type',
    'Filter bachelor students',
    () => Customer.find({
      degreeType: 'bachelor',
      isDeleted: false
    })
    .limit(20)
    .sort('-createdAt')
    .lean()
  ));
  
  // Test 7: Complex filter (multiple conditions)
  results.push(await measureQuery(
    '7️⃣  Complex Multi-Filter Query',
    'Degree + Status + Date range filter',
    () => Customer.find({
      degreeType: 'bachelor',
      'evaluation.counselorStatus': 'qualified',
      'evaluation.nextFollowupDate': { $gte: new Date() },
      isDeleted: false
    })
    .limit(20)
    .sort('-createdAt')
    .select('customerNumber basicData.customerName evaluation')
    .lean()
  ));
  
  // Test 8: Aggregation (statistics)
  results.push(await measureQuery(
    '8️⃣  Aggregation (Group by Degree)',
    'Count customers by degree type',
    async () => {
      const stats = await Customer.aggregate([
        { $match: { isDeleted: false } },
        { $group: { _id: '$degreeType', count: { $sum: 1 } } }
      ]);
      return stats.length;
    }
  ));
  
  // Test 9: Get single customer by ID
  if (sampleCustomer) {
    results.push(await measureQuery(
      '9️⃣  Get Single Customer by ID',
      'Fetch one customer by MongoDB _id',
      () => Customer.findById(sampleCustomer._id).lean()
    ));
  }
  
  // Test 10: Update single customer
  if (sampleCustomer) {
    results.push(await measureQuery(
      '🔟 Update Single Customer',
      'Update one field in customer document',
      () => Customer.findByIdAndUpdate(
        sampleCustomer._id,
        { $set: { 'evaluation.lastContactDate': new Date() } }
      )
    ));
  }
  
  // Test 11: Count by status
  results.push(await measureQuery(
    '1️⃣1️⃣  Count by Counselor Status',
    'Count customers with specific status',
    () => Customer.countDocuments({
      'evaluation.counselorStatus': 'qualified',
      isDeleted: false
    })
  ));
  
  // Test 12: Date range query
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  results.push(await measureQuery(
    '1️⃣2️⃣  Recent Customers (Last 30 Days)',
    'Find customers created in last 30 days',
    () => Customer.find({
      createdAt: { $gte: thirtyDaysAgo },
      isDeleted: false
    })
    .limit(100)
    .sort('-createdAt')
    .lean()
  ));
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('📊 Performance Summary:\n');
  
  const validResults = results.filter(r => r.duration >= 0);
  const passed = validResults.filter(r => r.passed).length;
  const slow = validResults.filter(r => !r.passed && r.duration < 500).length;
  const failed = validResults.filter(r => !r.passed && r.duration >= 500).length;
  const errors = results.filter(r => r.error).length;
  
  console.log(`✅ PASS (< 100ms): ${passed}/${validResults.length}`);
  console.log(`⚠️  SLOW (100-500ms): ${slow}/${validResults.length}`);
  console.log(`❌ FAIL (> 500ms): ${failed}/${validResults.length}`);
  if (errors > 0) {
    console.log(`💥 ERRORS: ${errors}`);
  }
  
  const avgTime = validResults.reduce((sum, r) => sum + r.duration, 0) / validResults.length;
  console.log(`\n📈 Average query time: ${avgTime.toFixed(2)}ms`);
  
  // Performance grade
  if (failed === 0 && slow <= 2 && errors === 0) {
    console.log('\n🎉 Performance Grade: EXCELLENT ✅');
    console.log('   Your system is ready for production!');
  } else if (failed === 0 && errors === 0) {
    console.log('\n👍 Performance Grade: GOOD ⚠️');
    console.log('   System is acceptable but has room for improvement.');
  } else {
    console.log('\n⚠️  Performance Grade: NEEDS OPTIMIZATION ❌');
    console.log('   Some queries are too slow. Consider:');
    console.log('   - Verifying all indexes exist');
    console.log('   - Using .lean() for read queries');
    console.log('   - Selecting only needed fields');
    console.log('   - Adding compound indexes for complex queries');
  }
  
  // Show slowest queries
  const slowest = validResults
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 3);
  
  if (slowest.length > 0) {
    console.log('\n🐌 Slowest Queries:');
    slowest.forEach((result, index) => {
      console.log(`   ${index + 1}. ${result.name}: ${result.duration}ms`);
    });
  }
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  await mongoose.connection.close();
}

testPerformance()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
