import mongoose from "mongoose";

const OrganizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
  },
  { timestamps: true }
);

if (process.env.NODE_ENV !== "production" && mongoose.models.Organization) {
  delete mongoose.models.Organization;
}

export default mongoose.models.Organization ?? mongoose.model("Organization", OrganizationSchema);
