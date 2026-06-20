"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { CocktailCard } from "@/components/CocktailCard";
import { DrinkTypeFilter } from "@/components/DrinkTypeFilter";
import { EmptyState } from "@/components/EmptyState";
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
import { cocktailCount, isPourable, matchCocktails, matchSingleCocktail, mocktailCount } from "@/lib/cocktail-matching";
import { filterMatchesByDrinkType } from "@/lib/drink-type";
import { CocktailCollection } from "@/lib/types";
import { useMyBar } from "@/hooks/use-my-bar";

const PAGE_SIZE = 24;

function isCollection(value: string | null): value is CocktailCollection {
  return !!value && DISCOVER_COLLECTIONS.includes(value as CocktailCollection);
}

function DiscoverContent() {
  const searchParams = useSearchParams();
  const initialCollection = searchParams.get("collection");
  const [collection, setCollection] = useState<CocktailCollection | null>(
    isCollection(initialCollection) ? initialCollection : null
  );
  const [search, setSearch] = useState("");
  const [showMakeable, setShowMakeable] = useState(false);
  const [drinkTypeFilter, setDrinkTypeFilter] =
    useState<"both" | "cocktails" | "mocktails">("both");
  const [limit, setLimit] = useState(PAGE_SIZE);
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

  const makeable = matches.filter((m) => isPourable(m));
  const totalVisible = showMakeable ? makeable.length : catalogue.length;

  const visible = showMakeable
    ? makeable.slice(0, limit)
    : catalogue.slice(0, limit).map((cocktail) => {
        const match = matches.find((m) => m.cocktail.id === cocktail.id);
        return match ?? matchSingleCocktail(cocktail, barIds);
      });

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Discover"
        subtitle={`${cocktailCount} drinks · ${mocktailCount} mocktails across CRAFT collections.`}
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
              setLimit(PAGE_SIZE);
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
          onChange={(value) => {
            setSearch(value);
            setLimit(PAGE_SIZE);
          }}
          placeholder="Search by name, region, era, or source…"
        />

        <DrinkTypeFilter value={drinkTypeFilter} onChange={setDrinkTypeFilter} />

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

      {collection && (
        <p className="mb-4 text-sm text-[var(--muted)]">
          Showing <span className="text-[var(--foreground)]">{COLLECTION_LABELS[collection]}</span>
          {" · "}
          {catalogue.length} drinks
        </p>
      )}

      {visible.length === 0 ? (
        <EmptyState
          title="Nothing matched"
          description="Try another collection or clear your search."
          icon="🔍"
        />
      ) : (
        <div className="list-card-grid">
          {visible.map((match) => (
            <CocktailCard key={match.cocktail.id} match={match} showObscurity compact />
          ))}
        </div>
      )}

      {visible.length < totalVisible && (
        <button
          type="button"
          className="btn-secondary mt-4 w-full"
          onClick={() => setLimit((value) => value + PAGE_SIZE)}
        >
          Load more
        </button>
      )}

      <div className="app-section">
        <Link href="/mixologist" className="account-row">
          <div>
            <p className="text-sm font-semibold text-[var(--foreground)]">Mixologist</p>
            <p className="mt-0.5 text-xs text-[var(--muted)]">Invent something new from your bar</p>
          </div>
          <span className="text-[var(--accent)]">→</span>
        </Link>
      </div>
    </div>
  );
}

export default function DiscoverPageClient() {
  return (
    <Suspense fallback={<PageLoader message="Loading discover…" />}>
      <DiscoverContent />
    </Suspense>
  );
}
