"use client";

import { filterBrowsableIngredients } from "@/lib/ingredient-search";
import { filterMatchesBySearch } from "@/lib/cocktail-matching";
import { trackProductEvent } from "@/lib/analytics";
import { normalizeSearchKey } from "@/lib/analytics/search-key";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  DiscoveryFilterPanel,
  DiscoveryFilterToggle,
} from "@/components/DiscoveryFilterPanel";
import { MocktailSubcategoryFilter } from "@/components/MocktailSubcategoryFilter";
import { filterMatchesByMocktailSubcategory } from "@/lib/drink-type";
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
  matchCocktails,
  mocktailCount,
} from "@/lib/cocktail-matching";
import { CocktailCollection, MocktailSubcategory } from "@/lib/types";
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
  const queryParam = searchParams.get("q") ?? "";
  const [search, setSearch] = useState(queryParam);
  useEffect(() => setSearch(queryParam), [queryParam]);
  const [include, setInclude] = useState<string[]>([]);
  const [exclude, setExclude] = useState<string[]>([]);
  const ingredientOptions = useMemo(() => filterBrowsableIngredients(""), []);
  const [drinkTypeFilter, setDrinkTypeFilter] = useState<"both" | "cocktails" | "mocktails">(
    () => parseDrinkType(initialType)
  );
  const [mocktailStyle, setMocktailStyle] = useState<MocktailSubcategory | "all">("all");
  const [showFilters, setShowFilters] = useState(searchParams.get("filters") === "ingredients");
  const [discoveryFilters, setDiscoveryFilters] = useState<DiscoveryFilters>(
    DEFAULT_DISCOVERY_FILTERS
  );
  const [sort, setSort] = useState<DiscoverySort>("popularity");
  const { barIds, loaded } = useMyBar();

  const counts = useMemo(() => getCollectionCounts(), []);

  const catalogue = useMemo(() => {
    const base = collection ? getCatalogueByCollection(collection) : searchCatalogue("");
    if (drinkTypeFilter === "both") return base;
    return base.filter((cocktail) =>
      drinkTypeFilter === "mocktails"
        ? cocktail.drinkType === "mocktail"
        : cocktail.drinkType === "cocktail"
    );
  }, [collection, drinkTypeFilter]);

  const matches = useMemo(() => {
    if (!loaded) return [];
    const matched = matchCocktails(barIds);
    const map = new Map(matched.map((m) => [m.cocktail.id, m]));
    return catalogue
      .map((cocktail) => map.get(cocktail.id))
      .filter((m): m is NonNullable<typeof m> => !!m);
  }, [barIds, catalogue, loaded]);

  const filteredMatches = useMemo(() => {
    let results = applyDiscoveryFilters(filterMatchesBySearch(matches, search), {
      ...discoveryFilters,
      collection: collection ?? undefined,
    });
    if (drinkTypeFilter === "mocktails") results = filterMatchesByMocktailSubcategory(results, mocktailStyle);
    results = results.filter(({ cocktail }) => {
      const ids = new Set(cocktail.ingredients.map((item) => item.ingredientId));
      return include.every((id) => ids.has(id)) && exclude.every((id) => !ids.has(id));
    });
    return sortDiscoveryResults(results, sort, search);
  }, [matches, discoveryFilters, collection, sort, search, include, exclude, drinkTypeFilter, mocktailStyle]);

  const hasSearchOrFilters = Boolean(search.trim() || include.length || exclude.length || hasActiveDiscoveryFilters(discoveryFilters));

  const lastSearch = useRef("");
  useEffect(() => {
    const q = search.trim();
    if (!q) { lastSearch.current = ""; return; }
    if (!loaded || q.length < 2) return;
    const timer = window.setTimeout(() => {
      if (lastSearch.current === q) return;
      lastSearch.current = q;
      trackProductEvent("cocktail_searched", { queryLength: q.length, resultCount: filteredMatches.length, hasExclusion: /\b(?:without|exclude|no|minus)\b/i.test(q), searchKey: normalizeSearchKey(q) || undefined, zeroResults: filteredMatches.length === 0 });
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search, loaded, filteredMatches.length]);
  const filterResetKey = JSON.stringify([search, discoveryFilters, sort, collection, drinkTypeFilter, mocktailStyle, include, exclude]);

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Library"
        subtitle={`${cocktailCount} drinks · ${mocktailCount} zero-proof mocktails · search by spirit, flavor, or ingredient`}
        large
      />

      <div className="app-section space-y-4">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search drinks, flavors, or gin + lime juice…"
        />

        <DrinkTypeFilter value={drinkTypeFilter} onChange={setDrinkTypeFilter} />
        {drinkTypeFilter === "mocktails" && <MocktailSubcategoryFilter value={mocktailStyle} onChange={setMocktailStyle} />}

        <DiscoveryFilterToggle
          expanded={showFilters}
          onToggle={() => setShowFilters((value) => !value)}
          activeCount={countActiveFilters(discoveryFilters) + include.length + exclude.length}
        />

        {showFilters && (
          <>
          <DiscoveryFilterPanel
            filters={discoveryFilters}
            sort={sort}
            onFiltersChange={setDiscoveryFilters}
            onSortChange={setSort}
          />
          {([["Must include", include, setInclude, setExclude], ["Exclude", exclude, setExclude, setInclude]] as const).map(([label, ids, setIds, setOther]) => (
            <div key={label} className="space-y-2">
              <label className="block text-sm">{label}
                <select className="mt-1 block w-full rounded-lg bg-[var(--surface)] p-2" value="" onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return;
                  setIds((prev) => [...new Set([...prev, id])]);
                  setOther((prev) => prev.filter((value) => value !== id));
                }}>
                  <option value="">Choose an ingredient</option>
                  {ingredientOptions.filter((item) => !ids.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>
              <div className="flex flex-wrap gap-2">
                {ids.map((id) => {
                  const name = ingredientOptions.find((item) => item.id === id)?.name ?? id;
                  return <button key={id} type="button" className="surprise-chip" aria-label={"Remove " + name + " from " + label.toLowerCase()} onClick={() => setIds((prev) => prev.filter((value) => value !== id))}>{name} ×</button>;
                })}
              </div>
            </div>
          ))}
          </>
        )}

      </div>

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

      {collection && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          Showing <span className="text-[var(--foreground)]">{COLLECTION_LABELS[collection]}</span>
          {" · "}
          {filteredMatches.length} drinks
        </p>
      )}

      {hasSearchOrFilters && (
        <p className="discovery-results-count app-section">
          Found <strong>{filteredMatches.length}</strong> drink
          {filteredMatches.length === 1 ? "" : "s"}
        </p>
      )}

      {!loaded ? <PageLoader message="Loading library…" /> : filteredMatches.length === 0 ? (
        <EmptyState
          title="Nothing matched"
          description="Try another spirit, category, or clear your search."
          icon="🔍"
        />
      ) : (
        <div className="app-section">
          <InfiniteCocktailGrid
            items={filteredMatches}
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
