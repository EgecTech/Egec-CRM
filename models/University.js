// models/University.js

const { Schema, models, model } = require("mongoose");

const universitySchema = new Schema(
  {
    // Core CRM fields
    name: { type: String, required: true },
    country: { type: String, required: true },

    // Colleges - simplified for CRM (just names, no degree details)
    colleges: [
      {
        collegeName: { type: String, required: true }
      },
    ],
  },
  { timestamps: true }
);

// CRM-focused indexes for better query performance
universitySchema.index({ name: 1 });
universitySchema.index({ country: 1 });
universitySchema.index({ name: "text" }); // Text search index

// Performance optimization: Use lean() by default for read-only queries
universitySchema.set('toJSON', { virtuals: false });
universitySchema.set('toObject', { virtuals: false });

const University = models?.University || model("University", universitySchema, "universities");

export default University;
