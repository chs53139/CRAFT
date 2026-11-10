/** Exact identities only; never put derived produce or spirit families here. */
const EXACT_ALIASES: Readonly<Record<string, string>> = {
  "soda-water": "club-soda", limes: "lime", "whole-lime": "lime", "whole-limes": "lime",
  lemons: "lemon", "whole-lemon": "lemon", "whole-lemons": "lemon",
  "fresh-lime-juice": "lime-juice", "fresh-lemon-juice": "lemon-juice", whisky: "whiskey",
};
export function canonicalIngredientId(value: string): string {
  if (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) return Object.hasOwn(EXACT_ALIASES, value) ? EXACT_ALIASES[value] : value;
  const id = value.trim().toLowerCase().replace(/[\s_]+/g, "-");
  return Object.hasOwn(EXACT_ALIASES, id) ? EXACT_ALIASES[id] : id;
}
/** Persist identity only. Derived supplies never become owned inventory. */
export function normalizeIngredientIds(ids: readonly string[]): string[] {
  return [...new Set(ids.map(canonicalIngredientId).filter(Boolean))];
}
/** Directional, non-transitive. No automatic peel, zest, or garnish. */
export const DERIVED_INGREDIENTS: Readonly<Record<string, readonly string[]>> = {
  lime: ["lime-juice"], lemon: ["lemon-juice"],
};
export function suppliedIngredientIds(ids: readonly string[]): string[] {
  return [...new Set(normalizeIngredientIds(ids).flatMap((id) => [id, ...(Object.hasOwn(DERIVED_INGREDIENTS, id) ? DERIVED_INGREDIENTS[id] : [])]))];
}
export function ingredientSupplies(ownedId: string, requiredId: string): boolean {
  return suppliedIngredientIds([ownedId]).includes(canonicalIngredientId(requiredId));
}
export function isAmbiguousIngredient(value: string): boolean {
  return ["whiskey", "rum", "tequila", "brandy"].includes(canonicalIngredientId(value));
}
