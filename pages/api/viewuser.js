// pages/api/viewuser.js - View user details (including password hash for superadmin)
import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await mongooseConnect();
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const currentUser = await Profile.findOne({ email: session.user.email });
    if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
      return res.status(403).json({ error: "Not authorized" });
    }

    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const user = await Profile.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Superadmin can see password hash, regular admin cannot
    if (currentUser.role === "superadmin") {
      return res.status(200).json({
        success: true,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
          userPhone: user.userPhone,
          userImage: user.userImage,
          password: user.password, // Password hash visible to superadmin
          passwordLength: user.password?.length || 0,
        },
      });
    } else {
      // Regular admin cannot see password
      const { password, sessionVersion, ...userWithoutSensitive } =
        user.toObject();
      return res.status(200).json({
        success: true,
        user: userWithoutSensitive,
      });
    }
  } catch (error) {
    console.error("View user error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}
