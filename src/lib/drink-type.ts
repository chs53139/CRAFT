import { Cocktail, CocktailMatch, MocktailSubcategory, RawCocktail } from "@/lib/types";

export type DrinkTypeFilter = "both" | "cocktails" | "mocktails";

export const DRINK_TYPE_OPTIONS: Array<{ id: DrinkTypeFilter; label: string }> = [
  { id: "both", label: "Both" },
  { id: "cocktails", label: "Cocktails" },
  { id: "mocktails", label: "Mocktails" },
];

const ALCOHOLIC_INGREDIENT_TYPES = new Set([
  "spirit",
  "liqueur",
  "fortified-wine",
  "wine",
  "beer-cider",
]);

const MOCKTAIL_SUBCATEGORY_TAGS: Record<string, MocktailSubcategory> = {
  "classic-mocktail": "classic-mocktail",
  "modern-mocktail": "modern-mocktail",
  wellness: "wellness",
  party: "party",
  coffee: "coffee",
  tea: "tea",
};

export function inferDrinkType(raw: RawCocktail): Cocktail["drinkType"] {
  if (raw.tags.includes("mocktail")) return "mocktail";
  const hasAlcohol = raw.ingredients.some((ing) => ALCOHOLIC_INGREDIENT_TYPES.has(ing.type));
  return hasAlcohol ? "cocktail" : "mocktail";
}

export function inferMocktailSubcategory(
  raw: RawCocktail
): MocktailSubcategory | undefined {
  if (!raw.tags.includes("mocktail")) return undefined;

  for (const tag of raw.tags) {
    const match = MOCKTAIL_SUBCATEGORY_TAGS[tag];
    if (match) return match;
  }

  return "modern-mocktail";
}

export function isMocktail(cocktail: Pick<Cocktail, "drinkType">): boolean {
  return cocktail.drinkType === "mocktail";
}

export function isAlcoholic(cocktail: Pick<Cocktail, "drinkType">): boolean {
  return cocktail.drinkType === "cocktail";
}

export function filterMatchesByDrinkType<T extends { cocktail: Cocktail }>(
  matches: T[],
  filter: DrinkTypeFilter
): T[] {
  if (filter === "both") return matches;
  if (filter === "mocktails") return matches.filter((match) => isMocktail(match.cocktail));
  return matches.filter((match) => isAlcoholic(match.cocktail));
}

export function filterCocktailsByDrinkType(
  cocktails: Cocktail[],
  filter: DrinkTypeFilter
): Cocktail[] {
  if (filter === "both") return cocktails;
  if (filter === "mocktails") return cocktails.filter(isMocktail);
  return cocktails.filter(isAlcoholic);
}

export function countByDrinkType(cocktails: Cocktail[]) {
  const mocktails = cocktails.filter(isMocktail).length;
  return {
    cocktails: cocktails.length - mocktails,
    mocktails,
    total: cocktails.length,
  };
}

export function filterMatchesByMocktailSubcategory(
  matches: CocktailMatch[],
  subcategory: MocktailSubcategory | "all"
): CocktailMatch[] {
  if (subcategory === "all") return matches;
  return matches.filter((match) => match.cocktail.mocktailSubcategory === subcategory);
}
