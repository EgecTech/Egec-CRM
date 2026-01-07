// const { Schema, models, model } = require("mongoose");

// const ProfileSchema = new Schema(
//   {
//     email: { type: String },
//     password: { type: String },
//     sessionVersion: { type: Number, default: 1 }, // ✅ add this line
//   },
//   {
//     timestamps: true,
//   }
// );

// export const Profile =
//   models.Profile || model("Profile", ProfileSchema, "admin");



const { Schema, models, model } = require("mongoose");

const ProfileSchema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    password: { type: String },
    sessionVersion: { type: Number, default: 1 }, // ✅ add this line
    userData: [],
    userImage:{ type: String },
    userPhone: { type: String },
    role: { type: String },
  },
  {
    timestamps: true,
  }
);

export const Profile =
  models.Profile || model("Profile", ProfileSchema, "admin");
