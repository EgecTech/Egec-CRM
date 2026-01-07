// pages/api/universities/universities.js

import { mongooseConnect } from "@/lib/mongoose";
import { University } from "@/models/University";
import { getServerSession } from "next-auth";
// import { authOptions } from "@/pages/api/[...nextauth]";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

function normalizeCollegesPayload(colleges = []) {
  if (!Array.isArray(colleges)) return [];

  const parseRate = (value) => {
    if (value === null || value === undefined || value === "") return undefined;
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  };

  return colleges
    .filter((college) => college?.collegeId && college?.collegeName)
    .map((college) => ({
      collegeId: college.collegeId,
      collegeName: college.collegeName,
      bachelorRate: parseRate(college.bachelorRate),
      masterRate: college.masterRate || undefined,
      doctorateRate: college.doctorateRate || undefined,
    }));
}

export default async function handle(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await mongooseConnect();

    const { method } = req;

    switch (method) {
      case "POST": {
        const {
          name,
          country,
          email,
          establishment,
          website,
          phone,
          location,
          universityType,
          contract,
          images,
          status,
          colleges,
          timesRanking,
          cwurRanking,
          shanghaiRanking,
          qsRanking,
          accreditation,
          accreditationCountries,
          universityConditions,
        } = req.body;

        if (!name || !status) {
          return res.status(400).json({ error: "Required fields are missing" });
        }

        const newUniversity = await University.create({
          name,
          country,
          email,
          establishment,
          website,
          phone,
          location,
          universityType,
          contract,
          images,
          status,
          colleges: normalizeCollegesPayload(colleges),
          timesRanking,
          cwurRanking,
          shanghaiRanking,
          qsRanking,
          accreditation,
          accreditationCountries,
          universityConditions,
        });

        return res.status(201).json(newUniversity);
      }

      case "GET": {
        if (req.query?.id) {
          const university = await University.findById(req.query.id).lean();
          if (!university)
            return res.status(404).json({ error: "University not found" });
          console.log("GET - Fetched university:", university);
          console.log(
            "GET - universityConditions:",
            university.universityConditions
          );
          console.log(
            "GET - Type of universityConditions:",
            typeof university.universityConditions
          );
          return res.json(university);
        }

        const universities = await University.find().sort({ _id: -1 }).lean();
        return res.json(universities);
      }

      case "PUT": {
        const {
          _id,
          name,
          country,
          email,
          establishment,
          website,
          phone,
          location,
          universityType,
          contract,
          images,
          status,
          colleges,
          timesRanking,
          cwurRanking,
          shanghaiRanking,
          qsRanking,
          accreditation,
          accreditationCountries,
          universityConditions,
        } = req.body;

        console.log(
          "PUT - Received universityConditions:",
          universityConditions
        );
        console.log(
          "PUT - Type of universityConditions:",
          typeof universityConditions
        );

        if (!_id)
          return res.status(400).json({ error: "University ID is required" });

        const updateData = {
          name,
          country,
          email,
          establishment,
          website,
          phone,
          location,
          universityType,
          contract,
          images,
          status,
          colleges: normalizeCollegesPayload(colleges),
          timesRanking,
          cwurRanking,
          shanghaiRanking,
          qsRanking,
          accreditation,
          accreditationCountries,
          universityConditions,
        };

        console.log("PUT - Update data:", updateData);

        const updatedUniversity = await University.findByIdAndUpdate(
          _id,
          updateData,
          { new: true, lean: true }
        );

        console.log("PUT - Updated university:", updatedUniversity);
        console.log(
          "PUT - Updated universityConditions:",
          updatedUniversity.universityConditions
        );

        if (!updatedUniversity)
          return res.status(404).json({ error: "University not found" });

        return res.json(updatedUniversity);
      }

      case "DELETE": {
        if (!req.query?.id) {
          return res
            .status(400)
            .json({ error: "Delete University ID is required" });
        }

        const deletedUniversity = await University.findByIdAndDelete(
          req.query.id
        );
        if (!deletedUniversity) {
          return res.status(404).json({ error: "University not found" });
        }

        return res.json({
          success: true,
          message: "University deleted successfully",
          deletedUniversity,
        });
      }

      default:
        return res.status(405).json({ error: "Method not allowed" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server Error" });
  }
}
