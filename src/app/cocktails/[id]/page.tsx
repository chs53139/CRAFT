"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { CocktailReviews } from "@/components/CocktailReviews";
import { MatchQualityBadge } from "@/components/MatchQualityBadge";
import { SubstitutionPanel } from "@/components/SubstitutionPanel";
import { CocktailImage } from "@/components/CocktailImage";
import { AlcoholBadge } from "@/components/AlcoholBadge";
import { CollectionTags } from "@/components/CollectionTags";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { EmptyState } from "@/components/EmptyState";
import { FavoriteButton } from "@/components/FavoriteButton";
import { FlavorTags } from "@/components/FlavorTags";
import { ObscurityBadge } from "@/components/ObscurityBadge";
import { PageLoader } from "@/components/LoadingState";
import { ERA_LABELS } from "@/lib/cocktail-curation";
import { MOCKTAIL_SUBCATEGORY_LABELS } from "@/lib/mocktail-curation";
import { MissingIngredientsByTier } from "@/components/MissingIngredientsByTier";
import {
  getCocktailById,
  getIngredientById,
  matchSingleCocktail,
} from "@/lib/cocktail-matching";
import { getEffectiveBarIds, isHouseStaple } from "@/lib/inventory-tiers";
import { formatSubstitutionLine } from "@/lib/substitution-display";
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

  const match = matchSingleCocktail(cocktail, barIds);
  const barSet = new Set(getEffectiveBarIds(barIds));
  const substitutionMap = new Map(
    match?.substitutions.map((sub) => [sub.requiredId, sub]) ?? []
  );
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
          <AlcoholBadge cocktail={cocktail} compact />
          <ObscurityBadge score={cocktail.obscurityScore} compact />
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {cocktail.category}
          </span>
          <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
            {ERA_LABELS[cocktail.era] ?? cocktail.era}
          </span>
          {cocktail.mocktailSubcategory && (
            <span className="rounded-full border border-[var(--border)] px-3 py-1 text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {MOCKTAIL_SUBCATEGORY_LABELS[cocktail.mocktailSubcategory]}
            </span>
          )}
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
              match.matchGroup === "exact"
                ? "border-[var(--accent)]/30 bg-[var(--accent)]/10"
                : match.matchGroup === "substitution" || match.matchGroup === "experimental"
                  ? "border-amber-500/25 bg-amber-500/8"
                  : "border-[var(--border)] bg-[var(--card)]"
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              {match.matchGroup !== "missing" && (
                <MatchQualityBadge quality={match.matchGroup} compact />
              )}
            </div>
            <p
              className={`mt-2 text-sm font-medium ${
                match.matchGroup === "exact"
                  ? "text-[var(--accent)]"
                  : "text-[var(--foreground)]"
              }`}
            >
              {match.matchGroup === "exact"
                ? "Exact match — everything in your bar."
                : match.matchGroup === "substitution"
                  ? "Available with substitutions — expect a different but related drink."
                    : match.matchGroup === "experimental"
                    ? "Experimental substitutes — bold swaps or homemade builds."
                    : "Still missing:"}
            </p>
            {match.matchGroup === "missing" && match.missing.length > 0 && (
              <div className="mt-3">
                <MissingIngredientsByTier missingByTier={match.missingByTier} />
              </div>
            )}
          </div>
        )}

        {match && match.homemadeSuggestions.length > 0 && match.matchGroup === "missing" && (
          <div className="mt-4">
            <SubstitutionPanel substitutions={[]} homemadeSuggestions={match.homemadeSuggestions} />
          </div>
        )}

        <section className="app-section">
          <h2 className="section-row-title">Ingredients</h2>
          {match && match.substitutions.length > 0 && (
            <p className="mt-2 text-xs italic text-[var(--muted)]">
              This changes the flavor slightly.
            </p>
          )}
          <ul className="mt-4 space-y-2">
            {cocktail.ingredients.map((ci) => {
              const ing = getIngredientById(ci.ingredientId);
              const haveIt = ing
                ? isHouseStaple(ing.id) || barSet.has(ing.id)
                : false;
              const substitution = substitutionMap.get(ci.ingredientId);
              const originalName = ing?.name ?? ci.ingredientId;

              return (
                <li
                  key={ci.ingredientId}
                  className={`flex min-h-[3.25rem] items-center justify-between rounded-2xl border px-4 py-3 ${
                    haveIt
                      ? "border-[var(--accent)]/20 bg-[var(--accent)]/5"
                      : substitution
                        ? "border-amber-500/20 bg-amber-500/5"
                        : "border-[var(--border)] bg-[var(--card)]"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] ${
                        haveIt
                          ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                          : substitution
                            ? "bg-amber-500/15 text-amber-300"
                            : "bg-[var(--border)] text-[var(--muted)]"
                      }`}
                    >
                      {haveIt ? "✓" : substitution ? "~" : "·"}
                    </span>
                    <div className="min-w-0">
                      {substitution ? (
                        <>
                          <p className="text-sm text-[var(--muted)]">{originalName}</p>
                          <p className="text-sm font-semibold text-[var(--accent)]">
                            {formatSubstitutionLine(substitution)}
                          </p>
                          <p className="mt-0.5 text-[11px] text-[var(--muted)]">
                            {substitution.confidence}% confidence · {substitution.flavorImpact}
                          </p>
                          {substitution.lowConfidence && (
                            <p className="substitution-warning mt-1 text-[11px]">
                              Low confidence swap
                            </p>
                          )}
                        </>
                      ) : (
                        <>
                          <span className={haveIt ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
                            {originalName}
                          </span>
                          <p className="text-[11px] text-[var(--muted)]">
                            {haveIt ? "In bar" : "Missing"}
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-sm text-[var(--muted)]">{ci.amount}</span>
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

        {match?.matchGroup === "missing" && (
          <Link href="/bar" className="btn-secondary mt-2 inline-flex w-full justify-center">
            Update My Bar
          </Link>
        )}
      </div>
    </div>
  );
}
