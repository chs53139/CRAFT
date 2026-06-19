"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BestNextBuy } from "@/components/BestNextBuy";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { IngredientChip } from "@/components/IngredientChip";
import { PageLoader } from "@/components/LoadingState";
import { MyBarInventory } from "@/components/MyBarInventory";
import {
  getBestNextIngredient,
  getIngredientsByIds,
  ingredients,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { getShopCategory, SHOP_CATEGORIES, ShopCategory } from "@/lib/ingredient-categories";
import { useMyBar } from "@/hooks/use-my-bar";

export default function BarPage() {
  const { barIds, toggleIngredient, clearBar, loaded, syncing, error, clearError, isAuthenticated } =
    useMyBar();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<ShopCategory | "all">("all");

  const filteredIngredients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return ingredients.filter((ing) => {
      const matchesSearch =
        !q || ing.name.toLowerCase().includes(q) || ing.id.toLowerCase().includes(q);
      const cat = getShopCategory(ing.id, ing.name);
      const matchesCategory = activeCategory === "all" || cat === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  if (!loaded) {
    return <PageLoader message="Loading your bar…" />;
  }

  const barIngredients = getIngredientsByIds(barIds);
  const matches = matchCocktails(barIds);
  const tonightCount = matches.filter((m) => m.canMake).length;
  const recommendation = getBestNextIngredient(barIds);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
            Inventory
          </p>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-light text-[var(--foreground)] sm:text-4xl">
            My Bar
          </h1>
          <p className="mt-2 max-w-lg text-sm text-[var(--muted)] sm:text-base">
            {ingredients.length} ingredients ·{" "}
            {isAuthenticated
              ? syncing
                ? "syncing to Supabase…"
                : "saved to your account"
              : "local only — sign in to sync"}
          </p>
        </div>
        {barIds.length > 0 && (
          <button
            type="button"
            onClick={clearBar}
            className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
          >
            Clear bar
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      <div className="mt-8">
        <MyBarInventory ingredients={barIngredients} onRemove={toggleIngredient} />
      </div>

      {barIds.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your shelf is empty"
            description="Search or browse categories below and tap what you own. We'll handle the rest."
            icon="🍾"
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 sm:px-5">
          <p className="text-sm text-[var(--muted)]">
            <span className="font-semibold text-[var(--accent)]">{tonightCount}</span>{" "}
            cocktails ready tonight
          </p>
          <span className="hidden text-[var(--border)] sm:inline">|</span>
          <Link
            href="/cocktails"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            See recommendations →
          </Link>
        </div>
      )}

      {recommendation && (
        <div className="mt-10">
          <BestNextBuy recommendation={recommendation} />
        </div>
      )}

      <div className="mt-14">
        <div className="mb-6 space-y-4">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
              Add ingredients
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Search or filter by category
            </p>
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ingredients…"
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]/50 sm:max-w-md"
          />

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
        </div>

        {filteredIngredients.length === 0 ? (
          <EmptyState
            title="No ingredients found"
            description="Try a different search or category. Your perfect bottle is in here somewhere."
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

      <Link
        href="/cocktails"
        className="mt-14 inline-block rounded-full bg-[var(--accent)] px-6 py-3.5 text-sm font-semibold text-[#070708] transition hover:brightness-110 sm:px-8"
      >
        What can I make tonight? →
      </Link>
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
      className={`shrink-0 rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)]"
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
      }`}
    >
      {label}
    </button>
  );
}
