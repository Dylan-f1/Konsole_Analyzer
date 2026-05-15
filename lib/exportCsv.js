// Converts an array of analysis objects to a CSV string
// Column names match HubSpot / Salesforce standard import format

const COLUMNS = [
  { header: "Company name",          key: (r) => r.companyName ?? "" },
  { header: "Website URL",           key: (r) => r.url ?? "" },
  { header: "Industry",              key: (r) => r.sector ?? "" },
  { header: "Company size",          key: (r) => r.companySize ?? "" },
  { header: "Description",           key: (r) => r.description ?? "" },
  { header: "LinkedIn Company Page", key: (r) => r.linkedIn ?? "" },
  { header: "Tech stack",            key: (r) => (r.techStack ?? []).join(", ") },
  { header: "Detected signals",      key: (r) => (r.gtmSignals ?? []).map((s) => s?.label ?? s).join(" | ") },
  { header: "Analyzed by",          key: (r) => r.analyzedBy?.name ?? "" },
  { header: "Analysis date",         key: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString("fr-FR") : "" },
];

function escapeCell(value) {
  const str = String(value ?? "");
  // Wrap in quotes if contains comma, newline or quote
  if (str.includes(",") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function toCsvString(analyses) {
  const header = COLUMNS.map((c) => escapeCell(c.header)).join(",");
  const rows   = analyses.map((r) => COLUMNS.map((c) => escapeCell(c.key(r))).join(","));
  return [header, ...rows].join("\n");
}

export function downloadCsv(analyses, filename = "konsole-export.csv") {
  const csv  = toCsvString(analyses);
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" }); // BOM for Excel
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
