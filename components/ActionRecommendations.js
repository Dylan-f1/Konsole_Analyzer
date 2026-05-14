export default function ActionRecommendations({ recommendations }) {
  if (!recommendations) return null;
  const { strategy, signalActions } = recommendations;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">Recommandations sales</h3>

      <div className="rounded-lg bg-zinc-50 border border-zinc-100 p-4 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-semibold text-zinc-700">{strategy.priority}</span>
          <span className="text-xs text-zinc-400">{strategy.timing}</span>
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed">{strategy.approach}</p>
      </div>

      {signalActions.length > 0 && (
        <>
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3">
            Actions basées sur les signaux détectés
          </p>
          <ul className="flex flex-col gap-3">
            {signalActions.map((action, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-zinc-600">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 text-xs font-semibold text-zinc-500">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
