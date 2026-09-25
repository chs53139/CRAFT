export type FindNearbyContext =
  | "cocktail_detail"
  | "one_away"
  | "best_next_purchase"
  | "ingredient_list";

export type ShoppingListSource =
  | "best_next_purchase"
  | "one_away"
  | "cocktail_detail"
  | "find_nearby"
  | "manual";

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
  | "mocktail_viewed"
  | "shopping_list_item_added"
  | "shopping_list_item_removed"
  | "shopping_list_item_purchased"
  | "shopping_list_viewed"
  | "cocktail_made"
  | "cocktail_rated"
  | "install_prompt_shown"
  | "install_started"
  | "install_completed"
  | "install_dismissed"
  | "bar_scan_started"
  | "bar_scan_confirmed";

export type ProductEventPayload = {
  cocktail_viewed: {
    cocktailId: string;
    drinkType: string;
    category?: string;
    rarityBucket?: string;
  };
  cocktail_searched: {
    queryLength: number;
    resultCount: number;
    hasExclusion: boolean;
    searchKey?: string;
    zeroResults?: boolean;
  };
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
  mocktail_viewed: { cocktailId: string; category?: string; rarityBucket?: string };
  shopping_list_item_added: { ingredientId: string; source: ShoppingListSource };
  shopping_list_item_removed: { ingredientId: string };
  shopping_list_item_purchased: { ingredientId: string };
  shopping_list_viewed: Record<string, never>;
  cocktail_made: { cocktailId: string };
  cocktail_rated: { cocktailId: string; rating: number };
  install_prompt_shown: { platform: "ios" | "android" | "other" };
  install_started: { platform: "ios" | "android" | "other" };
  install_completed: { platform: "ios" | "android" | "other" };
  install_dismissed: { platform: "ios" | "android" | "other" };
  bar_scan_started: Record<string, never>;
  bar_scan_confirmed: { ingredientCount: number };
};

export type ProductEvent = {
  [K in ProductEventName]: { name: K; payload: ProductEventPayload[K]; at: string };
}[ProductEventName];

export type AnalyticsProvider = {
  id: string;
  track(event: ProductEvent): void | Promise<void>;
};
