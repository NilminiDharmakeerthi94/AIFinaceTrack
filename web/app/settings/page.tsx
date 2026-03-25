"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MobileShell } from "@/components/MobileShell";
import { useAuth } from "@/context/auth-context";
import { useFinanceData } from "@/hooks/useFinanceData";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { getDb } from "@/lib/firebase";
import { saveUserProfile } from "@/services/userProfile";
import { parseAmountInput } from "@/utils/money";

export default function SettingsPage() {
  const { user, loading: authLoading, logOut } = useAuth();
  useRequireAuth();
  const [anchor] = useState(() => Date.now());
  const { profile, loading, error, refresh, setProfile } = useFinanceData(user?.uid, anchor);

  const [displayName, setDisplayName] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyBudget, setMonthlyBudget] = useState("");
  const [savingsTarget, setSavingsTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.displayName);
    setMonthlyIncome(profile.monthlyIncome ? String(profile.monthlyIncome) : "");
    setMonthlyBudget(profile.monthlyBudget ? String(profile.monthlyBudget) : "");
    setSavingsTarget(profile.savingsTarget ? String(profile.savingsTarget) : "");
  }, [profile]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setSavedMsg(null);
    try {
      const db = getDb();
      await saveUserProfile(db, user.uid, {
        displayName: displayName.trim().slice(0, 120),
        monthlyIncome: parseAmountInput(monthlyIncome),
        monthlyBudget: parseAmountInput(monthlyBudget),
        savingsTarget: parseAmountInput(savingsTarget),
      });
      setProfile((p) =>
        p
          ? {
              ...p,
              displayName: displayName.trim().slice(0, 120),
              monthlyIncome: parseAmountInput(monthlyIncome),
              monthlyBudget: parseAmountInput(monthlyBudget),
              savingsTarget: parseAmountInput(savingsTarget),
            }
          : p
      );
      setSavedMsg("Saved.");
      await refresh();
    } catch (err) {
      setSavedMsg(err instanceof Error ? err.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  if (authLoading || !user) {
    return <div className="flex min-h-dvh items-center justify-center text-slate-400">Loading…</div>;
  }

  return (
    <MobileShell
      title="Settings"
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

      <p className="mb-4 text-sm text-slate-400">
        Signed in as <span className="text-slate-200">{user.email}</span>
      </p>

      <form
        onSubmit={(e) => void onSave(e)}
        className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/40 p-4"
      >
        <div>
          <label className="text-xs text-slate-500">Display name</label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
            maxLength={120}
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Monthly income (planned)</label>
          <input
            inputMode="decimal"
            value={monthlyIncome}
            onChange={(e) => setMonthlyIncome(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Monthly budget cap</label>
          <input
            inputMode="decimal"
            value={monthlyBudget}
            onChange={(e) => setMonthlyBudget(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-slate-500">Savings target (monthly)</label>
          <input
            inputMode="decimal"
            value={savingsTarget}
            onChange={(e) => setSavingsTarget(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving || loading}
          className="tap-target rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
        {savedMsg ? <p className="text-sm text-slate-400">{savedMsg}</p> : null}
      </form>

      <div className="mt-8 space-y-3 text-sm">
        <Link href="/categories/" className="block text-emerald-400 hover:underline">
          Manage categories →
        </Link>
        <Link href="/" className="block text-slate-500 hover:text-slate-300">
          ← Back to overview
        </Link>
      </div>
    </MobileShell>
  );
}
