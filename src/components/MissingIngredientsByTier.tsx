import { AddToShoppingListButton } from "@/components/AddToShoppingListButton";
import { FindNearbyButton } from "@/components/FindNearbySheet";
import { INVENTORY_TIERS, InventoryTier, isBrowsableIngredient } from "@/lib/inventory-tiers";
import { Ingredient } from "@/lib/types";

type Props = {
  missingByTier: Partial<Record<InventoryTier, Ingredient[]>>;
  compact?: boolean;
  cocktailId?: string;
  showFindNearby?: boolean;
};

export function MissingIngredientsByTier({
  missingByTier,
  compact,
  cocktailId,
  showFindNearby,
}: Props) {
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
      <p className="missing-by-tier-heading">You&apos;re missing</p>
      {tiers.map((tier) => (
        <div key={tier.id} className="missing-by-tier-group">
          <p className="missing-by-tier-label">{tier.shelfLabel}</p>
          <ul className="missing-by-tier-list">
            {missingByTier[tier.id]!.map((ing) => (
              <li key={ing.id} className="missing-by-tier-item">
                <span className="missing-by-tier-name">{ing.name}</span>
                {showFindNearby && isBrowsableIngredient(ing) && (
                  <span className="missing-by-tier-actions">
                    <AddToShoppingListButton
                      ingredientId={ing.id}
                      source="cocktail_detail"
                      cocktailId={cocktailId}
                    />
                    <FindNearbyButton
                      ingredient={ing}
                      context="cocktail_detail"
                      cocktailId={cocktailId}
                      className="missing-by-tier-find"
                    />
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
