"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CocktailImage } from "@/components/CocktailImage";
import { DifficultyBadge } from "@/components/DifficultyBadge";
import { AlcoholBadge } from "@/components/AlcoholBadge";
import {
  DiscoveryModeId,
  DiscoveryModeResult,
  runDiscoveryMode,
  TasteVector,
} from "@/lib/bar-intelligence";
import { getBuyLabel } from "@/lib/ingredient-brands";
import { CocktailMatch } from "@/lib/types";
import { ShopCategory } from "@/lib/ingredient-categories";

const MODES: Array<{ id: DiscoveryModeId; label: string; hint: string }> = [
  {
    id: "neglected-bottle",
    label: "Neglected bottle",
    hint: "What am I ignoring?",
  },
  {
    id: "never-think",
    label: "Never think to make",
    hint: "Surprise my palate",
  },
  {
    id: "biggest-upgrade",
    label: "Biggest upgrade",
    hint: "Best next purchase",
  },
];

type Props = {
  barIds: string[];
  matches: CocktailMatch[];
  tasteVector?: TasteVector;
  favoriteIds: string[];
  recentIds: string[];
  categoryCounts?: Partial<Record<ShopCategory, number>>;
};

export function DiscoveryModes({
  barIds,
  matches,
  tasteVector,
  favoriteIds,
  recentIds,
  categoryCounts,
}: Props) {
  const [activeMode, setActiveMode] = useState<DiscoveryModeId>("never-think");

  const result = useMemo(
    () =>
      runDiscoveryMode(activeMode, barIds, {
        tasteVector,
        favoriteIds,
        recentIds,
        matches,
        categoryCounts,
      }),
    [activeMode, barIds, tasteVector, favoriteIds, recentIds, matches, categoryCounts]
  );

  return (
    <section className="discovery-modes animate-fade-in-up">
      <div>
        <p className="eyebrow">Discovery engine</p>
        <h2 className="section-row-title mt-2">Go beyond search</h2>
        <p className="section-row-subtitle">
          Personalized prompts based on your bar, taste, and what you have neglected.
        </p>
      </div>

      <div className="discovery-mode-tabs">
        {MODES.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`surprise-chip shrink-0 ${activeMode === mode.id ? "surprise-chip-active" : ""}`}
            onClick={() => setActiveMode(mode.id)}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {result ? (
        <DiscoveryResult result={result} />
      ) : (
        <p className="discovery-empty">
          Not enough signal yet — stock a few more bottles or favorite drinks you love.
        </p>
      )}
    </section>
  );
}

function DiscoveryResult({ result }: { result: DiscoveryModeResult }) {
  if (result.mode === "never-think") {
    const { match } = result;
    return (
      <Link href={`/cocktails/${match.cocktail.id}`} className="discovery-result premium-card-interactive">
        <CocktailImage
          slug={match.cocktail.id}
          name={match.cocktail.name}
          className="aspect-[16/10] w-full"
          sizes="400px"
        />
        <div className="p-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent-dim)]">
            {result.title}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <DifficultyBadge difficulty={match.cocktail.difficulty} />
            <AlcoholBadge cocktail={match.cocktail} compact />
          </div>
          <h3 className="mt-3 font-[family-name:var(--font-display)] text-xl text-[var(--foreground)]">
            {match.cocktail.name}
          </h3>
          <p className="mt-2 text-sm text-[var(--muted)]">{result.subtitle}</p>
        </div>
      </Link>
    );
  }

  if (result.mode === "neglected-bottle") {
    const { insight } = result;
    return (
      <div className="discovery-result premium-card">
        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent-dim)]">
          {result.title}
        </p>
        <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
          {insight.ingredient.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{result.subtitle}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="glass-panel rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">Ready now</p>
            <p className="mt-2 text-2xl text-[var(--accent)]">{insight.makeableCount}</p>
          </div>
          <div className="glass-panel rounded-xl px-4 py-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[var(--muted)]">One away</p>
            <p className="mt-2 text-2xl text-[var(--foreground)]">{insight.oneAwayCount}</p>
          </div>
        </div>
        {insight.exampleCocktails.length > 0 && (
          <p className="mt-4 text-xs text-[var(--muted)]">
            Try: {insight.exampleCocktails.join(" · ")}
          </p>
        )}
        <Link href="/cocktails" className="btn-secondary mt-4 inline-flex w-full justify-center">
          Find pours with this bottle
        </Link>
      </div>
    );
  }

  const { recommendation } = result;
  const label = getBuyLabel(recommendation.ingredient);

  return (
    <div className="discovery-result premium-card">
      <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent-dim)]">
        {result.title}
      </p>
      <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
        {label}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{result.subtitle}</p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="glass-panel rounded-xl px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Unlocks</p>
          <p className="mt-2 text-xl text-[var(--accent)]">{recommendation.unlocksCount}</p>
        </div>
        <div className="glass-panel rounded-xl px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">ROI</p>
          <p className="mt-2 text-xl text-[var(--foreground)]">{recommendation.roiScore}</p>
        </div>
        <div className="glass-panel rounded-xl px-3 py-3">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">Est.</p>
          <p className="mt-2 text-xl text-[var(--foreground)]">${recommendation.costUsd}</p>
        </div>
      </div>
      <Link href="/bar" className="btn-primary mt-4 inline-flex w-full justify-center">
        Add to shopping list
      </Link>
    </div>
  );
}
