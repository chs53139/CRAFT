const IMAGE_BASE = "https://cocktail.glass/images";
export const COCKTAIL_PLACEHOLDER = "/images/cocktail-placeholder.svg";

export function getCocktailImageUrl(slug: string): string {
  return `${IMAGE_BASE}/${slug}.webp`;
}
