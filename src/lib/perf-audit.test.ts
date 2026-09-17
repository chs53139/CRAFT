import { describe, expect, it } from "vitest";
import { buildBarAdvice } from "@/lib/bar-intelligence/bar-advice";
import { clearMatchCache, cocktailCount, matchCocktails } from "@/lib/cocktail-matching";
import { searchCatalogue } from "@/lib/cocktail-discovery";
import { searchMatches } from "@/lib/cocktail-search";

const SAMPLE_BAR = [
  "gin",
  "campari",
  "sweet-vermouth",
  "bourbon",
  "angostura-bitters",
  "simple-syrup",
];

describe("perf audit (local catalogue)", () => {
  it("records matching and search timings", () => {
    clearMatchCache();

    const t0 = performance.now();
    const matches = matchCocktails(SAMPLE_BAR);
    const firstMatchMs = performance.now() - t0;

    const t1 = performance.now();
    matchCocktails(SAMPLE_BAR);
    const cachedMatchMs = performance.now() - t1;

    const t2 = performance.now();
    buildBarAdvice({
      barIds: SAMPLE_BAR,
      favoriteIds: [],
      recentIds: [],
      matches,
    });
    const barAdviceMs = performance.now() - t2;

    const t3 = performance.now();
    searchMatches("tiki rum", matches);
    const searchMs = performance.now() - t3;

    const t4 = performance.now();
    searchCatalogue("margarita");
    const catalogueSearchMs = performance.now() - t4;

    const report = {
      cocktailCount,
      firstMatchCocktailsMs: Math.round(firstMatchMs),
      cachedMatchCocktailsMs: Math.round(cachedMatchMs),
      buildBarAdviceMs: Math.round(barAdviceMs),
      searchMatchesMs: Math.round(searchMs),
      searchCatalogueMs: Math.round(catalogueSearchMs),
      makeableOnSampleBar: matches.filter((m) => m.canMake).length,
    };

    console.log("PERF_AUDIT", JSON.stringify(report));
    expect(matches.length).toBe(cocktailCount);
  });
});
