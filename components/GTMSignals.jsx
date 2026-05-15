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
      <h3 className="text-sm font-semibold text-zinc-900 mb-4">Signaux détectés</h3>
      <ul className="flex flex-col gap-2.5">
        {gtmSignals.map((signal, i) => {
          const label = signal?.label ?? signal;
          const url   = signal?.url   ?? null;

          return (
            <li key={i} className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <span className="mt-0.5 text-green-500 shrink-0 text-sm">✓</span>
                <span className="text-sm text-zinc-700 leading-snug">{label}</span>
              </div>
              {url && (
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-xs text-zinc-400 hover:text-zinc-700 underline transition-colors whitespace-nowrap"
                >
                  Voir →
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
