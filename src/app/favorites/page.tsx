"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CocktailCard } from "@/components/CocktailCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SkeletonGrid } from "@/components/LoadingState";
import { useFavorites, useMyBar } from "@/hooks/use-my-bar";
import { matchCocktails } from "@/lib/cocktail-matching";

export default function FavoritesPage() {
  const { favoriteIds, loaded } = useFavorites();
  const { barIds, error, clearError } = useMyBar();

  const matches = useMemo(() => {
    if (!loaded) return [];
    return matchCocktails(barIds).filter((m) =>
      favoriteIds.includes(m.cocktail.id)
    );
  }, [favoriteIds, barIds, loaded]);

  if (!loaded) {
    return (
      <div className="page-shell space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-16 rounded-full shimmer" />
          <div className="h-10 w-40 rounded-lg shimmer" />
        </div>
        <SkeletonGrid count={3} />
      </div>
    );
  }

  return (
    <div className="page-shell">
      <p className="eyebrow">Saved</p>
      <h1 className="display-lg mt-3">Favorites</h1>
      <p className="lead mt-3">
        Cocktails you love — saved on this device, synced when you sign in.
      </p>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      <div className="mt-10">
        {favoriteIds.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Tap the star on any cocktail to save it here. Your taste is impeccable — prove it."
            actionLabel="Browse Tonight's menu"
            actionHref="/cocktails"
            icon="★"
          />
        ) : matches.length === 0 ? (
          <EmptyState
            title="Saved cocktails unavailable"
            description="Some starred drinks aren't in the catalogue anymore. Browse Tonight and star a fresh round."
            actionLabel="Browse Tonight's menu"
            actionHref="/cocktails"
            icon="★"
          />
        ) : (
          <div className="stagger-grid grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {matches.map((match) => (
              <CocktailCard key={match.cocktail.id} match={match} />
            ))}
          </div>
        )}
      </div>

      {favoriteIds.length === 0 && (
        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          <Link href="/login" className="text-[var(--accent)] hover:underline">
            Sign in
          </Link>{" "}
          to keep favorites across devices.
        </p>
      )}
    </div>
  );
}
