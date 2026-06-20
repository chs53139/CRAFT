"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { IngredientChip } from "@/components/IngredientChip";
import { MixologistResult } from "@/components/MixologistResult";
import { PageLoader } from "@/components/LoadingState";
import { ShareInventionButton } from "@/components/ShareCocktailButton";
import { ScreenHeader } from "@/components/ScreenHeader";
import { InventDrinkResponse, MixologistInvention } from "@/lib/mixologist/types";
import { getIngredientsByIds } from "@/lib/cocktail-matching";
import { useSavedInventions } from "@/hooks/use-saved-inventions";
import { useMyBar } from "@/hooks/use-my-bar";

export default function MixologistPage() {
  const { barIds, loaded } = useMyBar();
  const { inventions, saveInvention, removeInvention, isSaved } = useSavedInventions();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [result, setResult] = useState<MixologistInvention | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setStatusMessage(null);
    setError(null);
  }

  async function handleInvent() {
    setInventing(true);
    setError(null);
    setStatusMessage(null);
    setResult(null);

    try {
      const response = await fetch("/api/invent-drink", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredientIds: selectedIds }),
      });

      const data = (await response.json()) as InventDrinkResponse;

      if (!response.ok || !data.invention) {
        throw new Error(data.error ?? "Could not invent a drink. Try different ingredients.");
      }

      setResult(data.invention);
      setStatusMessage(data.message ?? null);
    } catch (inventError) {
      setError(
        inventError instanceof Error
          ? inventError.message
          : "Could not invent a drink. Try again."
      );
    } finally {
      setInventing(false);
    }
  }

  if (!loaded) {
    return <PageLoader message="Loading mixologist…" />;
  }

  return (
    <div className="app-screen animate-fade-in">
      <ScreenHeader
        title="Mixologist"
        subtitle="Pick ingredients from your shelf, then invent something original."
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
          {error && (
            <div className="app-section">
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          <div className="premium-card p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Your ingredients</p>
                <p className="mt-0.5 text-xs text-[var(--muted)]">
                  {selectedIds.length} of {barIds.length} selected · tweak, then invent
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="text-xs font-semibold text-[var(--accent)]"
                  onClick={() => {
                    setSelectedIds(barIds);
                    setResult(null);
                    setStatusMessage(null);
                    setError(null);
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
                    setStatusMessage(null);
                    setError(null);
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
                Select at least two ingredients above to invent a drink.
              </p>
            )}
          </div>

          {inventing && (
            <div className="mixologist-thinking">
              <p className="text-sm text-[var(--muted)]">
                Checking the catalogue, then crafting something original…
              </p>
            </div>
          )}

          {!inventing && result && (
            <div className="app-section">
              {statusMessage && <p className="bar-scan-demo-note mb-4">{statusMessage}</p>}
              <MixologistResult
                invention={result}
                onTryAgain={handleInvent}
                canSave={result.source === "original"}
                saved={isSaved(result)}
                onSave={() => saveInvention(result)}
              />
            </div>
          )}

          {inventions.length > 0 && (
            <div className="app-section">
              <h2 className="section-row-title">Your CRAFT Originals</h2>
              <p className="section-row-subtitle">
                {inventions.length} saved creation{inventions.length === 1 ? "" : "s"} from your bar
              </p>
              <div className="mt-4 space-y-3">
                {inventions.slice(0, 5).map((item) => (
                  <div key={item.id} className="premium-card p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="font-[family-name:var(--font-display)] text-lg text-[var(--foreground)]">
                          {item.name}
                        </p>
                        <p className="mt-1 text-sm text-[var(--muted)]">{item.tagline}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <ShareInventionButton invention={item} compact className="h-9 w-9" />
                        <button
                          type="button"
                          className="text-xs text-[var(--muted)]"
                          onClick={() => removeInvention(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
