"use client";

import { useMemo } from "react";
import { CocktailCard } from "@/components/CocktailCard";
import { useMyBar, useRecentCocktails } from "@/hooks/use-my-bar";
import { matchCocktails } from "@/lib/cocktail-matching";

export function RecentCocktails() {
  const { recentIds, loaded } = useRecentCocktails();
  const { barIds } = useMyBar();

  const matches = useMemo(() => {
    if (!loaded || recentIds.length === 0) return [];
    const byId = new Map(matchCocktails(barIds).map((m) => [m.cocktail.id, m]));
    return recentIds
      .map((id) => byId.get(id))
      .filter((m): m is NonNullable<typeof m> => !!m);
  }, [recentIds, barIds, loaded]);

  if (!loaded || matches.length === 0) return null;

  return (
    <section className="mt-14">
      <div className="mb-6 border-b border-[var(--border)] pb-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--foreground)]">
          Recently viewed
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">Pick up where you left off</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {matches.slice(0, 6).map((match) => (
          <CocktailCard key={match.cocktail.id} match={match} compact />
        ))}
      </div>
    </section>
  );
}
