// Alternative signup endpoint to test Vercel routing
import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  // CORS
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

    const { name, email, password, role = "agent", phone } = req.body || {};

    console.log("Create user request:", {
      name,
      email,
      role,
      phone: phone ? "provided" : "missing",
      currentUserRole: currentUser.role
    });

    if (!name || !email || !password || !phone) {
      return res.status(400).json({ 
        error: "Missing fields",
        message: "Name, email, password, and phone are required"
      });
    }

    // Validate role if provided
    const validRoles = [
      "superadmin",
      "admin",
      "agent",
      "dataentry",
      "agency",
      "egecagent",
      "studyagent",
      "edugateagent",
    ];
    
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ 
        error: "Invalid role",
        message: `Role must be one of: ${validRoles.join(", ")}`
      });
    }

    // Check if admin is trying to create superadmin or admin (only superadmin can do this)
    if (currentUser.role === "admin" && (role === "superadmin" || role === "admin")) {
      return res.status(403).json({ 
        error: "Access denied",
        message: "Only super admins can create admin or superadmin users"
      });
    }

    const existingUser = await Profile.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Profile.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role,
      sessionVersion: 1,
      userPhone: phone,
      isActive: true,
    });

    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return res.status(201).json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Create user error:", error);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ 
      error: "Server error",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
