import { matchCocktails } from "@/lib/cocktail-matching";
import { matchesMood, matchesRarity } from "@/lib/cocktail-enrichment";
import { CocktailCollection, CocktailMatch, Difficulty } from "@/lib/types";

export type SurpriseFilters = {
  mood?: string;
  rarity?: string;
  spiritId?: string;
  complexity?: Difficulty | "any";
  /** @deprecated only makeable cocktails are returned */
  preferMakeable?: boolean;
};

const HIDDEN_GEM_MIN_SCORE = 58;

export function getHiddenGems(barIds: string[], limit = 10): CocktailMatch[] {
  if (barIds.length === 0) return [];

  const makeable = matchCocktails(barIds).filter((m) => m.canMake);

  const gems = makeable
    .filter(
      (m) =>
        m.cocktail.obscurityScore >= HIDDEN_GEM_MIN_SCORE ||
        m.cocktail.collections.includes("rare") ||
        m.cocktail.collections.includes("experimental")
    )
    .sort((a, b) => {
      const scoreDiff = b.cocktail.obscurityScore - a.cocktail.obscurityScore;
      if (scoreDiff !== 0) return scoreDiff;
      return a.cocktail.name.localeCompare(b.cocktail.name);
    });

  if (gems.length >= 3) return gems.slice(0, limit);

  return makeable
    .filter((m) => m.cocktail.obscurityScore >= 45)
    .sort((a, b) => b.cocktail.obscurityScore - a.cocktail.obscurityScore)
    .slice(0, limit);
}

function filterSurprisePool(matches: CocktailMatch[], filters: SurpriseFilters): CocktailMatch[] {
  return matches.filter((m) => {
    const c = m.cocktail;

    if (filters.mood && filters.mood !== "any" && !matchesMood(c, filters.mood)) {
      return false;
    }

    if (filters.rarity && filters.rarity !== "any" && !matchesRarity(c.obscurityScore, c.collections, filters.rarity)) {
      return false;
    }

    if (filters.spiritId && filters.spiritId !== "any") {
      const hasSpirit = c.ingredients.some((ing) => ing.ingredientId === filters.spiritId);
      if (!hasSpirit) return false;
    }

    if (filters.complexity && filters.complexity !== "any" && c.difficulty !== filters.complexity) {
      return false;
    }

    return true;
  });
}

function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  return items[Math.floor(Math.random() * items.length)];
}

/** Relax filters step-by-step while staying within the makeable pool. */
function buildFilterAttempts(filters: SurpriseFilters): SurpriseFilters[] {
  return [
    filters,
    { ...filters, mood: undefined },
    { ...filters, mood: undefined, rarity: undefined },
    { ...filters, mood: undefined, rarity: undefined, complexity: "any" },
    {
      mood: undefined,
      rarity: undefined,
      complexity: "any",
      spiritId: undefined,
    },
  ];
}

export function surpriseCocktail(
  barIds: string[],
  filters: SurpriseFilters,
  excludeIds: string[] = []
): CocktailMatch | null {
  const exclude = new Set(excludeIds);
  const allMakeable = matchCocktails(barIds).filter((m) => m.canMake);

  if (allMakeable.length === 0) return null;

  let makeable = allMakeable.filter((m) => !exclude.has(m.cocktail.id));
  if (makeable.length === 0) {
    makeable = allMakeable;
  }

  for (const attempt of buildFilterAttempts(filters)) {
    const pool = filterSurprisePool(makeable, attempt);
    if (pool.length > 0) {
      return pickRandom(pool);
    }
  }

  return pickRandom(makeable);
}

export function getCollectionMatches(
  barIds: string[],
  collection: CocktailCollection,
  limit = 24
): CocktailMatch[] {
  return matchCocktails(barIds)
    .filter((m) => m.cocktail.collections.includes(collection))
    .sort((a, b) => a.cocktail.name.localeCompare(b.cocktail.name))
    .slice(0, limit);
}
