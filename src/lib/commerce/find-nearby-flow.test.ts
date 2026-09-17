import { describe, expect, it } from "vitest";
import { findNearbyForIngredient } from "@/lib/commerce/commerce-service";
import { normalizeCommerceIngredient } from "@/lib/commerce/normalize-ingredient";
import { ingredients } from "@/lib/cocktail-matching";

describe("Find Nearby commerce flow", () => {
  it("uses normalized ingredient identity without fake retailer data", async () => {
    const campari = ingredients.find((i) => i.id === "campari");
    expect(campari).toBeTruthy();
    if (!campari) return;

    const normalized = normalizeCommerceIngredient(campari);
    const result = await findNearbyForIngredient({
      ingredient: normalized,
      location: { postalCode: "94110", countryCode: "US" },
    });

    expect(result.status).toBe("external_handoff");
    expect(result.externalSearchQuery).toBe("Campari near 94110");
    expect(result.destinationUrl).toContain(encodeURIComponent("Campari near 94110"));
    expect(result.message).toBe("");
  });

  it("requires ZIP before handoff query is produced", async () => {
    const campari = ingredients.find((i) => i.id === "campari");
    expect(campari).toBeTruthy();
    if (!campari) return;

    const normalized = normalizeCommerceIngredient(campari);
    const result = await findNearbyForIngredient({ ingredient: normalized });
    expect(result.externalSearchQuery).toBeUndefined();
  });
});
