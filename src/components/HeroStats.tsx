"use client";

import { cocktailCount, getBarSummary } from "@/lib/cocktail-matching";
import { useMyBar } from "@/hooks/use-my-bar";

export function HeroStats() {
  const { barIds, loaded } = useMyBar();

  const readyTonight = loaded ? getBarSummary(barIds).readyTonight : null;
  const oneAway = loaded ? getBarSummary(barIds).oneAway : null;

  return (
    <div className="mt-14 grid gap-8 border-t border-[var(--border-subtle)] pt-10 sm:mt-16 sm:grid-cols-3 sm:gap-6">
      <div className="stat-card">
        <p className="stat-value">{cocktailCount}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Classic & modern cocktails
        </p>
      </div>
      <div className="stat-card">
        <p className="stat-value">{loaded ? readyTonight : "—"}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {loaded && barIds.length === 0
            ? "Stock your bar to find out"
            : "Ready to pour tonight"}
        </p>
      </div>
      <div className="stat-card">
        <p className="stat-value">{loaded ? oneAway : "—"}</p>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {loaded && barIds.length === 0 ? "One bottle away" : "One ingredient away"}
        </p>
      </div>
    </div>
  );
}
