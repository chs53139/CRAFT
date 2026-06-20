import { cocktails } from "@/lib/cocktail-data";
import { CocktailMatch } from "@/lib/types";
import { analyzeBarHealth } from "./bar-health";
import { getBestDrinkTonight } from "./best-tonight";
import { getNeverThinkToMakeMatch, getNeglectedBottleInsight } from "./discovery-modes";
import { getBestUnlockRecommendation } from "./unlock-graph";
import { scoreTasteFit } from "./taste-vector";
import { BestDrinkTonight, NeglectedBottleInsight, UnlockRecommendation } from "./types";

export type BarAdvice = {
  tonightsRecommendation: BestDrinkTonight | null;
  bestNextPurchase: UnlockRecommendation | null;
  hiddenGem: HiddenGemAdvice | null;
  neglectedBottle: NeglectedBottleAdvice | null;
};

export type HiddenGemAdvice = {
  match: CocktailMatch;
  explanation: string;
};

export type NeglectedBottleAdvice = {
  insight: NeglectedBottleInsight;
  suggestedMatch: CocktailMatch | null;
};

export type BarAdviceInput = {
  barIds: string[];
  favoriteIds: string[];
  recentIds: string[];
  matches: CocktailMatch[];
};

function buildHiddenGemExplanation(match: CocktailMatch): string {
  const { cocktail } = match;

  if (cocktail.drinkType === "mocktail") {
    return "Zero-proof, totally unexpected — and you've already got everything on hand.";
  }

  if (cocktail.obscurityScore >= 72) {
    return "Most people scroll right past this. Your bar is already set up for it.";
  }

  if (cocktail.flavorProfile.includes("bitter")) {
    return "A bitter, bold pour hiding in plain sight — worth shaking things up.";
  }

  if (cocktail.flavorProfile.includes("tropical")) {
    return "Vacation energy without leaving the kitchen. You've had the bottles for this.";
  }

  return "You've walked past this one before. Tonight might be the night.";
}

function pickDrinkForBottle(
  ingredientId: string,
  matches: CocktailMatch[],
  tasteVector?: Record<string, number>
): CocktailMatch | null {
  const ready = matches.filter(
    (m) =>
      m.canMake &&
      m.cocktail.ingredients.some((item) => item.ingredientId === ingredientId)
  );

  if (ready.length === 0) return null;

  if (!tasteVector || Object.keys(tasteVector).length === 0) {
    return ready[0] ?? null;
  }

  return ready.reduce((best, match) => {
    const bestScore = scoreTasteFit(best.cocktail, tasteVector);
    const nextScore = scoreTasteFit(match.cocktail, tasteVector);
    return nextScore > bestScore ? match : best;
  });
}

function findCocktailSlug(name: string): string | undefined {
  return cocktails.find((c) => c.name === name)?.id;
}

export function buildBarAdvice(input: BarAdviceInput): BarAdvice | null {
  if (input.barIds.length === 0) return null;

  const health = analyzeBarHealth({
    barIds: input.barIds,
    matches: input.matches,
    favoriteIds: input.favoriteIds,
    recentIds: input.recentIds,
  });

  const tasteVector = health?.tasteProfile?.vector;

  const tonightsRecommendation = getBestDrinkTonight({
    matches: input.matches,
    tasteVector,
    favoriteIds: input.favoriteIds,
    recentIds: input.recentIds,
  });

  const bestNextPurchase = getBestUnlockRecommendation(input.barIds, {
    tasteVector,
    categoryCounts: health?.categoryCounts,
    precomputedMatches: input.matches,
  });

  const hiddenMatch = getNeverThinkToMakeMatch(input.barIds, {
    tasteVector,
    favoriteIds: input.favoriteIds,
    recentIds: input.recentIds,
    excludeIds: tonightsRecommendation ? [tonightsRecommendation.match.cocktail.id] : [],
    matches: input.matches,
  });

  const hiddenGem = hiddenMatch
    ? {
        match: hiddenMatch,
        explanation: buildHiddenGemExplanation(hiddenMatch),
      }
    : null;

  const insight = getNeglectedBottleInsight(input.barIds, input.matches);
  let suggestedMatch = insight
    ? pickDrinkForBottle(insight.ingredient.id, input.matches, tasteVector)
    : null;

  if (!suggestedMatch && insight?.exampleCocktails[0]) {
    const slug = findCocktailSlug(insight.exampleCocktails[0]);
    if (slug) {
      suggestedMatch =
        input.matches.find((m) => m.cocktail.id === slug && m.canMake) ?? null;
    }
  }

  const neglectedBottle =
    insight && suggestedMatch
      ? { insight, suggestedMatch }
      : insight
        ? { insight, suggestedMatch: null }
        : null;

  return {
    tonightsRecommendation,
    bestNextPurchase,
    hiddenGem,
    neglectedBottle,
  };
}
