import {
  buildExternalSearchUrl,
  buildLocalShoppingSearchQuery,
} from "@/lib/commerce/external-handoff";
import {
  CommerceProductQuery,
  CommerceProvider,
  CommerceResult,
} from "@/lib/commerce/types";

export const nullCommerceProvider: CommerceProvider = {
  id: "craft-null",
  name: "CRAFT (no retailer connected)",

  async findNearby(query: CommerceProductQuery): Promise<CommerceResult> {
    const externalSearchQuery = buildLocalShoppingSearchQuery(query);

    if (!externalSearchQuery) {
      return {
        status: "integration_pending",
        query,
        message: "",
      };
    }

    return {
      status: "external_handoff",
      query,
      externalSearchQuery,
      destinationUrl: buildExternalSearchUrl(externalSearchQuery),
      message: "",
    };
  },
};
