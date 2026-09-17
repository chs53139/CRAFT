export type ProductEventRow = {
  event_name: string;
  payload: Record<string, unknown>;
  created_at: string;
  session_id: string;
};

export type CraftPulseSummary = {
  windowDays: number;
  sessions: number;
  cocktailViews: number;
  searches: number;
  zeroResultSearches: number;
  favorites: number;
  shares: number;
  findNearbyClicks: number;
  topViewed: Array<{ cocktailId: string; count: number }>;
  topSearches: Array<{ searchKey: string; count: number }>;
  zeroResultSearchKeys: Array<{ searchKey: string; count: number }>;
  topMissingIngredients: Array<{ ingredientId: string; count: number }>;
  bestNextPurchase: Array<{ ingredientId: string; appearances: number; avgUnlock: number }>;
  commerceIntent: Array<{ ingredientId: string; count: number; context: string }>;
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

export function buildCraftPulseSummary(rows: ProductEventRow[], windowDays = 7): CraftPulseSummary {
  const sessions = new Set(rows.map((r) => r.session_id)).size;
  const cocktailViews = rows.filter((r) => r.event_name === "cocktail_viewed").length;
  const searches = rows.filter((r) => r.event_name === "cocktail_searched");
  const zeroResultSearches = searches.filter((r) => r.payload.zeroResults === true).length;
  const favorites =
    rows.filter((r) => r.event_name === "favorite_added").length;
  const shares = rows.filter((r) => r.event_name === "cocktail_shared").length;
  const findNearbyClicks = rows.filter((r) => r.event_name === "find_nearby_clicked").length;

  const topViewed = countBy(
    rows.filter((r) => r.event_name === "cocktail_viewed"),
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

  const zeroResultSearchKeys = countBy(
    searches.filter((r) => r.payload.zeroResults === true),
    (r) => String(r.payload.searchKey ?? ""),
    10
  )
    .filter((x) => x.key)
    .map(({ key, count }) => ({ searchKey: key, count }));

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

  return {
    windowDays,
    sessions,
    cocktailViews,
    searches: searches.length,
    zeroResultSearches,
    favorites,
    shares,
    findNearbyClicks,
    topViewed,
    topSearches,
    zeroResultSearchKeys,
    topMissingIngredients,
    bestNextPurchase,
    commerceIntent,
  };
}
