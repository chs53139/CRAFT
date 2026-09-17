"use client";

import { useEffect, useState } from "react";
import { trackProductEvent } from "@/lib/analytics";
import type { FindNearbyContext } from "@/lib/analytics/types";
import { findNearbyForIngredient } from "@/lib/commerce";
import { normalizeCommerceIngredient } from "@/lib/commerce/normalize-ingredient";
import type { CommerceResult } from "@/lib/commerce/types";
import { useCommerceZip } from "@/hooks/use-commerce-zip";
import { Ingredient } from "@/lib/types";

type Props = {
  ingredient: Ingredient;
  context: FindNearbyContext;
  open: boolean;
  onClose: () => void;
  cocktailId?: string;
};

export function FindNearbySheet({
  ingredient,
  context,
  open,
  onClose,
  cocktailId,
}: Props) {
  const { postalCode, setPostalCode, loaded } = useCommerceZip();
  const [draftZip, setDraftZip] = useState("");
  const [result, setResult] = useState<CommerceResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && loaded) setDraftZip(postalCode);
  }, [open, loaded, postalCode]);

  useEffect(() => {
    if (!open) {
      setResult(null);
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  async function handleLookup() {
    const zip = draftZip.trim();
    if (zip) setPostalCode(zip);

    setLoading(true);
    trackProductEvent("find_nearby_clicked", {
      ingredientId: ingredient.id,
      context,
    });

    const commerceIngredient = normalizeCommerceIngredient(ingredient);
    const next = await findNearbyForIngredient({
      ingredient: commerceIngredient,
      location: zip ? { postalCode: zip, countryCode: "US" } : undefined,
      cocktailId,
    });
    setResult(next);
    setLoading(false);
  }

  function handleExternalSearch() {
    if (!result?.externalSearchQuery) return;
    const url = `https://www.google.com/search?q=${encodeURIComponent(result.externalSearchQuery)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="find-nearby-backdrop" role="presentation" onClick={onClose}>
      <div
        className="find-nearby-sheet animate-fade-in-up"
        role="dialog"
        aria-labelledby="find-nearby-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow text-[var(--accent-dim)]">Find nearby</p>
        <h2 id="find-nearby-title" className="find-nearby-title">
          {normalizeCommerceIngredient(ingredient).displayName}
        </h2>
        <p className="find-nearby-copy">
          Save a ZIP for when retailer lookup goes live. CRAFT never shows fake prices or inventory.
        </p>

        <label className="find-nearby-label" htmlFor="commerce-zip">
          ZIP / postal code
        </label>
        <input
          id="commerce-zip"
          className="find-nearby-input"
          inputMode="text"
          autoComplete="postal-code"
          placeholder="e.g. 94110"
          value={draftZip}
          onChange={(e) => setDraftZip(e.target.value)}
        />

        <div className="find-nearby-actions">
          <button type="button" className="btn-secondary flex-1" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn-primary flex-1" onClick={handleLookup} disabled={loading}>
            {loading ? "Looking…" : "Continue"}
          </button>
        </div>

        {result && (
          <div className="find-nearby-result">
            <p className="text-sm text-[var(--foreground)]">{result.message}</p>
            {result.externalSearchQuery && (
              <button type="button" className="find-nearby-link" onClick={handleExternalSearch}>
                Search the web for this bottle
              </button>
            )}
            <p className="find-nearby-footnote">
              Retailer integration coming — your recommendation logic stays independent of any future
              affiliate relationship.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

type ButtonProps = {
  ingredient: Ingredient;
  context: FindNearbyContext;
  cocktailId?: string;
  className?: string;
};

export function FindNearbyButton({ ingredient, context, cocktailId, className = "" }: ButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={`find-nearby-btn ${className}`}
        onClick={() => setOpen(true)}
      >
        Find nearby
      </button>
      <FindNearbySheet
        ingredient={ingredient}
        context={context}
        cocktailId={cocktailId}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}
