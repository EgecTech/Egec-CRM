// pages/api/edituserpassword.js - Edit user endpoint
import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { checkRateLimit } from "@/lib/rateLimit";
import { validateEmail } from "@/lib/sanitize";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  // Only allow POST
  if (req.method !== "POST") {
    res.status(405).json({
      error: "Method not allowed",
      message: "Only POST requests are allowed",
    });
    return;
  }

  try {
    // Rate limiting
    const forwarded = req.headers["x-forwarded-for"];
    const ip = forwarded
      ? forwarded.split(",")[0].trim()
      : req.socket?.remoteAddress || "unknown";
    const identifier = `edituserpassword:${ip}`;

    const rateLimit = checkRateLimit(identifier, 5, 60000);
    if (!rateLimit.success) {
      res.status(429).json({
        error: "Too many requests",
        message: `Please try again in ${rateLimit.resetIn} seconds`,
      });
      return;
    }

    // Connect to database
    await mongooseConnect();

    // Get session
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      res.status(401).json({
        error: "Authentication required",
        message: "You must be logged in to edit users",
      });
      return;
    }

    // Verify admin or superadmin role
    const currentUser = await Profile.findOne({ email: session.user.email });
    if (!currentUser || !["admin", "superadmin"].includes(currentUser.role)) {
      res.status(403).json({
        error: "Access denied",
        message: "Only administrators can edit users",
        userRole: currentUser?.role || "unknown",
      });
      return;
    }

    // Get request body
    const { userId, email, newPassword, role, isActive } = req.body || {};

    if (!userId) {
      res.status(400).json({
        error: "Missing required field",
        message: "userId is required",
      });
      return;
    }

    // Find user to update
    const userToUpdate = await Profile.findById(userId);
    if (!userToUpdate) {
      res.status(404).json({
        error: "User not found",
        message: "The user you're trying to edit does not exist",
      });
      return;
    }

    // Security checks: Admin cannot modify other admin/superadmin accounts
    // Superadmin can modify anyone
    if (currentUser.role === "admin") {
      if (
        (userToUpdate.role === "admin" || userToUpdate.role === "superadmin") &&
        userToUpdate._id.toString() !== currentUser._id.toString()
      ) {
        res.status(403).json({
          error: "Access denied",
          message:
            "Admin accounts can only be modified by super admins or themselves",
        });
        return;
      }
    }

    // Update email if provided
    if (email !== undefined && email !== userToUpdate.email) {
      const sanitizedEmail = email?.toLowerCase().trim();

      // Validate email format
      if (!validateEmail(sanitizedEmail)) {
        res.status(400).json({
          error: "Invalid email format",
          message: "Please provide a valid email address",
        });
        return;
      }

      // Check if email is already taken
      const emailExists = await Profile.findOne({
        email: sanitizedEmail,
        _id: { $ne: userId },
      });
      if (emailExists) {
        res.status(400).json({
          error: "Email already in use",
          message: "A user with this email already exists",
        });
        return;
      }

      userToUpdate.email = sanitizedEmail;
    }

    // Update password if provided
    if (newPassword !== undefined && newPassword !== "") {
      if (newPassword.length < 6) {
        res.status(400).json({
          error: "Password too short",
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      userToUpdate.password = hashedPassword;
      // Increment session version to log out user from all devices
      userToUpdate.sessionVersion = (userToUpdate.sessionVersion || 1) + 1;
    }

    // Update role if provided (superadmin only)
    if (role !== undefined && role !== userToUpdate.role) {
      if (currentUser.role !== "superadmin") {
        res.status(403).json({
          error: "Access denied",
          message: "Only super admins can change user roles",
        });
        return;
      }

      // Cannot change your own role
      if (userToUpdate._id.toString() === currentUser._id.toString()) {
        res.status(400).json({
          error: "Invalid operation",
          message: "You cannot change your own role",
        });
        return;
      }

      // Validate role
      const validRoles = [
        "superadmin",
        "admin",
        "agent",
        "agency",
        "egecagent",
        "studyagent",
        "edugateagent",
      ];
      if (!validRoles.includes(role)) {
        res.status(400).json({
          error: "Invalid role",
          message: `Role must be one of: ${validRoles.join(", ")}`,
        });
        return;
      }

      userToUpdate.role = role;
    }

    // Update isActive if provided (superadmin only)
    if (isActive !== undefined && isActive !== userToUpdate.isActive) {
      if (currentUser.role !== "superadmin") {
        res.status(403).json({
          error: "Access denied",
          message: "Only super admins can activate/deactivate users",
        });
        return;
      }

      // Cannot deactivate yourself
      if (
        userToUpdate._id.toString() === currentUser._id.toString() &&
        !isActive
      ) {
        res.status(400).json({
          error: "Invalid operation",
          message: "You cannot deactivate yourself",
        });
        return;
      }

      userToUpdate.isActive = isActive;

      // If deactivating, increment session version to log out user
      if (!isActive) {
        userToUpdate.sessionVersion = (userToUpdate.sessionVersion || 1) + 1;
      }
    }

    // Save changes
    await userToUpdate.save();

    // Return updated user without password
    const {
      password: _,
      sessionVersion: __,
      ...userWithoutSensitive
    } = userToUpdate.toObject();

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userWithoutSensitive,
    });
  } catch (error) {
    console.error("[EditUserPassword] Error:", error);

    // Handle specific errors
    if (error.name === "MongoServerError" && error.code === 11000) {
      res.status(400).json({
        error: "Duplicate entry",
        message: "A user with this email already exists",
      });
      return;
    }

    res.status(500).json({
      error: "Internal server error",
      message: "Failed to update user",
    });
  }
}
