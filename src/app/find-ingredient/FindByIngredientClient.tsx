"use client";

import { useEffect, useMemo, useState } from "react";
import { CocktailCard } from "@/components/CocktailCard";
import { DrinkTypeFilter } from "@/components/DrinkTypeFilter";
import { EmptyState } from "@/components/EmptyState";
import { IngredientChip } from "@/components/IngredientChip";
import {
  IngredientFilterBuckets,
  IngredientSearchSortFilter,
} from "@/components/IngredientSearchFilters";
import { MixologistResult } from "@/components/MixologistResult";
import { PageLoader } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchField } from "@/components/SearchField";
import {
  filterBrowsableIngredients,
  getIngredientSearchIds,
  hasSelectedIngredients,
  IngredientBucket,
  IngredientSearchFilters,
  IngredientSearchSort,
  removeIngredientFromFilters,
  ScoredIngredientMatch,
  searchAndSortCocktailsByIngredients,
  toggleIngredientInBucket,
} from "@/lib/ingredient-search";
import { INVENTORY_TIERS, InventoryTier } from "@/lib/inventory-tiers";
import { InventDrinkResponse, MixologistInvention } from "@/lib/mixologist/types";
import { useMyBar } from "@/hooks/use-my-bar";

const DEFAULT_FILTERS: IngredientSearchFilters = {
  mustInclude: [],
  niceToHave: [],
  exclude: [],
  drinkType: "both",
};

function MatchPercentBadge({ value }: { value: number }) {
  return <span className="ingredient-match-badge">{value}% match</span>;
}

function ResultGrid({ items }: { items: ScoredIngredientMatch[] }) {
  if (items.length === 0) return null;

  return (
    <div className="list-card-grid mt-4">
      {items.map((item) => (
        <div key={item.match.cocktail.id} className="ingredient-result-card">
          <MatchPercentBadge value={item.matchPercent} />
          <CocktailCard match={item.match} compact showObscurity showShare />
        </div>
      ))}
    </div>
  );
}

export default function FindByIngredientClient() {
  const { barIds, loaded } = useMyBar();
  const [filters, setFilters] = useState<IngredientSearchFilters>(DEFAULT_FILTERS);
  const [activeBucket, setActiveBucket] = useState<IngredientBucket>("must");
  const [sort, setSort] = useState<IngredientSearchSort>("match");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<InventoryTier | "all">("all");
  const [aiInvention, setAiInvention] = useState<MixologistInvention | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const browseIngredients = useMemo(
    () => filterBrowsableIngredients(search, activeCategory),
    [search, activeCategory]
  );

  const results = useMemo(() => {
    if (!hasSelectedIngredients(filters)) {
      return { exactMatches: [], partialMatches: [] };
    }

    return searchAndSortCocktailsByIngredients(
      {
        ...filters,
        drinkType: filters.drinkType,
      },
      sort,
      barIds
    );
  }, [filters, sort, barIds]);

  const selectedIds = useMemo(() => getIngredientSearchIds(filters), [filters]);

  useEffect(() => {
    if (selectedIds.length < 2) {
      setAiInvention(null);
      setAiError(null);
      setAiLoading(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setAiLoading(true);
      setAiError(null);

      try {
        const response = await fetch("/api/invent-drink", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ingredientIds: selectedIds }),
        });
        const data = (await response.json()) as InventDrinkResponse;

        if (cancelled) return;

        if (!response.ok || !data.invention) {
          throw new Error(data.error ?? "Could not generate a recommendation.");
        }

        setAiInvention(data.invention);
      } catch (error) {
        if (cancelled) return;
        setAiInvention(null);
        setAiError(
          error instanceof Error ? error.message : "Could not generate a recommendation."
        );
      } finally {
        if (!cancelled) setAiLoading(false);
      }
    }, 450);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [selectedIds]);

  function handleIngredientToggle(ingredientId: string) {
    setFilters((current) => toggleIngredientInBucket(current, ingredientId, activeBucket));
  }

  function handleRemoveIngredient(ingredientId: string) {
    setFilters((current) => removeIngredientFromFilters(current, ingredientId));
  }

  function handleDrinkTypeChange(drinkType: IngredientSearchFilters["drinkType"]) {
    setFilters((current) => ({ ...current, drinkType }));
  }

  if (!loaded) {
    return <PageLoader message="Loading ingredient search…" />;
  }

  const hasFilters = hasSelectedIngredients(filters);
  const totalResults = results.exactMatches.length + results.partialMatches.length;

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Find By Ingredient"
        subtitle="Pick must-haves, nice-to-haves, and exclusions — then browse exact, partial, and generated matches."
        large
      />

      <div className="app-section space-y-4">
        <IngredientFilterBuckets
          filters={filters}
          activeBucket={activeBucket}
          onActiveBucketChange={setActiveBucket}
          onRemove={handleRemoveIngredient}
        />

        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search ingredients by name…"
        />

        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryPill
              label="All"
              active={activeCategory === "all"}
              onClick={() => setActiveCategory("all")}
            />
            {INVENTORY_TIERS.map((tier) => (
              <CategoryPill
                key={tier.id}
                label={tier.label}
                active={activeCategory === tier.id}
                onClick={() => setActiveCategory(tier.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {browseIngredients.slice(0, 48).map((ingredient) => {
            const selected =
              filters.mustInclude.includes(ingredient.id) ||
              filters.niceToHave.includes(ingredient.id) ||
              filters.exclude.includes(ingredient.id);

            return (
              <IngredientChip
                key={ingredient.id}
                name={ingredient.name}
                selected={selected}
                onClick={() => handleIngredientToggle(ingredient.id)}
              />
            );
          })}
        </div>

        {browseIngredients.length > 48 && (
          <p className="text-xs text-[var(--muted)]">
            Showing 48 of {browseIngredients.length}. Narrow your search to find more.
          </p>
        )}

        <DrinkTypeFilter value={filters.drinkType} onChange={handleDrinkTypeChange} />
        <IngredientSearchSortFilter value={sort} onChange={setSort} />
      </div>

      {!hasFilters ? (
        <EmptyState
          title="Choose ingredients to search"
          description="Tap a filter tab above — Must include, Nice to have, or Exclude — then select ingredients from the list."
          icon="🧪"
        />
      ) : totalResults === 0 && !aiInvention && !aiLoading ? (
        <EmptyState
          title="No catalogue matches"
          description="Try fewer must-haves, move some ingredients to Nice to have, or loosen your exclusions."
          icon="🔍"
        />
      ) : (
        <>
          <section className="app-section">
            <div>
              <h2 className="section-row-title">Exact matches</h2>
              <p className="section-row-subtitle">
                {results.exactMatches.length} drink
                {results.exactMatches.length === 1 ? "" : "s"} with every selected ingredient
              </p>
            </div>
            {results.exactMatches.length === 0 ? (
              <p className="section-row-empty mt-3">
                No exact matches yet — check partial matches below.
              </p>
            ) : (
              <ResultGrid items={results.exactMatches} />
            )}
          </section>

          <section className="app-section">
            <div>
              <h2 className="section-row-title">Partial matches</h2>
              <p className="section-row-subtitle">
                {results.partialMatches.length} drink
                {results.partialMatches.length === 1 ? "" : "s"} containing most selected
                ingredients
              </p>
            </div>
            {results.partialMatches.length === 0 ? (
              <p className="section-row-empty mt-3">No partial matches for this combination.</p>
            ) : (
              <ResultGrid items={results.partialMatches} />
            )}
          </section>

          <section className="app-section">
            <div>
              <h2 className="section-row-title">AI recommendations</h2>
              <p className="section-row-subtitle">
                Generated drinks built from your selected ingredients
              </p>
            </div>

            {selectedIds.length < 2 ? (
              <p className="section-row-empty mt-3">
                Select at least two ingredients to generate a recommendation.
              </p>
            ) : aiLoading ? (
              <div className="mixologist-thinking mt-4">
                <p className="text-sm text-[var(--muted)]">
                  Building a drink from {selectedIds.length} selected ingredients…
                </p>
              </div>
            ) : aiError ? (
              <p className="section-row-empty mt-3">{aiError}</p>
            ) : aiInvention ? (
              <div className="mt-4">
                <MixologistResult invention={aiInvention} />
              </div>
            ) : null}
          </section>
        </>
      )}
    </div>
  );
}

function CategoryPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-4 py-2.5 text-sm transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
      }`}
    >
      {label}
    </button>
  );
}
