"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CocktailCard } from "@/components/CocktailCard";
import { EmptyState } from "@/components/EmptyState";
import { MocktailSubcategoryFilter } from "@/components/MocktailSubcategoryFilter";
import { PageLoader } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { SearchField } from "@/components/SearchField";
import {
  filterMatchesByDrinkType,
  filterMatchesByMocktailSubcategory,
} from "@/lib/drink-type";
import {
  filterMatchesBySearch,
  isPourable,
  matchCocktails,
  mocktailCount,
} from "@/lib/cocktail-matching";
import { MocktailSubcategory } from "@/lib/types";
import { useMyBar } from "@/hooks/use-my-bar";

const PAGE_SIZE = 24;

export default function MocktailsPageClient() {
  const { barIds, loaded } = useMyBar();
  const [search, setSearch] = useState("");
  const [subcategory, setSubcategory] = useState<MocktailSubcategory | "all">("all");
  const [showMakeable, setShowMakeable] = useState(false);
  const [limit, setLimit] = useState(PAGE_SIZE);

  const allMocktailMatches = useMemo(() => {
    return filterMatchesByDrinkType(matchCocktails(barIds), "mocktails");
  }, [barIds]);

  const filtered = useMemo(() => {
    let matches = filterMatchesBySearch(allMocktailMatches, search);
    matches = filterMatchesByMocktailSubcategory(matches, subcategory);
    if (showMakeable) {
      matches = matches.filter((match) => isPourable(match));
    }
    return matches;
  }, [allMocktailMatches, search, subcategory, showMakeable]);

  const visible = filtered.slice(0, limit);

  if (!loaded) {
    return <PageLoader message="Loading mocktails…" />;
  }

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Mocktails"
        subtitle={`${mocktailCount} zero-proof pours — classics, wellness, coffee, tea, and party-ready.`}
        large
      />

      <div className="app-section space-y-4">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder="Search mocktails…"
        />

        <MocktailSubcategoryFilter value={subcategory} onChange={setSubcategory} />

        <label className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--card)] px-4 py-3">
          <input
            type="checkbox"
            checked={showMakeable}
            onChange={(event) => setShowMakeable(event.target.checked)}
            className="h-4 w-4 accent-[var(--accent)]"
          />
          <span className="text-sm text-[var(--foreground)]">Can make with my bar</span>
        </label>
      </div>

      {visible.length === 0 ? (
        <EmptyState
          title="No mocktails match"
          description={
            barIds.length === 0
              ? "Stock your bar with mixers, juices, and syrups to unlock zero-proof pours."
              : "Try another style or turn off the makeable filter."
          }
          actionLabel={barIds.length === 0 ? "Open My Bar" : undefined}
          actionHref={barIds.length === 0 ? "/bar" : undefined}
          icon="🍹"
        />
      ) : (
        <div className="stagger-grid grid gap-5 sm:grid-cols-2">
          {visible.map((match) => (
            <CocktailCard key={match.cocktail.id} match={match} compact />
          ))}
        </div>
      )}

      {visible.length < filtered.length && (
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
            <p className="mt-0.5 text-xs text-[var(--muted)]">
              Invent a zero-proof drink from your shelf
            </p>
          </div>
          <span className="text-[var(--accent)]">→</span>
        </Link>
      </div>
    </div>
  );
}
