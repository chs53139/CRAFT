"use client";

import Link from "next/link";
import { useState } from "react";
import { useUserData } from "@/components/UserDataProvider";

const links = [
  { href: "/bar", label: "My Bar" },
  { href: "/cocktails", label: "Tonight" },
  { href: "/favorites", label: "Favorites" },
];

export function Header() {
  const { user, isAuthenticated, signOut } = useUserData();
  const [open, setOpen] = useState(false);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Account";

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="group min-w-0" onClick={() => setOpen(false)}>
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[0.35em] text-[var(--foreground)] sm:text-2xl">
            CRAFT
          </span>
          <p className="hidden truncate text-[11px] tracking-wide text-[var(--muted)] transition group-hover:text-[var(--accent)] sm:block">
            Your bar knows more than you think.
          </p>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-[var(--muted)] transition hover:text-[var(--accent)]"
            >
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 border-l border-[var(--border)] pl-6">
              <span className="max-w-[140px] truncate text-xs text-[var(--muted)]">
                {displayName}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="text-[var(--muted)] transition hover:text-[var(--accent)]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-[var(--border)] px-4 py-1.5 text-[var(--foreground)] transition hover:border-[var(--accent)]/50"
            >
              Sign in
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--foreground)] md:hidden"
          aria-expanded={open}
          aria-label="Toggle menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {open && (
        <nav className="border-t border-[var(--border)] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-[var(--foreground)] transition hover:bg-[var(--card)]"
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <p className="px-3 py-2 text-xs text-[var(--muted)]">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="rounded-lg px-3 py-3 text-left text-[var(--muted)] hover:bg-[var(--card)]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-full bg-[var(--accent)] px-4 py-3 text-center text-sm font-semibold text-[#070708]"
              >
                Sign in
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
