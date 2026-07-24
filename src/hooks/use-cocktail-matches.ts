"use client";

import { useMemo } from "react";
import { groupCocktailMatches, matchCocktails } from "@/lib/cocktail-matching";

function barIdsKey(barIds: string[]): string {
  if (barIds.length === 0) return "";
  return [...barIds].sort().join("|");
}

/** Memoized full-bar matching — use once per page instead of repeated matchCocktails calls. */
export function useCocktailMatches(barIds: string[]) {
  const key = useMemo(() => barIdsKey(barIds), [barIds]);
  const matches = useMemo(
    () => matchCocktails(key ? key.split("|") : []),
    [key]
  );
  const grouped = useMemo(() => groupCocktailMatches(matches), [matches]);
  return { matches, grouped };
}
