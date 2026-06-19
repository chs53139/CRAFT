import Link from "next/link";
import { getBuyLabel } from "@/lib/ingredient-brands";
import { cocktails } from "@/lib/cocktail-data";
import { IngredientRecommendation } from "@/lib/types";

type Props = {
  recommendation: IngredientRecommendation;
};

function findCocktailSlug(name: string): string | undefined {
  return cocktails.find((c) => c.name === name)?.id;
}

export function BestNextBuy({ recommendation }: Props) {
  const { ingredient, unlocksCount, exampleCocktails, costUsd } = recommendation;
  const label = getBuyLabel(ingredient);
  const remaining = unlocksCount - exampleCocktails.length;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[var(--accent)]/30 bg-[var(--card)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-transparent to-transparent" />
      <div className="relative p-6 md:p-8">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--accent)]">
          Greatest unlock
        </p>

        <p className="mt-4 text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
          Ingredient
        </p>
        <h3 className="mt-1 font-[family-name:var(--font-display)] text-3xl font-medium text-[var(--foreground)]">
          {label}
        </h3>
        <p className="mt-1 text-sm text-[var(--muted)]">{ingredient.name}</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/70 px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Cocktails unlocked
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--accent)]">
              {unlocksCount}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              additional cocktail{unlocksCount !== 1 ? "s" : ""} with your bar
            </p>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--background)]/70 px-5 py-4">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Estimated bottle cost
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-4xl text-[var(--foreground)]">
              ${costUsd}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">Mock shelf price</p>
          </div>
        </div>

        {exampleCocktails.length > 0 && (
          <div className="mt-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Examples unlocked
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {exampleCocktails.map((name) => {
                const slug = findCocktailSlug(name);
                if (slug) {
                  return (
                    <li key={name}>
                      <Link
                        href={`/cocktails/${slug}`}
                        className="inline-block rounded-full border border-[var(--border)] bg-[var(--background)]/60 px-3 py-1.5 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]/50 hover:text-[var(--accent)]"
                      >
                        {name}
                      </Link>
                    </li>
                  );
                }
                return (
                  <li
                    key={name}
                    className="rounded-full border border-[var(--border)] bg-[var(--background)]/60 px-3 py-1.5 text-sm text-[var(--foreground)]"
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
