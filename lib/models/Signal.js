import mongoose from "mongoose";

// A change detected on a watched URL
const SignalSchema = new mongoose.Schema(
  {
    organization: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    url:          { type: String, required: true },
    companyName: { type: String, default: "Unknown" },
    favicon:     { type: String, default: null },

    type:    {
      type: String,
      enum: ["new_tech", "removed_tech", "new_signal", "funding", "linkedin"],
      required: true,
    },
    message: { type: String, required: true }, // human-readable description

    // Users who have already seen this signal
    seenBy:  [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

SignalSchema.index({ url: 1, createdAt: -1 });

export default mongoose.models.Signal ?? mongoose.model("Signal", SignalSchema);
