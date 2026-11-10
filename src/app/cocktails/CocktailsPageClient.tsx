"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { CocktailImage } from "@/components/CocktailImage";
import { DrinkTypeFilter } from "@/components/DrinkTypeFilter";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { MenuPageSkeleton, PageLoader } from "@/components/LoadingState";
import { OneAwayCard } from "@/components/OneAwayCard";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useCocktailMatches } from "@/hooks/use-cocktail-matches";
import { useFavorites, useMyBar, useRecentCocktails } from "@/hooks/use-my-bar";
import { trackProductEvent } from "@/lib/analytics";
import { buildTasteProfile, getBestDrinkTonight } from "@/lib/bar-intelligence";
import { type CocktailMatch } from "@/lib/types";
import { formatSubstitutionLine } from "@/lib/substitution-display";
import { groupCocktailMatches } from "@/lib/cocktail-matching";
import { filterMatchesByDrinkType, type DrinkTypeFilter as DrinkType } from "@/lib/drink-type";

const PAGE_SIZE = 4;

function RecipeRow({ match }: { match: CocktailMatch }) {
  const { cocktail, substitutions } = match;
  const detail = substitutions[0] ? formatSubstitutionLine(substitutions[0]) : cocktail.category;
  return (
    <Link className="tonight-recipe-row" href={"/cocktails/" + cocktail.id}>
      <CocktailImage slug={cocktail.id} name={cocktail.name} className="tonight-recipe-thumb" sizes="60px" />
      <span className="min-w-0">
        <span className="tonight-recipe-name">{cocktail.name}</span>
        <span className="tonight-recipe-detail">{detail}{substitutions.length > 1 ? " · +" + (substitutions.length - 1) + " more" : ""}</span>
      </span>
      <span className="tonight-recipe-arrow" aria-hidden>›</span>
    </Link>
  );
}

function RecipePages({ title, items, empty, renderItem }: {
  title: string;
  items: CocktailMatch[];
  empty?: ReactNode;
  renderItem?: (match: CocktailMatch) => ReactNode;
}) {
  const [page, setPage] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const lastPage = Math.max(0, Math.ceil(items.length / PAGE_SIZE) - 1);
  const activePage = Math.min(page, lastPage);
  const first = activePage * PAGE_SIZE;
  const end = Math.min(first + PAGE_SIZE, items.length);
  const move = (next: number) => {
    setPage(next);
    heading.current?.focus({ preventScroll: true });
    heading.current?.scrollIntoView({ block: "nearest" });
  };
  if (!items.length) return empty ? <p className="tonight-empty-note">{empty}</p> : null;
  return (
    <section className="tonight-results">
      <h2 ref={heading} tabIndex={-1} className="section-row-title">{title}</h2>
      <ul className="tonight-result-list">
        {items.slice(first, end).map((match) => <li key={match.cocktail.id}>{renderItem ? renderItem(match) : <RecipeRow match={match} />}</li>)}
      </ul>
      {lastPage > 0 && <div className="tonight-pagination" aria-label={title + " pagination"}>
        <button type="button" disabled={activePage === 0} onClick={() => move(activePage - 1)}>Previous</button>
        <span aria-live="polite">{first + 1}–{end} of {items.length}</span>
        <button type="button" disabled={activePage === lastPage} onClick={() => move(activePage + 1)}>Next</button>
      </div>}
    </section>
  );
}

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
    <div className="app-screen tonight-screen animate-fade-in">
      <ScreenHeader title="Tonight" subtitle="Find your next pour" large />
      {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={clearError} /></div>}

      {barIds.length === 0 ? (
        <>
          <EmptyState
            title="What’s on your shelf?"
            description="Add a few ingredients to see what you can make tonight."
            action={<div className="tonight-guest-actions">
              <Link href="/bar" className="btn-primary">Add ingredients</Link>
              <Link href="/discover" className="btn-secondary">Browse Library</Link>
            </div>}
          />
        </>
      ) : (
        <>
          <div className="tonight-controls">
            <nav aria-label="Readiness" className="tonight-readiness">
              {tabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  aria-current={view === tab.id ? "page" : undefined}
                  className="tonight-readiness-link"
                >
                  <strong className="block">{tab.count}</strong>
                  {tab.label}
                </Link>
              ))}
            </nav>
            <DrinkTypeFilter value={drinkType} onChange={setDrinkType} centered />
          </div>

          {featured && (
            <section className="tonight-feature" aria-label="Tonight’s pick">
              <Link href={"/cocktails/" + featured.match.cocktail.id} className="tonight-feature-link">
                <CocktailImage slug={featured.match.cocktail.id} name={featured.match.cocktail.name} className="tonight-feature-image" sizes="(max-width: 400px) 108px, 142px" priority />
                <div className="tonight-feature-copy">
                  <p className="tonight-feature-kicker">Tonight’s pick</p>
                  <h2>{featured.match.cocktail.name}</h2>
                  <p className="tonight-feature-reason">{featured.reason}</p>
                  <span className="tonight-feature-action">View recipe <span aria-hidden>›</span></span>
                </div>
              </Link>
            </section>
          )}

          {view === "ready" && <RecipePages key={"ready-" + drinkType} title={featured ? "More you can make" : "Ready to make"} items={ready} empty={featured ? null : "Nothing ready yet. Try With Swaps or One Away."} />}

          {view === "swaps" && (
            <>
              <RecipePages key={"swaps-" + drinkType} title="With swaps" items={groups.availableWithSubstitutions} empty="No standard swaps for this shelf yet." />
              {groups.experimentalMatches.length > 0 && (
                <details className="tonight-bold" open={showBold} onToggle={(event) => setShowBold(event.currentTarget.open)}>
                  <summary>Show bold swaps</summary>
                  {showBold && <RecipePages key={"bold-" + drinkType} title="Experimental and homemade" items={groups.experimentalMatches} />}
                </details>
              )}
            </>
          )}

          {view === "one-away" && <RecipePages key={"one-away-" + drinkType} title="One ingredient away" items={oneAway} empty="No drinks are one ingredient away yet." renderItem={(match) => <OneAwayCard match={match} />} />}
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
