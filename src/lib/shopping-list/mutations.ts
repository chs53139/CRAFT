import { ShoppingListItem } from "@/lib/shopping-list/types";

export function appendShoppingListItem(
  prev: ShoppingListItem[],
  row: ShoppingListItem
): { items: ShoppingListItem[]; added: boolean } {
  if (prev.some((x) => x.ingredientId === row.ingredientId)) {
    return { items: prev, added: false };
  }
  return { items: [row, ...prev], added: true };
}
