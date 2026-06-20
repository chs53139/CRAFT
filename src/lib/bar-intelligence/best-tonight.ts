import { CocktailMatch } from "@/lib/types";
import { scoreTasteFit } from "./taste-vector";
import { BestDrinkTonight, TasteVector } from "./types";

function buildTonightReason(input: {
  match: CocktailMatch;
  tasteFit: number;
  isFavorite: boolean;
}): string {
  const { match, tasteFit, isFavorite } = input;

  if (isFavorite) {
    return "A favorite you can pour right now — exact match on your shelf.";
  }

  if (tasteFit >= 0.75) {
    return "Lines up with what you've been favoriting — a safe bet you'll actually enjoy.";
  }

  if (match.cocktail.obscurityScore >= 60) {
    return "A little adventurous, and you won't need a liquor store run.";
  }

  if (match.cocktail.drinkType === "mocktail") {
    return "Zero-proof, ready now, and not what everyone else is pouring.";
  }

  return "The best balanced pick from what's on your shelf tonight.";
}

export function getBestDrinkTonight(input: {
  matches: CocktailMatch[];
  tasteVector?: TasteVector;
  favoriteIds: string[];
  recentIds: string[];
}): BestDrinkTonight | null {
  const recentSet = new Set(input.recentIds.slice(0, 5));
  const favoriteSet = new Set(input.favoriteIds);

  const pool = input.matches.filter((m) => m.canMake && !recentSet.has(m.cocktail.id));

  if (pool.length === 0) {
    const fallback = input.matches.find((m) => m.canMake);
    if (!fallback) return null;
    const tasteFit = input.tasteVector
      ? scoreTasteFit(fallback.cocktail, input.tasteVector)
      : 0.5;
    return {
      match: fallback,
      tasteMatchPercent: Math.round(tasteFit * 100),
      reason: buildTonightReason({
        match: fallback,
        tasteFit,
        isFavorite: favoriteSet.has(fallback.cocktail.id),
      }),
    };
  }

  let best: CocktailMatch | null = null;
  let bestScore = -1;
  let bestTasteFit = 0.5;

  for (const match of pool) {
    const tasteFit = input.tasteVector
      ? scoreTasteFit(match.cocktail, input.tasteVector)
      : 0.5;
    const favoriteBoost = favoriteSet.has(match.cocktail.id) ? 25 : 0;
    const score =
      tasteFit * 50 +
      favoriteBoost +
      match.cocktail.obscurityScore * 0.15 +
      (match.cocktail.popularityScore > 70 ? 5 : 0);

    if (score > bestScore) {
      bestScore = score;
      best = match;
      bestTasteFit = tasteFit;
    }
  }

  if (!best) return null;

  return {
    match: best,
    tasteMatchPercent: Math.round(bestTasteFit * 100),
    reason: buildTonightReason({
      match: best,
      tasteFit: bestTasteFit,
      isFavorite: favoriteSet.has(best.cocktail.id),
    }),
  };
}
