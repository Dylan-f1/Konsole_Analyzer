"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";

const TYPE_CONFIG = {
  new_tech:     { label: "Nouvelle techno",  color: "bg-blue-100 text-blue-700",   icon: "⚙️" },
  removed_tech: { label: "Techno retirée",   color: "bg-red-100 text-red-700",     icon: "🗑️" },
  new_signal:   { label: "Nouveau signal",   color: "bg-green-100 text-green-700", icon: "📡" },
  funding:      { label: "Financement",      color: "bg-amber-100 text-amber-700", icon: "💰" },
  linkedin:     { label: "LinkedIn trouvé",  color: "bg-indigo-100 text-indigo-700", icon: "🔗" },
};

export default function SignalsPage() {
  const [signals, setSignals]       = useState([]);
  const [unread, setUnread]         = useState(0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      const res  = await fetch("/api/signals");
      const data = await res.json();
      setSignals(data.signals ?? []);
      setUnread(data.unreadCount ?? 0);
      setLoading(false);

      // Mark all as seen
      if ((data.unreadCount ?? 0) > 0) {
        fetch("/api/signals", { method: "PATCH" });
      }
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-lg font-semibold text-zinc-900">Signaux détectés</h1>
            <p className="text-sm text-zinc-400 mt-0.5">Changements détectés sur les prospects surveillés</p>
          </div>
          {unread > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {unread} non lu{unread > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {loading && (
          <div className="flex flex-col gap-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-zinc-200 animate-pulse" />)}
          </div>
        )}

        {!loading && signals.length === 0 && (
          <div className="text-center py-20">
            <p className="text-zinc-400 text-sm">Aucun signal pour l&apos;instant.</p>
            <p className="text-zinc-400 text-xs mt-1">Surveillez des prospects pour recevoir des alertes automatiques.</p>
          </div>
        )}

        {!loading && signals.length > 0 && (
          <div className="flex flex-col gap-2">
            {signals.map((s) => {
              const config = TYPE_CONFIG[s.type] ?? { label: s.type, color: "bg-zinc-100 text-zinc-600", icon: "•" };
              return (
                <div
                  key={s._id}
                  className={`flex items-start gap-4 rounded-xl border bg-white p-4 shadow-sm transition-colors ${s.unread ? "border-amber-200" : "border-zinc-200"}`}
                >
                  <div className="shrink-0 text-xl">{config.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {s.favicon && (
                        <img src={s.favicon} alt="" width={16} height={16} className="rounded object-contain" onError={(e) => e.target.style.display = "none"} />
                      )}
                      <span className="text-sm font-medium text-zinc-900 truncate">{s.companyName}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${config.color}`}>{config.label}</span>
                      {s.unread && <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />}
                    </div>
                    <p className="text-sm text-zinc-600">{s.message}</p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {new Date(s.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
