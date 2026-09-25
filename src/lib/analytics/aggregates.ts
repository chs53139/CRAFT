export type ProductEventRow = {
  event_name: string;
  payload: Record<string, unknown>;
  created_at: string;
  session_id: string;
};

export type ZeroResultSearchRow = {
  query: string;
  count: number;
  lastSeen: string;
};

export type CraftPulseRates = {
  /** Zero-result searches / all searches in window */
  zeroResultSearchRate: number | null;
  /** Favorite adds / cocktail views */
  favoriteAddsPerView: number | null;
  /** Shares / cocktail views */
  sharesPerView: number | null;
  /** Find Nearby clicks / Best Next Purchase impressions */
  findNearbyPerBnpView: number | null;
  /** Find Nearby clicks / One Away panel views */
  findNearbyPerOneAwayView: number | null;
};

export type CraftPulseSummary = {
  windowDays: number;
  sessions: number;
  returningSessions: number;
  cocktailViews: number;
  searches: number;
  zeroResultSearches: number;
  favorites: number;
  shares: number;
  oneAwayViews: number;
  missingIngredientSelections: number;
  bestNextPurchaseViews: number;
  findNearbyClicks: number;
  shoppingListAdds: number;
  shoppingListPurchased: number;
  cocktailsMade: number;
  barScanConfirmed: number;
  installPrompts: number;
  topViewed: Array<{ cocktailId: string; count: number }>;
  topFavorited: Array<{ cocktailId: string; count: number }>;
  topShared: Array<{ cocktailId: string; count: number }>;
  topSearches: Array<{ searchKey: string; count: number }>;
  zeroResultSearchRows: ZeroResultSearchRow[];
  topMissingIngredients: Array<{ ingredientId: string; count: number }>;
  bestNextPurchase: Array<{ ingredientId: string; appearances: number; avgUnlock: number }>;
  commerceIntent: Array<{ ingredientId: string; count: number; context: string }>;
  rates: CraftPulseRates;
};

function countBy<T>(items: T[], keyFn: (item: T) => string | undefined, limit = 10) {
  const map = new Map<string, number>();
  for (const item of items) {
    const key = keyFn(item);
    if (!key) continue;
    map.set(key, (map.get(key) ?? 0) + 1);
  }
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function aggregateZeroResultSearches(
  searches: ProductEventRow[],
  limit = 15
): ZeroResultSearchRow[] {
  const map = new Map<string, { count: number; lastSeen: string }>();
  for (const row of searches) {
    if (row.payload.zeroResults !== true) continue;
    const query = String(row.payload.searchKey ?? "").trim();
    if (!query) continue;
    const prev = map.get(query);
    if (!prev) {
      map.set(query, { count: 1, lastSeen: row.created_at });
    } else {
      const lastSeen = row.created_at > prev.lastSeen ? row.created_at : prev.lastSeen;
      map.set(query, { count: prev.count + 1, lastSeen });
    }
  }
  return [...map.entries()]
    .map(([query, { count, lastSeen }]) => ({ query, count, lastSeen }))
    .sort((a, b) => b.count - a.count || b.lastSeen.localeCompare(a.lastSeen))
    .slice(0, limit);
}

function countReturningSessions(rows: ProductEventRow[]): number {
  const daysBySession = new Map<string, Set<string>>();
  for (const row of rows) {
    const day = row.created_at.slice(0, 10);
    if (!day) continue;
    const set = daysBySession.get(row.session_id) ?? new Set<string>();
    set.add(day);
    daysBySession.set(row.session_id, set);
  }
  let returning = 0;
  for (const days of daysBySession.values()) {
    if (days.size >= 2) returning += 1;
  }
  return returning;
}

function safeRatio(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 1000;
}

export function buildCraftPulseSummary(rows: ProductEventRow[], windowDays = 7): CraftPulseSummary {
  const sessions = new Set(rows.map((r) => r.session_id)).size;
  const returningSessions = countReturningSessions(rows);
  const cocktailViews = rows.filter((r) => r.event_name === "cocktail_viewed").length;
  const searches = rows.filter((r) => r.event_name === "cocktail_searched");
  const zeroResultSearches = searches.filter((r) => r.payload.zeroResults === true).length;
  const favorites = rows.filter((r) => r.event_name === "favorite_added").length;
  const shares = rows.filter((r) => r.event_name === "cocktail_shared").length;
  const oneAwayViews = rows.filter((r) => r.event_name === "one_away_viewed").length;
  const missingIngredientSelections = rows.filter(
    (r) => r.event_name === "missing_ingredient_selected"
  ).length;
  const bestNextPurchaseViews = rows.filter(
    (r) => r.event_name === "best_next_purchase_viewed"
  ).length;
  const findNearbyClicks = rows.filter((r) => r.event_name === "find_nearby_clicked").length;
  const shoppingListAdds = rows.filter((r) => r.event_name === "shopping_list_item_added").length;
  const shoppingListPurchased = rows.filter(
    (r) => r.event_name === "shopping_list_item_purchased"
  ).length;
  const cocktailsMade = rows.filter((r) => r.event_name === "cocktail_made").length;
  const barScanConfirmed = rows.filter((r) => r.event_name === "bar_scan_confirmed").length;
  const installPrompts = rows.filter((r) => r.event_name === "install_prompt_shown").length;

  const topViewed = countBy(
    rows.filter((r) => r.event_name === "cocktail_viewed"),
    (r) => String(r.payload.cocktailId ?? ""),
    10
  ).map(({ key, count }) => ({ cocktailId: key, count }));

  const topFavorited = countBy(
    rows.filter((r) => r.event_name === "favorite_added"),
    (r) => String(r.payload.cocktailId ?? ""),
    10
  ).map(({ key, count }) => ({ cocktailId: key, count }));

  const topShared = countBy(
    rows.filter((r) => r.event_name === "cocktail_shared"),
    (r) => String(r.payload.cocktailId ?? ""),
    10
  ).map(({ key, count }) => ({ cocktailId: key, count }));

  const topSearches = countBy(
    searches,
    (r) => String(r.payload.searchKey ?? ""),
    10
  )
    .filter((x) => x.key)
    .map(({ key, count }) => ({ searchKey: key, count }));

  const zeroResultSearchRows = aggregateZeroResultSearches(searches);

  const oneAway = rows.filter((r) => r.event_name === "one_away_viewed");
  const topMissingIngredients = countBy(
    oneAway,
    (r) => String(r.payload.missingIngredientId ?? ""),
    10
  ).map(({ key, count }) => ({ ingredientId: key, count }));

  const bnp = rows.filter((r) => r.event_name === "best_next_purchase_viewed");
  const bnpMap = new Map<string, { sum: number; n: number }>();
  for (const row of bnp) {
    const id = String(row.payload.ingredientId ?? "");
    if (!id) continue;
    const unlock = Number(row.payload.unlocksCount ?? 0);
    const prev = bnpMap.get(id) ?? { sum: 0, n: 0 };
    bnpMap.set(id, { sum: prev.sum + unlock, n: prev.n + 1 });
  }
  const bestNextPurchase = [...bnpMap.entries()]
    .map(([ingredientId, { sum, n }]) => ({
      ingredientId,
      appearances: n,
      avgUnlock: n > 0 ? Math.round((sum / n) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.appearances - a.appearances)
    .slice(0, 10);

  const commerceIntent = countBy(
    rows.filter((r) => r.event_name === "find_nearby_clicked"),
    (r) => `${r.payload.ingredientId ?? ""}|${r.payload.context ?? ""}`,
    12
  ).map(({ key, count }) => {
    const [ingredientId, context] = key.split("|");
    return { ingredientId, context, count };
  });

  const rates: CraftPulseRates = {
    zeroResultSearchRate: safeRatio(zeroResultSearches, searches.length),
    favoriteAddsPerView: safeRatio(favorites, cocktailViews),
    sharesPerView: safeRatio(shares, cocktailViews),
    findNearbyPerBnpView: safeRatio(findNearbyClicks, bestNextPurchaseViews),
    findNearbyPerOneAwayView: safeRatio(findNearbyClicks, oneAwayViews),
  };

  return {
    windowDays,
    sessions,
    returningSessions,
    cocktailViews,
    searches: searches.length,
    zeroResultSearches,
    favorites,
    shares,
    oneAwayViews,
    missingIngredientSelections,
    bestNextPurchaseViews,
    findNearbyClicks,
    shoppingListAdds,
    shoppingListPurchased,
    cocktailsMade,
    barScanConfirmed,
    installPrompts,
    topViewed,
    topFavorited,
    topShared,
    topSearches,
    zeroResultSearchRows,
    topMissingIngredients,
    bestNextPurchase,
    commerceIntent,
    rates,
  };
}
