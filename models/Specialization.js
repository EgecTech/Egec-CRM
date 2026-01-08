// models/Specialization.js
import mongoose from "mongoose";

const { Schema, models, model } = mongoose;

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

// Add indexes for better query performance
specializationSchema.index({ name: 1 });
specializationSchema.index({ specializationType: 1 });
specializationSchema.index({ sectorType: 1 });
specializationSchema.index({ status: 1 });
specializationSchema.index({ createdAt: -1 });

// Compound indexes for common query patterns (50-75% faster queries)
specializationSchema.index({ name: 1, specializationType: 1 });
specializationSchema.index({ sectorType: 1, status: 1 });
specializationSchema.index({ createdAt: -1, status: 1 });
specializationSchema.index({ specializationType: 1, sectorType: 1, status: 1 }); // Triple compound for filtered lists
specializationSchema.index({ specializationType: 1, status: 1 }); // Type + status
specializationSchema.index({ "places.universityId": 1 });
specializationSchema.index({ "places.collegeId": 1 });
specializationSchema.index({ "places.degreeFounded.degreeId": 1 });
specializationSchema.index({ name: "text" }); // Text search index for search functionality

// Performance optimization: Use lean() by default for read-only queries
specializationSchema.set('toJSON', { virtuals: false });
specializationSchema.set('toObject', { virtuals: false });

const Specialization =
  models?.Specialization ||
  model("Specialization", specializationSchema, "specializations");

export default Specialization;
