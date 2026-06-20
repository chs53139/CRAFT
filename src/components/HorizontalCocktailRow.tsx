import Link from "next/link";
import { CocktailMatch } from "@/lib/types";
import { CocktailCard } from "./CocktailCard";

type Props = {
  title: string;
  subtitle?: string;
  items: CocktailMatch[];
  seeAllHref?: string;
  empty?: string;
  showObscurity?: boolean;
};

export function HorizontalCocktailRow({
  title,
  subtitle,
  items,
  seeAllHref,
  empty,
  showObscurity,
}: Props) {
  return (
    <section className="app-section">
      <div className="section-row-header">
        <div>
          <h2 className="section-row-title">{title}</h2>
          {subtitle && <p className="section-row-subtitle">{subtitle}</p>}
        </div>
        {seeAllHref && items.length > 0 && (
          <Link href={seeAllHref} className="section-row-link">
            See all
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        empty ? <p className="section-row-empty">{empty}</p> : null
      ) : (
        <div className="carousel-track">
          {items.map((match) => (
            <div key={match.cocktail.id} className="carousel-item">
              <CocktailCard match={match} compact variant="carousel" showObscurity={showObscurity} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
