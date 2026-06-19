"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CocktailCard } from "@/components/CocktailCard";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { PageLoader } from "@/components/LoadingState";
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
    return <PageLoader message="Loading favorites…" />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Saved</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-light text-[var(--foreground)]">
        Favorites
      </h1>
      <p className="mt-2 text-[var(--muted)]">
        Cocktails you love — synced when signed in.
      </p>

      {error && (
        <div className="mt-6">
          <ErrorBanner message={error} onDismiss={clearError} />
        </div>
      )}

      <div className="mt-10">
        {matches.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Tap the star on any cocktail to save it here. Your taste is impeccable — prove it."
            actionLabel="Browse cocktails"
            actionHref="/cocktails"
            icon="★"
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          to sync favorites across devices.
        </p>
      )}
    </div>
  );
}
