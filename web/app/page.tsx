"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { BudgetMeter } from "@/components/BudgetMeter";
import { useAuth } from "@/context/auth-context";
import { useFinanceData } from "@/hooks/useFinanceData";
import { summarizeMonth, simpleInsights } from "@/services/summary";
import { labelMonth } from "@/utils/date";
import { formatCurrency } from "@/utils/money";

export default function HomePage() {
  const { user, loading: authLoading, logOut } = useAuth();
  const [anchor] = useState(() => Date.now());
  const { profile, categories, transactions, recent, loading, error, refresh } = useFinanceData(
    user?.uid,
    anchor
  );

  const summary = useMemo(() => {
    if (!profile) return null;
    return summarizeMonth(transactions, categories, profile, anchor);
  }, [transactions, categories, profile, anchor]);

  const prevAnchor = useMemo(() => {
    const d = new Date(anchor);
    d.setMonth(d.getMonth() - 1);
    return d.getTime();
  }, [anchor]);

  const prevSummary = useMemo(() => {
    if (!profile) return null;
    return summarizeMonth(recent, categories, profile, prevAnchor);
  }, [recent, categories, profile, prevAnchor]);

  const insights = useMemo(() => {
    if (!summary || !prevSummary) return [];
    return simpleInsights(summary, prevSummary);
  }, [summary, prevSummary]);

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-slate-400">Loading…</div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="max-w-md space-y-3">
          <p className="text-sm font-medium uppercase tracking-widest text-emerald-400/90">
            LedgerLite
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Personal finance, clear and calm
          </h1>
          <p className="text-slate-400">
            Track income and expenses, organize categories, and see how your monthly budget is
            holding up—optimized for your phone.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3 sm:flex-row sm:max-w-md">
          <Link
            href="/login/"
            className="tap-target inline-flex items-center justify-center rounded-xl bg-emerald-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-emerald-400"
          >
            Log in
          </Link>
          <Link
            href="/signup/"
            className="tap-target inline-flex items-center justify-center rounded-xl border border-slate-600 px-4 py-3 text-center text-sm font-semibold text-slate-100 hover:border-slate-500"
          >
            Create account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MobileShell
      title="Overview"
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
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-4 text-sm text-rose-200">
          {error}
          <button type="button" className="ml-3 underline" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      ) : null}

      {loading || !profile || !summary ? (
        <p className="text-slate-500">Syncing your data…</p>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-slate-400">{labelMonth(anchor)}</p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Income</p>
              <p className="mt-1 text-2xl font-semibold text-emerald-400">
                {formatCurrency(summary.totalIncome)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Expenses</p>
              <p className="mt-1 text-2xl font-semibold text-rose-300">
                {formatCurrency(summary.totalExpenses)}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">Balance</p>
              <p className="mt-1 text-2xl font-semibold text-slate-50">
                {formatCurrency(summary.balance)}
              </p>
            </div>
          </div>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-slate-200">Monthly budget</h2>
              <span className="text-sm text-slate-400">
                {summary.budget > 0 ? `${summary.budgetUsedPercent}% used` : "Set a budget in Settings"}
              </span>
            </div>
            {summary.budget > 0 ? (
              <div className="mt-3 space-y-2">
                <BudgetMeter percent={summary.budgetUsedPercent} />
                <p className="text-xs text-slate-500">
                  {formatCurrency(summary.totalExpenses)} of {formatCurrency(summary.budget)} spent
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Add a monthly budget to see how much headroom you have left.
              </p>
            )}
          </section>

          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
            <h2 className="text-sm font-semibold text-slate-200">Spending by category</h2>
            {summary.byCategory.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">No categorized expenses this month yet.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {summary.byCategory.map((c) => {
                  const share =
                    summary.totalExpenses > 0
                      ? Math.round((c.total / summary.totalExpenses) * 100)
                      : 0;
                  return (
                    <li
                      key={c.categoryId}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: c.color }}
                        />
                        {c.name}
                      </span>
                      <span className="text-slate-300">
                        {formatCurrency(c.total)}{" "}
                        <span className="text-slate-500">({share}%)</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {insights.length > 0 ? (
            <section className="rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
              <h2 className="text-sm font-semibold text-emerald-200">Quick insights</h2>
              <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-emerald-100/90">
                {insights.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/transactions/"
              className="tap-target inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              Add transaction
            </Link>
            <Link
              href="/dashboard/"
              className="tap-target inline-flex items-center justify-center rounded-xl border border-slate-600 px-4 py-3 text-sm font-semibold text-slate-100 hover:border-slate-500"
            >
              Open charts
            </Link>
          </div>
        </div>
      )}
    </MobileShell>
  );
}
