/**
 * Health Check Endpoint
 * 
 * This endpoint checks the health of the application and its dependencies.
 * Use this for monitoring and alerting systems.
 * 
 * @route GET /api/health
 * @returns {Object} Health status with details
 */

import { mongooseConnect } from "@/lib/mongoose";
import mongoose from "mongoose";

export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const startTime = Date.now();
  const healthCheck = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    version: "1.0.0",
    checks: {},
  };

  try {
    // 1. Check Database Connection
    try {
      await mongooseConnect();
      
      // Ping the database to ensure it's responsive
      const dbPing = await mongoose.connection.db.admin().ping();
      
      healthCheck.checks.database = {
        status: "connected",
        responseTime: Date.now() - startTime + "ms",
        state: mongoose.connection.readyState, // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
        name: mongoose.connection.name,
      };
    } catch (dbError) {
      healthCheck.status = "unhealthy";
      healthCheck.checks.database = {
        status: "error",
        error: dbError.message,
      };
    }

    // 2. Check Memory Usage
    const memoryUsage = process.memoryUsage();
    healthCheck.checks.memory = {
      status: "ok",
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + " MB",
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + " MB",
      rss: Math.round(memoryUsage.rss / 1024 / 1024) + " MB",
      external: Math.round(memoryUsage.external / 1024 / 1024) + " MB",
    };

    // 3. Check Environment Variables
    const requiredEnvVars = [
      "MONGODB_URI",
      "NEXTAUTH_SECRET",
      "NEXTAUTH_URL",
    ];
    
    const missingEnvVars = requiredEnvVars.filter(
      (key) => !process.env[key]
    );

    healthCheck.checks.environment = {
      status: missingEnvVars.length === 0 ? "ok" : "warning",
      missing: missingEnvVars.length > 0 ? missingEnvVars : undefined,
    };

    // 4. Overall Response Time
    healthCheck.responseTime = Date.now() - startTime + "ms";

    // Set appropriate status code
    const statusCode = healthCheck.status === "healthy" ? 200 : 503;

    // Set cache headers (don't cache health checks)
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");

    return res.status(statusCode).json(healthCheck);
  } catch (error) {
    console.error("Health check error:", error);

    return res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      error: error.message,
      responseTime: Date.now() - startTime + "ms",
    });
  }
}

