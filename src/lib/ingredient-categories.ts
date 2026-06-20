import { getIngredientById } from "@/lib/cocktail-matching";
import {
  getInventoryTier,
  getInventoryTierLabel,
  INVENTORY_TIERS,
  InventoryTier,
} from "@/lib/inventory-tiers";

/** @deprecated Prefer INVENTORY_TIERS and getInventoryTier for bar inventory UI. */
export type ShopCategory = InventoryTier;

/** @deprecated Use INVENTORY_TIERS from inventory-tiers.ts */
export const SHOP_CATEGORIES = INVENTORY_TIERS.map((tier) => ({
  id: tier.id,
  label: tier.label,
  description: tier.description,
}));

export { INVENTORY_TIERS, getInventoryTier, getInventoryTierLabel };
export type { InventoryTier };

/** @deprecated Use getInventoryTier */
export function getShopCategory(id: string, name: string): InventoryTier {
  const ing = getIngredientById(id);
  if (ing) return getInventoryTier(ing);
  return getInventoryTier({ id, name, category: "other" });
}
