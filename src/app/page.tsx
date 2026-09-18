"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HorizontalCocktailRow } from "@/components/HorizontalCocktailRow";
import { MakeableCountBanner } from "@/components/InfiniteCocktailGrid";
import { RecentCocktails } from "@/components/RecentCocktails";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SkeletonGrid } from "@/components/LoadingState";
import { HomeSearchEntry } from "@/components/HomeSearchEntry";
import { StatPillAction, StatPills } from "@/components/StatPills";
import { isMixologistLaunchHidden } from "@/lib/feature-flags";
import { EmptyState } from "@/components/EmptyState";
import { countExactMakeable } from "@/lib/discovery-filters";
import {
  cocktailCount,
  countWithinReach,
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
  const withinReach = useMemo(() => countWithinReach(matches), [matches]);
  const tonight = grouped.exactMatches;
  const withSwaps = useMemo(
    () => grouped.availableWithSubstitutions,
    [grouped.availableWithSubstitutions]
  );

  if (!loaded) {
    return (
      <div className="app-screen space-y-6">
        <div className="h-12 w-40 shimmer rounded-xl" />
        <div className="grid grid-cols-2 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-[4.25rem] shimmer rounded-2xl" />
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
          withinReach > 0
            ? `${withinReach} cocktails within reach · explore your bar's potential`
            : "Stock a few more bottles to unlock pours"
        }
        large
      />

      <MakeableCountBanner
        exactCount={exactCount}
        withinReach={withinReach}
        swapCount={summary.withSubstitutions}
        viewAllHref="/cocktails?view=browse"
      />

      <StatPills
        stats={{
          ready: { value: summary.readyTonight, label: "Ready", href: "/cocktails" },
          withSwaps: {
            value: summary.withSubstitutions,
            label: "With swaps",
            href: "/cocktails?view=browse",
          },
          oneAway: {
            value: summary.oneAway,
            label: "One away",
            href: "/cocktails?view=one-away",
          },
          library: { value: cocktailCount, label: "Library", href: "/discover" },
          mocktails: {
            value: mocktailCount,
            label: "Mocktails",
            href: "/discover?type=mocktails",
          },
        }}
        centerAction={
          isMixologistLaunchHidden() ? undefined : (
            <StatPillAction href="/mixologist" label="Mixologist" />
          )
        }
      />

      <HomeSearchEntry />

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

      {withinReach > PREVIEW_COUNT && (
        <div className="app-section">
          <Link href="/cocktails?view=browse" className="btn-secondary w-full text-center">
            Explore all {withinReach} cocktails
          </Link>
        </div>
      )}

      <RecentCocktails />
    </div>
  );
}
