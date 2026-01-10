// scripts/checkSpecificCustomer.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';

const MONGODB_URI = process.env.MONGODB_URI;

async function checkCustomer() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    const customer = await Customer.findById('696179ade8233aeeb5f414fc').lean();
    
    if (!customer) {
      console.log('❌ Customer not found');
      process.exit(1);
    }
    
    console.log('✅ Customer:', customer.basicData?.customerName);
    console.log('📞 Phone:', customer.basicData?.customerPhone);
    console.log('🔢 Number:', customer.customerNumber);
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
      console.log('  ✅ EXISTS');
      console.log('  Status:', customer.assignment.latestCounselorStatus.status);
      console.log('  Agent:', customer.assignment.latestCounselorStatus.agentName);
      console.log('  Updated:', customer.assignment.latestCounselorStatus.updatedAt);
    } else {
      console.log('  ❌ NOT SET');
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkCustomer();
