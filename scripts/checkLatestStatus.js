// scripts/checkLatestStatus.js
// Script to check if latestCounselorStatus is being populated correctly

import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: Please define the MONGODB_URI environment variable');
  process.exit(1);
}

async function checkLatestStatus() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all customers with assigned agents
    const customers = await Customer.find({
      isDeleted: false,
      'assignment.assignedAgents.0': { $exists: true }
    }).limit(10);

    console.log(`📋 Checking ${customers.length} customers:\n`);

    for (const customer of customers) {
      console.log('━'.repeat(80));
      console.log(`👤 Customer: ${customer.basicData?.customerName}`);
      console.log(`📞 Phone: ${customer.basicData?.customerPhone}`);
      console.log(`🔢 Number: ${customer.customerNumber}`);
      console.log('\n📊 Assigned Agents:');
      
      if (customer.assignment?.assignedAgents) {
        for (const agent of customer.assignment.assignedAgents) {
          console.log(`  - ${agent.agentName} (${agent.isActive ? '✅ Active' : '❌ Inactive'})`);
          console.log(`    Status: "${agent.counselorStatus || '(empty)'}"`);
          console.log(`    Last Updated: ${agent.counselorStatusLastUpdatedAt || '(never)'}`);
          console.log(`    Updated By: ${agent.counselorStatusLastUpdatedByName || '(none)'}`);
        }
      }

      console.log('\n🎯 Latest Counselor Status (Main Status):');
      if (customer.assignment?.latestCounselorStatus?.status) {
        console.log(`  Status: "${customer.assignment.latestCounselorStatus.status}"`);
        console.log(`  Agent: ${customer.assignment.latestCounselorStatus.agentName}`);
        console.log(`  Updated: ${customer.assignment.latestCounselorStatus.updatedAt}`);
      } else {
        console.log('  ❌ NOT SET (This is the issue!)');
      }
      
      console.log('');
    }

    console.log('━'.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 MongoDB connection closed');
  }
}

// Run check
checkLatestStatus();
