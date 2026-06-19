"use client";

import Link from "next/link";
import { CocktailMatch } from "@/lib/types";
import { CocktailImage } from "./CocktailImage";
import { DifficultyBadge } from "./DifficultyBadge";
import { FavoriteButton } from "./FavoriteButton";
import { FlavorTags } from "./FlavorTags";
import { useFavorites } from "@/hooks/use-my-bar";

type Props = {
  match: CocktailMatch;
  compact?: boolean;
  showFavorite?: boolean;
};

export function CocktailCard({ match, compact, showFavorite = true }: Props) {
  const { cocktail, canMake, missing, missingCount } = match;
  const { isFavorite, toggleFavorite, loaded } = useFavorites();
  const fav = loaded && isFavorite(cocktail.id);

  return (
    <Link
      href={`/cocktails/${cocktail.id}`}
      className="group relative block overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] transition hover:border-[var(--accent)]/40 hover:bg-[var(--card-hover)]"
    >
      {showFavorite && loaded && (
        <div className="absolute right-3 top-3 z-10">
          <FavoriteButton
            active={fav}
            onToggle={() => toggleFavorite(cocktail.id)}
          />
        </div>
      )}

      <CocktailImage
        slug={cocktail.id}
        name={cocktail.name}
        className="aspect-[4/3] w-full"
        sizes="(max-width: 768px) 100vw, 33vw"
      />

      <div className="card-shine border-b border-[var(--border)] px-5 py-3">
        <div className="flex items-center justify-between gap-3">
          <DifficultyBadge difficulty={cocktail.difficulty} />
          {canMake ? (
            <span className="rounded-full bg-[var(--accent)]/20 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--accent)]">
              Ready
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {missingCount} missing
            </span>
          )}
        </div>
      </div>

      <div className="p-5">
        <p className="text-[10px] uppercase tracking-wider text-[var(--accent-dim)]">
          {cocktail.category}
        </p>
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl font-medium text-[var(--foreground)] transition group-hover:text-[var(--accent)]">
          {cocktail.name}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{cocktail.description}</p>

        {!compact && (
          <>
            <div className="mt-3">
              <FlavorTags flavors={cocktail.flavorProfile} />
            </div>
            <p className="mt-3 text-[11px] text-[var(--muted)]">
              {cocktail.glassware}
              {cocktail.garnish !== "None" && ` · ${cocktail.garnish}`}
            </p>
          </>
        )}

        {!canMake && missing.length > 0 && (
          <p className="mt-4 text-xs leading-relaxed text-[var(--muted)]">
            <span className="text-[var(--accent-dim)]">Need: </span>
            {missing.slice(0, 4).map((m) => m.name).join(" · ")}
            {missing.length > 4 && ` · +${missing.length - 4} more`}
          </p>
        )}

        {canMake && (
          <p className="mt-4 text-xs italic text-[var(--accent-dim)]">
            {cocktail.cheekyLine}
          </p>
        )}
      </div>
    </Link>
  );
}
