// scripts/migrateDegreeTypes.js
// Migration script to update existing customers with degree type support
// Usage: node scripts/migrateDegreeTypes.js

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Load environment variables
try {
  const envFiles = ['.env.local', '.env'];
  let envLoaded = false;
  
  for (const envFile of envFiles) {
    const envPath = path.join(__dirname, '..', envFile);
    
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      envContent.split('\n').forEach(line => {
        line = line.trim();
        if (!line || line.startsWith('#')) return;
        
        const equalIndex = line.indexOf('=');
        if (equalIndex === -1) return;
        
        const key = line.substring(0, equalIndex).trim();
        const value = line.substring(equalIndex + 1).trim();
        
        if (key && value && !process.env[key]) {
          process.env[key] = value;
        }
      });
      console.log(`✅ Loaded ${envFile}`);
      envLoaded = true;
      break;
    }
  }
  
  if (!envLoaded) {
    console.error('❌ No .env or .env.local file found!');
    process.exit(1);
  }
  
  if (!process.env.MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in env file!');
    process.exit(1);
  }
} catch (err) {
  console.error('Error loading env file:', err);
  process.exit(1);
}

// Define Customer schema (simplified for migration)
const customerSchema = new mongoose.Schema({
  customerNumber: String,
  degreeType: String,
  basicData: Object,
  currentQualification: Object,
  desiredProgram: Object,
  marketingData: Object,
  evaluation: Object,
  assignment: Object,
  lossData: Object,
  stats: Object,
  isDeleted: Boolean,
  createdBy: mongoose.Schema.Types.ObjectId,
  updatedBy: mongoose.Schema.Types.ObjectId,
  deletedBy: mongoose.Schema.Types.ObjectId
}, { 
  timestamps: true,
  strict: false // Allow flexible schema during migration
});

async function migrateDegreeTypes() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const Customer = mongoose.model('Customer', customerSchema);
    
    // Count total customers
    const totalCustomers = await Customer.countDocuments();
    console.log(`📊 Total customers in database: ${totalCustomers}`);
    
    // Find customers without degreeType
    const customersWithoutDegreeType = await Customer.countDocuments({
      $or: [
        { degreeType: { $exists: false } },
        { degreeType: null },
        { degreeType: '' }
      ]
    });
    
    console.log(`🔄 Customers needing migration: ${customersWithoutDegreeType}`);
    
    if (customersWithoutDegreeType === 0) {
      console.log('✅ All customers already have degreeType set!');
      await mongoose.connection.close();
      return;
    }
    
    // Confirm migration
    console.log('\n⚠️  This will update all customers without degreeType to "bachelor"');
    console.log('⚠️  Press Ctrl+C to cancel, or wait 5 seconds to continue...\n');
    
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('🔄 Starting migration...\n');
    
    // Update customers in batches
    const batchSize = 100;
    let processedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    const cursor = Customer.find({
      $or: [
        { degreeType: { $exists: false } },
        { degreeType: null },
        { degreeType: '' }
      ]
    }).cursor();
    
    for await (const customer of cursor) {
      try {
        // Set degreeType to bachelor (default)
        customer.degreeType = 'bachelor';
        
        // Migrate currentQualification structure if needed
        if (customer.currentQualification) {
          const currentQual = customer.currentQualification;
          
          // If certificateTrack exists, move it to bachelor nested object
          if (currentQual.certificateTrack && !currentQual.bachelor) {
            customer.currentQualification.bachelor = {
              certificateTrack: currentQual.certificateTrack,
              availableColleges: currentQual.availableColleges || []
            };
          }
          
          // Initialize other nested objects as empty if they don't exist
          if (!currentQual.masterSeeker) {
            customer.currentQualification.masterSeeker = {};
          }
          if (!currentQual.phdSeeker) {
            customer.currentQualification.phdSeeker = {};
          }
          if (!currentQual.diplomaSeeker) {
            customer.currentQualification.diplomaSeeker = {};
          }
        }
        
        // Migrate desiredProgram structure if needed
        if (customer.desiredProgram) {
          const desiredProg = customer.desiredProgram;
          
          // Initialize nested objects as empty if they don't exist
          if (!desiredProg.bachelor) {
            customer.desiredProgram.bachelor = {};
          }
          if (!desiredProg.master) {
            customer.desiredProgram.master = {};
          }
          if (!desiredProg.phd) {
            customer.desiredProgram.phd = {};
          }
          if (!desiredProg.diploma) {
            customer.desiredProgram.diploma = {};
          }
        }
        
        await customer.save();
        updatedCount++;
        processedCount++;
        
        if (processedCount % batchSize === 0) {
          console.log(`✅ Processed ${processedCount} customers...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error updating customer ${customer.customerNumber}:`, error.message);
        processedCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`   Total processed: ${processedCount}`);
    console.log(`   Successfully updated: ${updatedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
    // Verify migration
    const remainingWithoutDegreeType = await Customer.countDocuments({
      $or: [
        { degreeType: { $exists: false } },
        { degreeType: null },
        { degreeType: '' }
      ]
    });
    
    const bachelorCount = await Customer.countDocuments({ degreeType: 'bachelor' });
    const masterCount = await Customer.countDocuments({ degreeType: 'master' });
    const phdCount = await Customer.countDocuments({ degreeType: 'phd' });
    const diplomaCount = await Customer.countDocuments({ degreeType: 'diploma' });
    
    console.log('\n📊 Degree Type Distribution:');
    console.log(`   Bachelor: ${bachelorCount}`);
    console.log(`   Master: ${masterCount}`);
    console.log(`   PhD: ${phdCount}`);
    console.log(`   Diploma: ${diplomaCount}`);
    console.log(`   Without degree type: ${remainingWithoutDegreeType}`);
    
    if (remainingWithoutDegreeType === 0) {
      console.log('\n✅ Migration completed successfully!');
    } else {
      console.log(`\n⚠️  Warning: ${remainingWithoutDegreeType} customers still without degreeType`);
    }
    
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateDegreeTypes();
