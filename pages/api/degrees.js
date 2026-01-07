// pages/api/degrees.js
import { mongooseConnect } from "@/lib/mongoose";
import Degree from "@/models/Degree";
import { getServerSession } from "next-auth";
import { authOptions } from "@/pages/api/auth/[...nextauth]";

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
          studyConditions,
          documentsRequired,
          certificates,
          status,
        } = req.body;

        if (!name || !name.trim()) {
          return res.status(400).json({ error: "Degree name is required" });
        }

        const degreeDoc = await Degree.create({
          name: name.trim(),
          studyConditions: studyConditions?.trim(),
          documentsRequired: documentsRequired?.trim(),
          certificates: certificates,
          status: status || "active",
        });

        return res.status(201).json(degreeDoc);
      }

      case "GET": {
        if (req.query?.id) {
          const degree = await Degree.findById(req.query.id);
          if (!degree) {
            return res.status(404).json({ error: "Degree not found" });
          }
          return res.json(degree);
        } else {
          const degrees = await Degree.find().sort({ createdAt: -1 });
          return res.json(degrees);
        }
      }

      case "PUT": {
        const {
          _id,
          name,
          studyConditions,
          documentsRequired,
          certificates,
          status,
        } = req.body;

        if (!_id) {
          return res.status(400).json({ error: "Degree ID is required" });
        }

        const updateData = {
          name: name?.trim(),
          studyConditions: studyConditions?.trim(),
          documentsRequired: documentsRequired?.trim(),
          certificates: certificates,
          status,
        };

        const updatedDegree = await Degree.findByIdAndUpdate(_id, updateData, {
          new: true,
          runValidators: true,
        });

        if (!updatedDegree) {
          return res.status(404).json({ error: "Degree not found" });
        }

        return res.json(updatedDegree);
      }

      case "DELETE": {
        if (!req.query?.id) {
          return res.status(400).json({ error: "Degree ID is required" });
        }

        const deletedDegree = await Degree.findByIdAndDelete(req.query.id);
        if (!deletedDegree) {
          return res.status(404).json({ error: "Degree not found" });
        }

        return res.json({
          success: true,
          message: "Degree deleted successfully",
          deletedDegree,
        });
      }

      default:
        return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error.message,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
    });
  }
}

// import { mongooseConnect } from "@/lib/mongoose";
// import Degree from "@/models/Degree";

// export default async function handle(req, res) {
//   try {
//     await mongooseConnect();
//     const { method } = req;

//     switch (method) {
//       case "POST": {
//         const { name, studyConditions, documentsRequired, status } = req.body;

//         if (!name || !name.trim()) {
//           return res.status(400).json({ error: "Degree name is required" });
//         }

//         const degreeDoc = await Degree.create({
//           name: name.trim(),
//           studyConditions: studyConditions?.trim(),
//           documentsRequired: documentsRequired?.trim(),
//           status: status || "active",
//         });

//         return res.status(201).json(degreeDoc);
//       }

//       case "GET": {
//         if (req.query?.id) {
//           const degree = await Degree.findById(req.query.id);
//           if (!degree) {
//             return res.status(404).json({ error: "Degree not found" });
//           }
//           return res.json(degree);
//         } else {
//           const degrees = await Degree.find().sort({ createdAt: -1 });
//           return res.json(degrees);
//         }
//       }

//       case "PUT": {
//         const { _id, name, studyConditions, documentsRequired, status } =
//           req.body;

//         if (!_id) {
//           return res.status(400).json({ error: "Degree ID is required" });
//         }

//         const updateData = {
//           name: name?.trim(),
//           studyConditions: studyConditions?.trim(),
//           documentsRequired: documentsRequired?.trim(),
//           status,
//         };

//         const updatedDegree = await Degree.findByIdAndUpdate(_id, updateData, {
//           new: true,
//           runValidators: true,
//         });

//         if (!updatedDegree) {
//           return res.status(404).json({ error: "Degree not found" });
//         }

//         return res.json(updatedDegree);
//       }

//       case "DELETE": {
//         if (!req.query?.id) {
//           return res.status(400).json({ error: "Degree ID is required" });
//         }

//         const deletedDegree = await Degree.findByIdAndDelete(req.query.id);
//         if (!deletedDegree) {
//           return res.status(404).json({ error: "Degree not found" });
//         }

//         return res.json({
//           success: true,
//           message: "Degree deleted successfully",
//           deletedDegree,
//         });
//       }

//       default:
//         return res.status(405).json({ error: "Method Not Allowed" });
//     }
//   } catch (error) {
//     console.error("API Error:", error);
//     return res.status(500).json({
//       error: "Internal Server Error",
//       message: error.message,
//       ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
//     });
//   }
// }
