import {
  ingredients,
  matchCocktails,
  matchSingleCocktail,
} from "@/lib/cocktail-matching";
import { calculateRoiScore, getIngredientCostUsd } from "@/lib/ingredient-costs";
import {
  getInventoryTier,
  getInventoryTierLabel,
  InventoryTier,
  isBrowsableIngredient,
} from "@/lib/inventory-tiers";
import { CocktailMatch, Ingredient } from "@/lib/types";
import { ingredientUnlockPreview } from "./bar-health";
import { scoreTasteFit } from "./taste-vector";
import { TasteVector, UnlockRecommendation } from "./types";

const EXAMPLE_LIMIT = 6;

function candidateMayUnlockExact(before: CocktailMatch, candidateId: string): boolean {
  if (before.canMake) return false;
  if (before.missing.some((m) => m.id === candidateId)) return true;
  if (before.substitutions.some((s) => s.requiredId === candidateId)) return true;
  return false;
}

function gapFillScore(
  ingredientId: string,
  ingredientName: string,
  category: Ingredient["category"] | undefined,
  tierCounts: Partial<Record<InventoryTier, number>>
): number {
  const tier = getInventoryTier({
    id: ingredientId,
    name: ingredientName,
    category: category ?? "other",
  });
  const count = tierCounts[tier] ?? 0;

  if (tier === "spirits-liqueurs" && count === 0) return 1;
  if (tier === "pantry" && count === 0) return 0.9;
  if (tier === "mixers" && count < 2) return 0.7;
  if (count === 0) return 0.5;
  if (count >= 5) return 0.1;
  return 0.35;
}

function buildReason(input: {
  unlocksCount: number;
  gapFillScore: number;
  tier: InventoryTier;
  tasteFitScore: number;
}): string {
  const tierLabel = getInventoryTierLabel(input.tier).toLowerCase();
  if (input.gapFillScore >= 0.9 && input.unlocksCount >= 10) {
    return `Fills a ${tierLabel} gap and unlocks ${input.unlocksCount} new pours.`;
  }
  if (input.gapFillScore >= 0.9) {
    return `Strong gap-fill for your ${tierLabel} shelf.`;
  }
  if (input.unlocksCount >= 20) {
    return `Highest unlock count on your shelf — ${input.unlocksCount} new cocktails.`;
  }
  if (input.tasteFitScore >= 0.7) {
    return `Unlocks ${input.unlocksCount} drinks that match your taste profile.`;
  }
  return `Opens ${input.unlocksCount} exact match${input.unlocksCount === 1 ? "" : "es"} from where you are now.`;
}

export function getUnlockRecommendations(
  barIds: string[],
  options?: {
    tasteVector?: TasteVector;
    categoryCounts?: Partial<Record<InventoryTier, number>>;
    limit?: number;
    precomputedMatches?: CocktailMatch[];
  }
): UnlockRecommendation[] {
  if (barIds.length === 0) return [];

  const limit = options?.limit ?? 3;
  const barSet = new Set(barIds);
  const before = options?.precomputedMatches ?? matchCocktails(barIds);
  const candidates = ingredients.filter(
    (ing) => !barSet.has(ing.id) && isBrowsableIngredient(ing)
  );

  const actualTierCounts: Partial<Record<InventoryTier, number>> = {};
  for (const id of barIds) {
    const ing = ingredients.find((i) => i.id === id);
    if (!ing) continue;
    const tier = getInventoryTier(ing);
    actualTierCounts[tier] = (actualTierCounts[tier] ?? 0) + 1;
  }

  const extendedBar = [...barIds];
  type Scored = { score: number; item: UnlockRecommendation };
  const results: Scored[] = [];

  for (const ingredient of candidates) {
    extendedBar.length = barIds.length;
    extendedBar.push(ingredient.id);

    const preview = ingredientUnlockPreview(barIds, ingredient.id, before);
    if (preview.unlocks === 0 && preview.movesToOneAway === 0) continue;

    const newlyUnlocked: string[] = preview.examples;
    let tasteFitTotal = 0;
    let tasteFitCount = 0;

    if (options?.tasteVector) {
      for (const match of before) {
        if (!candidateMayUnlockExact(match, ingredient.id)) continue;
        const after = matchSingleCocktail(match.cocktail, extendedBar);
        if (after.canMake && !match.canMake) {
          tasteFitTotal += scoreTasteFit(match.cocktail, options.tasteVector);
          tasteFitCount += 1;
        }
      }
    }

    const tasteFitScore =
      tasteFitCount > 0 ? Math.round((tasteFitTotal / tasteFitCount) * 100) / 100 : 0.5;
    const gapScore = gapFillScore(
      ingredient.id,
      ingredient.name,
      ingredient.category,
      options?.categoryCounts ?? actualTierCounts
    );
    const costUsd = getIngredientCostUsd(ingredient);
    const roiScore = calculateRoiScore(
      preview.unlocks,
      preview.movesToOneAway,
      costUsd
    );

    const compositeScore =
      preview.unlocks * 14 +
      preview.movesToOneAway * 0.35 +
      gapScore * 4 +
      tasteFitScore * 3 +
      roiScore * 0.5;

    results.push({
      score: compositeScore,
      item: {
        ingredient,
        unlocksCount: preview.unlocks,
        exampleCocktails: newlyUnlocked.slice(0, EXAMPLE_LIMIT),
        costUsd,
        movesToOneAway: preview.movesToOneAway,
        roiScore,
        gapFillScore: gapScore,
        tasteFitScore,
        reason: buildReason({
          unlocksCount: preview.unlocks,
          gapFillScore: gapScore,
          tier: getInventoryTier(ingredient),
          tasteFitScore,
        }),
      },
    });
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.item);
}

export function getBestUnlockRecommendation(
  barIds: string[],
  options?: Parameters<typeof getUnlockRecommendations>[1]
): UnlockRecommendation | null {
  return getUnlockRecommendations(barIds, { ...options, limit: 1 })[0] ?? null;
}
