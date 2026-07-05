import { describe, expect, it } from "vitest";
import {
  applyDiscoveryFilters,
  countMakeable,
  sortDiscoveryResults,
} from "@/lib/discovery-filters";
import { SPIRIT_SEARCH_TERMS } from "@/lib/cocktail-search";
import { matchCocktails } from "@/lib/cocktail-matching";

describe("discovery filters", () => {
  const barIds = [
    "gin",
    "campari",
    "sweet-vermouth",
    "bourbon",
    "angostura-bitters",
    "simple-syrup",
    "lime-juice",
    "rum-white",
    "rum-dark",
    "orgeat",
    "falernum",
  ];
  const matches = matchCocktails(barIds);

  it("filters by spirit", () => {
    const ginIds = new Set(SPIRIT_SEARCH_TERMS.gin);
    const filtered = applyDiscoveryFilters(matches, {
      spirit: "gin",
      category: "all",
      difficulty: "all",
      flavor: "all",
      strength: "all",
      rarity: "all",
      rating: "all",
      craftOriginals: false,
    });
    expect(filtered.length).toBeGreaterThan(0);
    expect(
      filtered.every((m) =>
        m.cocktail.ingredients.some((i) => ginIds.has(i.ingredientId))
      )
    ).toBe(true);
  });

  it("filters by tiki category", () => {
    const filtered = applyDiscoveryFilters(matches, {
      spirit: "all",
      category: "tiki",
      difficulty: "all",
      flavor: "all",
      strength: "all",
      rarity: "all",
      rating: "all",
      craftOriginals: false,
    });
    expect(filtered.some((m) => m.cocktail.category === "Tiki")).toBe(true);
  });

  it("counts makeable cocktails", () => {
    expect(countMakeable(matches)).toBeGreaterThan(0);
  });

  it("sorts by fewest missing ingredients", () => {
    const sorted = sortDiscoveryResults(matches, "fewest-missing");
    for (let i = 1; i < sorted.length; i++) {
      expect(sorted[i].missingCount).toBeGreaterThanOrEqual(sorted[i - 1].missingCount);
    }
  });
});
