import { mongooseConnect } from "@/lib/mongoose";
import College from "@/models/College";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await mongooseConnect();
    const { method } = req;

    switch (method) {
      case "GET":
        try {
          const colleges = await College.find().sort({ name: 1 }).lean();
          return res.json(colleges);
        } catch (error) {
          console.error("Error fetching colleges:", error);
          return res.status(500).json({ error: "Failed to fetch colleges" });
        }

      case "POST":
        try {
          const { name, sector, description, details } = req.body;

          if (!name || !name.trim()) {
            return res.status(400).json({ error: "College name is required" });
          }

          const college = await College.create({
            name: name.trim(),
            sector: sector?.trim(),
            description: description?.trim(),
            details: details,
          });

          return res.status(201).json(college);
        } catch (error) {
          console.error("Error creating college:", error);
          return res.status(500).json({ error: "Failed to create college" });
        }

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
