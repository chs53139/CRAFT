import { INVENTORY_TIERS, InventoryTier } from "@/lib/inventory-tiers";
import { Ingredient } from "@/lib/types";

type Props = {
  missingByTier: Partial<Record<InventoryTier, Ingredient[]>>;
  compact?: boolean;
};

export function MissingIngredientsByTier({ missingByTier, compact }: Props) {
  const tiers = INVENTORY_TIERS.filter((tier) => (missingByTier[tier.id]?.length ?? 0) > 0);

  if (tiers.length === 0) return null;

  if (compact) {
    return (
      <span>
        {tiers.map((tier, index) => (
          <span key={tier.id}>
            {index > 0 ? " · " : null}
            <span className="font-medium text-[var(--accent-dim)]">{tier.shelfLabel}: </span>
            {missingByTier[tier.id]!.map((ing) => ing.name).join(", ")}
          </span>
        ))}
      </span>
    );
  }

  return (
    <div className="missing-by-tier">
      {tiers.map((tier) => (
        <div key={tier.id} className="missing-by-tier-group">
          <p className="missing-by-tier-label">{tier.shelfLabel}</p>
          <ul className="missing-by-tier-list">
            {missingByTier[tier.id]!.map((ing) => (
              <li key={ing.id}>{ing.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
