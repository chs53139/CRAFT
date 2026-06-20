"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BarHealthCard } from "@/components/BarHealthCard";
import { BestNextBuy } from "@/components/BestNextBuy";
import { DiscoveryModes } from "@/components/DiscoveryModes";
import { EmptyState } from "@/components/EmptyState";
import { BarPageSkeleton } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { buildBarIntelligence } from "@/lib/bar-intelligence";
import { useCocktailMatches } from "@/hooks/use-cocktail-matches";
import { useFavorites, useMyBar, useRecentCocktails } from "@/hooks/use-my-bar";

export default function BarAnalysisPage() {
  const { barIds, loaded } = useMyBar();
  const { favoriteIds } = useFavorites();
  const { recentIds } = useRecentCocktails();
  const { matches } = useCocktailMatches(barIds);

  const intelligence = useMemo(
    () =>
      buildBarIntelligence({
        barIds,
        favoriteIds,
        recentIds,
        matches,
      }),
    [barIds, favoriteIds, recentIds, matches]
  );

  if (!loaded) {
    return <BarPageSkeleton />;
  }

  if (barIds.length === 0) {
    return (
      <div className="app-screen animate-fade-in">
        <ScreenHeader title="Full Bar Analysis" subtitle="Deeper read on your shelf" large />
        <EmptyState
          title="Stock your bar first"
          description="Add a few bottles and CRAFT can analyze coverage, taste, and gaps."
          actionLabel="Open My Bar"
          actionHref="/bar"
          icon="📊"
        />
      </div>
    );
  }

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Full Bar Analysis"
        subtitle="Coverage, taste profile, and discovery modes"
        large
        action={
          <Link
            href="/bar"
            className="min-h-11 rounded-full px-3 text-sm font-medium text-[var(--muted)] transition active:text-[var(--accent)]"
          >
            ← My Bar
          </Link>
        }
      />

      {intelligence.health && (
        <div className="mt-8">
          <BarHealthCard report={intelligence.health} />
        </div>
      )}

      {intelligence.bestUnlock && (
        <div className="mt-10">
          <BestNextBuy recommendation={intelligence.bestUnlock} />
        </div>
      )}

      <div className="app-section">
        <DiscoveryModes
          barIds={barIds}
          matches={matches}
          tasteVector={intelligence.health?.tasteProfile?.vector}
          favoriteIds={favoriteIds}
          recentIds={recentIds}
          categoryCounts={intelligence.health?.categoryCounts}
        />
      </div>
    </div>
  );
}
