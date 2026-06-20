"use client";

import { useMemo } from "react";
import { CocktailCard } from "@/components/CocktailCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { SkeletonGrid } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
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
      <div className="app-screen space-y-6">
        <div className="h-12 w-36 shimmer rounded-xl" />
        <SkeletonGrid count={3} />
      </div>
    );
  }

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Saved"
        subtitle={
          favoriteIds.length > 0
            ? `${favoriteIds.length} starred cocktail${favoriteIds.length !== 1 ? "s" : ""}`
            : "Star cocktails from Tonight"
        }
        large
      />

      {error && (
        <div className="mb-4">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      {favoriteIds.length === 0 ? (
        <EmptyState
          title="No favorites yet"
          description="Tap the star on any cocktail to save it here."
          actionLabel="Browse Tonight"
          actionHref="/cocktails"
          icon="★"
        />
      ) : matches.length === 0 ? (
        <EmptyState
          title="Saved cocktails unavailable"
          description="Some starred drinks aren't in the catalogue anymore."
          actionLabel="Browse Tonight"
          actionHref="/cocktails"
          icon="★"
        />
      ) : (
        <div className="list-card-grid">
          {matches.map((match) => (
            <CocktailCard key={match.cocktail.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
