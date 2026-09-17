import { describe, expect, it } from "vitest";
import { ingredients } from "@/lib/cocktail-matching";
import {
  normalizeCommerceIngredient,
  stripMeasurementNoise,
} from "@/lib/commerce/normalize-ingredient";

describe("commerce ingredient normalization", () => {
  it("strips measurement noise from free text", () => {
    expect(stripMeasurementNoise("2 oz Campari")).toBe("Campari");
  });

  it("preserves distinct bottle identities", () => {
    const campari = ingredients.find((i) => i.id === "campari");
    const chartreuse = ingredients.find((i) => i.id === "green-chartreuse");
    expect(campari && chartreuse).toBeTruthy();
    if (!campari || !chartreuse) return;

    const a = normalizeCommerceIngredient(campari);
    const b = normalizeCommerceIngredient(chartreuse);
    expect(a.ingredientId).not.toBe(b.ingredientId);
    expect(a.searchLabel.toLowerCase()).toContain("campari");
    expect(b.searchLabel.toLowerCase()).toContain("chartreuse");
  });
});
