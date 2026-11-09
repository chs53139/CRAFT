import { canonicalIngredientId } from "@/lib/ingredient-intelligence";
import { ShoppingListItem } from "@/lib/shopping-list/types";

export function appendShoppingListItem(
  prev: ShoppingListItem[],
  row: ShoppingListItem
): { items: ShoppingListItem[]; added: boolean } {
  row = { ...row, ingredientId: canonicalIngredientId(row.ingredientId) };
  if (prev.some((x) => canonicalIngredientId(x.ingredientId) === row.ingredientId)) {
    return { items: prev, added: false };
  }
  return { items: [row, ...prev], added: true };
}
