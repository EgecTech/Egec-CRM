import { Schema, models, model } from "mongoose";

const collegeSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "College name is required"],
      trim: true,
    },
    sector: {
      type: String,
      required: [true, "Sector is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    details: [
      {
        universityId: {
          type: Schema.Types.ObjectId,
          ref: "University",
          required: true,
        },
        universityName: { type: String, required: true, trim: true },
        acceptanceRate: { type: Number, required: true, min: 0, max: 100 },
        requirements: { type: String, trim: true, maxlength: 2000 },
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add indexes for better query performance
collegeSchema.index({ name: 1 });
collegeSchema.index({ sector: 1 });

const College = models.College || model("College", collegeSchema);

export default College;
