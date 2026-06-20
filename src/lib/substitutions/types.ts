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

export const LOW_CONFIDENCE_THRESHOLD = 70;

export type AppliedSubstitution = {
  requiredId: string;
  requiredName: string;
  substituteId: string;
  substituteName: string;
  confidence: number;
  notes: string;
  flavorImpact: string;
  lowConfidence: boolean;
  isHomemade?: boolean;
  homemadeInstructions?: string[];
};

/** Primary grouping for cocktail match results */
export type MatchGroup = "exact" | "substitution" | "missing";

export type MatchQuality = MatchGroup | "unavailable";

export const MATCH_GROUP_LABELS: Record<MatchGroup, string> = {
  exact: "Exact Matches",
  substitution: "Available With Substitutions",
  missing: "Still Missing Ingredients",
};

export const MATCH_QUALITY_LABELS: Record<Exclude<MatchQuality, "unavailable">, string> = {
  exact: "Exact Match",
  substitution: "Substitution Available",
  missing: "Still Missing",
};
