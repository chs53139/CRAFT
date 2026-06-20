"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { IngredientChip } from "@/components/IngredientChip";
import { MixologistResult } from "@/components/MixologistResult";
import { PageLoader } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { inventDrink } from "@/lib/mixologist";
import { getIngredientsByIds } from "@/lib/cocktail-matching";
import { useMyBar } from "@/hooks/use-my-bar";

export default function MixologistPage() {
  const { barIds, loaded } = useMyBar();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<ReturnType<typeof inventDrink>>(null);
  const [inventing, setInventing] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (loaded && !initialized && barIds.length > 0) {
      setSelectedIds(barIds);
      setInitialized(true);
    }
  }, [loaded, barIds, initialized]);

  const selectedIngredients = useMemo(
    () => getIngredientsByIds(selectedIds),
    [selectedIds]
  );

  function toggleSelected(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setResult(null);
  }

  function handleInvent() {
    setInventing(true);
    window.setTimeout(() => {
      setResult(inventDrink(selectedIds));
      setInventing(false);
    }, 450);
  }

  if (!loaded) {
    return <PageLoader message="Loading mixologist…" />;
  }

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="AI Mixologist"
        subtitle="Invent a drink first — adjust your shelf below if you want to remix."
        large
      />

      {barIds.length === 0 ? (
        <EmptyState
          title="Stock your bar first"
          description="Add ingredients in the Bar tab, then come back to invent something original."
          actionLabel="Open My Bar"
          actionHref="/bar"
          icon="🧪"
        />
      ) : (
        <>
          <div className="app-section">
            <button
              type="button"
              className="btn-primary w-full"
              disabled={selectedIds.length < 2 || inventing}
              onClick={handleInvent}
            >
              {inventing ? "Mixing…" : "Invent a Drink"}
            </button>
            {!result && !inventing && selectedIds.length >= 2 && (
              <p className="mt-3 text-center text-xs leading-relaxed text-[var(--muted)]">
                Using {selectedIngredients.length} bottles from your shelf.
              </p>
            )}
            {!result && !inventing && selectedIds.length < 2 && (
              <p className="mt-3 text-center text-xs text-[var(--muted)]">
                Select at least two ingredients below to invent a drink.
              </p>
            )}
          </div>

          {inventing && (
            <div className="mixologist-thinking">
              <p className="text-sm text-[var(--muted)]">Analyzing balance and structure…</p>
            </div>
          )}

          {!inventing && result && (
            <div className="app-section">
              <MixologistResult invention={result} onTryAgain={handleInvent} />
            </div>
          )}

          <div className="premium-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Your ingredients</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {selectedIds.length} of {barIds.length} selected · tweak, then invent again
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--accent)]"
                  onClick={() => {
                    setSelectedIds(barIds);
                    setResult(null);
                  }}
                >
                  All
                </button>
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--muted)]"
                  onClick={() => {
                    setSelectedIds([]);
                    setResult(null);
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {getIngredientsByIds(barIds).map((ing) => (
                <IngredientChip
                  key={ing.id}
                  name={ing.name}
                  selected={selectedIds.includes(ing.id)}
                  onClick={() => toggleSelected(ing.id)}
                />
              ))}
            </div>
          </div>

          <div className="app-section">
            <Link href="/bar" className="account-row">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Update My Bar</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">Add bottles for more possibilities</p>
              </div>
              <span className="text-[var(--accent)]">→</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
