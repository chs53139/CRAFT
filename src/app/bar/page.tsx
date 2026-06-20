"use client";

import { useMemo, useState } from "react";
import { BarScan } from "@/components/BarScan";
import { BarStarterKits } from "@/components/BarStarterKits";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { IngredientChip } from "@/components/IngredientChip";
import { BarPageSkeleton } from "@/components/LoadingState";
import { MyBarAdvice } from "@/components/MyBarAdvice";
import { MyBarInventory } from "@/components/MyBarInventory";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchField } from "@/components/SearchField";
import { buildBarAdvice } from "@/lib/bar-intelligence/bar-advice";
import {
  getIngredientsByIds,
  ingredients,
} from "@/lib/cocktail-matching";
import { getInventoryTier, INVENTORY_TIERS, InventoryTier, isBrowsableIngredient } from "@/lib/inventory-tiers";
import { useFavorites, useMyBar, useRecentCocktails } from "@/hooks/use-my-bar";
import { useCocktailMatches } from "@/hooks/use-cocktail-matches";

export default function BarPage() {
  const {
    barIds,
    toggleIngredient,
    clearBar,
    addIngredients,
    loaded,
    syncing,
    error,
    clearError,
    isAuthenticated,
  } = useMyBar();
  const { favoriteIds } = useFavorites();
  const { recentIds } = useRecentCocktails();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<InventoryTier | "all">("all");
  const [scanOpen, setScanOpen] = useState(false);

  const { matches } = useCocktailMatches(barIds);

  const filteredIngredients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ingredients
      .filter((ing) => {
        if (!isBrowsableIngredient(ing)) return false;
        const matchesSearch = !q || ing.name.toLowerCase().includes(q);
        const tier = getInventoryTier(ing);
        const matchesCategory = activeCategory === "all" || tier === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const aSelected = barIds.includes(a.id);
        const bSelected = barIds.includes(b.id);
        if (aSelected !== bSelected) return aSelected ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
  }, [search, activeCategory, barIds]);

  const advice = useMemo(
    () =>
      buildBarAdvice({
        barIds,
        favoriteIds,
        recentIds,
        matches,
      }),
    [barIds, favoriteIds, recentIds, matches]
  );

  if (!loaded) {
    return <BarPageSkeleton />;
  }

  const barIngredients = getIngredientsByIds(barIds);

  function handleClearBar() {
    if (
      window.confirm(
        "Clear your entire bar? This removes all saved ingredients from your shelf."
      )
    ) {
      clearBar();
    }
  }

  const emptySearchTitle = search.trim()
    ? "No ingredients found"
    : "Nothing in this category";
  const emptySearchDescription = search.trim()
    ? "Try a different search or switch categories."
    : "Pick another category above — your bottle is probably hiding in Spirits or Mixers.";

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="My Bar"
        subtitle={
          barIds.length > 0
            ? `${barIds.length} bottle${barIds.length !== 1 ? "s" : ""} on your shelf`
            : isAuthenticated
              ? syncing
                ? "Saving…"
                : "Add what you own"
              : "Add what you own"
        }
        large
        action={
          barIds.length > 0 ? (
            <button
              type="button"
              onClick={handleClearBar}
              className="min-h-11 rounded-full px-3 text-sm font-medium text-[var(--muted)] transition active:text-[var(--accent)]"
            >
              Clear
            </button>
          ) : undefined
        }
      />

      <BarScan
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        barIds={barIds}
        onConfirm={addIngredients}
      />

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      <div className="mt-8">
        <MyBarInventory ingredients={barIngredients} onRemove={toggleIngredient} />
      </div>

      {advice && barIds.length > 0 && (
        <div className="mt-8">
          <MyBarAdvice advice={advice} />
        </div>
      )}

      {barIds.length === 0 && (
        <div className="mt-4 space-y-6">
          <BarStarterKits barIds={barIds} onApply={addIngredients} />
          <EmptyState
            title="Your shelf is empty"
            description="Use a quick start above, try the demo scan, or add ingredients manually below."
            icon="🍾"
            action={
              <button type="button" className="btn-secondary mt-2" onClick={() => setScanOpen(true)}>
                Try demo scan
              </button>
            }
          />
        </div>
      )}

      <div className="app-section">
        <div className="mb-4 space-y-4">
          <div>
            <h2 className="section-row-title">Add ingredients</h2>
            <p className="section-row-subtitle">Spirits, mixers, and pantry — tap to add or remove</p>
          </div>

          <SearchField
            value={search}
            onChange={setSearch}
            placeholder="Search by name…"
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
            <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-[var(--background)] to-transparent md:hidden" />
          </div>
        </div>

        {filteredIngredients.length === 0 ? (
          <EmptyState
            title={emptySearchTitle}
            description={emptySearchDescription}
            icon="🔍"
          />
        ) : (
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {filteredIngredients.map((ing) => (
              <IngredientChip
                key={ing.id}
                name={ing.name}
                selected={barIds.includes(ing.id)}
                onClick={() => toggleIngredient(ing.id)}
              />
            ))}
          </div>
        )}
      </div>
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
