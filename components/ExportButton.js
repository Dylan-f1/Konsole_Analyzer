"use client";

import { useState } from "react";

export default function ExportButton({ result }) {
  const [copied, setCopied] = useState(false);

  function buildText() {
    const lines = [
      `# ${result.companyName}`,
      `URL : ${result.url}`,
      `Secteur : ${result.sector}`,
      result.companySize ? `Taille : ${result.companySize}` : null,
      result.linkedIn ? `LinkedIn : ${result.linkedIn}` : null,
      "",
      `Description : ${result.description}`,
      "",
      `## Score fit B2B SaaS : ${result.score}/100 — ${result.scoreLabel}`,
      ...result.scoreBreakdown.map((b) => `  • ${b.label} (+${b.points} pts)`),
      "",
      `## Tech stack détectée`,
      result.techStack.length ? result.techStack.join(", ") : "Aucune",
      "",
      `## Signaux GTM`,
      ...result.gtmSignals.map((s) => `  • ${s}`),
      "",
      `## Recommandations`,
      result.recommendations?.strategy?.approach ?? "",
      ...(result.recommendations?.signalActions ?? []).map((a, i) => `  ${i + 1}. ${a}`),
      "",
      `---`,
      `Généré par Konsole Analyzer — konsole-analyzer.vercel.app`,
    ].filter((l) => l !== null);

    return lines.join("\n");
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback pour les navigateurs sans clipboard API
      const el = document.createElement("textarea");
      el.value = buildText();
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:border-zinc-400 transition-colors"
    >
      {copied ? (
        <>
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copié !
        </>
      ) : (
        <>
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copier le rapport
        </>
      )}
    </button>
  );
}
