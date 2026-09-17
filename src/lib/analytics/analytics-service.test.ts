import { describe, expect, it, vi } from "vitest";
import {
  getBufferedProductEvents,
  setAnalyticsProvider,
  trackProductEvent,
} from "@/lib/analytics/analytics-service";

describe("trackProductEvent", () => {
  it("never throws when provider rejects", () => {
    setAnalyticsProvider({
      id: "fail",
      track() {
        throw new Error("analytics down");
      },
    });

    expect(() =>
      trackProductEvent("cocktail_viewed", { cocktailId: "negroni", drinkType: "cocktail" })
    ).not.toThrow();
  });

  it("buffers events for debugging", () => {
    setAnalyticsProvider({ id: "noop", track: vi.fn() });
    trackProductEvent("find_nearby_clicked", {
      ingredientId: "campari",
      context: "best_next_purchase",
    });
    const events = getBufferedProductEvents();
    expect(events.some((e) => e.name === "find_nearby_clicked")).toBe(true);
  });
});
