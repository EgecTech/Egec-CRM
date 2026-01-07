// models/Specialization.js
import { Schema, models, model } from "mongoose";

const StudySystemSchema = new Schema({
  StudySystemName: { type: String, required: true },
  cost: { type: Number, required: true },
  explanationCost: { type: String }, // ← عدلناه من Number
  studyPeriod: { type: Number, required: true },
  explanationStudyPeriod: { type: String }, // ← عدلناه من Number
  language: { type: String },
});

const degreeSchema = new Schema({
  degreeId: {
    type: Schema.Types.ObjectId,
    ref: "Degree",
    // required: true, // أضف required للتأكد من وجوده
  },
  degreeName: { type: String, required: true },
  specializationDegreeRequirements: { type: String },
  studySystems: [StudySystemSchema],
});

const placesSchema = new Schema({
  universityId: {
    type: Schema.Types.ObjectId,
    ref: "University",
    // required: true,
  },
  universityName: { type: String, required: true },
  collegeId: {
    type: Schema.Types.ObjectId,
    ref: "College",
  },
  collegeName: { type: String, required: true },
  degreeFounded: [degreeSchema],
});

const specializationSchema = new Schema(
  {
    name: { type: String, required: true },
    specializationType: { type: String },
    specializationDepartment: { type: String },
    sectorType: { type: String },
    places: [placesSchema],
    status: { type: String },
  },
  { timestamps: true }
);

export default models.Specialization ||
  model("Specialization", specializationSchema, "specializations");
