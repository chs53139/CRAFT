"use client";

import { useDeferredValue, useEffect, useMemo } from "react";
import Link from "next/link";
import { FindNearbyButton } from "@/components/FindNearbySheet";
import { ScreenHeader } from "@/components/ScreenHeader";
import { useShoppingList } from "@/components/ShoppingListProvider";
import { trackProductEvent } from "@/lib/analytics";
import { getIngredientById, matchCocktails } from "@/lib/cocktail-matching";
import {
  countSingleIngredientUnlocks,
  countUnionUnlocks,
} from "@/lib/shopping-list/unlock-union";
import { useMyBar } from "@/hooks/use-my-bar";

export default function ShoppingListPage() {
  const { barIds } = useMyBar();
  const { items, loaded, removeItem, markPurchased } = useShoppingList();
  const deferredBar = useDeferredValue(barIds);

  useEffect(() => {
    trackProductEvent("shopping_list_viewed", {});
  }, []);

  const matches = useMemo(() => matchCocktails(deferredBar), [deferredBar]);

  const union = useMemo(
    () => countUnionUnlocks(deferredBar, items.map((x) => x.ingredientId), matches),
    [deferredBar, items, matches]
  );

  if (!loaded) {
    return (
      <div className="app-screen">
        <p className="text-sm text-[var(--muted)]">Loading shopping list…</p>
      </div>
    );
  }

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader title="Shopping list" subtitle="Ingredients to pick up next" large />

      {items.length >= 2 && union.count > 0 ? (
        <div className="premium-card app-section px-4 py-4">
          <p className="text-sm text-[var(--foreground)]">
            Add these {items.length} ingredients → unlock{" "}
            <span className="font-[family-name:var(--font-display)] text-xl text-[var(--accent)]">
              {union.count}
            </span>{" "}
            additional cocktails
          </p>
          {union.examples.length > 0 ? (
            <p className="mt-2 text-xs text-[var(--muted)]">{union.examples.join(" · ")}</p>
          ) : null}
        </div>
      ) : null}

      {items.length === 0 ? (
        <p className="section-row-empty">
          Nothing saved yet. Add from Best Next Purchase, One Away, or a cocktail you can&apos;t quite
          make.
        </p>
      ) : (
        <ul className="shopping-list-rows app-section">
          {items.map((item) => {
            const ing = getIngredientById(item.ingredientId);
            if (!ing) return null;
            const unlock = countSingleIngredientUnlocks(deferredBar, item.ingredientId, matches);
            const preview = unlock.examples.slice(0, 3).join(" · ");
            const extra = unlock.count - Math.min(3, unlock.examples.length);

            return (
              <li key={item.ingredientId} className="shopping-list-row premium-card">
                <div className="min-w-0 flex-1">
                  <h2 className="shopping-list-row-title">{ing.name}</h2>
                  {unlock.count > 0 ? (
                    <p className="shopping-list-row-unlocks">
                      Unlocks {unlock.count} cocktail{unlock.count === 1 ? "" : "s"}
                    </p>
                  ) : null}
                  {preview ? (
                    <p className="shopping-list-row-preview">
                      {preview}
                      {extra > 0 ? ` +${extra}` : ""}
                    </p>
                  ) : null}
                </div>
                <div className="shopping-list-row-actions">
                  <FindNearbyButton ingredient={ing} context="ingredient_list" />
                  <button
                    type="button"
                    className="btn-secondary text-xs"
                    onClick={() => markPurchased(item.ingredientId)}
                  >
                    Got it
                  </button>
                  <button
                    type="button"
                    className="shopping-list-remove"
                    onClick={() => removeItem(item.ingredientId)}
                    aria-label={`Remove ${ing.name}`}
                  >
                    Remove
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="app-section">
        <Link href="/bar" className="btn-secondary w-full text-center">
          Back to My Bar
        </Link>
      </div>
    </div>
  );
}
