import { describe, expect, it } from "vitest";
import { filterMatchesBySearch, matchCocktails } from "@/lib/cocktail-matching";

describe("Home search integration", () => {
  it("Potted Parrot and ingredient queries use existing search engine", () => {
    const bar = ["london-dry-gin", "campari", "sweet-vermouth", "orange-juice"];
    const base = matchCocktails(bar);
    const potted = filterMatchesBySearch(base, "Potted Parrot");
    expect(potted.some((m) => m.cocktail.id.includes("potted") || m.cocktail.name.toLowerCase().includes("potted"))).toBe(
      true
    );
    const ginOj = filterMatchesBySearch(base, "Gin + Orange Juice");
    expect(ginOj.length).toBeGreaterThan(0);
    const exclusion = filterMatchesBySearch(base, "Gin + Orange Juice without Lemon Juice");
    expect(exclusion.length).toBeGreaterThan(0);
  });
});
