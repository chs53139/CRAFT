"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAnalyticsLoginPage() {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/analytics/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        setError("Invalid token.");
        return;
      }
      router.replace("/admin/analytics");
    } catch {
      setError("Could not sign in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-screen max-w-md">
      <h1 className="screen-title-large">CRAFT Pulse</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">Owner analytics access</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--accent-dim)]">
            Admin token
          </span>
          <input
            type="password"
            className="find-nearby-input mt-2"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            autoComplete="off"
          />
        </label>
        {error && <p className="find-nearby-error">{error}</p>}
        <button type="submit" className="btn-primary w-full" disabled={loading}>
          {loading ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
