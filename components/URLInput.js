"use client";

export default function URLInput({ onSubmit, loading }) {
  function handleSubmit(e) {
    e.preventDefault();
    const url = e.target.elements.url.value.trim();
    if (url) onSubmit(url);
  }

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col gap-3">
      <div className="flex gap-2">
        <input
          name="url"
          type="text"
          placeholder="stripe.com"
          disabled={loading}
          className="flex-1 rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm outline-none focus:border-zinc-900 focus:ring-2 focus:ring-zinc-900/10 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyser
        </button>
      </div>
    </form>
  );
}
