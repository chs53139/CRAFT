import { describe, expect, it } from "vitest";
import { cocktails } from "@/lib/cocktail-data";
import { COCKTAIL_IMAGE_SLUGS } from "@/lib/cocktail-image-overrides";
import manifestData from "@/data/cocktail-image-manifest.json";
import { inferTrustedImageParentSlug } from "@/lib/cocktail-image-trust";
import {
  COCKTAIL_PLACEHOLDER,
  getCocktailImageSrc,
  getCocktailImageTier,
} from "@/lib/cocktail-images";

const catalogueSlugs = new Set(cocktails.map((c) => c.id));
const manifest = manifestData.entries as Record<string, { tier: string; cdnSlug?: string }>;
const manifestStats = manifestData.stats as {
  total: number;
  direct: number;
  trustedOverride: number;
  missing: number;
};

/** Same drink on CDN under a different slug — must stay in sync with generate-image-overrides.mjs */
const SAME_DRINK_CDN_ALIASES: Record<string, string> = {
  tradewinds: "trade-winds",
};

describe("cocktail image integrity", () => {
  it("covers every catalogue cocktail in the manifest", () => {
    expect(Object.keys(manifest).length).toBe(588);
    for (const c of cocktails) {
      expect(manifest[c.id], c.id).toBeDefined();
    }
  });

  it("matches expected direct, alias, and placeholder counts", () => {
    expect(manifestStats.total).toBe(588);
    expect(manifestStats.direct).toBe(500);
    expect(manifestStats.trustedOverride).toBe(29);
    expect(manifestStats.missing).toBe(59);
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

  it("only allows trusted overrides for same-drink CDN aliases or catalogue variants", () => {
    for (const [from, to] of Object.entries(COCKTAIL_IMAGE_SLUGS)) {
      expect(catalogueSlugs.has(from), `override source ${from}`).toBe(true);
      expect(manifest[from]?.tier).toBe("trusted-override");

      const variantParent = inferTrustedImageParentSlug(from, catalogueSlugs);
      const aliasTarget = SAME_DRINK_CDN_ALIASES[from];
      const isSameDrinkAlias = aliasTarget === to;
      const isCatalogueVariant = variantParent === to;

      expect(
        isSameDrinkAlias || isCatalogueVariant,
        `override ${from} → ${to} is not a same-drink alias or catalogue variant`
      ).toBe(true);
    }
  });

  it("uses trade-winds CDN alias only for Tradewinds among the six curated tiki additions", () => {
    expect(getCocktailImageTier("tradewinds")).toBe("trusted-override");
    expect(COCKTAIL_IMAGE_SLUGS.tradewinds).toBe("trade-winds");
    expect(getCocktailImageSrc("tradewinds")).toBe(
      "https://cocktail.glass/images/trade-winds.webp"
    );

    for (const id of [
      "potted-parrot",
      "chief-lapu-lapu",
      "qb-cooler",
      "ancient-mariner",
      "151-swizzle",
    ]) {
      expect(getCocktailImageTier(id), id).toBe("missing");
      expect(getCocktailImageSrc(id)).toBe(COCKTAIL_PLACEHOLDER);
      expect(COCKTAIL_IMAGE_SLUGS[id as keyof typeof COCKTAIL_IMAGE_SLUGS]).toBeUndefined();
    }
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
