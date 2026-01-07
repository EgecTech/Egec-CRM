// lib/mongodb.js

import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
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

if (!uri) {
  throw new Error("Please add your Mongo URI to .env");
}

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
    const db = client.db();
    console.log("MongoDB connected successfully");
    return db;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
}
