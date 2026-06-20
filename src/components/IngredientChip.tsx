type Props = {
  name: string;
  selected: boolean;
  onClick: () => void;
};

export function IngredientChip({ name, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-11 rounded-full border px-4 py-2.5 text-sm transition duration-200 ${
        selected
          ? "border-[var(--accent)]/40 bg-[var(--accent)]/12 text-[var(--accent)] shadow-[0_0_24px_var(--accent-glow)]"
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/30 hover:bg-[var(--card-hover)] hover:text-[var(--foreground)]"
      }`}
    >
      {selected ? "✓ " : ""}
      {name}
    </button>
  );
}
