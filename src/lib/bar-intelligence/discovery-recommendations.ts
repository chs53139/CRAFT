import { getHiddenGems } from "@/lib/cocktail-discovery";
import { CocktailMatch } from "@/lib/types";
import { getUnderutilizedBottles } from "./underutilized";
import { getNeverThinkToMakeMatch } from "./discovery-modes";
import { scoreTasteFit } from "./taste-vector";
import { DiscoveryRecommendation, TasteVector } from "./types";

export function getDiscoveryRecommendations(input: {
  barIds: string[];
  matches: CocktailMatch[];
  tasteVector?: TasteVector;
  favoriteIds: string[];
  recentIds: string[];
  limit?: number;
}): DiscoveryRecommendation[] {
  if (input.barIds.length === 0) return [];

  const recommendations: DiscoveryRecommendation[] = [];
  const usedCocktailIds = new Set<string>();

  const neverThink = getNeverThinkToMakeMatch(input.barIds, {
    tasteVector: input.tasteVector,
    favoriteIds: input.favoriteIds,
    recentIds: input.recentIds,
    matches: input.matches,
  });

  if (neverThink) {
    usedCocktailIds.add(neverThink.cocktail.id);
    recommendations.push({
      id: "never-think",
      kind: "surprise",
      title: neverThink.cocktail.name,
      subtitle: "You'd never think to make this — but your bar is ready.",
      cocktailId: neverThink.cocktail.id,
      href: `/cocktails/${neverThink.cocktail.id}`,
    });
  }

  const gems = getHiddenGems(input.barIds, 5, input.matches);
  const gem = gems.find((m) => !usedCocktailIds.has(m.cocktail.id));
  if (gem) {
    usedCocktailIds.add(gem.cocktail.id);
    recommendations.push({
      id: "hidden-gem",
      kind: "hidden-gem",
      title: gem.cocktail.name,
      subtitle: `Hidden gem · obscurity ${gem.cocktail.obscurityScore}`,
      cocktailId: gem.cocktail.id,
      href: `/cocktails/${gem.cocktail.id}`,
    });
  }

  const stretch = input.matches
    .filter((m) => m.missingCount === 1 && !usedCocktailIds.has(m.cocktail.id))
    .sort((a, b) => {
      const tasteA = input.tasteVector
        ? scoreTasteFit(a.cocktail, input.tasteVector)
        : 0.5;
      const tasteB = input.tasteVector
        ? scoreTasteFit(b.cocktail, input.tasteVector)
        : 0.5;
      return tasteB - tasteA;
    })[0];

  if (stretch) {
    recommendations.push({
      id: "one-away",
      kind: "stretch",
      title: stretch.cocktail.name,
      subtitle: `One bottle away · need ${stretch.missing[0]?.name ?? "one item"}`,
      cocktailId: stretch.cocktail.id,
      href: `/cocktails/${stretch.cocktail.id}`,
    });
  }

  const underused = getUnderutilizedBottles(input.barIds, 1)[0];
  if (underused) {
    recommendations.push({
      id: "underutilized",
      kind: "bottle",
      title: underused.ingredient.name,
      subtitle: underused.message,
      ingredientId: underused.ingredient.id,
      href: "/cocktails",
    });
  }

  return recommendations.slice(0, input.limit ?? 4);
}
