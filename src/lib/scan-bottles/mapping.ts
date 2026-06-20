import { ingredients } from "@/lib/cocktail-data";
import { Ingredient } from "@/lib/types";
import { RawVisionDetection, ScanDetection } from "./types";

const REVIEW_THRESHOLD = 0.72;

const ingredientById = new Map(ingredients.map((ing) => [ing.id, ing]));

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value: string): string[] {
  return normalize(value)
    .split(" ")
    .filter((token) => token.length > 1);
}

function scoreMatch(query: string, ingredient: Ingredient): number {
  const q = normalize(query);
  const name = normalize(ingredient.name);
  const id = normalize(ingredient.id.replace(/-/g, " "));

  if (!q) return 0;
  if (q === name || q === id) return 1;
  if (name.includes(q) || q.includes(name)) return 0.92;
  if (id.includes(q) || q.includes(id)) return 0.88;

  const qTokens = tokenize(query);
  const nameTokens = tokenize(ingredient.name);
  const idTokens = tokenize(ingredient.id.replace(/-/g, " "));

  if (qTokens.length === 0) return 0;

  const overlap = qTokens.filter(
    (token) => nameTokens.includes(token) || idTokens.includes(token)
  ).length;

  return overlap / qTokens.length;
}

export function findBestIngredientMatch(
  bottleName: string,
  likelyCategory?: string
): { ingredient: Ingredient | null; confidence: number } {
  const categoryHint = likelyCategory ? normalize(likelyCategory) : "";
  let best: Ingredient | null = null;
  let bestScore = 0;

  for (const ingredient of ingredients) {
    let score = scoreMatch(bottleName, ingredient);

    if (categoryHint) {
      const category = normalize(ingredient.category);
      if (categoryHint.includes(category) || category.includes(categoryHint)) {
        score += 0.08;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      best = ingredient;
    }
  }

  if (!best || bestScore < 0.45) {
    return { ingredient: null, confidence: bestScore };
  }

  return { ingredient: best, confidence: Math.min(bestScore, 1) };
}

export function buildIngredientCatalogForPrompt(): string {
  return ingredients
    .map((ing) => `${ing.id}: ${ing.name} (${ing.category})`)
    .join("\n");
}

export function finalizeDetection(raw: RawVisionDetection): ScanDetection {
  const likelyCategory = raw.likelyCategory?.trim() || "unknown";
  const suggested = raw.suggestedIngredientId?.trim() || null;
  const suggestedIngredient = suggested ? ingredientById.get(suggested) : null;

  let mappedIngredient = suggestedIngredient ?? null;
  let confidence = raw.confidence ?? 0.5;

  if (mappedIngredient) {
    confidence = Math.max(confidence, 0.78);
  } else {
    const match = findBestIngredientMatch(raw.detectedBottleName, likelyCategory);
    mappedIngredient = match.ingredient;
    confidence = Math.max(confidence, match.confidence);
  }

  const needsReview =
    !mappedIngredient ||
    confidence < REVIEW_THRESHOLD ||
    !!raw.notes?.toLowerCase().includes("uncertain") ||
    !!raw.notes?.toLowerCase().includes("partial");

  return {
    detectedBottleName: raw.detectedBottleName.trim(),
    likelyCategory,
    mappedIngredientId: mappedIngredient?.id ?? null,
    mappedIngredientName: mappedIngredient?.name ?? null,
    confidence: Math.round(confidence * 100) / 100,
    needsReview,
    notes: raw.notes?.trim() || undefined,
  };
}

export function finalizeDetections(rawItems: RawVisionDetection[]): ScanDetection[] {
  const seen = new Set<string>();

  return rawItems
    .map(finalizeDetection)
    .filter((item) => {
      const key = item.mappedIngredientId ?? item.detectedBottleName.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}
