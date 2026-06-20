import {
  isBarSubstitution,
  substitutions,
} from "@/data/substitutions";
import { IngredientSubstitutionRule } from "./types";

/** Bar-to-bar substitution rules derived from curated data */
export const SUBSTITUTION_CATALOG: IngredientSubstitutionRule[] = substitutions
  .filter(isBarSubstitution)
  .map((sub) => ({
    originalId: sub.missingIngredient,
    substituteId: sub.substituteIngredient,
    confidence: sub.confidenceScore,
    notes: sub.notes,
    flavorImpact: sub.flavorImpact,
  }));

const substitutionsByOriginal = new Map<string, IngredientSubstitutionRule[]>();

for (const rule of SUBSTITUTION_CATALOG) {
  const list = substitutionsByOriginal.get(rule.originalId) ?? [];
  list.push(rule);
  substitutionsByOriginal.set(rule.originalId, list);
}

for (const list of substitutionsByOriginal.values()) {
  list.sort((a, b) => b.confidence - a.confidence);
}

export function getSubstitutionRules(originalId: string): IngredientSubstitutionRule[] {
  return substitutionsByOriginal.get(originalId) ?? [];
}
