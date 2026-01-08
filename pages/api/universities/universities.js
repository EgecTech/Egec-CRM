// pages/api/universities/universities.js

/**
 * @swagger
 * /api/universities/universities:
 *   get:
 *     summary: Get all universities or a specific university
 *     tags: [Universities]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: University ID (optional)
 *       - in: query
 *         name: skipPopulate
 *         schema:
 *           type: boolean
 *         description: Skip populating related data for faster response
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/University'
 *                 - $ref: '#/components/schemas/University'
 *         headers:
 *           X-RateLimit-Limit:
 *             schema:
 *               type: integer
 *             description: Request limit per time window
 *           X-RateLimit-Remaining:
 *             schema:
 *               type: integer
 *             description: Remaining requests
 *       400:
 *         description: Invalid university ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: University not found
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */

import mongoose from "mongoose";
import { mongooseConnect } from "@/lib/mongoose";
import University from "@/models/University";
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
          const universityId = req.query.id;
          if (!ObjectId.isValid(universityId)) {
            return res.status(400).json({ error: "Invalid university id" });
          }

          // Check if we need to skip populate for faster response
          const skipPopulate = req.query.skipPopulate === "true";

          // Try to get from cache first
          const cacheKey = cacheKeys.universitySingle(universityId, skipPopulate);
          const university = await cache.wrap(cacheKey, async () => {
            // Build query with lean() for better performance
            let query = University.findById(universityId)
              .select(
                "name country email website phone location universityType contract images status timesRanking cwurRanking shanghaiRanking qsRanking accreditation accreditationCountries universityConditions colleges"
              )
              .lean();

            // Only populate if not skipped
            if (!skipPopulate) {
              query = query.populate({
                path: "colleges.collegeId",
                select: "name sector",
                model: "College",
                options: { lean: true },
              });
            }

            return await query;
          }, CACHE_TTL.SINGLE_ITEM);

          if (!university)
            return res.status(404).json({ error: "University not found" });

          // Apply secure cache strategy for single university
          applySecureCacheHeaders(res, 'semiPublic', session?.user?.role);
          
          // Generate ETag for caching
          const etag = generateETag(university);
          res.setHeader('ETag', etag);
          
          // Check if client has cached version
          if (checkETag(req, etag)) {
            return res.status(304).end();
          }
          
          return res.json(university);
        }

        // Apply pagination from data protection middleware (if enforced)
        // Business preset allows fetching all data (no pagination)
        const hasPagination = req.pagination !== undefined;
        const { limit = 10000, skip = 0 } = req.pagination || {};

        // Cache key for the list
        const cacheKey = cacheKeys.universityList(limit, skip);
        
        const responseData = await cache.wrap(cacheKey, async () => {
          // Optimized query with selective fields and timeout
          let query = University.find()
            .select(
              "name country universityType accreditation accreditationCountries contract images status colleges"
            )
            .sort({ _id: -1 })
            .maxTimeMS(8000); // Set query timeout to 8 seconds

          // Only apply limit/skip if pagination is enforced
          if (hasPagination) {
            query = query.limit(limit).skip(skip);
          }

          const universities = await query.lean();

          // Get total count
          const total = await University.countDocuments().maxTimeMS(5000);

          return {
            data: universities,
            pagination: {
              page: hasPagination ? Math.floor(skip / limit) + 1 : 1,
              limit: hasPagination ? limit : total,
              total,
              pages: hasPagination ? Math.ceil(total / limit) : 1,
            },
          };
        }, CACHE_TTL.LIST_DATA);

        // Apply secure cache strategy for universities list
        applySecureCacheHeaders(res, 'semiPublic', session?.user?.role);
        
        // Generate ETag for caching
        const etag = generateETag(responseData);
        res.setHeader('ETag', etag);
        
        // Check if client has cached version
        if (checkETag(req, etag)) {
          return res.status(304).end();
        }

        return res.json(responseData);
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
}

// Apply security layers:
// 1. API Security - prevents direct access from curl/postman
