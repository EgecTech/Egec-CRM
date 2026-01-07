// models/Degree.js

import { Schema, models, model } from "mongoose";
const certificatesSchema = new Schema({
  certificatesName: { type: String, required: true },
  certificatesCountry: { type: String },
  certificatesNationality: { type: String },
  certificatesConditions: { type: String },
  colleges: [
    {
      collegeId: {
        type: Schema.Types.ObjectId,
        ref: "College",
        required: true,
      },
      collegeName: { type: String, required: true },
    },
  ],
});

const degreeSchema = new Schema(
  {
    name: { type: String, required: true },
    studyConditions: { type: String },
    documentsRequired: { type: String },
    certificates: [certificatesSchema],
    status: { type: String },
  },
  { timestamps: true }
);

export default models.Degree || model("Degree", degreeSchema, "degrees");
