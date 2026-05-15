import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    url:         { type: String, required: true },
    companyName: { type: String, default: "Unknown" },
    favicon:     { type: String, default: null },
    sector:      { type: String, default: "Unknown" },
    companySize: { type: String, default: null },
    description: { type: String, default: null },
    linkedIn:    { type: String, default: null },
    techStack:   [String],
    gtmSignals:  [String],
    analyzedBy:  { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Index for fast lookups by URL and recent analyses
AnalysisSchema.index({ url: 1, createdAt: -1 });
AnalysisSchema.index({ analyzedBy: 1 });

export default mongoose.models.Analysis ?? mongoose.model("Analysis", AnalysisSchema);
