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

    switch (method) {
      case "GET":
        try {
          const { ids } = req.query;
          let query = {};

          if (ids) {
            const parsedIds = Array.isArray(ids)
              ? ids
              : String(ids)
                  .split(",")
                  .map((id) => id.trim());

            const validIds = parsedIds.filter((id) => ObjectId.isValid(id));

            if (validIds.length === 0) {
              return res.status(400).json({
                error: "Invalid college ids",
              });
            }

            query = { _id: { $in: validIds } };
          }

          // Apply pagination if not querying specific IDs
          const hasPagination = req.pagination !== undefined;
          const { limit = 10000, skip = 0 } = req.pagination || {};

          let collegesQuery = College.find(query)
            .select("name sector description details")
            .sort(ids ? { _id: 1 } : { name: 1 });

          // Only apply limit/skip if pagination is enforced and not querying specific IDs
          if (!ids && hasPagination) {
            collegesQuery = collegesQuery.limit(limit).skip(skip);
          }

          // Execute query and count in parallel for better performance
          let response;
          if (!ids) {
            const [colleges, total] = await Promise.all([
              collegesQuery.lean(),
              College.countDocuments(query).maxTimeMS(5000),
            ]);
            
            response = {
              data: colleges,
              pagination: {
                page: hasPagination ? Math.floor(skip / limit) + 1 : 1,
                limit: hasPagination ? limit : total,
                total,
                pages: hasPagination ? Math.ceil(total / limit) : 1,
              },
            };
          } else {
            // For specific IDs, just return the data
            const colleges = await collegesQuery.lean();
            response = colleges;
          }

          // Private cache for security
          res.setHeader(
            "Cache-Control",
            "private, max-age=300, must-revalidate"
          );
          return res.json(response);
        } catch (error) {
          if (process.env.NODE_ENV === "development") {
            console.error("Error fetching colleges:", error);
          }
          return res.status(500).json({
            error: "Failed to fetch colleges",
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
      console.error("API Error:", error);
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
    withProtectionPreset(handler, "business"),
    rateLimitPresets.authenticated
  ),
  'moderate'
);
