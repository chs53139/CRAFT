"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HorizontalCocktailRow } from "@/components/HorizontalCocktailRow";
import { MakeableCountBanner } from "@/components/InfiniteCocktailGrid";
import { RecentCocktails } from "@/components/RecentCocktails";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SkeletonGrid } from "@/components/LoadingState";
import { StatPillAction, StatPills } from "@/components/StatPills";
import { EmptyState } from "@/components/EmptyState";
import { countExactMakeable, countMakeable } from "@/lib/discovery-filters";
import {
  cocktailCount,
  getBarSummaryFromMatches,
  mocktailCount,
} from "@/lib/cocktail-matching";
import { useCocktailMatches } from "@/hooks/use-cocktail-matches";
import { useMyBar } from "@/hooks/use-my-bar";

const PREVIEW_COUNT = 12;

export default function HomePage() {
  const { barIds, loaded } = useMyBar();
  const { matches, grouped } = useCocktailMatches(barIds);

  const summary = useMemo(() => getBarSummaryFromMatches(matches), [matches]);
  const exactCount = useMemo(() => countExactMakeable(matches), [matches]);
  const totalMakeable = useMemo(() => countMakeable(matches), [matches]);
  const tonight = grouped.exactMatches;
  const withSwaps = useMemo(
    () => grouped.availableWithSubstitutions,
    [grouped.availableWithSubstitutions]
  );

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
      <ScreenHeader
        title="Home"
        subtitle={
          totalMakeable > 0
            ? `${totalMakeable} cocktails within reach · explore your bar's potential`
            : "Stock a few more bottles to unlock pours"
        }
        large
      />

      <MakeableCountBanner
        exactCount={exactCount}
        totalMakeable={totalMakeable}
        viewAllHref="/cocktails?view=browse"
      />

      <StatPills
        topRow={[
          { value: summary.readyTonight, label: "Ready", href: "/cocktails" },
          {
            value: summary.withSubstitutions,
            label: "With swaps",
            href: "/cocktails?view=browse",
          },
        ]}
        bottomRow={[
          { value: summary.oneAway, label: "One away", href: "/cocktails?view=one-away" },
          { value: cocktailCount, label: "Library", href: "/discover" },
          { value: mocktailCount, label: "Mocktails", href: "/discover?type=mocktails" },
        ]}
        centerAction={<StatPillAction href="/mixologist" label="Mixologist" />}
      />

      <HorizontalCocktailRow
        title="Pour tonight"
        subtitle={
          tonight.length > 0
            ? `${tonight.length} exact match${tonight.length === 1 ? "" : "es"}`
            : withSwaps.length > 0
              ? "No exact matches — try a swap below"
              : "Add a bottle to unlock more"
        }
        items={tonight.slice(0, PREVIEW_COUNT)}
        seeAllHref="/cocktails?view=browse"
        empty="Stock a few more bottles and the magic happens."
      />

      {withSwaps.length > 0 && (
        <HorizontalCocktailRow
          title="Close with a swap"
          subtitle={`${withSwaps.length} cocktail${withSwaps.length === 1 ? "" : "s"} with a simple substitute`}
          items={withSwaps.slice(0, PREVIEW_COUNT)}
          seeAllHref="/cocktails?view=browse"
          empty=""
        />
      )}

      {totalMakeable > PREVIEW_COUNT && (
        <div className="app-section">
          <Link href="/cocktails?view=browse" className="btn-secondary w-full text-center">
            Explore all {totalMakeable} cocktails
          </Link>
        </div>
      )}

      <RecentCocktails />
    </div>
  );
}
