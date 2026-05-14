"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import URLInput from "@/components/URLInput";
import LoadingSteps from "@/components/LoadingSteps";
import CompanyCard from "@/components/CompanyCard";
import TechStackBadges from "@/components/TechStackBadges";
import GTMSignals from "@/components/GTMSignals";
import ScoringWidget from "@/components/ScoringWidget";
import ICPPanel from "@/components/ICPPanel";
import ActionRecommendations from "@/components/ActionRecommendations";
import ExportButton from "@/components/ExportButton";
import MarkdownExport from "@/components/MarkdownExport";
import Link from "next/link";

const HISTORY_KEY = "konsole_history";
const HISTORY_MAX = 5;
const ICP_KEY = "konsole_icp";
const DEFAULT_ICP = { sector: "all", size: "all", market: "any" };

const STATS = [
  { value: "30+", label: "Technologies détectées" },
  { value: "< 5s", label: "Temps d'analyse" },
  { value: "10+", label: "Signaux GTM" },
  { value: "100 pts", label: "Score de fit B2B" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Entrez une URL", desc: "N'importe quel site web — domaine seul ou URL complète." },
  { step: "02", title: "On analyse tout", desc: "Scraping, détection de stack, analyse LLM — en quelques secondes." },
  { step: "03", title: "Passez à l'action", desc: "Score de fit, signaux GTM et recommandations sales prêts à l'emploi." },
];

const USE_CASES = [
  {
    icon: "🎯",
    title: "Qualification de leads",
    desc: "Triez une liste de 100 prospects par score de fit en quelques minutes, pas en quelques jours.",
  },
  {
    icon: "✉️",
    title: "Outreach personnalisé",
    desc: "Utilisez la tech stack détectée pour personnaliser chaque message : 'J'ai vu que vous utilisez HubSpot...'",
  },
  {
    icon: "📊",
    title: "Priorisation pipeline",
    desc: "Concentrez votre énergie commerciale sur les comptes à fort fit ICP. Arrêtez de perdre du temps sur des leads hors cible.",
  },
];

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]"); }
  catch { return []; }
}

function saveToHistory(result) {
  const history = loadHistory();
  const filtered = history.filter((h) => h.url !== result.url);
  const updated = [
    { url: result.url, companyName: result.companyName, score: result.score, scoreLabel: result.scoreLabel, favicon: result.favicon },
    ...filtered,
  ].slice(0, HISTORY_MAX);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

const SCORE_COLOR = {
  "Fort fit": "text-green-600",
  "Fit moyen": "text-yellow-600",
  "Faible fit": "text-red-500",
};

export default function Home() {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [history, setHistory] = useState([]);
  const [icp, setIcp] = useState(DEFAULT_ICP);

  useEffect(() => {
    setHistory(loadHistory());
    try {
      const saved = JSON.parse(localStorage.getItem(ICP_KEY));
      if (saved) setIcp(saved);
    } catch {}
  }, []);

  function handleIcpChange(newIcp) {
    setIcp(newIcp);
    localStorage.setItem(ICP_KEY, JSON.stringify(newIcp));
  }

  async function handleSubmit(rawUrl) {
    setState("loading");
    setResult(null);
    setErrorMsg(null);
    window.scrollTo({ top: 0, behavior: "smooth" });

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl, icp }),
      });

      const data = await res.json();
      if (!res.ok) { setErrorMsg(data.error ?? "Une erreur est survenue"); setState("error"); return; }
      setResult(data);
      setState("result");
      setHistory(saveToHistory(data));
    } catch {
      setErrorMsg("Impossible de contacter le serveur d'analyse");
      setState("error");
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      {/* ── HERO ── */}
      <section className="bg-zinc-900 px-4 pt-16 pb-12">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-zinc-800 border border-zinc-700 px-3 py-1 text-xs font-medium text-zinc-400 mb-5">
            Revenue Engineering · Prospect Intelligence
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-3">
            Qualifiez vos prospects<br />en 30 secondes
          </h1>
          <p className="text-zinc-400 text-base mb-8 max-w-lg mx-auto leading-relaxed">
            Transformez n&apos;importe quelle URL en fiche prospect complète —
            tech stack, signaux GTM, score de fit B2B SaaS et recommandations sales actionnables.
          </p>

          <URLInput onSubmit={handleSubmit} loading={state === "loading"} />

          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <span className="text-xs text-zinc-500 self-center">Essayez :</span>
            {["stripe.com", "notion.so", "linear.app", "lemonde.fr"].map((site) => (
              <button
                key={site}
                onClick={() => handleSubmit(site)}
                className="rounded-full border border-zinc-700 px-3 py-1 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
              >
                {site}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mx-auto max-w-2xl mt-12 grid grid-cols-2 sm:grid-cols-4 gap-px bg-zinc-800 rounded-xl overflow-hidden border border-zinc-800">
          {STATS.map(({ value, label }) => (
            <div key={label} className="bg-zinc-900 px-4 py-4 text-center">
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── OUTIL ── */}
      <section className="mx-auto w-full max-w-2xl px-4 py-8">

        {/* ICP Panel */}
        {(state === "idle" || state === "result") && (
          <div className="mb-6">
            <ICPPanel icp={icp} onChange={handleIcpChange} />
          </div>
        )}

        {/* Historique */}
        {history.length > 0 && state === "idle" && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Analyses récentes</p>
            <div className="flex flex-col gap-2">
              {history.map((h) => (
                <button
                  key={h.url}
                  onClick={() => handleSubmit(h.url)}
                  className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 py-2.5 text-left hover:border-zinc-400 transition-colors"
                >
                  {h.favicon && (
                    <img src={h.favicon} alt="" width={18} height={18} className="rounded object-contain" onError={(e) => e.target.style.display = "none"} />
                  )}
                  <span className="flex-1 text-sm text-zinc-700 truncate">{h.companyName}</span>
                  <span className={`text-xs font-semibold shrink-0 ${SCORE_COLOR[h.scoreLabel] ?? "text-zinc-400"}`}>
                    {h.score}/100
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading */}
        {state === "loading" && <LoadingSteps />}

        {/* Error */}
        {state === "error" && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-medium">Analyse impossible</p>
            <p className="mt-1 text-red-600">{errorMsg}</p>
            <button onClick={() => setState("idle")} className="mt-3 text-xs underline text-red-500">Réessayer</button>
          </div>
        )}

        {/* Result */}
        {state === "result" && result && (
          <div className="flex flex-col gap-4">
            {result.fromCache && <p className="text-xs text-zinc-400 text-right">Résultat depuis le cache</p>}
            <CompanyCard
              companyName={result.companyName}
              description={result.description}
              sector={result.sector}
              url={result.url}
              favicon={result.favicon}
              linkedIn={result.linkedIn}
              companySize={result.companySize}
            />
            <ScoringWidget
              score={result.score}
              scoreLabel={result.scoreLabel}
              status={result.status}
              scoreBreakdown={result.scoreBreakdown}
              icp={icp}
            />
            <ActionRecommendations recommendations={result.recommendations} />
            <TechStackBadges techStack={result.techStack} />
            <GTMSignals gtmSignals={result.gtmSignals} />
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <ExportButton result={result} />
              <MarkdownExport result={result} />
            </div>
            <button onClick={() => setState("idle")} className="text-sm text-zinc-400 hover:text-zinc-700 underline text-center">
              Analyser un autre site
            </button>
          </div>
        )}
      </section>

      {/* ── COMMENT ÇA MARCHE ── */}
      {state === "idle" && (
        <>
          <section className="border-t border-zinc-200 bg-white px-4 py-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-zinc-900 text-center mb-10">Comment ça marche</h2>
              <div className="grid sm:grid-cols-3 gap-8">
                {HOW_IT_WORKS.map(({ step, title, desc }) => (
                  <div key={step} className="flex flex-col gap-3">
                    <span className="text-3xl font-black text-zinc-200">{step}</span>
                    <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CAS D'USAGE ── */}
          <section className="bg-zinc-50 border-t border-zinc-200 px-4 py-16">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-2xl font-bold text-zinc-900 text-center mb-3">Pour les équipes sales B2B</h2>
              <p className="text-sm text-zinc-500 text-center mb-10 max-w-md mx-auto">
                Un BDR passe en moyenne 15 à 30 min par prospect à faire de la recherche manuelle.
                Konsole Analyzer réduit ça à 30 secondes.
              </p>
              <div className="grid sm:grid-cols-3 gap-6">
                {USE_CASES.map(({ icon, title, desc }) => (
                  <div key={title} className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
                    <span className="text-2xl mb-3 block">{icon}</span>
                    <h3 className="text-sm font-semibold text-zinc-900 mb-2">{title}</h3>
                    <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── CTA FINAL ── */}
          <section className="bg-zinc-900 px-4 py-16 text-center">
            <div className="mx-auto max-w-lg">
              <h2 className="text-2xl font-bold text-white mb-3">Prêt à qualifier plus vite ?</h2>
              <p className="text-zinc-400 text-sm mb-6">Gratuit, aucune inscription requise. Entrez simplement une URL.</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-zinc-900 hover:bg-zinc-100 transition-colors"
              >
                Analyser un prospect →
              </button>
            </div>
          </section>
        </>
      )}

      <Footer />
    </div>
  );
}
