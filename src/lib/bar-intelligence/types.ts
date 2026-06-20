import { CocktailMatch, Ingredient, IngredientRecommendation } from "@/lib/types";
import { ShopCategory } from "@/lib/ingredient-categories";

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
  category: ShopCategory;
  label: string;
  message: string;
};

export type CategoryRedundancy = {
  category: ShopCategory;
  count: number;
  message: string;
};

export type BarHealthReport = {
  score: number;
  grade: "A" | "B" | "C" | "D";
  utilizationPercent: number;
  categoryCounts: Partial<Record<ShopCategory, number>>;
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
