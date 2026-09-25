export type ShoppingListSource =
  | "best_next_purchase"
  | "one_away"
  | "cocktail_detail"
  | "find_nearby"
  | "manual";

export type ShoppingListItem = {
  ingredientId: string;
  addedAt: string;
  source?: ShoppingListSource;
  cocktailId?: string;
};
