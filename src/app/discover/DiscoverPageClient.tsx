"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  DiscoveryFilterPanel,
  DiscoveryFilterToggle,
} from "@/components/DiscoveryFilterPanel";
import { DrinkTypeFilter } from "@/components/DrinkTypeFilter";
import { EmptyState } from "@/components/EmptyState";
import { InfiniteCocktailGrid } from "@/components/InfiniteCocktailGrid";
import { PageLoader } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchField } from "@/components/SearchField";
import {
  DISCOVER_COLLECTIONS,
  COLLECTION_DESCRIPTIONS,
  COLLECTION_LABELS,
} from "@/lib/cocktail-curation";
import {
  getCatalogueByCollection,
  getCollectionCounts,
  searchCatalogue,
} from "@/lib/cocktail-discovery";
import {
  applyDiscoveryFilters,
  DEFAULT_DISCOVERY_FILTERS,
  DiscoveryFilters,
  DiscoverySort,
  hasActiveDiscoveryFilters,
  sortDiscoveryResults,
} from "@/lib/discovery-filters";
import {
  cocktailCount,
  isPourable,
  matchCocktails,
  matchSingleCocktail,
  mocktailCount,
} from "@/lib/cocktail-matching";
import { CocktailCollection } from "@/lib/types";
import { useMyBar } from "@/hooks/use-my-bar";

function parseDrinkType(value: string | null): "both" | "cocktails" | "mocktails" {
  if (value === "cocktails" || value === "mocktails") return value;
  return "both";
}

function isCollection(value: string | null): value is CocktailCollection {
  return !!value && DISCOVER_COLLECTIONS.includes(value as CocktailCollection);
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

function LibraryContent() {
  const searchParams = useSearchParams();
  const initialCollection = searchParams.get("collection");
  const initialType = searchParams.get("type");
  const [collection, setCollection] = useState<CocktailCollection | null>(
    isCollection(initialCollection) ? initialCollection : null
  );
  const [search, setSearch] = useState("");
  const [showMakeable, setShowMakeable] = useState(false);
  const [drinkTypeFilter, setDrinkTypeFilter] = useState<"both" | "cocktails" | "mocktails">(
    () => parseDrinkType(initialType)
  );
  const [showFilters, setShowFilters] = useState(false);
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilters>(
    DEFAULT_DISCOVERY_FILTERS
  );
  const [sort, setSort] = useState<DiscoverySort>("popularity");
  const { barIds, loaded } = useMyBar();

  const counts = useMemo(() => getCollectionCounts(), []);

  const catalogue = useMemo(() => {
    const base = collection ? getCatalogueByCollection(collection) : searchCatalogue("");
    const searched = search.trim() ? searchCatalogue(search, collection ?? undefined) : base;
    if (drinkTypeFilter === "both") return searched;
    return searched.filter((cocktail) =>
      drinkTypeFilter === "mocktails"
        ? cocktail.drinkType === "mocktail"
        : cocktail.drinkType === "cocktail"
    );
  }, [collection, search, drinkTypeFilter]);

  const matches = useMemo(() => {
    if (!loaded) return [];
    const matched = matchCocktails(barIds);
    const map = new Map(matched.map((m) => [m.cocktail.id, m]));
    return catalogue
      .map((cocktail) => map.get(cocktail.id))
      .filter((m): m is NonNullable<typeof m> => !!m);
  }, [barIds, catalogue, loaded]);

  const filteredMatches = useMemo(() => {
    let results = applyDiscoveryFilters(matches, {
      ...discoveryFilters,
      collection: collection ?? undefined,
    });
    results = sortDiscoveryResults(results, sort, search);
    return results;
  }, [matches, discoveryFilters, collection, sort, search]);

  const makeable = filteredMatches.filter((m) => isPourable(m));

  const hasSearchOrFilters =
    search.trim().length > 0 || hasActiveDiscoveryFilters(discoveryFilters);

  const displayMatches = showMakeable
    ? makeable
    : hasSearchOrFilters
      ? filteredMatches
      : filteredMatches.length > 0
        ? filteredMatches
        : catalogue.map((cocktail) => {
            const match = matches.find((m) => m.cocktail.id === cocktail.id);
            return match ?? matchSingleCocktail(cocktail, barIds);
          });

  const filterResetKey = `${search}|${JSON.stringify(discoveryFilters)}|${sort}|${showMakeable}|${collection}`;

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Library"
        subtitle={`${cocktailCount} drinks · ${mocktailCount} zero-proof mocktails · search by spirit, flavor, or ingredient`}
        large
      />

      <div className="discover-collection-grid">
        {DISCOVER_COLLECTIONS.map((id) => (
          <button
            key={id}
            type="button"
            className={`discover-collection-card ${collection === id ? "discover-collection-card-active" : ""}`}
            onClick={() => {
              setCollection(collection === id ? null : id);
            }}
          >
            <p className="discover-collection-count">{counts[id]}</p>
            <p className="discover-collection-title">{COLLECTION_LABELS[id]}</p>
            <p className="discover-collection-copy">{COLLECTION_DESCRIPTIONS[id]}</p>
          </button>
        ))}
      </div>

      <div className="app-section space-y-4">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search gin, tiki, orange, smoky, glassware…"
        />

        <DrinkTypeFilter value={drinkTypeFilter} onChange={setDrinkTypeFilter} />

        <DiscoveryFilterToggle
          expanded={showFilters}
          onToggle={() => setShowFilters((value) => !value)}
          activeCount={countActiveFilters(discoveryFilters)}
        />

        {showFilters && (
          <DiscoveryFilterPanel
            filters={discoveryFilters}
            sort={sort}
            onFiltersChange={setDiscoveryFilters}
            onSortChange={setSort}
          />
        )}

        <Link href="/find-ingredient" className="account-row">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Find by ingredient</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Must-haves, exclusions, and match-ranked results
            </p>
          </div>
          <span className="text-[var(--accent)]">→</span>
        </Link>

        <div className="flex gap-2">
          <button
            type="button"
            className={`surprise-chip ${!showMakeable ? "surprise-chip-active" : ""}`}
            onClick={() => setShowMakeable(false)}
          >
            Full catalogue
          </button>
          <button
            type="button"
            className={`surprise-chip ${showMakeable ? "surprise-chip-active" : ""}`}
            onClick={() => setShowMakeable(true)}
          >
            Can make now
          </button>
        </div>
      </div>

      {drinkTypeFilter !== "cocktails" && (
        <div className="app-section">
          <Link href="/mocktails" className="account-row">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">Mocktails by style</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">
                Classic, wellness, coffee, tea, and party-ready pours
              </p>
            </div>
            <span className="text-[var(--accent)]">→</span>
          </Link>
        </div>
      )}

      {collection && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          Showing <span className="text-[var(--foreground)]">{COLLECTION_LABELS[collection]}</span>
          {" · "}
          {displayMatches.length} drinks
        </p>
      )}

      {(search.trim() || hasActiveDiscoveryFilters(discoveryFilters)) && (
        <p className="discovery-results-count app-section">
          Found <strong>{displayMatches.length}</strong> cocktail
          {displayMatches.length === 1 ? "" : "s"}
        </p>
      )}

      {displayMatches.length === 0 ? (
        <EmptyState
          title="Nothing matched"
          description="Try another spirit, category, or clear your search."
          icon="🔍"
        />
      ) : (
        <div className="app-section">
          <InfiniteCocktailGrid
            items={displayMatches}
            resetKey={filterResetKey}
            showObscurity
          />
        </div>
      )}
    </div>
  );
}

export default function DiscoverPageClient() {
  return (
    <Suspense fallback={<PageLoader message="Loading library…" />}>
      <LibraryContent />
    </Suspense>
  );
}
