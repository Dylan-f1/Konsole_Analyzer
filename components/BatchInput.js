"use client";

import { useState } from "react";

export default function BatchInput({ onResults, loading, setLoading }) {
  const [text, setText] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const urls = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (urls.length === 0) return;
    if (urls.length > 20) { alert("Maximum 20 URLs par batch."); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/analyze/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onResults(data.results);
    } catch (err) {
      alert(err.message ?? "Erreur lors du batch");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={"stripe.com\nnotion.so\nlinear.app"}
          rows={6}
          className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder:text-zinc-400 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-colors resize-none font-mono"
        />
        <p className="text-xs text-zinc-400 mt-1.5">Une URL par ligne — maximum 20</p>
      </div>
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="self-end rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
      >
        {loading ? "Analyse en cours…" : "Analyser le batch →"}
      </button>
    </form>
  );
}
