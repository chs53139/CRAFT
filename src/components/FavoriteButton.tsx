"use client";

type Props = {
  active: boolean;
  onToggle: () => void;
  className?: string;
};

export function FavoriteButton({ active, onToggle, className = "" }: Props) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition ${
        active
          ? "border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--accent)]"
          : "border-[var(--border)] bg-[var(--card)] text-[var(--muted)] hover:border-[var(--accent)]/40 hover:text-[var(--accent)]"
      } ${className}`}
    >
      {active ? "★" : "☆"}
    </button>
  );
}
