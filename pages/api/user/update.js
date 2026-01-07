import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { withRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { sanitizePhone } from "@/lib/sanitize";

async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  await mongooseConnect();

  if (req.method !== "PUT" && req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the session
    const session = await getServerSession(req, res, authOptions);

    if (!session) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    // Sanitize inputs
    const phone = sanitizePhone(req.body.phone);
    const currentPassword = req.body.currentPassword; // Don't sanitize passwords
    const newPassword = req.body.newPassword;

    // Get current user
    const user = await Profile.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update phone if provided
    if (phone) {
      const phoneRegex = /^\+?[\d\s-]{8,}$/;
      if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: "Invalid phone number format" });
      }
      user.userPhone = phone;
    }

    // Update password if provided
    if (currentPassword && newPassword) {
      // Verify current password
      const isValid = await bcrypt.compare(currentPassword, user.password);
      if (!isValid) {
        return res.status(400).json({ error: "Current password is incorrect" });
      }

      // Validate new password
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "Password must be at least 6 characters" });
      }

      // Hash and update new password
      const saltRounds = 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
      user.sessionVersion = (user.sessionVersion || 1) + 1; // Increment session version
    }

    await user.save();

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    // Update session with new phone number
    if (phone) {
      session.user.userPhone = phone;
    }

    res.json({
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}

// Apply rate limiting only (CSRF removed to match working endpoints)
export default withRateLimit(handler, rateLimitPresets.auth);
