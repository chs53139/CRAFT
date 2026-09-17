import type { FindNearbyContext } from "@/lib/analytics/types";

/** Purchase intent for a missing ingredient — not the same as confirming Find Nearby. */
export function shouldTrackMissingIngredientSelected(context: FindNearbyContext): boolean {
  return (
    context === "cocktail_detail" ||
    context === "one_away" ||
    context === "ingredient_list"
  );
}
