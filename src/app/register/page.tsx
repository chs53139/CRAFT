"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

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
          "Account created — check your email and click the confirmation link, then sign in. For instant access, turn off Confirm email in Supabase → Authentication → Email."
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
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Join CRAFT</p>
      <h1 className="mt-3 font-[family-name:var(--font-display)] text-4xl font-light text-[var(--foreground)]">
        Create account
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Save your bar to Supabase and pour the same drinks on any device.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-4">
        {checking && (
          <p className="text-sm text-[var(--muted)]">Checking connection…</p>
        )}
        {configError && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {configError}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </p>
        )}
        {message && (
          <p className="rounded-lg border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-4 py-3 text-sm text-[var(--foreground)]">
            {message}
          </p>
        )}
        <div>
          <label htmlFor="name" className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Name (optional)
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]/50"
          />
        </div>
        <div>
          <label htmlFor="email" className="text-xs uppercase tracking-wide text-[var(--muted)]">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]/50"
          />
        </div>
        <div>
          <label htmlFor="password" className="text-xs uppercase tracking-wide text-[var(--muted)]">
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
            className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--accent)]/50"
          />
          <p className="mt-1 text-xs text-[var(--muted)]">At least 8 characters</p>
        </div>
        <button
          type="submit"
          disabled={loading || checking || !!configError}
          className="w-full rounded-full bg-[var(--accent)] py-3.5 text-sm font-semibold text-[#070708] transition hover:brightness-110 disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
