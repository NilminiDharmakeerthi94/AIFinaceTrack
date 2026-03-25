import { httpsCallable } from "firebase/functions";
import type { MonthlySummaryResponse } from "@/types";
import { getFirebaseAuth, getFirebaseFunctions } from "@/lib/firebase";

export async function fetchMonthlySummaryFromApi(month?: string): Promise<MonthlySummaryResponse> {
  const auth = getFirebaseAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Not signed in");
  await user.getIdToken(true);
  const fn = httpsCallable<{ month?: string }, MonthlySummaryResponse>(
    getFirebaseFunctions(),
    "monthlySummary"
  );
  const res = await fn({ month });
  return res.data;
}
