"use client";

import { useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/context/auth-context";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getDb } from "@/lib/firebase";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/services/categories";
import type { Category } from "@/types";

const PRESET_COLORS = ["#22c55e", "#3b82f6", "#f97316", "#a855f7", "#ec4899", "#14b8a6", "#64748b"];

export default function CategoriesPage() {
  const { user, loading: authLoading, logOut } = useAuth();
  useRequireAuth();
  const [anchor] = useState(() => Date.now());
  const { categories, loading, error, refresh } = useFinanceData(user?.uid, anchor);

  const [name, setName] = useState("");
  const [color, setColor] = useState(PRESET_COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !name.trim()) return;
    setSaving(true);
    try {
      const db = getDb();
      await createCategory(db, user.uid, { name: name.trim(), color });
      setName("");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function onSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !editing || !name.trim()) return;
    setSaving(true);
    try {
      const db = getDb();
      await updateCategory(db, user.uid, editing.id, { name: name.trim(), color });
      setEditing(null);
      setName("");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function onDelete(c: Category) {
    if (!user || !confirm(`Delete category “${c.name}”?`)) return;
    const db = getDb();
    await deleteCategory(db, user.uid, c.id);
    await refresh();
  }

  function startEdit(c: Category) {
    setEditing(c);
    setName(c.name);
    setColor(c.color);
  }

  if (authLoading || !user) {
    return <div className="flex min-h-dvh items-center justify-center text-slate-400">Loading…</div>;
  }

  return (
    <MobileShell
      title="Categories"
      actions={
        <button
          type="button"
          onClick={() => void logOut()}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
        >
          Sign out
        </button>
      }
    >
      {error ? (
        <p className="mb-4 text-sm text-rose-400">
          {error}{" "}
          <button type="button" className="underline" onClick={() => void refresh()}>
            Retry
          </button>
        </p>
      ) : null}

      <form
        onSubmit={(e) => void (editing ? onSaveEdit(e) : onCreate(e))}
        className="mb-8 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
      >
        <h2 className="text-sm font-semibold text-slate-200">
          {editing ? "Edit category" : "New category"}
        </h2>
        <div>
          <label className="text-xs text-slate-500">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
            maxLength={80}
            required
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Color</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Color ${c}`}
                className={`h-10 w-10 rounded-full border-2 ${color === c ? "border-white" : "border-transparent"}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="tap-target rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save" : "Add category"}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setName("");
              }}
              className="rounded-xl border border-slate-600 px-4 py-3 text-sm text-slate-200"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <h2 className="mb-2 text-sm font-semibold text-slate-300">Your categories</h2>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <ul className="space-y-2">
          {categories.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-slate-900/30 px-3 py-3"
            >
              <span className="flex items-center gap-2 text-sm text-slate-100">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: c.color }} />
                {c.name}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="tap-target rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200"
                  onClick={() => startEdit(c)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="tap-target rounded-lg border border-rose-900/60 px-3 py-2 text-sm text-rose-300"
                  onClick={() => void onDelete(c)}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </MobileShell>
  );
}
