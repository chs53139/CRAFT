"use client";

import { useMemo } from "react";
import { HorizontalCocktailRow } from "@/components/HorizontalCocktailRow";
import { useMyBar, useRecentCocktails } from "@/hooks/use-my-bar";
import { useCocktailMatches } from "@/hooks/use-cocktail-matches";

export function RecentCocktails() {
  const { recentIds, loaded } = useRecentCocktails();
  const { barIds } = useMyBar();
  const { matches } = useCocktailMatches(barIds);

  const items = useMemo(() => {
    if (!loaded || recentIds.length === 0) return [];
    const byId = new Map(matches.map((m) => [m.cocktail.id, m]));
    return recentIds
      .map((id) => byId.get(id))
      .filter((m): m is NonNullable<typeof m> => !!m)
      .slice(0, 8);
  }, [recentIds, matches, loaded]);

  if (!loaded || items.length === 0) return null;

  return (
    <HorizontalCocktailRow
      title="Recently viewed"
      subtitle="Pick up where you left off"
      items={items}
      seeAllHref="/cocktails"
    />
  );
}
