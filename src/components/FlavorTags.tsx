export function FlavorTags({ flavors }: { flavors: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {flavors.map((flavor) => (
        <span
          key={flavor}
          className="rounded-md bg-[var(--background)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]"
        >
          {flavor}
        </span>
      ))}
    </div>
  );
}
