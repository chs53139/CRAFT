"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserData } from "@/components/UserDataProvider";

const links = [
  { href: "/bar", label: "My Bar" },
  { href: "/cocktails", label: "Tonight" },
  { href: "/favorites", label: "Favorites" },
];

export function Header() {
  const pathname = usePathname();
  const { user, isAuthenticated, signOut } = useUserData();
  const [open, setOpen] = useState(false);

  const displayName =
    user?.user_metadata?.display_name ||
    user?.email?.split("@")[0] ||
    "Account";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function navClass(href: string, mobile = false) {
    const active = pathname === href || (href !== "/" && pathname.startsWith(href));
    if (mobile) {
      return active
        ? "rounded-xl bg-[var(--accent)]/10 px-4 py-3.5 font-medium text-[var(--accent)] ring-1 ring-[var(--accent)]/15"
        : "rounded-xl px-4 py-3.5 text-[var(--foreground)] transition hover:bg-[var(--card)]";
    }
    return active
      ? "text-[var(--accent)]"
      : "text-[var(--muted)] transition hover:text-[var(--foreground)]";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[var(--background)]/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <Link href="/" className="group min-w-0" onClick={() => setOpen(false)}>
          <span className="font-[family-name:var(--font-display)] text-xl font-semibold tracking-[0.35em] text-[var(--foreground)] sm:text-2xl">
            CRAFT
          </span>
          <p className="truncate text-[10px] tracking-[0.12em] text-[var(--muted)] transition group-hover:text-[var(--accent-dim)] sm:text-[11px]">
            Your bar knows more than you think.
          </p>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className={navClass(link.href)}>
              {link.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <div className="flex items-center gap-4 border-l border-[var(--border-subtle)] pl-6">
              <span className="max-w-[140px] truncate text-xs text-[var(--muted)]">
                {displayName}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="min-h-11 text-[var(--muted)] transition hover:text-[var(--accent)]"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="btn-secondary min-h-11 px-5 py-2 text-sm">
              Sign in
            </Link>
          )}
        </nav>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)]/50 text-[var(--foreground)] md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      </div>

      {open && (
        <nav className="glass-panel border-x-0 border-b-0 px-4 py-4 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={navClass(link.href, true)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <p className="px-4 py-2 text-xs text-[var(--muted)]">{user?.email}</p>
                <button
                  type="button"
                  onClick={() => {
                    signOut();
                    setOpen(false);
                  }}
                  className="rounded-xl px-4 py-3.5 text-left text-[var(--muted)] hover:bg-[var(--card)]"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="btn-primary mt-2"
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
