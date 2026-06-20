import { CocktailMatch } from "@/lib/types";
import { analyzeBarHealth } from "./bar-health";
import { getBestDrinkTonight } from "./best-tonight";
import { getDiscoveryRecommendations } from "./discovery-recommendations";
import { getBestUnlockRecommendation } from "./unlock-graph";
import { getUnderutilizedBottles } from "./underutilized";
import {
  BarHealthReport,
  BarIntelligenceDashboard,
  ReviewSignal,
} from "./types";

export type DashboardInput = {
  barIds: string[];
  favoriteIds: string[];
  recentIds: string[];
  matches: CocktailMatch[];
  reviewSignals?: ReviewSignal[];
  inventionFlavorProfiles?: string[][];
};

function buildConsultantHeadline(report: BarHealthReport): string {
  if (report.score >= 85) {
    return "Your bar is in excellent shape — let's find something worthy of it tonight.";
  }

  if (report.score >= 70) {
    return "Solid foundation. One smart pour or bottle could unlock a lot more.";
  }

  if (report.score >= 55) {
    return "Your shelf has potential — several bottles still need activation.";
  }

  return "Let's tighten coverage and turn underused bottles into pours you'll love.";
}

export function buildBarIntelligenceDashboard(
  input: DashboardInput
): BarIntelligenceDashboard | null {
  if (input.barIds.length === 0) return null;

  const health = analyzeBarHealth({
    barIds: input.barIds,
    matches: input.matches,
    favoriteIds: input.favoriteIds,
    recentIds: input.recentIds,
    reviewSignals: input.reviewSignals,
    inventionFlavorProfiles: input.inventionFlavorProfiles,
  });

  if (!health) return null;

  const tasteVector = health.tasteProfile?.vector;

  return {
    barScore: {
      score: health.score,
      grade: health.grade,
      utilizationPercent: health.utilizationPercent,
      headline: buildConsultantHeadline(health),
      insights: health.insights,
    },
    tasteProfile: health.tasteProfile,
    underutilizedBottles: getUnderutilizedBottles(input.barIds),
    bestDrinkTonight: getBestDrinkTonight({
      matches: input.matches,
      tasteVector,
      favoriteIds: input.favoriteIds,
      recentIds: input.recentIds,
    }),
    bestNextPurchase: getBestUnlockRecommendation(input.barIds, {
      tasteVector,
      categoryCounts: health.categoryCounts,
      precomputedMatches: input.matches,
    }),
    discoveryRecommendations: getDiscoveryRecommendations({
      barIds: input.barIds,
      matches: input.matches,
      tasteVector,
      favoriteIds: input.favoriteIds,
      recentIds: input.recentIds,
    }),
    signalSummary: {
      bottleCount: input.barIds.length,
      favoriteCount: input.favoriteIds.length,
      recentCount: input.recentIds.length,
      reviewCount: input.reviewSignals?.length ?? 0,
      inventionCount: input.inventionFlavorProfiles?.length ?? 0,
    },
  };
}
