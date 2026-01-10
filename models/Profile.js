
const { Schema, models, model } = require("mongoose");

const ProfileSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    sessionVersion: { type: Number, default: 1 },
    userData: [],
    userImage: { type: String },
    userPhone: { type: String },
    role: { type: String },
    isActive: { type: Boolean, default: true },

    // Security: Account lockout mechanism
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date, default: null },
    lastFailedLogin: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

export const Profile =
  models.Profile || model("Profile", ProfileSchema, "frontenduser");
