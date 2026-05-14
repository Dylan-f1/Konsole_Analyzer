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
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
