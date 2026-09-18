import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { filterMatchesBySearch, matchCocktails } from "@/lib/cocktail-matching";

describe("Home search integration", () => {
  it("Home page includes search entry before Pour tonight", () => {
    const source = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(source).toContain("HomeSearchEntry");
    expect(source.indexOf("HomeSearchEntry")).toBeLessThan(source.indexOf("Pour tonight"));
  });

  it("Home search navigates to Tonight browse with query param", () => {
    const source = readFileSync(join(process.cwd(), "src/components/HomeSearchEntry.tsx"), "utf8");
    expect(source).toContain("/cocktails?view=browse&q=");
    expect(source).not.toMatch(/filterMatchesBySearch\s*\(/);
  });

  it("Tonight reads q param into shared search state", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/cocktails/CocktailsPageClient.tsx"),
      "utf8"
    );
    expect(source).toContain('searchParams.get("q")');
    expect(source).toContain("filterMatchesBySearch");
  });

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
