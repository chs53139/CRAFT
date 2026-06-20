import { cocktails, getCocktailById } from "@/lib/cocktail-matching";
import { Cocktail } from "@/lib/types";
import { BarPersonality, TasteProfile, TasteVector } from "./types";

const FAVORITE_WEIGHT = 3;
const RECENT_WEIGHT = 2;

const PERSONALITY_RULES: Array<{
  tags: string[];
  label: string;
  description: string;
}> = [
  {
    tags: ["bitter", "spirit-forward", "herbal"],
    label: "Bitter Romantic",
    description: "You lean stirred, bitter, and spirit-forward — Negroni country.",
  },
  {
    tags: ["citrus", "bright", "refreshing"],
    label: "Citrus Explorer",
    description: "Bright, shaken, and sessionable — your bar lives in the sour lane.",
  },
  {
    tags: ["tropical", "fruity", "party"],
    label: "Tropical Maximalist",
    description: "Big flavors, big garnishes — tiki energy without apology.",
  },
  {
    tags: ["spirit-forward", "bold", "stirred"],
    label: "Spirit Purist",
    description: "Less fuss, more proof — you trust the bottle to do the talking.",
  },
  {
    tags: ["herbal", "balanced", "easy-drinking"],
    label: "Balanced Host",
    description: "Crowd-pleasing pours with enough craft to impress quietly.",
  },
];

function accumulateVector(target: TasteVector, source: TasteVector, weight: number) {
  for (const [tag, value] of Object.entries(source)) {
    target[tag] = (target[tag] ?? 0) + value * weight;
  }
}

function cocktailToVector(cocktail: Cocktail): TasteVector {
  const vector: TasteVector = {};
  for (const tag of cocktail.flavorProfile) {
    vector[tag] = (vector[tag] ?? 0) + 1;
  }
  if (cocktail.category) {
    vector[cocktail.category.toLowerCase()] = (vector[cocktail.category.toLowerCase()] ?? 0) + 0.5;
  }
  return vector;
}

function normalizeVector(vector: TasteVector): TasteVector {
  const max = Math.max(...Object.values(vector), 1);
  const normalized: TasteVector = {};
  for (const [tag, value] of Object.entries(vector)) {
    normalized[tag] = Math.round((value / max) * 100) / 100;
  }
  return normalized;
}

function inferStrengthPreference(cocktailsList: Cocktail[]): "low" | "medium" | "high" {
  if (cocktailsList.length === 0) return "medium";

  let score = 0;
  for (const cocktail of cocktailsList) {
    if (
      cocktail.category === "Spirit-Forward" ||
      cocktail.flavorProfile.includes("spirit-forward") ||
      cocktail.flavorProfile.includes("bold")
    ) {
      score += 2;
    } else if (
      cocktail.category === "Highball" ||
      cocktail.category === "Spritz" ||
      cocktail.drinkType === "mocktail"
    ) {
      score -= 1;
    }
  }

  const avg = score / cocktailsList.length;
  if (avg >= 1.2) return "high";
  if (avg <= -0.2) return "low";
  return "medium";
}

function inferPersonality(vector: TasteVector): BarPersonality {
  let best = PERSONALITY_RULES[PERSONALITY_RULES.length - 1];
  let bestScore = 0;

  for (const rule of PERSONALITY_RULES) {
    const score = rule.tags.reduce((sum, tag) => sum + (vector[tag] ?? 0), 0);
    if (score > bestScore) {
      bestScore = score;
      best = rule;
    }
  }

  if (bestScore === 0) {
    return {
      label: "Curious Pourer",
      description: "Still learning your lane — keep rating and favoriting to sharpen CRAFT's read.",
    };
  }

  return { label: best.label, description: best.description };
}

export function scoreTasteFit(cocktail: Cocktail, vector: TasteVector): number {
  if (Object.keys(vector).length === 0) return 0.5;

  const cocktailVector = cocktailToVector(cocktail);
  const tags = new Set([...Object.keys(vector), ...Object.keys(cocktailVector)]);
  let dot = 0;
  let magA = 0;
  let magB = 0;

  for (const tag of tags) {
    const a = vector[tag] ?? 0;
    const b = cocktailVector[tag] ?? 0;
    dot += a * b;
    magA += a * a;
    magB += b * b;
  }

  if (magA === 0 || magB === 0) return 0.5;
  return Math.round((dot / (Math.sqrt(magA) * Math.sqrt(magB))) * 100) / 100;
}

export function buildTasteProfile(input: {
  favoriteIds: string[];
  recentIds: string[];
}): TasteProfile | null {
  const raw: TasteVector = {};
  const engaged: Cocktail[] = [];
  const seen = new Set<string>();

  for (const id of input.favoriteIds) {
    const cocktail = getCocktailById(id);
    if (!cocktail || seen.has(id)) continue;
    seen.add(id);
    engaged.push(cocktail);
    accumulateVector(raw, cocktailToVector(cocktail), FAVORITE_WEIGHT);
  }

  input.recentIds.forEach((id, index) => {
    const cocktail = getCocktailById(id);
    if (!cocktail) return;
    if (!seen.has(id)) {
      seen.add(id);
      engaged.push(cocktail);
    }
    const recencyBoost = 1 + (input.recentIds.length - index) / input.recentIds.length;
    accumulateVector(raw, cocktailToVector(cocktail), RECENT_WEIGHT * recencyBoost);
  });

  if (engaged.length === 0) return null;

  const vector = normalizeVector(raw);
  const dominantFlavors = Object.entries(vector)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([tag]) => tag);

  const avgObscurity =
    engaged.reduce((sum, c) => sum + c.obscurityScore, 0) / engaged.length;

  const explored = new Set([...input.favoriteIds, ...input.recentIds]).size;
  const discoveryScore = Math.min(
    100,
    Math.round((explored / Math.max(cocktails.length * 0.05, 1)) * 100)
  );

  return {
    vector,
    dominantFlavors,
    strengthPreference: inferStrengthPreference(engaged),
    adventurousnessScore: Math.min(100, Math.round(avgObscurity)),
    discoveryScore,
    personality: inferPersonality(vector),
    signalCount: engaged.length,
  };
}
