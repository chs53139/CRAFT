"use client";

import { useMemo, useState } from "react";
import { BestNextBuy } from "@/components/BestNextBuy";
import { CocktailSection } from "@/components/CocktailSection";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { PageLoader } from "@/components/LoadingState";
import { MyBarInventory } from "@/components/MyBarInventory";
import { RecentCocktails } from "@/components/RecentCocktails";
import {
  cocktailCount,
  getBestNextIngredient,
  getIngredientsByIds,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { useMyBar } from "@/hooks/use-my-bar";

const SECTION_LIMIT = 24;

export default function CocktailsPage() {
  const { barIds, toggleIngredient, loaded, error, clearError } = useMyBar();
  const [search, setSearch] = useState("");

  const filteredMatches = useMemo(() => {
    const matches = matchCocktails(barIds);
    const q = search.trim().toLowerCase();
    if (!q) return matches;
    return matches.filter(
      (m) =>
        m.cocktail.name.toLowerCase().includes(q) ||
        m.cocktail.category.toLowerCase().includes(q) ||
        m.cocktail.flavorProfile.some((f) => f.includes(q))
    );
  }, [barIds, search]);

  if (!loaded) {
    return <PageLoader message="Matching cocktails to your bar…" />;
  }

  const barIngredients = getIngredientsByIds(barIds);
  const tonight = filteredMatches.filter((m) => m.canMake);
  const oneAway = filteredMatches.filter((m) => m.missingCount === 1);
  const twoAway = filteredMatches.filter((m) => m.missingCount === 2);
  const threeAway = filteredMatches.filter((m) => m.missingCount === 3);
  const recommendation = getBestNextIngredient(barIds);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
        Tonight&apos;s menu
      </p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-light text-[var(--foreground)] sm:text-4xl">
        What can you pour?
      </h1>
      <p className="mt-2 max-w-xl text-sm text-[var(--muted)] sm:text-base">
        {cocktailCount} cocktails matched to your bar in real time.
      </p>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      {barIds.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title="Your bar is empty"
            description="Hard to make a Negroni with nothing but ambition. Stock your bar first."
            actionLabel="Go to My Bar"
            actionHref="/bar"
          />
        </div>
      ) : (
        <>
          <div className="mt-8">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cocktails…"
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]/50 sm:max-w-md"
            />
          </div>

          <div className="mt-10">
            <MyBarInventory
              ingredients={barIngredients}
              onRemove={toggleIngredient}
              emptyMessage=""
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
            subtitle={`${tonight.length} ready`}
            items={tonight.slice(0, SECTION_LIMIT)}
            empty="Not quite there yet — check the recommendation above."
          />
          {tonight.length > SECTION_LIMIT && (
            <p className="mt-2 text-xs text-[var(--muted)]">
              Showing {SECTION_LIMIT} of {tonight.length}. Use search to narrow down.
            </p>
          )}

          <CocktailSection
            title="One Ingredient Away"
            subtitle="One bottle between you and glory."
            items={oneAway.slice(0, SECTION_LIMIT)}
            empty="Nothing teasing you tonight. Yet."
          />

          <CocktailSection
            title="Two Ingredients Away"
            items={twoAway.slice(0, SECTION_LIMIT)}
          />

          <CocktailSection
            title="Three Ingredients Away"
            items={threeAway.slice(0, SECTION_LIMIT)}
          />
        </>
      )}
    </div>
  );
}
