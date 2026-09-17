import { nullCommerceProvider } from "@/lib/commerce/providers/null-commerce-provider";
import {
  CommerceProductQuery,
  CommerceProvider,
  CommerceResult,
  CommerceShoppingListHandoff,
} from "@/lib/commerce/types";

let activeProvider: CommerceProvider = nullCommerceProvider;

/** Swap in a real retailer/affiliate adapter without touching UI. */
export function setCommerceProvider(provider: CommerceProvider): void {
  activeProvider = provider;
}

export function getCommerceProvider(): CommerceProvider {
  return activeProvider;
}

export async function findNearbyForIngredient(
  query: CommerceProductQuery
): Promise<CommerceResult> {
  try {
    return await activeProvider.findNearby(query);
  } catch {
    return nullCommerceProvider.findNearby(query);
  }
}

/** Future: GET ALL MISSING INGREDIENTS handoff — normalized list only, no cart. */
export function buildShoppingListHandoff(
  items: CommerceProductQuery[]
): CommerceShoppingListHandoff {
  return { items, location: items[0]?.location };
}
