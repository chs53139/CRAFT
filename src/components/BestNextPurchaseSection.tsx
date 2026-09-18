"use client";

import { useEffect, useMemo } from "react";
import { FindNearbyButton } from "@/components/FindNearbySheet";
import { trackProductEvent } from "@/lib/analytics";
import { getUnlockRecommendations } from "@/lib/bar-intelligence/unlock-graph";
import { UnlockRecommendation } from "@/lib/bar-intelligence/types";
import { getBuyLabel } from "@/lib/ingredient-brands";
import { getInventoryTierLabel, getInventoryTier } from "@/lib/inventory-tiers";
import { CocktailMatch } from "@/lib/types";

type Props = {
  barIds: string[];
  matches: CocktailMatch[];
  limit?: number;
};

function formatUnlockPreview(rec: UnlockRecommendation): string {
  const names = rec.exampleCocktails.slice(0, 3);
  if (names.length === 0) return "";
  const head = names.join(" · ");
  const extra = rec.unlocksCount - names.length;
  if (extra > 0) return `${head} +${extra}`;
  return head;
}

function BnpRow({ rec, featured }: { rec: UnlockRecommendation; featured?: boolean }) {
  const tier = getInventoryTier(rec.ingredient);
  const tierLabel = getInventoryTierLabel(tier);
  const preview = formatUnlockPreview(rec);

  return (
    <article className={`bnp-card ${featured ? "bnp-card-featured" : ""}`}>
      <div className="bnp-card-main min-w-0 flex-1">
        <p className="bnp-card-tier">{tierLabel}</p>
        <h3 className="bnp-card-ingredient">{getBuyLabel(rec.ingredient)}</h3>
        <p className="bnp-card-unlocks">
          Unlocks{" "}
          <span className="bnp-card-unlocks-count">{rec.unlocksCount}</span> cocktail
          {rec.unlocksCount === 1 ? "" : "s"}
        </p>
        {preview ? <p className="bnp-card-preview">{preview}</p> : null}
      </div>
      <FindNearbyButton
        ingredient={rec.ingredient}
        context="best_next_purchase"
        className={featured ? "bnp-card-cta" : "find-nearby-btn-compact bnp-card-cta-secondary"}
      />
    </article>
  );
}

export function BestNextPurchaseSection({ barIds, matches, limit = 6 }: Props) {
  const recommendations = useMemo(
    () =>
      getUnlockRecommendations(barIds, {
        limit,
        precomputedMatches: matches,
      }),
    [barIds, limit, matches]
  );

  const top = recommendations[0];

  useEffect(() => {
    if (!top) return;
    trackProductEvent("best_next_purchase_viewed", {
      ingredientId: top.ingredient.id,
      unlocksCount: top.unlocksCount,
    });
  }, [top?.ingredient.id, top?.unlocksCount]);

  if (recommendations.length === 0) return null;

  return (
    <section className="bnp-section app-section">
      <header className="bnp-header">
        <p className="eyebrow text-[var(--accent-dim)]">Best next purchase</p>
        <h2 className="bnp-headline">Add one ingredient.</h2>
        <p className="bnp-headline bnp-headline-muted">Unlock more of your bar.</p>
      </header>

      <div className="bnp-stack">
        {recommendations.map((rec, index) => (
          <BnpRow key={rec.ingredient.id} rec={rec} featured={index === 0} />
        ))}
      </div>
    </section>
  );
}
