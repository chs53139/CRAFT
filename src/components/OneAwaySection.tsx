"use client";

import { OneAwayCard } from "@/components/OneAwayCard";
import { CocktailMatch } from "@/lib/types";

type Props = {
  items: CocktailMatch[];
  count?: number;
};

export function OneAwaySection({ items, count }: Props) {
  const total = count ?? items.length;

  return (
    <section className="app-section one-away-section">
      <div className="one-away-hero">
        <p className="eyebrow text-[var(--accent-dim)]">One away</p>
        <h2 className="section-row-title mt-2">One bottle away</h2>
        <p className="section-row-subtitle mt-2">
          These cocktails unlock with a single ingredient — {total} in your library right now.
        </p>
      </div>

      {items.length === 0 ? (
        <p className="section-row-empty mt-4">Nothing teasing you tonight. Yet.</p>
      ) : (
        <ul className="one-away-list mt-4">
          {items.map((match) => (
            <li key={match.cocktail.id}>
              <OneAwayCard match={match} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
