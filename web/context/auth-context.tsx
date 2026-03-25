"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { isFirebaseConfigReady } from "@/config/firebase";
import { getFirebaseAuth } from "@/lib/firebase";
import { toAuthEmail } from "@/utils/authIdentifier";

const CONFIG_ERROR =
  "Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* in web/.env.local, rebuild, and redeploy (or configure GitHub Actions secrets).";

type AuthState = {
  firebaseReady: boolean;
  user: User | null;
  loading: boolean;
  signIn: (identifier: string, password: string) => Promise<void>;
  signUp: (identifier: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseReady = isFirebaseConfigReady();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(() => firebaseReady);

  useEffect(() => {
    if (!firebaseReady) return;
    const auth = getFirebaseAuth();
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, [firebaseReady]);

  const value = useMemo<AuthState>(
    () => ({
      firebaseReady,
      user: firebaseReady ? user : null,
      loading: firebaseReady ? loading : false,
      async signIn(identifier, password) {
        if (!firebaseReady) throw new Error(CONFIG_ERROR);
        const auth = getFirebaseAuth();
        const email = toAuthEmail(identifier);
        await signInWithEmailAndPassword(auth, email, password);
      },
      async signUp(identifier, password) {
        if (!firebaseReady) throw new Error(CONFIG_ERROR);
        const auth = getFirebaseAuth();
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters.");
        }
        const email = toAuthEmail(identifier);
        await createUserWithEmailAndPassword(auth, email, password);
      },
      async logOut() {
        if (!firebaseReady) return;
        await signOut(getFirebaseAuth());
      },
    }),
    [firebaseReady, user, loading]
  );

  if (!firebaseReady) {
    return (
      <AuthContext.Provider value={value}>
        <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm font-medium uppercase tracking-widest text-amber-400/90">
            Configuration
          </p>
          <h1 className="max-w-md text-2xl font-semibold text-white">Firebase env missing</h1>
          <p className="max-w-lg text-sm text-slate-400">
            This build was produced without <code className="text-slate-300">NEXT_PUBLIC_FIREBASE_*</code>{" "}
            variables. Add them to <code className="text-slate-300">web/.env.local</code>, run{" "}
            <code className="text-slate-300">npm run build</code>, deploy again, and ensure GitHub Actions
            secrets are set for automated deploys.
          </p>
        </div>
      </AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
