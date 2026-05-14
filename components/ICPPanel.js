"use client";

import { useState } from "react";

const CRITERIA = [
  {
    key: "sector",
    label: "Secteur cible",
    options: [
      { value: "all",       label: "Tous" },
      { value: "tech",      label: "Tech / SaaS" },
      { value: "fintech",   label: "Fintech" },
      { value: "ecommerce", label: "E-commerce" },
      { value: "health",    label: "Santé" },
    ],
  },
  {
    key: "size",
    label: "Taille cible",
    options: [
      { value: "all",        label: "Toutes" },
      { value: "startup",    label: "Startup < 50" },
      { value: "scaleup",    label: "Scale-up 50-500" },
      { value: "enterprise", label: "Enterprise 500+" },
    ],
  },
  {
    key: "market",
    label: "Marché cible",
    options: [
      { value: "any", label: "Tous" },
      { value: "en",  label: "Anglophone" },
      { value: "fr",  label: "Francophone" },
    ],
  },
  {
    key: "motion",
    label: "Motion de vente",
    options: [
      { value: "any",        label: "Toutes" },
      { value: "selfserve",  label: "Self-serve / PLG" },
      { value: "assisted",   label: "Sales-assisté" },
      { value: "enterprise", label: "Enterprise / Long cycle" },
    ],
  },
];

const DEFAULT_ICP = { sector: "all", size: "all", market: "any", motion: "any" };

function isDefault(icp) {
  return Object.entries(DEFAULT_ICP).every(([k, v]) => (icp[k] ?? v) === v);
}

export default function ICPPanel({ icp, onChange }) {
  const [open, setOpen] = useState(false);
  const custom = !isDefault(icp);

  function update(key, value) {
    onChange({ ...icp, [key]: value });
  }

  function reset() {
    onChange({ ...DEFAULT_ICP });
  }

  return (
    <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm hover:bg-zinc-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="font-medium text-zinc-700">Configurer mon ICP</span>
          {custom && (
            <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-xs text-white font-medium">Personnalisé</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {custom && (
            <span className="text-xs text-zinc-400 hidden sm:block">
              {Object.entries(icp).filter(([k, v]) => DEFAULT_ICP[k] !== v).length} critère(s) actif(s)
            </span>
          )}
          <svg className={`w-4 h-4 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="border-t border-zinc-100 px-5 py-4 flex flex-col gap-5">
          <p className="text-xs text-zinc-400 leading-relaxed">
            Définissez votre profil client idéal — le score et les recommandations s&apos;adaptent automatiquement à votre cible.
          </p>

          {CRITERIA.map(({ key, label, options }) => (
            <div key={key}>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">{label}</p>
              <div className="flex flex-wrap gap-2">
                {options.map(({ value, label: optLabel }) => (
                  <button
                    key={value}
                    onClick={() => update(key, value)}
                    className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                      (icp[key] ?? DEFAULT_ICP[key]) === value
                        ? "bg-zinc-900 text-white border-zinc-900"
                        : "bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    {optLabel}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {custom && (
            <button onClick={reset} className="text-xs text-zinc-400 hover:text-zinc-600 underline text-left w-fit">
              Réinitialiser l&apos;ICP
            </button>
          )}
        </div>
      )}
    </div>
  );
}
