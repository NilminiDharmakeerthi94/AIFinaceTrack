import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  writeBatch,
  type Firestore,
} from "firebase/firestore";
import type { Category } from "@/types";

const DEFAULT_SEED: Omit<Category, "id">[] = [
  { name: "Food", color: "#22c55e", sortOrder: 0 },
  { name: "Transport", color: "#3b82f6", sortOrder: 1 },
  { name: "Bills", color: "#f97316", sortOrder: 2 },
  { name: "Entertainment", color: "#a855f7", sortOrder: 3 },
  { name: "Other", color: "#64748b", sortOrder: 4 },
];

export function categoriesCollection(db: Firestore, uid: string) {
  return collection(doc(db, "users", uid), "categories");
}

export async function listCategories(db: Firestore, uid: string): Promise<Category[]> {
  const col = categoriesCollection(db, uid);
  const q = query(col, orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const x = d.data() as Record<string, unknown>;
    return {
      id: d.id,
      name: String(x.name ?? ""),
      color: String(x.color ?? "#64748b"),
      sortOrder: typeof x.sortOrder === "number" ? x.sortOrder : 0,
    };
  });
}

export async function ensureDefaultCategories(db: Firestore, uid: string): Promise<void> {
  const existing = await listCategories(db, uid);
  if (existing.length > 0) return;
  const col = categoriesCollection(db, uid);
  const batch = writeBatch(db);
  for (const c of DEFAULT_SEED) {
    const ref = doc(col);
    batch.set(ref, c);
  }
  await batch.commit();
}

export async function createCategory(
  db: Firestore,
  uid: string,
  input: { name: string; color: string }
): Promise<string> {
  const col = categoriesCollection(db, uid);
  const snap = await getDocs(col);
  const sortOrder = snap.size;
  const ref = await addDoc(col, {
    name: input.name.trim().slice(0, 80),
    color: input.color.slice(0, 20),
    sortOrder,
  });
  return ref.id;
}

export async function updateCategory(
  db: Firestore,
  uid: string,
  id: string,
  patch: Partial<Pick<Category, "name" | "color">>
): Promise<void> {
  const ref = doc(db, "users", uid, "categories", id);
  const clean: Record<string, string> = {};
  if (patch.name !== undefined) clean.name = patch.name.trim().slice(0, 80);
  if (patch.color !== undefined) clean.color = patch.color.slice(0, 20);
  await updateDoc(ref, clean);
}

export async function deleteCategory(db: Firestore, uid: string, id: string): Promise<void> {
  await deleteDoc(doc(db, "users", uid, "categories", id));
}
