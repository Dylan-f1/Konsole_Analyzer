"use client";

import { useState, useRef } from "react";

export default function URLInput({ onSubmit, loading }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(null);
  const inputRef = useRef(null);

  function validate(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return "Entrez une URL";
    return null;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const err = validate(value);
    if (err) { setError(err); return; }
    setError(null);
    onSubmit(value.trim());
  }

  function handleChange(e) {
    setValue(e.target.value);
    if (error) setError(null);
  }

  function handleClear() {
    setValue("");
    setError(null);
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            name="url"
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="stripe.com"
            disabled={loading}
            autoComplete="off"
            className={`w-full rounded-lg border bg-white px-4 py-3 pr-10 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none transition-colors
              focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-50
              ${error ? "border-red-400 focus:border-red-400" : "border-zinc-200 focus:border-zinc-900"}`}
          />
          {value && !loading && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              aria-label="Effacer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading || !value.trim()}
          className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Analyser
        </button>
      </div>
      {error && <p className="text-xs text-red-500 pl-1">{error}</p>}
    </form>
  );
}
