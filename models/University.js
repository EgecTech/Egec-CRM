// models/University.js

const { Schema, models, model } = require("mongoose");

const universitySchema = new Schema(
  {
    name: { type: String, required: true },
    country: { type: String, required: true },
    email: { type: String },
    establishment: { type: String },
    website: { type: String },
    phone: { type: String },
    location: { type: String },
    universityType: { type: String },
    contract: { type: String },
    images: [{ type: String }],
    status: { type: String },
    timesRanking: { type: Number }, // تصنيف التايمز
    cwurRanking: { type: Number }, // تصنيف CWUR
    shanghaiRanking: { type: Number }, // تصنيف شنغهاي
    qsRanking: { type: Number }, // تصنيف QS
    accreditation: { type: String },
    accreditationCountries: [{ type: String }],
    universityConditions: { type: String },
    colleges: [
      {
        collegeId: { type: Schema.Types.ObjectId, ref: "College" },
        collegeName: { type: String, required: true },
        bachelorRate: {
          type: Number,
          min: 0,
          max: 100,
        },
        masterRate: {
          type: String,
          enum: ["امتياز", "جيد جدًا", "جيد", "مقبول"],
        },
        doctorateRate: {
          type: String,
          enum: ["امتياز", "جيد جدًا", "جيد", "مقبول"],
        },
      },
    ],
  },
  { timestamps: true }
);

export const University =
  models.University || model("University", universitySchema, "universities");
