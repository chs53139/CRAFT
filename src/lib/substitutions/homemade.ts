import {
  isHomemadeSubstitution,
  substitutions,
} from "@/data/substitutions";
import { HomemadeAlternative } from "./types";

function resolveName(id: string): string {
  return id
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const HOMEMADE_ALTERNATIVES: HomemadeAlternative[] = substitutions
  .filter(isHomemadeSubstitution)
  .map((sub) => ({
    ingredientId: sub.missingIngredient,
    name: resolveName(sub.missingIngredient),
    confidence: sub.confidenceScore,
    notes: sub.notes,
    flavorImpact: sub.flavorImpact,
    instructions: sub.homemadeInstructions ?? [],
  }));

const homemadeMap = new Map(HOMEMADE_ALTERNATIVES.map((item) => [item.ingredientId, item]));

export function getHomemadeAlternative(ingredientId: string): HomemadeAlternative | undefined {
  return homemadeMap.get(ingredientId);
}
