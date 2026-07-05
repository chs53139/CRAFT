import { describe, expect, it, beforeEach } from "vitest";
import { cocktails } from "@/lib/cocktail-data";
import {
  resetSearchIndex,
  searchCocktails,
  searchMatches,
} from "@/lib/cocktail-search";
import { matchCocktails } from "@/lib/cocktail-matching";

describe("searchCocktails", () => {
  beforeEach(() => {
    resetSearchIndex();
  });

  it("returns all cocktails for empty query", () => {
    expect(searchCocktails("", cocktails).length).toBe(cocktails.length);
  });

  it("finds gin cocktails when searching gin", () => {
    const results = searchCocktails("gin", cocktails);
    expect(results.length).toBeGreaterThan(20);
    const withGinSpirit = results.filter((c) =>
      c.ingredients.some((i) => i.ingredientId.includes("gin"))
    );
    expect(withGinSpirit.length).toBeGreaterThan(results.length * 0.7);
  });

  it("finds rum cocktails when searching rum", () => {
    const results = searchCocktails("rum", cocktails);
    expect(results.length).toBeGreaterThan(15);
    const withRum = results.filter((c) =>
      c.ingredients.some((i) => i.ingredientId.includes("rum"))
    );
    expect(withRum.length).toBeGreaterThan(results.length * 0.7);
  });

  it("finds tiki drinks when searching tiki", () => {
    const results = searchCocktails("tiki", cocktails);
    expect(results.length).toBeGreaterThan(10);
    expect(
      results.some(
        (c) =>
          c.category === "Tiki" ||
          c.collections.includes("tiki") ||
          c.tags.includes("tiki")
      )
    ).toBe(true);
  });

  it("finds orange-related cocktails when searching orange", () => {
    const results = searchCocktails("orange", cocktails);
    expect(results.length).toBeGreaterThan(5);
  });

  it("finds smoky cocktails when searching smoky", () => {
    const results = searchCocktails("smoky", cocktails);
    expect(results.length).toBeGreaterThan(0);
  });

  it("includes newly expanded cocktails in the catalogue", () => {
    expect(cocktails.some((c) => c.id === "pearl-diver")).toBe(true);
    expect(cocktails.some((c) => c.id === "aku-aku")).toBe(true);
    expect(cocktails.length).toBeGreaterThanOrEqual(680);
  });
});

describe("searchMatches", () => {
  beforeEach(() => {
    resetSearchIndex();
  });

  it("filters bar matches by ingredient name", () => {
    const matches = matchCocktails(["gin", "campari", "sweet-vermouth"]);
    const results = searchMatches("negroni", matches);
    expect(results.some((m) => m.cocktail.id.includes("negroni"))).toBe(true);
  });
});
