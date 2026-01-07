// pages/api/setup/first-superadmin.js
// TEMPORARY ENDPOINT - Delete after creating first superadmin
// This endpoint bypasses authentication to create the first superadmin

import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("🔄 Connecting to MongoDB...");
    await mongooseConnect();
    console.log("✅ MongoDB connected");

    // Check if any superadmin already exists
    const existingSuperAdmin = await Profile.findOne({ role: "superadmin" });
    
    if (existingSuperAdmin) {
      return res.status(403).json({ 
        error: "Superadmin already exists",
        message: "A superadmin account already exists. Please login or contact your administrator."
      });
    }

    const { name, email, password, phone } = req.body || {};

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        error: "Missing required fields",
        message: "Name, email, and password are required"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({ 
        error: "Password too short",
        message: "Password must be at least 8 characters"
      });
    }

    // Check if email already exists
    const existingUser = await Profile.findOne({ 
      email: email.toLowerCase() 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        error: "Email already exists",
        message: "This email is already registered. Please use a different email or login."
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create superadmin user
    const newUser = await Profile.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "superadmin",
      sessionVersion: 1,
      userPhone: phone || "",
      isActive: true,
    });

    console.log("✅ First superadmin created:", {
      id: newUser._id,
      email: newUser.email,
      role: newUser.role
    });

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return res.status(201).json({
      success: true,
      message: "Superadmin created successfully",
      user: {
        id: userWithoutPassword._id,
        name: userWithoutPassword.name,
        email: userWithoutPassword.email,
        role: userWithoutPassword.role
      },
      warning: "⚠️ DELETE pages/api/setup/first-superadmin.js and pages/auth/first-superadmin.js NOW!"
    });

  } catch (error) {
    console.error("❌ Error creating first superadmin:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    
    // Specific error messages
    if (error.name === 'MongoServerSelectionError') {
      return res.status(500).json({ 
        error: "Database connection failed",
        message: "Cannot connect to MongoDB. Please check your MONGODB_URI in .env.local and ensure MongoDB is accessible.",
        details: error.message
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        error: "Duplicate entry",
        message: "A user with this email already exists.",
        details: error.message
      });
    }
    
    return res.status(500).json({ 
      error: "Server error",
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
