import { describe, expect, it } from "vitest";
import { shouldTrackMissingIngredientSelected } from "@/lib/commerce/find-nearby-analytics";

describe("Find Nearby analytics helpers", () => {
  it("tracks missing ingredient selection only in missing-ingredient contexts", () => {
    expect(shouldTrackMissingIngredientSelected("cocktail_detail")).toBe(true);
    expect(shouldTrackMissingIngredientSelected("one_away")).toBe(true);
    expect(shouldTrackMissingIngredientSelected("best_next_purchase")).toBe(false);
  });
});
