export type MixologistSource = "existing" | "variation" | "original";

export type SweetnessLevel = "dry" | "balanced" | "sweet";
export type StrengthLevel = "low" | "medium" | "strong";

export type MixologistIngredient = {
  ingredientId: string;
  name: string;
  amount: string;
  substituted?: boolean;
  originalName?: string;
};

export type MixologistInvention = {
  source: MixologistSource;
  confidence: number;
  name: string;
  tagline: string;
  ingredients: MixologistIngredient[];
  instructions: string[];
  flavorProfile: string[];
  sweetness: SweetnessLevel;
  strength: StrengthLevel;
  method: string;
  glassware: string;
  cocktailId?: string;
  basedOn?: string;
  notes?: string;
};

export type InventDrinkRequest = {
  ingredientIds: string[];
};

export type InventDrinkResponse = {
  invention: MixologistInvention | null;
  message?: string;
};
