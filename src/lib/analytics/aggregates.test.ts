import { describe, expect, it } from "vitest";
import { buildCraftPulseSummary } from "@/lib/analytics/aggregates";

describe("buildCraftPulseSummary", () => {
  it("aggregates sessions, zero-result searches, and commerce context", () => {
    const summary = buildCraftPulseSummary(
      [
        {
          session_id: "a",
          event_name: "cocktail_viewed",
          payload: { cocktailId: "negroni" },
          created_at: "2026-09-10T12:00:00.000Z",
        },
        {
          session_id: "a",
          event_name: "cocktail_searched",
          payload: { searchKey: "potted parrot", zeroResults: true, resultCount: 0 },
          created_at: "2026-09-10T12:01:00.000Z",
        },
        {
          session_id: "b",
          event_name: "find_nearby_clicked",
          payload: { ingredientId: "campari", context: "one_away" },
          created_at: "2026-09-11T08:00:00.000Z",
        },
        {
          session_id: "b",
          event_name: "cocktail_viewed",
          payload: { cocktailId: "margarita" },
          created_at: "2026-09-12T08:00:00.000Z",
        },
      ],
      7
    );

    expect(summary.sessions).toBe(2);
    expect(summary.returningSessions).toBe(1);
    expect(summary.zeroResultSearches).toBe(1);
    expect(summary.zeroResultSearchRows[0]?.query).toBe("potted parrot");
    expect(summary.zeroResultSearchRows[0]?.count).toBe(1);
    expect(summary.commerceIntent[0]?.context).toBe("one_away");
  });
});
