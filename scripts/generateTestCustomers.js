// scripts/generateTestCustomers.js
import 'dotenv/config';
import mongoose from 'mongoose';
import Customer from '../models/Customer.js';
import { mongooseConnect } from '../lib/mongoose.js';

// Configuration
const TOTAL_CUSTOMERS = 1000000; // 1 million
const BATCH_SIZE = 10000; // Insert 10k at a time
const DEGREE_TYPES = ['bachelor', 'master', 'phd'];
const COUNTRIES = ['Egypt', 'Saudi Arabia', 'UAE', 'Jordan', 'Lebanon', 'Kuwait', 'Qatar', 'Bahrain', 'Oman', 'Iraq'];
const STATUSES = ['new', 'contacted', 'qualified', 'negotiation', 'won', 'lost'];
const CITIES = ['Cairo', 'Riyadh', 'Dubai', 'Amman', 'Beirut', 'Kuwait City', 'Doha', 'Manama', 'Muscat', 'Baghdad'];

// Sample data arrays
const firstNames = ['Ahmed', 'Mohamed', 'Ali', 'Omar', 'Hassan', 'Khalid', 'Youssef', 'Ibrahim', 'Mahmoud', 'Abdullah', 'Faisal', 'Saeed', 'Tariq', 'Rashid', 'Majid'];
const lastNames = ['Ali', 'Hassan', 'Ibrahim', 'Ahmed', 'Mohamed', 'Salem', 'Mansour', 'Abdallah', 'Khalil', 'Rashid', 'Al-Sayed', 'Al-Hassan', 'Al-Mahmoud'];
const universities = ['Cairo University', 'King Saud University', 'UAE University', 'Jordan University', 'American University of Beirut', 'Kuwait University', 'Qatar University'];
const colleges = ['Engineering', 'Medicine', 'Business', 'Science', 'Arts', 'Law', 'Computer Science', 'Pharmacy', 'Dentistry'];
const specializations = ['Computer Science', 'Civil Engineering', 'Business Administration', 'Medicine', 'Law', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Accounting'];

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function generateCustomer(index) {
  const degreeType = randomItem(DEGREE_TYPES);
  const year = new Date().getFullYear();
  const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const seq = String(index).padStart(6, '0');
  
  return {
    customerNumber: `CUS-${year}-${seq}`,
    degreeType,
    
    basicData: {
      customerName: `${randomItem(firstNames)} ${randomItem(lastNames)}`,
      customerPhone: `+20${Math.floor(Math.random() * 1000000000)}`,
      anotherContactNumber: Math.random() > 0.5 ? `+20${Math.floor(Math.random() * 1000000000)}` : undefined,
      email: `customer${index}@test.com`,
      nationality: randomItem(COUNTRIES),
      country: randomItem(COUNTRIES),
      cityRegion: randomItem(CITIES),
      gender: Math.random() > 0.5 ? 'Male' : 'Female',
    },
    
    currentQualification: {
      certificateName: degreeType === 'bachelor' ? 'High School' : 'Bachelor Degree',
      graduationYear: 2015 + Math.floor(Math.random() * 10),
      grade: randomItem(['Excellent', 'Very Good', 'Good', 'Pass']),
      overallRating: `${(Math.random() * 4 + 1).toFixed(2)}`,
      studySystem: randomItem(['Semester', 'Annual', 'Trimester']),
      studyDuration: `${2 + Math.floor(Math.random() * 3)} years`,
    },
    
    desiredProgram: {
      desiredUniversity: randomItem(universities),
      desiredCollege: randomItem(colleges),
      desiredSpecialization: randomItem(specializations),
      studyDestination: randomItem(COUNTRIES),
      programLanguage: randomItem(['English', 'Arabic', 'French']),
    },
    
    evaluation: {
      counselorStatus: randomItem(STATUSES),
      salesStatus: randomItem(['lead', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost']),
      interestRate: randomItem(['high', 'medium', 'low']),
      nextFollowupDate: new Date(Date.now() + Math.random() * 90 * 24 * 60 * 60 * 1000),
      lastContactDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    },
    
    marketingData: {
      source: randomItem(['Facebook', 'Instagram', 'Google', 'Referral', 'Direct', 'LinkedIn', 'WhatsApp']),
      company: randomItem(['Company A', 'Company B', 'Company C', 'Partner X', 'Partner Y']),
      inquiryDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    },
    
    createdBy: 'test-script@system.com',
    isDeleted: false,
    createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(),
  };
}

async function generateTestData() {
  console.log('🚀 Starting test data generation...');
  console.log(`📊 Target: ${TOTAL_CUSTOMERS.toLocaleString()} customers`);
  console.log(`📦 Batch size: ${BATCH_SIZE.toLocaleString()}`);
  console.log('');
  
  await mongooseConnect();
  
  // Check existing count
  const existingCount = await Customer.countDocuments();
  console.log(`📈 Existing customers: ${existingCount.toLocaleString()}`);
  
  if (existingCount >= TOTAL_CUSTOMERS) {
    console.log('✅ Already have enough test data!');
    console.log('   Run this script with --force to regenerate');
    await mongoose.connection.close();
    return;
  }
  
  const startIndex = existingCount;
  const remaining = TOTAL_CUSTOMERS - existingCount;
  console.log(`🎯 Generating ${remaining.toLocaleString()} more customers...\n`);
  
  const startTime = Date.now();
  let totalInserted = 0;
  const batches = Math.ceil(remaining / BATCH_SIZE);
  
  for (let batch = 0; batch < batches; batch++) {
    const batchStart = Date.now();
    const customers = [];
    
    // Generate batch
    const batchSize = Math.min(BATCH_SIZE, remaining - totalInserted);
    for (let i = 0; i < batchSize; i++) {
      const index = startIndex + totalInserted + i;
      customers.push(generateCustomer(index));
    }
    
    // Insert batch
    try {
      await Customer.insertMany(customers, { ordered: false });
      totalInserted += customers.length;
      
      const batchTime = Date.now() - batchStart;
      const progress = ((totalInserted / remaining) * 100).toFixed(2);
      const rate = (customers.length / (batchTime / 1000)).toFixed(0);
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
      const remainingDocs = remaining - totalInserted;
      const eta = remainingDocs > 0 ? ((remainingDocs / rate) / 60).toFixed(1) : 0;
      
      console.log(`✅ Batch ${batch + 1}/${batches} | ${progress}% | Inserted: ${totalInserted.toLocaleString()}/${remaining.toLocaleString()} | Rate: ${rate}/sec | Elapsed: ${elapsed}s | ETA: ${eta}min`);
    } catch (error) {
      console.error(`❌ Error in batch ${batch + 1}:`, error.message);
      // Continue with next batch
    }
    
    // Small delay to prevent overwhelming the database
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  const totalTime = ((Date.now() - startTime) / 1000 / 60).toFixed(2);
  const finalCount = await Customer.countDocuments();
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎉 Generation Complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log(`📊 Total customers in database: ${finalCount.toLocaleString()}`);
  console.log(`➕ Newly inserted: ${totalInserted.toLocaleString()}`);
  console.log(`⏱️  Total time: ${totalTime} minutes`);
  console.log(`🚀 Average rate: ${(totalInserted / (totalTime * 60)).toFixed(0)} customers/sec`);
  console.log('');
  
  await mongoose.connection.close();
}

// Run
generateTestData()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
