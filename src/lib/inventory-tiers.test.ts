import { describe, expect, it } from "vitest";
import {
  getCocktailById,
  getIngredientById,
  matchSingleCocktail,
} from "@/lib/cocktail-matching";
import { migrateBarInventory } from "@/lib/inventory-migration";
import {
  getInventoryTier,
  groupMissingByTier,
  isHouseStaple,
} from "@/lib/inventory-tiers";

describe("inventory tiers", () => {
  it("classifies spirits, mixers, and pantry separately", () => {
    expect(getInventoryTier(getIngredientById("bourbon")!)).toBe("spirits-liqueurs");
    expect(getInventoryTier(getIngredientById("campari")!)).toBe("spirits-liqueurs");
    expect(getInventoryTier(getIngredientById("club-soda")!)).toBe("mixers");
    expect(getInventoryTier(getIngredientById("lime-juice")!)).toBe("mixers");
    expect(getInventoryTier(getIngredientById("simple-syrup")!)).toBe("pantry");
    expect(getInventoryTier(getIngredientById("angostura-bitters")!)).toBe("pantry");
  });

  it("treats house staples as always available and not tracked", () => {
    expect(isHouseStaple("ice")).toBe(true);
    expect(isHouseStaple("water")).toBe(true);
    expect(isHouseStaple("bourbon")).toBe(false);

    const migrated = migrateBarInventory(["bourbon", "ice", "water", "invalid-ref"]);
    expect(migrated).toEqual(["bourbon"]);
  });
});

describe("cocktail matching with house staples", () => {
  it("shows only real missing bottles for a partial negroni bar", () => {
    const negroni = getCocktailById("negroni");
    expect(negroni).toBeDefined();

    const match = matchSingleCocktail(negroni!, ["london-dry-gin", "sweet-vermouth"]);

    expect(match.canMake).toBe(false);
    expect(match.missing.map((m) => m.id)).toEqual(["campari"]);
    expect(match.missingByTier["spirits-liqueurs"]?.map((m) => m.id)).toEqual(["campari"]);
    expect(match.missing.some((m) => isHouseStaple(m.id))).toBe(false);
  });

  it("groups missing ingredients by inventory tier", () => {
    const margarita = getCocktailById("margarita");
    expect(margarita).toBeDefined();

    const match = matchSingleCocktail(margarita!, ["london-dry-gin"]);
    const grouped = groupMissingByTier(match.missing);

    expect(Object.keys(grouped).length).toBeGreaterThan(0);
    expect(grouped.mixers?.some((m) => m.id.includes("juice"))).toBe(true);
  });
});
