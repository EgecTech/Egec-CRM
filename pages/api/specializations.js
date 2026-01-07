// pages/api/specializations

import Specialization from "@/models/Specialization";
import University from "@/models/University";
import Degree from "@/models/Degree";
import { mongooseConnect } from "@/lib/mongoose";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

export default async function handler(req, res) {
  console.log("📥 Received body data:", JSON.stringify(req.body, null, 2));

  const session = await getServerSession(req, res, authOptions);

  if (!session) {
    res.setHeader("Cache-Control", "no-store");
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await mongooseConnect();
    const { method } = req;

    switch (method) {
      case "POST": {
        const {
          name,
          places,
          status,
          specializationType,
          specializationDepartment,
          sectorType,
        } = req.body;

        if (
          !name ||
          !status ||
          !specializationType ||
          !Array.isArray(places) ||
          places.length === 0
        ) {
          return res.status(400).json({
            error: "All fields are required",
            requiredFields: ["name", "places", "status", "specializationType"],
          });
        }

        try {
          const newSpecialization = await Specialization.create({
            name,
            places,
            status,
            specializationType,
            specializationDepartment: specializationDepartment || "",
            sectorType: sectorType || "",
          });

          res.setHeader("Cache-Control", "no-store");
          return res.status(201).json(newSpecialization);
        } catch (createError) {
          console.error("❌ Create Error Full:", {
            message: createError.message,
            errors: createError.errors,
          });

          return res.status(400).json({
            error: "Failed to create specialization",
            details: createError.message,
          });
        }
      }

      case "GET": {
        try {
          if (req.query?.id) {
            const specialization = await Specialization.findById(req.query.id)
              .populate("places.universityId", "name country")
              .populate("places.degreeFounded.degreeId", "name")
              .lean();

            if (!specialization) {
              return res.status(404).json({
                error: "Specialization not found",
                id: req.query.id,
              });
            }

            res.setHeader("Cache-Control", "no-store");
            return res.json(specialization);
          }

          const specializations = await Specialization.find()
            .populate("places.universityId", "name country")
            .populate("places.degreeFounded.degreeId", "name")
            .sort({ createdAt: -1 })
            .lean();

          res.setHeader("Cache-Control", "no-store");
          return res.json(specializations || []);
        } catch (fetchError) {
          console.error("Fetch Error:", fetchError);
          return res.status(500).json({
            error: "Failed to fetch specializations",
            details: fetchError.message,
          });
        }
      }

      case "PUT": {
        const { _id, ...updateData } = req.body; // ← تأكد من استقبال _id

        if (!_id) {
          return res.status(400).json({ error: "معرف التخصص مطلوب للتحديث" });
        }

        try {
          const updated = await Specialization.findByIdAndUpdate(
            _id,
            updateData,
            {
              new: true,
              runValidators: true,
            }
          ).populate(/* ... */);

          if (!updated) {
            return res.status(404).json({ error: "لم يتم العثور على التخصص" });
          }

          return res.json(updated);
        } catch (err) {
          console.error("Update error:", err);
          return res.status(400).json({
            error: "فشل التحديث",
            details: err.message,
            // أضف هذه التفاصيل للإصلاح
            validationErrors: err.errors
              ? Object.values(err.errors).map((e) => e.message)
              : null,
          });
        }
      }

      case "DELETE": {
        const { id } = req.query;

        if (!id) {
          return res.status(400).json({
            error: "Specialization ID is required",
            details: "Add ?id= parameter to the URL",
          });
        }

        try {
          const deletedSpecialization = await Specialization.findByIdAndDelete(
            id
          );

          if (!deletedSpecialization) {
            return res.status(404).json({
              error: "Specialization not found",
              id: id,
            });
          }

          res.setHeader("Cache-Control", "no-store");
          return res.json({
            success: true,
            message: "Specialization deleted successfully",
            deletedId: id,
          });
        } catch (deleteError) {
          console.error("Delete Error:", deleteError);
          return res.status(500).json({
            error: "Failed to delete specialization",
            details: deleteError.message,
          });
        }
      }

      default:
        return res.status(405).json({
          error: "Method Not Allowed",
          allowedMethods: ["GET", "POST", "PUT", "DELETE"],
        });
    }
  } catch (error) {
    console.error("API Error:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.url,
        query: req.query,
        body: req.body,
      },
    });

    return res.status(500).json({
      error: "Internal Server Error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
