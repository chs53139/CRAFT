import { describe, expect, it, vi } from "vitest";
import {
  getBufferedProductEvents,
  setAnalyticsProvider,
  trackProductEvent,
} from "@/lib/analytics/analytics-service";

describe("product event privacy", () => {
  it("never includes ZIP or postal code in buffered payloads", () => {
    setAnalyticsProvider({ id: "noop", track: vi.fn() });

    trackProductEvent("find_nearby_clicked", {
      ingredientId: "prosecco",
      context: "cocktail_detail",
    });
    trackProductEvent("discovery_filter_used", { filter: "spirit", value: "gin" });
    trackProductEvent("missing_ingredient_selected", {
      ingredientId: "campari",
      cocktailId: "negroni",
    });

    const serialized = JSON.stringify(getBufferedProductEvents());
    expect(serialized).not.toMatch(/91384|postal|zip/i);
  });
});
