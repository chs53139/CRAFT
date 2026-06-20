import { getIngredientById } from "@/lib/cocktail-matching";
import {
  MixologistInvention,
  MixologistIngredient,
  StrengthLevel,
  SweetnessLevel,
} from "@/lib/mixologist/types";

type RawAiInvention = {
  name?: string;
  tagline?: string;
  ingredients?: Array<{ ingredientId?: string; amount?: string }>;
  instructions?: string[];
  flavorProfile?: string[];
  sweetness?: string;
  strength?: string;
  method?: string;
  glassware?: string;
  confidence?: number;
  notes?: string;
};

function parseSweetness(value: string | undefined): SweetnessLevel {
  if (value === "dry" || value === "balanced" || value === "sweet") return value;
  return "balanced";
}

function parseStrength(value: string | undefined): StrengthLevel {
  if (value === "low" || value === "medium" || value === "strong") return value;
  return "medium";
}

function clampConfidence(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value)) return 72;
  return Math.min(95, Math.max(55, Math.round(value)));
}

function buildIngredientList(selectedIds: string[]): string {
  return selectedIds
    .map((id) => {
      const ing = getIngredientById(id);
      return `${id}: ${ing?.name ?? id.replace(/-/g, " ")} (${ing?.category ?? "other"})`;
    })
    .join("\n");
}

function normalizeIngredients(
  raw: RawAiInvention["ingredients"],
  allowedIds: Set<string>
): MixologistIngredient[] {
  if (!Array.isArray(raw)) return [];

  const items: MixologistIngredient[] = [];

  for (const item of raw) {
    const ingredientId = item.ingredientId?.trim();
    const amount = item.amount?.trim();
    if (!ingredientId || !amount || !allowedIds.has(ingredientId)) continue;

    const ing = getIngredientById(ingredientId);
    items.push({
      ingredientId,
      name: ing?.name ?? ingredientId.replace(/-/g, " "),
      amount,
    });
  }

  return items;
}

function parseAiJson(content: string): RawAiInvention {
  const parsed = JSON.parse(content) as { drink?: RawAiInvention };
  if (!parsed.drink) {
    throw new Error("AI response missing drink object.");
  }
  return parsed.drink;
}

function finalizeInvention(raw: RawAiInvention, selectedIds: string[]): MixologistInvention {
  const allowedIds = new Set(selectedIds);
  const ingredients = normalizeIngredients(raw.ingredients, allowedIds);

  if (ingredients.length < 2) {
    throw new Error("AI recipe did not use enough valid ingredients.");
  }

  const instructions = (raw.instructions ?? [])
    .map((step) => step.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (instructions.length < 2) {
    throw new Error("AI recipe missing instructions.");
  }

  const flavorProfile = (raw.flavorProfile ?? [])
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 6);

  return {
    source: "original",
    confidence: clampConfidence(raw.confidence),
    name: raw.name?.trim() || "CRAFT Original",
    tagline:
      raw.tagline?.trim() ||
      "An original pour built from your shelf using classic balance principles.",
    ingredients,
    instructions,
    flavorProfile: flavorProfile.length > 0 ? flavorProfile : ["balanced", "original"],
    sweetness: parseSweetness(raw.sweetness),
    strength: parseStrength(raw.strength),
    method: raw.method?.trim() || "Shaken",
    glassware: raw.glassware?.trim() || "Coupe",
    notes: raw.notes?.trim(),
    aiPowered: true,
  };
}

export async function inventDrinkWithOpenAI(selectedIds: string[]): Promise<MixologistInvention> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const ingredientList = buildIngredientList(selectedIds);

  const prompt = `You are a professional mixologist inventing ONE original cocktail using ONLY the ingredients listed below.

Rules:
- Use only ingredient ids from the list. Do not invent new ingredients.
- Follow real cocktail structure (sour ratios, stirred spirit-forward builds, highballs, etc.).
- Prefer 3–5 ingredients. Include sensible measurements (oz, dashes, leaves, etc.).
- Balance sweetness, acidity, and strength intentionally.
- Write clear, professional instructions.

Available ingredients (id: name):
${ingredientList}

Respond with JSON only:
{
  "drink": {
    "name": "",
    "tagline": "",
    "ingredients": [{"ingredientId": "", "amount": ""}],
    "instructions": [""],
    "flavorProfile": ["citrus", "herbal"],
    "sweetness": "dry|balanced|sweet",
    "strength": "low|medium|strong",
    "method": "Shaken|Stirred|Built",
    "glassware": "",
    "confidence": 75,
    "notes": ""
  }
}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.65,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  return finalizeInvention(parseAiJson(content), selectedIds);
}
