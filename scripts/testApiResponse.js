// scripts/testApiResponse.js
// Quick test to see what the API is actually returning

import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: Please define the MONGODB_URI environment variable');
  process.exit(1);
}

async function testApiResponse() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected\n');

    // Simulate what the API does
    const customers = await Customer.find({ isDeleted: false })
      .select('customerNumber degreeType basicData evaluation assignment desiredProgram createdAt updatedAt stats')
      .limit(3)
      .lean();

    console.log(`📊 Testing API response for ${customers.length} customers:\n`);

    for (const customer of customers) {
      console.log('━'.repeat(80));
      console.log(`Customer: ${customer.basicData?.customerName}`);
      console.log(`Number: ${customer.customerNumber}`);
      console.log('\n🔍 Assignment object structure:');
      console.log(JSON.stringify(customer.assignment, null, 2));
      console.log('\n🎯 latestCounselorStatus field:');
      if (customer.assignment?.latestCounselorStatus) {
        console.log('  ✅ EXISTS');
        console.log('  Status:', customer.assignment.latestCounselorStatus.status);
        console.log('  Agent:', customer.assignment.latestCounselorStatus.agentName);
        console.log('  Updated:', customer.assignment.latestCounselorStatus.updatedAt);
      } else {
        console.log('  ❌ MISSING (This is the problem!)');
      }
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

testApiResponse();
