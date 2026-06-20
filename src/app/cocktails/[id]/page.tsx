"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CocktailReviews } from "@/components/CocktailReviews";
import { CocktailImage } from "@/components/CocktailImage";
import { CollectionTags } from "@/components/CollectionTags";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { FlavorTags } from "@/components/FlavorTags";
import { ObscurityBadge } from "@/components/ObscurityBadge";
import { PageLoader } from "@/components/LoadingState";
import { ERA_LABELS } from "@/lib/cocktail-curation";
import {
  getCocktailById,
  getIngredientById,
  matchCocktails,
} from "@/lib/cocktail-matching";
import { useFavorites, useMyBar, useRecentCocktails } from "@/hooks/use-my-bar";

export default function CocktailDetailPage() {
  const params = useParams();
  const router = useRouter();
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
      <div className="app-screen">
        <div className="detail-topbar">
          <button type="button" onClick={() => router.back()} className="detail-back">
            ← Back
          </button>
        </div>
        <EmptyState
          title="Cocktail not found"
          description="This one's off the menu. Maybe it finished last call?"
          actionLabel="Browse Tonight"
          actionHref="/cocktails"
        />
      </div>
    );
  }

  const match = matchCocktails(barIds).find((m) => m.cocktail.id === id);
  const barSet = new Set(barIds);
  const fav = favLoaded && isFavorite(cocktail.id);

  return (
    <div className="animate-fade-in pb-6">
      <div className="app-screen pb-0">
        <div className="detail-topbar">
          <button type="button" onClick={() => router.back()} className="detail-back">
            ← Back
          </button>
          {favLoaded && (
            <FavoriteButton
              active={fav}
              onToggle={() => toggleFavorite(cocktail.id)}
              className="h-11 w-11"
            />
          )}
        </div>
      </div>

      <div className="-mx-0 overflow-hidden">
        <CocktailImage
          slug={cocktail.id}
          name={cocktail.name}
          priority
          className="aspect-[4/5] w-full"
          sizes="(max-width: 448px) 100vw, 448px"
        />
      </div>

      <div className="app-screen pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={cocktail.difficulty} />
          <ObscurityBadge score={cocktail.obscurityScore} compact />
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {cocktail.category}
          </span>
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {ERA_LABELS[cocktail.era] ?? cocktail.era}
          </span>
        </div>
        <div className="mt-3 space-y-3">
          <FlavorTags flavors={cocktail.flavorProfile} />
          <CollectionTags collections={cocktail.collections} limit={4} />
        </div>

        <h1 className="screen-title-large mt-5">{cocktail.name}</h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{cocktail.description}</p>
        <p className="mt-2 text-sm italic text-[var(--accent-dim)]">{cocktail.cheekyLine}</p>

        <div className="premium-card mt-6 px-4 py-4">
          <p className="eyebrow text-[var(--accent-dim)]">History & fun fact</p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">{cocktail.funFact}</p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="premium-card px-4 py-3.5">
            <p className="eyebrow text-[var(--accent-dim)]">Year</p>
            <p className="mt-1.5 text-sm text-[var(--foreground)]">{cocktail.yearInvented}</p>
          </div>
          <div className="premium-card px-4 py-3.5">
            <p className="eyebrow text-[var(--accent-dim)]">Region</p>
            <p className="mt-1.5 text-sm text-[var(--foreground)]">{cocktail.regionOfOrigin}</p>
          </div>
          <div className="premium-card px-4 py-3.5">
            <p className="eyebrow text-[var(--accent-dim)]">Source</p>
            <p className="mt-1.5 text-sm text-[var(--foreground)]">{cocktail.sourceAttribution}</p>
          </div>
          <div className="premium-card px-4 py-3.5">
            <p className="eyebrow text-[var(--accent-dim)]">Popularity</p>
            <p className="mt-1.5 text-sm text-[var(--foreground)]">{cocktail.popularityScore}/100</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="premium-card px-4 py-3.5">
            <p className="eyebrow text-[var(--accent-dim)]">Method</p>
            <p className="mt-1.5 text-sm text-[var(--foreground)]">{cocktail.method}</p>
          </div>
          <div className="premium-card px-4 py-3.5">
            <p className="eyebrow text-[var(--accent-dim)]">Obscurity</p>
            <div className="mt-2">
              <ObscurityBadge score={cocktail.obscurityScore} />
            </div>
          </div>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="premium-card px-4 py-3.5">
            <p className="eyebrow text-[var(--accent-dim)]">Glassware</p>
            <p className="mt-1.5 text-sm text-[var(--foreground)]">{cocktail.glassware}</p>
          </div>
          <div className="premium-card px-4 py-3.5">
            <p className="eyebrow text-[var(--accent-dim)]">Garnish</p>
            <p className="mt-1.5 text-sm text-[var(--foreground)]">{cocktail.garnish}</p>
          </div>
        </div>

        {match && (
          <div
            className={`mt-5 rounded-2xl border px-4 py-3.5 ${
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

        <section className="app-section">
          <h2 className="section-row-title">Ingredients</h2>
          <ul className="mt-4 space-y-2">
            {cocktail.ingredients.map((ci) => {
              const ing = getIngredientById(ci.ingredientId);
              const haveIt = ing ? barSet.has(ing.id) : false;
              return (
                <li
                  key={ci.ingredientId}
                  className={`flex min-h-[3.25rem] items-center justify-between rounded-2xl border px-4 py-3 ${
                    haveIt
                      ? "border-[var(--accent)]/20 bg-[var(--accent)]/5"
                      : "border-[var(--border)] bg-[var(--card)]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] ${
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

        <section className="app-section">
          <h2 className="section-row-title">Instructions</h2>
          <ol className="mt-4 space-y-0">
            {cocktail.instructions.map((step, i) => (
              <li key={`${i}-${step.slice(0, 20)}`} className="relative flex gap-4 pb-7 last:pb-0">
                {i < cocktail.instructions.length - 1 && (
                  <span className="absolute left-4 top-10 h-full w-px bg-[var(--border)]" />
                )}
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[var(--accent)]/40 bg-[var(--card)] font-[family-name:var(--font-display)] text-sm text-[var(--accent)]">
                  {i + 1}
                </span>
                <p className="pt-1 text-sm leading-relaxed text-[var(--foreground)]">{step}</p>
              </li>
            ))}
          </ol>
        </section>

        <CocktailReviews cocktailId={cocktail.id} cocktailName={cocktail.name} />

        {!match?.canMake && (
          <Link href="/bar" className="btn-secondary mt-2 inline-flex w-full justify-center">
            Update My Bar
          </Link>
        )}
      </div>
    </div>
  );
}
