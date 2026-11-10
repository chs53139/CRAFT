"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CocktailCard } from "@/components/CocktailCard";
import { DrinkTypeFilter } from "@/components/DrinkTypeFilter";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { InfiniteCocktailGrid } from "@/components/InfiniteCocktailGrid";
import { MenuPageSkeleton, PageLoader } from "@/components/LoadingState";
import { OneAwaySection } from "@/components/OneAwaySection";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useCocktailMatches } from "@/hooks/use-cocktail-matches";
import { useFavorites, useMyBar, useRecentCocktails } from "@/hooks/use-my-bar";
import { trackProductEvent } from "@/lib/analytics";
import { buildTasteProfile, getBestDrinkTonight } from "@/lib/bar-intelligence";
import { groupCocktailMatches } from "@/lib/cocktail-matching";
import { filterMatchesByDrinkType, type DrinkTypeFilter as DrinkType } from "@/lib/drink-type";

function TonightContent() {
  const params = useSearchParams();
  const requested = params.get("view");
  const view = requested === "one-away" || requested === "swaps" ? requested : "ready";
  const { barIds, loaded, error, clearError } = useMyBar();
  const { favoriteIds } = useFavorites();
  const { recentIds } = useRecentCocktails();
  const { matches } = useCocktailMatches(barIds);
  const [drinkType, setDrinkType] = useState<DrinkType>("both");
  const [showBold, setShowBold] = useState(false);

  const scoped = useMemo(() => filterMatchesByDrinkType(matches, drinkType), [matches, drinkType]);
  const groups = useMemo(() => groupCocktailMatches(scoped), [scoped]);
  const oneAway = useMemo(() => groups.stillMissing.filter((match) => match.missingCount === 1), [groups]);
  const recommendation = useMemo(() => {
    if (!barIds.length) return null;
    const tasteVector = buildTasteProfile({ favoriteIds, recentIds })?.vector;
    return getBestDrinkTonight({ matches: scoped, favoriteIds, recentIds, tasteVector });
  }, [barIds.length, scoped, favoriteIds, recentIds]);

  const oneAwayId = oneAway[0]?.cocktail.id;
  const missingId = oneAway[0]?.missing[0]?.id;
  useEffect(() => {
    if (view === "one-away" && oneAwayId && missingId) {
      trackProductEvent("one_away_viewed", { cocktailId: oneAwayId, missingIngredientId: missingId });
    }
  }, [view, oneAwayId, missingId]);

  if (!loaded) return <MenuPageSkeleton />;

  const tabs = [
    { id: "ready", label: "Ready", count: groups.exactMatches.length, href: "/cocktails" },
    { id: "swaps", label: "With Swaps", count: groups.availableWithSubstitutions.length, href: "/cocktails?view=swaps" },
    { id: "one-away", label: "One Away", count: oneAway.length, href: "/cocktails?view=one-away" },
  ] as const;
  const featured = view === "ready" ? recommendation : null;
  const ready = featured
    ? groups.exactMatches.filter((m) => m.cocktail.id !== featured.match.cocktail.id)
    : groups.exactMatches;

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader title="Tonight" subtitle="Find your next pour" large />
      {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={clearError} /></div>}

      {barIds.length === 0 ? (
        <>
          <EmptyState
            title="What’s on your shelf?"
            description="Add a few ingredients to see what you can make tonight."
            actionLabel="Add ingredients"
            actionHref="/bar"
          />
          <div className="app-section">
            <Link href="/discover" className="btn-secondary w-full text-center">Browse Library</Link>
          </div>
        </>
      ) : (
        <>
          <div className="app-section space-y-3">
            <nav aria-label="Readiness" className="grid grid-cols-3 gap-2">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={view === tab.id ? "page" : undefined}
                  className={"surprise-chip text-center " + (view === tab.id ? "surprise-chip-active" : "")}
                >
                  <strong className="block">{tab.count}</strong>
                  {tab.label}
                </Link>
              ))}
            </nav>
            <DrinkTypeFilter value={drinkType} onChange={setDrinkType} />
          </div>

          {featured && (
            <section className="app-section">
              <h2 className="section-row-title">Tonight’s pick</h2>
              <p className="section-row-subtitle mb-3">{featured.reason}</p>
              <CocktailCard match={featured.match} />
            </section>
          )}

          {view === "ready" && (
            <section className="app-section">
              <InfiniteCocktailGrid
                items={ready}
                resetKey={"ready-" + drinkType}
                empty={featured ? null : <p className="section-row-empty">Nothing ready yet. Try With Swaps or One Away.</p>}
              />
            </section>
          )}

          {view === "swaps" && (
            <section className="app-section">
              <InfiniteCocktailGrid
                items={groups.availableWithSubstitutions}
                resetKey={"swaps-" + drinkType}
                empty={<p className="section-row-empty">No standard swaps for this shelf yet.</p>}
              />
              {groups.experimentalMatches.length > 0 && (
                <details className="mt-5" open={showBold} onToggle={(event) => setShowBold(event.currentTarget.open)}>
                  <summary className="cursor-pointer text-sm">Show bold swaps</summary>
                  <p className="section-row-subtitle my-3">Experimental or homemade swaps can change the drink.</p>
                  {showBold && <InfiniteCocktailGrid items={groups.experimentalMatches} resetKey={"bold-" + drinkType} />}
                </details>
              )}
            </section>
          )}

          {view === "one-away" && <OneAwaySection items={oneAway} />}
        </>
      )}
    </div>
  );
}

export default function CocktailsPageClient() {
  return (
    <Suspense fallback={<PageLoader message="Loading tonight…" />}>
      <TonightContent />
    </Suspense>
  );
}
