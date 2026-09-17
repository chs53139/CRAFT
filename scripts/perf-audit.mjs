/**
 * Local performance audit (no Supabase). Run: node scripts/perf-audit.mjs
 */
import { performance } from "node:perf_hooks";

function ms(start) {
  return Math.round(performance.now() - start);
}

async function main() {
  const results = { timestamp: new Date().toISOString(), phases: {} };

  let t = performance.now();
  const matching = await import("../src/lib/cocktail-matching.ts");
  results.phases.importCocktailMatchingMs = ms(t);

  t = performance.now();
  const barIds = ["gin", "campari", "sweet-vermouth", "bourbon", "angostura-bitters", "simple-syrup"];
  matching.clearMatchCache?.();
  const firstMatch = matching.matchCocktails(barIds);
  results.phases.firstMatchCocktailsMs = ms(t);
  results.phases.matchCount = firstMatch.length;
  results.phases.makeableCount = firstMatch.filter((m) => m.canMake).length;

  t = performance.now();
  matching.matchCocktails(barIds);
  results.phases.cachedMatchCocktailsMs = ms(t);

  t = performance.now();
  const { buildBarAdvice } = await import("../src/lib/bar-intelligence/bar-advice.ts");
  results.phases.importBarAdviceMs = ms(t);

  t = performance.now();
  buildBarAdvice({
    barIds,
    favoriteIds: [],
    recentIds: [],
    matches: firstMatch,
  });
  results.phases.buildBarAdviceMs = ms(t);

  t = performance.now();
  const search = await import("../src/lib/cocktail-search.ts");
  search.searchMatches?.("tiki rum", firstMatch);
  results.phases.searchMatchesMs = ms(t);

  t = performance.now();
  const discovery = await import("../src/lib/cocktail-discovery.ts");
  discovery.searchCatalogue?.("margarita");
  results.phases.searchCatalogueMs = ms(t);

  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
