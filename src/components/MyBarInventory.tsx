"use client";

import { useState } from "react";
import { Ingredient } from "@/lib/types";

type Props = {
  ingredients: Ingredient[];
  onRemove: (id: string) => void;
  emptyMessage?: string;
};

export function MyBarInventory({
  ingredients,
  onRemove,
  emptyMessage = "Nothing on the shelf yet. Time to fix that.",
}: Props) {
  const [expanded, setExpanded] = useState(true);

  if (ingredients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/40 px-6 py-10 text-center">
        <p className="text-sm leading-relaxed text-[var(--muted)]">{emptyMessage}</p>
      </div>
    );
  }

  const panelId = "bar-inventory-panel";

  return (
    <div className="bar-glow animate-fade-in-up rounded-2xl border border-[var(--accent)]/15 bg-[var(--card)] p-5 sm:p-6">
      <button
        type="button"
        className="bar-inventory-toggle"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((value) => !value)}
      >
        <div className="min-w-0 text-left">
          <p className="eyebrow">On your shelf</p>
          {!expanded && (
            <p className="mt-1 text-xs text-[var(--muted)]">
              {ingredients.length} bottle{ingredients.length !== 1 ? "s" : ""} saved — tap to
              show
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-[var(--border-subtle)] px-2.5 py-1 text-[11px] tabular-nums text-[var(--muted)]">
            {ingredients.length} item{ingredients.length !== 1 ? "s" : ""}
          </span>
          <span
            className={`bar-inventory-chevron ${expanded ? "bar-inventory-chevron-open" : ""}`}
            aria-hidden
          >
            ▾
          </span>
        </div>
      </button>

      {expanded && (
        <div id={panelId} className="bar-inventory-panel">
          <div className="flex flex-wrap gap-2">
            {ingredients.map((ing) => (
              <button
                key={ing.id}
                type="button"
                onClick={() => onRemove(ing.id)}
                className="group flex min-h-11 items-center gap-2 rounded-full border border-[var(--accent)]/25 bg-[var(--accent)]/8 px-3.5 py-2 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)]/50 hover:bg-[var(--accent)]/14"
                title={`Remove ${ing.name}`}
              >
                <span>{ing.name}</span>
                <span className="text-[var(--accent)] opacity-50 transition group-hover:opacity-100">
                  ×
                </span>
              </button>
            ))}
          </div>
          <p className="mt-4 text-[11px] tracking-wide text-[var(--muted)]">
            Tap any bottle to remove it from your bar.
          </p>
        </div>
      )}
    </div>
  );
}
