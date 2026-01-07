// pages/api/specializations

/**
 * @swagger
 * /api/specializations:
 *   get:
 *     summary: Get all specializations or a specific specialization
 *     tags: [Specializations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: id
 *         schema:
 *           type: string
 *         description: Specialization ID (optional)
 *     responses:
 *       200:
 *         description: Success - Returns specialization(s) with populated university data
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: array
 *                   items:
 *                     $ref: '#/components/schemas/Specialization'
 *                 - $ref: '#/components/schemas/Specialization'
 *       400:
 *         description: Invalid specialization ID
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: Specialization not found
 *       429:
 *         $ref: '#/components/responses/RateLimitError'
 */

import mongoose from "mongoose";
import Specialization from "@/models/Specialization";
import University from "@/models/University"; // Import University model for populate
import { mongooseConnect } from "@/lib/mongoose";
import { withProtectionPreset } from "@/lib/dataProtection";
import { withPresetSecurity } from "@/lib/apiSecurity";
import { withRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import {
  applySecureCacheHeaders,
  generateETag,
  checkETag,
} from "@/lib/secureCacheStrategy";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import cache from "@/lib/cache";
import { CACHE_TTL, cacheKeys } from "@/lib/cacheConfig";

const { ObjectId } = mongoose.Types;

const wrapId = (value) => {
  if (!value) return null;

  if (typeof value === "object") {
    // If it's a populated document with _id, return the full object with stringified _id
    if (value._id) {
      return {
        ...value,
        _id: value._id.toString ? value._id.toString() : String(value._id),
      };
    }
    // If it has toString and it's not [object Object], treat as ObjectId
    if (typeof value.toString === "function") {
      const str = value.toString();
      if (str && str !== "[object Object]") {
        return { _id: str };
      }
    }
    return value;
  }

  // If it's a string or primitive, wrap it in an object with _id
  return { _id: String(value) };
};

const formatSpecialization = (doc) => {
  if (!doc) return doc;
  const formatted = {
    ...doc,
    _id: doc._id?.toString?.() ?? doc._id,
  };

  if (Array.isArray(doc.places)) {
    formatted.places = doc.places.map((place) => ({
      ...place,
      universityId: wrapId(place.universityId),
      collegeId: wrapId(place.collegeId),
      degreeFounded: Array.isArray(place.degreeFounded)
        ? place.degreeFounded.map((degree) => ({
            ...degree,
            degreeId: wrapId(degree.degreeId),
          }))
        : [],
    }));
  }

  return formatted;
};

async function handler(req, res) {
  // Authentication is handled by withProtectionPreset middleware
  try {
    await mongooseConnect();
    const { method } = req;

    switch (method) {
      case "GET": {
        try {
          // Get session for cache strategy
          const session = await getServerSession(req, res, authOptions);

          if (req.query?.id) {
            const specializationId = req.query.id;

            if (!ObjectId.isValid(specializationId)) {
              return res.status(400).json({
                error: "Invalid specialization id",
                id: specializationId,
              });
            }

            // Try to get from Redis/Memory cache first
            const cacheKey = cacheKeys.specializationSingle(specializationId);
            const formattedSpec = await cache.wrap(
              cacheKey,
              async () => {
                const specialization = await Specialization.findById(
                  specializationId
                )
                  .select(
                    "name specializationType specializationDepartment sectorType places status"
                  )
                  .populate({
                    path: "places.universityId",
                    select: "name country images", // Only fetch essential fields including images
                    model: "University",
                    options: { lean: true },
                  })
                  .lean();

                if (!specialization) return null;
                return formatSpecialization(specialization);
              },
              CACHE_TTL.SINGLE_ITEM
            );

            if (!formattedSpec) {
              return res.status(404).json({
                error: "Specialization not found",
                id: specializationId,
              });
            }

            // Apply secure cache strategy
            applySecureCacheHeaders(res, "semiPublic", session?.user?.role);

            // Generate ETag
            const etag = generateETag(formattedSpec);
            res.setHeader("ETag", etag);

            // Check if client has cached version
            if (checkETag(req, etag)) {
              return res.status(304).end();
            }

            return res.json(formattedSpec);
          }

          // Apply pagination from data protection middleware (if enforced)
          // Business preset allows fetching all data (no pagination)
          const hasPagination = req.pagination !== undefined;
          const { limit = 10000, skip = 0 } = req.pagination || {};

          // Cache key for the list (include pagination and sort)
          const cacheKey = cacheKeys.specializationList(limit, skip);

          const responseData = await cache.wrap(
            cacheKey,
            async () => {
              let query = Specialization.find()
                .select(
                  "name specializationType sectorType specializationDepartment places status"
                )
                .sort({ createdAt: -1 });

              // Only apply limit/skip if pagination is enforced
              if (hasPagination) {
                query = query.limit(limit).skip(skip);
              }

              const specializations = await query.lean();

              // Get total count
              const total = await Specialization.countDocuments().maxTimeMS(
                5000
              );

              return {
                data: Array.isArray(specializations)
                  ? specializations.map(formatSpecialization)
                  : [],
                pagination: {
                  page: hasPagination ? Math.floor(skip / limit) + 1 : 1,
                  limit: hasPagination ? limit : total,
                  total,
                  pages: hasPagination ? Math.ceil(total / limit) : 1,
                },
              };
            },
            CACHE_TTL.LIST_DATA
          );

          // Apply secure cache strategy
          applySecureCacheHeaders(res, "semiPublic", session?.user?.role);

          // Generate ETag
          const etag = generateETag(responseData);
          res.setHeader("ETag", etag);

          // Check if client has cached version
          if (checkETag(req, etag)) {
            return res.status(304).end();
          }

          return res.json(responseData);
        } catch (fetchError) {
          console.error("Fetch Error:", fetchError);
          return res.status(500).json({
            error: "Failed to fetch specializations",
            details: fetchError.message,
          });
        }
      }

      default:
        return res.status(405).json({
          error: "Method Not Allowed",
          allowedMethods: ["GET"],
        });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
      },
    });

    return res.status(500).json({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Apply security layers:
// 1. API Security - prevents direct access from curl/postman
// 2. Rate Limiting - prevents bulk data scraping
// 3. Data Protection - adds watermarking and browser-only access
export default withPresetSecurity(
  withRateLimit(
    withProtectionPreset(handler, "business"),
    rateLimitPresets.authenticated
  ),
  "moderate" // Requires referer + browser, but no token
);
