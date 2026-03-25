"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace("/");
  }, [loading, user, router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await signIn(email, password);
      router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4 py-8">
      <h1 className="text-2xl font-semibold text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-slate-400">Sign in to continue to LedgerLite.</p>

      <form onSubmit={(e) => void onSubmit(e)} className="mt-8 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-slate-100 outline-none ring-emerald-500/0 transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-300">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-slate-100 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>
        {error ? <p className="text-sm text-rose-400">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="tap-target w-full rounded-xl bg-emerald-500 py-3 text-sm font-semibold text-slate-950 hover:bg-emerald-400 disabled:opacity-60"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        No account?{" "}
        <Link href="/signup/" className="font-medium text-emerald-400 hover:underline">
          Create one
        </Link>
      </p>
      <p className="mt-4 text-center">
        <Link href="/" className="text-sm text-slate-500 hover:text-slate-300">
          ← Back home
        </Link>
      </p>
    </div>
  );
}
