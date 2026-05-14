import mongoose from "mongoose";

// A URL being actively monitored for changes
const WatchSchema = new mongoose.Schema(
  {
    url:         { type: String, required: true, unique: true },
    companyName: { type: String, default: "Unknown" },
    favicon:     { type: String, default: null },
    watchedBy:   [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Snapshot of last known state — used to detect changes
    lastSnapshot: {
      techStack:       [String],
      gtmSignalLabels: [String], // store labels only for comparison
      hasLinkedIn:     Boolean,
      hasFunding:      Boolean,
    },

    lastCheckedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Watch ?? mongoose.model("Watch", WatchSchema);
