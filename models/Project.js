const { Schema, models, model } = require("mongoose");

const projectSchema = new Schema(
  {
    title: { type: String },
    slug: { type: String, require: true },
    images: [{ type: String }],
    description: { type: String },
    client: { type: String },
    projectcategory: [{ type: String }],
    tags: [{ type: String }],
    livepreview: [{ type: String }],
    status: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Project =
  models.Project || model("Project", projectSchema, "projects");
