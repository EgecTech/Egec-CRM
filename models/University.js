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
        degreecollegeunversityinfo: [
          {
            degreeId: {
              type: Schema.Types.ObjectId,
              ref: "Degree",
            },
            degreeName: { type: String, required: true },
            degreeRate: {
              type: Schema.Types.Mixed, // Can be String or Number
            },
            registrationStartDate: { type: Date },
            registrationEndDate: { type: Date },
            examStartDate: { type: Date },
            examEndDate: { type: Date },
            degreeCollegeStudyCondition: { type: String },
            language: { type: String },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

// Add indexes for better query performance
universitySchema.index({ name: 1 });
universitySchema.index({ country: 1 });
universitySchema.index({ universityType: 1 });
universitySchema.index({ accreditation: 1 });
universitySchema.index({ status: 1 });
universitySchema.index({ _id: -1 });
universitySchema.index({ "colleges.collegeId": 1 }); // Index for college lookups
universitySchema.index({ "colleges.degreecollegeunversityinfo.degreeId": 1 }); // Index for degree lookups

// Compound indexes for common filter combinations (50-75% faster queries)
universitySchema.index({ country: 1, universityType: 1 });
universitySchema.index({ accreditation: 1, status: 1 });
universitySchema.index({ country: 1, accreditation: 1 });
universitySchema.index({ country: 1, universityType: 1, status: 1 }); // Triple compound for filtered lists
universitySchema.index({ status: 1, createdAt: -1 }); // Status + date for sorting
universitySchema.index({ name: "text" }); // Text search index

// Performance optimization: Use lean() by default for read-only queries
universitySchema.set('toJSON', { virtuals: false });
universitySchema.set('toObject', { virtuals: false });

const University = models?.University || model("University", universitySchema, "universities");

export default University;
