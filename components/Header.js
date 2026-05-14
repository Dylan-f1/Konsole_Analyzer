"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";

const ROLE_LABEL = {
  admin:        { label: "Admin",        color: "bg-red-100 text-red-700" },
  gtm_engineer: { label: "GTM Engineer", color: "bg-blue-100 text-blue-700" },
};

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = session?.user?.role;
  const badge = ROLE_LABEL[role] ?? { label: role, color: "bg-zinc-100 text-zinc-600" };

  return (
    <header className="border-b border-zinc-200 bg-white px-6 py-3 sticky top-0 z-10">
      <div className="mx-auto max-w-5xl flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight">Konsole Analyzer</span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${pathname === "/" ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"}`}
          >
            Analyser
          </Link>
          <Link
            href="/history"
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${pathname === "/history" ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"}`}
          >
            Historique
          </Link>
          {role === "admin" && (
            <Link
              href="/admin/users"
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${pathname.startsWith("/admin") ? "bg-zinc-100 text-zinc-900 font-medium" : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50"}`}
            >
              Équipe
            </Link>
          )}
        </nav>

        {/* User */}
        {session?.user && (
          <div className="flex items-center gap-3">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>
              {badge.label}
            </span>
            <span className="text-sm text-zinc-700 font-medium hidden sm:block">
              {session.user.name}
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        )}

      </div>
    </header>
  );
}
