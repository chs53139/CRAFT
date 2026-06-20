import { getIngredientById } from "@/lib/cocktail-matching";
import { getEffectiveBarIds, isHouseStaple } from "@/lib/inventory-tiers";
import { Cocktail } from "@/lib/types";
import { getSubstitutionRules } from "./catalog";
import { getHomemadeAlternative } from "./homemade";
import {
  AppliedSubstitution,
  HomemadeAlternative,
  IngredientSubstitutionRule,
  LOW_CONFIDENCE_THRESHOLD,
  MatchGroup,
  MatchQuality,
} from "./types";

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
    lowConfidence: rule.confidence < LOW_CONFIDENCE_THRESHOLD,
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
    lowConfidence: item.confidence < LOW_CONFIDENCE_THRESHOLD,
    isHomemade: true,
    homemadeInstructions: item.instructions,
  };
}

function classifySubstitutionGroup(substitutions: AppliedSubstitution[]): MatchGroup {
  return substitutions.some((sub) => sub.lowConfidence || sub.isHomemade)
    ? "experimental"
    : "substitution";
}

export type SubstitutionMatchResult = {
  missingIds: string[];
  substitutions: AppliedSubstitution[];
  homemadeSuggestions: HomemadeAlternative[];
  canMake: boolean;
  canMakeWithSubstitutions: boolean;
  matchGroup: MatchGroup;
  matchQuality: MatchQuality;
};

/**
 * Match a cocktail against the user's bar:
 * 1. Exact — ingredient is in the bar
 * 2. Substitution — missing ingredient covered by an owned substitute (confidence ≥ 70%)
 * 3. Experimental — low-confidence swaps or homemade-only pantry builds
 * 4. Missing — still lacks ingredients after substitution checks
 */
export function matchCocktailWithSubstitutions(
  cocktail: Cocktail,
  barIds: string[]
): SubstitutionMatchResult {
  const barSet = new Set(getEffectiveBarIds(barIds));
  const substitutions: AppliedSubstitution[] = [];
  const missingIds: string[] = [];
  const homemadeSuggestions: HomemadeAlternative[] = [];

  for (const item of cocktail.ingredients) {
    const requiredId = item.ingredientId;

    if (isHouseStaple(requiredId) || barSet.has(requiredId)) continue;

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
  let matchGroup: MatchGroup;

  if (canMake) {
    matchGroup = "exact";
  } else if (canMakeWithSubstitutions) {
    matchGroup = classifySubstitutionGroup(substitutions);
  } else if (
    missingIds.length > 0 &&
    missingIds.every((id) => getHomemadeAlternative(id))
  ) {
    canMakeWithSubstitutions = true;
    matchGroup = "experimental";
    for (const id of missingIds) {
      const homemade = getHomemadeAlternative(id);
      if (homemade) substitutions.push(homemadeToApplied(homemade));
    }
    missingIds.length = 0;
  } else {
    matchGroup = "missing";
  }

  const matchQuality: MatchQuality = matchGroup === "missing" ? "unavailable" : matchGroup;

  return {
    missingIds,
    substitutions,
    homemadeSuggestions,
    canMake,
    canMakeWithSubstitutions,
    matchGroup,
    matchQuality,
  };
}

export function getMatchQualityLabel(quality: MatchQuality): string | null {
  if (quality === "exact") return "Exact Match";
  if (quality === "substitution") return "Substitution";
  if (quality === "experimental") return "Experimental";
  if (quality === "missing") return "Still Missing";
  return null;
}

export { LOW_CONFIDENCE_THRESHOLD };
