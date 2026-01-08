import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { withRateLimit, rateLimitPresets } from "@/lib/rateLimit";

async function handler(req, res) {
  await mongooseConnect();

  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    // Verify admin or superadmin role from database
    const currentUser = await Profile.findOne({ email: session.user.email });
    if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }

    if (req.method === "GET") {
      // Fetch all users
      const users = await Profile.find(
        {},
        {
          password: 0, // Exclude password field
          sessionVersion: 0, // Exclude session version
        }
      );

      return res.status(200).json({ users });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Admin users API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Apply rate limiting for admin endpoints
export default withRateLimit(handler, rateLimitPresets.admin);
