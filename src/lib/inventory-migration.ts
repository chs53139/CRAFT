import { ingredients } from "@/lib/cocktail-data";
import { isHouseStaple } from "@/lib/inventory-tiers";

const VALID_INGREDIENT_IDS = new Set(ingredients.map((ing) => ing.id));

/**
 * Migration plan for existing CRAFT bar inventory (localStorage + Supabase `bar_items`).
 *
 * 1. **No schema change required** — `bar_items` still stores ingredient ID strings.
 * 2. **Strip house staples** — remove ice, water, crushed-ice, hot-water, branch-water if
 *    they were ever added manually (they are now assumed available).
 * 3. **Drop unknown IDs** — remove refs that no longer exist in the cocktail catalog.
 * 4. **Dedupe** — preserve first-seen order, remove duplicates.
 * 5. **Category reclassification is display-only** — existing IDs map to Spirits/Mixers/Pantry
 *    via `getInventoryTier()`; no user action needed.
 * 6. **Sync** — on next login or page load, migrated bar is written back to localStorage
 *    and Supabase (full replace, same as today).
 *
 * Rollout: call `migrateBarInventory()` on hydrate in `UserDataProvider` and before save.
 */
export function migrateBarInventory(barIds: string[]): string[] {
  const seen = new Set<string>();
  const migrated: string[] = [];

  for (const id of barIds) {
    if (isHouseStaple(id)) continue;
    if (!VALID_INGREDIENT_IDS.has(id)) continue;
    if (seen.has(id)) continue;
    seen.add(id);
    migrated.push(id);
  }

  return migrated;
}

export function barInventoryNeedsMigration(barIds: string[]): boolean {
  const migrated = migrateBarInventory(barIds);
  if (migrated.length !== barIds.length) return true;
  return migrated.some((id, index) => id !== barIds[index]);
}
