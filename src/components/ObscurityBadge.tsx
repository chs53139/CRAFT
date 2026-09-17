import { getRarityTier, rarityTierLabel } from "@/lib/cocktail-rarity";
import { Cocktail } from "@/lib/types";

type Props = {
  score: number;
  cocktail?: Pick<Cocktail, "id" | "collections" | "popularityScore" | "obscurityScore">;
  compact?: boolean;
};

export function ObscurityBadge({ score, cocktail, compact }: Props) {
  const label = cocktail
    ? rarityTierLabel(getRarityTier(cocktail as Cocktail))
    : score >= 80
      ? "Rare / deep cut"
      : score >= 65
        ? "Hidden gem"
        : score >= 45
          ? "Well known"
          : "Classic";

  return (
    <div className={compact ? "obscurity-badge obscurity-badge-compact" : "obscurity-badge"}>
      <div className="obscurity-badge-top">
        <span className="obscurity-badge-label">{label}</span>
      </div>
      {!compact && (
        <div className="obscurity-meter" aria-hidden>
          <span className="obscurity-meter-fill" style={{ width: `${score}%` }} />
        </div>
      )}
    </div>
  );
}
