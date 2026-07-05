import { SPIRIT_SEARCH_TERMS, CATEGORY_SEARCH_TERMS } from "@/lib/cocktail-search";
import { getCatalogueRatingScore } from "@/lib/ingredient-search";
import { Cocktail, CocktailMatch, Difficulty } from "@/lib/types";

export type SpiritFilter =
  | "all"
  | "gin"
  | "bourbon"
  | "rye"
  | "scotch"
  | "rum"
  | "tequila"
  | "mezcal"
  | "vodka"
  | "brandy"
  | "cognac"
  | "amaro"
  | "aperitif"
  | "liqueur";

export type CategoryFilter =
  | "all"
  | "tiki"
  | "sour"
  | "old-fashioned"
  | "martini"
  | "highball"
  | "collins"
  | "fizz"
  | "flip"
  | "smash"
  | "mule"
  | "tropical"
  | "spritz"
  | "punch"
  | "mocktail"
  | "holiday"
  | "seasonal";

export type DifficultyFilter = "all" | Difficulty;
export type FlavorFilter = "all" | string;
export type StrengthFilter = "all" | "light" | "medium" | "strong";
export type RarityFilter = "all" | "common" | "uncommon" | "rare" | "hidden-gem";
export type RatingFilter = "all" | "high" | "top";

export type DiscoveryFilters = {
  spirit: SpiritFilter;
  category: CategoryFilter;
  difficulty: DifficultyFilter;
  flavor: FlavorFilter;
  strength: StrengthFilter;
  rarity: RarityFilter;
  rating: RatingFilter;
  craftOriginals: boolean;
  collection?: string;
};

export type DiscoverySort =
  | "best-match"
  | "popularity"
  | "rating"
  | "hidden-gems"
  | "recently-added"
  | "ai-recommended"
  | "most-owned"
  | "fewest-missing"
  | "rarest";

export const DEFAULT_DISCOVERY_FILTERS: DiscoveryFilters = {
  spirit: "all",
  category: "all",
  difficulty: "all",
  flavor: "all",
  strength: "all",
  rarity: "all",
  rating: "all",
  craftOriginals: false,
};

export const SPIRIT_FILTER_OPTIONS: Array<{ id: SpiritFilter; label: string }> = [
  { id: "all", label: "All spirits" },
  { id: "gin", label: "Gin" },
  { id: "bourbon", label: "Bourbon" },
  { id: "rye", label: "Rye" },
  { id: "scotch", label: "Scotch" },
  { id: "rum", label: "Rum" },
  { id: "tequila", label: "Tequila" },
  { id: "mezcal", label: "Mezcal" },
  { id: "vodka", label: "Vodka" },
  { id: "brandy", label: "Brandy" },
  { id: "cognac", label: "Cognac" },
  { id: "amaro", label: "Amaro" },
  { id: "aperitif", label: "Aperitif" },
  { id: "liqueur", label: "Liqueur" },
];

export const CATEGORY_FILTER_OPTIONS: Array<{ id: CategoryFilter; label: string }> = [
  { id: "all", label: "All categories" },
  { id: "tiki", label: "Tiki" },
  { id: "sour", label: "Sour" },
  { id: "old-fashioned", label: "Old Fashioned" },
  { id: "martini", label: "Martini" },
  { id: "highball", label: "Highball" },
  { id: "collins", label: "Collins" },
  { id: "fizz", label: "Fizz" },
  { id: "flip", label: "Flip" },
  { id: "smash", label: "Smash" },
  { id: "mule", label: "Mule" },
  { id: "tropical", label: "Tropical" },
  { id: "spritz", label: "Spritz" },
  { id: "punch", label: "Punch" },
  { id: "mocktail", label: "Mocktail" },
  { id: "holiday", label: "Holiday" },
  { id: "seasonal", label: "Seasonal" },
];

export const DIFFICULTY_FILTER_OPTIONS: Array<{ id: DifficultyFilter; label: string }> = [
  { id: "all", label: "Any difficulty" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
];

export const FLAVOR_FILTER_OPTIONS: Array<{ id: FlavorFilter; label: string }> = [
  { id: "all", label: "Any flavor" },
  { id: "citrus", label: "Citrus" },
  { id: "tropical", label: "Tropical" },
  { id: "bitter", label: "Bitter" },
  { id: "herbal", label: "Herbal" },
  { id: "smoky", label: "Smoky" },
  { id: "spicy", label: "Spicy" },
  { id: "rich", label: "Rich" },
  { id: "refreshing", label: "Refreshing" },
  { id: "spirit-forward", label: "Spirit-forward" },
  { id: "bubbly", label: "Bubbly" },
];

export const STRENGTH_FILTER_OPTIONS: Array<{ id: StrengthFilter; label: string }> = [
  { id: "all", label: "Any strength" },
  { id: "light", label: "Light" },
  { id: "medium", label: "Medium" },
  { id: "strong", label: "Strong" },
];

export const RARITY_FILTER_OPTIONS: Array<{ id: RarityFilter; label: string }> = [
  { id: "all", label: "Any rarity" },
  { id: "common", label: "Crowd pleaser" },
  { id: "uncommon", label: "Uncommon" },
  { id: "rare", label: "Rare find" },
  { id: "hidden-gem", label: "Hidden gem" },
];

export const SORT_OPTIONS: Array<{ id: DiscoverySort; label: string }> = [
  { id: "best-match", label: "Best match" },
  { id: "popularity", label: "Most popular" },
  { id: "rating", label: "Highest rated" },
  { id: "hidden-gems", label: "Hidden gems" },
  { id: "recently-added", label: "Recently added" },
  { id: "ai-recommended", label: "AI recommended" },
  { id: "most-owned", label: "Most ingredients owned" },
  { id: "fewest-missing", label: "Fewest missing" },
  { id: "rarest", label: "Rarest" },
];

function cocktailHasSpirit(cocktail: Cocktail, spirit: SpiritFilter): boolean {
  if (spirit === "all") return true;
  const ids = new Set(SPIRIT_SEARCH_TERMS[spirit] ?? [spirit]);
  return cocktail.ingredients.some((ing) => ids.has(ing.ingredientId));
}

function cocktailMatchesCategory(cocktail: Cocktail, category: CategoryFilter): boolean {
  if (category === "all") return true;

  if (category === "old-fashioned") {
    return (
      cocktail.name.toLowerCase().includes("old fashioned") ||
      cocktail.id.includes("old-fashioned")
    );
  }

  const matcher = CATEGORY_SEARCH_TERMS[category.replace(/-/g, " ")];
  if (matcher) return matcher(cocktail);

  if (category === "mocktail") return cocktail.drinkType === "mocktail";

  return false;
}

function inferStrength(cocktail: Cocktail): StrengthFilter {
  const spiritCount = cocktail.ingredients.filter((ing) => {
    const id = ing.ingredientId;
    return (
      id.includes("rum") ||
      id.includes("whiskey") ||
      id.includes("whisky") ||
      id.includes("gin") ||
      id.includes("vodka") ||
      id.includes("tequila") ||
      id.includes("mezcal") ||
      id.includes("brandy") ||
      id.includes("cognac") ||
      id.includes("scotch")
    );
  }).length;

  const hasLongMixer = cocktail.ingredients.some((ing) =>
    /soda|tonic|ginger-beer|juice|prosecco|champagne|club-soda|cola|water/.test(ing.ingredientId)
  );

  if (spiritCount >= 2 && !hasLongMixer) return "strong";
  if (spiritCount === 1 && hasLongMixer) return "light";
  return "medium";
}

function matchesRarity(cocktail: Cocktail, rarity: RarityFilter): boolean {
  if (rarity === "all") return true;
  if (rarity === "common") return cocktail.popularityScore >= 70;
  if (rarity === "uncommon") return cocktail.obscurityScore >= 40 && cocktail.obscurityScore < 58;
  if (rarity === "rare") return cocktail.obscurityScore >= 58;
  if (rarity === "hidden-gem") {
    return (
      cocktail.collections.includes("hidden-gem") ||
      cocktail.obscurityScore >= 55
    );
  }
  return true;
}

function matchesRating(cocktail: Cocktail, rating: RatingFilter): boolean {
  if (rating === "all") return true;
  const score = getCatalogueRatingScore(cocktail);
  if (rating === "high") return score >= 65;
  if (rating === "top") return score >= 80;
  return true;
}

export function hasActiveDiscoveryFilters(filters: DiscoveryFilters): boolean {
  return (
    filters.spirit !== "all" ||
    filters.category !== "all" ||
    filters.difficulty !== "all" ||
    filters.flavor !== "all" ||
    filters.strength !== "all" ||
    filters.rarity !== "all" ||
    filters.rating !== "all" ||
    filters.craftOriginals ||
    !!filters.collection
  );
}

export function applyDiscoveryFilters(
  matches: CocktailMatch[],
  filters: DiscoveryFilters
): CocktailMatch[] {
  return matches.filter(({ cocktail }) => {
    if (filters.craftOriginals && !cocktail.collections.includes("craft-original")) {
      return false;
    }

    if (filters.collection && filters.collection !== "all") {
      if (!cocktail.collections.includes(filters.collection as Cocktail["collections"][number])) {
        return false;
      }
    }

    if (!cocktailHasSpirit(cocktail, filters.spirit)) return false;
    if (!cocktailMatchesCategory(cocktail, filters.category)) return false;
    if (filters.difficulty !== "all" && cocktail.difficulty !== filters.difficulty) return false;
    if (filters.flavor !== "all" && !cocktail.flavorProfile.includes(filters.flavor)) return false;
    if (filters.strength !== "all" && inferStrength(cocktail) !== filters.strength) return false;
    if (!matchesRarity(cocktail, filters.rarity)) return false;
    if (!matchesRating(cocktail, filters.rating)) return false;

    return true;
  });
}

export function sortDiscoveryResults(
  matches: CocktailMatch[],
  sort: DiscoverySort,
  searchQuery = ""
): CocktailMatch[] {
  const sorted = [...matches];

  sorted.sort((a, b) => {
    const ca = a.cocktail;
    const cb = b.cocktail;

    switch (sort) {
      case "popularity":
        return cb.popularityScore - ca.popularityScore || ca.name.localeCompare(cb.name);
      case "rating":
        return getCatalogueRatingScore(cb) - getCatalogueRatingScore(ca);
      case "hidden-gems":
        return cb.obscurityScore - ca.obscurityScore || ca.name.localeCompare(cb.name);
      case "recently-added":
        return cb.yearInvented - ca.yearInvented || cb.popularityScore - ca.popularityScore;
      case "most-owned":
        return a.missingCount - b.missingCount || cb.popularityScore - ca.popularityScore;
      case "fewest-missing":
        if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
        return cb.popularityScore - ca.popularityScore;
      case "rarest":
        return cb.obscurityScore - ca.obscurityScore || ca.name.localeCompare(cb.name);
      case "ai-recommended": {
        const scoreA = aiRecommendScore(a);
        const scoreB = aiRecommendScore(b);
        return scoreB - scoreA;
      }
      case "best-match":
      default: {
        if (searchQuery.trim()) {
          const nameMatchA = ca.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
          const nameMatchB = cb.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0;
          if (nameMatchB !== nameMatchA) return nameMatchB - nameMatchA;
        }
        if (a.canMake !== b.canMake) return a.canMake ? -1 : 1;
        if (a.missingCount !== b.missingCount) return a.missingCount - b.missingCount;
        return cb.popularityScore - ca.popularityScore;
      }
    }
  });

  return sorted;
}

function aiRecommendScore(match: CocktailMatch): number {
  const c = match.cocktail;
  let score = c.popularityScore * 0.3 + c.obscurityScore * 0.2;

  if (match.canMake) score += 40;
  else if (match.canMakeWithSubstitutions) score += 25;
  else if (match.missingCount === 1) score += 15;

  if (c.collections.includes("hidden-gem")) score += 12;
  if (c.collections.includes("verified-classic")) score += 8;

  return score;
}

export function countMakeable(matches: CocktailMatch[]): number {
  return matches.filter((m) => m.canMake || m.canMakeWithSubstitutions).length;
}

export function countExactMakeable(matches: CocktailMatch[]): number {
  return matches.filter((m) => m.canMake).length;
}
