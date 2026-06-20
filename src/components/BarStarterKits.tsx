"use client";

import { BAR_STARTER_KITS } from "@/data/bar-starter-kits";
import { getIngredientById } from "@/lib/cocktail-matching";

type Props = {
  barIds: string[];
  onApply: (ingredientIds: string[]) => void;
};

export function BarStarterKits({ barIds, onApply }: Props) {
  const barSet = new Set(barIds);

  return (
    <div className="starter-kit-grid">
      <div>
        <h2 className="section-row-title">Quick start</h2>
        <p className="section-row-subtitle">Load a starter shelf in one tap</p>
      </div>
      <div className="starter-kit-list">
        {BAR_STARTER_KITS.map((kit) => {
          const validIds = kit.ingredientIds.filter((id) => !!getIngredientById(id));
          const newIds = validIds.filter((id) => !barSet.has(id));
          if (validIds.length === 0) return null;

          return (
            <button
              key={kit.id}
              type="button"
              className="starter-kit-card"
              onClick={() => onApply(newIds.length > 0 ? newIds : validIds)}
            >
              <p className="starter-kit-label">{kit.label}</p>
              <p className="starter-kit-description">{kit.description}</p>
              <p className="starter-kit-meta">
                {newIds.length > 0
                  ? `Adds ${newIds.length} bottle${newIds.length === 1 ? "" : "s"}`
                  : "Already on your shelf"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
