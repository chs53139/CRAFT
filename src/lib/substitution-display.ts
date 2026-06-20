import { AppliedSubstitution } from "@/lib/substitutions/types";
import { CocktailMatch } from "@/lib/types";

export type SubstitutionMode = "exact-only" | "include-substitutions" | "experimental-allowed";

export const SUBSTITUTION_MODE_LABELS: Record<SubstitutionMode, string> = {
  "exact-only": "Exact only",
  "include-substitutions": "Include substitutions",
  "experimental-allowed": "Bold swaps allowed",
};

export function formatSubstitutionLine(sub: AppliedSubstitution): string {
  return `Using ${sub.substituteName} instead of ${sub.requiredName}`;
}

export function getSubstitutionConfidence(match: CocktailMatch): number | null {
  if (match.substitutions.length === 0) return null;
  return Math.min(...match.substitutions.map((sub) => sub.confidence));
}

export function isMakeableMatch(match: CocktailMatch): boolean {
  return match.matchGroup === "exact" || match.matchGroup === "substitution" || match.matchGroup === "experimental";
}

export function matchPassesSubstitutionMode(
  match: CocktailMatch,
  mode: SubstitutionMode
): boolean {
  if (match.matchGroup === "missing") return true;

  if (mode === "exact-only") {
    return match.matchGroup === "exact";
  }

  if (mode === "include-substitutions") {
    return match.matchGroup === "exact" || match.matchGroup === "substitution";
  }

  return isMakeableMatch(match);
}

export function filterMakeableMatches(
  matches: CocktailMatch[],
  mode: SubstitutionMode
): CocktailMatch[] {
  return matches.filter((match) => matchPassesSubstitutionMode(match, mode));
}
