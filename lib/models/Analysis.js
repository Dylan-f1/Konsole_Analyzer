import mongoose from "mongoose";

const AnalysisSchema = new mongoose.Schema(
  {
    url:         { type: String, required: true, index: true },
    companyName: { type: String, default: "Inconnu" },
    favicon:     { type: String, default: null },
    sector:      { type: String, default: "Inconnu" },
    companySize: { type: String, default: null },
    description: { type: String, default: null },
    linkedIn:    { type: String, default: null },
    techStack:   [String],
    gtmSignals:  [{ label: String, url: String }],
    score:       { type: Number, required: true },
    scoreLabel:  { type: String, required: true },
    status:      { type: String, required: true }, // ideal | strong | watch | early | out
    scoreBreakdown: mongoose.Schema.Types.Mixed,
    recommendations: mongoose.Schema.Types.Mixed,
    icp:         { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true, // createdAt + updatedAt automatiques
  }
);

// Index pour le cache : retrouver vite la dernière analyse d'une URL
AnalysisSchema.index({ url: 1, createdAt: -1 });

export default mongoose.models.Analysis ?? mongoose.model("Analysis", AnalysisSchema);
