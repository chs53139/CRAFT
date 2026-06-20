"use client";

import Link from "next/link";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useUserData } from "@/components/UserDataProvider";

export default function AccountPage() {
  const { user, isAuthenticated, signOut } = useUserData();

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Guest";

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader title="You" subtitle="Account & preferences" large />

      <div className="premium-card p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/10 font-[family-name:var(--font-display)] text-xl text-[var(--accent)]">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold text-[var(--foreground)]">
              {displayName}
            </p>
            <p className="truncate text-sm text-[var(--muted)]">
              {isAuthenticated ? user?.email : "Not signed in"}
            </p>
          </div>
        </div>
      </div>

      <div className="app-section space-y-3">
        {isAuthenticated ? (
          <>
            <div className="account-row">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Sync status</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Bar, favorites, and recents sync to your account
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                On
              </span>
            </div>
            <button type="button" onClick={() => signOut()} className="account-row w-full text-left">
              <span className="text-sm font-medium text-[var(--foreground)]">Sign out</span>
              <span className="text-[var(--muted)]">→</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="account-row">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Sign in</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  Sync your bar across devices
                </p>
              </div>
              <span className="text-[var(--accent)]">→</span>
            </Link>
            <Link href="/register" className="account-row">
              <div>
                <p className="text-sm font-medium text-[var(--foreground)]">Create account</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">Free — takes 30 seconds</p>
              </div>
              <span className="text-[var(--accent)]">→</span>
            </Link>
          </>
        )}
      </div>

      <p className="app-section text-center text-[11px] tracking-wide text-[var(--muted)]">
        CRAFT · Cocktails, perfected.
      </p>
    </div>
  );
}
