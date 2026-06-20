export type IngredientSubstitutionRule = {
  originalId: string;
  substituteId: string;
  confidence: number;
  notes: string;
  flavorImpact: string;
};

export type HomemadeAlternative = {
  ingredientId: string;
  name: string;
  confidence: number;
  notes: string;
  flavorImpact: string;
  instructions: string[];
};

export type AppliedSubstitution = {
  requiredId: string;
  requiredName: string;
  substituteId: string;
  substituteName: string;
  confidence: number;
  notes: string;
  flavorImpact: string;
  isHomemade?: boolean;
  homemadeInstructions?: string[];
};

export type MatchQuality = "exact" | "substitution" | "experimental" | "unavailable";

export const MATCH_QUALITY_LABELS: Record<Exclude<MatchQuality, "unavailable">, string> = {
  exact: "Exact Match",
  substitution: "Substitution Available",
  experimental: "Experimental",
};
