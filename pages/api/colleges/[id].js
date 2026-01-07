// pages/api/colleges/[id].js

import mongoose from "mongoose";
import { mongooseConnect } from "@/lib/mongoose";
import College from "@/models/College";
import { withProtectionPreset } from "@/lib/dataProtection";
import { withPresetSecurity } from "@/lib/apiSecurity";
import { withRateLimit, rateLimitPresets } from "@/lib/rateLimit";

const { ObjectId } = mongoose.Types;

async function handler(req, res) {
  // Authentication is handled by withProtectionPreset middleware
  try {
    await mongooseConnect();

    const { method } = req;
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "College ID is required" });
    }

    switch (method) {
      case "GET":
        try {
          if (!ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid college id" });
          }

          const college = await College.findById(id)
            .select("name sector description details createdAt updatedAt")
            .lean();

          if (!college) {
            return res.status(404).json({ error: "College not found" });
          }

          // Single college - private cache for security
          res.setHeader(
            "Cache-Control",
            "private, max-age=300, must-revalidate"
          );
          return res.json(college);
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error fetching college:", error);
          }
          return res.status(500).json({
            error: "Failed to fetch college",
            details:
              process.env.NODE_ENV === "development"
                ? error.message
                : undefined,
          });
        }

      default:
        res.setHeader("Allow", ["GET"]);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("API Error:", {
        message: error.message,
        stack: error.stack,
        query: req.query,
      });
    }
    return res.status(500).json({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Apply security layers
export default withPresetSecurity(
  withRateLimit(
    withProtectionPreset(handler, "light"),
    rateLimitPresets.authenticated
  ),
  "moderate"
);
