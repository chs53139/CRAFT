import { describe, expect, it } from "vitest";
import {
  countWithinReach,
  getBarSummaryFromMatches,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { isMixologistLaunchHidden } from "@/lib/feature-flags";

describe("Home stat consistency", () => {
  it("withinReach equals Ready + With swaps", () => {
    const matches = matchCocktails(["london-dry-gin", "campari", "sweet-vermouth"]);
    const summary = getBarSummaryFromMatches(matches);
    expect(countWithinReach(matches)).toBe(
      summary.readyTonight + summary.withSubstitutions
    );
  });

  it("hides AI Mixologist center slot at launch", () => {
    expect(isMixologistLaunchHidden()).toBe(true);
  });
});
