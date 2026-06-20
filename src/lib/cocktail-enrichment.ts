import {
  BARTENDER_FAVORITE_SLUGS,
  FUN_FACTS,
  HISTORICAL_SLUGS,
  WELL_KNOWN_SLUGS,
} from "@/lib/cocktail-curation";
import { inferPopularityScore, resolveMetadata } from "@/lib/cocktail-metadata";
import {
  CocktailCollection,
  CocktailEra,
  Difficulty,
  RawCocktail,
} from "@/lib/types";

type MovieAppearance = {
  movie: string;
  year: number;
  note: string;
};

type EnrichedFields = {
  obscurityScore: number;
  popularityScore: number;
  yearInvented: number;
  regionOfOrigin: string;
  sourceAttribution: string;
  era: CocktailEra;
  collections: CocktailCollection[];
  funFact: string;
  method: string;
  tags: string[];
};

let ingredientUsageCounts: Map<string, number> | null = null;

export function buildIngredientUsageCounts(cocktails: RawCocktail[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const cocktail of cocktails) {
    for (const ing of cocktail.ingredients) {
      counts.set(ing.ref, (counts.get(ing.ref) ?? 0) + 1);
    }
  }
  return counts;
}

function getUsageCounts(cocktails: RawCocktail[]): Map<string, number> {
  if (!ingredientUsageCounts) {
    ingredientUsageCounts = buildIngredientUsageCounts(cocktails);
  }
  return ingredientUsageCounts;
}

function countRareIngredients(cocktail: RawCocktail, usage: Map<string, number>): number {
  return cocktail.ingredients.filter((ing) => (usage.get(ing.ref) ?? 0) <= 3).length;
}

function inferEra(raw: RawCocktail): CocktailEra {
  if (raw.family === "Tiki" || raw.tags.includes("tiki")) return "tiki";
  if (raw.tags.includes("modern-classic")) return "contemporary";
  if (HISTORICAL_SLUGS.has(raw.slug)) {
    if (raw.family === "Spirit-Forward" || raw.slug === "old-fashioned" || raw.slug === "sazerac") {
      return "pre-prohibition";
    }
    return "golden-age";
  }
  if (raw.tags.includes("classic")) return "timeless";
  if (raw.family === "Hot Drink" || raw.family === "Flip & Nog") return "golden-age";
  return "midcentury";
}

function inferCollections(raw: RawCocktail, obscurityScore: number, usage: Map<string, number>): CocktailCollection[] {
  const collections = new Set<CocktailCollection>();
  const isCraftOriginal = raw.tags.includes("craft-original") || raw.slug.startsWith("craft-");
  const isWellKnown = WELL_KNOWN_SLUGS.has(raw.slug);

  if (isCraftOriginal) collections.add("craft-original");

  if (
    raw.tags.includes("classic") ||
    raw.tags.includes("modern-classic") ||
    BARTENDER_FAVORITE_SLUGS.has(raw.slug) ||
    isWellKnown
  ) {
    collections.add("verified-classic");
  }

  if (obscurityScore >= 52 && !isWellKnown) {
    collections.add("hidden-gem");
  }

  if (raw.family === "Tiki" || raw.tags.includes("tiki")) collections.add("tiki");

  if (
    HISTORICAL_SLUGS.has(raw.slug) ||
    (raw.tags.includes("classic") && inferEra(raw) === "pre-prohibition")
  ) {
    collections.add("historical");
  }

  const method = raw.method.toLowerCase();
  const rareIngCount = countRareIngredients(raw, usage);
  if (
    raw.ingredients.length >= 6 ||
    method.includes("blend") ||
    method.includes("layer") ||
    rareIngCount >= 3 ||
    raw.tags.includes("experimental") ||
    (raw.family === "Other" && obscurityScore >= 55)
  ) {
    collections.add("experimental");
  }

  return [...collections];
}

function inferObscurityScore(raw: RawCocktail, usage: Map<string, number>): number {
  let score = 42;

  const rareCount = countRareIngredients(raw, usage);
  score += Math.min(rareCount * 6, 24);
  score += Math.min(Math.max(0, raw.ingredients.length - 4) * 4, 16);

  if (raw.family === "Other") score += 8;
  if (raw.method.toLowerCase().includes("blend")) score += 6;
  if (raw.method.toLowerCase().includes("layer")) score += 8;
  if (!raw.tags.includes("classic")) score += 10;
  if (raw.tags.includes("modern-classic")) score -= 4;

  if (WELL_KNOWN_SLUGS.has(raw.slug)) score -= 35;
  if (raw.tags.includes("classic") && !WELL_KNOWN_SLUGS.has(raw.slug)) score -= 8;
  if (BARTENDER_FAVORITE_SLUGS.has(raw.slug) && !WELL_KNOWN_SLUGS.has(raw.slug)) score += 4;

  return Math.max(1, Math.min(100, Math.round(score)));
}

function movieFact(raw: RawCocktail & { movieAppearances?: MovieAppearance[] }): string | null {
  const appearance = raw.movieAppearances?.[0];
  if (!appearance) return null;
  return `Featured in ${appearance.movie} (${appearance.year}) — ${appearance.note}`;
}

function inferFunFact(
  raw: RawCocktail & { movieAppearances?: MovieAppearance[] },
  era: CocktailEra,
  collections: CocktailCollection[]
): string {
  if (FUN_FACTS[raw.slug]) return FUN_FACTS[raw.slug];

  const fromMovie = movieFact(raw);
  if (fromMovie) return fromMovie;

  if (collections.includes("tiki")) {
    return `${raw.name} belongs to the tiki tradition — elaborate, tropical, and built for escapism in a tall glass.`;
  }
  if (collections.includes("craft-original")) {
    return `${raw.name} was composed in the CRAFT Bar Lab — built for balance, not novelty.`;
  }
  if (collections.includes("verified-classic")) {
    return `${raw.name} is a verified classic — the kind of drink serious bars keep on permanent rotation.`;
  }
  if (raw.tags.includes("modern-classic")) {
    return `${raw.name} is part of the modern classics wave — post-2000 drinks that earned a permanent spot on serious bar menus.`;
  }
  if (era === "pre-prohibition") {
    return `${raw.name} carries pre-Prohibition DNA — a drink from the era when American cocktail culture was being defined.`;
  }
  if (collections.includes("experimental")) {
    return `${raw.name} pushes beyond the usual template with ${raw.ingredients.length} ingredients and a ${raw.method.toLowerCase()} build.`;
  }
  if (collections.includes("hidden-gem")) {
    return `${raw.name} flies under most radars — uncommon on home menus, but worth the hunt.`;
  }

  return `${raw.name} is a ${raw.family.toLowerCase()} ${raw.method.toLowerCase()} cocktail — ${raw.tags.join(", ") || "house style"}.`;
}

export function enrichCocktail(raw: RawCocktail, allCocktails: RawCocktail[]): EnrichedFields {
  const usage = getUsageCounts(allCocktails);
  const obscurityScore = inferObscurityScore(raw, usage);
  const era = inferEra(raw);
  const collections = inferCollections(raw, obscurityScore, usage);
  const funFact = inferFunFact(raw, era, collections);
  const isCraftOriginal = collections.includes("craft-original");
  const isVerifiedClassic = collections.includes("verified-classic");
  const isWellKnown = WELL_KNOWN_SLUGS.has(raw.slug);
  const metadata = resolveMetadata(raw.slug, raw.family, era, isCraftOriginal);

  return {
    obscurityScore,
    popularityScore: inferPopularityScore(obscurityScore, isVerifiedClassic, isWellKnown),
    yearInvented: metadata.yearInvented,
    regionOfOrigin: metadata.regionOfOrigin,
    sourceAttribution: metadata.sourceAttribution,
    era,
    collections,
    funFact,
    method: raw.method,
    tags: raw.tags,
  };
}

export function matchesMood(
  cocktail: {
    flavorProfile: string[];
    category: string;
    collections: CocktailCollection[];
    obscurityScore: number;
    difficulty: Difficulty;
  },
  mood: string
): boolean {
  const flavors = cocktail.flavorProfile.join(" ").toLowerCase();
  const category = cocktail.category.toLowerCase();

  switch (mood) {
    case "bold":
      return (
        flavors.includes("spirit-forward") ||
        flavors.includes("bold") ||
        flavors.includes("strong") ||
        category.includes("spirit-forward") ||
        category === "shot"
      );
    case "refreshing":
      return (
        flavors.includes("refreshing") ||
        flavors.includes("citrus") ||
        flavors.includes("fizzy") ||
        category.includes("highball") ||
        category.includes("fizz") ||
        category.includes("spritz")
      );
    case "tropical":
      return (
        cocktail.collections.includes("tiki") ||
        flavors.includes("tropical") ||
        flavors.includes("fruity")
      );
    case "cozy":
      return (
        flavors.includes("warm") ||
        flavors.includes("cozy") ||
        flavors.includes("rich") ||
        flavors.includes("creamy") ||
        category.includes("hot") ||
        category.includes("flip")
      );
    case "elegant":
      return (
        flavors.includes("elegant") ||
        flavors.includes("bubbly") ||
        category.includes("champagne") ||
        category.includes("spirit-forward")
      );
    case "adventurous":
      return (
        cocktail.collections.includes("experimental") ||
        cocktail.collections.includes("hidden-gem") ||
        cocktail.obscurityScore >= 65 ||
        cocktail.difficulty === "hard"
      );
    default:
      return true;
  }
}

export function matchesRarity(
  obscurityScore: number,
  collections: CocktailCollection[],
  rarity: string
): boolean {
  switch (rarity) {
    case "common":
      return obscurityScore <= 40;
    case "hidden":
      return obscurityScore >= 55 && obscurityScore < 75;
    case "rare":
      return obscurityScore >= 75 || collections.includes("hidden-gem");
    case "wildcard":
      return obscurityScore >= 45;
    default:
      return true;
  }
}

export function primarySpiritId(raw: RawCocktail): string | undefined {
  return raw.ingredients.find((ing) => ing.type === "spirit")?.ref;
}
