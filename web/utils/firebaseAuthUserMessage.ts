import { FirebaseError } from "firebase/app";

/**
 * Maps Firebase Auth errors to short UI copy. Wrong-password / user-not-found
 * stay as SDK messages; configuration errors are clarified for operators and users.
 */
export function firebaseAuthUserMessage(err: unknown, fallback: string): string {
  if (err instanceof FirebaseError) {
    if (
      err.code === "auth/api-key-not-valid" ||
      err.message.toLowerCase().includes("api-key-not-valid")
    ) {
      return (
        "This site’s Firebase web API key is missing or wrong, so sign-in never reached your password. " +
        "Rebuild with the correct NEXT_PUBLIC_FIREBASE_* values from Firebase Console (same project as Hosting) and redeploy."
      );
    }
  }
  if (err instanceof Error) return err.message;
  return fallback;
}
