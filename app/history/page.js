"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const STATUS_CONFIG = {
  ideal:  { label: "Cible idéale",   badge: "bg-emerald-100 text-emerald-700", emoji: "🎯" },
  strong: { label: "Fort potentiel", badge: "bg-green-100 text-green-700",     emoji: "🟢" },
  watch:  { label: "À surveiller",   badge: "bg-yellow-100 text-yellow-700",   emoji: "👀" },
  early:  { label: "Trop tôt",       badge: "bg-orange-100 text-orange-700",   emoji: "⏳" },
  out:    { label: "Hors cible",     badge: "bg-red-100 text-red-700",         emoji: "❌" },
};

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function HistoryPage() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function fetchHistory(p = 1) {
    setLoading(true);
    try {
      const res = await fetch(`/api/history?page=${p}&limit=20`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAnalyses(data.analyses);
      setTotalPages(data.pages);
      setTotal(data.total);
      setPage(p);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchHistory(); }, []);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-3xl px-4 py-10 flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Historique des analyses</h1>
            {!loading && <p className="text-sm text-zinc-500 mt-1">{total} analyse{total > 1 ? "s" : ""} au total</p>}
          </div>
          <Link href="/" className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors">
            + Nouvelle analyse
          </Link>
        </div>

        {loading && (
          <div className="flex flex-col gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-zinc-200 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            Impossible de charger l&apos;historique : {error}
          </div>
        )}

        {!loading && !error && analyses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-400 text-sm">Aucune analyse encore effectuée.</p>
            <Link href="/" className="mt-4 inline-block text-sm font-medium text-zinc-700 underline">
              Analyser votre premier prospect →
            </Link>
          </div>
        )}

        {!loading && analyses.length > 0 && (
          <div className="flex flex-col gap-3">
            {analyses.map((a) => {
              const statusConf = STATUS_CONFIG[a.status] ?? STATUS_CONFIG["out"];
              return (
                <Link
                  key={a._id}
                  href={`/analysis/${a._id}`}
                  className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm hover:border-zinc-400 hover:shadow-md transition-all"
                >
                  {a.favicon && (
                    <img
                      src={a.favicon}
                      alt=""
                      width={36}
                      height={36}
                      className="rounded-lg border border-zinc-100 object-contain shrink-0"
                      onError={(e) => e.target.style.display = "none"}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-zinc-900 truncate">{a.companyName}</p>
                    <p className="text-xs text-zinc-400 truncate">{a.url}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 ${statusConf.badge}`}>
                      {statusConf.emoji} {a.scoreLabel}
                    </span>
                    <span className="text-xs text-zinc-400">{formatDate(a.createdAt)}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => fetchHistory(page - 1)}
              disabled={page <= 1}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40 hover:border-zinc-400 transition-colors"
            >
              ← Précédent
            </button>
            <span className="text-sm text-zinc-500">{page} / {totalPages}</span>
            <button
              onClick={() => fetchHistory(page + 1)}
              disabled={page >= totalPages}
              className="rounded-lg border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-700 disabled:opacity-40 hover:border-zinc-400 transition-colors"
            >
              Suivant →
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
