export type Ingredient = {
  id: string;
  name: string;
  category: "spirit" | "liqueur" | "mixer" | "garnish" | "other";
};

export type CocktailIngredient = {
  ingredientId: string;
  amount: string;
};

export type Difficulty = "easy" | "medium" | "hard";

export type CocktailCategory =
  | "Sour"
  | "Spirit-Forward"
  | "Highball"
  | "Spritz"
  | "Champagne Cocktail"
  | "Fizz & Collins"
  | "Flip & Nog"
  | "Tiki"
  | "Punch"
  | "Hot Drink"
  | "Shot"
  | "Other";

export type Cocktail = {
  id: string;
  name: string;
  description: string;
  cheekyLine: string;
  difficulty: Difficulty;
  flavorProfile: string[];
  category: CocktailCategory | string;
  glassware: string;
  garnish: string;
  imageUrl: string;
  ingredients: CocktailIngredient[];
  instructions: string[];
};

export type CocktailMatch = {
  cocktail: Cocktail;
  missing: Ingredient[];
  missingCount: number;
  canMake: boolean;
};

export type IngredientRecommendation = {
  ingredient: Ingredient;
  /** Cocktails newly makeable after buying this bottle */
  unlocksCount: number;
  /** Sample of newly unlocked cocktail names */
  exampleCocktails: string[];
  /** Estimated shelf price (USD, mock data) */
  costUsd: number;
};

export type RawCocktailIngredient = {
  ref: string;
  name: string;
  type: string;
  amount: number | string;
  unit: string;
};

export type RawCocktail = {
  name: string;
  slug: string;
  glass: string;
  family: string;
  method: string;
  tags: string[];
  ingredients: RawCocktailIngredient[];
  garnish: string[];
  preparation: string[];
};
