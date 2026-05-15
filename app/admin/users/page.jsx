"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";

const ROLE_LABEL = {
  admin:        { label: "Admin",        color: "bg-red-100 text-red-700" },
  gtm_engineer: { label: "GTM Engineer", color: "bg-blue-100 text-blue-700" },
};

export default function AdminUsersPage() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "gtm_engineer" });
  const [formError, setFormError]   = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadUsers() {
    const res  = await fetch("/api/admin/users");
    const data = await res.json();
    setUsers(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    const res  = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();

    if (!res.ok) {
      setFormError(data.error);
      setSubmitting(false);
      return;
    }

    setForm({ name: "", email: "", password: "", role: "gtm_engineer" });
    setSubmitting(false);
    loadUsers();
  }

  async function handleDelete(id) {
    if (!confirm("Supprimer cet utilisateur ?")) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    loadUsers();
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <Header />

      <main className="mx-auto w-full max-w-3xl px-4 py-8 flex-1">
        <h1 className="text-lg font-semibold text-zinc-900 mb-6">Gestion de l&apos;équipe</h1>

        {/* Add user form */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-5 mb-6">
          <h2 className="text-sm font-semibold text-zinc-700 mb-4">Ajouter un membre</h2>
          <form onSubmit={handleAdd} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              placeholder="Nom complet"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 transition-colors"
            />
            <input
              type="password"
              placeholder="Mot de passe temporaire"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 transition-colors"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="rounded-lg border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400 transition-colors bg-white"
            >
              <option value="gtm_engineer">GTM Engineer</option>
              <option value="admin">Admin</option>
            </select>

            {formError && (
              <p className="sm:col-span-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{formError}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="sm:col-span-2 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Ajout…" : "Ajouter le membre"}
            </button>
          </form>
        </div>

        {/* Users list */}
        <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 flex flex-col gap-2">
              {[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-zinc-100 animate-pulse" />)}
            </div>
          ) : users.length === 0 ? (
            <p className="p-6 text-sm text-zinc-400 text-center">Aucun membre pour l&apos;instant.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide">Membre</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Rôle</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-400 uppercase tracking-wide hidden sm:table-cell">Ajouté le</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const badge = ROLE_LABEL[u.role] ?? { label: u.role, color: "bg-zinc-100 text-zinc-600" };
                  return (
                    <tr key={u._id} className="border-b border-zinc-50 last:border-0">
                      <td className="px-4 py-3">
                        <p className="font-medium text-zinc-900">{u.name}</p>
                        <p className="text-xs text-zinc-400">{u.email}</p>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${badge.color}`}>{badge.label}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-zinc-400 hidden sm:table-cell whitespace-nowrap">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDelete(u._id)} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
