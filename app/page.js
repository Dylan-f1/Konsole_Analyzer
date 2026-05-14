"use client";

import { useState, useEffect } from "react";
import URLInput from "@/components/URLInput";
import LoadingSteps from "@/components/LoadingSteps";
import CompanyCard from "@/components/CompanyCard";
import TechStackBadges from "@/components/TechStackBadges";
import GTMSignals from "@/components/GTMSignals";
import ScoringWidget from "@/components/ScoringWidget";

const HISTORY_KEY = "konsole_history";
const HISTORY_MAX = 5;

function loadHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveToHistory(result) {
  const history = loadHistory();
  const filtered = history.filter((h) => h.url !== result.url);
  const updated = [{ url: result.url, companyName: result.companyName, score: result.score, scoreLabel: result.scoreLabel, favicon: result.favicon }, ...filtered].slice(0, HISTORY_MAX);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  return updated;
}

export default function Home() {
  const [state, setState] = useState("idle");
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  async function handleSubmit(rawUrl) {
    setState("loading");
    setResult(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: rawUrl }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error ?? "Une erreur est survenue");
        setState("error");
        return;
      }

      setResult(data);
      setState("result");
      setHistory(saveToHistory(data));
    } catch {
      setErrorMsg("Impossible de contacter le serveur d'analyse");
      setState("error");
    }
  }

  const SCORE_COLOR = {
    "Fort fit": "text-green-600",
    "Fit moyen": "text-yellow-600",
    "Faible fit": "text-red-500",
  };

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-16">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Konsole Analyzer</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Analysez n&apos;importe quel site et obtenez des insights B2B actionnables.
          </p>
        </div>

        {/* Input */}
        <URLInput onSubmit={handleSubmit} loading={state === "loading"} />

        {/* Historique */}
        {history.length > 0 && state === "idle" && (
          <div className="mt-6">
            <p className="text-xs font-medium text-zinc-400 mb-2 uppercase tracking-wide">Analyses récentes</p>
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
        {state === "loading" && (
          <div className="mt-8">
            <LoadingSteps />
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            <p className="font-medium">Analyse impossible</p>
            <p className="mt-1 text-red-600">{errorMsg}</p>
            <button
              onClick={() => setState("idle")}
              className="mt-3 text-xs underline text-red-500"
            >
              Réessayer
            </button>
          </div>
        )}

        {/* Result */}
        {state === "result" && result && (
          <div className="mt-8 flex flex-col gap-4">
            {result.fromCache && (
              <p className="text-xs text-zinc-400 text-right">Résultat servi depuis le cache</p>
            )}
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
              scoreBreakdown={result.scoreBreakdown}
            />
            <TechStackBadges techStack={result.techStack} />
            <GTMSignals gtmSignals={result.gtmSignals} />
            <button
              onClick={() => setState("idle")}
              className="text-sm text-zinc-400 hover:text-zinc-700 underline text-center"
            >
              Analyser un autre site
            </button>
          </div>
        )}

      </div>
    </main>
  );
}
