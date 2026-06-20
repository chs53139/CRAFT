export {
  SUBSTITUTION_CATALOG,
  getSubstitutionRules,
} from "./catalog";
export {
  canSubstitute,
  findBestSubstitutionRule,
  findSubstitution,
  getMatchQualityLabel,
  matchCocktailWithSubstitutions,
} from "./engine";
export { getHomemadeAlternative, HOMEMADE_ALTERNATIVES } from "./homemade";
export type {
  AppliedSubstitution,
  HomemadeAlternative,
  IngredientSubstitutionRule,
  MatchGroup,
  MatchQuality,
} from "./types";
export {
  LOW_CONFIDENCE_THRESHOLD,
  MATCH_GROUP_LABELS,
  MATCH_QUALITY_LABELS,
} from "./types";
export {
  isBarSubstitution,
  isHomemadeSubstitution,
  substitutions,
  type IngredientSubstitution,
} from "@/data/substitutions";
