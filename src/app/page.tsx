"use client";

import Link from "next/link";
import { BestNextBuy } from "@/components/BestNextBuy";
import { EmptyState } from "@/components/EmptyState";
import { HorizontalCocktailRow } from "@/components/HorizontalCocktailRow";
import { SkeletonGrid } from "@/components/LoadingState";
import { StatPills } from "@/components/StatPills";
import { SurpriseMe } from "@/components/SurpriseMe";
import { getHiddenGems } from "@/lib/cocktail-discovery";
import {
  cocktailCount,
  getBarSummary,
  getBestNextIngredient,
  getIngredientsByIds,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { useMyBar } from "@/hooks/use-my-bar";

export default function HomePage() {
  const { barIds, loaded } = useMyBar();

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

  const summary = getBarSummary(barIds);
  const matches = matchCocktails(barIds);
  const tonight = matches.filter((m) => m.canMake);
  const oneAway = matches.filter((m) => m.missingCount === 1);
  const hiddenGems = getHiddenGems(barIds, 10);
  const recommendation = getBestNextIngredient(barIds);
  const barIngredients = getIngredientsByIds(barIds);

  return (
    <div className="app-screen animate-fade-in">
      <p className="screen-subtitle mb-4">
        {barIngredients.length} bottles on your shelf
      </p>

      <StatPills
        stats={[
          { value: summary.readyTonight, label: "Ready now" },
          { value: summary.oneAway, label: "One away" },
          { value: cocktailCount, label: "In catalogue" },
        ]}
      />

      <HorizontalCocktailRow
        title="Pour tonight"
        subtitle={
          tonight.length > 0
            ? `${tonight.length} ready to make`
            : "Add a bottle to unlock more"
        }
        items={tonight.slice(0, 10)}
        seeAllHref="/cocktails"
        empty="Stock a few more bottles and the magic happens."
      />

      {recommendation && (
        <div className="app-section">
          <BestNextBuy recommendation={recommendation} />
        </div>
      )}

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

      <div className="app-section">
        <SurpriseMe barIds={barIds} />
      </div>

      <HorizontalCocktailRow
        title="Almost there"
        subtitle="One ingredient away"
        items={oneAway.slice(0, 10)}
        seeAllHref="/cocktails"
        empty="Keep building — these show up as your bar grows."
      />

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
