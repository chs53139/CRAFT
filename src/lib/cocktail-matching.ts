import { cocktails, cocktailCount, ingredients } from "@/lib/cocktail-data";
import { getBuyLabel } from "@/lib/ingredient-brands";
import { getIngredientCostUsd } from "@/lib/ingredient-costs";
import { matchCocktailWithSubstitutions } from "@/lib/substitutions";
import {
  CocktailMatch,
  GroupedCocktailMatches,
  Ingredient,
  IngredientRecommendation,
} from "@/lib/types";

const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

export { cocktails, cocktailCount, ingredients };

export function getIngredientById(id: string): Ingredient | undefined {
  return ingredientMap.get(id);
}

export function getIngredientsByIds(ids: string[]): Ingredient[] {
  return ids
    .map((id) => ingredientMap.get(id))
    .filter((ing): ing is Ingredient => !!ing);
}

function resolveIngredient(id: string): Ingredient {
  return (
    ingredientMap.get(id) ?? {
      id,
      name: id.replace(/-/g, " "),
      category: "other",
    }
  );
}

export function matchCocktails(myBarIds: string[]): CocktailMatch[] {
  return cocktails.map((cocktail) => matchSingleCocktail(cocktail, myBarIds));
}

export function matchSingleCocktail(
  cocktail: (typeof cocktails)[number],
  myBarIds: string[]
): CocktailMatch {
  const result = matchCocktailWithSubstitutions(cocktail, myBarIds);
  const missing = result.missingIds.map((id) => resolveIngredient(id));

  return {
    cocktail,
    missing,
    missingCount: missing.length,
    canMake: result.canMake,
    canMakeWithSubstitutions: result.canMakeWithSubstitutions,
    matchGroup: result.matchGroup,
    matchQuality: result.matchQuality,
    substitutions: result.substitutions,
    homemadeSuggestions: result.homemadeSuggestions,
  };
}

/** Split match results into exact, substitution, experimental, and still-missing groups */
export function groupCocktailMatches(matches: CocktailMatch[]): GroupedCocktailMatches {
  const exactMatches: CocktailMatch[] = [];
  const availableWithSubstitutions: CocktailMatch[] = [];
  const experimentalMatches: CocktailMatch[] = [];
  const stillMissing: CocktailMatch[] = [];

  for (const match of matches) {
    if (match.matchGroup === "exact") {
      exactMatches.push(match);
    } else if (match.matchGroup === "substitution") {
      availableWithSubstitutions.push(match);
    } else if (match.matchGroup === "experimental") {
      experimentalMatches.push(match);
    } else {
      stillMissing.push(match);
    }
  }

  return { exactMatches, availableWithSubstitutions, experimentalMatches, stillMissing };
}

export function filterMatchesBySearch(
  matches: CocktailMatch[],
  query: string
): CocktailMatch[] {
  const q = query.trim().toLowerCase();
  if (!q) return matches;

  return matches.filter(
    (m) =>
      m.cocktail.name.toLowerCase().includes(q) ||
      m.cocktail.category.toLowerCase().includes(q) ||
      m.cocktail.flavorProfile.some((f) => f.includes(q)) ||
      m.cocktail.collections.some((c) => c.replace(/-/g, " ").includes(q)) ||
      m.cocktail.regionOfOrigin.toLowerCase().includes(q) ||
      m.cocktail.sourceAttribution.toLowerCase().includes(q) ||
      String(m.cocktail.yearInvented).includes(q) ||
      m.cocktail.funFact.toLowerCase().includes(q) ||
      m.missing.some((ing) => ing.name.toLowerCase().includes(q)) ||
      m.substitutions.some(
        (sub) =>
          sub.requiredName.toLowerCase().includes(q) ||
          sub.substituteName.toLowerCase().includes(q)
      )
  );
}

export function getBarSummaryFromMatches(matches: CocktailMatch[]) {
  const { exactMatches, availableWithSubstitutions, experimentalMatches, stillMissing } =
    groupCocktailMatches(matches);
  return {
    readyTonight: exactMatches.length,
    withSubstitutions: availableWithSubstitutions.length,
    experimental: experimentalMatches.length,
    stillMissing: stillMissing.length,
    oneAway: stillMissing.filter((m) => m.missingCount === 1).length,
  };
}

export function getBarSummary(barIds: string[]) {
  return getBarSummaryFromMatches(matchCocktails(barIds));
}

/** Exact make, or makeable with a standard substitution swap. */
export function isPourable(match: CocktailMatch): boolean {
  return match.canMake || match.canMakeWithSubstitutions;
}

function candidateMayUnlockExact(before: CocktailMatch, candidateId: string): boolean {
  if (before.canMake) return false;
  if (before.missing.some((m) => m.id === candidateId)) return true;
  if (before.substitutions.some((s) => s.requiredId === candidateId)) return true;
  return false;
}

export function getCocktailById(id: string) {
  return cocktails.find((c) => c.id === id);
}

const EXAMPLE_LIMIT = 6;

/**
 * Finds the missing ingredient that unlocks the greatest number of
 * additional exact matches with your current bar.
 */
export function getBestNextIngredient(
  barIds: string[]
): IngredientRecommendation | null {
  if (barIds.length === 0) return null;

  const barSet = new Set(barIds);
  const before = matchCocktails(barIds);
  const candidates = ingredients.filter((ing) => !barSet.has(ing.id));

  if (candidates.length === 0) return null;

  let best: IngredientRecommendation | null = null;
  let bestUnlocks = 0;
  const extendedBar = [...barIds];

  for (const ingredient of candidates) {
    extendedBar.length = barIds.length;
    extendedBar.push(ingredient.id);
    const newlyUnlocked: string[] = [];

    for (const match of before) {
      if (!candidateMayUnlockExact(match, ingredient.id)) continue;
      const after = matchSingleCocktail(match.cocktail, extendedBar);
      if (after.canMake && !match.canMake) {
        newlyUnlocked.push(match.cocktail.name);
      }
    }

    if (newlyUnlocked.length === 0) continue;

    const costUsd = getIngredientCostUsd(ingredient);
    const unlocksCount = newlyUnlocked.length;

    const isBetter =
      unlocksCount > bestUnlocks ||
      (unlocksCount === bestUnlocks && costUsd < (best?.costUsd ?? Infinity));

    if (isBetter) {
      bestUnlocks = unlocksCount;
      best = {
        ingredient,
        unlocksCount,
        exampleCocktails: newlyUnlocked.slice(0, EXAMPLE_LIMIT),
        costUsd,
      };
    }
  }

  return best;
}

/** @deprecated use getBestNextIngredient */
export function getGreatestUnlockIngredient(barIds: string[]) {
  return getBestNextIngredient(barIds);
}

export function getBuyRecommendationLabel(ingredient: Ingredient): string {
  return getBuyLabel(ingredient);
}
