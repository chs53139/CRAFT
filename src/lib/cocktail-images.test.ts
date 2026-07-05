import { describe, expect, it } from "vitest";
import { cocktails } from "@/lib/cocktail-data";
import { getCocktailImageUrl, resolveCocktailImageSlug } from "@/lib/cocktail-images";

describe("cocktail image resolution", () => {
  it("resolves expanded tiki cocktails to valid CDN slugs", () => {
    expect(resolveCocktailImageSlug("pearl-diver")).not.toBe("pearl-diver");
    expect(getCocktailImageUrl("pearl-diver")).toContain("cocktail.glass");
  });

  it("resolves craft originals to existing catalogue photos", () => {
    expect(resolveCocktailImageSlug("craft-ember-line")).not.toBe("craft-ember-line");
    expect(resolveCocktailImageSlug("craft-tidepool-club")).toBeTruthy();
  });

  it("assigns overrides to all expanded cocktails without direct CDN photos", () => {
    const expandedIds = [
      "pearl-diver",
      "aku-aku",
      "nui-nui",
      "rum-barrel",
      "island-hopper",
      "autumn-sour",
    ];

    for (const id of expandedIds) {
      const cocktail = cocktails.find((c) => c.id === id);
      expect(cocktail, id).toBeDefined();
      expect(resolveCocktailImageSlug(id)).not.toBe(id);
    }
  });
});
