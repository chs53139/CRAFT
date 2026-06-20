import type {
  AppliedSubstitution,
  HomemadeAlternative,
  MatchGroup,
  MatchQuality,
} from "@/lib/substitutions/types";

export type Ingredient = {
  id: string;
  name: string;
  category: "spirit" | "liqueur" | "mixer" | "garnish" | "other" | "na-spirit";
};

export type DrinkType = "cocktail" | "mocktail";

export type MocktailSubcategory =
  | "classic-mocktail"
  | "modern-mocktail"
  | "wellness"
  | "party"
  | "coffee"
  | "tea";

export type CocktailIngredient = {
  ingredientId: string;
  amount: string;
};

export type Difficulty = "easy" | "medium" | "hard";

export type CocktailEra =
  | "pre-prohibition"
  | "golden-age"
  | "midcentury"
  | "contemporary"
  | "tiki"
  | "timeless";

export type CocktailCollection =
  | "verified-classic"
  | "hidden-gem"
  | "historical"
  | "tiki"
  | "experimental"
  | "craft-original"
  | "mocktail";

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
  era: CocktailEra;
  collections: CocktailCollection[];
  obscurityScore: number;
  popularityScore: number;
  yearInvented: number;
  regionOfOrigin: string;
  sourceAttribution: string;
  funFact: string;
  method: string;
  tags: string[];
  drinkType: DrinkType;
  mocktailSubcategory?: MocktailSubcategory;
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
  canMakeWithSubstitutions: boolean;
  matchGroup: MatchGroup;
  matchQuality: MatchQuality;
  substitutions: AppliedSubstitution[];
  homemadeSuggestions: HomemadeAlternative[];
};

export type GroupedCocktailMatches = {
  exactMatches: CocktailMatch[];
  availableWithSubstitutions: CocktailMatch[];
  experimentalMatches: CocktailMatch[];
  stillMissing: CocktailMatch[];
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
  movieAppearances?: Array<{
    movie: string;
    year: number;
    note: string;
  }>;
};

export type CocktailReview = {
  id: string;
  cocktailId: string;
  userId?: string;
  rating: number;
  text: string;
  wouldMakeAgain: boolean;
  createdAt: string;
  authorLabel: string;
  isOwn?: boolean;
};

export type CocktailReviewInput = {
  rating: number;
  text: string;
  wouldMakeAgain: boolean;
};

export type CocktailReviewSummary = {
  averageRating: number;
  reviewCount: number;
  wouldMakeAgainPercent: number;
};
