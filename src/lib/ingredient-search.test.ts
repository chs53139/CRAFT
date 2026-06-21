import { describe, expect, it } from "vitest";
import { getCocktailById } from "@/lib/cocktail-matching";
import {
  cocktailHasIngredient,
  getIngredientSearchIds,
  hasSelectedIngredients,
  searchAndSortCocktailsByIngredients,
  searchCocktailsByIngredients,
  sortIngredientSearchResults,
  toggleIngredientInBucket,
} from "@/lib/ingredient-search";

describe("ingredient search", () => {
  it("detects ingredients in a cocktail recipe", () => {
    const margarita = getCocktailById("margarita");
    expect(margarita).toBeDefined();
    expect(cocktailHasIngredient(margarita!, "tequila-blanco")).toBe(true);
    expect(cocktailHasIngredient(margarita!, "bourbon")).toBe(false);
  });

  it("returns exact matches when all must and nice ingredients are present", () => {
    const margarita = getCocktailById("margarita");
    expect(margarita).toBeDefined();

    const filters = {
      mustInclude: margarita!.ingredients.slice(0, 2).map((item) => item.ingredientId),
      niceToHave: [margarita!.ingredients[2].ingredientId],
      exclude: [],
      drinkType: "both" as const,
    };

    const results = searchCocktailsByIngredients(filters);
    expect(results.exactMatches.some((item) => item.match.cocktail.id === "margarita")).toBe(true);
  });

  it("excludes cocktails containing excluded ingredients", () => {
    const margarita = getCocktailById("margarita");
    expect(margarita).toBeDefined();

    const filters = {
      mustInclude: ["tequila-blanco"],
      niceToHave: [],
      exclude: ["lime-juice"],
      drinkType: "both" as const,
    };

    const results = searchCocktailsByIngredients(filters);
    expect(results.exactMatches.some((item) => item.match.cocktail.id === "margarita")).toBe(false);
    expect(results.partialMatches.some((item) => item.match.cocktail.id === "margarita")).toBe(false);
  });

  it("returns partial matches when only some selected ingredients are present", () => {
    const filters = {
      mustInclude: ["gin", "orange-juice"],
      niceToHave: [],
      exclude: [],
      drinkType: "both" as const,
    };

    const results = searchCocktailsByIngredients(filters);
    expect(results.partialMatches.length).toBeGreaterThan(0);
    expect(results.partialMatches.every((item) => item.tier === "partial")).toBe(true);
    expect(results.partialMatches.every((item) => item.matchPercent >= 50)).toBe(true);
  });

  it("sorts by match percentage when requested", () => {
    const filters = {
      mustInclude: ["gin"],
      niceToHave: ["orange-juice", "lemon-juice"],
      exclude: [],
      drinkType: "both" as const,
    };

    const results = searchCocktailsByIngredients(filters);
    const combined = [...results.exactMatches, ...results.partialMatches];
    const sorted = sortIngredientSearchResults(combined, "match");

    for (let index = 1; index < sorted.length; index += 1) {
      expect(sorted[index - 1].matchPercent).toBeGreaterThanOrEqual(sorted[index].matchPercent);
    }
  });

  it("filters by drink type", () => {
    const filters = {
      mustInclude: ["orange-juice"],
      niceToHave: [],
      exclude: [],
      drinkType: "mocktails" as const,
    };

    const results = searchCocktailsByIngredients(filters);
    const all = [...results.exactMatches, ...results.partialMatches];
    expect(all.length).toBeGreaterThan(0);
    expect(all.every((item) => item.match.cocktail.drinkType === "mocktail")).toBe(true);
  });

  it("toggles ingredients between buckets", () => {
    let filters = {
      mustInclude: [] as string[],
      niceToHave: [] as string[],
      exclude: [] as string[],
      drinkType: "both" as const,
    };

    filters = toggleIngredientInBucket(filters, "gin", "must");
    expect(filters.mustInclude).toEqual(["gin"]);

    filters = toggleIngredientInBucket(filters, "gin", "nice");
    expect(filters.mustInclude).toEqual([]);
    expect(filters.niceToHave).toEqual(["gin"]);
  });

  it("collects selected ingredient ids for AI recommendations", () => {
    const filters = {
      mustInclude: ["gin"],
      niceToHave: ["orange-juice"],
      exclude: ["lemon-juice"],
      drinkType: "both" as const,
    };

    expect(hasSelectedIngredients(filters)).toBe(true);
    expect(getIngredientSearchIds(filters).sort()).toEqual(["gin", "orange-juice"].sort());
  });

  it("returns sorted catalogue matches", () => {
    const filters = {
      mustInclude: ["bourbon"],
      niceToHave: [],
      exclude: [],
      drinkType: "cocktails" as const,
    };

    const results = searchAndSortCocktailsByIngredients(filters, "popularity");
    expect(results.exactMatches.length + results.partialMatches.length).toBeGreaterThan(0);
  });
});
