import { describe, expect, it } from "vitest";
import { cocktails } from "@/lib/cocktail-data";
import { COCKTAIL_IMAGE_SLUGS } from "@/lib/cocktail-image-overrides";
import manifestData from "@/data/cocktail-image-manifest.json";
import {
  COCKTAIL_PLACEHOLDER,
  getCocktailImageSrc,
  getCocktailImageTier,
} from "@/lib/cocktail-images";

const catalogueSlugs = new Set(cocktails.map((c) => c.id));
const manifest = manifestData.entries as Record<string, { tier: string; cdnSlug?: string }>;

describe("cocktail image integrity", () => {
  it("covers every catalogue cocktail in the manifest", () => {
    expect(Object.keys(manifest).length).toBe(588);
    for (const c of cocktails) {
      expect(manifest[c.id], c.id).toBeDefined();
    }
  });

  it("does not keep overrides for deleted procedural slugs", () => {
    for (const slug of [
      "autumn-sour",
      "island-hopper",
      "bamboo-bar",
      "volcano-bowl",
      "amber-sour",
      "chief-lapu-lapu-fake",
    ]) {
      expect(COCKTAIL_IMAGE_SLUGS[slug as keyof typeof COCKTAIL_IMAGE_SLUGS]).toBeUndefined();
      expect(manifest[slug]).toBeUndefined();
    }
  });

  it("only maps overrides to live catalogue parent slugs", () => {
    for (const [from, to] of Object.entries(COCKTAIL_IMAGE_SLUGS)) {
      expect(catalogueSlugs.has(from), `override source ${from}`).toBe(true);
      expect(catalogueSlugs.has(to), `override target ${to} for ${from}`).toBe(true);
      expect(manifest[from]?.tier).toBe("trusted-override");
    }
  });

  it("uses placeholder for drinks without direct or trusted override (e.g. Potted Parrot)", () => {
    expect(getCocktailImageTier("potted-parrot")).toBe("missing");
    expect(getCocktailImageSrc("potted-parrot")).toBe(COCKTAIL_PLACEHOLDER);
    expect(COCKTAIL_IMAGE_SLUGS["potted-parrot"]).toBeUndefined();
  });

  it("does not treat family-proxy mappings as cocktail-specific URLs", () => {
    for (const c of cocktails) {
      const tier = getCocktailImageTier(c.id);
      const src = getCocktailImageSrc(c.id);
      if (tier === "missing") {
        expect(src).toBe(COCKTAIL_PLACEHOLDER);
      } else {
        expect(src).toContain("cocktail.glass");
        expect(src).not.toBe(COCKTAIL_PLACEHOLDER);
      }
    }
  });

  it("allows trusted variant overrides when manifest says so", () => {
    const saturnVar = cocktails.find((c) => c.id === "saturn-variation");
    if (!saturnVar) return;
    const tier = getCocktailImageTier("saturn-variation");
    if (tier === "trusted-override") {
      expect(COCKTAIL_IMAGE_SLUGS["saturn-variation"]).toBe("saturn");
    }
  });
});
