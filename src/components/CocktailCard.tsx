"use client";

import Link from "next/link";
import { CocktailMatch } from "@/lib/types";
import { CocktailImage } from "./CocktailImage";
import { DifficultyBadge } from "./DifficultyBadge";
import { FavoriteButton } from "./FavoriteButton";
import { ObscurityBadge } from "./ObscurityBadge";
import { useFavorites } from "@/hooks/use-my-bar";

type Props = {
  match: CocktailMatch;
  compact?: boolean;
  showFavorite?: boolean;
  showObscurity?: boolean;
  variant?: "default" | "carousel";
};

export function CocktailCard({
  match,
  compact,
  showFavorite = true,
  showObscurity = false,
  variant = "default",
}: Props) {
  const { cocktail, canMake, missing, missingCount } = match;
  const { isFavorite, toggleFavorite, loaded } = useFavorites();
  const fav = loaded && isFavorite(cocktail.id);
  const isCarousel = variant === "carousel";

  return (
    <Link
      href={`/cocktails/${cocktail.id}`}
      className={`premium-card premium-card-interactive group relative block ${
        isCarousel ? "premium-card-carousel" : ""
      }`}
    >
      {showFavorite && loaded && (
        <div className="absolute right-2.5 top-2.5 z-10">
          <FavoriteButton
            active={fav}
            onToggle={() => toggleFavorite(cocktail.id)}
            className={isCarousel ? "h-9 w-9" : undefined}
          />
        </div>
      )}

      <CocktailImage
        slug={cocktail.id}
        name={cocktail.name}
        className={isCarousel ? "aspect-[4/5] w-full" : "aspect-[4/3] w-full"}
        sizes={isCarousel ? "280px" : "(max-width: 448px) 100vw, 448px"}
      />

      <div className={`card-shine border-b border-[var(--border-subtle)] ${isCarousel ? "px-3.5 py-2.5" : "px-4 py-3"}`}>
        <div className="flex items-center justify-between gap-2">
          <DifficultyBadge difficulty={cocktail.difficulty} />
          {showObscurity ? (
            <ObscurityBadge score={cocktail.obscurityScore} compact />
          ) : canMake ? (
            <span className="rounded-full bg-[var(--accent)]/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent)]">
              Ready
            </span>
          ) : (
            <span className="text-[10px] uppercase tracking-[0.12em] text-[var(--muted)]">
              {missingCount} missing
            </span>
          )}
        </div>
      </div>

      <div className={isCarousel ? "p-3.5" : "p-4"}>
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-dim)]">
          {cocktail.category}
        </p>
        <h3
          className={`mt-1.5 font-[family-name:var(--font-display)] font-medium leading-tight text-[var(--foreground)] ${
            isCarousel ? "text-lg" : "text-xl"
          }`}
        >
          {cocktail.name}
        </h3>

        {!compact && !isCarousel && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--muted)]">
            {cocktail.description}
          </p>
        )}

        {!canMake && missing.length > 0 && (
          <p className="mt-2.5 line-clamp-2 text-xs leading-relaxed text-[var(--muted)]">
            <span className="font-medium text-[var(--accent-dim)]">Need </span>
            {missing.slice(0, 3).map((m) => m.name).join(" · ")}
            {missing.length > 3 && ` · +${missing.length - 3}`}
          </p>
        )}

        {canMake && isCarousel && (
          <p className="mt-2 line-clamp-1 text-xs italic text-[var(--accent-dim)]">
            {cocktail.cheekyLine}
          </p>
        )}
      </div>
    </Link>
  );
}
