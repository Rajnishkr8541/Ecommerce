const mongoose = require("mongoose");
const { ROLES } = require("../config/constants");

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: {
      type: String,
      enum: [ROLES.ADMIN, ROLES.USER],
      default: ROLES.USER
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
