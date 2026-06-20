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
    <section className="mt-16 sm:mt-20">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{subtitle}</p>}
      </div>

      {items.length === 0 ? (
        empty ? (
          <p className="text-sm italic leading-relaxed text-[var(--muted)]">{empty}</p>
        ) : null
      ) : (
        <div className="stagger-grid grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {items.map((match) => (
            <CocktailCard key={match.cocktail.id} match={match} compact={compact} />
          ))}
        </div>
      )}
    </section>
  );
}
