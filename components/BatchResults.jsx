"use client";

import ExportButton from "@/components/ExportButton";

export default function BatchResults({ results, onSelectOne }) {
  const success = results.filter((r) => r.success);
  const failed  = results.filter((r) => !r.success);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-900">
          {success.length} analyse{success.length !== 1 ? "s" : ""} réussie{success.length !== 1 ? "s" : ""}
          {failed.length > 0 && <span className="text-red-500 ml-2">· {failed.length} erreur{failed.length !== 1 ? "s" : ""}</span>}
        </p>
        {success.length > 0 && (
          <ExportButton analyses={success.map((r) => r.data)} label="Exporter tout" filename={`konsole-batch-${new Date().toISOString().slice(0,10)}.csv`} />
        )}
      </div>

      {/* Success table */}
      {success.length > 0 && (
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Entreprise</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Secteur</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide hidden md:table-cell">Stack</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide hidden md:table-cell">Signaux</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {success.map((r) => {
                const d = r.data;
                return (
                  <tr key={r.url} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => onSelectOne(d)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        {d.favicon && (
                          <img src={d.favicon} alt="" width={18} height={18} className="rounded object-contain shrink-0" onError={(e) => e.target.style.display = "none"} />
                        )}
                        <div>
                          <p className="font-medium text-zinc-900">{d.companyName}</p>
                          <p className="text-xs text-zinc-400">{d.url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-zinc-500 hidden sm:table-cell">{d.sector ?? "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{d.techStack?.length ?? 0} techno{d.techStack?.length !== 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">{d.gtmSignals?.length ?? 0} signal{d.gtmSignals?.length !== 1 ? "s" : ""}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-xs text-zinc-400 hover:text-zinc-700">Voir →</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Errors */}
      {failed.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4">
          <p className="text-xs font-semibold text-red-600 mb-2">URLs en erreur</p>
          <ul className="flex flex-col gap-1">
            {failed.map((r) => (
              <li key={r.url} className="flex items-center justify-between text-xs text-red-600">
                <span className="font-mono">{r.url}</span>
                <span className="text-red-400">{r.error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
