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
    expect(cocktails.length).toBe(672);
    expect(cocktails.some((c) => c.id === "airmail")).toBe(true);
    expect(cocktails.some((c) => c.id === "lion-tail")).toBe(true);
  });

  const PROCEDURAL_EXPANSION_IDS = [
    "potted-parrot",
    "tradewinds",
    "chief-lapu-lapu",
    "qb-cooler",
    "ancient-mariner",
    "151-swizzle",
  ] as const;

  it.each(PROCEDURAL_EXPANSION_IDS)("finds %s by exact catalogue name", (id) => {
    const cocktail = cocktails.find((c) => c.id === id);
    expect(cocktail).toBeDefined();
    const results = searchCocktails(cocktail!.name, cocktails);
    expect(results[0]?.id).toBe(id);
  });

  it("finds Potted Parrot from partial name queries", () => {
    for (const query of ["Potted Parrot", "potted parrot", "potted", "parrot"]) {
      const results = searchCocktails(query, cocktails);
      expect(results.some((c) => c.id === "potted-parrot")).toBe(true);
    }
  });

  it("keeps discovery-style ingredient searches working", () => {
    expect(searchCocktails("Gin", cocktails).length).toBeGreaterThan(10);
    expect(searchCocktails("Orange Juice", cocktails).length).toBeGreaterThan(0);
    expect(searchCocktails("Tiki", cocktails).length).toBeGreaterThan(10);

    const matches = matchCocktails([]);
    const ginAndOrange = searchMatches("Gin + Orange Juice", matches);
    expect(ginAndOrange.length).toBeGreaterThan(0);
    for (const match of ginAndOrange) {
      const ids = match.cocktail.ingredients.map((i) => i.ingredientId);
      expect(ids.some((id) => id.includes("gin"))).toBe(true);
      expect(ids).toContain("orange-juice");
    }

    const excludeLemon = searchMatches("Gin + Orange Juice without Lemon Juice", matches);
    expect(excludeLemon.length).toBeGreaterThan(0);
    for (const match of excludeLemon) {
      expect(match.cocktail.ingredients.some((i) => i.ingredientId === "lemon-juice")).toBe(
        false
      );
    }
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

  it("finds procedural expansion cocktails by name even when not pourable", () => {
    const matches = matchCocktails(["gin", "rum-white", "lime-juice"]);
    for (const id of [
      "potted-parrot",
      "tradewinds",
      "chief-lapu-lapu",
      "qb-cooler",
      "ancient-mariner",
      "151-swizzle",
    ]) {
      const cocktail = matches.find((m) => m.cocktail.id === id)?.cocktail;
      expect(cocktail).toBeDefined();
      const results = searchMatches(cocktail!.name, matches);
      expect(results.some((m) => m.cocktail.id === id)).toBe(true);
    }
  });
});
