"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import ExportButton from "@/components/ExportButton";
import CompanyCard from "@/components/CompanyCard";
import TechStackBadges from "@/components/TechStackBadges";
import GTMSignals from "@/components/GTMSignals";

function AnalysisPanel({ analysis, onClose }) {
  if (!analysis) return null;

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="w-full max-w-lg bg-zinc-50 shadow-2xl flex flex-col overflow-hidden">
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            {analysis.favicon && (
              <img src={analysis.favicon} alt="" width={20} height={20} className="rounded object-contain" onError={(e) => e.target.style.display = "none"} />
            )}
            <span className="font-semibold text-zinc-900 text-sm">{analysis.companyName}</span>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton analyses={analysis} />
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-700 transition-colors"
              aria-label="Fermer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Panel content */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          <CompanyCard
            companyName={analysis.companyName}
            description={analysis.description}
            sector={analysis.sector}
            url={analysis.url}
            favicon={analysis.favicon}
            linkedIn={analysis.linkedIn}
            companySize={analysis.companySize}
          />
          <TechStackBadges techStack={analysis.techStack} />
          <GTMSignals gtmSignals={analysis.gtmSignals} />

          {/* Meta */}
          <div className="text-xs text-zinc-400 pt-1 flex items-center justify-between">
            <span>
              Analysé par <span className="text-zinc-600">{analysis.analyzedBy?.name ?? "—"}</span>
            </span>
            <span>
              {new Date(analysis.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>

        {/* Re-analyze footer */}
        <div className="shrink-0 px-5 py-4 border-t border-zinc-200 bg-white">
          <Link
            href={`/?url=${encodeURIComponent(analysis.url)}`}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
          >
            Relancer l&apos;analyse →
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function HistoryPage() {
  const [analyses, setAnalyses]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pages, setPages]           = useState(1);
  const [total, setTotal]           = useState(0);
  const [selected, setSelected]     = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res  = await fetch(`/api/history?page=${page}&limit=20`);
      const data = await res.json();
      setAnalyses(data.analyses ?? []);
      setPages(data.pages ?? 1);
      setTotal(data.total ?? 0);
      setLoading(false);
    }
    load();
  }, [page]);

  // Close panel on Escape
  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setSelected(null); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Historique des analyses</h1>
            {!loading && <p className="text-sm text-zinc-400 mt-0.5">{total} analyse{total !== 1 ? "s" : ""} au total</p>}
          </div>
          <div className="flex items-center gap-2">
            {analyses.length > 0 && (
              <ExportButton analyses={analyses} label="Exporter CSV" filename={`konsole-historique-${new Date().toISOString().slice(0,10)}.csv`} />
            )}
            <Link href="/" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
              + Nouvelle analyse
            </Link>
          </div>
        </div>

        {loading && (
          <div className="flex flex-col gap-2">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-zinc-200 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && analyses.length === 0 && (
          <div className="text-center py-20 text-zinc-400">
            <p className="text-sm">Aucune analyse pour l&apos;instant.</p>
            <Link href="/" className="mt-3 inline-block text-sm underline text-zinc-500 hover:text-zinc-700">
              Analyser un premier site
            </Link>
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <>
            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Entreprise</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Secteur</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide hidden md:table-cell">Analysé par</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Date</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {analyses.map((a) => (
                    <tr
                      key={a._id}
                      className={`border-b border-zinc-50 last:border-0 transition-colors ${selected?._id === a._id ? "bg-zinc-100" : "hover:bg-zinc-50"}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          {a.favicon && (
                            <img src={a.favicon} alt="" width={20} height={20} className="rounded object-contain shrink-0" onError={(e) => e.target.style.display = "none"} />
                          )}
                          <div>
                            <p className="font-medium text-zinc-900">{a.companyName}</p>
                            <p className="text-xs text-zinc-400 truncate max-w-[200px]">{a.url}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{a.sector ?? "—"}</td>
                      <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">{a.analyzedBy?.name ?? "—"}</td>
                      <td className="px-4 py-3 text-zinc-400 text-xs hidden sm:table-cell whitespace-nowrap">
                        {new Date(a.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setSelected(selected?._id === a._id ? null : a)}
                          className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors whitespace-nowrap"
                        >
                          {selected?._id === a._id ? "Fermer" : "Voir →"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:border-zinc-400 disabled:opacity-40 transition-colors">
                  ← Précédent
                </button>
                <span className="text-sm text-zinc-400">{page} / {pages}</span>
                <button onClick={() => setPage((p) => Math.min(pages, p + 1))} disabled={page === pages} className="px-3 py-1.5 rounded-lg border border-zinc-200 text-sm text-zinc-600 hover:border-zinc-400 disabled:opacity-40 transition-colors">
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <AnalysisPanel analysis={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
