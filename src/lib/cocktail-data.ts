import rawCocktails from "@/data/cocktails.json";
import craftOriginals from "@/data/craft-originals.json";
import { enrichCocktail } from "@/lib/cocktail-enrichment";
import { getCocktailImageUrl } from "@/lib/cocktail-images";
import {
  Cocktail,
  CocktailCategory,
  Difficulty,
  Ingredient,
  RawCocktail,
} from "@/lib/types";

const SOURCE = [...(rawCocktails as RawCocktail[]), ...(craftOriginals as RawCocktail[])];

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

const familyDescriptions: Record<string, string> = {
  Sour: "Sharp citrus meets spirit. Clean and confident.",
  "Spirit-Forward": "Booze first. Conversation second.",
  Highball: "Tall, cold, and dangerously easy.",
  Spritz: "Light, bitter, and unreasonably chic.",
  "Champagne Cocktail": "Bubbles with intention.",
  "Fizz & Collins": "Fizzed up and ready to party.",
  "Flip & Nog": "Rich enough to apologize for nothing.",
  Tiki: "Umbrella optional. Regret unlikely.",
  Punch: "Made for a crowd. Or a very honest Tuesday.",
  "Hot Drink": "Warm hands, good decisions pending.",
  Shot: "Short glass. Long story.",
  Other: "Doesn't fit a box. Still belongs on your bar.",
};

const cheekyLines = [
  "Your bar approves this message.",
  "Trust the process. And the pour.",
  "Classy on paper. Fun in the glass.",
  "One round closer to legendary.",
  "The recipe said 'optional.' We say 'required.'",
];

function mapIngredientType(type: string): Ingredient["category"] {
  switch (type) {
    case "spirit":
      return "spirit";
    case "liqueur":
    case "fortified-wine":
    case "wine":
      return "liqueur";
    case "juice":
    case "syrup":
    case "mixer":
    case "beer-cider":
    case "dairy-egg":
      return "mixer";
    case "produce":
      return "garnish";
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

function inferCheekyLine(cocktail: RawCocktail, index: number): string {
  if (cocktail.tags.includes("tiki")) return "Vacation mode: activated.";
  if (cocktail.family === "Shot") return "Bottoms up. Top off your dignity later.";
  if (cocktail.method.toLowerCase().includes("stir")) {
    return "Stirred, not shaken. Bond would still approve. Probably.";
  }
  return cheekyLines[index % cheekyLines.length];
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

export function transformCocktail(raw: RawCocktail, index: number): Cocktail {
  const enriched = enrichCocktail(raw, SOURCE);

  return {
    id: raw.slug,
    name: raw.name,
    description: familyDescriptions[raw.family] ?? familyDescriptions.Other,
    cheekyLine: inferCheekyLine(raw, index),
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
