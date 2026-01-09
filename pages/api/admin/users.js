import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { withRateLimit, rateLimitPresets } from "@/lib/rateLimit";
import { checkDirectAccess } from "@/lib/apiProtection";

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

    if (req.method === "POST") {
      // Create new user
      const { name, email, password, role, phone } = req.body;

      // Validation
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: "Missing required fields",
          message: "Name, email, and password are required" 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          error: "Invalid password",
          message: "Password must be at least 6 characters" 
        });
      }

      // Check if email already exists
      const existingUser = await Profile.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ 
          error: "Email already exists",
          message: "A user with this email already exists" 
        });
      }

      // Role validation
      const validRoles = ["superadmin", "admin", "superagent", "agent", "dataentry"];
      if (role && !validRoles.includes(role)) {
        return res.status(400).json({ 
          error: "Invalid role",
          message: `Role must be one of: ${validRoles.join(", ")}` 
        });
      }

      // Security check: Admin cannot create superadmin
      if (currentUser.role === "admin" && role === "superadmin") {
        return res.status(403).json({ 
          error: "Access denied",
          message: "Admins cannot create super admin accounts" 
        });
      }

      // Hash password
      const bcrypt = require("bcrypt");
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const newUser = await Profile.create({
        name,
        email,
        password: hashedPassword,
        role: role || "agent",
        userPhone: phone || "",
        isActive: true,
        sessionVersion: 1
      });

      // Return user without sensitive information
      const { password: _, sessionVersion, ...userWithoutSensitive } = newUser.toObject();
      return res.status(201).json({ 
        success: true,
        message: "User created successfully",
        user: userWithoutSensitive 
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Admin users API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Apply rate limiting for admin endpoints
export default withRateLimit(handler, rateLimitPresets.admin);
