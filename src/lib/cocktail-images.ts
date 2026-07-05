import { resolveCocktailImageOverride } from "@/lib/cocktail-image-overrides";
import { resolveMocktailImageSlug } from "@/lib/mocktail-images";

const IMAGE_BASE = "https://cocktail.glass/images";
export const COCKTAIL_PLACEHOLDER = "/images/cocktail-placeholder.svg";

export function resolveCocktailImageSlug(slug: string): string {
  return (
    resolveMocktailImageSlug(slug) ??
    resolveCocktailImageOverride(slug) ??
    slug
  );
}

export function getCocktailImageUrl(slug: string): string {
  return `${IMAGE_BASE}/${resolveCocktailImageSlug(slug)}.webp`;
}
