import {
  getIngredientsByIds,
  matchCocktails,
  matchSingleCocktail,
} from "@/lib/cocktail-matching";
import {
  getInventoryTier,
  getInventoryTierLabel,
  INVENTORY_TIERS,
  InventoryTier,
} from "@/lib/ingredient-categories";
import { CocktailMatch } from "@/lib/types";
import { buildTasteProfile } from "./taste-vector";
import { BarHealthReport, CategoryGap, CategoryRedundancy, ReviewSignal } from "./types";

const TIER_MINIMUMS: Partial<Record<InventoryTier, number>> = {
  "spirits-liqueurs": 2,
  mixers: 2,
  pantry: 1,
};

const REDUNDANCY_THRESHOLD = 3;

function gradeFromScore(score: number): BarHealthReport["grade"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "D";
}

function countByTier(barIds: string[]): Partial<Record<InventoryTier, number>> {
  const counts: Partial<Record<InventoryTier, number>> = {};
  for (const ing of getIngredientsByIds(barIds)) {
    const tier = getInventoryTier(ing);
    counts[tier] = (counts[tier] ?? 0) + 1;
  }
  return counts;
}

function computeUtilization(barIds: string[], matches: CocktailMatch[]): number {
  if (barIds.length === 0) return 0;

  const makeable = matches.filter((m) => m.canMake);
  const used = new Set<string>();

  for (const match of makeable) {
    for (const item of match.cocktail.ingredients) {
      if (barIds.includes(item.ingredientId)) {
        used.add(item.ingredientId);
      }
    }
  }

  return Math.round((used.size / barIds.length) * 100);
}

function findRedundancies(
  tierCounts: Partial<Record<InventoryTier, number>>
): CategoryRedundancy[] {
  const redundancies: CategoryRedundancy[] = [];

  for (const [tier, count] of Object.entries(tierCounts) as Array<[InventoryTier, number]>) {
    if (count < REDUNDANCY_THRESHOLD) continue;
    const label = getInventoryTierLabel(tier);
    redundancies.push({
      category: tier,
      count,
      message: `${count} ${label.toLowerCase()} items — you may be over-indexed here.`,
    });
  }

  return redundancies.sort((a, b) => b.count - a.count);
}

function findGaps(tierCounts: Partial<Record<InventoryTier, number>>): CategoryGap[] {
  const gaps: CategoryGap[] = [];

  for (const [tier, minimum] of Object.entries(TIER_MINIMUMS) as Array<
    [InventoryTier, number]
  >) {
    const count = tierCounts[tier] ?? 0;
    if (count >= minimum) continue;

    const label = getInventoryTierLabel(tier);
    gaps.push({
      category: tier,
      label,
      message:
        count === 0
          ? `No ${label.toLowerCase()} on your shelf — a staple gap.`
          : `Light on ${label.toLowerCase()} — only ${count} item${count === 1 ? "" : "s"}.`,
    });
  }

  if ((tierCounts["spirits-liqueurs"] ?? 0) === 0) {
    gaps.push({
      category: "spirits-liqueurs",
      label: "Spirits & liqueurs",
      message: "No spirits or liqueurs yet — start with a gin, bourbon, or vermouth.",
    });
  }

  return gaps;
}

function buildInsights(input: {
  tierCounts: Partial<Record<InventoryTier, number>>;
  redundancies: CategoryRedundancy[];
  gaps: CategoryGap[];
  utilizationPercent: number;
  readyTonight: number;
  tasteLabel?: string;
}): string[] {
  const insights: string[] = [];

  if (input.tasteLabel) {
    insights.push(`Bar personality: ${input.tasteLabel}.`);
  }

  if (input.redundancies[0]) {
    insights.push(input.redundancies[0].message);
  }

  if (input.gaps[0]) {
    insights.push(input.gaps[0].message);
  }

  if (input.utilizationPercent < 50) {
    insights.push(
      `Only ${input.utilizationPercent}% of your bottles appear in a ready-to-pour drink — room to activate your shelf.`
    );
  } else if (input.readyTonight > 0) {
    insights.push(
      `${input.readyTonight} exact match${input.readyTonight === 1 ? "" : "es"} tonight — solid coverage.`
    );
  }

  const spirits = input.tierCounts["spirits-liqueurs"] ?? 0;
  const mixers = input.tierCounts.mixers ?? 0;
  const pantry = input.tierCounts.pantry ?? 0;

  if (spirits >= 4 && pantry === 0) {
    insights.push("Well stocked on spirits — bitters and a syrup would unlock a lot more.");
  } else if (spirits >= 3 && mixers < 2) {
    insights.push("Strong on spirits, light on mixers — juice and soda would stretch your shelf.");
  }

  return insights.slice(0, 4);
}

export function analyzeBarHealth(input: {
  barIds: string[];
  matches?: CocktailMatch[];
  favoriteIds?: string[];
  recentIds?: string[];
  reviewSignals?: ReviewSignal[];
  inventionFlavorProfiles?: string[][];
}): BarHealthReport | null {
  if (input.barIds.length === 0) return null;

  const matches = input.matches ?? matchCocktails(input.barIds);
  const tierCounts = countByTier(input.barIds);
  const redundancies = findRedundancies(tierCounts);
  const gaps = findGaps(tierCounts);
  const utilizationPercent = computeUtilization(input.barIds, matches);
  const readyTonight = matches.filter((m) => m.canMake).length;

  const tiersPresent = INVENTORY_TIERS.filter((tier) => (tierCounts[tier.id] ?? 0) > 0).length;
  const coverageScore = (tiersPresent / INVENTORY_TIERS.length) * 100;
  const redundancyPenalty = redundancies.length * 8;
  const gapPenalty = gaps.length * 6;

  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        utilizationPercent * 0.35 +
          coverageScore * 0.3 +
          Math.min(readyTonight / 5, 1) * 100 * 0.2 +
          (100 - redundancyPenalty - gapPenalty) * 0.15
      )
    )
  );

  const tasteProfile = buildTasteProfile({
    favoriteIds: input.favoriteIds ?? [],
    recentIds: input.recentIds ?? [],
    reviewSignals: input.reviewSignals,
    inventionFlavorProfiles: input.inventionFlavorProfiles,
  });

  return {
    score,
    grade: gradeFromScore(score),
    utilizationPercent,
    categoryCounts: tierCounts,
    redundancies,
    gaps,
    insights: buildInsights({
      tierCounts,
      redundancies,
      gaps,
      utilizationPercent,
      readyTonight,
      tasteLabel: tasteProfile?.personality.label,
    }),
    tasteProfile,
  };
}

/** Count makeable cocktails that use a given owned ingredient. */
export function countMakeableUses(
  ingredientId: string,
  barIds: string[],
  matches?: CocktailMatch[]
): number {
  const pool = matches ?? matchCocktails(barIds);
  return pool.filter(
    (m) =>
      m.canMake &&
      m.cocktail.ingredients.some((item) => item.ingredientId === ingredientId)
  ).length;
}

/** Count one-away cocktails that need this owned ingredient plus one buy. */
export function countOneAwayUses(
  ingredientId: string,
  barIds: string[],
  matches?: CocktailMatch[]
): number {
  const pool = matches ?? matchCocktails(barIds);
  return pool.filter(
    (m) =>
      m.missingCount === 1 &&
      m.cocktail.ingredients.some((item) => item.ingredientId === ingredientId)
  ).length;
}

export function ingredientUnlockPreview(
  barIds: string[],
  candidateId: string,
  precomputedMatches?: CocktailMatch[]
): { unlocks: number; movesToOneAway: number; examples: string[] } {
  const before = precomputedMatches ?? matchCocktails(barIds);
  const extended = [...barIds, candidateId];
  const examples: string[] = [];
  let unlocks = 0;
  let movesToOneAway = 0;

  for (const match of before) {
    if (match.canMake) continue;
    const after = matchSingleCocktail(match.cocktail, extended);
    if (after.canMake && !match.canMake) {
      unlocks += 1;
      if (examples.length < 6) examples.push(match.cocktail.name);
    } else if (after.missingCount === 1 && match.missingCount > 1) {
      movesToOneAway += 1;
    }
  }

  return { unlocks, movesToOneAway, examples };
}
