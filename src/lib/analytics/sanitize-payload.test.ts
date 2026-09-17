import { describe, expect, it } from "vitest";
import {
  isPersistedProductEventName,
  sanitizeAnalyticsPayload,
} from "@/lib/analytics/sanitize-payload";

describe("sanitizeAnalyticsPayload", () => {
  it("removes zip, postal, and geo keys", () => {
    const out = sanitizeAnalyticsPayload({
      ingredientId: "campari",
      zipCode: "91384",
      postal: "90210",
      userLat: 34,
      context: "one_away",
    });
    expect(out).toEqual({ ingredientId: "campari", context: "one_away" });
    expect(JSON.stringify(out)).not.toMatch(/91384|90210|postal|zip/i);
  });
});

describe("isPersistedProductEventName", () => {
  it("accepts all product events", () => {
    expect(isPersistedProductEventName("cocktail_viewed")).toBe(true);
    expect(isPersistedProductEventName("bar_ingredient_removed")).toBe(true);
  });

  it("rejects unknown names", () => {
    expect(isPersistedProductEventName("page_view")).toBe(false);
  });
});
