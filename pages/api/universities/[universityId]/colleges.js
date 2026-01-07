// pages/api/universities/[universityId]/colleges.js
import { mongooseConnect } from "@/lib/mongoose";
import { University } from "@/models/University";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { universityId } = req.query;

  if (req.method === "GET") {
    try {
      await mongooseConnect();

      if (!universityId || typeof universityId !== "string") {
        return res.status(400).json({ error: "Invalid university ID" });
      }

      const university = await University.findById(universityId).lean();

      if (!university) {
        return res.status(404).json({ error: "University not found" });
      }

      return res.status(200).json(university.colleges || []);
    } catch (error) {
      console.error("Error fetching colleges:", error);

      return res.status(500).json({
        error: "Failed to fetch colleges",
        details: error.message,
      });
    }
  } else {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
}
