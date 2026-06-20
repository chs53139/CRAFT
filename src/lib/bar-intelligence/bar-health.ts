import {
  getIngredientsByIds,
  matchCocktails,
  matchSingleCocktail,
} from "@/lib/cocktail-matching";
import {
  getShopCategory,
  SHOP_CATEGORIES,
  ShopCategory,
} from "@/lib/ingredient-categories";
import { CocktailMatch } from "@/lib/types";
import { buildTasteProfile } from "./taste-vector";
import { BarHealthReport, CategoryGap, CategoryRedundancy } from "./types";

const CATEGORY_MINIMUMS: Partial<Record<ShopCategory, number>> = {
  mixers: 2,
  bitters: 1,
  liqueurs: 1,
};

const REDUNDANCY_THRESHOLD = 3;

function gradeFromScore(score: number): BarHealthReport["grade"] {
  if (score >= 85) return "A";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  return "D";
}

function countByCategory(barIds: string[]): Partial<Record<ShopCategory, number>> {
  const counts: Partial<Record<ShopCategory, number>> = {};
  for (const ing of getIngredientsByIds(barIds)) {
    const cat = getShopCategory(ing.id, ing.name);
    counts[cat] = (counts[cat] ?? 0) + 1;
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
  categoryCounts: Partial<Record<ShopCategory, number>>
): CategoryRedundancy[] {
  const redundancies: CategoryRedundancy[] = [];

  for (const [category, count] of Object.entries(categoryCounts) as Array<
    [ShopCategory, number]
  >) {
    if (count < REDUNDANCY_THRESHOLD) continue;
    const label = SHOP_CATEGORIES.find((c) => c.id === category)?.label ?? category;
    redundancies.push({
      category,
      count,
      message: `${count} ${label.toLowerCase()} bottles — you may be over-indexed here.`,
    });
  }

  return redundancies.sort((a, b) => b.count - a.count);
}

function findGaps(categoryCounts: Partial<Record<ShopCategory, number>>): CategoryGap[] {
  const gaps: CategoryGap[] = [];

  for (const [category, minimum] of Object.entries(CATEGORY_MINIMUMS) as Array<
    [ShopCategory, number]
  >) {
    const count = categoryCounts[category] ?? 0;
    if (count >= minimum) continue;

    const label = SHOP_CATEGORIES.find((c) => c.id === category)?.label ?? category;
    gaps.push({
      category,
      label,
      message:
        count === 0
          ? `No ${label.toLowerCase()} on your shelf — a staple gap.`
          : `Light on ${label.toLowerCase()} — only ${count} item${count === 1 ? "" : "s"}.`,
    });
  }

  if ((categoryCounts.liqueurs ?? 0) === 0) {
    gaps.push({
      category: "liqueurs",
      label: "Liqueurs",
      message: "No amari or vermouth — bitter and stirred classics stay locked.",
    });
  }

  return gaps;
}

function buildInsights(input: {
  categoryCounts: Partial<Record<ShopCategory, number>>;
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

  const whiskey = input.categoryCounts.whiskey ?? 0;
  const spirits = input.categoryCounts.spirits ?? 0;
  const liqueurs = input.categoryCounts.liqueurs ?? 0;

  if (whiskey >= 3 && liqueurs === 0) {
    insights.push(
      `You own ${whiskey} whiskeys but no amari — adding Campari could unlock dozens of pours.`
    );
  } else if (spirits >= 3 && (input.categoryCounts.mixers ?? 0) < 2) {
    insights.push("Strong on spirits, light on mixers — juices and syrups would stretch your shelf.");
  }

  return insights.slice(0, 4);
}

export function analyzeBarHealth(input: {
  barIds: string[];
  matches?: CocktailMatch[];
  favoriteIds?: string[];
  recentIds?: string[];
}): BarHealthReport | null {
  if (input.barIds.length === 0) return null;

  const matches = input.matches ?? matchCocktails(input.barIds);
  const categoryCounts = countByCategory(input.barIds);
  const redundancies = findRedundancies(categoryCounts);
  const gaps = findGaps(categoryCounts);
  const utilizationPercent = computeUtilization(input.barIds, matches);
  const readyTonight = matches.filter((m) => m.canMake).length;

  const categoriesPresent = SHOP_CATEGORIES.filter(
    (c) => (categoryCounts[c.id] ?? 0) > 0
  ).length;
  const coverageScore = (categoriesPresent / SHOP_CATEGORIES.length) * 100;
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
  });

  return {
    score,
    grade: gradeFromScore(score),
    utilizationPercent,
    categoryCounts,
    redundancies,
    gaps,
    insights: buildInsights({
      categoryCounts,
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
export function countMakeableUses(ingredientId: string, barIds: string[]): number {
  return matchCocktails(barIds).filter(
    (m) =>
      m.canMake &&
      m.cocktail.ingredients.some((item) => item.ingredientId === ingredientId)
  ).length;
}

/** Count one-away cocktails that need this owned ingredient plus one buy. */
export function countOneAwayUses(ingredientId: string, barIds: string[]): number {
  return matchCocktails(barIds).filter(
    (m) =>
      m.missingCount === 1 &&
      m.cocktail.ingredients.some((item) => item.ingredientId === ingredientId)
  ).length;
}

export function ingredientUnlockPreview(
  barIds: string[],
  candidateId: string
): { unlocks: number; movesToOneAway: number; examples: string[] } {
  const before = matchCocktails(barIds);
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
