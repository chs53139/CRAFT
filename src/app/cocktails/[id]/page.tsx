"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CocktailImage } from "@/components/CocktailImage";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { FlavorTags } from "@/components/FlavorTags";
import { PageLoader } from "@/components/LoadingState";
import {
  getCocktailById,
  getIngredientById,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { useFavorites, useMyBar, useRecentCocktails } from "@/hooks/use-my-bar";

export default function CocktailDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { barIds, loaded: barLoaded } = useMyBar();
  const { isFavorite, toggleFavorite, loaded: favLoaded } = useFavorites();
  const { trackRecent } = useRecentCocktails();

  const cocktail = getCocktailById(id);

  useEffect(() => {
    if (cocktail) trackRecent(cocktail.id);
  }, [cocktail, trackRecent]);

  if (!barLoaded) {
    return <PageLoader message="Loading recipe…" />;
  }

  if (!cocktail) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <EmptyState
          title="Cocktail not found"
          description="This one's off the menu. Maybe it finished last call?"
          actionLabel="Back to menu"
          actionHref="/cocktails"
        />
      </div>
    );
  }

  const match = matchCocktails(barIds).find((m) => m.cocktail.id === id);
  const barSet = new Set(barIds);
  const fav = favLoaded && isFavorite(cocktail.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/cocktails"
          className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
        >
          ← Back to menu
        </Link>
        {favLoaded && (
          <FavoriteButton
            active={fav}
            onToggle={() => toggleFavorite(cocktail.id)}
            className="h-10 w-10"
          />
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)]">
        <CocktailImage
          slug={cocktail.id}
          name={cocktail.name}
          priority
          className="aspect-[16/9] w-full sm:aspect-[2/1]"
          sizes="(max-width: 768px) 100vw, 768px"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <DifficultyBadge difficulty={cocktail.difficulty} />
        <span className="rounded-md border border-[var(--border)] px-2.5 py-0.5 text-[10px] uppercase tracking-wider text-[var(--muted)]">
          {cocktail.category}
        </span>
        <FlavorTags flavors={cocktail.flavorProfile} />
      </div>

      <h1 className="mt-6 font-[family-name:var(--font-display)] text-4xl font-light text-[var(--foreground)] sm:text-5xl">
        {cocktail.name}
      </h1>
      <p className="mt-3 text-base text-[var(--muted)] sm:text-lg">{cocktail.description}</p>
      <p className="mt-2 text-sm italic text-[var(--accent-dim)]">{cocktail.cheekyLine}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[var(--accent)]">Glassware</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{cocktail.glassware}</p>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <p className="text-[10px] uppercase tracking-wider text-[var(--accent)]">Garnish</p>
          <p className="mt-1 text-sm text-[var(--foreground)]">{cocktail.garnish}</p>
        </div>
      </div>

      {match && (
        <div
          className={`mt-6 rounded-xl border px-5 py-4 ${
            match.canMake
              ? "border-[var(--accent)]/30 bg-[var(--accent)]/10"
              : "border-[var(--border)] bg-[var(--card)]"
          }`}
        >
          <p
            className={`text-sm font-medium ${
              match.canMake ? "text-[var(--accent)]" : "text-[var(--foreground)]"
            }`}
          >
            {match.canMake
              ? "You're good to go. Everything's in your bar."
              : `You need ${match.missing.map((m) => m.name).join(", ")}.`}
          </p>
        </div>
      )}

      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Ingredients</h2>
        <ul className="mt-5 space-y-2">
          {cocktail.ingredients.map((ci) => {
            const ing = getIngredientById(ci.ingredientId);
            const haveIt = ing ? barSet.has(ing.id) : false;
            return (
              <li
                key={ci.ingredientId}
                className={`flex items-center justify-between rounded-xl border px-4 py-3.5 ${
                  haveIt
                    ? "border-[var(--accent)]/20 bg-[var(--accent)]/5"
                    : "border-[var(--border)] bg-[var(--card)]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
                      haveIt
                        ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                        : "bg-[var(--border)] text-[var(--muted)]"
                    }`}
                  >
                    {haveIt ? "✓" : "·"}
                  </span>
                  <span className={haveIt ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
                    {ing?.name ?? ci.ingredientId}
                  </span>
                </div>
                <span className="text-sm text-[var(--muted)]">{ci.amount}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">Instructions</h2>
        <ol className="mt-6 space-y-0">
          {cocktail.instructions.map((step, i) => (
            <li key={`${i}-${step.slice(0, 20)}`} className="relative flex gap-4 pb-8 last:pb-0 sm:gap-5">
              {i < cocktail.instructions.length - 1 && (
                <span className="absolute left-4 top-10 h-full w-px bg-[var(--border)]" />
              )}
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--card)] font-[family-name:var(--font-display)] text-sm text-[var(--accent)]">
                {i + 1}
              </span>
              <p className="pt-1 leading-relaxed text-[var(--foreground)]">{step}</p>
            </li>
          ))}
        </ol>
      </section>

      {!match?.canMake && (
        <Link
          href="/bar"
          className="mt-10 inline-block text-sm text-[var(--accent)] hover:underline"
        >
          Update My Bar →
        </Link>
      )}
    </div>
  );
}
