export type FindNearbyContext =
  | "cocktail_detail"
  | "one_away"
  | "best_next_purchase"
  | "ingredient_list";

export type ProductEventName =
  | "cocktail_viewed"
  | "cocktail_searched"
  | "discovery_filter_used"
  | "one_away_viewed"
  | "missing_ingredient_selected"
  | "best_next_purchase_viewed"
  | "find_nearby_clicked"
  | "favorite_added"
  | "favorite_removed"
  | "cocktail_shared"
  | "bar_ingredient_added"
  | "bar_ingredient_removed"
  | "mocktail_viewed";

export type ProductEventPayload = {
  cocktail_viewed: { cocktailId: string; drinkType: string };
  cocktail_searched: { queryLength: number; resultCount: number; hasExclusion: boolean };
  discovery_filter_used: { filter: string; value: string };
  one_away_viewed: { cocktailId: string; missingIngredientId: string };
  missing_ingredient_selected: { ingredientId: string; cocktailId?: string };
  best_next_purchase_viewed: { ingredientId: string; unlocksCount: number };
  find_nearby_clicked: { ingredientId: string; context: FindNearbyContext };
  favorite_added: { cocktailId: string };
  favorite_removed: { cocktailId: string };
  cocktail_shared: { cocktailId: string; method: "native" | "clipboard" };
  bar_ingredient_added: { ingredientId: string };
  bar_ingredient_removed: { ingredientId: string };
  mocktail_viewed: { cocktailId: string };
};

export type ProductEvent = {
  [K in ProductEventName]: { name: K; payload: ProductEventPayload[K]; at: string };
}[ProductEventName];

export type AnalyticsProvider = {
  id: string;
  track(event: ProductEvent): void | Promise<void>;
};
