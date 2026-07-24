import { WELL_KNOWN_SLUGS } from "@/lib/cocktail-curation";
import {
  getIngredientById,
  getIngredientsByIds,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { CocktailMatch, Ingredient } from "@/lib/types";
import {
  countMakeableUses,
  countOneAwayUses,
} from "./bar-health";
import { getBestUnlockRecommendation } from "./unlock-graph";
import { scoreTasteFit } from "./taste-vector";
import {
  DiscoveryModeResult,
  NeglectedBottleInsight,
  TasteVector,
} from "./types";

function pickBest<T>(items: T[], score: (item: T) => number): T | null {
  if (items.length === 0) return null;
  return items.reduce((best, item) => (score(item) > score(best) ? item : best));
}

export function getNeglectedBottleInsight(
  barIds: string[],
  matches?: CocktailMatch[]
): NeglectedBottleInsight | null {
  const owned = getIngredientsByIds(barIds).filter(
    (ing) => ing.category === "spirit" || ing.category === "liqueur"
  );

  if (owned.length === 0) return null;

  const resolvedMatches = matches ?? matchCocktails(barIds);

  const candidates = owned
    .map((ingredient) => {
      const makeableCount = countMakeableUses(ingredient.id, barIds, resolvedMatches);
      const oneAwayCount = countOneAwayUses(ingredient.id, barIds, resolvedMatches);
      const examples = resolvedMatches
        .filter(
          (m) =>
            (m.canMake || m.missingCount <= 2) &&
            m.cocktail.ingredients.some((item) => item.ingredientId === ingredient.id)
        )
        .slice(0, 4)
        .map((m) => m.cocktail.name);

      return { ingredient, makeableCount, oneAwayCount, examples };
    })
    .filter((c) => c.makeableCount <= 2);

  const best = pickBest(candidates, (c) => {
    const neglect = 10 - c.makeableCount;
    return neglect * 3 + c.oneAwayCount;
  });

  if (!best) return null;

  return {
    ingredient: best.ingredient,
    makeableCount: best.makeableCount,
    oneAwayCount: best.oneAwayCount,
    exampleCocktails: best.examples,
    message:
      best.makeableCount === 0
        ? `Your ${best.ingredient.name} hasn't unlocked a ready pour yet.`
        : `Your ${best.ingredient.name} only appears in ${best.makeableCount} ready drink${best.makeableCount === 1 ? "" : "s"}.`,
  };
}

export function getNeverThinkToMakeMatch(
  barIds: string[],
  input?: {
    tasteVector?: TasteVector;
    favoriteIds?: string[];
    recentIds?: string[];
    excludeIds?: string[];
    matches?: CocktailMatch[];
  }
): CocktailMatch | null {
  const exclude = new Set([
    ...(input?.excludeIds ?? []),
    ...(input?.favoriteIds ?? []),
    ...(input?.recentIds ?? []),
  ]);

  const pool = (input?.matches ?? matchCocktails(barIds)).filter(
    (m) =>
      m.canMake &&
      !exclude.has(m.cocktail.id) &&
      !WELL_KNOWN_SLUGS.has(m.cocktail.id) &&
      m.cocktail.obscurityScore >= 55
  );

  if (pool.length === 0) {
    return (
      (input?.matches ?? matchCocktails(barIds)).find(
        (m) => m.canMake && !exclude.has(m.cocktail.id) && m.cocktail.obscurityScore >= 45
      ) ?? null
    );
  }

  return (
    pickBest(pool, (m) => {
      const taste = input?.tasteVector
        ? scoreTasteFit(m.cocktail, input.tasteVector)
        : 0.5;
      return m.cocktail.obscurityScore * 0.6 + taste * 40;
    }) ?? null
  );
}

export function runDiscoveryMode(
  mode: DiscoveryModeResult["mode"],
  barIds: string[],
  input?: {
    tasteVector?: TasteVector;
    favoriteIds?: string[];
    recentIds?: string[];
    matches?: CocktailMatch[];
    categoryCounts?: Parameters<typeof getBestUnlockRecommendation>[1] extends infer T
      ? T extends { categoryCounts?: infer C }
        ? C
        : never
      : never;
  }
): DiscoveryModeResult | null {
  if (barIds.length === 0) return null;

  if (mode === "neglected-bottle") {
    const insight = getNeglectedBottleInsight(barIds, input?.matches);
    if (!insight) return null;
    return {
      mode,
      title: "Neglected bottle",
      subtitle: insight.message,
      insight,
    };
  }

  if (mode === "never-think") {
    const match = getNeverThinkToMakeMatch(barIds, input);
    if (!match) return null;
    return {
      mode,
      title: "Never think to make",
      subtitle: "An unusual pour hiding in plain sight on your shelf.",
      match,
    };
  }

  const recommendation = getBestUnlockRecommendation(barIds, {
    tasteVector: input?.tasteVector,
    categoryCounts: input?.categoryCounts,
    precomputedMatches: input?.matches,
  });

  if (!recommendation) return null;

  return {
    mode: "biggest-upgrade",
    title: "Biggest upgrade",
    subtitle: recommendation.reason,
    recommendation,
  };
}

export function getNeglectedSpiritNames(
  barIds: string[],
  matches?: CocktailMatch[]
): string[] {
  const resolvedMatches = matches ?? matchCocktails(barIds);
  return getIngredientsByIds(barIds)
    .filter((ing) => {
      if (ing.category !== "spirit" && ing.category !== "liqueur") return false;
      return countMakeableUses(ing.id, barIds, resolvedMatches) === 0;
    })
    .map((ing) => ing.name);
}

export function describeIngredient(ingredientId: string): Ingredient | undefined {
  return getIngredientById(ingredientId);
}
