// scripts/checkUniversities.js
// Quick check to see what's in the universities collection

const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const DATABASE_NAME = process.env.DATABASE_NAME || 'egec_crm';

async function checkUniversities() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB\n');
    
    const db = client.db(DATABASE_NAME);
    const universitiesCollection = db.collection('universities');
    
    // Get total count
    const totalCount = await universitiesCollection.countDocuments();
    console.log(`Total universities: ${totalCount}\n`);
    
    // Get distinct countries
    const countries = await universitiesCollection.distinct('country');
    console.log('Countries in database:');
    countries.forEach(country => console.log(`  - ${country}`));
    console.log('');
    
    // Get count per country
    console.log('Count per country:');
    for (const country of countries) {
      const count = await universitiesCollection.countDocuments({ country });
      console.log(`  ${country}: ${count} universities`);
    }
    console.log('');
    
    // Sample universities from each country
    console.log('Sample universities:');
    for (const country of countries.slice(0, 3)) {
      console.log(`\n  ${country}:`);
      const samples = await universitiesCollection
        .find({ country })
        .limit(3)
        .toArray();
      samples.forEach(uni => console.log(`    - ${uni.name}`));
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkUniversities();
