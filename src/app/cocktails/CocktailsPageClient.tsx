"use client";

import Link from "next/link";
import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CocktailSection } from "@/components/CocktailSection";
import { CollectionFilter } from "@/components/CollectionFilter";
import {
  DiscoveryFilterPanel,
  DiscoveryFilterToggle,
} from "@/components/DiscoveryFilterPanel";
import { DrinkTypeFilter } from "@/components/DrinkTypeFilter";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import {
  InfiniteCocktailGrid,
  MakeableCountBanner,
} from "@/components/InfiniteCocktailGrid";
import { MenuPageSkeleton, PageLoader } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchField } from "@/components/SearchField";
import { SubstitutionModeFilter } from "@/components/SubstitutionModeFilter";
import {
  countExactMakeable,
  countMakeable,
  DEFAULT_DISCOVERY_FILTERS,
  applyDiscoveryFilters,
  DiscoveryFilters,
  DiscoverySort,
  hasActiveDiscoveryFilters,
  sortDiscoveryResults,
} from "@/lib/discovery-filters";
import {
  filterMatchesBySearch,
  groupCocktailMatches,
  isPourable,
  matchCocktails,
} from "@/lib/cocktail-matching";
import {
  matchPassesSubstitutionMode,
  SubstitutionMode,
} from "@/lib/substitution-display";
import { filterMatchesByDrinkType } from "@/lib/drink-type";
import { CocktailCollection } from "@/lib/types";
import { useMyBar } from "@/hooks/use-my-bar";

type TonightView = "all" | "ready" | "one-away" | "browse";

const VIEW_TABS: Array<{ id: TonightView; label: string; href: string }> = [
  { id: "ready", label: "Ready now", href: "/cocktails" },
  { id: "browse", label: "Browse all", href: "/cocktails?view=browse" },
  { id: "all", label: "All sections", href: "/cocktails?view=all" },
  { id: "one-away", label: "One away", href: "/cocktails?view=one-away" },
];

function parseView(value: string | null): TonightView {
  if (value === "all" || value === "one-away" || value === "browse") return value;
  return "ready";
}

function TonightViewTabs({ active }: { active: TonightView }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {VIEW_TABS.map((tab) => (
        <Link
          key={tab.id}
          href={tab.href}
          className={`surprise-chip shrink-0 ${active === tab.id ? "surprise-chip-active" : ""}`}
        >
          {tab.label}
        </Link>
      ))}
    </div>
  );
}

function countActiveFilters(filters: DiscoveryFilters): number {
  let count = 0;
  if (filters.spirit !== "all") count++;
  if (filters.category !== "all") count++;
  if (filters.difficulty !== "all") count++;
  if (filters.flavor !== "all") count++;
  if (filters.strength !== "all") count++;
  if (filters.rarity !== "all") count++;
  if (filters.rating !== "all") count++;
  if (filters.craftOriginals) count++;
  return count;
}

function CocktailsContent() {
  const searchParams = useSearchParams();
  const view = parseView(searchParams.get("view"));
  const { barIds, loaded, error, clearError } = useMyBar();
  const [search, setSearch] = useState("");
  const [collection, setCollection] = useState<"all" | CocktailCollection>("all");
  const [substitutionMode, setSubstitutionMode] =
    useState<SubstitutionMode>("include-substitutions");
  const [drinkTypeFilter, setDrinkTypeFilter] =
    useState<"both" | "cocktails" | "mocktails">("cocktails");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilters>(
    DEFAULT_DISCOVERY_FILTERS
  );
  const [sort, setSort] = useState<DiscoverySort>("best-match");

  const allMatches = useMemo(() => matchCocktails(barIds), [barIds]);

  const processedMatches = useMemo(() => {
    let results = filterMatchesByDrinkType(allMatches, drinkTypeFilter);
    results = filterMatchesBySearch(results, search);
    results = applyDiscoveryFilters(results, {
      ...discoveryFilters,
      collection: collection === "all" ? undefined : collection,
    });
    return sortDiscoveryResults(results, sort, search);
  }, [allMatches, drinkTypeFilter, search, discoveryFilters, collection, sort]);

  const { exactMatches, availableWithSubstitutions, experimentalMatches, stillMissing } =
    useMemo(() => groupCocktailMatches(processedMatches), [processedMatches]);

  const visibleExact = useMemo(
    () => exactMatches.filter((match) => matchPassesSubstitutionMode(match, substitutionMode)),
    [exactMatches, substitutionMode]
  );
  const visibleSubstitutions = useMemo(
    () =>
      availableWithSubstitutions.filter((match) =>
        matchPassesSubstitutionMode(match, substitutionMode)
      ),
    [availableWithSubstitutions, substitutionMode]
  );
  const visibleExperimental = useMemo(
    () =>
      experimentalMatches.filter((match) =>
        matchPassesSubstitutionMode(match, substitutionMode)
      ),
    [experimentalMatches, substitutionMode]
  );

  const makeableMatches = useMemo(
    () => processedMatches.filter((m) => isPourable(m)),
    [processedMatches]
  );

  const exactCount = useMemo(() => countExactMakeable(allMatches), [allMatches]);
  const totalMakeable = useMemo(() => countMakeable(allMatches), [allMatches]);

  if (!loaded) {
    return <MenuPageSkeleton />;
  }

  const oneAway = stillMissing.filter((m) => m.missingCount === 1);
  const searchActive = search.trim().length > 0 || hasActiveDiscoveryFilters(discoveryFilters);
  const showBrowse = view === "browse" || (searchActive && view !== "one-away");
  const showAllSections = view === "all";
  const showReady = view === "ready" || view === "all";
  const showOneAway = view === "one-away";

  const hasVisibleResults =
    (showBrowse && makeableMatches.length > 0) ||
    (showReady &&
      (visibleExact.length > 0 ||
        visibleSubstitutions.length > 0 ||
        visibleExperimental.length > 0)) ||
    (showOneAway && oneAway.length > 0) ||
    (showAllSections && stillMissing.length > 0);

  const noResults = !hasVisibleResults;

  const filterResetKey = `${search}|${JSON.stringify(discoveryFilters)}|${sort}|${view}|${collection}`;

  const headerSubtitle =
    view === "browse"
      ? `${makeableMatches.length} cocktails to explore`
      : view === "ready"
        ? `${visibleExact.length} exact · ${visibleSubstitutions.length} with subs`
        : view === "one-away"
          ? `${oneAway.length} one bottle away`
          : barIds.length === 0
            ? "Stock your bar first"
            : `${exactCount} exact · ${totalMakeable} makeable`;

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader title="Tonight" subtitle={headerSubtitle} large />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      {barIds.length === 0 ? (
        <EmptyState
          title="Your bar is empty"
          description="Add ingredients in the Bar tab, then come back here for matches."
          actionLabel="Open My Bar"
          actionHref="/bar"
        />
      ) : (
        <>
          <MakeableCountBanner
            exactCount={exactCount}
            totalMakeable={totalMakeable}
            viewAllHref="/cocktails?view=browse"
          />

          <TonightViewTabs active={view} />

          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search spirits, ingredients, flavors, tiki…"
          />

          <div className="app-section space-y-4">
            <SubstitutionModeFilter value={substitutionMode} onChange={setSubstitutionMode} />

            <DiscoveryFilterToggle
              expanded={showAdvancedFilters}
              onToggle={() => setShowAdvancedFilters((value) => !value)}
              activeCount={countActiveFilters(discoveryFilters)}
            />

            {showAdvancedFilters && (
              <>
                <DiscoveryFilterPanel
                  filters={discoveryFilters}
                  sort={sort}
                  onFiltersChange={setDiscoveryFilters}
                  onSortChange={setSort}
                />
                <DrinkTypeFilter
                  value={drinkTypeFilter}
                  onChange={setDrinkTypeFilter}
                  hideMocktails
                />
                <CollectionFilter
                  value={collection}
                  onChange={setCollection}
                  hideMocktails
                />
              </>
            )}
          </div>

          {noResults ? (
            <div className="app-section">
              <EmptyState
                title={searchActive ? `No matches for “${search.trim() || "your filters"}”` : "Nothing here yet"}
                description="Try a spirit, ingredient, flavor, or clear your filters."
                icon="🔍"
              />
            </div>
          ) : showBrowse ? (
            <div className="app-section">
              <p className="discovery-results-count">
                Showing <strong>{makeableMatches.length}</strong> cocktail
                {makeableMatches.length === 1 ? "" : "s"}
                {searchActive ? " matching your search" : " you can make"}
              </p>
              <InfiniteCocktailGrid
                items={makeableMatches}
                resetKey={filterResetKey}
                showObscurity
              />
            </div>
          ) : (
            <>
              {showReady && (
                <CocktailSection
                  title="Exact matches"
                  subtitle={`${visibleExact.length} cocktails — everything in your bar`}
                  items={visibleExact}
                  empty="Not quite there yet — add a bottle in My Bar or try a swap below."
                />
              )}

              {showReady && visibleSubstitutions.length > 0 && (
                <CocktailSection
                  title="Available with substitutions"
                  subtitle="Owned substitutes fill the gaps — not identical, but in the ballpark"
                  items={visibleSubstitutions}
                  empty=""
                />
              )}

              {showReady && visibleExperimental.length > 0 && (
                <CocktailSection
                  title="Bold swaps"
                  subtitle="Low-confidence swaps or homemade builds — expect a different drink"
                  items={visibleExperimental}
                  empty=""
                />
              )}

              {showOneAway && (
                <CocktailSection
                  title="One away"
                  subtitle="One bottle from an exact match"
                  items={oneAway}
                  empty="Nothing teasing you tonight. Yet."
                />
              )}

              {showAllSections && stillMissing.length > 0 && (
                <CocktailSection
                  title="Still missing ingredients"
                  subtitle={`${stillMissing.length} cocktails need bottles you don't have (or substitutes for)`}
                  items={stillMissing}
                  empty=""
                  compact
                />
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export default function CocktailsPageClient() {
  return (
    <Suspense fallback={<PageLoader message="Loading tonight…" />}>
      <CocktailsContent />
    </Suspense>
  );
}
