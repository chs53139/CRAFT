import { canonicalIngredientId } from "@/lib/ingredient-intelligence";
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

  if (Object.hasOwn(SPIRIT_SEARCH_TERMS, normalized)) return normalized;
  if (["lemon", "lime", "mint"].includes(normalized)) return normalized;
  const canonical = canonicalIngredientId(normalized);
  const exact = ingredientByName.get(canonical.replace(/-/g, " "));
  if (exact) return exact;
  if (Object.hasOwn(INGREDIENT_ALIASES, normalized)) return normalized;
  return null;
}

export type ParsedIngredientQuery = {
  freeText: string;
  includeIngredientIds: string[];
  excludeIngredientIds: string[];
};

const SPLIT = /\s*[+,&]\s*|\s+(?:and|with)\s+/i;
const WITHOUT = /\b(?:without|exclude|no|minus)\s+/i;

export function parseIngredientQuery(raw: string): ParsedIngredientQuery {
  const [positive, ...negative] = raw.trim().split(WITHOUT);
  const working = positive.trim();
  const excludeIngredientIds = negative.flatMap((chunk) => chunk.split(SPLIT)).map(resolveIngredientToken).filter((id): id is string => Boolean(id));
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

  const family = Object.hasOwn(SPIRIT_SEARCH_TERMS, ingredientId) ? SPIRIT_SEARCH_TERMS[ingredientId] : [];
  const aliases = Object.hasOwn(INGREDIENT_ALIASES, ingredientId) ? INGREDIENT_ALIASES[ingredientId] : [];
  return cocktail.ingredients.some((ing) => [...family, ...aliases].includes(canonicalIngredientId(ing.ingredientId)));
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
