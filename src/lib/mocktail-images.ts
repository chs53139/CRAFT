/**
 * cocktail.glass only hosts photos for the alcoholic catalogue.
 * Map each mocktail slug to the closest visual match on the CDN.
 */
export const MOCKTAIL_IMAGE_SLUGS: Record<string, string> = {
  "shirley-temple": "shirley-temple",
  "virgin-mojito": "virgin-mojito",
  "virgin-pina-colada": "pina-colada",
  "roy-rogers": "shirley-temple",
  "cucumber-garden-cooler": "gin-and-tonic",
  "hibiscus-ginger-fizz": "french-75",
  "sparkling-rosemary-grapefruit": "paloma",
  "salted-vanilla-cola-highball": "cuba-libre",
  "green-detox-refresher": "mojito",
  "ginger-turmeric-spritzer": "moscow-mule",
  "lavender-honey-lemonade": "tom-collins",
  "coconut-mint-hydration-cooler": "mojito",
  "virgin-sunrise-punch": "tequila-sunrise",
  "sparkling-berry-party-cup": "bellini",
  "tropical-sunset-spritz": "aperol-spritz",
  "citrus-celebration-punch": "planters-punch",
  "iced-vanilla-coffee-shakerato": "espresso-martini",
  "cold-brew-tonic": "espresso-martini",
  "maple-mocha-cooler": "espresso-martini",
  "espresso-sparkler": "espresso-martini",
  "iced-london-fog": "hot-toddy",
  "green-tea-ginger-refresher": "moscow-mule",
  "chai-spiced-sparkler": "hot-toddy",
  "hibiscus-iced-tea-lemonade": "tom-collins",
};

export function resolveMocktailImageSlug(slug: string): string | undefined {
  return MOCKTAIL_IMAGE_SLUGS[slug];
}
