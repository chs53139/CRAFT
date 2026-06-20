import type { ReactNode } from "react";
import Link from "next/link";
import { AlcoholBadge } from "@/components/AlcoholBadge";
import { CocktailImage } from "@/components/CocktailImage";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { BarAdvice } from "@/lib/bar-intelligence/bar-advice";
import { getBuyLabel } from "@/lib/ingredient-brands";

type Props = {
  advice: BarAdvice;
};

export function MyBarAdvice({ advice }: Props) {
  const { tonightsRecommendation, bestNextPurchase, hiddenGem, neglectedBottle } = advice;

  return (
    <section className="my-bar-advice animate-fade-in-up">
      <div className="my-bar-advice-intro">
        <p className="eyebrow">From your bar</p>
        <h2 className="section-row-title mt-2">What I&apos;d do tonight</h2>
        <p className="section-row-subtitle">
          Four quick calls based on your shelf, taste, and what you&apos;ve been ignoring.
        </p>
      </div>

      <div className="my-bar-advice-stack">
        {tonightsRecommendation && (
          <AdviceCard
            label="Tonight's recommendation"
            href={`/cocktails/${tonightsRecommendation.match.cocktail.id}`}
          >
            <CocktailImage
              slug={tonightsRecommendation.match.cocktail.id}
              name={tonightsRecommendation.match.cocktail.name}
              className="aspect-[16/10] w-full"
              sizes="400px"
            />
            <div className="my-bar-advice-body">
              <div className="flex flex-wrap items-center gap-2">
                <DifficultyBadge difficulty={tonightsRecommendation.match.cocktail.difficulty} />
                <AlcoholBadge cocktail={tonightsRecommendation.match.cocktail} compact />
              </div>
              <h3 className="my-bar-advice-title">{tonightsRecommendation.match.cocktail.name}</h3>
              <p className="my-bar-advice-copy">{tonightsRecommendation.reason}</p>
            </div>
          </AdviceCard>
        )}

        {bestNextPurchase && (
          <div className="my-bar-advice-card">
            <p className="my-bar-advice-label">Best next purchase</p>
            <h3 className="my-bar-advice-title">{getBuyLabel(bestNextPurchase.ingredient)}</h3>
            <p className="my-bar-advice-copy">
              {bestNextPurchase.reason ||
                "The one bottle that opens the most new pours from your shelf."}
            </p>
            {bestNextPurchase.exampleCocktails.length > 0 && (
              <ul className="my-bar-advice-examples">
                {bestNextPurchase.exampleCocktails.slice(0, 3).map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            )}
            <p className="my-bar-advice-footnote">
              Unlocks {bestNextPurchase.unlocksCount} more drink
              {bestNextPurchase.unlocksCount !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        {hiddenGem && (
          <AdviceCard
            label="Hidden gem"
            href={`/cocktails/${hiddenGem.match.cocktail.id}`}
          >
            <CocktailImage
              slug={hiddenGem.match.cocktail.id}
              name={hiddenGem.match.cocktail.name}
              className="aspect-[16/10] w-full"
              sizes="400px"
            />
            <div className="my-bar-advice-body">
              <h3 className="my-bar-advice-title">{hiddenGem.match.cocktail.name}</h3>
              <p className="my-bar-advice-copy">{hiddenGem.explanation}</p>
            </div>
          </AdviceCard>
        )}

        {neglectedBottle && (
          <div className="my-bar-advice-card">
            <p className="my-bar-advice-label">Neglected bottle</p>
            <h3 className="my-bar-advice-title">{neglectedBottle.insight.ingredient.name}</h3>
            <p className="my-bar-advice-copy">{neglectedBottle.insight.message}</p>
            {neglectedBottle.suggestedMatch ? (
              <Link
                href={`/cocktails/${neglectedBottle.suggestedMatch.cocktail.id}`}
                className="my-bar-advice-action"
              >
                Try {neglectedBottle.suggestedMatch.cocktail.name} →
              </Link>
            ) : neglectedBottle.insight.exampleCocktails[0] ? (
              <p className="my-bar-advice-footnote">
                Look for: {neglectedBottle.insight.exampleCocktails[0]}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}

function AdviceCard({
  label,
  href,
  children,
}: {
  label: string;
  href: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className="my-bar-advice-card my-bar-advice-card-interactive">
      <p className="my-bar-advice-label">{label}</p>
      {children}
    </Link>
  );
}
