// pages/api/deleteuser.js - Delete user (superadmin only)
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
    if (!currentUser || currentUser.role !== "superadmin") {
      return res.status(403).json({ error: "Superadmin only" });
    }

    const { userId } = req.body || {};

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Cannot delete yourself
    if (userId === currentUser._id.toString()) {
      return res.status(400).json({ error: "Cannot delete yourself" });
    }

    const user = await Profile.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Soft delete: deactivate user and increment session version
    user.isActive = false;
    user.sessionVersion = (user.sessionVersion || 1) + 1;
    await user.save();

    const { password, sessionVersion, ...userWithoutSensitive } =
      user.toObject();

    return res.status(200).json({
      success: true,
      message: "User deactivated successfully",
      user: userWithoutSensitive,
    });
  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({ error: "Server error" });
  }
}

