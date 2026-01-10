// scripts/migrateLatestCounselorStatus.js
// Migration script to populate latestCounselorStatus for existing customers
// This finds the most recent counselorStatus update from any agent and sets it as the main status

import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ Error: Please define the MONGODB_URI environment variable');
  process.exit(1);
}

async function migrateLatestCounselorStatus() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Starting migration: Populate latestCounselorStatus for existing customers...\n');

    // Find all customers with assigned agents
    const customers = await Customer.find({
      isDeleted: false,
      'assignment.assignedAgents.0': { $exists: true }
    });

    console.log(`📋 Found ${customers.length} customers with assigned agents\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const customer of customers) {
      try {
        // Find the agent with the most recent status update
        let latestAgent = null;
        let latestDate = null;

        for (const agent of customer.assignment.assignedAgents) {
          if (agent.isActive && agent.counselorStatus) {
            // Prefer agents with tracking dates
            if (agent.counselorStatusLastUpdatedAt) {
              const updateDate = new Date(agent.counselorStatusLastUpdatedAt);
              if (!latestDate || updateDate > latestDate) {
                latestDate = updateDate;
                latestAgent = agent;
              }
            } else if (!latestAgent) {
              // Fallback: Use any agent with a status (even without tracking)
              latestAgent = agent;
              latestDate = customer.assignment.assignedAt || new Date(); // Use assignment date as fallback
            }
          }
        }

        // If no agent has a status update yet, skip this customer
        if (!latestAgent) {
          skippedCount++;
          continue;
        }

        // Update the main status
        customer.assignment.latestCounselorStatus = {
          status: latestAgent.counselorStatus,
          agentId: latestAgent.agentId,
          agentName: latestAgent.agentName,
          updatedAt: latestAgent.counselorStatusLastUpdatedAt || latestDate || new Date()
        };

        customer.markModified('assignment.latestCounselorStatus');
        await customer.save();

        updatedCount++;
        
        if (updatedCount % 100 === 0) {
          console.log(`✅ Progress: ${updatedCount} customers updated...`);
        }

      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating customer ${customer._id}:`, error.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 Migration Summary:');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${updatedCount} customers`);
    console.log(`⏭️  Skipped (no status updates): ${skippedCount} customers`);
    console.log(`❌ Errors: ${errorCount} customers`);
    console.log('='.repeat(60));
    console.log('\n✨ Migration completed successfully!\n');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run migration
migrateLatestCounselorStatus();
