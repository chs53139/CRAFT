import { getIngredientsByIds, matchCocktails } from "@/lib/cocktail-matching";
import { countMakeableUses, countOneAwayUses } from "./bar-health";
import { UnderutilizedBottle } from "./types";

export function getUnderutilizedBottles(
  barIds: string[],
  limit = 5
): UnderutilizedBottle[] {
  if (barIds.length === 0) return [];

  const matches = matchCocktails(barIds);

  return getIngredientsByIds(barIds)
    .map((ingredient) => {
      const makeableCount = countMakeableUses(ingredient.id, barIds, matches);
      const oneAwayCount = countOneAwayUses(ingredient.id, barIds, matches);
      const exampleCocktails = matches
        .filter(
          (m) =>
            (m.canMake || m.missingCount <= 2) &&
            m.cocktail.ingredients.some((item) => item.ingredientId === ingredient.id)
        )
        .slice(0, 3)
        .map((m) => m.cocktail.name);

      const neglectScore = (10 - Math.min(makeableCount, 10)) * 2 + oneAwayCount;

      return {
        ingredient,
        makeableCount,
        oneAwayCount,
        exampleCocktails,
        neglectScore,
        message:
          makeableCount === 0
            ? `${ingredient.name} isn't in any ready pour yet.`
            : `${ingredient.name} only shows up in ${makeableCount} ready drink${makeableCount === 1 ? "" : "s"}.`,
      };
    })
    .filter((item) => item.makeableCount <= 3)
    .sort((a, b) => b.neglectScore - a.neglectScore)
    .slice(0, limit)
    .map(({ neglectScore: _score, ...rest }) => rest);
}
