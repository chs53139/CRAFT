/**
 * Trusted variant → parent CDN slug only (same drink, verified on cocktail.glass).
 * Generated via: node scripts/generate-image-overrides.mjs
 * Do not add family-pool proxies (e.g. unrelated Mai Tai for other Tiki drinks).
 */
export const COCKTAIL_IMAGE_SLUGS: Record<string, string> = {
  "aviation-violette": "aviation",
  "bees-knees-lavender": "bees-knees",
  "blood-and-sand-smoky": "blood-and-sand",
  "boulevardier-perfect": "boulevardier",
  "bronx-cocktail": "bronx",
  "caipirinha-passion": "caipirinha",
  "chartreuse-swizzle-yellow": "chartreuse-swizzle",
  "eggnog-spiked": "eggnog",
  "french-75-cognac": "french-75",
  "gold-rush-honey": "gold-rush",
  "hemingway-daiquiri-papa-doble": "hemingway-daiquiri",
  "hot-toddy-spiced-rum": "hot-toddy",
  "irish-coffee-modern": "irish-coffee",
  "jungle-bird-mezcal": "jungle-bird",
  "mai-tai-royal-hawaiian": "mai-tai",
  "mai-tai-trader-vics": "mai-tai",
  "mulled-wine-spritz": "mulled-wine",
  "navy-grog-modern": "navy-grog",
  "old-pal-rye": "old-pal",
  "paloma-smoky": "paloma",
  "paper-plane-split": "paper-plane",
  "penicillin-smoky": "penicillin",
  "pisco-sour-amargo": "pisco-sour",
  "saturn-variation": "saturn",
  "sazerac-split-base": "sazerac",
  "singapore-sling-modern": "singapore-sling",
  "ti-punch-spiced": "ti-punch",
  "tradewinds": "trade-winds",
  "ward-eight-boston": "ward-eight",
};

export function resolveCocktailImageOverride(slug: string): string | undefined {
  return COCKTAIL_IMAGE_SLUGS[slug];
}
