import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cocktails } from "@/lib/cocktail-data";
import { getUnlockRecommendations } from "@/lib/bar-intelligence/unlock-graph";
import { matchCocktails, filterMatchesBySearch } from "@/lib/cocktail-matching";
import { getCocktailDisplaySubtitle } from "@/lib/copy-hierarchy";
import { sanitizeAnalyticsPayload } from "@/lib/analytics/sanitize-payload";

describe("strategic UI polish — data integrity", () => {
  it("BNP unlock counts come from unlock-graph, not hardcoded", () => {
    const bar = ["london-dry-gin", "sweet-vermouth"];
    const matches = matchCocktails(bar);
    const recs = getUnlockRecommendations(bar, { limit: 3, precomputedMatches: matches });
    for (const rec of recs) {
      expect(rec.unlocksCount).toBeGreaterThan(0);
      expect(typeof rec.ingredient.id).toBe("string");
    }
    const source = readFileSync(
      join(process.cwd(), "src/components/BestNextPurchaseSection.tsx"),
      "utf8"
    );
    expect(source).toContain("getUnlockRecommendations");
    expect(source).not.toMatch(/Unlocks\s+31/);
  });

  it("One Away card uses missing ingredient from match data", () => {
    const source = readFileSync(join(process.cwd(), "src/components/OneAwayCard.tsx"), "utf8");
    expect(source).toContain("match.missing[0]");
    expect(source).not.toContain("Campari");
    expect(source).not.toContain("Negroni");
  });

  it("Find Nearby remains portaled globally", () => {
    const source = readFileSync(join(process.cwd(), "src/components/FindNearbySheet.tsx"), "utf8");
    expect(source).toContain("AppOverlayPortal");
  });

  it("ZIP stays out of analytics payloads", () => {
    const out = sanitizeAnalyticsPayload({ ingredientId: "campari", zipCode: "90210" });
    expect(JSON.stringify(out)).not.toMatch(/90210|zip/i);
  });

  it("blank subtitle and non-duplicated history remain valid", () => {
    const blank = cocktails.filter((c) => !getCocktailDisplaySubtitle(c.description, c.funFact));
    expect(blank.length).toBeGreaterThan(100);
  });

  it("Home structure preserved", () => {
    const home = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(home).toContain("MakeableCountBanner");
    expect(home).toContain("StatPills");
    expect(home).toContain("HomeSearchEntry");
    expect(home).toContain("Pour tonight");
    expect(home).toContain("countWithinReach");
  });

  it("search still uses filterMatchesBySearch", () => {
    const bar = ["london-dry-gin", "campari", "sweet-vermouth"];
    const results = filterMatchesBySearch(matchCocktails(bar), "potted");
    expect(Array.isArray(results)).toBe(true);
  });
});
