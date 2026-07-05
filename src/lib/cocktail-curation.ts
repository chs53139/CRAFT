import { CocktailCollection } from "@/lib/types";

/** Widely known drinks — lower obscurity scores */
export const WELL_KNOWN_SLUGS = new Set([
  "margarita",
  "old-fashioned",
  "martini",
  "mojito",
  "negroni",
  "manhattan",
  "daiquiri",
  "moscow-mule",
  "cosmopolitan",
  "whiskey-sour",
  "pina-colada",
  "mai-tai",
  "espresso-martini",
  "aperol-spritz",
  "bloody-mary",
  "mimosa",
  "bellini",
  "paloma",
  "gin-and-tonic",
  "dark-n-stormy",
  "long-island-iced-tea",
  "margarita-frozen",
  "tequila-sunrise",
  "vodka-soda",
  "rum-and-coke",
]);

/** Drinks bartenders love to make and recommend */
export const BARTENDER_FAVORITE_SLUGS = new Set([
  "penicillin",
  "paper-plane",
  "last-word",
  "negroni",
  "boulevardier",
  "corpse-reviver-no-2",
  "corpse-reviver-no-1",
  "aviation",
  "sazerac",
  "old-fashioned",
  "martinez",
  "jungle-bird",
  "naked-and-famous",
  "southside",
  "gold-rush",
  "toronto",
  "industry-sour",
  "bramble",
  "white-negroni",
  "trinidad-sour",
  "division-bell",
  "oaxaca-old-fashioned",
  "clover-club",
  "ramos-gin-fizz",
  "ti-punch",
  "dark-n-stormy",
  "zombie",
  "remember-the-maine",
  "chartreuse-swizzle",
  "final-ward",
  "fitzgerald",
  "new-york-sour",
  "whiskey-smash",
  "mezcal-negroni",
  "mezcal-last-word",
  "tommys-margarita",
]);

/** Pre-Prohibition and Golden Age classics */
export const HISTORICAL_SLUGS = new Set([
  "old-fashioned",
  "sazerac",
  "manhattan",
  "martinez",
  "boulevardier",
  "sidecar",
  "corpse-reviver-no-2",
  "corpse-reviver-no-1",
  "aviation",
  "last-word",
  "clover-club",
  "bee-s-knees",
  "southside",
  "ramos-gin-fizz",
  "mai-tai",
  "zombie",
  "planters-punch",
  "daiquiri",
  "margarita",
  "moscow-mule",
  "old-cuban",
  "toronto",
  "remember-the-maine",
  "ward-eight",
  "ward-8",
  "ward-eight-2",
]);

/** Per-cocktail history and fun facts */
export const FUN_FACTS: Record<string, string> = {
  "old-fashioned":
    "One of the oldest recorded cocktails — originally just spirit, sugar, water, and bitters before the term 'cocktail' meant anything mixed.",
  sazerac:
    "Born in New Orleans around 1850; the city declared it the official cocktail in 2008.",
  manhattan:
    "Named for the Manhattan Club in New York, where legend says it was invented for a banquet in the 1870s.",
  negroni:
    "Count Camillo Negroni asked for an Americano with gin instead of soda at Caffè Casoni in Florence, 1919.",
  penicillin:
    "Sam Ross created this modern classic at Milk & Honey in NYC — smoky, ginger-spiked, and famously curative.",
  "paper-plane":
    "Sam Ross's equal-parts masterpiece from 2008: bourbon, Averna, Amaro Nonino, and lemon.",
  "last-word":
    "A Prohibition-era Detroit classic rediscovered at the Pegu Club — equal parts gin, Chartreuse, maraschino, and lime.",
  zombie:
    "Don the Beachcomber limited customers to two Zombies — the rum blend is deceptively strong.",
  "mai-tai":
    "Victor Bergeron claimed 'Mai Tai' means 'out of this world' in Tahitian after a friend tasted his 1944 recipe.",
  "espresso-martini":
    "London bartender Dick Bradsell invented it in the '80s for a model who wanted something to 'wake her up and mess her up.'",
  cosmopolitan:
    "Rose's Cranberry Juice and Absolut Citron helped define the '90s version — but its exact origin is still debated.",
  "corpse-reviver-no-2":
    "Harry Craddock's 1930 Savoy Cocktail Book warned: 'Four of these taken in swift succession will unrevive the corpse again.'",
  aviation:
    "Named for the purple hue of crème de violette — a pre-Prohibition gin sour that nearly vanished when violette disappeared.",
  "ramos-gin-fizz":
    "Henry Ramos shook each one for 12 minutes at the St. Charles Hotel in New Orleans — arm day included.",
  "white-negroni":
    "Suze and Lillet replace Campari and sweet vermouth for a bitter, pale twist on the classic.",
  "chartreuse-swizzle":
    "Green Chartreuse stars in this tiki-adjacent swizzle — herbal, complex, and dangerously drinkable.",
  "pearl-diver":
    "Don the Beachcomber's 1937 masterpiece — buttered rum, citrus, and spices served in its iconic glass.",
  "aku-aku":
    "Named for the Polynesian god of fertility — a fruity rum punch from the golden age of tiki.",
  "nui-nui":
    "A Don the Beachcomber classic with aged rum, citrus, and a whisper of vanilla and allspice.",
  "rum-barrel":
    "A modern tiki build that layers aged and dark rums with falernum and orgeat over crushed ice.",
  "trinidad-sour":
    "Angostura bitters as the base spirit? Only 1 oz — but it rewired what a sour could be.",
  "division-bell":
    "Phil Ward's mezcal Negroni riff — smoky, bitter, and a staple of the modern classics canon.",
  "naked-and-famous":
    "Equal parts mezcal, Aperol, yellow Chartreuse, and lime — Joaquín Simó's 2011 hit.",
};

export const COLLECTION_LABELS: Record<CocktailCollection, string> = {
  "verified-classic": "Verified Classic",
  "hidden-gem": "Hidden Gem",
  historical: "Historical",
  tiki: "Tiki",
  experimental: "Avant-garde",
  "craft-original": "CRAFT Original",
  mocktail: "Mocktails",
};

export const COLLECTION_DESCRIPTIONS: Record<CocktailCollection, string> = {
  "verified-classic": "Canon-worthy pours every bar should know.",
  "hidden-gem": "Under-the-radar drinks worth hunting down.",
  historical: "Pre-Prohibition and Golden Age legends.",
  tiki: "Tropical escapism, rum, and elaborate builds.",
  experimental: "Unusual ratios, rare bottles, bold ideas.",
  "craft-original": "Recipes created exclusively for CRAFT.",
  mocktail: "Zero-proof pours with full flavor and craft.",
};

export const DISCOVER_COLLECTIONS: CocktailCollection[] = [
  "verified-classic",
  "hidden-gem",
  "historical",
  "tiki",
  "experimental",
  "craft-original",
  "mocktail",
];

export const ERA_LABELS: Record<string, string> = {
  "pre-prohibition": "Pre-Prohibition",
  "golden-age": "Golden Age",
  midcentury: "Mid-Century",
  contemporary: "Contemporary",
  tiki: "Tiki Era",
  timeless: "Timeless",
};

export const MOOD_OPTIONS = [
  { id: "bold", label: "Bold", emoji: "🔥" },
  { id: "refreshing", label: "Refreshing", emoji: "🧊" },
  { id: "tropical", label: "Tropical", emoji: "🌴" },
  { id: "cozy", label: "Cozy", emoji: "☕" },
  { id: "elegant", label: "Elegant", emoji: "✨" },
  { id: "adventurous", label: "Adventurous", emoji: "🎲" },
] as const;

export const RARITY_OPTIONS = [
  { id: "any", label: "Surprise me" },
  { id: "common", label: "Crowd pleaser" },
  { id: "hidden", label: "Hidden gem" },
  { id: "rare", label: "Rare find" },
  { id: "wildcard", label: "Wildcard" },
] as const;

export const COMPLEXITY_OPTIONS = [
  { id: "any", label: "Any level" },
  { id: "easy", label: "Easy" },
  { id: "medium", label: "Medium" },
  { id: "hard", label: "Hard" },
] as const;
