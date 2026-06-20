import { describe, expect, it } from "vitest";
import {
  getBarSummaryFromMatches,
  getBestNextIngredient,
  getCocktailById,
  groupCocktailMatches,
  matchCocktails,
  matchSingleCocktail,
} from "@/lib/cocktail-matching";

describe("matchSingleCocktail", () => {
  it("marks a fully stocked cocktail as an exact make", () => {
    const margarita = getCocktailById("margarita");
    expect(margarita).toBeDefined();

    const barIds = margarita!.ingredients.map((ing) => ing.ingredientId);
    const match = matchSingleCocktail(margarita!, barIds);

    expect(match.canMake).toBe(true);
    expect(match.matchGroup).toBe("exact");
    expect(match.missingCount).toBe(0);
  });

  it("groups a one-away cocktail as missing", () => {
    const margarita = getCocktailById("margarita");
    expect(margarita).toBeDefined();

    const partialBar = margarita!.ingredients.slice(0, 2).map((ing) => ing.ingredientId);
    const match = matchSingleCocktail(margarita!, partialBar);

    expect(match.canMake).toBe(false);
    expect(match.matchGroup).toBe("missing");
    expect(match.missingCount).toBe(1);
  });
});

describe("groupCocktailMatches", () => {
  it("separates exact matches from still-missing cocktails", () => {
    const margarita = getCocktailById("margarita");
    expect(margarita).toBeDefined();

    const barIds = [
      ...margarita!.ingredients.map((ing) => ing.ingredientId),
      "bourbon",
      "angostura-bitters",
    ];
    const matches = matchCocktails(barIds);
    const grouped = groupCocktailMatches(matches);

    expect(grouped.exactMatches.length).toBeGreaterThan(0);
    expect(grouped.stillMissing.length).toBeGreaterThan(0);
    expect(
      grouped.exactMatches.every((m) => m.matchGroup === "exact")
    ).toBe(true);
  });
});

describe("getBarSummaryFromMatches", () => {
  it("returns non-negative counts for a stocked bar", () => {
    const matches = matchCocktails(["bourbon", "angostura-bitters", "simple-syrup"]);
    const summary = getBarSummaryFromMatches(matches);

    expect(summary.readyTonight).toBeGreaterThanOrEqual(0);
    expect(summary.oneAway).toBeGreaterThanOrEqual(0);
    expect(summary.withSubstitutions).toBeGreaterThanOrEqual(0);
  });
});

describe("getBestNextIngredient", () => {
  it("recommends an ingredient that unlocks new exact cocktails", () => {
    const recommendation = getBestNextIngredient(["london-dry-gin", "campari"]);

    expect(recommendation).not.toBeNull();
    expect(recommendation!.unlocksCount).toBeGreaterThan(0);
    expect(recommendation!.exampleCocktails.length).toBeGreaterThan(0);
  });

  it("returns null for an empty bar", () => {
    expect(getBestNextIngredient([])).toBeNull();
  });
});
