export default function GTMSignals({ gtmSignals }) {
  if (!gtmSignals?.length) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">Signaux GTM</h3>
        <p className="text-sm text-zinc-400">Aucun signal détecté</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-semibold text-zinc-900 mb-3">Signaux GTM</h3>
      <ul className="flex flex-col gap-2">
        {gtmSignals.map((signal) => (
          <li key={signal} className="flex items-start gap-2 text-sm text-zinc-700">
            <span className="mt-0.5 text-green-500">&#10003;</span>
            {signal}
          </li>
        ))}
      </ul>
    </div>
  );
}
