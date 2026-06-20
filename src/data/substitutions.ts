/**
 * Curated ingredient substitution relationships for CRAFT.
 * Bar swaps use different missing/substitute IDs; pantry DIY entries set homemadeInstructions.
 */
export type IngredientSubstitution = {
  missingIngredient: string;
  substituteIngredient: string;
  confidenceScore: number;
  flavorImpact: string;
  notes: string;
  homemadeInstructions?: string[];
};

export const substitutions: IngredientSubstitution[] = [
  // Bitter aperitifs
  {
    missingIngredient: "campari",
    substituteIngredient: "aperol",
    confidenceScore: 88,
    flavorImpact: "Less bitter · sweeter · lower ABV",
    notes:
      "Aperol is sweeter and less bitter than Campari — the drink will be softer and more orange-forward.",
  },
  {
    missingIngredient: "aperol",
    substituteIngredient: "campari",
    confidenceScore: 82,
    flavorImpact: "More bitter · drier · bolder finish",
    notes:
      "Campari pushes bitterness and intensity up — not a 1:1 swap if you want a lighter aperitif.",
  },
  {
    missingIngredient: "campari",
    substituteIngredient: "select-aperitivo",
    confidenceScore: 84,
    flavorImpact: "Herbal bitter · slightly sweeter · Venetian profile",
    notes:
      "Select Aperitivo sits between Campari and Aperol — softer than Campari but still properly bitter.",
  },
  {
    missingIngredient: "aperol",
    substituteIngredient: "select-aperitivo",
    confidenceScore: 86,
    flavorImpact: "More bitter · less sugary · closer to classic spritz",
    notes: "Select reads drier and more herbal than Aperol — often a better Negroni-family stand-in.",
  },

  // Citrus
  {
    missingIngredient: "lime-juice",
    substituteIngredient: "lemon-juice",
    confidenceScore: 86,
    flavorImpact: "Brighter acid · less tropical · slightly sharper",
    notes:
      "Lemon reads brighter and less tropical than lime — balance may need a touch more sweetness.",
  },
  {
    missingIngredient: "lemon-juice",
    substituteIngredient: "lime-juice",
    confidenceScore: 86,
    flavorImpact: "Tarter · more tropical · leaner finish",
    notes: "Lime adds a greener, more tropical sharpness than lemon.",
  },
  {
    missingIngredient: "lime-juice",
    substituteIngredient: "grapefruit-juice",
    confidenceScore: 78,
    flavorImpact: "More bitter · drier · less piercing acid",
    notes:
      "Grapefruit is larger, drier, and more bitter — use slightly less and taste as you go.",
  },
  {
    missingIngredient: "lemon-juice",
    substituteIngredient: "grapefruit-juice",
    confidenceScore: 76,
    flavorImpact: "Bitter citrus · less bright · heavier mouthfeel",
    notes: "Grapefruit lacks lemon's clean snap — add a little extra acid if the drink feels flat.",
  },
  {
    missingIngredient: "fresh-grapefruit-juice",
    substituteIngredient: "grapefruit-juice",
    confidenceScore: 92,
    flavorImpact: "Similar profile · bottled may be sweeter",
    notes: "Bottled juice works in highballs; fresh is better in sours where acid drives balance.",
  },
  {
    missingIngredient: "orange-juice",
    substituteIngredient: "blood-orange-juice",
    confidenceScore: 83,
    flavorImpact: "Deeper berry notes · slightly less sweet",
    notes: "Blood orange adds complexity but changes the color and berry tone of the drink.",
  },

  // Orange liqueurs & curaçao
  {
    missingIngredient: "triple-sec",
    substituteIngredient: "cointreau",
    confidenceScore: 92,
    flavorImpact: "Drier orange · cleaner · less sugary",
    notes: "Both are clear orange liqueurs — Cointreau is drier and cleaner, often an upgrade.",
  },
  {
    missingIngredient: "cointreau",
    substituteIngredient: "triple-sec",
    confidenceScore: 88,
    flavorImpact: "Sweeter orange · softer · less precise",
    notes: "Triple sec is usually sweeter and less refined — the cocktail may need less additional sugar.",
  },
  {
    missingIngredient: "triple-sec",
    substituteIngredient: "grand-marnier",
    confidenceScore: 80,
    flavorImpact: "Richer · cognac-backed · heavier finish",
    notes: "Grand Marnier brings cognac richness — wonderful, but it darkens and weightens sours.",
  },
  {
    missingIngredient: "cointreau",
    substituteIngredient: "grand-marnier",
    confidenceScore: 82,
    flavorImpact: "Warmer · less transparent · more body",
    notes: "Grand Marnier's cognac base adds weight — excellent in sidecars, heavier in crisp sours.",
  },
  {
    missingIngredient: "orange-curacao",
    substituteIngredient: "triple-sec",
    confidenceScore: 85,
    flavorImpact: "Cleaner orange · less bitter peel",
    notes: "Triple sec is a practical swap in most classic builds calling for orange curaçao.",
  },
  {
    missingIngredient: "curacao",
    substituteIngredient: "cointreau",
    confidenceScore: 84,
    flavorImpact: "Drier · less colored · cleaner finish",
    notes: "You'll lose curaçao's deeper color and spice — fine structurally, different visually.",
  },

  // Sweeteners (bottle swaps)
  {
    missingIngredient: "simple-syrup",
    substituteIngredient: "demerara-syrup",
    confidenceScore: 85,
    flavorImpact: "Darker sweetness · richer · more body",
    notes:
      "Demerara adds molasses depth — excellent in stirred drinks, can overpower delicate sours.",
  },
  {
    missingIngredient: "simple-syrup",
    substituteIngredient: "agave-syrup",
    confidenceScore: 83,
    flavorImpact: "Softer sweet · faint vegetal note",
    notes: "Agave is softer and slightly vegetal — often use a little less than the recipe states.",
  },
  {
    missingIngredient: "simple-syrup",
    substituteIngredient: "honey-syrup",
    confidenceScore: 81,
    flavorImpact: "Floral · richer · less transparent sweetness",
    notes: "Honey syrup is floral and assertive — not neutral like simple.",
  },
  {
    missingIngredient: "demerara-syrup",
    substituteIngredient: "simple-syrup",
    confidenceScore: 82,
    flavorImpact: "Lighter sweet · less molasses · cleaner",
    notes: "Simple syrup is cleaner and lighter — you may lose some depth in spirit-forward builds.",
  },
  {
    missingIngredient: "agave-syrup",
    substituteIngredient: "simple-syrup",
    confidenceScore: 80,
    flavorImpact: "Neutral sweet · thinner · less character",
    notes: "Simple syrup is more neutral — you'll lose agave's soft vegetal character.",
  },
  {
    missingIngredient: "honey",
    substituteIngredient: "honey-syrup",
    confidenceScore: 88,
    flavorImpact: "Similar floral sweet · easier to mix",
    notes: "Honey syrup dissolves more reliably in cold drinks than raw honey.",
  },
  {
    missingIngredient: "maple-syrup",
    substituteIngredient: "demerara-syrup",
    confidenceScore: 74,
    flavorImpact: "Molasses instead of maple · less breakfast-y",
    notes: "Demerara gives richness but not maple's woodsy note — adjust expectations.",
  },
  {
    missingIngredient: "sugar",
    substituteIngredient: "simple-syrup",
    confidenceScore: 79,
    flavorImpact: "Liquid sweet · consistent dissolve · less texture",
    notes: "Use about ½ oz syrup in place of 1 tsp sugar — taste and adjust.",
  },

  // Whiskey & whisky
  {
    missingIngredient: "bourbon",
    substituteIngredient: "rye-whiskey",
    confidenceScore: 87,
    flavorImpact: "Spicier · drier · less vanilla/caramel",
    notes: "Rye is spicier and drier than bourbon — the drink will feel leaner and sharper.",
  },
  {
    missingIngredient: "rye-whiskey",
    substituteIngredient: "bourbon",
    confidenceScore: 85,
    flavorImpact: "Sweeter · rounder · softer spice",
    notes: "Bourbon is sweeter and rounder — spice and bite will mellow.",
  },
  {
    missingIngredient: "bourbon",
    substituteIngredient: "tennessee-whiskey",
    confidenceScore: 86,
    flavorImpact: "Similar sweetness · slightly charcoal-filtered",
    notes: "Tennessee whiskey behaves like bourbon in most sours and highballs.",
  },
  {
    missingIngredient: "scotch",
    substituteIngredient: "blended-scotch",
    confidenceScore: 90,
    flavorImpact: "Smoother · less singular malt · more blend character",
    notes: "Blended Scotch is often milder — smoke and peat depend heavily on brand.",
  },
  {
    missingIngredient: "blended-scotch",
    substituteIngredient: "scotch",
    confidenceScore: 88,
    flavorImpact: "More distinct malt · potentially peatier",
    notes: "Single malt or bolder blends can overpower delicate Scotch cocktails.",
  },
  {
    missingIngredient: "irish-whiskey",
    substituteIngredient: "bourbon",
    confidenceScore: 78,
    flavorImpact: "Sweeter · less grain-forward · softer finish",
    notes: "Bourbon works in Irish whiskey highballs but adds vanilla and oak.",
  },
  {
    missingIngredient: "canadian-whisky",
    substituteIngredient: "bourbon",
    confidenceScore: 76,
    flavorImpact: "Richer · sweeter · more oak",
    notes: "Canadian whisky is typically lighter — bourbon makes the drink heavier.",
  },

  // Gin
  {
    missingIngredient: "gin",
    substituteIngredient: "london-dry-gin",
    confidenceScore: 94,
    flavorImpact: "Similar botanical base · brand-dependent nuance",
    notes: "Both are juniper-forward — profile depends on brand, but structure stays intact.",
  },
  {
    missingIngredient: "london-dry-gin",
    substituteIngredient: "gin",
    confidenceScore: 94,
    flavorImpact: "Classic juniper · dry · familiar structure",
    notes: "London dry is a classic baseline — usually a safe swap within gin cocktails.",
  },
  {
    missingIngredient: "gin",
    substituteIngredient: "old-tom-gin",
    confidenceScore: 78,
    flavorImpact: "Sweeter · softer · less dry juniper",
    notes: "Old Tom is sweeter and softer — sours may need less syrup.",
  },
  {
    missingIngredient: "genever",
    substituteIngredient: "old-tom-gin",
    confidenceScore: 72,
    flavorImpact: "Less malty · sweeter · less weight",
    notes: "Old Tom approximates genever's softness but lacks malt richness.",
  },

  // Tequila & mezcal
  {
    missingIngredient: "tequila-blanco",
    substituteIngredient: "reposado-tequila",
    confidenceScore: 84,
    flavorImpact: "Oak notes · warmer · less sharp agave",
    notes: "Reposado adds oak and warmth — works in many tequila sours but changes the character.",
  },
  {
    missingIngredient: "reposado-tequila",
    substituteIngredient: "tequila-blanco",
    confidenceScore: 82,
    flavorImpact: "Brighter agave · less oak · sharper",
    notes: "Blanco is cleaner and sharper — you lose reposado's mellow barrel notes.",
  },
  {
    missingIngredient: "tequila-blanco",
    substituteIngredient: "mezcal",
    confidenceScore: 76,
    flavorImpact: "Smoky · earthy · bold aromatic shift",
    notes: "Mezcal brings smoke — delicious, but it will dominate unless used lightly.",
  },
  {
    missingIngredient: "mezcal",
    substituteIngredient: "tequila-blanco",
    confidenceScore: 70,
    flavorImpact: "No smoke · cleaner agave · lighter body",
    notes: "You lose mezcal's signature smoke entirely — the drink becomes a different species.",
  },

  // Rum
  {
    missingIngredient: "rum-white",
    substituteIngredient: "white-rum",
    confidenceScore: 95,
    flavorImpact: "Nearly identical · brand-dependent",
    notes: "Both are unaged light rums — structure stays the same across daiquiris and mojitos.",
  },
  {
    missingIngredient: "white-rum",
    substituteIngredient: "rum-white",
    confidenceScore: 95,
    flavorImpact: "Nearly identical · brand-dependent",
    notes: "Light rum categories overlap — swap freely in tropical and citrus builds.",
  },
  {
    missingIngredient: "aged-rum",
    substituteIngredient: "demerara-rum",
    confidenceScore: 82,
    flavorImpact: "Rich · molasses · full-bodied",
    notes: "Demerara rums share depth and molasses tones — often closer than a white rum swap.",
  },
  {
    missingIngredient: "dark-rum",
    substituteIngredient: "aged-rum",
    confidenceScore: 80,
    flavorImpact: "Less molasses · lighter color · softer spice",
    notes: "Aged rum is close but may lack dark rum's heavier caramel and color.",
  },
  {
    missingIngredient: "gold-rum",
    substituteIngredient: "aged-rum",
    confidenceScore: 83,
    flavorImpact: "Similar oak · slightly richer",
    notes: "Gold and aged rums overlap — fine in tiki and stirred rum drinks.",
  },
  {
    missingIngredient: "jamaican-rum",
    substituteIngredient: "dark-rum",
    confidenceScore: 71,
    flavorImpact: "Less funky · fewer esters · safer profile",
    notes: "Jamaican funk is hard to replicate — dark rum gives weight but not the same banana/funk.",
  },

  // Vermouth & aromatized wine
  {
    missingIngredient: "sweet-vermouth",
    substituteIngredient: "red-vermouth",
    confidenceScore: 93,
    flavorImpact: "Similar herbal sweet · wine-based · brand-dependent",
    notes: "Red/sweet vermouth categories overlap — brand character still matters.",
  },
  {
    missingIngredient: "red-vermouth",
    substituteIngredient: "sweet-vermouth",
    confidenceScore: 93,
    flavorImpact: "Similar herbal sweet · wine-based · brand-dependent",
    notes: "Sweet vermouth is the standard label — functionally the same category.",
  },
  {
    missingIngredient: "dry-vermouth",
    substituteIngredient: "blanc-vermouth",
    confidenceScore: 80,
    flavorImpact: "Slightly sweeter · floral · less austere",
    notes: "Blanc vermouth is sweeter than dry — reduce other sweeteners if swapping.",
  },
  {
    missingIngredient: "blanc-vermouth",
    substituteIngredient: "lillet-blanc",
    confidenceScore: 77,
    flavorImpact: "Fruitier · less herbal · softer wine note",
    notes: "Lillet is brighter and less bitter than blanc vermouth — lovely, but not identical.",
  },
  {
    missingIngredient: "sweet-vermouth",
    substituteIngredient: "dry-vermouth",
    confidenceScore: 72,
    flavorImpact: "Much drier · less body · more austere",
    notes: "Dry for sweet is a major shift — only works in equal-parts builds with adjustment.",
  },
  {
    missingIngredient: "punt-e-mes",
    substituteIngredient: "sweet-vermouth",
    confidenceScore: 78,
    flavorImpact: "Less bitter · less vanilla · softer",
    notes: "Punt e Mes has extra bitterness — sweet vermouth makes a milder Manhattan.",
  },

  // Mixers & sodas
  {
    missingIngredient: "club-soda",
    substituteIngredient: "soda-water",
    confidenceScore: 98,
    flavorImpact: "Neutral carbonation · identical function",
    notes: "Club soda and soda water are interchangeable for lengthening drinks.",
  },
  {
    missingIngredient: "soda-water",
    substituteIngredient: "club-soda",
    confidenceScore: 98,
    flavorImpact: "Neutral carbonation · identical function",
    notes: "Same role — use either to top highballs and spritzes.",
  },
  {
    missingIngredient: "club-soda",
    substituteIngredient: "tonic-water",
    confidenceScore: 68,
    flavorImpact: "Bitter quinine · sweet · aromatic",
    notes: "Tonic adds flavor where soda only lengthens — only swap when you want that character.",
  },
  {
    missingIngredient: "ginger-beer",
    substituteIngredient: "ginger-ale",
    confidenceScore: 81,
    flavorImpact: "Spicier · sharper · less sugary",
    notes: "Ginger beer is spicier and often less sweet than ale — Mule character changes.",
  },
  {
    missingIngredient: "ginger-ale",
    substituteIngredient: "ginger-beer",
    confidenceScore: 79,
    flavorImpact: "More heat · less sweet · bolder ginger",
    notes: "Ginger beer intensifies spice — may need less volume in delicate builds.",
  },
  {
    missingIngredient: "tonic-water",
    substituteIngredient: "bitter-lemon-soda",
    confidenceScore: 74,
    flavorImpact: "Sweeter · less bitter quinine · softer G&T",
    notes: "Bitter lemon is sweeter and less quinine-forward than tonic.",
  },
  {
    missingIngredient: "tonic-water",
    substituteIngredient: "elderflower-tonic",
    confidenceScore: 76,
    flavorImpact: "Floral · softer quinine · less classic G&T",
    notes: "Elderflower tonic changes the aromatics — pleasant but not a classic G&T.",
  },
  {
    missingIngredient: "cola",
    substituteIngredient: "lemon-lime-soda",
    confidenceScore: 70,
    flavorImpact: "Citrus instead of cola spice · lighter",
    notes: "You lose cola's caramel and spice — works as a fizzy lengthener only.",
  },

  // Liqueurs & amari
  {
    missingIngredient: "green-chartreuse",
    substituteIngredient: "yellow-chartreuse",
    confidenceScore: 75,
    flavorImpact: "Sweeter · less herbal punch · lower ABV",
    notes: "Yellow Chartreuse is softer — use less and expect a gentler herbal profile.",
  },
  {
    missingIngredient: "yellow-chartreuse",
    substituteIngredient: "green-chartreuse",
    confidenceScore: 73,
    flavorImpact: "More intense · drier · sharper herbs",
    notes: "Green Chartreuse is bolder — reduce volume to avoid overpowering the drink.",
  },
  {
    missingIngredient: "amaro-montenegro",
    substituteIngredient: "amaro-nonino",
    confidenceScore: 80,
    flavorImpact: "Lighter orange · less bitter · softer finish",
    notes: "Nonino is gentler and more citrus-forward than Montenegro's bitter depth.",
  },
  {
    missingIngredient: "amaro-nonino",
    substituteIngredient: "amaro-montenegro",
    confidenceScore: 78,
    flavorImpact: "More bitter · darker · heavier",
    notes: "Montenegro adds weight and bitterness — fine in stirred builds, heavy in sours.",
  },
  {
    missingIngredient: "maraschino-liqueur",
    substituteIngredient: "cherry-heering",
    confidenceScore: 72,
    flavorImpact: "Fruitier · less nutty · heavier cherry",
    notes: "Cherry Heering is richer and less dry — not a precise Last Word swap.",
  },
  {
    missingIngredient: "coffee-liqueur",
    substituteIngredient: "baileys-irish-cream",
    confidenceScore: 65,
    flavorImpact: "Creamy · less coffee-forward · sweeter",
    notes: "Baileys adds dairy richness — experimental only in coffee cocktails.",
  },

  // Bitters
  {
    missingIngredient: "angostura-bitters",
    substituteIngredient: "orange-bitters",
    confidenceScore: 78,
    flavorImpact: "Citrus peel · less baking spice · brighter",
    notes: "Orange bitters shift the spice profile — works in many stirred drinks, not all.",
  },
  {
    missingIngredient: "peychaud-s-bitters",
    substituteIngredient: "angostura-bitters",
    confidenceScore: 76,
    flavorImpact: "More baking spice · less anise · less red color",
    notes: "You lose Peychaud's anise and color — Sazerac purists will notice.",
  },
  {
    missingIngredient: "orange-bitters",
    substituteIngredient: "angostura-bitters",
    confidenceScore: 77,
    flavorImpact: "Warmer spice · less citrus · darker aroma",
    notes: "Angostura is spice-heavy — fine structurally, different aromatic top note.",
  },

  // Sparkling & wine
  {
    missingIngredient: "champagne",
    substituteIngredient: "prosecco",
    confidenceScore: 82,
    flavorImpact: "Fruitier · less yeasty · softer bubbles",
    notes: "Prosecco is fruit-forward and less austere — elegant but not identical.",
  },
  {
    missingIngredient: "prosecco",
    substituteIngredient: "champagne",
    confidenceScore: 84,
    flavorImpact: "Drier · more mineral · finer mousse",
    notes: "Champagne adds structure and dryness — often an upgrade in sparkling cocktails.",
  },
  {
    missingIngredient: "dry-white-wine",
    substituteIngredient: "blanc-vermouth",
    confidenceScore: 74,
    flavorImpact: "More herbal · sweeter · fortified",
    notes: "Blanc vermouth is aromatized — use less and expect more flavor than still wine.",
  },

  // Homemade / pantry DIY (same missing & substitute ID signals DIY path)
  {
    missingIngredient: "simple-syrup",
    substituteIngredient: "simple-syrup",
    confidenceScore: 68,
    flavorImpact: "Clean sweetness; slightly thinner mouthfeel than rich syrups.",
    notes: "Not identical to bottled syrup, but works in a pinch with pantry sugar and water.",
    homemadeInstructions: [
      "Combine equal parts granulated sugar and hot water.",
      "Stir until fully dissolved, then cool.",
      "Store refrigerated up to 2 weeks.",
    ],
  },
  {
    missingIngredient: "honey-syrup",
    substituteIngredient: "honey-syrup",
    confidenceScore: 65,
    flavorImpact: "Floral sweetness with more body than simple syrup.",
    notes: "Diluted honey behaves more like a cocktail syrup than raw honey.",
    homemadeInstructions: [
      "Mix 1 part honey with 1 part warm water.",
      "Stir until combined and let cool.",
      "Use slightly less than the recipe calls for — honey runs sweeter.",
    ],
  },
  {
    missingIngredient: "grenadine",
    substituteIngredient: "grenadine",
    confidenceScore: 62,
    flavorImpact: "Fruit-forward sweetness with less bitter pomegranate depth.",
    notes:
      "Real pomegranate grenadine is tart-sweet; this quick version is sweeter and less complex.",
    homemadeInstructions: [
      "Simmer 2 parts pomegranate juice with 1 part sugar until dissolved.",
      "Cool and add a few drops of lemon juice for balance.",
      "Skip the neon bar syrup — this is closer to the real thing.",
    ],
  },
  {
    missingIngredient: "demerara-syrup",
    substituteIngredient: "demerara-syrup",
    confidenceScore: 66,
    flavorImpact: "Richer, darker sweetness — excellent in spirit-forward drinks.",
    notes: "Demerara sugar adds molasses notes simple syrup cannot replicate exactly.",
    homemadeInstructions: [
      "Combine 2 parts demerara sugar with 1 part hot water.",
      "Stir until dissolved and cool before use.",
    ],
  },
  {
    missingIngredient: "agave-syrup",
    substituteIngredient: "agave-syrup",
    confidenceScore: 64,
    flavorImpact: "Soft, neutral sweetness with a faint vegetal note.",
    notes: "Agave nectar diluted slightly makes a workable cocktail sweetener.",
    homemadeInstructions: [
      "Mix 2 parts agave nectar with 1 part warm water.",
      "Stir to combine and cool.",
    ],
  },
  {
    missingIngredient: "cinnamon-syrup",
    substituteIngredient: "cinnamon-syrup",
    confidenceScore: 60,
    flavorImpact: "Warm spice · sweet · tiki-adjacent",
    notes: "Homemade cinnamon syrup lacks commercial stabilizers — use within a week.",
    homemadeInstructions: [
      "Simmer 1 cup sugar, 1 cup water, and 3 crushed cinnamon sticks for 10 minutes.",
      "Cool, strain, and refrigerate up to 1 week.",
    ],
  },
  {
    missingIngredient: "ginger-syrup",
    substituteIngredient: "ginger-syrup",
    confidenceScore: 63,
    flavorImpact: "Spicy sweet · sharp ginger heat",
    notes: "Fresh ginger syrup is brighter than many bottled versions.",
    homemadeInstructions: [
      "Simmer 1 cup sugar, 1 cup water, and ½ cup sliced fresh ginger for 15 minutes.",
      "Cool, strain, and refrigerate up to 2 weeks.",
    ],
  },
  {
    missingIngredient: "orgeat",
    substituteIngredient: "orgeat",
    confidenceScore: 58,
    flavorImpact: "Nutty almond · less complex than commercial orgeat",
    notes: "Quick orgeat is thinner and less stable than bottled — fine for one night.",
    homemadeInstructions: [
      "Blend 1 cup almond milk with ½ cup sugar until dissolved.",
      "Add a few drops of almond extract and orange flower water if you have them.",
      "Use within 3 days — shake well before pouring.",
    ],
  },
];

export function isHomemadeSubstitution(sub: IngredientSubstitution): boolean {
  return (sub.homemadeInstructions?.length ?? 0) > 0;
}

export function isBarSubstitution(sub: IngredientSubstitution): boolean {
  return (
    sub.missingIngredient !== sub.substituteIngredient && !isHomemadeSubstitution(sub)
  );
}
