import { cocktails, cocktailCount, ingredients } from "@/lib/cocktail-data";
import { getBuyLabel } from "@/lib/ingredient-brands";
import { getIngredientCostUsd } from "@/lib/ingredient-costs";
import { CocktailMatch, Ingredient, IngredientRecommendation } from "@/lib/types";

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

export function matchCocktails(myBarIds: string[]): CocktailMatch[] {
  const barSet = new Set(myBarIds);

  return cocktails.map((cocktail) => {
    const missing = cocktail.ingredients
      .map((ci) => ingredientMap.get(ci.ingredientId))
      .filter((ing): ing is Ingredient => !!ing && !barSet.has(ing.id));

    const missingCount = missing.length;

    return {
      cocktail,
      missing,
      missingCount,
      canMake: missingCount === 0,
    };
  });
}

export function getCocktailById(id: string) {
  return cocktails.find((c) => c.id === id);
}

export function searchCocktails(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return cocktails;
  return cocktails.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.flavorProfile.some((f) => f.includes(q))
  );
}

const EXAMPLE_LIMIT = 6;

/**
 * Finds the missing ingredient that unlocks the greatest number of
 * additional cocktails you can fully make with your current bar.
 */
export function getBestNextIngredient(
  barIds: string[]
): IngredientRecommendation | null {
  const barSet = new Set(barIds);
  const before = matchCocktails(barIds);
  const candidates = ingredients.filter((ing) => !barSet.has(ing.id));

  if (candidates.length === 0) return null;

  let best: IngredientRecommendation | null = null;
  let bestUnlocks = 0;

  for (const ingredient of candidates) {
    const after = matchCocktails([...barIds, ingredient.id]);
    const newlyUnlocked: string[] = [];

    for (const a of after) {
      const b = before.find((x) => x.cocktail.id === a.cocktail.id);
      if (b && a.canMake && !b.canMake) {
        newlyUnlocked.push(a.cocktail.name);
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
