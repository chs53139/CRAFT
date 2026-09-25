"use client";

import Link from "next/link";
import { CocktailImage } from "@/components/CocktailImage";
import { AddToShoppingListButton } from "@/components/AddToShoppingListButton";
import { FindNearbyButton } from "@/components/FindNearbySheet";
import { getIngredientById } from "@/lib/cocktail-matching";
import {
  getEffectiveBarIds,
  isBrowsableIngredient,
  isHouseStaple,
} from "@/lib/inventory-tiers";
import { CocktailMatch } from "@/lib/types";
import { useMyBar } from "@/hooks/use-my-bar";

type Props = {
  match: CocktailMatch;
};

function ownedContext(match: CocktailMatch, barIds: string[]): string {
  const barSet = new Set(getEffectiveBarIds(barIds));
  const names: string[] = [];
  for (const ci of match.cocktail.ingredients) {
    if (match.missing.some((m) => m.id === ci.ingredientId)) continue;
    if (!barSet.has(ci.ingredientId) && !isHouseStaple(ci.ingredientId)) continue;
    const ing = getIngredientById(ci.ingredientId);
    if (ing) names.push(ing.name);
  }
  return names.slice(0, 4).join(" · ");
}

export function OneAwayCard({ match }: Props) {
  const { barIds } = useMyBar();
  const missing = match.missing[0];
  const owned = ownedContext(match, barIds);

  return (
    <Link href={`/cocktails/${match.cocktail.id}`} className="one-away-row premium-card premium-card-interactive">
      <CocktailImage
        slug={match.cocktail.id}
        name={match.cocktail.name}
        className="one-away-row-image"
        sizes="96px"
      />
      <div className="one-away-row-body min-w-0 flex-1">
        <h3 className="one-away-row-title">{match.cocktail.name}</h3>
        {owned ? <p className="one-away-row-owned">{owned}</p> : null}
        {missing ? (
          <p className="one-away-row-missing">
            Missing: <span>{missing.name}</span>
          </p>
        ) : null}
      </div>
      {missing && isBrowsableIngredient(missing) ? (
        <div
          className="one-away-row-action shrink-0"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <div className="flex flex-col gap-2">
            <AddToShoppingListButton
              ingredientId={missing.id}
              source="one_away"
              cocktailId={match.cocktail.id}
            />
            <FindNearbyButton
              ingredient={missing}
              context="one_away"
              cocktailId={match.cocktail.id}
              className="find-nearby-btn-compact"
            />
          </div>
        </div>
      ) : null}
    </Link>
  );
}
