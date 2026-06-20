import { describe, expect, it } from "vitest";
import { analyzeBarHealth } from "@/lib/bar-intelligence/bar-health";
import { buildTasteProfile, scoreTasteFit } from "@/lib/bar-intelligence/taste-vector";
import { getBestUnlockRecommendation } from "@/lib/bar-intelligence/unlock-graph";
import { getCocktailById } from "@/lib/cocktail-matching";

describe("buildTasteProfile", () => {
  it("builds a profile from favorites and recents", () => {
    const profile = buildTasteProfile({
      favoriteIds: ["negroni"],
      recentIds: ["old-fashioned", "boulevardier"],
    });

    expect(profile).not.toBeNull();
    expect(profile!.personality.label.length).toBeGreaterThan(0);
    expect(profile!.dominantFlavors.length).toBeGreaterThan(0);
  });
});

describe("scoreTasteFit", () => {
  it("scores similar cocktails higher than unrelated ones", () => {
    const negroni = getCocktailById("negroni");
    const boulevardier = getCocktailById("boulevardier");
    const mojito = getCocktailById("mojito");

    expect(negroni && boulevardier && mojito).toBeTruthy();

    const profile = buildTasteProfile({ favoriteIds: ["negroni"], recentIds: [] });
    expect(profile).not.toBeNull();

    const bitterScore = scoreTasteFit(boulevardier!, profile!.vector);
    const tropicalScore = scoreTasteFit(mojito!, profile!.vector);

    expect(bitterScore).toBeGreaterThan(tropicalScore);
  });
});

describe("analyzeBarHealth", () => {
  it("returns health metrics for a stocked bar", () => {
    const report = analyzeBarHealth({
      barIds: ["london-dry-gin", "campari", "sweet-vermouth", "lime-juice", "simple-syrup"],
      favoriteIds: ["negroni"],
      recentIds: ["negroni"],
    });

    expect(report).not.toBeNull();
    expect(report!.score).toBeGreaterThan(0);
    expect(report!.insights.length).toBeGreaterThan(0);
  });
});

describe("getBestUnlockRecommendation", () => {
  it("returns an unlock recommendation for a partial bar", () => {
    const recommendation = getBestUnlockRecommendation(["london-dry-gin", "campari"]);
    expect(recommendation).not.toBeNull();
    expect(recommendation!.unlocksCount).toBeGreaterThan(0);
    expect(recommendation!.reason.length).toBeGreaterThan(0);
  });
});
