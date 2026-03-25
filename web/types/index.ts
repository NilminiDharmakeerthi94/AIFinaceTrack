export type TransactionType = "income" | "expense";

export interface UserProfile {
  monthlyIncome: number;
  monthlyBudget: number;
  savingsTarget: number;
  displayName: string;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string | null;
  note: string;
  date: number;
  createdAt: number;
}

export interface MonthlySummaryResponse {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  budget: number;
  budgetUsedPercent: number;
  byCategory: { categoryId: string; name: string; total: number }[];
}
