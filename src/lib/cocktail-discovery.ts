import { cocktails, matchCocktails } from "@/lib/cocktail-matching";
import { DISCOVER_COLLECTIONS } from "@/lib/cocktail-curation";
import { matchesMood, matchesRarity } from "@/lib/cocktail-enrichment";
import { filterMatchesByDrinkType } from "@/lib/drink-type";
import { Cocktail, CocktailCollection, CocktailMatch, Difficulty } from "@/lib/types";

export type SurpriseFilters = {
  mood?: string;
  rarity?: string;
  spiritId?: string;
  complexity?: Difficulty | "any";
  drinkType?: "both" | "cocktails" | "mocktails";
  /** @deprecated only makeable cocktails are returned */
  preferMakeable?: boolean;
};

const HIDDEN_GEM_MIN_SCORE = 58;

export function getHiddenGems(
  barIds: string[],
  limit = 10,
  precomputed?: CocktailMatch[]
): CocktailMatch[] {
  if (barIds.length === 0) return [];

  const makeable = (precomputed ?? matchCocktails(barIds)).filter((m) => m.canMake);

  const gems = makeable
    .filter(
      (m) =>
        m.cocktail.obscurityScore >= HIDDEN_GEM_MIN_SCORE ||
        m.cocktail.collections.includes("hidden-gem") ||
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

    if (filters.drinkType && filters.drinkType !== "both") {
      const typeMatch =
        filters.drinkType === "mocktails"
          ? c.drinkType === "mocktail"
          : c.drinkType === "cocktail";
      if (!typeMatch) return false;
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

  if (filters.drinkType && filters.drinkType !== "both") {
    makeable = filterMatchesByDrinkType(makeable, filters.drinkType);
    if (makeable.length === 0) return null;
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

export function getCatalogueByCollection(collection: CocktailCollection): Cocktail[] {
  return cocktails
    .filter((cocktail) => cocktail.collections.includes(collection))
    .sort((a, b) => b.popularityScore - a.popularityScore || a.name.localeCompare(b.name));
}

export function getCollectionCounts(): Record<CocktailCollection, number> {
  const counts = Object.fromEntries(
    DISCOVER_COLLECTIONS.map((id) => [id, 0])
  ) as Record<CocktailCollection, number>;

  for (const cocktail of cocktails) {
    for (const collection of cocktail.collections) {
      if (collection in counts) counts[collection] += 1;
    }
  }

  return counts;
}

export function searchCatalogue(query: string, collection?: CocktailCollection): Cocktail[] {
  const q = query.trim().toLowerCase();
  const pool = collection ? getCatalogueByCollection(collection) : cocktails;

  if (!q) return pool;

  return pool.filter(
    (cocktail) =>
      cocktail.name.toLowerCase().includes(q) ||
      cocktail.category.toLowerCase().includes(q) ||
      cocktail.regionOfOrigin.toLowerCase().includes(q) ||
      cocktail.sourceAttribution.toLowerCase().includes(q) ||
      cocktail.collections.some((c) => c.replace(/-/g, " ").includes(q)) ||
      cocktail.flavorProfile.some((f) => f.includes(q)) ||
      String(cocktail.yearInvented).includes(q)
  );
}
