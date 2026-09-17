import { ingredients } from "@/lib/cocktail-data";
import { INGREDIENT_ALIASES, SPIRIT_SEARCH_TERMS } from "@/lib/cocktail-search";
import { CocktailMatch } from "@/lib/types";

const ingredientByName = new Map<string, string>();
for (const ing of ingredients) {
  ingredientByName.set(ing.name.toLowerCase(), ing.id);
  ingredientByName.set(ing.id.replace(/-/g, " "), ing.id);
}

function resolveIngredientToken(token: string): string | null {
  const normalized = token.toLowerCase().trim().replace(/\s+/g, " ");
  if (!normalized) return null;

  if (ingredientByName.has(normalized)) {
    return ingredientByName.get(normalized)!;
  }

  for (const [spirit, ids] of Object.entries(SPIRIT_SEARCH_TERMS)) {
    if (normalized === spirit || normalized.includes(spirit)) {
      return ids[0] ?? spirit;
    }
  }

  for (const [alias, ids] of Object.entries(INGREDIENT_ALIASES)) {
    if (normalized === alias || normalized.includes(alias)) {
      return ids[0] ?? null;
    }
  }

  const partial = ingredients.find(
    (ing) =>
      ing.name.toLowerCase().includes(normalized) ||
      ing.id.replace(/-/g, " ").includes(normalized)
  );
  return partial?.id ?? null;
}

export type ParsedIngredientQuery = {
  freeText: string;
  includeIngredientIds: string[];
  excludeIngredientIds: string[];
};

const SPLIT = /\s+(?:\+|and|&|,)\s+/i;
const WITHOUT = /\b(?:without|exclude|no|minus)\s+([^+]+)/gi;

export function parseIngredientQuery(raw: string): ParsedIngredientQuery {
  let working = raw.trim();
  const excludeIngredientIds: string[] = [];
  let match;

  while ((match = WITHOUT.exec(working)) !== null) {
    const chunk = match[1]?.trim();
    if (chunk) {
      const id = resolveIngredientToken(chunk);
      if (id) excludeIngredientIds.push(id);
    }
  }

  working = working.replace(WITHOUT, " ").trim();

  const parts = working
    .split(SPLIT)
    .map((p) => p.trim())
    .filter(Boolean);

  const includeIngredientIds: string[] = [];
  const freeTextParts: string[] = [];

  for (const part of parts) {
    const id = resolveIngredientToken(part);
    if (id && part.length < 40) {
      includeIngredientIds.push(id);
    } else {
      freeTextParts.push(part);
    }
  }

  if (includeIngredientIds.length === 0 && parts.length <= 1) {
    const single = resolveIngredientToken(working);
    if (single && working.length < 32) {
      return {
        freeText: "",
        includeIngredientIds: [single],
        excludeIngredientIds: [...new Set(excludeIngredientIds)],
      };
    }
  }

  return {
    freeText: freeTextParts.join(" ").trim() || (includeIngredientIds.length ? "" : working),
    includeIngredientIds: [...new Set(includeIngredientIds)],
    excludeIngredientIds: [...new Set(excludeIngredientIds)],
  };
}

function ingredientPresent(cocktail: CocktailMatch["cocktail"], ingredientId: string): boolean {
  if (cocktail.ingredients.some((ing) => ing.ingredientId === ingredientId)) {
    return true;
  }

  for (const [spirit, ids] of Object.entries(SPIRIT_SEARCH_TERMS)) {
    if (spirit === ingredientId || ids.includes(ingredientId)) {
      return cocktail.ingredients.some((ing) => ids.includes(ing.ingredientId));
    }
  }

  return false;
}

export function filterMatchesByIngredientQuery(
  matches: CocktailMatch[],
  query: ParsedIngredientQuery
): CocktailMatch[] {
  return matches.filter(({ cocktail }) => {
    for (const id of query.excludeIngredientIds) {
      if (ingredientPresent(cocktail, id)) return false;
    }
    for (const id of query.includeIngredientIds) {
      if (!ingredientPresent(cocktail, id)) return false;
    }
    return true;
  });
}
