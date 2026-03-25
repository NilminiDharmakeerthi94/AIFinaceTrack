import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
  where,
  type Firestore,
} from "firebase/firestore";
import type { Transaction, TransactionType } from "@/types";
import { endOfMonth, startOfMonth } from "@/utils/date";
import { clampAmount } from "@/utils/money";

function txCol(db: Firestore, uid: string) {
  return collection(doc(db, "users", uid), "transactions");
}

export async function listTransactionsForMonth(
  db: Firestore,
  uid: string,
  anchor: number
): Promise<Transaction[]> {
  const start = startOfMonth(anchor);
  const end = endOfMonth(anchor);
  const col = txCol(db, uid);
  const q = query(col, where("date", ">=", start), where("date", "<=", end), orderBy("date", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data()));
}

export async function listTransactionsRecent(
  db: Firestore,
  uid: string,
  limitMonthsBack = 6
): Promise<Transaction[]> {
  const now = Date.now();
  const start = new Date(now);
  start.setMonth(start.getMonth() - limitMonthsBack);
  const col = txCol(db, uid);
  const q = query(
    col,
    where("date", ">=", start.getTime()),
    orderBy("date", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapDoc(d.id, d.data()));
}

function mapDoc(id: string, x: Record<string, unknown>): Transaction {
  return {
    id,
    type: x.type === "income" ? "income" : "expense",
    amount: typeof x.amount === "number" ? clampAmount(x.amount) : 0,
    categoryId: typeof x.categoryId === "string" ? x.categoryId : null,
    note: typeof x.note === "string" ? x.note.slice(0, 500) : "",
    date: typeof x.date === "number" ? x.date : Date.now(),
    createdAt: typeof x.createdAt === "number" ? x.createdAt : Date.now(),
  };
}

export async function createTransaction(
  db: Firestore,
  uid: string,
  input: {
    type: TransactionType;
    amount: number;
    categoryId: string | null;
    note: string;
    date: number;
  }
): Promise<string> {
  const col = txCol(db, uid);
  const now = Date.now();
  const ref = await addDoc(col, {
    type: input.type,
    amount: clampAmount(input.amount),
    categoryId: input.type === "expense" ? input.categoryId : null,
    note: input.note.trim().slice(0, 500),
    date: input.date,
    createdAt: now,
  });
  return ref.id;
}

export async function updateTransaction(
  db: Firestore,
  uid: string,
  id: string,
  input: Partial<{
    type: TransactionType;
    amount: number;
    categoryId: string | null;
    note: string;
    date: number;
  }>
): Promise<void> {
  const ref = doc(db, "users", uid, "transactions", id);
  const payload: Record<string, unknown> = {};
  if (input.amount !== undefined) payload.amount = clampAmount(input.amount);
  if (input.note !== undefined) payload.note = input.note.trim().slice(0, 500);
  if (input.date !== undefined) payload.date = input.date;
  if (input.type !== undefined) payload.type = input.type;
  if (input.categoryId !== undefined) payload.categoryId = input.categoryId;
  await updateDoc(ref, payload);
}

export async function deleteTransaction(db: Firestore, uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "transactions", id));
}
