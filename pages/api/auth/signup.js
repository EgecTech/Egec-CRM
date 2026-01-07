// pages/api/auth/signup.js
import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import bcrypt from "bcrypt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the session
    const session = await getServerSession(req, res, authOptions);
    
    // Debug log
    console.log("Session data:", session);

    // Check if user is authenticated and is an admin
    if (!session) {
      return res.status(401).json({ error: "You must be logged in to create accounts" });
    }

    // Get the user's role from the database to ensure it's current
    const currentUser = await Profile.findOne({ email: session.user.email });
    
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ 
        error: "Only administrators can create new accounts",
        userRole: currentUser?.role,
        sessionRole: session.user.role
      });
    }

    const {
      name,
      email,
      password,
      role = "agent",
      sessionVersion = 1,
      phone,
    } = req.body;

    // Check if user already exists
    const existingUser = await Profile.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Validate phone number
    const phoneRegex = /^\+?[\d\s-]{8,}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    // Validate role
    if (!["admin", "agent", "agency", "egecagent", "studyagent"].includes(role)) {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create new user
    const newUser = await Profile.create({
      name,
      email,
      password: hashedPassword,
      role,
      sessionVersion,
      userPhone: phone,
    });

    // Return result without password
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({
      message: "User created successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
}
