import { expect, it } from "vitest";
import { ingredientUnlockPreview } from "./bar-health";
import { matchCocktails, matchSingleCocktail } from "@/lib/cocktail-matching";

it("matches a full catalogue rescan for exact, derived and swap candidates", () => {
  for (const bar of [["gin", "sweet-vermouth"], ["tequila-blanco", "triple-sec"], ["bourbon", "simple-syrup", "lime-juice"]]) {
    const before = matchCocktails(bar);
    for (const candidate of ["lime", "soda-water", "campari", "rye-whiskey", "lemon-juice"]) {
      const after = before.filter((m) => !m.canMake).map((m) => [m, matchSingleCocktail(m.cocktail, [...bar, candidate])] as const);
      const ready = after.filter(([, m]) => m.canMake);
      expect(ingredientUnlockPreview(bar, candidate, before)).toEqual({
        unlocks: ready.length,
        movesToOneAway: after.filter(([a, b]) => a.missingCount > 1 && b.missingCount === 1).length,
        examples: ready.slice(0, 6).map(([, m]) => m.cocktail.name),
      });
    }
  }
});
