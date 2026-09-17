import manifestData from "@/data/cocktail-image-manifest.json";
import { resolveCocktailImageOverride } from "@/lib/cocktail-image-overrides";
import type { CocktailImageRecord, CocktailImageTier } from "@/lib/cocktail-image-trust";

const IMAGE_BASE = "https://cocktail.glass/images";
export const COCKTAIL_PLACEHOLDER = "/images/cocktail-placeholder.svg";

type ManifestFile = {
  entries: Record<string, CocktailImageRecord>;
};

const manifestEntries = (manifestData as ManifestFile).entries ?? {};

export function getCocktailImageTier(slug: string): CocktailImageTier {
  const entry = manifestEntries[slug];
  if (entry?.tier === "direct" || entry?.tier === "trusted-override") return entry.tier;
  return "missing";
}

export function getCocktailImageRecord(slug: string): CocktailImageRecord {
  return manifestEntries[slug] ?? { tier: "missing" };
}

/** @deprecated Use getCocktailImageSrc — returns CDN slug only when verified/trusted. */
export function resolveCocktailImageSlug(slug: string): string {
  const record = getCocktailImageRecord(slug);
  if (record.tier === "direct") return slug;
  if (record.tier === "trusted-override") {
    return resolveCocktailImageOverride(slug) ?? record.cdnSlug ?? slug;
  }
  return slug;
}

/** Display URL: CDN when direct/trusted override; otherwise neutral placeholder. */
export function getCocktailImageSrc(slug: string): string {
  const record = getCocktailImageRecord(slug);
  if (record.tier === "direct") {
    return `${IMAGE_BASE}/${slug}.webp`;
  }
  if (record.tier === "trusted-override") {
    const target = resolveCocktailImageOverride(slug) ?? record.cdnSlug;
    if (target) return `${IMAGE_BASE}/${target}.webp`;
  }
  return COCKTAIL_PLACEHOLDER;
}

/** Full CDN URL or placeholder — never a generic family proxy. */
export function getCocktailImageUrl(slug: string): string {
  return getCocktailImageSrc(slug);
}
