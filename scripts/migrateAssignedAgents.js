// scripts/migrateAssignedAgents.js
// This script migrates existing customer assignments to the new multi-agent system
import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Please define MONGODB_URI in your .env file');
  process.exit(1);
}

async function migrateAssignedAgents() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all customers with assignedAgentId but no assignedAgents array
    const customersToMigrate = await Customer.find({
      'assignment.assignedAgentId': { $exists: true, $ne: null },
      $or: [
        { 'assignment.assignedAgents': { $exists: false } },
        { 'assignment.assignedAgents': { $size: 0 } }
      ],
      isDeleted: false
    });

    console.log(`📊 Found ${customersToMigrate.length} customers to migrate\n`);

    if (customersToMigrate.length === 0) {
      console.log('✅ All customers are already migrated!');
      process.exit(0);
    }

    let migratedCount = 0;
    let errorCount = 0;

    for (const customer of customersToMigrate) {
      try {
        // Initialize arrays if they don't exist
        if (!customer.assignment.assignedAgents) {
          customer.assignment.assignedAgents = [];
        }
        if (!customer.assignment.assignmentHistory) {
          customer.assignment.assignmentHistory = [];
        }

        // Add the primary agent to assignedAgents array
        customer.assignment.assignedAgents.push({
          agentId: customer.assignment.assignedAgentId,
          agentName: customer.assignment.assignedAgentName,
          assignedAt: customer.assignment.assignedAt || new Date(),
          assignedBy: customer.assignment.assignedBy,
          assignedByName: customer.assignment.assignedByName,
          counselorStatus: customer.evaluation?.counselorStatus || '',
          isActive: true
        });

        // Add to assignment history
        customer.assignment.assignmentHistory.push({
          action: 'assigned',
          agentId: customer.assignment.assignedAgentId,
          agentName: customer.assignment.assignedAgentName,
          performedBy: customer.assignment.assignedBy,
          performedByName: customer.assignment.assignedByName,
          performedAt: customer.assignment.assignedAt || new Date(),
          reason: 'Migrated from old system'
        });

        await customer.save();
        migratedCount++;

        if (migratedCount % 100 === 0) {
          console.log(`✅ Migrated ${migratedCount}/${customersToMigrate.length} customers...`);
        }
      } catch (error) {
        console.error(`❌ Error migrating customer ${customer.customerNumber}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📊 Migration Complete!');
    console.log(`✅ Successfully migrated: ${migratedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📈 Total processed: ${customersToMigrate.length}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run migration
migrateAssignedAgents();
