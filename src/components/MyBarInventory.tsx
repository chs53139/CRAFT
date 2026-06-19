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
  if (ingredients.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 px-6 py-8 text-center">
        <p className="text-sm text-[var(--muted)]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bar-glow rounded-2xl border border-[var(--accent)]/20 bg-[var(--card)] p-5">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.25em] text-[var(--accent)]">
          On your shelf
        </p>
        <span className="text-xs text-[var(--muted)]">
          {ingredients.length} item{ingredients.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {ingredients.map((ing) => (
          <button
            key={ing.id}
            type="button"
            onClick={() => onRemove(ing.id)}
            className="group flex items-center gap-2 rounded-full border border-[var(--accent)]/30 bg-[var(--accent)]/10 px-3 py-1.5 text-sm text-[var(--foreground)] transition hover:border-[var(--accent)] hover:bg-[var(--accent)]/20"
            title={`Remove ${ing.name}`}
          >
            <span>{ing.name}</span>
            <span className="text-[var(--accent)] opacity-60 transition group-hover:opacity-100">
              ×
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-[var(--muted)]">
        Tap any bottle to remove it from your bar.
      </p>
    </div>
  );
}
