"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Something spilled</p>
      <h1 className="mt-4 font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
        We hit a snag
      </h1>
      <p className="mt-3 text-sm text-[var(--muted)]">
        The bar&apos;s still open — try again or head home.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-[#070708]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-full border border-[var(--border)] px-6 py-3 text-sm text-[var(--foreground)]"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
