import { CocktailMatch } from "@/lib/types";
import { CocktailCard } from "./CocktailCard";

type Props = {
  title: string;
  subtitle?: string;
  items: CocktailMatch[];
  empty?: string;
  compact?: boolean;
};

export function CocktailSection({
  title,
  subtitle,
  items,
  empty = "Nothing here yet.",
  compact,
}: Props) {
  return (
    <section className="mt-14">
      <div className="mb-6 border-b border-[var(--border)] pb-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-medium text-[var(--foreground)]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[var(--muted)]">{subtitle}</p>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-sm italic text-[var(--muted)]">{empty}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((match) => (
            <CocktailCard key={match.cocktail.id} match={match} compact={compact} />
          ))}
        </div>
      )}
    </section>
  );
}
