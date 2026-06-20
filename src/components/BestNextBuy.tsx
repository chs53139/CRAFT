import Link from "next/link";
import { getBuyLabel } from "@/lib/ingredient-brands";
import { UnlockRecommendation } from "@/lib/bar-intelligence";
import { cocktails } from "@/lib/cocktail-data";
import { IngredientRecommendation } from "@/lib/types";

type Props = {
  recommendation: IngredientRecommendation | UnlockRecommendation;
};

function isUnlockRecommendation(
  value: IngredientRecommendation | UnlockRecommendation
): value is UnlockRecommendation {
  return "reason" in value && typeof value.reason === "string";
}

function findCocktailSlug(name: string): string | undefined {
  return cocktails.find((c) => c.name === name)?.id;
}

export function BestNextBuy({ recommendation }: Props) {
  const { ingredient, unlocksCount, exampleCocktails, costUsd } = recommendation;
  const label = getBuyLabel(ingredient);
  const remaining = unlocksCount - exampleCocktails.length;
  const enriched = isUnlockRecommendation(recommendation) ? recommendation : null;

  return (
    <div className="featured-card animate-fade-in-up">
      <div className="relative p-6 sm:p-8 md:p-10">
        <p className="eyebrow">Smart purchase</p>

        <h3 className="mt-5 font-[family-name:var(--font-display)] text-3xl font-medium leading-tight text-[var(--foreground)] sm:text-4xl">
          {label}
        </h3>
        <p className="mt-2 text-sm text-[var(--muted)]">
          {enriched?.reason ??
            "The one bottle that opens the most new pours from your shelf."}
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5">
          <div className="glass-panel rounded-xl px-5 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Cocktails unlocked
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--accent)]">
              {unlocksCount}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[var(--muted)]">
              additional cocktail{unlocksCount !== 1 ? "s" : ""} with your bar
            </p>
          </div>

          <div className="glass-panel rounded-xl px-5 py-5">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              {enriched ? "Purchase ROI" : "Estimated bottle cost"}
            </p>
            <p className="mt-3 font-[family-name:var(--font-display)] text-4xl text-[var(--foreground)]">
              {enriched ? enriched.roiScore : `$${costUsd}`}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              {enriched
                ? `$${costUsd} est. · ${enriched.movesToOneAway} move to one-away`
                : "Typical shelf price"}
            </p>
          </div>
        </div>

        {exampleCocktails.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Examples unlocked
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {exampleCocktails.map((name) => {
                const slug = findCocktailSlug(name);
                if (slug) {
                  return (
                    <li key={name}>
                      <Link
                        href={`/cocktails/${slug}`}
                        className="inline-block rounded-full border border-[var(--border)] bg-[var(--background)]/60 px-3.5 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
                      >
                        {name}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li
                    key={name}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)]/60 px-3.5 py-2 text-sm text-[var(--foreground)]"
                  >
                    {name}
                  </li>
                );
              })}
              {remaining > 0 && (
                <li className="self-center px-2 text-xs text-[var(--muted)]">
                  +{remaining} more
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
