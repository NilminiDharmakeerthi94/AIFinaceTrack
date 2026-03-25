import type { Category, Transaction, UserProfile } from "@/types";
import { endOfMonth, monthKey, startOfMonth } from "@/utils/date";

export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  budget: number;
  budgetUsedPercent: number;
  byCategory: { categoryId: string; name: string; total: number; color: string }[];
}

export function summarizeMonth(
  transactions: Transaction[],
  categories: Category[],
  profile: UserProfile,
  anchor: number
): DashboardSummary {
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  const inMonth = transactions.filter((t) => t.date >= start && t.date <= end);
  let totalIncome = 0;
  let totalExpenses = 0;
  const catMap = new Map(categories.map((c) => [c.id, c]));

  for (const t of inMonth) {
    if (t.type === "income") totalIncome += t.amount;
    else totalExpenses += t.amount;
  }

  const byCat = new Map<string, number>();
  for (const t of inMonth) {
    if (t.type !== "expense") continue;
    const id = t.categoryId ?? "uncategorized";
    byCat.set(id, (byCat.get(id) ?? 0) + t.amount);
  }

  const byCategory = [...byCat.entries()].map(([categoryId, total]) => {
    const c = catMap.get(categoryId);
    return {
      categoryId,
      name: c?.name ?? (categoryId === "uncategorized" ? "Uncategorized" : "Unknown"),
      total,
      color: c?.color ?? "#94a3b8",
    };
  });

  const budget = profile.monthlyBudget;
  const budgetUsedPercent =
    budget > 0 ? Math.min(100, Math.round((totalExpenses / budget) * 100)) : 0;

  return {
    totalIncome,
    totalExpenses,
    balance: totalIncome - totalExpenses,
    budget,
    budgetUsedPercent,
    byCategory: byCategory.sort((a, b) => b.total - a.total),
  };
}

export function monthlyExpenseTotals(transactions: Transaction[]): { month: string; expenses: number }[] {
  const map = new Map<string, number>();
  for (const t of transactions) {
    if (t.type !== "expense") continue;
    const key = monthKey(t.date);
    map.set(key, (map.get(key) ?? 0) + t.amount);
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, expenses]) => ({ month, expenses }));
}

export function simpleInsights(
  current: DashboardSummary,
  previousMonth: DashboardSummary | null
): string[] {
  const out: string[] = [];
  if (current.budget > 0 && current.budgetUsedPercent >= 90) {
    out.push("You have used most of your monthly budget—consider pausing discretionary spending.");
  }
  if (previousMonth && current.totalExpenses > previousMonth.totalExpenses * 1.15) {
    out.push("Spending this month is noticeably higher than last month.");
  }
  const top = current.byCategory[0];
  if (top && current.totalExpenses > 0 && top.total / current.totalExpenses > 0.4) {
    out.push(`A large share of spending is in “${top.name}”—worth a quick review.`);
  }
  if (out.length === 0) {
    out.push("Keep logging transactions for clearer trends next month.");
  }
  return out.slice(0, 3);
}
