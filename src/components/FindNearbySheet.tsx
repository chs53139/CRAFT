"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackProductEvent } from "@/lib/analytics";
import type { FindNearbyContext } from "@/lib/analytics/types";
import { AppOverlayPortal } from "@/components/AppOverlayPortal";
import { findNearbyForIngredient } from "@/lib/commerce";
import { shouldTrackMissingIngredientSelected } from "@/lib/commerce/find-nearby-analytics";
import {
  buildExternalSearchUrl,
  buildFindNearbyCtaLabel,
} from "@/lib/commerce/external-handoff";
import { normalizeCommerceIngredient } from "@/lib/commerce/normalize-ingredient";
import { isValidPostalCode, normalizePostalCode } from "@/lib/commerce/postal-code";
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
  const commerceIngredient = useMemo(
    () => normalizeCommerceIngredient(ingredient),
    [ingredient]
  );
  const ctaLabel = buildFindNearbyCtaLabel(commerceIngredient.displayName);
  const sheetRef = useRef<HTMLDivElement>(null);

  const [draftZip, setDraftZip] = useState("");
  const [editingZip, setEditingZip] = useState(false);
  const [zipError, setZipError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const savedZip = loaded && postalCode.trim().length > 0 ? postalCode.trim() : "";
  const showSavedZip = savedZip.length > 0 && !editingZip;

  useEffect(() => {
    if (!open) {
      setZipError(null);
      setLoading(false);
      setEditingZip(false);
      return;
    }
    if (loaded) {
      setDraftZip(postalCode);
      setEditingZip(!postalCode.trim());
    }
  }, [open, loaded, postalCode]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => sheetRef.current?.focus(), 0);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  const runHandoff = useCallback(
    async (zipInput: string) => {
      const zip = normalizePostalCode(zipInput);
      if (!isValidPostalCode(zip)) {
        setZipError("Enter a valid ZIP (e.g. 91384)");
        return;
      }

      setZipError(null);
      setPostalCode(zip);
      setLoading(true);

      trackProductEvent("find_nearby_clicked", {
        ingredientId: ingredient.id,
        context,
      });

      const result = await findNearbyForIngredient({
        ingredient: commerceIngredient,
        location: { postalCode: zip, countryCode: "US" },
        cocktailId,
      });

      setLoading(false);

      const searchQuery = result.externalSearchQuery;
      const url = result.destinationUrl ?? (searchQuery ? buildExternalSearchUrl(searchQuery) : undefined);

      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
        onClose();
        return;
      }

      setZipError("Add a ZIP to search near you.");
    },
    [commerceIngredient, cocktailId, context, ingredient.id, onClose, setPostalCode]
  );

  if (!open) return null;

  return (
    <AppOverlayPortal active={open}>
      <div className="find-nearby-backdrop" role="presentation" onClick={onClose}>
        <div
          ref={sheetRef}
          className="find-nearby-sheet animate-fade-in-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="find-nearby-title"
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
        >
          <p className="eyebrow text-[var(--accent-dim)]">Find nearby</p>
          <h2 id="find-nearby-title" className="find-nearby-title">
            {commerceIngredient.displayName}
          </h2>
          <p className="find-nearby-copy">Find it near you.</p>

          {showSavedZip ? (
            <p className="find-nearby-saved-zip">
              Near {savedZip}
              <button
                type="button"
                className="find-nearby-change-zip"
                onClick={() => {
                  setEditingZip(true);
                  setDraftZip(savedZip);
                }}
              >
                · Change
              </button>
            </p>
          ) : (
            <>
              <label className="find-nearby-label" htmlFor="commerce-zip">
                ZIP / postal code
              </label>
              <input
                id="commerce-zip"
                className="find-nearby-input"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="91384"
                value={draftZip}
                onChange={(e) => {
                  setDraftZip(e.target.value);
                  if (zipError) setZipError(null);
                }}
              />
            </>
          )}

          {zipError && <p className="find-nearby-error">{zipError}</p>}

          <div className="find-nearby-actions">
            <button type="button" className="btn-secondary flex-1" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-primary flex-1"
              disabled={loading}
              onClick={() => void runHandoff(showSavedZip ? savedZip : draftZip)}
            >
              {loading ? "Opening…" : ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </AppOverlayPortal>
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
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  function handleOpen(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (shouldTrackMissingIngredientSelected(context)) {
      trackProductEvent("missing_ingredient_selected", {
        ingredientId: ingredient.id,
        cocktailId,
      });
    }
    setOpen(true);
  }

  function handleClose() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`find-nearby-btn ${className}`}
        onClick={handleOpen}
      >
        Find nearby
      </button>
      <FindNearbySheet
        ingredient={ingredient}
        context={context}
        cocktailId={cocktailId}
        open={open}
        onClose={handleClose}
      />
    </>
  );
}
