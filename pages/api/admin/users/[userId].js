import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { withRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import bcrypt from "bcrypt";
import { checkDirectAccess } from "@/lib/apiProtection";
import { logAudit } from "@/lib/auditLogger";

async function handler(req, res) {
  // Block direct browser access
  if (checkDirectAccess(req, res)) return;
  
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

    const { userId } = req.query;
    console.log("API Request:", {
      method: req.method,
      userId,
      body: req.body,
      query: req.query
    });

    // Handle DELETE method or POST with action="delete"
    // Check if this is a delete request
    let bodyAction = null;
    try {
      // Ensure body is parsed (Next.js should handle this, but just in case)
      if (req.body && typeof req.body === 'string') {
        bodyAction = JSON.parse(req.body).action;
      } else {
        bodyAction = req.body?.action;
      }
    } catch (e) {
      console.error("Error parsing body:", e);
    }
    
    console.log("Delete check:", {
      method: req.method,
      bodyAction,
      body: req.body,
      isDelete: req.method === "DELETE" || (req.method === "POST" && bodyAction === "delete")
    });
    
    const isDeleteRequest = 
      req.method === "DELETE" || 
      (req.method === "POST" && bodyAction === "delete");
    
    if (isDeleteRequest) {
      // Find user to delete
      const user = await Profile.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Only superadmin can delete users
      if (currentUser.role !== "superadmin") {
        return res.status(403).json({
          error: "Access denied",
          message: "Only super admins can delete users",
        });
      }

      // Cannot delete yourself
      if (user._id.toString() === currentUser._id.toString()) {
        return res.status(400).json({
          error: "Invalid operation",
          message: "You cannot delete yourself",
        });
      }

      // Soft delete: deactivate user and increment session version
      console.log("Deleting user:", userId, "Current isActive:", user.isActive);
      
      try {
        // Use native MongoDB collection for direct update (bypasses Mongoose validation)
        const mongoose = require("mongoose");
        const db = mongoose.connection.db;
        const collection = db.collection("frontenduser");
        
        const updateResult = await collection.updateOne(
          { _id: new mongoose.Types.ObjectId(userId) },
          {
            $set: {
              isActive: false,
              sessionVersion: (user.sessionVersion || 1) + 1,
            },
          }
        );

        console.log("Native MongoDB update result:", {
          matchedCount: updateResult.matchedCount,
          modifiedCount: updateResult.modifiedCount,
          acknowledged: updateResult.acknowledged
        });

        if (updateResult.matchedCount === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // Reload user from database to get the updated data
        const updatedUser = await Profile.findById(userId).lean();
        if (!updatedUser) {
          return res.status(404).json({ error: "User not found after update" });
        }

        console.log("User after update:", {
          _id: updatedUser._id,
          isActive: updatedUser.isActive,
          email: updatedUser.email
        });

        // Log audit
        await logAudit({
          userId: currentUser._id,
          userEmail: currentUser.email,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: "DELETE_USER",
          entityType: "profile",
          entityId: updatedUser._id,
          entityName: updatedUser.name,
          description: `User ${updatedUser.name} (${updatedUser.email}) was deactivated by ${currentUser.name}`,
          changes: [
            {
              field: "isActive",
              oldValue: true,
              newValue: false
            }
          ]
        });

        // Return updated user without sensitive information
        const { password, sessionVersion, ...userWithoutSensitive } = updatedUser;
        return res.status(200).json({
          success: true,
          message: "User deactivated successfully",
          user: userWithoutSensitive,
        });
      } catch (updateError) {
        console.error("Update error details:", updateError);
        throw updateError; // Re-throw to be caught by outer catch
      }
    }

    // Handle PUT/POST for updates (exclude delete action)
    if ((req.method === "PUT" || req.method === "POST") && bodyAction !== "delete") {
      const { name, email, userPhone, newPassword, role, isActive } = req.body || {};

      // Find user to update
      const user = await Profile.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Track changes for audit log
      const changes = [];

      // Security checks: Admin cannot modify other admin/superadmin accounts
      // Superadmin can modify anyone
      if (currentUser.role === "admin") {
        if (
          (user.role === "admin" || user.role === "superadmin") &&
          user._id.toString() !== currentUser._id.toString()
        ) {
          return res
            .status(403)
            .json({ error: "Cannot modify other admin accounts" });
        }
      }

      // Update name if provided and different
      if (name && name !== user.name) {
        changes.push({ field: "name", oldValue: user.name, newValue: name });
        user.name = name;
      }

      // Update phone if provided
      if (userPhone !== undefined) {
        changes.push({ field: "userPhone", oldValue: user.userPhone, newValue: userPhone });
        user.userPhone = userPhone;
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
        changes.push({ field: "email", oldValue: user.email, newValue: email });
        user.email = email;
      }

      // Update password if provided
      if (newPassword && newPassword !== "") {
        if (newPassword.length < 6) {
          return res
            .status(400)
            .json({ error: "Password must be at least 6 characters" });
        }
        const saltRounds = 10;
        changes.push({ field: "password", oldValue: "[REDACTED]", newValue: "[CHANGED]" });
        user.password = await bcrypt.hash(newPassword, saltRounds);
        // Increment session version to log out user from all devices
        user.sessionVersion = (user.sessionVersion || 1) + 1;
      }

      // Update role if provided (superadmin only)
      if (role !== undefined && role !== user.role) {
        if (currentUser.role !== "superadmin") {
          return res.status(403).json({
            error: "Access denied",
            message: "Only super admins can change user roles",
          });
        }
        // Cannot change your own role
        if (user._id.toString() === currentUser._id.toString()) {
          return res.status(400).json({
            error: "Invalid operation",
            message: "You cannot change your own role",
          });
        }
        const validRoles = [
          "superadmin",
          "admin",
          "superagent",
          "dataentry",
          "agent",
        ];
        if (!validRoles.includes(role)) {
          return res.status(400).json({
            error: "Invalid role",
            message: `Role must be one of: ${validRoles.join(", ")}`,
          });
        }
        changes.push({ field: "role", oldValue: user.role, newValue: role });
        user.role = role;
      }

      // Update isActive if provided (superadmin only)
      if (isActive !== undefined && isActive !== user.isActive) {
        if (currentUser.role !== "superadmin") {
          return res.status(403).json({
            error: "Access denied",
            message: "Only super admins can activate/deactivate users",
          });
        }
        // Cannot deactivate yourself
        if (user._id.toString() === currentUser._id.toString() && !isActive) {
          return res.status(400).json({
            error: "Invalid operation",
            message: "You cannot deactivate yourself",
          });
        }
        changes.push({ field: "isActive", oldValue: user.isActive, newValue: isActive });
        user.isActive = isActive;
        // If deactivating, increment session version to log out user
        if (!isActive) {
          user.sessionVersion = (user.sessionVersion || 1) + 1;
        }
      }

      await user.save();

      // Log audit if there were changes
      if (changes.length > 0) {
        await logAudit({
          userId: currentUser._id,
          userEmail: currentUser.email,
          userName: currentUser.name,
          userRole: currentUser.role,
          action: "UPDATE_USER",
          entityType: "profile",
          entityId: user._id,
          entityName: user.name,
          description: `User ${user.name} (${user.email}) was updated by ${currentUser.name}`,
          changes
        });
      }

      // Return updated user without sensitive information
      const { password, sessionVersion, ...userWithoutSensitive } =
        user.toObject();
      return res.status(200).json({ user: userWithoutSensitive });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Admin user update error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: "Internal server error",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Apply rate limiting only (CSRF removed to match create-user.js pattern)
export default withRateLimit(handler, rateLimitPresets.admin);
