"use client";

export default function MarkdownExport({ result }) {
  function buildMarkdown() {
    return [
      `# ${result.companyName}`,
      `> Analyse générée par [Konsole Analyzer](https://konsole-analyzer.vercel.app) le ${new Date().toLocaleDateString("fr-FR")}`,
      "",
      `## Informations`,
      `| Champ | Valeur |`,
      `|---|---|`,
      `| URL | ${result.url} |`,
      `| Secteur | ${result.sector} |`,
      result.companySize ? `| Taille | ${result.companySize} |` : null,
      result.linkedIn ? `| LinkedIn | ${result.linkedIn} |` : null,
      "",
      `## Description`,
      result.description,
      "",
      `## Score de fit B2B SaaS : ${result.score}/100 — ${result.scoreLabel}`,
      "",
      `### Détail des critères`,
      ...result.scoreBreakdown.map((b) => `- **${b.label}** : +${b.points} pts`),
      "",
      `## Tech stack détectée`,
      result.techStack.length ? result.techStack.map((t) => `\`${t}\``).join(", ") : "_Aucune technologie détectée_",
      "",
      `## Signaux GTM`,
      ...result.gtmSignals.map((s) => `- ${s}`),
      "",
      `## Recommandations`,
      `**${result.recommendations?.strategy?.priority}** — ${result.recommendations?.strategy?.timing}`,
      "",
      result.recommendations?.strategy?.approach,
      "",
      ...(result.recommendations?.signalActions ?? []).map((a, i) => `${i + 1}. ${a}`),
      "",
      `---`,
      `_Konsole Analyzer · konsole-analyzer.vercel.app_`,
    ].filter((l) => l !== null).join("\n");
  }

  function handleDownload() {
    const content = buildMarkdown();
    const blob = new Blob([content], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analyse-${result.companyName.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:border-zinc-400 transition-colors"
    >
      <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Exporter .md
    </button>
  );
}
