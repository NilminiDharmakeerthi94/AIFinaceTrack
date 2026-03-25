"use client";

import { useCallback, useEffect, useState } from "react";
import { getDb } from "@/lib/firebase";
import {
  ensureDefaultCategories,
  listCategories,
} from "@/services/categories";
import { getUserProfile } from "@/services/userProfile";
import { listTransactionsForMonth, listTransactionsRecent } from "@/services/transactions";
import type { Category, Transaction, UserProfile } from "@/types";

export function useFinanceData(uid: string | undefined, monthAnchor: number) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!uid) {
      setProfile(null);
      setCategories([]);
      setTransactions([]);
      setRecent([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const db = getDb();
      await ensureDefaultCategories(db, uid);
      const [p, cats, tx, rec] = await Promise.all([
        getUserProfile(db, uid),
        listCategories(db, uid),
        listTransactionsForMonth(db, uid, monthAnchor),
        listTransactionsRecent(db, uid, 8),
      ]);
      setProfile(p);
      setCategories(cats);
      setTransactions(tx);
      setRecent(rec);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [uid, monthAnchor]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    profile,
    categories,
    transactions,
    recent,
    loading,
    error,
    refresh,
    setProfile,
  };
}
