import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]";
import { mongooseConnect } from "../../../lib/mongoose";
import University from "../../../models/University";
import { cacheGet, cacheSet } from "../../../lib/cache";

/**
 * Internal API endpoint to fetch universities (with optional country filter)
 * Used by CRM forms for cascading dropdowns
 * 
 * GET /api/crm/universities?country=Egypt
 * Returns: { success: true, data: [{ value: "uni_id", label: "University Name" }] }
 */
export default async function handler(req, res) {
  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Check authentication (session-based)
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized. Please sign in." });
    }

    // Get country filter from query params
    const { country } = req.query;

    // Build cache key
    const cacheKey = country 
      ? `universities:country:${country}` 
      : `universities:all`;

    // Try to get from cache first
    const cached = await cacheGet(cacheKey, "crm");
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }

    // Connect to database
    await mongooseConnect();

    // Build query
    const query = {};
    if (country) {
      query.country = country;
    }

    // Fetch universities
    const universities = await University.find(query)
      .select("_id name country")
      .sort({ name: 1 })
      .lean();

    // Transform to dropdown format
    const dropdownData = universities.map(uni => ({
      value: uni._id.toString(),
      label: uni.name,
      country: uni.country
    }));

    // Cache the result (1 hour TTL)
    await cacheSet(cacheKey, dropdownData, 3600, "crm");

    return res.status(200).json({
      success: true,
      data: dropdownData
    });

  } catch (error) {
    console.error("Error fetching universities:", error);
    return res.status(500).json({
      error: "Failed to fetch universities",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}
