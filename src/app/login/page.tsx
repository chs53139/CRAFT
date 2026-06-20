"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { CraftLogo } from "@/components/CraftLogo";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    urlError === "auth_callback_failed"
      ? "Sign-in link expired. Please try again."
      : ""
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok || data.error) {
        setError(data.error ?? "Could not sign in.");
        return;
      }

      router.push(next);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-screen">
      <div className="auth-card animate-fade-in-up">
        <div className="flex justify-center">
          <CraftLogo variant="stacked" href={null} showTagline={false} />
        </div>
        <h1 className="screen-title-large mt-5 text-center">Sign in</h1>
        <p className="screen-subtitle">Your bar syncs when you&apos;re signed in.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}
          <div>
            <label htmlFor="email" className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field mt-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-2"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          No account?{" "}
          <Link href="/register" className="font-semibold text-[var(--accent)]">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="auth-screen text-center text-[var(--muted)]">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
