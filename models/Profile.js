
const { Schema, models, model } = require("mongoose");

const ProfileSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    sessionVersion: { type: Number, default: 1 },
    userData: [],
    userImage:{ type: String },
    userPhone: { type: String },
    role: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

export const Profile =
  models.Profile || model("Profile", ProfileSchema, "frontenduser");
