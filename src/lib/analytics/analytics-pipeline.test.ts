import { describe, expect, it } from "vitest";
import { buildCraftPulseSummary } from "@/lib/analytics/aggregates";
import { enrichProductEvent } from "@/lib/analytics/enrich-event";
import { normalizeSearchKey } from "@/lib/analytics/search-key";
import { sanitizeAnalyticsPayload } from "@/lib/analytics/sanitize-payload";
import {
  getBufferedProductEvents,
  setAnalyticsProvider,
  trackProductEvent,
} from "@/lib/analytics/analytics-service";

async function flushMicrotasks(): Promise<void> {
  await new Promise<void>((resolve) => queueMicrotask(resolve));
}

describe("analytics production path (client → payload → aggregate)", () => {
  it("covers view, search, zero-result, commerce, favorite, share payloads", async () => {
    const tracked: unknown[] = [];
    setAnalyticsProvider({
      id: "test",
      track(event) {
        tracked.push({
          name: event.name,
          payload: sanitizeAnalyticsPayload(
            enrichProductEvent(event.name, event.payload) as Record<string, unknown>
          ),
        });
      },
    });

    trackProductEvent("cocktail_viewed", { cocktailId: "negroni", drinkType: "cocktail" });
    trackProductEvent("cocktail_searched", {
      queryLength: 12,
      resultCount: 0,
      hasExclusion: false,
      searchKey: normalizeSearchKey("Division Bell"),
      zeroResults: true,
    });
    trackProductEvent("one_away_viewed", {
      cocktailId: "last-word",
      missingIngredientId: "green-chartreuse",
    });
    trackProductEvent("best_next_purchase_viewed", {
      ingredientId: "campari",
      unlocksCount: 14,
    });
    trackProductEvent("find_nearby_clicked", {
      ingredientId: "campari",
      context: "best_next_purchase",
    });
    trackProductEvent("favorite_added", { cocktailId: "negroni" });
    trackProductEvent("cocktail_shared", { cocktailId: "negroni", method: "clipboard" });

    await flushMicrotasks();
    expect(tracked.length).toBe(7);
    const summary = buildCraftPulseSummary(
      tracked.map((raw, i) => {
        const e = raw as { name: string; payload: Record<string, unknown> };
        return {
          session_id: "sess-1",
          event_name: e.name,
          payload: e.payload,
          created_at: new Date(Date.now() - i * 1000).toISOString(),
        };
      })
    );

    expect(summary.cocktailViews).toBe(1);
    expect(summary.zeroResultSearchRows[0]?.query).toBe("division bell");
    expect(summary.findNearbyClicks).toBe(1);
    expect(summary.rates.findNearbyPerBnpView).toBe(1);
    expect(getBufferedProductEvents().length).toBeGreaterThan(0);
  });

  it("provider failure does not throw", () => {
    setAnalyticsProvider({
      id: "fail",
      track() {
        throw new Error("down");
      },
    });
    expect(() =>
      trackProductEvent("mocktail_viewed", { cocktailId: "shirley-temple" })
    ).not.toThrow();
  });
});
