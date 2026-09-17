import { getBuyLabel } from "@/lib/ingredient-brands";
import { Ingredient } from "@/lib/types";
import { CommerceIngredient } from "@/lib/commerce/types";

const MEASUREMENT_NOISE =
  /\b\d+(?:\.\d+)?\s*(?:oz|ml|dash(?:es)?|drop(?:s)?|tsp|tbsp|cup|cups|part|parts)\b/gi;

/** Strip recipe amounts from accidental free-text before lookup. */
export function stripMeasurementNoise(text: string): string {
  return text.replace(MEASUREMENT_NOISE, " ").replace(/\s+/g, " ").trim();
}

/**
 * Map catalogue ingredient → commerce identity.
 * Preserves distinct products (e.g. Green Chartreuse vs Yellow Chartreuse).
 */
export function normalizeCommerceIngredient(ingredient: Ingredient): CommerceIngredient {
  const displayName = getBuyLabel(ingredient);
  const searchLabel = stripMeasurementNoise(displayName);

  return {
    ingredientId: ingredient.id,
    displayName,
    searchLabel: searchLabel || displayName,
    category: ingredient.category,
  };
}

export function normalizeCommerceIngredientId(
  ingredientId: string,
  resolve: (id: string) => Ingredient | undefined
): CommerceIngredient | null {
  const ingredient = resolve(ingredientId);
  if (!ingredient) return null;
  return normalizeCommerceIngredient(ingredient);
}
