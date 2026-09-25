"use client";

import { ShoppingListSource } from "@/lib/shopping-list/types";
import { useShoppingList } from "@/components/ShoppingListProvider";

type Props = {
  ingredientId: string;
  source?: ShoppingListSource;
  cocktailId?: string;
  className?: string;
};

export function AddToShoppingListButton({
  ingredientId,
  source,
  cocktailId,
  className = "",
}: Props) {
  const { hasIngredient, addItem, removeItem } = useShoppingList();
  const onList = hasIngredient(ingredientId);

  return (
    <button
      type="button"
      className={`shopping-list-chip ${onList ? "shopping-list-chip-active" : ""} ${className}`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onList) removeItem(ingredientId);
        else addItem({ ingredientId, source, cocktailId });
      }}
    >
      {onList ? "On list" : "+ List"}
    </button>
  );
}
