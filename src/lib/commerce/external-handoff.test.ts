import { describe, expect, it } from "vitest";
import { ingredients } from "@/lib/cocktail-matching";
import {
  buildExternalSearchUrl,
  buildFindNearbyCtaLabel,
  buildLocalShoppingSearchQuery,
} from "@/lib/commerce/external-handoff";
import { normalizeCommerceIngredient } from "@/lib/commerce/normalize-ingredient";

describe("external commerce handoff", () => {
  it("builds CTA from normalized display name", () => {
    const campari = ingredients.find((i) => i.id === "campari");
    expect(campari).toBeTruthy();
    if (!campari) return;
    const normalized = normalizeCommerceIngredient(campari);
    expect(buildFindNearbyCtaLabel(normalized.displayName)).toBe("Find Campari");
  });

  it("builds ingredient near ZIP query without recipe amounts", () => {
    const prosecco = ingredients.find((i) => i.id === "prosecco");
    expect(prosecco).toBeTruthy();
    if (!prosecco) return;
    const normalized = normalizeCommerceIngredient(prosecco);
    const query = buildLocalShoppingSearchQuery({
      ingredient: normalized,
      location: { postalCode: "91384", countryCode: "US" },
    });
    expect(query).toBe("Prosecco near 91384");
    expect(query).not.toMatch(/\d+\s*oz/i);
    expect(buildExternalSearchUrl(query!)).toContain(encodeURIComponent("Prosecco near 91384"));
  });
});
