// lib/mongodb.js

import { MongoClient } from "mongodb";

// CRITICAL FIX: Ensure database name is in URI
function getMongoURI() {
  let uri = process.env.MONGODB_URI;
  
  if (!uri) {
    throw new Error("Please add your Mongo URI to .env");
  }

  // Ensure database name is specified in URI
  const databaseName = process.env.DATABASE_NAME || 'egec_crm';
  
  // Check if URI already has a database name
  const hasDbName = uri.includes('mongodb.net/') && !uri.endsWith('mongodb.net/');
  
  if (!hasDbName) {
    // Remove trailing slash if exists
    uri = uri.replace(/\/$/, '');
    // Append database name
    if (uri.includes('?')) {
      // Has query params, insert before them
      uri = uri.replace(/\?/, `/${databaseName}?`);
    } else {
      // No query params, just append
      uri = `${uri}/${databaseName}`;
    }
  }
  
  return uri;
}

const uri = getMongoURI();
const options = {
  maxPoolSize: 50,        // Increased from 10 for better concurrency
  minPoolSize: 10,        // Increased from 2 to keep connections warm
  maxIdleTimeMS: 30000,   // Close idle connections after 30s
  waitQueueTimeoutMS: 5000, // Fail fast if pool is exhausted
  serverSelectionTimeoutMS: 5000, // Reduced from 10000 for faster failures
  socketTimeoutMS: 30000, // Reduced from 45000 for faster timeouts
  family: 4,
  retryWrites: true,
  retryReads: true,
  readPreference: 'secondaryPreferred', // Use read replicas for better performance
};

let client;
let clientPromise;

if (process.env.NODE_ENV === "development") {
  // In development mode, use a global variable to preserve the client across module reloads
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default async function connectToDatabase() {
  try {
    const client = await clientPromise;
    // CRITICAL FIX: Explicitly specify database name
    const databaseName = process.env.DATABASE_NAME || 'egec_crm';
    const db = client.db(databaseName);
    console.log(`MongoDB connected successfully to database: ${databaseName}`);
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
