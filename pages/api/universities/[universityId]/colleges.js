// pages/api/universities/[universityId]/colleges.js
import mongoose from "mongoose";
import { mongooseConnect } from "@/lib/mongoose";
import University from "@/models/University";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { withPresetSecurity } from "@/lib/apiSecurity";
import { withRateLimit, rateLimitPresets } from "@/lib/rateLimit";

const { ObjectId } = mongoose.Types;

async function handle(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { universityId } = req.query;

  if (req.method === "GET") {
    try {
      await mongooseConnect();

      if (!universityId || typeof universityId !== "string") {
        return res.status(400).json({ error: "Invalid university ID" });
      }

      if (!ObjectId.isValid(universityId)) {
        return res.status(400).json({ error: "Invalid university ID format" });
      }

      const university = await University.findById(universityId).lean();

      if (!university) {
        return res.status(404).json({ error: "University not found" });
      }

      return res.status(200).json(university.colleges || []);
    } catch (error) {
      console.error("Error fetching colleges:", error);

      return res.status(500).json({
        error: "Failed to fetch colleges",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}

// Apply security layers
export default withPresetSecurity(
  withRateLimit(handle, rateLimitPresets.authenticated),
  "moderate"
);
