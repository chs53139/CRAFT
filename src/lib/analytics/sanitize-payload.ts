const BLOCKED_KEY =
  /zip|postal|email|lat|lng|geo|location|fingerprint|image|photo|base64|exif/i;

/** Strip keys that must never be stored in product analytics. */
export function sanitizeAnalyticsPayload(
  payload: Record<string, unknown>
): Record<string, unknown> {
  const copy = { ...payload };
  for (const key of Object.keys(copy)) {
    if (BLOCKED_KEY.test(key)) {
      delete copy[key];
    }
  }
  return copy;
}

export const PERSISTED_PRODUCT_EVENT_NAMES = [
  "cocktail_viewed",
  "mocktail_viewed",
  "cocktail_searched",
  "discovery_filter_used",
  "one_away_viewed",
  "missing_ingredient_selected",
  "best_next_purchase_viewed",
  "find_nearby_clicked",
  "favorite_added",
  "favorite_removed",
  "cocktail_shared",
  "bar_ingredient_added",
  "bar_ingredient_removed",
  "shopping_list_item_added",
  "shopping_list_item_removed",
  "shopping_list_item_purchased",
  "shopping_list_viewed",
  "cocktail_made",
  "cocktail_rated",
  "install_prompt_shown",
  "install_started",
  "install_completed",
  "install_dismissed",
  "bar_scan_started",
  "bar_scan_confirmed",
] as const;

export type PersistedProductEventName = (typeof PERSISTED_PRODUCT_EVENT_NAMES)[number];

export function isPersistedProductEventName(name: string): name is PersistedProductEventName {
  return (PERSISTED_PRODUCT_EVENT_NAMES as readonly string[]).includes(name);
}
