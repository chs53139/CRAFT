import { describe, expect, it } from "vitest";
import { canonicalIngredientId, ingredientSupplies, normalizeIngredientIds } from "./ingredient-intelligence";
import { cocktails, ingredients, getCocktailById, matchSingleCocktail, getBarSummaryFromMatches, matchCocktails, getBestNextIngredient } from "./cocktail-matching";
import { migrateBarInventory } from "./inventory-migration";
import { findBestIngredientMatch, finalizeDetection, finalizeDetections } from "./scan-bottles/mapping";
import { ingredientUnlockPreview } from "./bar-intelligence/bar-health";
import { countUnionUnlocks } from "./shopping-list/unlock-union";
import { appendShoppingListItem } from "./shopping-list/mutations";
import { findSubstitution } from "./substitutions";

describe("ingredient intelligence", () => {
  it("deduplicates exact aliases in inventory and the catalogue", () => {
    expect(normalizeIngredientIds(["Soda Water", "club-soda", "soda_water"])).toEqual(["club-soda"]);
    expect(migrateBarInventory(["soda-water", "club-soda", "limes"])).toEqual(["club-soda", "lime"]);
    expect(ingredients.filter((i) => ["soda-water", "club-soda"].includes(i.id))).toHaveLength(1);
    expect(cocktails).toHaveLength(672);
    expect(appendShoppingListItem([{ ingredientId: "soda-water", addedAt: "old" }], { ingredientId: "club-soda", addedAt: "new" }).added).toBe(false);
    expect(finalizeDetections([{ detectedBottleName: "Soda water" }, { detectedBottleName: "Club soda" }])).toHaveLength(1);
  });
  it("supplies juice directionally without supplying garnish or cordial", () => {
    expect(ingredientSupplies("limes", "fresh lime juice")).toBe(true);
    expect(ingredientSupplies("lime-juice", "lime")).toBe(false);
    for (const id of ["lime-peel", "lime-zest", "lime-disc", "lime-cordial"]) expect(ingredientSupplies("lime", id)).toBe(false);
    expect(migrateBarInventory(["limes"])).toEqual(["lime"]);
    expect(findSubstitution("lime-juice", new Set(["lime"]))).toBe("lime");
  });
  it("keeps ambiguous spirits unresolved even with a model suggestion", () => {
    expect(canonicalIngredientId("whisky")).toBe("whiskey");
    expect(ingredientSupplies("whiskey", "bourbon")).toBe(false);
    expect(findBestIngredientMatch("whiskey", "spirit").ingredient).toBeNull();
    const scan = finalizeDetection({ detectedBottleName: "whisky", suggestedIngredientId: "bourbon", confidence: 0.99 });
    expect(scan.mappedIngredientId).toBeNull();
    expect(scan.needsReview).toBe(true);
    const recipe = getCocktailById("old-fashioned")!;
    const bar = recipe.ingredients.map((i) => i.ingredientId === "bourbon" ? "whiskey" : i.ingredientId);
    expect(matchSingleCocktail(recipe, bar).canMake).toBe(false);
    const swapped = matchSingleCocktail(recipe, [...bar, "rye-whiskey"]);
    expect(swapped.canMake).toBe(false);
    expect(swapped.substitutions.some((s) => s.requiredId === "bourbon")).toBe(true);
  });
  it("keeps Ready, With Swaps and One Away distinct downstream", () => {
    const recipe = getCocktailById("margarita")!;
    const base = recipe.ingredients.filter((i) => i.ingredientId !== "lime-juice").map((i) => i.ingredientId);
    const before = matchSingleCocktail(recipe, base);
    expect(before.missingCount).toBe(1);
    expect(getBarSummaryFromMatches([before]).oneAway).toBe(1);
    const ready = matchSingleCocktail(recipe, [...base, "limes"]);
    expect(ready.canMake).toBe(true);
    expect(ready.substitutions).toEqual([]);
    expect(getBarSummaryFromMatches([ready])).toMatchObject({ readyTonight: 1, oneAway: 0, withSubstitutions: 0 });
    const preview = ingredientUnlockPreview(base, "lime", [before]);
    expect(preview.unlocks).toBe(1);
    expect(countUnionUnlocks(base, ["lime"]).count).toBeGreaterThan(0);
    expect(getBestNextIngredient([...base, "lime"])?.ingredient.id).not.toBe("lime-juice");
    expect(matchCocktails(["soda-water"])).toEqual(matchCocktails(["club-soda", "soda-water"]));
  });
});
