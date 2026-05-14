const COLOR = {
  "Fort fit": { bar: "bg-green-500", badge: "bg-green-100 text-green-700", text: "text-green-700" },
  "Fit moyen": { bar: "bg-yellow-400", badge: "bg-yellow-100 text-yellow-700", text: "text-yellow-700" },
  "Faible fit": { bar: "bg-red-400", badge: "bg-red-100 text-red-700", text: "text-red-700" },
};

const RECOMMENDATION = {
  "Fort fit": "Ce profil correspond bien à la cible d'un vendeur B2B SaaS. Stack mature, signaux d'achat présents — à prioriser.",
  "Fit moyen": "Quelques signaux positifs, mais le profil n'est pas encore idéal. À qualifier avant d'investir du temps commercial.",
  "Faible fit": "Peu de signaux B2B SaaS détectés. Ce profil est probablement hors cible pour un vendeur comme Konsole.",
};

export default function ScoringWidget({ score, scoreLabel, scoreBreakdown }) {
  const colors = COLOR[scoreLabel] ?? COLOR["Faible fit"];
  const recommendation = RECOMMENDATION[scoreLabel] ?? "";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-1 flex-wrap">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Score de fit B2B SaaS</h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Profil évalué : <span className="font-medium text-zinc-500">vendeur B2B SaaS (ex: Konsole)</span>
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold shrink-0 ${colors.badge}`}>
          {scoreLabel}
        </span>
      </div>

      <div className="flex items-end gap-3 mt-4 mb-3">
        <span className="text-4xl font-bold text-zinc-900">{score}</span>
        <span className="text-sm text-zinc-400 mb-1">/ 100</span>
      </div>

      <div className="h-2 w-full rounded-full bg-zinc-100 mb-4">
        <div
          className={`h-2 rounded-full transition-all duration-700 ${colors.bar}`}
          style={{ width: `${score}%` }}
        />
      </div>

      <p className={`text-xs leading-relaxed mb-4 ${colors.text}`}>{recommendation}</p>

      {scoreBreakdown?.length > 0 && (
        <>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Détail des critères</p>
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
