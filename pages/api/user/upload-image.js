import { mongooseConnect } from "@/lib/mongoose";
import { Profile } from "@/models/Profile";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session) {
      return res.status(401).json({ error: "You must be logged in" });
    }

    const { image } = req.body;
    if (!image) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Check if the image is a base64 string
    if (!image.startsWith("data:image")) {
      return res.status(400).json({ error: "Invalid image format" });
    }

    // Upload image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.v2.uploader.upload(
        image,
        {
          folder: "user_profiles",
          width: 300,
          height: 300,
          crop: "fill",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
    });

    // Update user profile with new image URL
    const user = await Profile.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.userImage = result.secure_url;
    await user.save();

    // Return updated user data
    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({
      message: "Profile image updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    res.status(500).json({
      error: "Failed to upload image",
      details: error.message,
    });
  }
}

