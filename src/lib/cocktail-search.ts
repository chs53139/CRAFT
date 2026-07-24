import { cocktails, ingredients } from "@/lib/cocktail-data";
import { ERA_LABELS } from "@/lib/cocktail-curation";
import { Cocktail, CocktailMatch } from "@/lib/types";

/** Maps search terms to ingredient IDs and spirit families */
const SPIRIT_SEARCH_TERMS: Record<string, string[]> = {
  gin: ["gin", "london-dry-gin", "old-tom-gin", "plymouth-gin", "genever", "sloe-gin", "gin-london-dry"],
  bourbon: ["bourbon", "whiskey-bourbon"],
  rye: ["rye-whiskey", "rye"],
  scotch: ["scotch-whisky", "scotch", "blended-scotch", "single-malt-scotch"],
  rum: ["rum-white", "white-rum", "rum-dark", "dark-rum", "rum-aged", "aged-rum", "overproof-rum", "jamaican-rum", "cuban-rum", "demerara-rum", "rhum-agricole"],
  tequila: ["tequila-blanco", "reposado-tequila", "anejo-tequila", "tequila"],
  mezcal: ["mezcal"],
  vodka: ["vodka"],
  brandy: ["brandy", "cognac", "pisco", "calvados", "applejack"],
  cognac: ["cognac", "brandy-cognac"],
  amaro: ["campari", "aperol", "amaro-montenegro", "amaro-nonino", "amaro-lucano", "fernet-branca", "cynar", "averna", "amaro"],
  aperitif: ["lillet-blanc", "lillet-rose", "suze", "aperol", "campari", "dry-vermouth", "sweet-vermouth"],
  liqueur: ["triple-sec", "cointreau", "maraschino-liqueur", "green-chartreuse", "yellow-chartreuse", "benedictine", "grand-marnier", "elderflower-liqueur", "coffee-liqueur", "crème-de-cacao", "amaretto", "kahlua", "st-germain", "domaine-de-canton"],
};

/** Ingredient aliases for flavor/ingredient discovery */
const INGREDIENT_ALIASES: Record<string, string[]> = {
  orange: ["orange-juice", "orange-bitters", "cointreau", "grand-marnier", "triple-sec", "aperol", "curacao", "orange-curacao", "orange-liqueur", "orange-marmalade"],
  lemon: ["lemon-juice", "lemon-liqueur", "limoncello"],
  lime: ["lime-juice", "lime-wheel"],
  grapefruit: ["grapefruit-juice", "grapefruit-soda"],
  cranberry: ["cranberry-juice"],
  pineapple: ["pineapple-juice", "pineapple-syrup"],
  ginger: ["ginger-beer", "ginger-ale", "ginger-syrup", "domaine-de-canton"],
  mint: ["mint-syrup", "mint-leaves"],
  honey: ["honey-syrup", "honey"],
  coffee: ["coffee", "espresso", "coffee-liqueur", "kahlua"],
  chocolate: ["crème-de-cacao", "chocolate-bitters", "chocolate-syrup"],
  coconut: ["coconut-cream", "coconut-rum", "coco-lopez"],
  smoky: ["mezcal", "scotch-whisky", "islay-scotch", "lapsang-souchong"],
  bitter: ["campari", "aperol", "fernet-branca", "angostura-bitters", "orange-bitters", "peychauds-bitters"],
  herbal: ["green-chartreuse", "yellow-chartreuse", "benedictine", "absinthe", "genever"],
  tropical: ["rum-white", "rum-dark", "orgeat", "falernum", "coconut-cream", "pineapple-juice"],
  spicy: ["ginger-beer", "tabasco", "pepper", "cinnamon", "allspice-dram", "pimento-dram"],
  cream: ["heavy-cream", "half-and-half", "egg-white", "coconut-cream"],
  bubbly: ["champagne", "prosecco", "club-soda", "sparkling-wine"],
};

const CATEGORY_SEARCH_TERMS: Record<string, (c: Cocktail) => boolean> = {
  tiki: (c) => c.category === "Tiki" || c.collections.includes("tiki") || c.tags.includes("tiki") || c.era === "tiki",
  sour: (c) => c.category === "Sour",
  "old fashioned": (c) => c.name.toLowerCase().includes("old fashioned") || c.id.includes("old-fashioned"),
  martini: (c) => c.name.toLowerCase().includes("martini") || c.id.includes("martini"),
  highball: (c) => c.category === "Highball",
  collins: (c) => c.category === "Fizz & Collins" && (c.name.toLowerCase().includes("collins") || c.id.includes("collins")),
  fizz: (c) => c.category === "Fizz & Collins" && (c.name.toLowerCase().includes("fizz") || c.id.includes("fizz")),
  flip: (c) => c.category === "Flip & Nog",
  smash: (c) => c.name.toLowerCase().includes("smash") || c.id.includes("smash"),
  mule: (c) => c.name.toLowerCase().includes("mule") || c.id.includes("mule"),
  tropical: (c) => c.flavorProfile.includes("tropical") || c.category === "Tiki" || c.collections.includes("tiki"),
  spritz: (c) => c.category === "Spritz" || c.name.toLowerCase().includes("spritz"),
  punch: (c) => c.category === "Punch" || c.name.toLowerCase().includes("punch"),
  mocktail: (c) => c.drinkType === "mocktail",
  holiday: (c) => c.tags.includes("holiday") || c.tags.includes("seasonal") || /egg nog|hot toddy|mulled|pumpkin|peppermint|christmas|thanksgiving/i.test(c.name),
  seasonal: (c) => c.tags.includes("seasonal") || c.tags.includes("holiday") || c.tags.includes("summer") || c.tags.includes("winter"),
};

type SearchableCocktail = {
  cocktail: Cocktail;
  tokens: Set<string>;
  primarySpirits: string[];
  ingredientNames: string[];
};

let searchIndex: SearchableCocktail[] | null = null;

const ingredientMap = new Map(ingredients.map((i) => [i.id, i]));

function resolveIngredient(id: string) {
  return ingredientMap.get(id) ?? { id, name: id.replace(/-/g, " "), category: "other" as const };
}

function normalizeToken(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function tokenize(value: string): string[] {
  return normalizeToken(value)
    .split(/[\s,/·\-–—]+/)
    .filter((t) => t.length > 1);
}

function buildSearchIndex(cocktails: Cocktail[]): SearchableCocktail[] {
  return cocktails.map((cocktail) => {
    const tokens = new Set<string>();
    const add = (value: string) => {
      for (const t of tokenize(value)) tokens.add(t);
      tokens.add(normalizeToken(value));
    };

    add(cocktail.name);
    add(cocktail.id.replace(/-/g, " "));
    add(cocktail.category);
    add(cocktail.method);
    add(cocktail.glassware);
    add(cocktail.garnish);
    add(cocktail.regionOfOrigin);
    add(cocktail.sourceAttribution);
    add(cocktail.funFact);
    add(ERA_LABELS[cocktail.era] ?? cocktail.era);
    add(String(cocktail.yearInvented));

    for (const flavor of cocktail.flavorProfile) add(flavor);
    for (const tag of cocktail.tags) add(tag);
    for (const collection of cocktail.collections) add(collection.replace(/-/g, " "));

    const ingredientNames: string[] = [];
    const primarySpirits: string[] = [];

    for (const ing of cocktail.ingredients) {
      const ingredient = resolveIngredient(ing.ingredientId);
      const name = ingredient?.name ?? ing.ingredientId.replace(/-/g, " ");
      ingredientNames.push(name);
      add(name);
      add(ing.ingredientId.replace(/-/g, " "));

      if (ingredient?.category === "spirit" || ing.ingredientId.includes("rum") || ing.ingredientId.includes("whiskey") || ing.ingredientId.includes("whisky")) {
        primarySpirits.push(ing.ingredientId);
      }
    }

    return { cocktail, tokens, primarySpirits, ingredientNames };
  });
}

function getSearchIndex(): SearchableCocktail[] {
  if (!searchIndex) {
    searchIndex = buildSearchIndex(cocktails);
  }
  return searchIndex;
}

/** Reset index when catalogue changes (e.g. tests) */
export function resetSearchIndex(): void {
  searchIndex = null;
}

function matchesSpiritTerm(entry: SearchableCocktail, term: string): boolean {
  const spiritIds = SPIRIT_SEARCH_TERMS[term];
  if (!spiritIds) return false;

  const ids = new Set(spiritIds);
  return entry.cocktail.ingredients.some((ing) => ids.has(ing.ingredientId));
}

function matchesIngredientAlias(entry: SearchableCocktail, term: string): boolean {
  const aliases = INGREDIENT_ALIASES[term];
  if (!aliases) return false;

  return entry.cocktail.ingredients.some((ing) =>
    aliases.includes(ing.ingredientId) ||
    aliases.some((a) => ing.ingredientId.includes(a))
  );
}

function matchesCategoryTerm(entry: SearchableCocktail, term: string): boolean {
  const matcher = CATEGORY_SEARCH_TERMS[term];
  return matcher ? matcher(entry.cocktail) : false;
}

function scoreMatch(entry: SearchableCocktail, query: string): number {
  const q = normalizeToken(query);
  if (!q) return 0;

  let score = 0;
  const c = entry.cocktail;

  if (normalizeToken(c.name) === q) score += 100;
  else if (normalizeToken(c.name).startsWith(q)) score += 80;
  else if (normalizeToken(c.name).includes(q)) score += 60;

  if (c.id.replace(/-/g, " ").includes(q)) score += 40;

  for (const spirit of entry.primarySpirits) {
    if (spirit.includes(q) || q.includes(spirit.replace(/-/g, " "))) score += 35;
  }

  if (matchesSpiritTerm(entry, q)) score += 50;
  if (matchesIngredientAlias(entry, q)) score += 45;
  if (matchesCategoryTerm(entry, q)) score += 45;

  for (const flavor of c.flavorProfile) {
    if (flavor.includes(q)) score += 25;
  }

  for (const tag of c.tags) {
    if (tag.includes(q)) score += 20;
  }

  for (const collection of c.collections) {
    if (collection.replace(/-/g, " ").includes(q)) score += 20;
  }

  for (const name of entry.ingredientNames) {
    if (normalizeToken(name).includes(q)) score += 30;
  }

  if (entry.tokens.has(q)) score += 15;

  for (const token of entry.tokens) {
    if (token.startsWith(q) && token !== q) score += 10;
    else if (token.includes(q) && token !== q) score += 5;
  }

  if (c.regionOfOrigin.toLowerCase().includes(q)) score += 15;
  if (c.glassware.toLowerCase().includes(q)) score += 12;
  if (c.garnish.toLowerCase().includes(q)) score += 12;
  if ((ERA_LABELS[c.era] ?? c.era).toLowerCase().includes(q)) score += 15;

  return score;
}

export function searchCocktails(query: string, pool?: Cocktail[]): Cocktail[] {
  const catalogue = pool ?? cocktails;
  const q = query.trim();
  if (!q) return catalogue;

  const normalized = normalizeToken(q);
  const index = getSearchIndex();
  const poolIds = pool ? new Set(pool.map((c) => c.id)) : null;

  let scored = index
    .filter((entry) => !poolIds || poolIds.has(entry.cocktail.id))
    .map((entry) => ({ entry, score: scoreMatch(entry, q) }))
    .filter(({ score }) => score > 0);

  if (SPIRIT_SEARCH_TERMS[normalized]) {
    scored = scored.filter(({ entry }) => matchesSpiritTerm(entry, normalized));
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.entry.cocktail.name.localeCompare(b.entry.cocktail.name);
  });

  return scored.map(({ entry }) => entry.cocktail);
}

export function searchMatches(query: string, matches: CocktailMatch[]): CocktailMatch[] {
  const q = query.trim();
  if (!q) return matches;

  const index = getSearchIndex();
  const matchMap = new Map(matches.map((m) => [m.cocktail.id, m]));

  const scored = index
    .filter((entry) => matchMap.has(entry.cocktail.id))
    .map((entry) => {
      let score = scoreMatch(entry, q);

      const match = matchMap.get(entry.cocktail.id);
      if (match) {
        for (const ing of match.missing) {
          if (ing.name.toLowerCase().includes(q.toLowerCase())) score += 10;
        }
        for (const sub of match.substitutions) {
          if (
            sub.requiredName.toLowerCase().includes(q.toLowerCase()) ||
            sub.substituteName.toLowerCase().includes(q.toLowerCase())
          ) {
            score += 8;
          }
        }
      }

      return { match, score };
    })
    .filter(({ score, match }) => score > 0 && match)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.match!.cocktail.name.localeCompare(b.match!.cocktail.name);
    });

  return scored.map(({ match }) => match!);
}

/** @deprecated use searchMatches — kept for gradual migration */
export function filterMatchesBySearch(matches: CocktailMatch[], query: string): CocktailMatch[] {
  return searchMatches(query, matches);
}

/** @deprecated use searchCocktails */
export function searchCatalogue(query: string, pool?: Cocktail[]): Cocktail[] {
  const cocktails = pool ?? [];
  return searchCocktails(query, cocktails);
}

export { SPIRIT_SEARCH_TERMS, INGREDIENT_ALIASES, CATEGORY_SEARCH_TERMS };

if (typeof window !== "undefined") {
  queueMicrotask(() => {
    getSearchIndex();
  });
}
