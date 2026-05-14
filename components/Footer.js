export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-white mt-16 px-6 py-8">
      <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-900 flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-zinc-700">Konsole Analyzer</span>
        </div>

        <p className="text-xs text-zinc-400 text-center">
          Construit pour les équipes Revenue Engineering — propulsé par{" "}
          <a href="https://groq.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600">Groq</a>
          {" "}·{" "}
          <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-zinc-600">Vercel</a>
        </p>

        <a
          href="https://github.com/Dylan-f1/Konsole_Analyzer"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 hover:text-zinc-700 underline"
        >
          Code source
        </a>
      </div>
    </footer>
  );
}
