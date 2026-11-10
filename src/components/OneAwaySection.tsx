"use client";

import { OneAwayCard } from "@/components/OneAwayCard";
import { CocktailMatch } from "@/lib/types";

type Props = {
  items: CocktailMatch[];
};

export function OneAwaySection({ items }: Props) {

  return (
    <section className="app-section one-away-section">
      <div className="one-away-hero">
        <h2 className="section-row-title mt-2">One ingredient away</h2>
        <p className="section-row-subtitle mt-2">
          Pick a drink to see what to add to your shopping list.
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
