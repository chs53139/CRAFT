/** Suffixes that indicate a published variant of the same named cocktail. */
export const TRUSTED_STRIP_SUFFIXES = [
  "-trader-vics",
  "-royal-hawaiian",
  "-papa-doble",
  "-split-base",
  "-split",
  "-modern",
  "-smoky",
  "-variation",
  "-spiced",
  "-honey",
  "-lavender",
  "-cognac",
  "-rye",
  "-mezcal",
  "-cynar",
  "-reposado",
  "-amargo",
  "-perfect",
  "-yellow",
  "-violette",
  "-boston",
  "-passion",
] as const;

export type CocktailImageTier = "direct" | "trusted-override" | "missing";

export type CocktailImageRecord = {
  tier: CocktailImageTier;
  /** CDN slug used for trusted-override; same as catalogue slug when direct. */
  cdnSlug?: string;
};

/**
 * Parent slug for a trusted visual override (same drink, different spec name).
 * Does not use family pools or unrelated cocktails.
 */
export function inferTrustedImageParentSlug(
  slug: string,
  catalogueSlugs: ReadonlySet<string>
): string | null {
  for (const suffix of TRUSTED_STRIP_SUFFIXES) {
    if (slug.endsWith(suffix)) {
      const base = slug.slice(0, -suffix.length);
      if (catalogueSlugs.has(base)) return base;
    }
  }

  const candidates = [...catalogueSlugs]
    .filter((base) => base !== slug && slug.startsWith(`${base}-`))
    .sort((a, b) => b.length - a.length);

  return candidates[0] ?? null;
}
