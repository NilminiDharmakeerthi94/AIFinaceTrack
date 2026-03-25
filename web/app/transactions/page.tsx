"use client";

import { useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/context/auth-context";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getDb } from "@/lib/firebase";
import {
  createTransaction,
  deleteTransaction,
  updateTransaction,
} from "@/services/transactions";
import type { Transaction, TransactionType } from "@/types";
import { labelMonth } from "@/utils/date";
import { formatCurrency, parseAmountInput } from "@/utils/money";

export default function TransactionsPage() {
  const { user, loading: authLoading, logOut } = useAuth();
  useRequireAuth();
  const [monthOffset, setMonthOffset] = useState(0);
  const anchor = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - monthOffset);
    return d.getTime();
  }, [monthOffset]);

  const { categories, transactions, loading, error, refresh } = useFinanceData(user?.uid, anchor);

  const [type, setType] = useState<TransactionType>("expense");
  const [amount, setAmount] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [note, setNote] = useState("");
  const [dateStr, setDateStr] = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const amt = parseAmountInput(amount);
    if (amt <= 0) return;
    setSaving(true);
    try {
      const db = getDb();
      const d = new Date(dateStr);
      await createTransaction(db, user.uid, {
        type,
        amount: amt,
        categoryId: type === "expense" ? categoryId || null : null,
        note,
        date: d.getTime(),
      });
      setAmount("");
      setNote("");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function onUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !editing) return;
    const amt = parseAmountInput(amount);
    if (amt <= 0) return;
    setSaving(true);
    try {
      const db = getDb();
      const d = new Date(dateStr);
      await updateTransaction(db, user.uid, editing.id, {
        type,
        amount: amt,
        categoryId: type === "expense" ? categoryId || null : null,
        note,
        date: d.getTime(),
      });
      setEditing(null);
      setAmount("");
      setNote("");
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  function startEdit(t: Transaction) {
    setEditing(t);
    setType(t.type);
    setAmount(String(t.amount));
    setCategoryId(t.categoryId ?? "");
    setNote(t.note);
    setDateStr(new Date(t.date).toISOString().slice(0, 10));
  }

  async function onDelete(id: string) {
    if (!user || !confirm("Delete this record?")) return;
    const db = getDb();
    await deleteTransaction(db, user.uid, id);
    await refresh();
  }

  function cancelEdit() {
    setEditing(null);
    setAmount("");
    setNote("");
    setType("expense");
    setCategoryId("");
    setDateStr(new Date().toISOString().slice(0, 10));
  }

  if (authLoading || !user) {
    return <div className="flex min-h-dvh items-center justify-center text-slate-400">Loading…</div>;
  }

  return (
    <MobileShell
      title="Transactions"
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
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-400">{labelMonth(anchor)}</p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
            onClick={() => setMonthOffset((m) => m + 1)}
          >
            ← Older
          </button>
          <button
            type="button"
            disabled={monthOffset === 0}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900 disabled:opacity-40"
            onClick={() => setMonthOffset((m) => Math.max(0, m - 1))}
          >
            Newer →
          </button>
        </div>
      </div>

      {error ? (
        <p className="mb-4 text-sm text-rose-400">
          {error}{" "}
          <button type="button" className="underline" onClick={() => void refresh()}>
            Retry
          </button>
        </p>
      ) : null}

      <form
        onSubmit={(e) => void (editing ? onUpdate(e) : onCreate(e))}
        className="mb-8 space-y-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
      >
        <h2 className="text-sm font-semibold text-slate-200">
          {editing ? "Edit transaction" : "New transaction"}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-xs text-slate-500">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as TransactionType)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-500">Amount</label>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
              placeholder="0.00"
              required
            />
          </div>
        </div>
        {type === "expense" ? (
          <div>
            <label className="text-xs text-slate-500">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <label className="text-xs text-slate-500">Date</label>
          <input
            type="date"
            value={dateStr}
            onChange={(e) => setDateStr(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Note</label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
            maxLength={500}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="tap-target rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Add"}
          </button>
          {editing ? (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-slate-600 px-4 py-3 text-sm text-slate-200"
            >
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <h2 className="mb-2 text-sm font-semibold text-slate-300">This month</h2>
      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : transactions.length === 0 ? (
        <p className="text-sm text-slate-500">No transactions yet for this month.</p>
      ) : (
        <ul className="space-y-2">
          {transactions.map((t) => {
            const cat = categories.find((c) => c.id === t.categoryId);
            return (
              <li
                key={t.id}
                className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-slate-900/30 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-medium text-slate-100">
                    {t.type === "income" ? "Income" : cat?.name ?? "Expense"}{" "}
                    <span className={t.type === "income" ? "text-emerald-400" : "text-rose-300"}>
                      {formatCurrency(t.amount)}
                    </span>
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(t.date).toLocaleDateString()}
                    {t.note ? ` · ${t.note}` : ""}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="tap-target rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-200"
                    onClick={() => startEdit(t)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="tap-target rounded-lg border border-rose-900/60 px-3 py-2 text-sm text-rose-300"
                    onClick={() => void onDelete(t.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </MobileShell>
  );
}
