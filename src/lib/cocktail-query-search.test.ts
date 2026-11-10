import { describe, expect, it } from "vitest";
import { matchCocktails } from "@/lib/cocktail-matching";
import { searchMatches } from "@/lib/cocktail-search";
import { filterMatchesByIngredientQuery, parseIngredientQuery } from "@/lib/cocktail-query-search";

describe("cocktail query search", () => {
  it("finds gin cocktails from spirit search", () => {
    const matches = matchCocktails([]);
    const results = searchMatches("Gin", matches);
    expect(results.length).toBeGreaterThan(10);
    expect(
      results.filter((m) => m.cocktail.ingredients.some((i) => i.ingredientId.includes("gin"))).length
    ).toBeGreaterThan(10);
  });

  it("requires all included ingredients", () => {
    const parsed = parseIngredientQuery("gin + orange juice");
    const matches = matchCocktails([]);
    const filtered = filterMatchesByIngredientQuery(matches, parsed);
    expect(filtered.length).toBeGreaterThan(0);
    for (const match of filtered) {
      const ids = match.cocktail.ingredients.map((i) => i.ingredientId);
      expect(ids.some((id) => id.includes("gin"))).toBe(true);
      expect(ids).toContain("orange-juice");
    }
  });

  it("keeps compound qualifiers and handles commas without spaces", () => {
    const parsed = parseIngredientQuery("tiki with rum without lemon and mint");
    expect(parsed).toEqual({ freeText: "tiki", includeIngredientIds: ["rum"], excludeIngredientIds: ["lemon", "mint"] });
    const matches = searchMatches("gin,lime", matchCocktails([]));
    expect(matches.length).toBeGreaterThan(0);
    expect(matches.every((m) => m.cocktail.ingredients.some((i) => i.ingredientId === "lime-juice" || i.ingredientId === "lime"))).toBe(true);
  });

  it("supports exclusion terms", () => {
    const parsed = parseIngredientQuery("gin + orange juice without lemon juice");
    const matches = matchCocktails([]);
    const filtered = filterMatchesByIngredientQuery(matches, parsed);
    expect(filtered.length).toBeGreaterThan(0);
    for (const match of filtered) {
      expect(match.cocktail.ingredients.some((i) => i.ingredientId === "lemon-juice")).toBe(false);
    }
  });
});
