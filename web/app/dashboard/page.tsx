"use client";

import { useMemo, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { CategoryPie, MonthlyBar, TrendLine } from "@/components/DashboardCharts";
import { useAuth } from "@/context/auth-context";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { monthlyExpenseTotals, summarizeMonth } from "@/services/summary";
import { fetchMonthlySummaryFromApi } from "@/services/summaryApi";
import { labelMonth } from "@/utils/date";
import { formatCurrency } from "@/utils/money";

export default function DashboardPage() {
  const { logOut } = useAuth();
  useRequireAuth();
  const { user, loading: authLoading } = useAuth();
  const [anchor] = useState(() => Date.now());
  const [apiNote, setApiNote] = useState<string | null>(null);
  const { profile, categories, transactions, recent, loading, error, refresh } = useFinanceData(
    user?.uid,
    anchor
  );

  const summary = useMemo(() => {
    if (!profile) return null;
    return summarizeMonth(transactions, categories, profile, anchor);
  }, [transactions, categories, profile, anchor]);

  const barData = useMemo(() => monthlyExpenseTotals(recent), [recent]);

  const pieData = useMemo(
    () =>
      (summary?.byCategory ?? []).map((c) => ({
        name: c.name,
        value: c.total,
        color: c.color,
      })),
    [summary]
  );

  async function tryServerSummary() {
    setApiNote(null);
    try {
      const data = await fetchMonthlySummaryFromApi();
      setApiNote(
        `Cloud Function snapshot: ${data.month} — expenses ${formatCurrency(data.totalExpenses)} (server)`
      );
    } catch (e) {
      setApiNote(
        e instanceof Error
          ? `Callable not available: ${e.message}`
          : "Callable not available."
      );
    }
  }

  if (authLoading || (!user && !authLoading)) {
    return <div className="flex min-h-dvh items-center justify-center text-slate-400">Loading…</div>;
  }

  return (
    <MobileShell
      title="Insights"
      actions={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void tryServerSummary()}
            className="hidden rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:bg-slate-900 sm:inline"
          >
            Sync API
          </button>
          <button
            type="button"
            onClick={() => void logOut()}
            className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-900"
          >
            Sign out
          </button>
        </div>
      }
    >
      {error ? (
        <p className="text-sm text-rose-400">
          {error}{" "}
          <button type="button" className="underline" onClick={() => void refresh()}>
            Retry
          </button>
        </p>
      ) : null}
      {apiNote ? <p className="mb-4 text-xs text-slate-500">{apiNote}</p> : null}

      {loading || !summary ? (
        <p className="text-slate-500">Loading charts…</p>
      ) : (
        <div className="space-y-8">
          <p className="text-sm text-slate-400">{labelMonth(anchor)}</p>
          <section>
            <h2 className="mb-2 text-sm font-semibold text-slate-200">Category mix</h2>
            <CategoryPie data={pieData} />
          </section>
          <section>
            <h2 className="mb-2 text-sm font-semibold text-slate-200">Monthly expenses</h2>
            <MonthlyBar data={barData} />
          </section>
          <section>
            <h2 className="mb-2 text-sm font-semibold text-slate-200">Trend</h2>
            <TrendLine data={barData} />
          </section>
        </div>
      )}
    </MobileShell>
  );
}
