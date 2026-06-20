"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { CraftLogo } from "@/components/CraftLogo";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    fetch("/api/auth/status")
      .then((res) => res.json())
      .then((data: { ok: boolean; message?: string }) => {
        if (!data.ok && data.message) setConfigError(data.message);
      })
      .catch(() => {
        setConfigError("Could not check Supabase connection.");
      })
      .finally(() => setChecking(false));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      });

      const data = (await res.json()) as {
        error?: string;
        session?: boolean;
        needsEmailConfirmation?: boolean;
      };

      if (!res.ok || data.error) {
        setError(data.error ?? "Could not create account.");
        return;
      }

      if (data.session) {
        router.push("/bar");
        router.refresh();
        return;
      }

      if (data.needsEmailConfirmation) {
        setMessage(
          "Account created — check your email and click the confirmation link, then sign in."
        );
        return;
      }

      setMessage("Account created. You can sign in now.");
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
          <CraftLogo variant="mark" href={null} />
        </div>
        <h1 className="screen-title-large mt-5 text-center">Create account</h1>
        <p className="screen-subtitle">Save your bar and favorites across devices.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {checking && <p className="text-sm text-[var(--muted)]">Checking connection…</p>}
          {configError && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {configError}
            </p>
          )}
          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
            >
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-xl border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--foreground)]">
              {message}
            </p>
          )}
          <div>
            <label htmlFor="name" className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field mt-2"
            />
          </div>
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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-2"
            />
            <p className="mt-1 text-xs text-[var(--muted)]">At least 8 characters</p>
          </div>
          <button
            type="submit"
            disabled={loading || checking || !!configError}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-[var(--accent)]">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
