"use client";

import { useState, useEffect } from "react";

export default function WatchButton({ result }) {
  const [watching, setWatching] = useState(false);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    fetch(`/api/watch?url=${encodeURIComponent(result.url)}`)
      .then((r) => r.json())
      .then((d) => { setWatching(d.watching); setLoading(false); });
  }, [result.url]);

  async function toggle() {
    setLoading(true);
    const method   = watching ? "DELETE" : "POST";
    const snapshot = {
      techStack:       result.techStack ?? [],
      gtmSignalLabels: (result.gtmSignals ?? []).map((s) => s?.label ?? s),
      hasLinkedIn:     !!result.linkedIn,
      hasFunding:      (result.gtmSignals ?? []).some((s) => /(levée|funding|series)/i.test(s?.label ?? s)),
    };

    await fetch("/api/watch", {
      method,
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ url: result.url, companyName: result.companyName, favicon: result.favicon, snapshot }),
    });

    setWatching(!watching);
    setLoading(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
        watching
          ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
          : "border-zinc-200 bg-white text-zinc-700 shadow-sm hover:border-zinc-400"
      }`}
    >
      <svg className="w-4 h-4" fill={watching ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      {watching ? "Surveillé" : "Surveiller"}
    </button>
  );
}
