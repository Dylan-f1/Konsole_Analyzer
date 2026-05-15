"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Récupération du site...",
  "Détection de la stack technique...",
  "Analyse en cours...",
];

export default function LoadingSteps() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (current >= STEPS.length - 1) return;
    const timer = setTimeout(() => setCurrent((c) => c + 1), 2500);
    return () => clearTimeout(timer);
  }, [current]);

  return (
    <div className="flex flex-col gap-3 py-6">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <div key={step} className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${i > current ? "opacity-30" : "opacity-100"}`}>
            <span className="w-5 h-5 flex items-center justify-center">
              {done ? (
                <svg className="text-green-500 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : active ? (
                <span className="w-3 h-3 rounded-full bg-zinc-900 animate-pulse" />
              ) : (
                <span className="w-3 h-3 rounded-full border border-zinc-300" />
              )}
            </span>
            <span className={active ? "font-medium text-zinc-900" : done ? "text-zinc-400 line-through" : "text-zinc-400"}>
              {step}
            </span>
          </div>
        );
      })}
    </div>
  );
}
