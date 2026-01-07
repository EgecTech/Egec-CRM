// pages/api/colleges/[id].js

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
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ error: "College ID is required" });
    }

    switch (method) {
      case "GET":
        try {
          const college = await College.findById(id).lean();
          if (!college) {
            return res.status(404).json({ error: "College not found" });
          }
          return res.json(college);
        } catch (error) {
          console.error("Error fetching college:", error);
          return res.status(500).json({ error: "Failed to fetch college" });
        }

      case "PUT":
        try {
          const { name, sector, description, details } = req.body;

          if (!name || !name.trim()) {
            return res.status(400).json({ error: "College name is required" });
          }

          const college = await College.findByIdAndUpdate(
            id,
            {
              name: name.trim(),
              sector: sector?.trim(),
              description: description?.trim(),
              details: details,
            },
            { new: true, runValidators: true }
          );

          if (!college) {
            return res.status(404).json({ error: "College not found" });
          }

          return res.json(college);
        } catch (error) {
          console.error("Error updating college:", error);
          return res.status(500).json({ error: "Failed to update college" });
        }

      case "DELETE":
        try {
          const college = await College.findByIdAndDelete(id);
          if (!college) {
            return res.status(404).json({ error: "College not found" });
          }
          return res.json({ message: "College deleted successfully" });
        } catch (error) {
          console.error("Error deleting college:", error);
          return res.status(500).json({ error: "Failed to delete college" });
        }

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
