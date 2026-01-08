import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]";
import { mongooseConnect } from "../../../../../lib/mongoose";
import University from "../../../../../models/University";
import { cacheGet, cacheSet } from "../../../../../lib/cache";

/**
 * Internal API endpoint to fetch colleges for a specific university
 * Used by CRM forms for cascading dropdowns
 * 
 * GET /api/crm/universities/[id]/colleges
 * Returns: { success: true, data: [{ value: "college_id", label: "College Name" }] }
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

    // Get university ID from route params
    const { id: universityId } = req.query;

    if (!universityId) {
      return res.status(400).json({ error: "University ID is required" });
    }

    // Build cache key
    const cacheKey = `colleges:university:${universityId}`;

    // Try to get from cache first
    const cached = await cacheGet(cacheKey, "crm");
    if (cached) {
      return res.status(200).json({ success: true, data: cached });
    }

    // Connect to database
    await mongooseConnect();

    // Fetch university with colleges
    const university = await University.findById(universityId)
      .select("colleges")
      .lean();

    if (!university) {
      return res.status(404).json({ error: "University not found" });
    }

    // Transform colleges to dropdown format
    // Filter out colleges with "لا يوجد" (none/not available)
    const dropdownData = (university.colleges || [])
      .filter(college => {
        const collegeName = college.collegeName || college.name || '';
        return collegeName && collegeName !== 'لا يوجد';
      })
      .map(college => ({
        value: college.collegeId ? college.collegeId.toString() : college._id.toString(),
        label: college.collegeName || college.name || 'Unknown College'
      }));

    // Sort by name
    dropdownData.sort((a, b) => a.label.localeCompare(b.label));

    // Cache the result (1 hour TTL)
    await cacheSet(cacheKey, dropdownData, 3600, "crm");

    return res.status(200).json({
      success: true,
      data: dropdownData
    });

  } catch (error) {
    console.error("Error fetching colleges:", error);
    return res.status(500).json({
      error: "Failed to fetch colleges",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
}
