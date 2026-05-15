"use client";

import { downloadCsv } from "@/lib/exportCsv";

export default function ExportButton({ analyses, label = "Exporter CSV", filename }) {
  // Accept either a single analysis object or an array
  const data = Array.isArray(analyses) ? analyses : [analyses];

  function handleExport() {
    const name = filename ?? `konsole-${data.length === 1 ? new URL(data[0].url).hostname : "batch"}-${new Date().toISOString().slice(0, 10)}.csv`;
    downloadCsv(data, name);
  }

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm hover:border-zinc-400 transition-colors"
    >
      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      {label}
    </button>
  );
}
