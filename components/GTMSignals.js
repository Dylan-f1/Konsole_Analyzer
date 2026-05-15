"use client";

import { useState } from "react";

function SignalRow({ signal }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen]     = useState(false);

  const label  = signal?.label  ?? signal;
  const action = signal?.action ?? null;
  const url    = signal?.url    ?? null;

  async function copyAction() {
    try {
      await navigator.clipboard.writeText(action);
    } catch {
      const el = document.createElement("textarea");
      el.value = action;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <li className="flex flex-col gap-1.5">
      {/* Signal header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 min-w-0">
          <span className="mt-0.5 text-green-500 shrink-0 text-sm">✓</span>
          <span className="text-sm text-zinc-700 leading-snug">{label}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-zinc-400 hover:text-zinc-700 underline transition-colors whitespace-nowrap"
            >
              Voir →
            </a>
          )}
          {action && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors whitespace-nowrap"
            >
              {open ? "Masquer" : "Que faire →"}
            </button>
          )}
        </div>
      </div>

      {/* Action block — shown on demand */}
      {open && action && (
        <div className="ml-5 rounded-lg bg-indigo-50 border border-indigo-100 px-3 py-2.5 flex items-start justify-between gap-3">
          <p className="text-xs text-indigo-800 leading-relaxed flex-1">{action}</p>
          <button
            onClick={copyAction}
            title="Copier cette action"
            className="shrink-0 mt-0.5 text-indigo-400 hover:text-indigo-700 transition-colors"
          >
            {copied ? (
              <svg className="w-3.5 h-3.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            )}
          </button>
        </div>
      )}
    </li>
  );
}

export default function GTMSignals({ gtmSignals }) {
  if (!gtmSignals?.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Signaux détectés</h3>
        <p className="text-sm text-zinc-400">Aucun signal détecté</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-900">Signaux détectés</h3>
        <span className="text-xs text-zinc-400">Clique sur "Que faire →" pour les actions</span>
      </div>
      <ul className="flex flex-col gap-3">
        {gtmSignals.map((signal, i) => (
          <SignalRow key={i} signal={signal} />
        ))}
      </ul>
    </div>
  );
}
