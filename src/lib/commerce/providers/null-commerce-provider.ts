import {
  CommerceProductQuery,
  CommerceProvider,
  CommerceResult,
} from "@/lib/commerce/types";

function buildExternalSearchQuery(query: CommerceProductQuery): string | undefined {
  const label = query.ingredient.searchLabel;
  if (!label) return undefined;
  const zip = query.location?.postalCode?.trim();
  if (zip) return `${label} near ${zip}`;
  return `${label} bottle shop`;
}

export const nullCommerceProvider: CommerceProvider = {
  id: "craft-null",
  name: "CRAFT (no retailer connected)",

  async findNearby(query: CommerceProductQuery): Promise<CommerceResult> {
    const externalSearchQuery = buildExternalSearchQuery(query);

    return {
      status: "integration_pending",
      query,
      externalSearchQuery,
      message:
        "Retailer partnerships are coming soon. You can save your ZIP here so CRAFT is ready when store lookup goes live.",
    };
  },
};
