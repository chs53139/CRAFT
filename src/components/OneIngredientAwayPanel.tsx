"use client";

import { AddToShoppingListButton } from "@/components/AddToShoppingListButton";
import { FindNearbyButton } from "@/components/FindNearbySheet";
import { Ingredient } from "@/lib/types";

type Props = {
  ingredient: Ingredient;
  cocktailId: string;
  compact?: boolean;
};

export function OneIngredientAwayPanel({ ingredient, cocktailId, compact }: Props) {
  return (
    <div className={compact ? "one-away-panel one-away-panel-compact" : "one-away-panel"}>
      <p className="one-away-panel-eyebrow">You&apos;re one ingredient away</p>
      <p className="one-away-panel-name">{ingredient.name}</p>
      <div className="one-away-panel-actions">
        <FindNearbyButton
          ingredient={ingredient}
          context="one_away"
          cocktailId={cocktailId}
          className="one-away-panel-action"
        />
        <AddToShoppingListButton
          ingredientId={ingredient.id}
          source="one_away"
          cocktailId={cocktailId}
        />
      </div>
    </div>
  );
}
