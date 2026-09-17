import { CommerceProductQuery } from "@/lib/commerce/types";

export function buildLocalShoppingSearchQuery(query: CommerceProductQuery): string | undefined {
  const label = query.ingredient.searchLabel?.trim();
  if (!label) return undefined;
  const zip = query.location?.postalCode?.trim();
  if (!zip) return undefined;
  return `${label} near ${zip}`;
}

export function buildExternalSearchUrl(searchQuery: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
}

export function buildFindNearbyCtaLabel(displayName: string): string {
  const name = displayName.trim();
  if (!name) return "Find nearby";
  return `Find ${name}`;
}
