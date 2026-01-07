import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  await mongooseConnect();

  try {
    // Check authentication and admin role
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    // Verify admin role from database
    const currentUser = await Profile.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin privileges required." });
    }

    const { userId } = req.query;

    if (req.method === "PUT") {
      const { email, newPassword } = req.body;

      // Find user to update
      const user = await Profile.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Prevent admin from modifying other admin accounts
      if (
        user.role === "admin" &&
        user._id.toString() !== currentUser._id.toString()
      ) {
        return res
          .status(403)
          .json({ error: "Cannot modify other admin accounts" });
      }

      // Update email if provided and different
      if (email && email !== user.email) {
        // Check if email is already taken
        const emailExists = await Profile.findOne({
          email,
          _id: { $ne: userId },
        });
        if (emailExists) {
          return res.status(400).json({ error: "Email already in use" });
        }
        user.email = email;
      }

      // Update password if provided
      if (newPassword) {
        if (newPassword.length < 6) {
          return res
            .status(400)
            .json({ error: "Password must be at least 6 characters" });
        }
        const saltRounds = 10;
        user.password = await bcrypt.hash(newPassword, saltRounds);
        // Increment session version to log out user from all devices
        user.sessionVersion = (user.sessionVersion || 1) + 1;
      }

      await user.save();

      // Return updated user without sensitive information
      const { password, sessionVersion, ...userWithoutSensitive } =
        user.toObject();
      return res.status(200).json({ user: userWithoutSensitive });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Admin user update error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
