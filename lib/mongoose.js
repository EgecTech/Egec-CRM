// lib/mongoose.js
import mongoose from "mongoose";

// Configure mongoose for better performance and reliability
mongoose.set("strictQuery", false);

// Connection options optimized for production
const options = {
  bufferCommands: false, // Disable buffering to get immediate errors
  maxPoolSize: 50, // Increased from 10 for better concurrency
  minPoolSize: 10, // Increased from 2 to keep connections warm
  maxIdleTimeMS: 30000, // Close idle connections after 30s
  waitQueueTimeoutMS: 5000, // Fail fast if pool is exhausted
  serverSelectionTimeoutMS: 5000, // Reduced from 10000 for faster failures
  socketTimeoutMS: 30000, // Reduced from 45000 for faster timeouts
  family: 4, // Use IPv4, skip trying IPv6
  retryWrites: true,
  retryReads: true,
  readPreference: 'secondaryPreferred', // Use read replicas for better performance
};

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { 
    conn: null, 
    promise: null,
    reconnectAttempts: 0,
    maxReconnectAttempts: 5,
    isConnected: false,
  };
}

// Setup connection event handlers
function setupConnectionHandlers() {
  if (cached.handlersSetup) {
    return; // Already setup
  }

  mongoose.connection.on("connected", () => {
    console.log("✅ MongoDB connected successfully");
    cached.isConnected = true;
    cached.reconnectAttempts = 0;
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  MongoDB disconnected");
    cached.isConnected = false;
    cached.conn = null;
    cached.promise = null;
  });

  mongoose.connection.on("error", (err) => {
    console.error("❌ MongoDB connection error:", err.message);
    cached.isConnected = false;
    cached.conn = null;
    cached.promise = null;

    // Attempt reconnection if under max attempts
    if (cached.reconnectAttempts < cached.maxReconnectAttempts) {
      cached.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, cached.reconnectAttempts), 30000);
      console.log(
        `🔄 Reconnection attempt ${cached.reconnectAttempts}/${cached.maxReconnectAttempts} in ${delay}ms`
      );
      setTimeout(() => {
        mongooseConnect().catch((error) => {
          console.error("Reconnection failed:", error.message);
        });
      }, delay);
    } else {
      console.error("❌ Max reconnection attempts reached. Manual intervention required.");
    }
  });

  mongoose.connection.on("reconnected", () => {
    console.log("✅ MongoDB reconnected successfully");
    cached.isConnected = true;
    cached.reconnectAttempts = 0;
  });

  cached.handlersSetup = true;
}

export async function mongooseConnect() {
  // Setup event handlers (only once)
  setupConnectionHandlers();

  // If already connected and connection is healthy, return it
  if (cached.conn && cached.isConnected) {
    try {
      // Ping to verify connection is still alive
      await mongoose.connection.db.admin().ping();
      return cached.conn;
    } catch (error) {
      console.warn("Connection ping failed, reconnecting...");
      cached.conn = null;
      cached.promise = null;
      cached.isConnected = false;
    }
  }

  // If connection is in progress, wait for it
  if (!cached.promise) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("Please define the MONGODB_URI environment variable");
    }

    cached.promise = mongoose
      .connect(uri, options)
      .then((mongoose) => {
        cached.isConnected = true;
        cached.reconnectAttempts = 0;
        return mongoose;
      })
      .catch((error) => {
        console.error("MongoDB connection error:", error.message);
        cached.promise = null; // Reset promise on error
        cached.isConnected = false;
        throw error;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.isConnected = false;
    throw e;
  }

  return cached.conn;
}
