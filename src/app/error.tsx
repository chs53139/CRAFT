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
    <div className="app-screen flex min-h-[70dvh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Something spilled</p>
      <h1 className="screen-title-large mt-4">We hit a snag</h1>
      <p className="screen-subtitle mt-2">The bar&apos;s still open — try again or head home.</p>
      <div className="mt-8 flex w-full flex-col gap-3">
        <button type="button" onClick={reset} className="btn-primary w-full">
          Try again
        </button>
        <Link href="/" className="btn-secondary w-full text-center">
          Go home
        </Link>
      </div>
    </div>
  );
}
