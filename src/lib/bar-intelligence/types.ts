import { CocktailMatch, Ingredient, IngredientRecommendation } from "@/lib/types";
import { InventoryTier } from "@/lib/inventory-tiers";

export type TasteVector = Record<string, number>;

export type TasteProfile = {
  vector: TasteVector;
  dominantFlavors: string[];
  strengthPreference: "low" | "medium" | "high";
  adventurousnessScore: number;
  discoveryScore: number;
  personality: BarPersonality;
  signalCount: number;
};

export type BarPersonality = {
  label: string;
  description: string;
};

export type CategoryGap = {
  category: InventoryTier;
  label: string;
  message: string;
};

export type CategoryRedundancy = {
  category: InventoryTier;
  count: number;
  message: string;
};

export type BarHealthReport = {
  score: number;
  grade: "A" | "B" | "C" | "D";
  utilizationPercent: number;
  categoryCounts: Partial<Record<InventoryTier, number>>;
  redundancies: CategoryRedundancy[];
  gaps: CategoryGap[];
  insights: string[];
  tasteProfile: TasteProfile | null;
};

export type UnlockRecommendation = IngredientRecommendation & {
  movesToOneAway: number;
  roiScore: number;
  gapFillScore: number;
  tasteFitScore: number;
  reason: string;
};

export type NeglectedBottleInsight = {
  ingredient: Ingredient;
  makeableCount: number;
  oneAwayCount: number;
  exampleCocktails: string[];
  message: string;
};

export type DiscoveryModeId = "neglected-bottle" | "never-think" | "biggest-upgrade";

export type DiscoveryModeResult =
  | {
      mode: "neglected-bottle";
      title: string;
      subtitle: string;
      insight: NeglectedBottleInsight;
    }
  | {
      mode: "never-think";
      title: string;
      subtitle: string;
      match: CocktailMatch;
    }
  | {
      mode: "biggest-upgrade";
      title: string;
      subtitle: string;
      recommendation: UnlockRecommendation;
    };

export type ReviewSignal = {
  cocktailId: string;
  rating: number;
  wouldMakeAgain: boolean;
};

export type UnderutilizedBottle = {
  ingredient: Ingredient;
  makeableCount: number;
  oneAwayCount: number;
  exampleCocktails: string[];
  message: string;
};

export type BestDrinkTonight = {
  match: CocktailMatch;
  tasteMatchPercent: number;
  reason: string;
};

export type DiscoveryRecommendation = {
  id: string;
  kind: "surprise" | "hidden-gem" | "stretch" | "bottle";
  title: string;
  subtitle: string;
  cocktailId?: string;
  ingredientId?: string;
  href: string;
};

export type BarScoreSummary = {
  score: number;
  grade: BarHealthReport["grade"];
  utilizationPercent: number;
  headline: string;
  insights: string[];
};

export type IntelligenceSignalSummary = {
  bottleCount: number;
  favoriteCount: number;
  recentCount: number;
  reviewCount: number;
  inventionCount: number;
};

export type BarIntelligenceDashboard = {
  barScore: BarScoreSummary;
  tasteProfile: TasteProfile | null;
  underutilizedBottles: UnderutilizedBottle[];
  bestDrinkTonight: BestDrinkTonight | null;
  bestNextPurchase: UnlockRecommendation | null;
  discoveryRecommendations: DiscoveryRecommendation[];
  signalSummary: IntelligenceSignalSummary;
};
