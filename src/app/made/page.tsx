"use client";

import Link from "next/link";
import { CocktailImage } from "@/components/CocktailImage";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useMadeHistory } from "@/components/MadeHistoryProvider";
import { getCocktailById } from "@/lib/cocktail-matching";
import { formatReviewDate } from "@/lib/cocktail-reviews";
import { formatRating } from "@/components/StarRating";

export default function MadeHistoryPage() {
  const { entries, loaded } = useMadeHistory();

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader title="Made" subtitle="Cocktails you actually poured" large />

      {!loaded ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : entries.length === 0 ? (
        <p className="section-row-empty">
          Nothing logged yet. Tap <strong>Made it ✓</strong> on a cocktail you pour.
        </p>
      ) : (
        <ul className="made-history-list app-section">
          {entries.map((entry) => {
            const cocktail = getCocktailById(entry.cocktailId);
            if (!cocktail) return null;
            return (
              <li key={entry.id}>
                <Link href={`/cocktails/${cocktail.id}`} className="made-history-row premium-card">
                  <CocktailImage
                    slug={cocktail.id}
                    name={cocktail.name}
                    className="made-history-thumb"
                    sizes="72px"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="made-history-name">{cocktail.name}</p>
                    <p className="made-history-meta">
                      {formatReviewDate(entry.madeAt)}
                      {entry.rating ? ` · ${formatRating(entry.rating)}` : ""}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="app-section">
        <Link href="/more" className="btn-secondary w-full text-center">
          Back to More
        </Link>
      </div>
    </div>
  );
}
