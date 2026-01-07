import { mongooseConnect } from "@/lib/mongoose";
import { Project } from "@/models/Project";

export default async function handle(req, res) {
  try {
    await mongooseConnect();
    const { method } = req;

    if (method === "POST") {
      const {
        title,
        slug,
        images,
        description,
        client,
        projectcategory,
        tags,
        livepreview,
        status,
      } = req.body;

      if (!title || !slug || !description || !projectcategory || !status) {
        return res.status(400).json({ error: "Required fields are missing" });
      }

      const projectDos = await Project.create({
        title,
        slug,
        images,
        description,
        client,
        projectcategory,
        tags,
        livepreview,
        status,
      });

      return res.status(201).json(projectDos);
    }

    if (method === "GET") {
      if (req.query?.id) {
        const project = await Project.findById(req.query.id);
        if (!project) {
          return res.status(404).json({ error: "Project not found" });
        }
        return res.json(project);
      } else {
        return res.json((await Project.find()).reverse());
      }
    }

    if (method === "PUT") {
      const {
        _id,
        title,
        slug,
        images,
        description,
        client,
        projectcategory,
        tags,
        livepreview,
        status,
      } = req.body;

      if (!_id) {
        return res.status(400).json({ error: "Project ID is required" });
      }

      const updatedProject = await Project.findByIdAndUpdate(
        _id,
        {
          title,
          slug,
          images,
          description,
          client,
          projectcategory,
          tags,
          livepreview,
          status,
        },
        { new: true }
      );

      if (!updatedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.json(updatedProject);
    }

    if (method === "DELETE") {
      if (!req.query?.id) {
        return res
          .status(400)
          .json({ error: "Project ID is required for deletion" });
      }

      const deletedProject = await Project.findByIdAndDelete(req.query.id);
      if (!deletedProject) {
        return res.status(404).json({ error: "Project not found" });
      }

      return res.json({
        success: true,
        message: "Project deleted successfully",
      });
    }

    return res.status(405).json({ error: "Method Not Allowed" });
  } catch (error) {
    console.error("API Error:", error);
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }
}
