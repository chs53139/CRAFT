import { getIngredientById } from "@/lib/cocktail-matching";
import { Cocktail } from "@/lib/types";
import { getSubstitutionRules } from "./catalog";
import { getHomemadeAlternative } from "./homemade";
import {
  AppliedSubstitution,
  HomemadeAlternative,
  IngredientSubstitutionRule,
  MatchQuality,
} from "./types";

const SUBSTITUTION_MIN_CONFIDENCE = 75;
const SUBSTITUTION_AVG_CONFIDENCE = 82;

export function findBestSubstitutionRule(
  requiredId: string,
  barIds: Set<string>
): IngredientSubstitutionRule | undefined {
  if (barIds.has(requiredId)) return undefined;

  const rules = getSubstitutionRules(requiredId);
  for (const rule of rules) {
    if (barIds.has(rule.substituteId)) return rule;
  }

  return undefined;
}

export function findSubstitution(
  requiredId: string,
  availableIds: Set<string>
): string | undefined {
  if (availableIds.has(requiredId)) return requiredId;
  return findBestSubstitutionRule(requiredId, availableIds)?.substituteId;
}

export function canSubstitute(requiredId: string, availableId: string): boolean {
  if (requiredId === availableId) return true;
  return getSubstitutionRules(requiredId).some((rule) => rule.substituteId === availableId);
}

function resolveName(id: string): string {
  return getIngredientById(id)?.name ?? id.replace(/-/g, " ");
}

function ruleToApplied(rule: IngredientSubstitutionRule): AppliedSubstitution {
  return {
    requiredId: rule.originalId,
    requiredName: resolveName(rule.originalId),
    substituteId: rule.substituteId,
    substituteName: resolveName(rule.substituteId),
    confidence: rule.confidence,
    notes: rule.notes,
    flavorImpact: rule.flavorImpact,
  };
}

function homemadeToApplied(item: HomemadeAlternative): AppliedSubstitution {
  return {
    requiredId: item.ingredientId,
    requiredName: resolveName(item.ingredientId),
    substituteId: item.ingredientId,
    substituteName: `${item.name} (homemade)`,
    confidence: item.confidence,
    notes: item.notes,
    flavorImpact: item.flavorImpact,
    isHomemade: true,
    homemadeInstructions: item.instructions,
  };
}

function classifyMatchQuality(substitutions: AppliedSubstitution[]): MatchQuality {
  if (substitutions.length === 0) return "exact";

  const minConfidence = Math.min(...substitutions.map((sub) => sub.confidence));
  const avgConfidence =
    substitutions.reduce((sum, sub) => sum + sub.confidence, 0) / substitutions.length;

  const hasHomemade = substitutions.some((sub) => sub.isHomemade);

  if (
    !hasHomemade &&
    minConfidence >= SUBSTITUTION_MIN_CONFIDENCE &&
    avgConfidence >= SUBSTITUTION_AVG_CONFIDENCE
  ) {
    return "substitution";
  }

  return "experimental";
}

export type SubstitutionMatchResult = {
  missingIds: string[];
  substitutions: AppliedSubstitution[];
  homemadeSuggestions: HomemadeAlternative[];
  canMake: boolean;
  canMakeWithSubstitutions: boolean;
  matchQuality: MatchQuality;
};

export function matchCocktailWithSubstitutions(
  cocktail: Cocktail,
  barIds: string[]
): SubstitutionMatchResult {
  const barSet = new Set(barIds);
  const substitutions: AppliedSubstitution[] = [];
  const missingIds: string[] = [];
  const homemadeSuggestions: HomemadeAlternative[] = [];

  for (const item of cocktail.ingredients) {
    const requiredId = item.ingredientId;

    if (barSet.has(requiredId)) continue;

    const rule = findBestSubstitutionRule(requiredId, barSet);
    if (rule) {
      substitutions.push(ruleToApplied(rule));
      continue;
    }

    missingIds.push(requiredId);

    const homemade = getHomemadeAlternative(requiredId);
    if (homemade) homemadeSuggestions.push(homemade);
  }

  const canMake = missingIds.length === 0 && substitutions.length === 0;
  let canMakeWithSubstitutions = missingIds.length === 0 && substitutions.length > 0;

  // Homemade-only path: all gaps are DIY-able pantry builds (always experimental)
  if (
    !canMake &&
    !canMakeWithSubstitutions &&
    missingIds.length > 0 &&
    missingIds.every((id) => getHomemadeAlternative(id))
  ) {
    canMakeWithSubstitutions = true;
    for (const id of missingIds) {
      const homemade = getHomemadeAlternative(id);
      if (homemade) substitutions.push(homemadeToApplied(homemade));
    }
    missingIds.length = 0;
  }

  const matchQuality = canMake
    ? "exact"
    : canMakeWithSubstitutions
      ? classifyMatchQuality(substitutions)
      : "unavailable";

  return {
    missingIds,
    substitutions,
    homemadeSuggestions,
    canMake,
    canMakeWithSubstitutions,
    matchQuality,
  };
}

export function getMatchQualityLabel(quality: MatchQuality): string | null {
  if (quality === "exact") return "Exact Match";
  if (quality === "substitution") return "Substitution Available";
  if (quality === "experimental") return "Experimental";
  return null;
}

export { SUBSTITUTION_MIN_CONFIDENCE, SUBSTITUTION_AVG_CONFIDENCE };
