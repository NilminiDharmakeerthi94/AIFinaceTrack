import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Firestore,
} from "firebase/firestore";
import type { UserProfile } from "@/types";

const defaultProfile: UserProfile = {
  monthlyIncome: 0,
  monthlyBudget: 0,
  savingsTarget: 0,
  displayName: "",
};

export async function getUserProfile(db: Firestore, uid: string): Promise<UserProfile> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return { ...defaultProfile };
  const d = snap.data() as Record<string, unknown>;
  return {
    monthlyIncome: typeof d.monthlyIncome === "number" ? d.monthlyIncome : 0,
    monthlyBudget: typeof d.monthlyBudget === "number" ? d.monthlyBudget : 0,
    savingsTarget: typeof d.savingsTarget === "number" ? d.savingsTarget : 0,
    displayName: typeof d.displayName === "string" ? d.displayName : "",
  };
}

export async function saveUserProfile(
  db: Firestore,
  uid: string,
  profile: Partial<UserProfile>
): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      ...profile,
      updatedAt: serverTimestamp(),
      role: "user",
    },
    { merge: true }
  );
}
