"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CocktailImage } from "@/components/CocktailImage";
import { CollectionTags } from "@/components/CollectionTags";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { ObscurityBadge } from "@/components/ObscurityBadge";
import {
  COMPLEXITY_OPTIONS,
  MOOD_OPTIONS,
  RARITY_OPTIONS,
} from "@/lib/cocktail-curation";
import { surpriseCocktail, SurpriseFilters } from "@/lib/cocktail-discovery";
import { getIngredientsByIds } from "@/lib/cocktail-matching";
import { CocktailMatch, Difficulty } from "@/lib/types";

type Props = {
  barIds: string[];
};

export function SurpriseMe({ barIds }: Props) {
  const [mood, setMood] = useState("any");
  const [rarity, setRarity] = useState("any");
  const [spiritId, setSpiritId] = useState("any");
  const [complexity, setComplexity] = useState<Difficulty | "any">("any");
  const [result, setResult] = useState<CocktailMatch | null>(null);
  const [history, setHistory] = useState<string[]>([]);

  const spirits = useMemo(() => {
    return getIngredientsByIds(barIds).filter((ing) => ing.category === "spirit");
  }, [barIds]);

  function roll() {
    const filters: SurpriseFilters = {
      mood: mood === "any" ? undefined : mood,
      rarity: rarity === "any" ? undefined : rarity,
      spiritId: spiritId === "any" ? undefined : spiritId,
      complexity,
    };

    const pick = surpriseCocktail(barIds, filters, history);
    if (pick) {
      setResult(pick);
      setHistory((prev) => [...prev.slice(-8), pick.cocktail.id]);
    } else {
      setResult(null);
    }
  }

  return (
    <section className="surprise-card">
      <div>
        <p className="eyebrow">Surprise me</p>
        <h2 className="section-row-title mt-2">Pick my next pour</h2>
        <p className="section-row-subtitle">
          Mood, rarity, spirit, or complexity — CRAFT chooses from your bar.
        </p>
      </div>

      <div className="surprise-filters">
        <div>
          <p className="surprise-filter-label">Mood</p>
          <div className="surprise-chip-row">
            <button
              type="button"
              className={`surprise-chip ${mood === "any" ? "surprise-chip-active" : ""}`}
              onClick={() => setMood("any")}
            >
              Any
            </button>
            {MOOD_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`surprise-chip ${mood === option.id ? "surprise-chip-active" : ""}`}
                onClick={() => setMood(option.id)}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="surprise-filter-label">Rarity</p>
          <div className="surprise-chip-row">
            {RARITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`surprise-chip ${rarity === option.id ? "surprise-chip-active" : ""}`}
                onClick={() => setRarity(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="surprise-filter-label">Spirit</p>
          <div className="surprise-chip-row">
            <button
              type="button"
              className={`surprise-chip ${spiritId === "any" ? "surprise-chip-active" : ""}`}
              onClick={() => setSpiritId("any")}
            >
              Any
            </button>
            {spirits.slice(0, 8).map((spirit) => (
              <button
                key={spirit.id}
                type="button"
                className={`surprise-chip ${spiritId === spirit.id ? "surprise-chip-active" : ""}`}
                onClick={() => setSpiritId(spirit.id)}
              >
                {spirit.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="surprise-filter-label">Complexity</p>
          <div className="surprise-chip-row">
            {COMPLEXITY_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`surprise-chip ${complexity === option.id ? "surprise-chip-active" : ""}`}
                onClick={() => setComplexity(option.id as Difficulty | "any")}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button type="button" onClick={roll} className="btn-primary w-full">
        Surprise me
      </button>

      {result ? (
        <Link href={`/cocktails/${result.cocktail.id}`} className="surprise-result premium-card-interactive">
          <CocktailImage
            slug={result.cocktail.id}
            name={result.cocktail.name}
            className="aspect-[16/10] w-full"
            sizes="400px"
          />
          <div className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge difficulty={result.cocktail.difficulty} />
              <ObscurityBadge score={result.cocktail.obscurityScore} compact />
              {!result.canMake && (
                <span className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  1 away
                </span>
              )}
            </div>
            <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
              {result.cocktail.name}
            </h3>
            <CollectionTags collections={result.cocktail.collections} />
            <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">{result.cocktail.funFact}</p>
          </div>
        </Link>
      ) : (
        <p className="surprise-empty">Tap Surprise me to draw a cocktail from your bar.</p>
      )}
    </section>
  );
}
