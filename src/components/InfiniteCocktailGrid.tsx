"use client";

import Link from "next/link";
import { CocktailMatch } from "@/lib/types";
import { CocktailCard } from "./CocktailCard";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

type Props = {
  items: CocktailMatch[];
  resetKey?: string;
  showObscurity?: boolean;
  compact?: boolean;
  empty?: React.ReactNode;
  pageSize?: number;
};

export function InfiniteCocktailGrid({
  items,
  resetKey,
  showObscurity = true,
  compact = false,
  empty,
  pageSize = 24,
}: Props) {
  const { visibleCount, sentinelRef, hasMore } = useInfiniteScroll({
    totalItems: items.length,
    pageSize,
    resetKey,
  });

  const visible = items.slice(0, visibleCount);

  if (items.length === 0) {
    return empty ? <>{empty}</> : null;
  }

  return (
    <>
      <div className="list-card-grid">
        {visible.map((match) => (
          <CocktailCard
            key={match.cocktail.id}
            match={match}
            compact={compact}
            showObscurity={showObscurity}
            showShare={showObscurity}
          />
        ))}
      </div>

      {hasMore && (
        <>
          <div ref={sentinelRef} className="h-4" aria-hidden />
          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            Showing {visibleCount} of {items.length}
          </p>
        </>
      )}
    </>
  );
}

type BannerProps = {
  exactCount: number;
  withinReach: number;
  swapCount: number;
  viewAllHref?: string;
  label?: string;
};

export function MakeableCountBanner({
  exactCount,
  withinReach,
  swapCount,
  viewAllHref = "/cocktails",
  label,
}: BannerProps) {
  const count = withinReach > 0 ? withinReach : exactCount;
  const message =
    label ??
    (count === 1 ? "You can make 1 cocktail" : `You can make ${count} cocktails`);

  return (
    <div className="makeable-count-banner">
      <div>
        <p className="makeable-count-banner-title">{message}</p>
        {count > 0 && (
          <p className="makeable-count-banner-subtitle">
            {exactCount} ready · {swapCount} with swaps
          </p>
        )}
      </div>
      {viewAllHref && count > 0 && (
        <Link href={viewAllHref} className="makeable-count-banner-link">
          View all {count}
        </Link>
      )}
    </div>
  );
}
