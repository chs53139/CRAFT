export type {
  BarHealthReport,
  BarIntelligenceDashboard,
  BarPersonality,
  BarScoreSummary,
  BestDrinkTonight,
  CategoryGap,
  CategoryRedundancy,
  DiscoveryModeId,
  DiscoveryModeResult,
  DiscoveryRecommendation,
  IntelligenceSignalSummary,
  NeglectedBottleInsight,
  ReviewSignal,
  TasteProfile,
  TasteVector,
  UnderutilizedBottle,
  UnlockRecommendation,
} from "./types";

export {
  analyzeBarHealth,
  countMakeableUses,
  countOneAwayUses,
  ingredientUnlockPreview,
} from "./bar-health";

export {
  buildTasteProfile,
  scoreTasteFit,
} from "./taste-vector";

export {
  getBestUnlockRecommendation,
  getUnlockRecommendations,
} from "./unlock-graph";

export {
  getNeglectedBottleInsight,
  getNeglectedSpiritNames,
  getNeverThinkToMakeMatch,
  runDiscoveryMode,
} from "./discovery-modes";

export { buildBarAdvice } from "./bar-advice";
export type {
  BarAdvice,
  BarAdviceInput,
  HiddenGemAdvice,
  NeglectedBottleAdvice,
} from "./bar-advice";
export { getBestDrinkTonight } from "./best-tonight";
export { getDiscoveryRecommendations } from "./discovery-recommendations";
export { getUnderutilizedBottles } from "./underutilized";

import { CocktailMatch } from "@/lib/types";
import { analyzeBarHealth } from "./bar-health";
import { getBestUnlockRecommendation, getUnlockRecommendations } from "./unlock-graph";

export function buildBarIntelligence(input: {
  barIds: string[];
  favoriteIds: string[];
  recentIds: string[];
  matches: CocktailMatch[];
}) {
  const health = analyzeBarHealth({
    barIds: input.barIds,
    matches: input.matches,
    favoriteIds: input.favoriteIds,
    recentIds: input.recentIds,
  });

  const tasteVector = health?.tasteProfile?.vector;

  return {
    health,
    unlockRecommendations: getUnlockRecommendations(input.barIds, {
      tasteVector,
      categoryCounts: health?.categoryCounts,
      precomputedMatches: input.matches,
      limit: 3,
    }),
    bestUnlock: getBestUnlockRecommendation(input.barIds, {
      tasteVector,
      categoryCounts: health?.categoryCounts,
      precomputedMatches: input.matches,
    }),
  };
}
