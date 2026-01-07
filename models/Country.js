import { Schema, models, model } from "mongoose";

const countrySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Country name is required"],
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Country code is required"],
      trim: true,
    },
    nativeName: {
      type: String,
      trim: true,
    },
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
countrySchema.index({ name: 1 });
countrySchema.index({ code: 1 });

  const Country = models.Country || model("Country", countrySchema);

export default Country;
