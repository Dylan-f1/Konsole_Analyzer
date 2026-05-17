import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    email:        { type: String, required: true, unique: true, lowercase: true },
    password:     { type: String, required: true }, // bcrypt hash
    role:         { type: String, enum: ["admin", "gtm_engineer"], default: "gtm_engineer" },
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.models.User ?? mongoose.model("User", UserSchema);
