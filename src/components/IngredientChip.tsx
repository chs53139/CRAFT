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
      className={`rounded-full border px-4 py-2 text-sm transition ${
        selected
          ? "border-[var(--accent)] bg-[var(--accent)]/15 text-[var(--accent)] shadow-[0_0_20px_var(--glow)]"
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--foreground)]"
      }`}
    >
      {selected ? "✓ " : ""}
      {name}
    </button>
  );
}
