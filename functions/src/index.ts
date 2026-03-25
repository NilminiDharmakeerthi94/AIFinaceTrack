import * as admin from "firebase-admin";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

admin.initializeApp();

function monthBounds(ym: string): { start: number; end: number } {
  const [y, m] = ym.split("-").map(Number);
  if (!y || !m || m < 1 || m > 12) {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    return { start, end };
  }
  const start = new Date(y, m - 1, 1).getTime();
  const end = new Date(y, m, 0, 23, 59, 59, 999).getTime();
  return { start, end };
}

/** Authenticated callable: returns aggregated monthly summary (server-side validation path). */
export const monthlySummary = onCall(
  { region: process.env.FUNCTIONS_REGION ?? "us-central1" },
  async (request) => {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Authentication required.");
    }
    const uid = request.auth.uid;
    const month =
      typeof request.data?.month === "string" && /^\d{4}-\d{2}$/.test(request.data.month)
        ? request.data.month
        : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
    const { start, end } = monthBounds(month);

    try {
      const db = admin.firestore();
      const userSnap = await db.doc(`users/${uid}`).get();
      const budget =
        userSnap.exists && typeof userSnap.data()?.monthlyBudget === "number"
          ? userSnap.data()!.monthlyBudget
          : 0;

      const txSnap = await db
        .collection(`users/${uid}/transactions`)
        .where("date", ">=", start)
        .where("date", "<=", end)
        .get();

      let totalIncome = 0;
      let totalExpenses = 0;
      const byCategory = new Map<string, number>();

      for (const doc of txSnap.docs) {
        const d = doc.data();
        const amount = typeof d.amount === "number" ? Math.max(0, d.amount) : 0;
        if (d.type === "income") totalIncome += amount;
        else {
          totalExpenses += amount;
          const cid = typeof d.categoryId === "string" ? d.categoryId : "uncategorized";
          byCategory.set(cid, (byCategory.get(cid) ?? 0) + amount);
        }
      }

      const catSnap = await db.collection(`users/${uid}/categories`).get();
      const catNames = new Map<string, string>();
      for (const c of catSnap.docs) {
        const n = c.data()?.name;
        catNames.set(c.id, typeof n === "string" ? n : "Category");
      }

      const byCategoryList = [...byCategory.entries()].map(([categoryId, total]) => ({
        categoryId,
        name:
          categoryId === "uncategorized"
            ? "Uncategorized"
            : catNames.get(categoryId) ?? "Unknown",
        total,
      }));

      const budgetUsedPercent =
        budget > 0 ? Math.min(100, Math.round((totalExpenses / budget) * 100)) : 0;

      return {
        month,
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        budget,
        budgetUsedPercent,
        byCategory: byCategoryList.sort((a, b) => b.total - a.total),
      };
    } catch (e) {
      logger.error("monthlySummary failed", e);
      throw new HttpsError("internal", "Could not compute summary.");
    }
  }
);
