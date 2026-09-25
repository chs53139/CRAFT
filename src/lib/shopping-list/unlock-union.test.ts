import { describe, expect, it } from "vitest";
import { countUnionUnlocks } from "@/lib/shopping-list/unlock-union";
import { ingredientUnlockPreview } from "@/lib/bar-intelligence/bar-health";
import { matchCocktails } from "@/lib/cocktail-matching";

describe("countUnionUnlocks", () => {
  it("does not double-count overlapping unlocks when summing singles", () => {
    const bar = ["london-dry-gin", "sweet-vermouth"];
    const matches = matchCocktails(bar);
    const campari = "campari";
    const aperol = "aperol";

    const sumSingles =
      ingredientUnlockPreview(bar, campari, matches).unlocks +
      ingredientUnlockPreview(bar, aperol, matches).unlocks;
    const union = countUnionUnlocks(bar, [campari, aperol], matches);

    expect(union.count).toBeLessThanOrEqual(sumSingles);
  });
});
