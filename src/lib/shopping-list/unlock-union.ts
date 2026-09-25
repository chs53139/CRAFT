import { matchCocktails } from "@/lib/cocktail-matching";
import { ingredientUnlockPreview } from "@/lib/bar-intelligence/bar-health";

/** New exact-make cocktails unlocked by adding one ingredient (not summed across overlaps). */
export function countSingleIngredientUnlocks(
  barIds: string[],
  ingredientId: string,
  precomputedMatches?: ReturnType<typeof matchCocktails>
): { count: number; examples: string[] } {
  const preview = ingredientUnlockPreview(barIds, ingredientId, precomputedMatches);
  return { count: preview.unlocks, examples: preview.examples };
}

/**
 * Union of newly makeable cocktails when adding ALL listed ingredients at once.
 * Does NOT sum per-ingredient counts (avoids double-counting overlapping unlocks).
 */
export function countUnionUnlocks(
  barIds: string[],
  ingredientIds: string[],
  precomputedMatches?: ReturnType<typeof matchCocktails>
): { count: number; examples: string[] } {
  const uniqueAdds = [...new Set(ingredientIds.filter((id) => !barIds.includes(id)))];
  if (uniqueAdds.length === 0) return { count: 0, examples: [] };

  const before = precomputedMatches ?? matchCocktails(barIds);
  const beforeMakeable = new Set(before.filter((m) => m.canMake).map((m) => m.cocktail.id));
  const extended = [...new Set([...barIds, ...uniqueAdds])];
  const after = matchCocktails(extended);

  const newly = after.filter((m) => m.canMake && !beforeMakeable.has(m.cocktail.id));
  return {
    count: newly.length,
    examples: newly.slice(0, 6).map((m) => m.cocktail.name),
  };
}
