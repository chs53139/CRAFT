/** Normalized purchasable ingredient identity for commerce lookup (not recipe amounts). */
export type CommerceIngredient = {
  ingredientId: string;
  displayName: string;
  searchLabel: string;
  category: string;
};

export type CommerceProductQuery = {
  ingredient: CommerceIngredient;
  location?: CommerceLocation;
  /** Future: cocktail context for shopping-list handoffs */
  cocktailId?: string;
  cocktailName?: string;
};

export type CommerceLocation = {
  postalCode: string;
  countryCode?: string;
};

export type CommerceAttribution = {
  providerId?: string;
  affiliateId?: string;
  trackingToken?: string;
};

export type CommerceResultStatus = "integration_pending" | "external_handoff" | "ready";

/** Provider-neutral commerce outcome — never fabricate inventory or price. */
export type CommerceResult = {
  status: CommerceResultStatus;
  query: CommerceProductQuery;
  /** Human-readable search phrase for safe external handoff when no provider is connected */
  externalSearchQuery?: string;
  /** Future: retailer product URL with optional attribution */
  destinationUrl?: string;
  price?: never;
  inventory?: never;
  distanceMiles?: never;
  deliveryEstimate?: never;
  attribution?: CommerceAttribution;
  message: string;
};

export type CommerceProvider = {
  id: string;
  name: string;
  findNearby(query: CommerceProductQuery): Promise<CommerceResult>;
};

/** Future multi-item handoff (no cart integration in Phase 1). */
export type CommerceShoppingListHandoff = {
  items: CommerceProductQuery[];
  location?: CommerceLocation;
};
