"use client";

import { useMemo } from "react";
import { groupCocktailMatches, matchCocktails } from "@/lib/cocktail-matching";

/** Memoized full-bar matching — use once per page instead of repeated matchCocktails calls. */
export function useCocktailMatches(barIds: string[]) {
  const matches = useMemo(() => matchCocktails(barIds), [barIds]);
  const grouped = useMemo(() => groupCocktailMatches(matches), [matches]);
  return { matches, grouped };
}
