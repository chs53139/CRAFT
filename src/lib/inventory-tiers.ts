import { Ingredient } from "@/lib/types";

export type InventoryTier = "spirits-liqueurs" | "mixers" | "pantry";

export const INVENTORY_TIERS: {
  id: InventoryTier;
  label: string;
  description: string;
  shelfLabel: string;
}[] = [
  {
    id: "spirits-liqueurs",
    label: "Spirits & Liqueurs",
    shelfLabel: "Spirits & liqueurs",
    description: "Bourbon, gin, vermouth, Campari, and the bottles you collect.",
  },
  {
    id: "mixers",
    label: "Mixers",
    shelfLabel: "Mixers",
    description: "Juice, soda, tonic, ginger beer, and other pour-to-top items.",
  },
  {
    id: "pantry",
    label: "Pantry",
    shelfLabel: "Pantry",
    description: "Syrups, bitters, eggs, honey, and cocktail ingredients — not full bottles.",
  },
];

/** Always available — never tracked in user inventory. */
export const HOUSE_STAPLE_IDS = new Set([
  "ice",
  "crushed-ice",
  "water",
  "hot-water",
  "branch-water",
]);

const TIER_LABEL: Record<InventoryTier, string> = {
  "spirits-liqueurs": "Spirits & liqueurs",
  mixers: "Mixers",
  pantry: "Pantry",
};

export function isHouseStaple(id: string): boolean {
  return HOUSE_STAPLE_IDS.has(id);
}

export function getInventoryTierLabel(tier: InventoryTier): string {
  return TIER_LABEL[tier];
}

export function getInventoryTier(
  ingredient: Pick<Ingredient, "id" | "name" | "category">
): InventoryTier {
  if (isHouseStaple(ingredient.id)) return "pantry";

  const key = `${ingredient.id} ${ingredient.name}`.toLowerCase();

  if (ingredient.category === "spirit" || ingredient.category === "na-spirit") {
    return "spirits-liqueurs";
  }

  if (ingredient.category === "liqueur") {
    if (
      /prosecco|champagne|\bwine\b|sake|beer|cider|stout|lager|kombucha/.test(key)
    ) {
      return "mixers";
    }
    return "spirits-liqueurs";
  }

  if (
    ingredient.category === "pantry" ||
    ingredient.category === "garnish" ||
    ingredient.category === "other"
  ) {
    return "pantry";
  }

  if (
    /bitters|syrup|orgeat|grenadine|falernum|honey|sugar|egg|cream|milk|nutmeg|cinnamon|salt|pepper|marmalade|sorbet|extract|maple|demerara|agave|vanilla|olive-brine|celery-salt|hot-sauce|charcoal|smoke/.test(
      key
    )
  ) {
    return "pantry";
  }

  if (
    ingredient.category === "mixer" ||
    /juice|soda|tonic|seltzer|sparkling|ginger-beer|ginger-ale|cola|sprite|club-soda|tea|coffee|espresso|coconut-water|bitter-lemon/.test(
      key
    )
  ) {
    return "mixers";
  }

  return "pantry";
}

export function getEffectiveBarIds(barIds: string[]): string[] {
  return [...barIds, ...HOUSE_STAPLE_IDS];
}

export function groupByInventoryTier<T extends Pick<Ingredient, "id" | "name" | "category">>(
  items: T[]
): Record<InventoryTier, T[]> {
  const grouped: Record<InventoryTier, T[]> = {
    "spirits-liqueurs": [],
    mixers: [],
    pantry: [],
  };

  for (const item of items) {
    if (isHouseStaple(item.id)) continue;
    grouped[getInventoryTier(item)].push(item);
  }

  for (const tier of INVENTORY_TIERS) {
    grouped[tier.id].sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped;
}

export function groupMissingByTier(
  missing: Ingredient[]
): Partial<Record<InventoryTier, Ingredient[]>> {
  const grouped = groupByInventoryTier(missing);
  const result: Partial<Record<InventoryTier, Ingredient[]>> = {};

  for (const tier of INVENTORY_TIERS) {
    if (grouped[tier.id].length > 0) {
      result[tier.id] = grouped[tier.id];
    }
  }

  return result;
}

export function formatMissingByTier(missingByTier: Partial<Record<InventoryTier, Ingredient[]>>): string {
  return INVENTORY_TIERS.filter((tier) => (missingByTier[tier.id]?.length ?? 0) > 0)
    .map((tier) => {
      const names = missingByTier[tier.id]!.map((ing) => ing.name).join(", ");
      return `${tier.shelfLabel}: ${names}`;
    })
    .join(" · ");
}

export function isBrowsableIngredient(ingredient: Pick<Ingredient, "id">): boolean {
  return !isHouseStaple(ingredient.id);
}
