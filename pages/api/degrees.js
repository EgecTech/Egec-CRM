// pages/api/degrees.js
import mongoose from "mongoose";
import { mongooseConnect } from "@/lib/mongoose";
import Degree from "@/models/Degree";
import College from "@/models/College"; // Import College model for populate
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

const { ObjectId } = mongoose.Types;

export default async function handle(req, res) {
  // Authentication is handled by withProtectionPreset middleware
  try {
    await mongooseConnect();
    const { method } = req;

    switch (method) {
      case "GET": {
        // Get session for cache strategy
        const session = await getServerSession(req, res, authOptions);
        
        if (req.query?.id) {
          if (!ObjectId.isValid(req.query.id)) {
            return res.status(400).json({ error: "Invalid degree id" });
          }

          // Try to get from cache first
          const cacheKey = cacheKeys.degreeSingle(req.query.id);
          const degree = await cache.wrap(cacheKey, async () => {
            return await Degree.findById(req.query.id)
              .select("name studyConditions documentsRequired certificates")
              .populate({
                path: "certificates.colleges.collegeId",
                select: "name sector",
                model: "College",
              })
              .lean();
          }, CACHE_TTL.SINGLE_ITEM);
          
          if (!degree) {
            return res.status(404).json({ error: "Degree not found" });
          }
          
          // Apply secure cache strategy
          applySecureCacheHeaders(res, 'semiPublic', session?.user?.role);
          
          // Generate ETag
          const etag = generateETag(degree);
          res.setHeader('ETag', etag);
          
          // Check if client has cached version
          if (checkETag(req, etag)) {
            return res.status(304).end();
          }
          
          return res.json(degree);
        } else {
          // Apply pagination from data protection middleware (if enforced)
          // Business preset allows fetching all data (no pagination)
          const hasPagination = req.pagination !== undefined;
          const { limit = 10000, skip = 0 } = req.pagination || {};

          // Cache key for the list
          const cacheKey = cacheKeys.degreeList(limit, skip);
          
          const responseData = await cache.wrap(cacheKey, async () => {
            let query = Degree.find()
              .select("name studyConditions documentsRequired certificates")
              .populate({
                path: "certificates.colleges.collegeId",
                select: "name sector",
                model: "College",
              })
              .sort({ createdAt: -1 });

            // Only apply limit/skip if pagination is enforced
            if (hasPagination) {
              query = query.limit(limit).skip(skip);
            }

            // Execute query and count in parallel for better performance
            const [degrees, total] = await Promise.all([
              query.lean(),
              Degree.countDocuments().maxTimeMS(5000),
            ]);

            return {
              data: degrees,
              pagination: {
                page: hasPagination ? Math.floor(skip / limit) + 1 : 1,
                limit: hasPagination ? limit : total,
                total,
                pages: hasPagination ? Math.ceil(total / limit) : 1,
              },
            };
          }, CACHE_TTL.LIST_DATA);

          // Apply secure cache strategy
          applySecureCacheHeaders(res, 'semiPublic', session?.user?.role);
          
          // Generate ETag
          const etag = generateETag(responseData);
          res.setHeader('ETag', etag);
          
          // Check if client has cached version
          if (checkETag(req, etag)) {
            return res.status(304).end();
          }

          return res.json(responseData);
        }
      }

      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
}

