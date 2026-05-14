const STATUS_CONFIG = {
  ideal:  { bar: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", text: "text-emerald-700", emoji: "🎯" },
  strong: { bar: "bg-green-500",   badge: "bg-green-100 text-green-700",     text: "text-green-700",   emoji: "🟢" },
  watch:  { bar: "bg-yellow-400",  badge: "bg-yellow-100 text-yellow-700",   text: "text-yellow-700",  emoji: "👀" },
  early:  { bar: "bg-orange-400",  badge: "bg-orange-100 text-orange-700",   text: "text-orange-700",  emoji: "⏳" },
  out:    { bar: "bg-red-400",     badge: "bg-red-100 text-red-700",         text: "text-red-700",     emoji: "❌" },
};

const RECOMMENDATIONS = {
  ideal:  "Prospect prioritaire — passez à l'action cette semaine avec une approche directe et personnalisée.",
  strong: "Fort potentiel — proposez une démo courte centrée sur les signaux détectés.",
  watch:  "À surveiller — qualifiez avant d'investir du temps. Un email de découverte suffit.",
  early:  "Trop tôt — entrez-les dans une séquence de nurturing long terme.",
  out:    "Hors cible ICP — déprioritisez. Investissez votre énergie sur des comptes à plus fort potentiel.",
};

export default function ScoringWidget({ score, scoreLabel, status, scoreBreakdown, icp }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG["out"];
  const recommendation = RECOMMENDATIONS[status] ?? "";
  const icpActive = icp && (icp.sector !== "all" || icp.size !== "all" || icp.market !== "any");

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Score de fit B2B SaaS</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            {icpActive
              ? "Score adapté à votre ICP personnalisé"
              : <>Profil évalué : <span className="font-medium text-zinc-500">vendeur B2B SaaS (ex: Konsole)</span></>
            }
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 flex items-center gap-1.5 ${config.badge}`}>
          <span>{config.emoji}</span>
          {scoreLabel}
        </span>
      </div>

      <div className="flex items-end gap-3 mt-4 mb-3">
        <span className="text-4xl font-bold text-zinc-900">{score}</span>
        <span className="text-sm text-zinc-400 mb-1">/ 100</span>
      </div>

      <div className="h-2 w-full rounded-full bg-zinc-100 mb-4">
        <div className={`h-2 rounded-full transition-all duration-700 ${config.bar}`} style={{ width: `${score}%` }} />
      </div>

      <p className={`text-xs leading-relaxed mb-4 font-medium ${config.text}`}>{recommendation}</p>

      {scoreBreakdown?.length > 0 && (
        <>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-2">Détail des critères</p>
          <ul className="flex flex-col gap-1.5">
            {scoreBreakdown.map(({ label, points }) => (
              <li key={label} className="flex items-center justify-between text-xs text-zinc-500">
                <span>{label}</span>
                <span className="font-medium text-zinc-700">+{points} pts</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
