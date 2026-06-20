"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BarScan } from "@/components/BarScan";
import { BestNextBuy } from "@/components/BestNextBuy";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { IngredientChip } from "@/components/IngredientChip";
import { BarPageSkeleton } from "@/components/LoadingState";
import { MyBarInventory } from "@/components/MyBarInventory";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchField } from "@/components/SearchField";
import {
  getBestNextIngredient,
  getIngredientsByIds,
  ingredients,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { getShopCategory, SHOP_CATEGORIES, ShopCategory } from "@/lib/ingredient-categories";
import { useMyBar } from "@/hooks/use-my-bar";

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
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ShopCategory | "all">("all");
  const [scanOpen, setScanOpen] = useState(false);

  const filteredIngredients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ingredients
      .filter((ing) => {
        const matchesSearch = !q || ing.name.toLowerCase().includes(q);
        const cat = getShopCategory(ing.id, ing.name);
        const matchesCategory = activeCategory === "all" || cat === activeCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const aSelected = barIds.includes(a.id);
        const bSelected = barIds.includes(b.id);
        if (aSelected !== bSelected) return aSelected ? 1 : -1;
        return a.name.localeCompare(b.name);
      });
  }, [search, activeCategory, barIds]);

  if (!loaded) {
    return <BarPageSkeleton />;
  }

  const barIngredients = getIngredientsByIds(barIds);
  const matches = matchCocktails(barIds);
  const tonightCount = matches.filter((m) => m.canMake).length;
  const recommendation = getBestNextIngredient(barIds);

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
          isAuthenticated
            ? syncing
              ? "Saving…"
              : `${ingredients.length} ingredients · synced`
            : `${ingredients.length} ingredients · on this device`
        }
        large
        action={
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setScanOpen(true)}
              className="min-h-11 rounded-full px-3 text-sm font-medium text-[var(--accent)] transition active:opacity-80"
            >
              Scan
            </button>
            {barIds.length > 0 ? (
              <button
                type="button"
                onClick={handleClearBar}
                className="min-h-11 rounded-full px-3 text-sm font-medium text-[var(--muted)] transition active:text-[var(--accent)]"
              >
                Clear
              </button>
            ) : null}
          </div>
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

      {barIds.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            title="Your shelf is empty"
            description="Tap Scan to photo-match bottles, or add ingredients manually below."
            icon="🍾"
            action={
              <button type="button" className="btn-primary mt-2" onClick={() => setScanOpen(true)}>
                Scan My Bar
              </button>
            }
          />
        </div>
      ) : (
        <>
          <Link href="/cocktails" className="account-row mt-4">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">
                {tonightCount} cocktail{tonightCount !== 1 ? "s" : ""} ready
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">View Tonight tab</p>
            </div>
            <span className="text-[var(--accent)]">→</span>
          </Link>

          <Link href="/mixologist" className="account-row mt-3">
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">AI Mixologist</p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">Invent a drink from your shelf</p>
            </div>
            <span className="text-[var(--accent)]">→</span>
          </Link>
        </>
      )}

      {recommendation && barIds.length > 0 && (
        <div className="mt-10">
          <BestNextBuy recommendation={recommendation} />
        </div>
      )}

      <div className="app-section">
        <div className="mb-4 space-y-4">
          <div>
            <h2 className="section-row-title">Add ingredients</h2>
            <p className="section-row-subtitle">Tap to add or remove</p>
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
              {SHOP_CATEGORIES.map((cat) => (
                <CategoryPill
                  key={cat.id}
                  label={cat.label}
                  active={activeCategory === cat.id}
                  onClick={() => setActiveCategory(cat.id)}
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
