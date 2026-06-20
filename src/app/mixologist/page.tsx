"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { ErrorBanner } from "@/components/ErrorBanner";
import { IngredientChip } from "@/components/IngredientChip";
import { MixologistResult } from "@/components/MixologistResult";
import { PageLoader } from "@/components/LoadingState";
import { ScreenHeader } from "@/components/ScreenHeader";
import { InventDrinkResponse, MixologistInvention } from "@/lib/mixologist/types";
import { getIngredientsByIds } from "@/lib/cocktail-matching";
import { useMyBar } from "@/hooks/use-my-bar";

export default function MixologistPage() {
  const { barIds, loaded } = useMyBar();
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
          {error && (
            <div className="app-section">
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            </div>
          )}

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
              <p className="text-sm text-[var(--muted)]">
                Checking the catalogue, then crafting something original…
              </p>
            </div>
          )}

          {!inventing && result && (
            <div className="app-section">
              {statusMessage && <p className="bar-scan-demo-note mb-4">{statusMessage}</p>}
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
