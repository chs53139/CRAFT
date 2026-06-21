import { cocktails, ingredients, matchSingleCocktail } from "@/lib/cocktail-matching";
import { filterMatchesByDrinkType, DrinkTypeFilter } from "@/lib/drink-type";
import {
  getInventoryTier,
  InventoryTier,
  isBrowsableIngredient,
} from "@/lib/inventory-tiers";
import { Cocktail, CocktailMatch, Ingredient } from "@/lib/types";

export type IngredientBucket = "must" | "nice" | "exclude";

export type IngredientSearchFilters = {
  mustInclude: string[];
  niceToHave: string[];
  exclude: string[];
  drinkType: DrinkTypeFilter;
};

export type IngredientSearchSort = "popularity" | "rating" | "rarity" | "match";

export type ScoredIngredientMatch = {
  match: CocktailMatch;
  matchPercent: number;
  matchedCount: number;
  selectedCount: number;
  matchedMust: number;
  tier: "exact" | "partial";
};

export type IngredientSearchResults = {
  exactMatches: ScoredIngredientMatch[];
  partialMatches: ScoredIngredientMatch[];
};

const PARTIAL_MATCH_THRESHOLD = 50;

export function filterBrowsableIngredients(
  query: string,
  tier: InventoryTier | "all" = "all"
): Ingredient[] {
  const q = query.trim().toLowerCase();

  return ingredients
    .filter((ingredient) => {
      if (!isBrowsableIngredient(ingredient)) return false;
      if (tier !== "all" && getInventoryTier(ingredient) !== tier) return false;
      if (!q) return true;
      return ingredient.name.toLowerCase().includes(q);
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function cocktailHasIngredient(cocktail: Cocktail, ingredientId: string): boolean {
  return cocktail.ingredients.some((item) => item.ingredientId === ingredientId);
}

export function hasSelectedIngredients(filters: IngredientSearchFilters): boolean {
  return filters.mustInclude.length > 0 || filters.niceToHave.length > 0;
}

export function getCatalogueRatingScore(cocktail: Cocktail): number {
  let score = cocktail.popularityScore;
  if (cocktail.collections.includes("verified-classic")) score += 12;
  if (cocktail.collections.includes("hidden-gem")) score += 6;
  return score;
}

export function sortIngredientSearchResults(
  items: ScoredIngredientMatch[],
  sort: IngredientSearchSort
): ScoredIngredientMatch[] {
  const sorted = [...items];

  sorted.sort((a, b) => {
    const cocktailA = a.match.cocktail;
    const cocktailB = b.match.cocktail;

    switch (sort) {
      case "match":
        if (b.matchPercent !== a.matchPercent) return b.matchPercent - a.matchPercent;
        return cocktailB.popularityScore - cocktailA.popularityScore;
      case "rarity":
        if (cocktailB.obscurityScore !== cocktailA.obscurityScore) {
          return cocktailB.obscurityScore - cocktailA.obscurityScore;
        }
        return cocktailA.name.localeCompare(cocktailB.name);
      case "rating":
        return getCatalogueRatingScore(cocktailB) - getCatalogueRatingScore(cocktailA);
      case "popularity":
      default:
        if (cocktailB.popularityScore !== cocktailA.popularityScore) {
          return cocktailB.popularityScore - cocktailA.popularityScore;
        }
        return cocktailA.name.localeCompare(cocktailB.name);
    }
  });

  return sorted;
}

function scoreCocktailForFilters(
  cocktail: Cocktail,
  filters: IngredientSearchFilters
): ScoredIngredientMatch | null {
  const selectedIds = [...filters.mustInclude, ...filters.niceToHave];
  if (selectedIds.length === 0) return null;

  if (filters.exclude.some((id) => cocktailHasIngredient(cocktail, id))) {
    return null;
  }

  const matchedMust = filters.mustInclude.filter((id) =>
    cocktailHasIngredient(cocktail, id)
  ).length;
  const matchedNice = filters.niceToHave.filter((id) =>
    cocktailHasIngredient(cocktail, id)
  ).length;
  const matchedCount = matchedMust + matchedNice;
  const selectedCount = selectedIds.length;
  const matchPercent = Math.round((matchedCount / selectedCount) * 100);

  const allMustPresent =
    filters.mustInclude.length === 0 || matchedMust === filters.mustInclude.length;
  const allNicePresent =
    filters.niceToHave.length === 0 || matchedNice === filters.niceToHave.length;

  if (filters.mustInclude.length > 0 && matchedMust === 0) {
    return null;
  }

  if (matchedCount === 0) {
    return null;
  }

  const isExact = allMustPresent && allNicePresent;

  if (!isExact && matchPercent < PARTIAL_MATCH_THRESHOLD) {
    return null;
  }

  return {
    match: matchSingleCocktail(cocktail, []),
    matchPercent,
    matchedCount,
    selectedCount,
    matchedMust,
    tier: isExact ? "exact" : "partial",
  };
}

export function searchCocktailsByIngredients(
  filters: IngredientSearchFilters,
  barIds: string[] = []
): IngredientSearchResults {
  if (!hasSelectedIngredients(filters)) {
    return { exactMatches: [], partialMatches: [] };
  }

  const exactMatches: ScoredIngredientMatch[] = [];
  const partialMatches: ScoredIngredientMatch[] = [];

  for (const cocktail of cocktails) {
    if (
      filters.drinkType === "cocktails"
        ? cocktail.drinkType !== "cocktail"
        : filters.drinkType === "mocktails"
          ? cocktail.drinkType !== "mocktail"
          : false
    ) {
      continue;
    }

    const scored = scoreCocktailForFilters(cocktail, filters);
    if (!scored) continue;

    const withBarMatch: ScoredIngredientMatch = {
      ...scored,
      match: matchSingleCocktail(cocktail, barIds),
    };

    if (scored.tier === "exact") {
      exactMatches.push(withBarMatch);
    } else {
      partialMatches.push(withBarMatch);
    }
  }

  return { exactMatches, partialMatches };
}

export function searchAndSortCocktailsByIngredients(
  filters: IngredientSearchFilters,
  sort: IngredientSearchSort,
  barIds: string[] = []
): IngredientSearchResults {
  const results = searchCocktailsByIngredients(filters, barIds);

  return {
    exactMatches: sortIngredientSearchResults(results.exactMatches, sort),
    partialMatches: sortIngredientSearchResults(results.partialMatches, sort),
  };
}

export function getIngredientSearchIds(filters: IngredientSearchFilters): string[] {
  return [...new Set([...filters.mustInclude, ...filters.niceToHave])];
}

export function moveIngredientBetweenBuckets(
  filters: IngredientSearchFilters,
  ingredientId: string,
  target: IngredientBucket
): IngredientSearchFilters {
  const next = {
    ...filters,
    mustInclude: filters.mustInclude.filter((id) => id !== ingredientId),
    niceToHave: filters.niceToHave.filter((id) => id !== ingredientId),
    exclude: filters.exclude.filter((id) => id !== ingredientId),
  };

  if (target === "must") next.mustInclude = [...next.mustInclude, ingredientId];
  if (target === "nice") next.niceToHave = [...next.niceToHave, ingredientId];
  if (target === "exclude") next.exclude = [...next.exclude, ingredientId];

  return next;
}

export function removeIngredientFromFilters(
  filters: IngredientSearchFilters,
  ingredientId: string
): IngredientSearchFilters {
  return {
    ...filters,
    mustInclude: filters.mustInclude.filter((id) => id !== ingredientId),
    niceToHave: filters.niceToHave.filter((id) => id !== ingredientId),
    exclude: filters.exclude.filter((id) => id !== ingredientId),
  };
}

export function toggleIngredientInBucket(
  filters: IngredientSearchFilters,
  ingredientId: string,
  bucket: IngredientBucket
): IngredientSearchFilters {
  const inBucket =
    bucket === "must"
      ? filters.mustInclude.includes(ingredientId)
      : bucket === "nice"
        ? filters.niceToHave.includes(ingredientId)
        : filters.exclude.includes(ingredientId);

  if (inBucket) {
    return removeIngredientFromFilters(filters, ingredientId);
  }

  return moveIngredientBetweenBuckets(filters, ingredientId, bucket);
}

/** Re-export for result sections that still want drink-type filtering on matches. */
export { filterMatchesByDrinkType };
