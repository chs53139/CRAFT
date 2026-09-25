"use client";

import { ShoppingListSource } from "@/lib/shopping-list/types";
import { useShoppingList } from "@/components/ShoppingListProvider";

type Props = {
  ingredientId: string;
  source?: ShoppingListSource;
  cocktailId?: string;
  className?: string;
  /** Compact chip on cards; subtle text link in Find Nearby sheet. */
  presentation?: "chip" | "sheet";
};

export function AddToShoppingListButton({
  ingredientId,
  source,
  cocktailId,
  className = "",
  presentation = "chip",
}: Props) {
  const { hasIngredient, addItem, removeItem } = useShoppingList();
  const onList = hasIngredient(ingredientId);

  const label =
    presentation === "sheet"
      ? onList
        ? "On your shopping list"
        : "Add to shopping list"
      : onList
        ? "On list"
        : "+ List";

  return (
    <button
      type="button"
      className={
        presentation === "sheet"
          ? `find-nearby-list-link ${onList ? "find-nearby-list-link-saved" : ""} ${className}`
          : `shopping-list-chip ${onList ? "shopping-list-chip-active" : ""} ${className}`
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onList) removeItem(ingredientId);
        else addItem({ ingredientId, source, cocktailId });
      }}
    >
      {presentation === "sheet" && !onList ? "+ " : null}
      {label}
    </button>
  );
}
