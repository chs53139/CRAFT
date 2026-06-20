import { CocktailMatch } from "@/lib/types";
import { CocktailCard } from "./CocktailCard";

type Props = {
  title: string;
  subtitle?: string;
  items: CocktailMatch[];
  empty?: string;
  compact?: boolean;
  showObscurity?: boolean;
};

export function CocktailSection({
  title,
  subtitle,
  items,
  empty = "Nothing here yet.",
  compact,
  showObscurity,
}: Props) {
  return (
    <section className="app-section">
      <div>
        <h2 className="section-row-title">{title}</h2>
        {subtitle && <p className="section-row-subtitle">{subtitle}</p>}
      </div>

      {items.length === 0 ? (
        empty ? <p className="section-row-empty mt-3">{empty}</p> : null
      ) : (
        <div className="list-card-grid mt-4">
          {items.map((match) => (
            <CocktailCard key={match.cocktail.id} match={match} compact={compact} showObscurity={showObscurity} />
          ))}
        </div>
      )}
    </section>
  );
}
