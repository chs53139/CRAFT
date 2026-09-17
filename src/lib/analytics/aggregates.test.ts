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
          created_at: new Date().toISOString(),
        },
        {
          session_id: "a",
          event_name: "cocktail_searched",
          payload: { searchKey: "potted parrot", zeroResults: true, resultCount: 0 },
          created_at: new Date().toISOString(),
        },
        {
          session_id: "b",
          event_name: "find_nearby_clicked",
          payload: { ingredientId: "campari", context: "one_away" },
          created_at: new Date().toISOString(),
        },
      ],
      7
    );

    expect(summary.sessions).toBe(2);
    expect(summary.zeroResultSearches).toBe(1);
    expect(summary.zeroResultSearchKeys[0]?.searchKey).toBe("potted parrot");
    expect(summary.commerceIntent[0]?.context).toBe("one_away");
  });
});
