"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BarHealthCard } from "@/components/BarHealthCard";
import { BestNextBuy } from "@/components/BestNextBuy";
import { DiscoveryModes } from "@/components/DiscoveryModes";
import { EmptyState } from "@/components/EmptyState";
import { HorizontalCocktailRow } from "@/components/HorizontalCocktailRow";
import { RecentCocktails } from "@/components/RecentCocktails";
import { SkeletonGrid } from "@/components/LoadingState";
import { StatPillAction, StatPills } from "@/components/StatPills";
import { SurpriseMe } from "@/components/SurpriseMe";
import { getHiddenGems } from "@/lib/cocktail-discovery";
import { buildBarIntelligence } from "@/lib/bar-intelligence";
import {
  cocktailCount,
  getBarSummaryFromMatches,
  getIngredientsByIds,
  mocktailCount,
} from "@/lib/cocktail-matching";
import { useCocktailMatches } from "@/hooks/use-cocktail-matches";
import { useFavorites, useMyBar, useRecentCocktails } from "@/hooks/use-my-bar";

export default function HomePage() {
  const { barIds, loaded } = useMyBar();
  const { favoriteIds } = useFavorites();
  const { recentIds } = useRecentCocktails();
  const { matches, grouped } = useCocktailMatches(barIds);

  const summary = useMemo(() => getBarSummaryFromMatches(matches), [matches]);
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
  const tonight = grouped.exactMatches;
  const withSwaps = useMemo(
    () => grouped.availableWithSubstitutions,
    [grouped.availableWithSubstitutions]
  );
  const hiddenGems = useMemo(() => getHiddenGems(barIds, 10, matches), [barIds, matches]);
  const barIngredients = useMemo(() => getIngredientsByIds(barIds), [barIds]);

  if (!loaded) {
    return (
      <div className="app-screen space-y-6">
        <div className="h-12 w-40 shimmer rounded-xl" />
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 w-32 shrink-0 shimmer rounded-2xl" />
          ))}
        </div>
        <SkeletonGrid count={2} />
      </div>
    );
  }

  if (barIds.length === 0) {
    return (
      <div className="app-screen">
        <EmptyState
          title="Stock your bar"
          description="Add what you own and CRAFT will show you exactly what you can pour tonight."
          actionLabel="Open My Bar"
          actionHref="/bar"
          icon="🍾"
        />
      </div>
    );
  }

  return (
    <div className="app-screen animate-fade-in">
      <p className="screen-subtitle mb-4">
        {barIngredients.length} bottles on your shelf
      </p>

      <StatPills
        stats={[
          { value: summary.readyTonight, label: "Ready", href: "/cocktails?view=ready" },
          {
            value: summary.withSubstitutions,
            label: "With swaps",
            href: "/cocktails",
          },
          { value: summary.oneAway, label: "One away", href: "/cocktails?view=one-away" },
          { value: cocktailCount - mocktailCount, label: "Catalogue", href: "/discover" },
          { value: mocktailCount, label: "Mocktails", href: "/mocktails" },
        ]}
        trailingAction={
          <StatPillAction href="/mixologist" label="Mixologist" />
        }
      />

      {intelligence.health && (
        <div className="app-section">
          <BarHealthCard report={intelligence.health} compact />
        </div>
      )}

      <HorizontalCocktailRow
        title="Pour tonight"
        subtitle={
          tonight.length > 0
            ? `${tonight.length} exact match${tonight.length === 1 ? "" : "es"}`
            : withSwaps.length > 0
              ? "No exact matches — try a swap below"
              : "Add a bottle to unlock more"
        }
        items={tonight.slice(0, 10)}
        seeAllHref="/cocktails?view=ready"
        empty="Stock a few more bottles and the magic happens."
      />

      {withSwaps.length > 0 && (
        <HorizontalCocktailRow
          title="Close with a swap"
          subtitle={`${withSwaps.length} cocktail${withSwaps.length === 1 ? "" : "s"} with a simple substitute`}
          items={withSwaps.slice(0, 10)}
          seeAllHref="/cocktails"
          empty=""
        />
      )}

      {intelligence.bestUnlock && (
        <div className="app-section">
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

      {hiddenGems.length > 0 && (
        <HorizontalCocktailRow
          title="Hidden gems"
          subtitle="Unusual pours your bar can make right now"
          items={hiddenGems}
          seeAllHref="/cocktails"
          showObscurity
          empty=""
        />
      )}

      <RecentCocktails />

      <div className="app-section">
        <SurpriseMe barIds={barIds} />
      </div>

      <div className="app-section">
        <Link href="/bar" className="account-row">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Manage bar</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              {barIngredients.length} ingredients saved
            </p>
          </div>
          <span className="text-[var(--accent)]">→</span>
        </Link>
      </div>
    </div>
  );
}
