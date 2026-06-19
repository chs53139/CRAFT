"use client";

import Link from "next/link";
import { BestNextBuy } from "@/components/BestNextBuy";
import { CocktailSection } from "@/components/CocktailSection";
import { EmptyState } from "@/components/EmptyState";
import { PageLoader } from "@/components/LoadingState";
import { MyBarInventory } from "@/components/MyBarInventory";
import { RecentCocktails } from "@/components/RecentCocktails";
import {
  getBestNextIngredient,
  getIngredientsByIds,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { useMyBar } from "@/hooks/use-my-bar";

export function HomeDashboard() {
  const { barIds, toggleIngredient, loaded } = useMyBar();

  if (!loaded) {
    return <PageLoader message="Loading your bar…" />;
  }

  if (barIds.length === 0) {
    return (
      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <EmptyState
          title="First time here?"
          description="Head to My Bar, tap what you actually own, and come back. Your countertop is smarter than you gave it credit for."
          actionLabel="Start with My Bar"
          actionHref="/bar"
        />
        <RecentCocktails />
      </section>
    );
  }

  const barIngredients = getIngredientsByIds(barIds);
  const matches = matchCocktails(barIds);
  const tonight = matches.filter((m) => m.canMake);
  const oneAway = matches.filter((m) => m.missingCount === 1);
  const recommendation = getBestNextIngredient(barIds);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="mt-10 sm:mt-12">
        <MyBarInventory
          ingredients={barIngredients}
          onRemove={toggleIngredient}
        />
      </div>

      {recommendation && (
        <div className="mt-10">
          <BestNextBuy recommendation={recommendation} />
        </div>
      )}

      <RecentCocktails />

      <CocktailSection
        title="You Can Make Tonight"
        subtitle={
          tonight.length > 0
            ? `${tonight.length} drink${tonight.length !== 1 ? "s" : ""} waiting. No Uber required.`
            : "Almost there — one bottle changes everything."
        }
        items={tonight.slice(0, 6)}
        empty="Stock a few more bottles and the magic happens."
      />

      <CocktailSection
        title="One Ingredient Away"
        subtitle="So close you can taste it. Literally, soon."
        items={oneAway.slice(0, 6)}
        empty="Nothing on the edge yet. Keep building your bar."
      />

      <div className="mt-14 text-center">
        <Link
          href="/cocktails"
          className="text-sm text-[var(--accent)] transition hover:underline"
        >
          See full menu →
        </Link>
      </div>
    </div>
  );
}
