import cloudinary from "cloudinary";
import multiparty from "multiparty";
import { withPresetRateLimit } from "@/lib/rateLimit";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

import { withCsrfProtection } from "@/lib/csrfProtection";

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handle(req, res) {
  // Require authentication for uploads
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res
      .status(401)
      .json({ error: "Unauthorized - Please login to upload files" });
  }
  try {
    const form = new multiparty.Form();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    if (!files || !files.file || files.file.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const links = [];
    for (const file of files.file) {
      try {
        const result = await cloudinary.v2.uploader.upload(file.path, {
          folder: "vbm-admin",
          public_id: `file_${Date.now()}`,
          resource_type: "auto",
        });
        links.push(result.secure_url);
      } catch (uploadError) {
        console.error("Cloudinary Upload Error:", uploadError);
        return res
          .status(500)
          .json({ error: "Error uploading file to Cloudinary" });
      }
    }

    return res.status(200).json({ links });
  } catch (error) {
    console.error("Server Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// Apply upload rate limiting: 10 uploads per minute
export default withCsrfProtection(withPresetRateLimit(handle, "upload"));

export const config = {
  api: { bodyParser: false },
};
