import { IngredientSubstitutionRule } from "./types";

function pair(
  originalId: string,
  substituteId: string,
  confidence: number,
  notes: string,
  flavorImpact: string
): IngredientSubstitutionRule {
  return { originalId, substituteId, confidence, notes, flavorImpact };
}

/** Curated directional substitution relationships with confidence and transparency notes */
export const SUBSTITUTION_CATALOG: IngredientSubstitutionRule[] = [
  // Bitter aperitifs
  pair(
    "campari",
    "aperol",
    88,
    "Aperol is sweeter and less bitter than Campari — the drink will be softer and more orange-forward.",
    "Less bitter · sweeter · lower ABV"
  ),
  pair(
    "aperol",
    "campari",
    82,
    "Campari pushes bitterness and intensity up — not a 1:1 swap if you want a lighter aperitif.",
    "More bitter · drier · bolder finish"
  ),

  // Citrus
  pair(
    "lime-juice",
    "lemon-juice",
    86,
    "Lemon reads brighter and less tropical than lime — balance may need a touch more sweetness.",
    "Brighter acid · less tropical · slightly sharper"
  ),
  pair(
    "lemon-juice",
    "lime-juice",
    86,
    "Lime adds a greener, more tropical sharpness than lemon.",
    "Tarter · more tropical · leaner finish"
  ),
  pair(
    "lime-juice",
    "grapefruit-juice",
    78,
    "Grapefruit is larger, drier, and more bitter — use slightly less and taste as you go.",
    "More bitter · drier · less piercing acid"
  ),

  // Orange liqueurs
  pair(
    "triple-sec",
    "cointreau",
    92,
    "Both are clear orange liqueurs — Cointreau is drier and cleaner, often an upgrade.",
    "Drier orange · cleaner · less sugary"
  ),
  pair(
    "cointreau",
    "triple-sec",
    88,
    "Triple sec is usually sweeter and less refined — the cocktail may need less additional sugar.",
    "Sweeter orange · softer · less precise"
  ),
  pair(
    "triple-sec",
    "grand-marnier",
    80,
    "Grand Marnier brings cognac richness — wonderful, but it darkens and weightens sours.",
    "Richer · cognac-backed · heavier finish"
  ),

  // Sweeteners
  pair(
    "simple-syrup",
    "demerara-syrup",
    85,
    "Demerara adds molasses depth — excellent in stirred drinks, can overpower delicate sours.",
    "Darker sweetness · richer · more body"
  ),
  pair(
    "simple-syrup",
    "agave-syrup",
    83,
    "Agave is softer and slightly vegetal — often use a little less than the recipe states.",
    "Softer sweet · faint vegetal note"
  ),
  pair(
    "simple-syrup",
    "honey-syrup",
    81,
    "Honey syrup is floral and assertive — not neutral like simple.",
    "Floral · richer · less transparent sweetness"
  ),
  pair(
    "demerara-syrup",
    "simple-syrup",
    82,
    "Simple syrup is cleaner and lighter — you may lose some depth in spirit-forward builds.",
    "Lighter sweet · less molasses · cleaner"
  ),
  pair(
    "agave-syrup",
    "simple-syrup",
    80,
    "Simple syrup is more neutral — you'll lose agave's soft vegetal character.",
    "Neutral sweet · thinner · less character"
  ),

  // Whiskey
  pair(
    "bourbon",
    "rye-whiskey",
    87,
    "Rye is spicier and drier than bourbon — the drink will feel leaner and sharper.",
    "Spicier · drier · less vanilla/caramel"
  ),
  pair(
    "rye-whiskey",
    "bourbon",
    85,
    "Bourbon is sweeter and rounder — spice and bite will mellow.",
    "Sweeter · rounder · softer spice"
  ),

  // Gin
  pair(
    "london-dry-gin",
    "gin",
    94,
    "Both are juniper-forward — profile depends on brand, but structure stays intact.",
    "Similar botanical base · brand-dependent nuance"
  ),
  pair(
    "gin",
    "london-dry-gin",
    94,
    "London dry is a classic baseline — usually a safe swap within gin cocktails.",
    "Classic juniper · dry · familiar structure"
  ),
  pair(
    "gin",
    "old-tom-gin",
    78,
    "Old Tom is sweeter and softer — sours may need less syrup.",
    "Sweeter · softer · less dry juniper"
  ),

  // Tequila / mezcal
  pair(
    "tequila-blanco",
    "tequila-reposado",
    84,
    "Reposado adds oak and warmth — works in many tequila sours but changes the character.",
    "Oak notes · warmer · less sharp agave"
  ),
  pair(
    "tequila-blanco",
    "mezcal",
    76,
    "Mezcal brings smoke — delicious, but it will dominate unless used lightly.",
    "Smoky · earthy · bold aromatic shift"
  ),

  // Rum (conservative — rum swaps are experimental by nature)
  pair(
    "white-rum",
    "aged-rum",
    74,
    "Aged rum adds color and oak — fine in dark builds, odd in clear tropical sours.",
    "Richer · oaky · darker profile"
  ),
  pair(
    "aged-rum",
    "demerara-rum",
    82,
    "Demerara rums share depth and molasses tones — often closer than a white rum swap.",
    "Rich · molasses · full-bodied"
  ),

  // Vermouth
  pair(
    "sweet-vermouth",
    "red-vermouth",
    93,
    "Red/sweet vermouth categories overlap — brand character still matters.",
    "Similar herbal sweet · wine-based · brand-dependent"
  ),
  pair(
    "dry-vermouth",
    "blanc-vermouth",
    80,
    "Blanc vermouth is sweeter than dry — reduce other sweeteners if swapping.",
    "Slightly sweeter · floral · less austere"
  ),
  pair(
    "sweet-vermouth",
    "dry-vermouth",
    72,
    "Dry for sweet is a major shift — only works in equal-parts builds with adjustment.",
    "Much drier · less body · more austere"
  ),

  // Mixers
  pair(
    "club-soda",
    "ginger-ale",
    79,
    "Ginger ale adds sweetness and spice where soda only lengthens.",
    "Sweet · gingery · less neutral"
  ),
  pair(
    "ginger-beer",
    "ginger-ale",
    81,
    "Ginger beer is spicier and often less sweet than ale — Mule character changes.",
    "Spicier · sharper · less sugary"
  ),
  pair(
    "tonic-water",
    "bitter-lemon-soda",
    74,
    "Bitter lemon is sweeter and less quinine-forward than tonic.",
    "Sweeter · less bitter quinine · softer G&T"
  ),
];

const substitutionsByOriginal = new Map<string, IngredientSubstitutionRule[]>();

for (const rule of SUBSTITUTION_CATALOG) {
  const list = substitutionsByOriginal.get(rule.originalId) ?? [];
  list.push(rule);
  substitutionsByOriginal.set(rule.originalId, list);
}

for (const list of substitutionsByOriginal.values()) {
  list.sort((a, b) => b.confidence - a.confidence);
}

export function getSubstitutionRules(originalId: string): IngredientSubstitutionRule[] {
  return substitutionsByOriginal.get(originalId) ?? [];
}
