import { Cocktail } from "@/lib/types";
import { WELL_KNOWN_SLUGS } from "@/lib/cocktail-curation";

export type RarityTier = "classic" | "well-known" | "hidden-gem" | "deep-cut";

export function getRarityTier(cocktail: Cocktail): RarityTier {
  if (
    WELL_KNOWN_SLUGS.has(cocktail.id) ||
    cocktail.collections.includes("verified-classic") ||
    cocktail.popularityScore >= 78
  ) {
    return cocktail.popularityScore >= 85 ? "classic" : "well-known";
  }

  if (cocktail.collections.includes("hidden-gem") || cocktail.obscurityScore >= 62) {
    return cocktail.obscurityScore >= 78 ? "deep-cut" : "hidden-gem";
  }

  if (cocktail.obscurityScore >= 50) return "hidden-gem";
  return "well-known";
}

export function rarityTierLabel(tier: RarityTier): string {
  switch (tier) {
    case "classic":
      return "Classic";
    case "well-known":
      return "Well known";
    case "hidden-gem":
      return "Hidden gem";
    case "deep-cut":
      return "Rare / deep cut";
    default:
      return "Well known";
  }
}
