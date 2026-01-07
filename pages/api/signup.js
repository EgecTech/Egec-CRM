// pages/api/signup.js - Simplified for Vercel compatibility
import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import { checkRateLimit } from "@/lib/rateLimit";
import { sanitizeInput, validateEmail } from "@/lib/sanitize";

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
    const identifier = `signup:${ip}`;

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
        message: "You must be logged in to create accounts",
      });
      return;
    }

    // Verify admin role
    const currentUser = await Profile.findOne({ email: session.user.email });
    if (!currentUser || currentUser.role !== "admin") {
      res.status(403).json({
        error: "Access denied",
        message: "Only administrators can create new accounts",
        userRole: currentUser?.role || "unknown",
      });
      return;
    }

    // Validate request body
    const { name, email, password, role = "agent", phone } = req.body || {};

    if (!name || !email || !password || !phone) {
      res.status(400).json({
        error: "Missing required fields",
        message: "Name, email, password, and phone are required",
      });
      return;
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = email?.toLowerCase().trim();

    // Validate email
    if (!validateEmail(sanitizedEmail)) {
      res.status(400).json({
        error: "Invalid email format",
        message: "Please provide a valid email address",
      });
      return;
    }

    // Check if user exists
    const existingUser = await Profile.findOne({ email: sanitizedEmail });
    if (existingUser) {
      res.status(400).json({
        error: "User already exists",
        message: "A user with this email already exists",
      });
      return;
    }

    // Validate phone
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phoneRegex.test(phone)) {
      res.status(400).json({
        error: "Invalid phone number",
        message: "Please provide a valid phone number (minimum 8 digits)",
      });
      return;
    }

    // Validate password
    if (password.length < 6) {
      res.status(400).json({
        error: "Password too short",
        message: "Password must be at least 6 characters long",
      });
      return;
    }

    // Validate role
    const validRoles = [
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await Profile.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role,
      sessionVersion: 1,
      userPhone: phone,
      isActive: true,
    });

    // Return without password
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("[Signup] Error:", error);

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
      message: "Failed to create user account",
    });
  }
}
