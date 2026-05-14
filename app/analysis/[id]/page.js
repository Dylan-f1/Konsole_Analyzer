"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CompanyCard from "@/components/CompanyCard";
import ScoringWidget from "@/components/ScoringWidget";
import ActionRecommendations from "@/components/ActionRecommendations";
import TechStackBadges from "@/components/TechStackBadges";
import GTMSignals from "@/components/GTMSignals";
import ExportButton from "@/components/ExportButton";
import MarkdownExport from "@/components/MarkdownExport";

function ShareButton({ id }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = `${window.location.origin}/analysis/${id}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm hover:border-zinc-400 transition-colors"
    >
      {copied ? (
        <><svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Lien copié !</>
      ) : (
        <><svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg> Partager</>
      )}
    </button>
  );
}

export default function AnalysisPage() {
  const { id } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/analysis/${id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAnalysis(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />
      <main className="mx-auto w-full max-w-2xl px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <Link href="/history" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Historique
          </Link>
          {analysis && <ShareButton id={id} />}
        </div>

        {loading && (
          <div className="flex flex-col gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-zinc-200 animate-pulse" />)}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-medium">Analyse introuvable</p>
            <p className="mt-1">{error}</p>
            <Link href="/" className="mt-3 inline-block text-xs underline text-red-500">Retour à l&apos;accueil</Link>
          </div>
        )}

        {analysis && (
          <div className="flex flex-col gap-4">
            <CompanyCard
              companyName={analysis.companyName}
              description={analysis.description}
              sector={analysis.sector}
              url={analysis.url}
              favicon={analysis.favicon}
              linkedIn={analysis.linkedIn}
              companySize={analysis.companySize}
            />
            <ScoringWidget
              score={analysis.score}
              scoreLabel={analysis.scoreLabel}
              status={analysis.status}
              scoreBreakdown={analysis.scoreBreakdown}
              icp={analysis.icp}
            />
            <ActionRecommendations recommendations={analysis.recommendations} />
            <TechStackBadges techStack={analysis.techStack} />
            <GTMSignals gtmSignals={analysis.gtmSignals} />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <ExportButton result={analysis} />
              <MarkdownExport result={analysis} />
              <ShareButton id={id} />
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
