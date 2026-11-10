"use client";

import { useMemo } from "react";
import Link from "next/link";
import { HorizontalCocktailRow } from "@/components/HorizontalCocktailRow";
import { RecentCocktails } from "@/components/RecentCocktails";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SkeletonGrid } from "@/components/LoadingState";
import { StatPillAction, StatPills } from "@/components/StatPills";
import { isMixologistLaunchHidden } from "@/lib/feature-flags";
import { EmptyState } from "@/components/EmptyState";
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
          title="Add your bar"
          description="Add what you have on the shelf to see what you can pour tonight."
          actionLabel="Open My Bar"
          actionHref="/bar"
          icon="🍾"
        />
        <div className="app-section"><Link href="/discover" className="btn-secondary w-full text-center">Search or browse the Library</Link></div>
      </div>
    );
  }

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Home"
        subtitle="Find your next pour"
        large
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

      <HorizontalCocktailRow
        title="Pour tonight"
        subtitle={tonight.length ? "Make these as written" : "Stock a few more ingredients to find exact matches"}
        items={tonight.slice(0, PREVIEW_COUNT)}
        seeAllHref="/cocktails?view=browse"
        empty="Stock a few more bottles and the magic happens."
      />

      {withSwaps.length > 0 && (
        <HorizontalCocktailRow
          title="Close with a swap"
          subtitle="Make these with a simple substitute"
          items={withSwaps.slice(0, PREVIEW_COUNT)}
          seeAllHref="/cocktails?view=browse"
          empty=""
        />
      )}

      <RecentCocktails />
    </div>
  );
}
