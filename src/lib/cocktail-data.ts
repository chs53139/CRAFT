import rawCocktails from "@/data/cocktails.json";
import cocktailsExpanded from "@/data/cocktails-expanded.json";
import craftOriginals from "@/data/craft-originals.json";
import mocktails from "@/data/mocktails.json";
import { enrichCocktail } from "@/lib/cocktail-enrichment";
import { getCocktailImageUrl } from "@/lib/cocktail-images";
import { isGenericDescription } from "@/lib/description-quality";
import { inferDrinkType, inferMocktailSubcategory } from "@/lib/drink-type";
import {
  Cocktail,
  CocktailCategory,
  Difficulty,
  Ingredient,
  RawCocktail,
} from "@/lib/types";

const SOURCE = dedupeBySlug([
  ...(rawCocktails as RawCocktail[]),
  ...(cocktailsExpanded as RawCocktail[]),
  ...(craftOriginals as RawCocktail[]),
  ...(mocktails as RawCocktail[]),
]);

/** Later sources override earlier entries with the same slug */
function dedupeBySlug(cocktails: RawCocktail[]): RawCocktail[] {
  const map = new Map<string, RawCocktail>();
  for (const cocktail of cocktails) {
    map.set(cocktail.slug, cocktail);
  }
  return [...map.values()];
}

const familyFlavors: Record<string, string[]> = {
  Sour: ["citrus", "bright", "balanced"],
  "Spirit-Forward": ["spirit-forward", "bold", "stirred"],
  Highball: ["refreshing", "long", "easy-drinking"],
  Spritz: ["bubbly", "bitter", "aperitif"],
  "Champagne Cocktail": ["elegant", "bubbly", "celebratory"],
  "Fizz & Collins": ["fizzy", "citrus", "refreshing"],
  "Flip & Nog": ["rich", "creamy", "dessert"],
  Tiki: ["tropical", "complex", "fruity"],
  Punch: ["sharing", "fruity", "party"],
  "Hot Drink": ["warm", "cozy", "spiced"],
  Shot: ["strong", "quick", "bold"],
  Other: ["classic", "versatile"],
};

function mapIngredientType(type: string): Ingredient["category"] {
  switch (type) {
    case "spirit":
      return "spirit";
    case "na-spirit":
      return "na-spirit";
    case "liqueur":
    case "fortified-wine":
    case "wine":
      return "liqueur";
    case "juice":
    case "mixer":
    case "beer-cider":
      return "mixer";
    case "syrup":
    case "bitters":
    case "produce":
    case "dairy-egg":
      return "pantry";
    default:
      return "other";
  }
}

function formatAmount(amount: number | string, unit: string): string {
  if (typeof amount === "string") return amount;
  if (unit === "ml") {
    const oz = amount / 30;
    if (Math.abs(oz - Math.round(oz * 4) / 4) < 0.05) {
      const rounded = Math.round(oz * 100) / 100;
      return `${rounded} oz`;
    }
    return `${amount} ml`;
  }
  if (unit === "dash" || unit === "dashes") {
    return `${amount} dash${amount === 1 ? "" : "es"}`;
  }
  if (unit === "drop" || unit === "drops") {
    return `${amount} drop${amount === 1 ? "" : "s"}`;
  }
  if (unit === "piece" || unit === "pieces" || unit === "slice" || unit === "slices") {
    return `${amount} ${unit}`;
  }
  return `${amount} ${unit}`;
}

function inferDifficulty(cocktail: RawCocktail): Difficulty {
  const method = cocktail.method.toLowerCase();
  const count = cocktail.ingredients.length;
  const steps = cocktail.preparation.length;

  if (
    method.includes("layer") ||
    method.includes("blend") ||
    count >= 8 ||
    steps >= 6
  ) {
    return "hard";
  }
  if (count >= 5 || steps >= 4 || method.includes("muddle")) {
    return "medium";
  }
  return "easy";
}

function inferFlavorProfile(cocktail: RawCocktail): string[] {
  const base = familyFlavors[cocktail.family] ?? familyFlavors.Other;
  const extras = new Set(base);

  for (const tag of cocktail.tags) {
    if (tag !== "classic" && tag !== "modern") extras.add(tag);
  }

  for (const ing of cocktail.ingredients) {
    if (ing.type === "bitters") extras.add("bitter");
    if (ing.type === "juice") extras.add("citrus");
    if (ing.ref.includes("ginger")) extras.add("spicy");
    if (ing.ref.includes("mint")) extras.add("herbal");
  }

  return [...extras].slice(0, 4);
}

export function buildIngredientsFromCocktails(cocktails: RawCocktail[]): Ingredient[] {
  const map = new Map<string, Ingredient>();

  for (const cocktail of cocktails) {
    for (const ing of cocktail.ingredients) {
      if (!map.has(ing.ref)) {
        map.set(ing.ref, {
          id: ing.ref,
          name: ing.name,
          category: mapIngredientType(ing.type),
        });
      }
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function catalogueDescriptionFromFunFact(funFact: string | undefined, maxLen = 220): string | null {
  if (!funFact?.trim()) return null;
  if (isGenericDescription(funFact)) return null;
  const sentences = funFact.match(/[^.!?]+[.!?]+/g)?.map((s) => s.trim()) ?? [funFact.trim()];
  const lead = sentences.slice(0, 2).join(" ").trim();
  if (lead.length < 20) return null;
  return lead.length > maxLen ? `${lead.slice(0, maxLen - 1)}…` : lead;
}

function buildCatalogueDescription(
  raw: RawCocktail,
  enriched: ReturnType<typeof enrichCocktail>,
  drinkType: "cocktail" | "mocktail"
): string {
  const fromFact = catalogueDescriptionFromFunFact(enriched.funFact);
  if (fromFact) return fromFact;

  if (drinkType === "mocktail") {
    return `${raw.name} — zero-proof ${raw.method.toLowerCase()} with ${raw.ingredients
      .slice(0, 3)
      .map((item) => item.name)
      .join(", ")}.`;
  }

  return "";
}

export function transformCocktail(raw: RawCocktail): Cocktail {
  const enriched = enrichCocktail(raw, SOURCE);
  const drinkType = inferDrinkType(raw);
  const mocktailSubcategory = inferMocktailSubcategory(raw);

  return {
    id: raw.slug,
    name: raw.name,
    description: buildCatalogueDescription(raw, enriched, drinkType),
    difficulty: inferDifficulty(raw),
    flavorProfile: inferFlavorProfile(raw),
    category: raw.family as CocktailCategory,
    era: enriched.era,
    collections: enriched.collections,
    obscurityScore: enriched.obscurityScore,
    popularityScore: enriched.popularityScore,
    yearInvented: enriched.yearInvented,
    regionOfOrigin: enriched.regionOfOrigin,
    sourceAttribution: enriched.sourceAttribution,
    funFact: enriched.funFact,
    method: enriched.method,
    tags: enriched.tags,
    drinkType,
    mocktailSubcategory,
    glassware: raw.glass,
    garnish: raw.garnish.length > 0 ? raw.garnish.join(", ") : "None",
    imageUrl: getCocktailImageUrl(raw.slug),
    ingredients: raw.ingredients.map((ing) => ({
      ingredientId: ing.ref,
      amount: formatAmount(ing.amount, ing.unit),
    })),
    instructions: raw.preparation,
  };
}

export const cocktails: Cocktail[] = SOURCE.map(transformCocktail);
export const ingredients: Ingredient[] = buildIngredientsFromCocktails(SOURCE);

export const cocktailCount = cocktails.length;
export const mocktailCount = cocktails.filter((c) => c.drinkType === "mocktail").length;
export const alcoholicCount = cocktailCount - mocktailCount;
