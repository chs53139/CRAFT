/**
 * Generates src/data/cocktails-expanded.json with curated additions.
 * Run: node scripts/generate-cocktail-expansion.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const existing = JSON.parse(
  fs.readFileSync(path.join(root, "src/data/cocktails.json"), "utf8")
);
const existingSlugs = new Set(existing.map((c) => c.slug));

function ing(ref, name, type, amount, unit = "ml") {
  return { ref, name, type, amount, unit };
}

function cocktail({
  name,
  slug,
  glass,
  family,
  method,
  tags = [],
  ingredients,
  garnish = [],
  preparation,
}) {
  return { name, slug, glass, family, method, tags, ingredients, garnish, preparation };
}

const EXPANSION = [
  // ── Tiki classics & Don the Beachcomber / Trader Vic's canon ──
  cocktail({
    name: "Pearl Diver",
    slug: "pearl-diver",
    glass: "Pearl Diver glass or Tiki mug",
    family: "Tiki",
    method: "Blend",
    tags: ["tiki", "classic"],
    ingredients: [
      ing("rum-dark", "Dark rum", "spirit", 45),
      ing("rum-aged", "Aged rum", "spirit", 22.5),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("orange-juice", "Orange juice", "juice", 15),
      ing("orgeat", "Orgeat", "syrup", 15),
      ing("falernum", "Falernum", "liqueur", 7.5),
      ing("butter", "Unsalted butter", "dairy-egg", 1, "tsp"),
      ing("cinnamon-syrup", "Cinnamon syrup", "syrup", 7.5),
    ],
    garnish: ["Mint sprig", "edible orchid", "nutmeg"],
    preparation: [
      "Blend all ingredients with crushed ice until frothy.",
      "Pour into a Pearl Diver glass or tiki mug.",
      "Garnish lavishly with mint, orchid, and grated nutmeg.",
    ],
  }),
  cocktail({
    name: "Aku Aku",
    slug: "aku-aku",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "classic"],
    ingredients: [
      ing("rum-white", "White rum", "spirit", 45),
      ing("rum-dark", "Dark rum", "spirit", 22.5),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("pineapple-juice", "Pineapple juice", "juice", 45),
      ing("orgeat", "Orgeat", "syrup", 15),
      ing("falernum", "Falernum", "liqueur", 7.5),
    ],
    garnish: ["Pineapple frond", "maraschino cherry"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a tiki mug over crushed ice.",
      "Garnish with pineapple and cherry.",
    ],
  }),
  cocktail({
    name: "Nui Nui",
    slug: "nui-nui",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "classic"],
    ingredients: [
      ing("rum-aged", "Aged rum", "spirit", 60),
      ing("orange-juice", "Orange juice", "juice", 22.5),
      ing("lime-juice", "Lime juice", "juice", 15),
      ing("cinnamon-syrup", "Cinnamon syrup", "syrup", 7.5),
      ing("orgeat", "Orgeat", "syrup", 7.5),
      ing("vanilla-syrup", "Vanilla syrup", "syrup", 7.5),
      ing("allspice-dram", "Allspice dram", "liqueur", 2.5),
    ],
    garnish: ["Orange wheel", "grated nutmeg"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a tiki mug over crushed ice.",
      "Garnish with orange and nutmeg.",
    ],
  }),
  cocktail({
    name: "Rum Barrel",
    slug: "rum-barrel",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "modern-classic"],
    ingredients: [
      ing("rum-aged", "Aged rum", "spirit", 45),
      ing("rum-dark", "Dark rum", "spirit", 22.5),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("falernum", "Falernum", "liqueur", 15),
      ing("orgeat", "Orgeat", "syrup", 15),
      ing("grenadine", "Grenadine", "syrup", 7.5),
    ],
    garnish: ["Mint sprig", "lime wheel"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a tiki mug over crushed ice.",
      "Garnish with mint and lime.",
    ],
  }),
  cocktail({
    name: "Doctor Funk",
    slug: "doctor-funk",
    glass: "Collins",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "historical"],
    ingredients: [
      ing("rum-white", "White rum", "spirit", 45),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("grenadine", "Grenadine", "syrup", 15),
      ing("absinthe", "Absinthe", "spirit", 1, "dash"),
      ing("club-soda", "Club soda", "mixer", 60),
    ],
    garnish: ["Lime wheel"],
    preparation: [
      "Shake rum, lime, grenadine, and absinthe with ice.",
      "Strain into a Collins glass over ice and top with soda.",
      "Garnish with lime.",
    ],
  }),
  cocktail({
    name: "Don's Beachcomber",
    slug: "dons-beachcomber",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Blend",
    tags: ["tiki", "historical"],
    ingredients: [
      ing("rum-white", "White rum", "spirit", 45),
      ing("rum-dark", "Dark rum", "spirit", 22.5),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("grapefruit-juice", "Grapefruit juice", "juice", 30),
      ing("falernum", "Falernum", "liqueur", 15),
      ing("grenadine", "Grenadine", "syrup", 7.5),
    ],
    garnish: ["Mint sprig"],
    preparation: [
      "Blend all ingredients with crushed ice.",
      "Pour into a tiki mug.",
      "Garnish with mint.",
    ],
  }),
  cocktail({
    name: "Caribbean Punch",
    slug: "caribbean-punch",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki"],
    ingredients: [
      ing("rum-aged", "Aged rum", "spirit", 45),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("orange-juice", "Orange juice", "juice", 30),
      ing("pineapple-juice", "Pineapple juice", "juice", 30),
      ing("grenadine", "Grenadine", "syrup", 7.5),
      ing("angostura-bitters", "Angostura bitters", "bitters", 2, "dash"),
    ],
    garnish: ["Orange slice", "cherry"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a tiki mug over crushed ice.",
      "Garnish with orange and cherry.",
    ],
  }),
  cocktail({
    name: "Royal Bermuda Yacht Club",
    slug: "royal-bermuda-yacht-club",
    glass: "Coupe",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "modern-classic"],
    ingredients: [
      ing("rum-aged", "Aged rum", "spirit", 60),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("falernum", "Falernum", "liqueur", 15),
      ing("cointreau", "Cointreau", "liqueur", 7.5),
      ing("simple-syrup", "Simple syrup", "syrup", 7.5),
    ],
    garnish: ["Lime wheel"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a chilled coupe.",
      "Garnish with lime.",
    ],
  }),
  cocktail({
    name: "Saturn Variation",
    slug: "saturn-variation",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "modern-classic"],
    ingredients: [
      ing("gin", "Gin", "spirit", 45),
      ing("lemon-juice", "Lemon juice", "juice", 22.5),
      ing("passion-fruit-syrup", "Passion fruit syrup", "syrup", 15),
      ing("falernum", "Falernum", "liqueur", 7.5),
      ing("orgeat", "Orgeat", "syrup", 7.5),
    ],
    garnish: ["Lemon peel", "cherry"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a tiki mug over crushed ice.",
      "Garnish with lemon peel and cherry.",
    ],
  }),
  cocktail({
    name: "Mai Tai (Royal Hawaiian)",
    slug: "mai-tai-royal-hawaiian",
    glass: "Rocks",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "classic"],
    ingredients: [
      ing("rum-aged", "Aged rum", "spirit", 45),
      ing("orange-curacao", "Orange curaçao", "liqueur", 15),
      ing("orgeat", "Orgeat", "syrup", 15),
      ing("lime-juice", "Lime juice", "juice", 30),
      ing("simple-syrup", "Simple syrup", "syrup", 7.5),
    ],
    garnish: ["Mint sprig", "lime shell"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain over crushed ice in a rocks glass.",
      "Garnish with mint and spent lime shell.",
    ],
  }),
  cocktail({
    name: "Mai Tai (Trader Vic's Original)",
    slug: "mai-tai-trader-vics",
    glass: "Rocks",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "classic", "historical"],
    ingredients: [
      ing("rum-aged", "Aged Jamaican rum", "spirit", 60),
      ing("orange-curacao", "Orange curaçao", "liqueur", 15),
      ing("orgeat", "Orgeat", "syrup", 15),
      ing("rock-candy-syrup", "Rock candy syrup", "syrup", 7.5),
      ing("lime-juice", "Lime juice", "juice", 30),
    ],
    garnish: ["Mint sprig"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain over crushed ice.",
      "Garnish with mint.",
    ],
  }),
  cocktail({
    name: "Beachcomber's Gold",
    slug: "beachcombers-gold",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki"],
    ingredients: [
      ing("rum-white", "White rum", "spirit", 45),
      ing("rum-dark", "Dark rum", "spirit", 22.5),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("honey-syrup", "Honey syrup", "syrup", 15),
      ing("maraschino-liqueur", "Maraschino liqueur", "liqueur", 7.5),
    ],
    garnish: ["Lime wheel"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a tiki mug over crushed ice.",
    ],
  }),
  cocktail({
    name: "Port Au Prince",
    slug: "port-au-prince",
    glass: "Coupe",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "hidden-gem"],
    ingredients: [
      ing("rhum-agricole", "Rhum agricole", "spirit", 45),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("grapefruit-juice", "Grapefruit juice", "juice", 15),
      ing("maraschino-liqueur", "Maraschino liqueur", "liqueur", 7.5),
      ing("grenadine", "Grenadine", "syrup", 7.5),
    ],
    garnish: ["Lime wheel"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a chilled coupe.",
    ],
  }),
  cocktail({
    name: "Halekulani",
    slug: "halekulani",
    glass: "Coupe",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki"],
    ingredients: [
      ing("rum-white", "White rum", "spirit", 45),
      ing("lemon-juice", "Lemon juice", "juice", 22.5),
      ing("pineapple-juice", "Pineapple juice", "juice", 22.5),
      ing("orange-curacao", "Orange curaçao", "liqueur", 7.5),
      ing("simple-syrup", "Simple syrup", "syrup", 7.5),
    ],
    garnish: ["Orange twist"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a chilled coupe.",
      "Express orange twist over the top.",
    ],
  }),
  cocktail({
    name: "Taboo",
    slug: "taboo-tiki",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Blend",
    tags: ["tiki"],
    ingredients: [
      ing("rum-dark", "Dark rum", "spirit", 45),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("passion-fruit-syrup", "Passion fruit syrup", "syrup", 15),
      ing("banana-liqueur", "Banana liqueur", "liqueur", 15),
      ing("coconut-cream", "Coconut cream", "mixer", 30),
    ],
    garnish: ["Banana slice"],
    preparation: [
      "Blend all ingredients with crushed ice.",
      "Pour into a tiki mug.",
      "Garnish with banana slice.",
    ],
  }),
  cocktail({
    name: "Cobra's Breath",
    slug: "cobras-breath",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "experimental"],
    ingredients: [
      ing("overproof-rum", "Overproof rum", "spirit", 22.5),
      ing("rum-aged", "Aged rum", "spirit", 30),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("falernum", "Falernum", "liqueur", 15),
      ing("pimento-dram", "Pimento dram", "liqueur", 7.5),
      ing("absinthe", "Absinthe", "spirit", 1, "dash"),
    ],
    garnish: ["Mint sprig"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a tiki mug over crushed ice.",
      "Garnish with mint.",
    ],
  }),
  cocktail({
    name: "Kon-Tiki",
    slug: "kon-tiki",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki"],
    ingredients: [
      ing("rum-white", "White rum", "spirit", 45),
      ing("rum-dark", "Dark rum", "spirit", 22.5),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("grapefruit-juice", "Grapefruit juice", "juice", 30),
      ing("falernum", "Falernum", "liqueur", 15),
    ],
    garnish: ["Grapefruit peel"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a tiki mug over crushed ice.",
    ],
  }),
  cocktail({
    name: "Shrunken Skull",
    slug: "shrunken-skull",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Blend",
    tags: ["tiki", "historical"],
    ingredients: [
      ing("rum-dark", "Dark rum", "spirit", 45),
      ing("rum-aged", "Aged rum", "spirit", 22.5),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("grenadine", "Grenadine", "syrup", 15),
      ing("falernum", "Falernum", "liqueur", 7.5),
    ],
    garnish: ["Mint sprig"],
    preparation: [
      "Blend all ingredients with crushed ice.",
      "Pour into a tiki mug.",
    ],
  }),
  cocktail({
    name: "Vicious Virgin",
    slug: "vicious-virgin",
    glass: "Tiki mug",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki"],
    ingredients: [
      ing("rum-white", "White rum", "spirit", 45),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("passion-fruit-syrup", "Passion fruit syrup", "syrup", 15),
      ing("cointreau", "Cointreau", "liqueur", 15),
      ing("orgeat", "Orgeat", "syrup", 7.5),
    ],
    garnish: ["Passion fruit half"],
    preparation: [
      "Shake all ingredients with ice.",
      "Strain into a tiki mug over crushed ice.",
    ],
  }),
  cocktail({
    name: "Navy Grog (Modern)",
    slug: "navy-grog-modern",
    glass: "Rocks",
    family: "Tiki",
    method: "Shaken",
    tags: ["tiki", "modern-classic"],
    ingredients: [
      ing("rum-white", "White rum", "spirit", 22.5),
      ing("rum-dark", "Dark rum", "spirit", 22.5),
      ing("rum-aged", "Aged rum", "spirit", 22.5),
      ing("lime-juice", "Lime juice", "juice", 22.5),
      ing("grapefruit-juice", "Grapefruit juice", "juice", 22.5),
      ing("honey-syrup", "Honey syrup", "syrup", 15),
      ing("club-soda", "Club soda", "mixer", 30),
    ],
    garnish: ["Mint sprig", "lime wheel"],
    preparation: [
      "Shake rums, juices, and honey with ice.",
      "Strain over crushed ice and top with soda.",
      "Garnish with mint and lime.",
    ],
  }),
];

// ── Modern classics & competition cocktails ──
const MODERN_CLASSICS = [
  ["Penicillin (Smoky)", "penicillin-smoky", "Rocks", "Sour", "Shaken", ["modern-classic"], [
    ing("scotch-whisky", "Blended Scotch", "spirit", 60),
    ing("lemon-juice", "Lemon juice", "juice", 22.5),
    ing("honey-ginger-syrup", "Honey-ginger syrup", "syrup", 22.5),
    ing("islay-scotch", "Islay Scotch", "spirit", 7.5),
  ], ["Candied ginger"], ["Shake Scotch, lemon, and syrup with ice.", "Strain over ice.", "Float Islay Scotch on top.", "Garnish with candied ginger."]],
  ["Paper Plane (Split Base)", "paper-plane-split", "Coupe", "Sour", "Shaken", ["modern-classic"], [
    ing("bourbon", "Bourbon", "spirit", 22.5),
    ing("rye-whiskey", "Rye whiskey", "spirit", 22.5),
    ing("averna", "Averna", "liqueur", 22.5),
    ing("amaro-nonino", "Amaro Nonino", "liqueur", 22.5),
    ing("lemon-juice", "Lemon juice", "juice", 22.5),
  ], ["Lemon twist"], ["Shake all ingredients with ice.", "Strain into a chilled coupe.", "Garnish with lemon twist."]],
  ["Naked and Famous (Reposado)", "naked-famous-reposado", "Coupe", "Sour", "Shaken", ["modern-classic"], [
    ing("reposado-tequila", "Reposado tequila", "spirit", 22.5),
    ing("aperol", "Aperol", "liqueur", 22.5),
    ing("yellow-chartreuse", "Yellow Chartreuse", "liqueur", 22.5),
    ing("lime-juice", "Lime juice", "juice", 22.5),
  ], ["Lime wheel"], ["Shake equal parts with ice.", "Strain into a coupe.", "Garnish with lime."]],
  ["Gold Rush (Honey)", "gold-rush-honey", "Rocks", "Sour", "Shaken", ["modern-classic"], [
    ing("bourbon", "Bourbon", "spirit", 60),
    ing("lemon-juice", "Lemon juice", "juice", 22.5),
    ing("honey-syrup", "Honey syrup", "syrup", 22.5),
  ], ["Lemon twist"], ["Shake with ice.", "Strain over a large cube.", "Garnish with lemon twist."]],
  ["Boulevardier (Perfect)", "boulevardier-perfect", "Coupe", "Spirit-Forward", "Stirred", ["modern-classic"], [
    ing("bourbon", "Bourbon", "spirit", 30),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 22.5),
    ing("dry-vermouth", "Dry vermouth", "fortified-wine", 22.5),
    ing("campari", "Campari", "liqueur", 30),
  ], ["Orange twist"], ["Stir with ice.", "Strain into a chilled coupe.", "Express orange twist."]],
  ["Old Pal (Rye)", "old-pal-rye", "Coupe", "Spirit-Forward", "Stirred", ["modern-classic"], [
    ing("rye-whiskey", "Rye whiskey", "spirit", 30),
    ing("dry-vermouth", "Dry vermouth", "fortified-wine", 30),
    ing("campari", "Campari", "liqueur", 30),
  ], ["Orange twist"], ["Stir with ice.", "Strain into a coupe.", "Garnish with orange twist."]],
  ["Jungle Bird (Mezcal)", "jungle-bird-mezcal", "Rocks", "Tiki", "Shaken", ["modern-classic", "tiki"], [
    ing("mezcal", "Mezcal", "spirit", 45),
    ing("campari", "Campari", "liqueur", 22.5),
    ing("pineapple-juice", "Pineapple juice", "juice", 45),
    ing("lime-juice", "Lime juice", "juice", 15),
    ing("simple-syrup", "Simple syrup", "syrup", 15),
  ], ["Pineapple wedge"], ["Shake all ingredients with ice.", "Strain over crushed ice.", "Garnish with pineapple."]],
  ["Chartreuse Swizzle (Yellow)", "chartreuse-swizzle-yellow", "Collins", "Tiki", "Swizzled", ["tiki", "modern-classic"], [
    ing("yellow-chartreuse", "Yellow Chartreuse", "liqueur", 45),
    ing("lime-juice", "Lime juice", "juice", 22.5),
    ing("falernum", "Falernum", "liqueur", 15),
    ing("pineapple-juice", "Pineapple juice", "juice", 45),
  ], ["Mint sprig", "nutmeg"], ["Build in a Collins glass with crushed ice.", "Swizzle until frosty.", "Top with pineapple juice.", "Garnish with mint and nutmeg."]],
  ["Corpse Reviver No. 2 (Cynar)", "corpse-reviver-cynar", "Coupe", "Sour", "Shaken", ["modern-classic"], [
    ing("gin", "Gin", "spirit", 22.5),
    ing("cynar", "Cynar", "liqueur", 22.5),
    ing("lillet-blanc", "Lillet Blanc", "fortified-wine", 22.5),
    ing("lemon-juice", "Lemon juice", "juice", 22.5),
    ing("absinthe", "Absinthe", "spirit", 1, "dash"),
  ], ["Lemon twist"], ["Rinse glass with absinthe.", "Shake remaining ingredients with ice.", "Strain into glass."]],
  ["Bee's Knees (Lavender)", "bees-knees-lavender", "Coupe", "Sour", "Shaken", ["modern-classic"], [
    ing("gin", "Gin", "spirit", 60),
    ing("lemon-juice", "Lemon juice", "juice", 22.5),
    ing("lavender-honey-syrup", "Lavender honey syrup", "syrup", 22.5),
  ], ["Lemon twist"], ["Shake with ice.", "Strain into a chilled coupe."]],
];

for (const [name, slug, glass, family, method, tags, ingredients, garnish, preparation] of MODERN_CLASSICS) {
  EXPANSION.push(cocktail({ name, slug, glass, family, method, tags, ingredients, garnish, preparation }));
}

// ── Historical & forgotten classics ──
const HISTORICAL = [
  ["Aviation (Creme de Violette)", "aviation-violette", "Coupe", "Sour", "Shaken", ["classic", "historical"], [
    ing("gin", "Gin", "spirit", 60),
    ing("maraschino-liqueur", "Maraschino liqueur", "liqueur", 15),
    ing("lemon-juice", "Lemon juice", "juice", 22.5),
    ing("creme-de-violette", "Crème de violette", "liqueur", 7.5),
  ], ["Cherry"], ["Shake with ice.", "Strain into a coupe.", "Garnish with cherry."]],
  ["Hemingway Daiquiri (Papa Doble)", "hemingway-daiquiri-papa-doble", "Coupe", "Sour", "Shaken", ["classic", "historical"], [
    ing("rum-white", "White rum", "spirit", 60),
    ing("lime-juice", "Lime juice", "juice", 22.5),
    ing("grapefruit-juice", "Grapefruit juice", "juice", 15),
    ing("maraschino-liqueur", "Maraschino liqueur", "liqueur", 7.5),
    ing("simple-syrup", "Simple syrup", "syrup", 7.5),
  ], ["Lime wheel"], ["Shake with ice.", "Strain into a coupe."]],
  ["Ward Eight (Boston)", "ward-eight-boston", "Coupe", "Sour", "Shaken", ["classic", "historical"], [
    ing("rye-whiskey", "Rye whiskey", "spirit", 60),
    ing("lemon-juice", "Lemon juice", "juice", 15),
    ing("orange-juice", "Orange juice", "juice", 15),
    ing("grenadine", "Grenadine", "syrup", 7.5),
  ], ["Orange slice"], ["Shake with ice.", "Strain into a coupe.", "Garnish with orange."]],
  ["Remember the Alamo", "remember-the-alamo", "Coupe", "Spirit-Forward", "Stirred", ["historical"], [
    ing("tequila-blanco", "Tequila blanco", "spirit", 45),
    ing("dry-vermouth", "Dry vermouth", "fortified-wine", 22.5),
    ing("maraschino-liqueur", "Maraschino liqueur", "liqueur", 15),
    ing("orange-bitters", "Orange bitters", "bitters", 2, "dash"),
  ], ["Orange twist"], ["Stir with ice.", "Strain into a coupe."]],
  ["Income Tax", "income-tax", "Coupe", "Spirit-Forward", "Stirred", ["historical"], [
    ing("gin", "Gin", "spirit", 45),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 22.5),
    ing("dry-vermouth", "Dry vermouth", "fortified-wine", 22.5),
    ing("orange-juice", "Orange juice", "juice", 7.5),
    ing("angostura-bitters", "Angostura bitters", "bitters", 2, "dash"),
  ], ["Orange twist"], ["Stir with ice.", "Strain into a coupe."]],
  ["Bronx Cocktail", "bronx-cocktail", "Coupe", "Spirit-Forward", "Shaken", ["classic", "historical"], [
    ing("gin", "Gin", "spirit", 45),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 22.5),
    ing("dry-vermouth", "Dry vermouth", "fortified-wine", 22.5),
    ing("orange-juice", "Orange juice", "juice", 30),
  ], ["Orange twist"], ["Shake with ice.", "Strain into a coupe."]],
  ["Hanky Panky", "hanky-panky", "Coupe", "Spirit-Forward", "Stirred", ["historical"], [
    ing("gin", "Gin", "spirit", 45),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 45),
    ing("fernet-branca", "Fernet-Branca", "liqueur", 2.5),
  ], ["Orange twist"], ["Stir with ice.", "Strain into a coupe."]],
  ["Blood and Sand (Smoky)", "blood-and-sand-smoky", "Coupe", "Sour", "Shaken", ["classic"], [
    ing("scotch-whisky", "Scotch whisky", "spirit", 22.5),
    ing("islay-scotch", "Islay Scotch", "spirit", 7.5),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 22.5),
    ing("cherry-heering", "Cherry Heering", "liqueur", 22.5),
    ing("orange-juice", "Orange juice", "juice", 22.5),
  ], ["Orange peel"], ["Shake with ice.", "Strain into a coupe."]],
];

for (const [name, slug, glass, family, method, tags, ingredients, garnish, preparation] of HISTORICAL) {
  EXPANSION.push(cocktail({ name, slug, glass, family, method, tags, ingredients, garnish, preparation }));
}

// ── International cocktails ──
const INTERNATIONAL = [
  ["Caipirinha (Passion Fruit)", "caipirinha-passion", "Rocks", "Sour", "Muddled", ["classic"], [
    ing("cachaca", "Cachaça", "spirit", 60),
    ing("lime", "Lime", "produce", 1, "piece"),
    ing("passion-fruit-syrup", "Passion fruit syrup", "syrup", 15),
  ], ["Lime wedge"], ["Muddle lime and syrup.", "Add cachaça and ice.", "Stir briefly."]],
  ["Pisco Sour (Amargo)", "pisco-sour-amargo", "Coupe", "Sour", "Shaken", ["classic"], [
    ing("pisco", "Pisco", "spirit", 60),
    ing("lime-juice", "Lime juice", "juice", 30),
    ing("simple-syrup", "Simple syrup", "syrup", 22.5),
    ing("egg-white", "Egg white", "dairy-egg", 1, "piece"),
    ing("angostura-bitters", "Angostura bitters", "bitters", 3, "dash"),
  ], ["Angostura dots"], ["Dry shake, then shake with ice.", "Strain into a coupe.", "Dot with bitters."]],
  ["French 75 (Cognac)", "french-75-cognac", "Champagne flute", "Champagne Cocktail", "Shaken", ["classic"], [
    ing("cognac", "Cognac", "spirit", 30),
    ing("lemon-juice", "Lemon juice", "juice", 15),
    ing("simple-syrup", "Simple syrup", "syrup", 7.5),
    ing("champagne", "Champagne", "wine", 60),
  ], ["Lemon twist"], ["Shake cognac, lemon, and syrup.", "Strain into a flute.", "Top with champagne."]],
  ["Singapore Sling (Modern)", "singapore-sling-modern", "Collins", "Sour", "Shaken", ["classic"], [
    ing("gin", "Gin", "spirit", 30),
    ing("cherry-heering", "Cherry Heering", "liqueur", 15),
    ing("cointreau", "Cointreau", "liqueur", 7.5),
    ing("benedictine", "Benedictine", "liqueur", 7.5),
    ing("pineapple-juice", "Pineapple juice", "juice", 60),
    ing("lime-juice", "Lime juice", "juice", 15),
    ing("grenadine", "Grenadine", "syrup", 7.5),
    ing("angostura-bitters", "Angostura bitters", "bitters", 1, "dash"),
  ], ["Cherry", "pineapple"], ["Shake all except bitters with ice.", "Strain over ice.", "Dash bitters on top."]],
  ["Ti' Punch (Spiced)", "ti-punch-spiced", "Rocks", "Spirit-Forward", "Built", ["classic"], [
    ing("rhum-agricole", "Rhum agricole", "spirit", 60),
    ing("lime", "Lime", "produce", 1, "piece"),
    ing("cane-syrup", "Cane syrup", "syrup", 7.5),
    ing("pimento-dram", "Pimento dram", "liqueur", 2.5),
  ], ["Lime disc"], ["Muddle lime and syrup.", "Add rhum and ice.", "Stir."]],
  ["Paloma (Smoky)", "paloma-smoky", "Highball", "Highball", "Built", ["classic"], [
    ing("mezcal", "Mezcal", "spirit", 45),
    ing("grapefruit-juice", "Grapefruit juice", "juice", 30),
    ing("lime-juice", "Lime juice", "juice", 15),
    ing("grapefruit-soda", "Grapefruit soda", "mixer", 90),
  ], ["Grapefruit wedge"], ["Build mezcal and juices over ice.", "Top with grapefruit soda.", "Garnish."]],
  ["Irish Coffee (Modern)", "irish-coffee-modern", "Irish coffee glass", "Hot Drink", "Built", ["classic"], [
    ing("irish-whiskey", "Irish whiskey", "spirit", 45),
    ing("coffee", "Hot coffee", "mixer", 120),
    ing("brown-sugar-syrup", "Brown sugar syrup", "syrup", 15),
    ing("heavy-cream", "Heavy cream", "dairy-egg", 30),
  ], ["Nutmeg"], ["Warm glass with whiskey, coffee, and syrup.", "Float cream over the back of a spoon."]],
  ["Sazerac (Rye Cognac Split)", "sazerac-split-base", "Rocks", "Spirit-Forward", "Stirred", ["classic", "historical"], [
    ing("rye-whiskey", "Rye whiskey", "spirit", 30),
    ing("cognac", "Cognac", "spirit", 30),
    ing("simple-syrup", "Simple syrup", "syrup", 7.5),
    ing("peychauds-bitters", "Peychaud's bitters", "bitters", 3, "dash"),
    ing("absinthe", "Absinthe", "spirit", 1, "dash"),
  ], ["Lemon peel"], ["Rinse glass with absinthe.", "Stir remaining ingredients with ice.", "Strain into a rocks glass."]],
];

for (const [name, slug, glass, family, method, tags, ingredients, garnish, preparation] of INTERNATIONAL) {
  EXPANSION.push(cocktail({ name, slug, glass, family, method, tags, ingredients, garnish, preparation }));
}

// ── Seasonal & holiday cocktails ──
const SEASONAL = [
  ["Pumpkin Old Fashioned", "pumpkin-old-fashioned", "Rocks", "Spirit-Forward", "Stirred", ["seasonal", "holiday"], [
    ing("bourbon", "Bourbon", "spirit", 60),
    ing("pumpkin-spice-syrup", "Pumpkin spice syrup", "syrup", 15),
    ing("angostura-bitters", "Angostura bitters", "bitters", 2, "dash"),
  ], ["Orange twist"], ["Stir with ice.", "Strain over a large cube.", "Garnish with orange twist."]],
  ["Apple Cider Mule", "apple-cider-mule", "Copper mug", "Highball", "Built", ["seasonal"], [
    ing("vodka", "Vodka", "spirit", 45),
    ing("apple-cider", "Apple cider", "juice", 90),
    ing("lime-juice", "Lime juice", "juice", 15),
    ing("ginger-beer", "Ginger beer", "mixer", 60),
  ], ["Apple slice"], ["Build vodka and juices over ice.", "Top with ginger beer."]],
  ["Hot Toddy (Spiced Rum)", "hot-toddy-spiced-rum", "Mug", "Hot Drink", "Built", ["seasonal", "holiday"], [
    ing("rum-dark", "Dark rum", "spirit", 45),
    ing("honey", "Honey", "syrup", 15),
    ing("lemon-juice", "Lemon juice", "juice", 15),
    ing("hot-water", "Hot water", "mixer", 120),
  ], ["Cinnamon stick", "lemon wheel"], ["Combine rum, honey, and lemon in a mug.", "Top with hot water.", "Garnish."]],
  ["Mulled Wine Spritz", "mulled-wine-spritz", "Wine glass", "Spritz", "Built", ["seasonal", "holiday"], [
    ing("red-wine", "Red wine", "wine", 60),
    ing("orange-juice", "Orange juice", "juice", 30),
    ing("simple-syrup", "Simple syrup", "syrup", 15),
    ing("club-soda", "Club soda", "mixer", 30),
  ], ["Orange slice", "star anise"], ["Warm wine with spices (optional).", "Build over ice with juice and syrup.", "Top with soda."]],
  ["Peppermint Espresso Martini", "peppermint-espresso-martini", "Coupe", "Sour", "Shaken", ["seasonal", "holiday"], [
    ing("vodka", "Vodka", "spirit", 45),
    ing("coffee-liqueur", "Coffee liqueur", "liqueur", 22.5),
    ing("peppermint-schnapps", "Peppermint schnapps", "liqueur", 15),
    ing("espresso", "Espresso", "mixer", 30),
  ], ["Candy cane"], ["Shake all ingredients with ice.", "Strain into a chilled coupe."]],
  ["Watermelon Margarita", "watermelon-margarita", "Rocks", "Sour", "Shaken", ["seasonal", "summer"], [
    ing("tequila-blanco", "Tequila blanco", "spirit", 45),
    ing("lime-juice", "Lime juice", "juice", 22.5),
    ing("watermelon-juice", "Watermelon juice", "juice", 45),
    ing("triple-sec", "Triple sec", "liqueur", 15),
  ], ["Watermelon wedge"], ["Shake with ice.", "Strain over ice.", "Garnish with watermelon."]],
  ["Cranberry Boulevardier", "cranberry-boulevardier", "Coupe", "Spirit-Forward", "Stirred", ["seasonal", "holiday"], [
    ing("bourbon", "Bourbon", "spirit", 30),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 30),
    ing("campari", "Campari", "liqueur", 30),
    ing("cranberry-juice", "Cranberry juice", "juice", 15),
  ], ["Orange twist"], ["Stir with ice.", "Strain into a coupe."]],
  ["Eggnog (Spiked)", "eggnog-spiked", "Rocks", "Flip & Nog", "Shaken", ["seasonal", "holiday"], [
    ing("bourbon", "Bourbon", "spirit", 30),
    ing("dark-rum", "Dark rum", "spirit", 30),
    ing("heavy-cream", "Heavy cream", "dairy-egg", 60),
    ing("simple-syrup", "Simple syrup", "syrup", 15),
    ing("egg", "Egg", "dairy-egg", 1, "piece"),
    ing("nutmeg", "Nutmeg", "produce", 1, "dash"),
  ], ["Nutmeg"], ["Shake all ingredients with ice.", "Strain over ice.", "Grate nutmeg on top."]],
];

for (const [name, slug, glass, family, method, tags, ingredients, garnish, preparation] of SEASONAL) {
  EXPANSION.push(cocktail({ name, slug, glass, family, method, tags, ingredients, garnish, preparation }));
}

// ── Contemporary craft & competition-style ──
const CRAFT = [
  ["Smoked Old Fashioned", "smoked-old-fashioned", "Rocks", "Spirit-Forward", "Stirred", ["modern-classic"], [
    ing("bourbon", "Bourbon", "spirit", 60),
    ing("simple-syrup", "Simple syrup", "syrup", 7.5),
    ing("angostura-bitters", "Angostura bitters", "bitters", 2, "dash"),
    ing("orange-bitters", "Orange bitters", "bitters", 1, "dash"),
  ], ["Expressed orange peel", "cherries"], ["Stir with ice.", "Strain over a large cube.", "Smoke cloche optional."]],
  ["Clarified Milk Punch", "clarified-milk-punch", "Coupe", "Punch", "Built", ["modern-classic", "experimental"], [
    ing("brandy", "Brandy", "spirit", 45),
    ing("rum-aged", "Aged rum", "spirit", 22.5),
    ing("lemon-juice", "Lemon juice", "juice", 30),
    ing("simple-syrup", "Simple syrup", "syrup", 30),
    ing("black-tea", "Black tea", "mixer", 60),
    ing("whole-milk", "Whole milk", "dairy-egg", 60),
  ], ["Nutmeg"], ["Combine all ingredients except milk.", "Curdle with milk and strain through coffee filter.", "Serve chilled."]],
  ["Fat-Washed Negroni", "fat-washed-negroni", "Rocks", "Spirit-Forward", "Stirred", ["experimental", "modern-classic"], [
    ing("gin", "Gin", "spirit", 30),
    ing("campari", "Campari", "liqueur", 30),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 30),
  ], ["Orange twist"], ["Stir with ice.", "Strain over ice.", "Fat-wash gin beforehand for richness."]],
  ["Tomato Leaf Gimlet", "tomato-leaf-gimlet", "Coupe", "Sour", "Shaken", ["experimental"], [
    ing("gin", "Gin", "spirit", 60),
    ing("lime-juice", "Lime juice", "juice", 22.5),
    ing("tomato-water", "Tomato water", "mixer", 15),
    ing("simple-syrup", "Simple syrup", "syrup", 15),
  ], ["Tomato leaf"], ["Shake with ice.", "Strain into a coupe."]],
  ["Black Manhattan", "black-manhattan", "Coupe", "Spirit-Forward", "Stirred", ["modern-classic"], [
    ing("rye-whiskey", "Rye whiskey", "spirit", 60),
    ing("averna", "Averna", "liqueur", 30),
    ing("angostura-bitters", "Angostura bitters", "bitters", 2, "dash"),
  ], ["Cherry"], ["Stir with ice.", "Strain into a coupe.", "Garnish with cherry."]],
  ["Greenpoint", "greenpoint", "Coupe", "Spirit-Forward", "Stirred", ["modern-classic"], [
    ing("rye-whiskey", "Rye whiskey", "spirit", 60),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 22.5),
    ing("yellow-chartreuse", "Yellow Chartreuse", "liqueur", 7.5),
    ing("angostura-bitters", "Angostura bitters", "bitters", 2, "dash"),
  ], ["Cherry"], ["Stir with ice.", "Strain into a coupe."]],
  ["Red Hook", "red-hook", "Coupe", "Spirit-Forward", "Stirred", ["modern-classic"], [
    ing("rye-whiskey", "Rye whiskey", "spirit", 60),
    ing("maraschino-liqueur", "Maraschino liqueur", "liqueur", 15),
    ing("punt-e-mes", "Punt e Mes", "fortified-wine", 22.5),
  ], ["Cherry"], ["Stir with ice.", "Strain into a coupe."]],
  ["Little Italy", "little-italy", "Coupe", "Spirit-Forward", "Stirred", ["modern-classic"], [
    ing("rye-whiskey", "Rye whiskey", "spirit", 60),
    ing("cynar", "Cynar", "liqueur", 22.5),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 22.5),
  ], ["Orange twist"], ["Stir with ice.", "Strain into a coupe."]],
  ["Conference", "conference", "Rocks", "Spirit-Forward", "Stirred", ["modern-classic"], [
    ing("bourbon", "Bourbon", "spirit", 22.5),
    ing("rye-whiskey", "Rye whiskey", "spirit", 22.5),
    ing("cognac", "Cognac", "spirit", 22.5),
    ing("scotch-whisky", "Scotch whisky", "spirit", 22.5),
    ing("simple-syrup", "Simple syrup", "syrup", 15),
    ing("angostura-bitters", "Angostura bitters", "bitters", 2, "dash"),
  ], ["Orange twist"], ["Stir with ice.", "Strain over a large cube."]],
  ["Left Hand", "left-hand", "Coupe", "Spirit-Forward", "Stirred", ["modern-classic"], [
    ing("rye-whiskey", "Rye whiskey", "spirit", 30),
    ing("sweet-vermouth", "Sweet vermouth", "fortified-wine", 30),
    ing("campari", "Campari", "liqueur", 30),
    ing("chocolate-bitters", "Chocolate bitters", "bitters", 2, "dash"),
  ], ["Orange twist"], ["Stir with ice.", "Strain into a coupe."]],
];

for (const [name, slug, glass, family, method, tags, ingredients, garnish, preparation] of CRAFT) {
  EXPANSION.push(cocktail({ name, slug, glass, family, method, tags, ingredients, garnish, preparation }));
}

// Generate additional tiki variations programmatically
const TIKI_BASE_SPIRITS = [
  ["White rum", "rum-white"],
  ["Dark rum", "rum-dark"],
  ["Aged rum", "rum-aged"],
  ["Overproof rum", "overproof-rum"],
  ["Jamaican rum", "jamaican-rum"],
];

const TIKI_MODIFIERS = [
  ["Falernum", "falernum", 15],
  ["Orgeat", "orgeat", 15],
  ["Passion fruit", "passion-fruit-syrup", 15],
  ["Allspice dram", "pimento-dram", 7.5],
  ["Cinnamon", "cinnamon-syrup", 7.5],
];

const TIKI_NAMES = [
  "Island Hopper", "Polynesian Parfait", "Tropical Storm", "Rum Rendezvous",
  "Sunset Swizzle", "Volcano Bowl", "Bamboo Bar", "Lagoon Lounge",
  "Trader's Treasure", "Exotic Export", "Pacific Punch", "Hula Hideaway",
  "Coral Reef", "Palm Frond", "Tiki Torchlight", "Rum Runner's Delight",
  "Blue Hawaiian Dream", "Castaway Cooler", "Bermuda Triangle", "Molokai Magic",
  "Waikiki Wave", "Honolulu Heat", "Samoa Sunset", "Fiji Fizz",
  "Tahitian Treat", "Marquesas Mist", "Bora Bora Breeze", "Kona Cooler",
  "Lanai Lemon", "Maui Mule Tiki", "Oahu Oasis", "Kauai Kiss",
];

let tikiIndex = 0;
for (const name of TIKI_NAMES) {
  const slug = name.toLowerCase().replace(/'/g, "").replace(/\s+/g, "-");
  if (existingSlugs.has(slug)) continue;

  const spirit = TIKI_BASE_SPIRITS[tikiIndex % TIKI_BASE_SPIRITS.length];
  const mod = TIKI_MODIFIERS[tikiIndex % TIKI_MODIFIERS.length];
  tikiIndex++;

  EXPANSION.push(
    cocktail({
      name,
      slug,
      glass: "Tiki mug",
      family: "Tiki",
      method: tikiIndex % 3 === 0 ? "Blend" : "Shaken",
      tags: ["tiki"],
      ingredients: [
        ing(spirit[1], spirit[0], "spirit", 45),
        ing("lime-juice", "Lime juice", "juice", 22.5),
        ing("pineapple-juice", "Pineapple juice", "juice", 30),
        ing(mod[1], mod[0], mod[1].includes("syrup") ? "syrup" : "liqueur", mod[2]),
        ing("grenadine", "Grenadine", "syrup", 7.5),
      ],
      garnish: ["Mint sprig", "pineapple wedge"],
      preparation: [
        "Combine all ingredients with ice.",
        tikiIndex % 3 === 0 ? "Blend until smooth." : "Shake and strain over crushed ice.",
        "Garnish with mint and pineapple.",
      ],
    })
  );
}

// Generate modern sour variations
const SOUR_SPIRITS = [
  ["Gin", "gin"], ["Bourbon", "bourbon"], ["Rye", "rye-whiskey"],
  ["Tequila", "tequila-blanco"], ["Mezcal", "mezcal"], ["Rum", "rum-aged"],
  ["Vodka", "vodka"], ["Brandy", "brandy"], ["Scotch", "scotch-whisky"],
];

const SOUR_MODS = [
  ["Honey", "honey-syrup"], ["Maple", "maple-syrup"], ["Ginger", "ginger-syrup"],
  ["Elderflower", "elderflower-liqueur"], ["Amaretto", "amaretto"],
  ["Aperol", "aperol"], ["Campari", "campari"],
];

const SOUR_NAMES = [
  "Autumn Sour", "Winter Sour", "Spring Sour", "Summer Sour",
  "Midnight Sour", "Golden Sour", "Silver Sour", "Copper Sour",
  "Velvet Sour", "Silk Sour", "Rust Sour", "Ember Sour",
  "Frost Sour", "Harvest Sour", "Garden Sour", "Orchard Sour",
  "Coastal Sour", "Highland Sour", "Urban Sour", "Desert Sour",
  "Forest Sour", "River Sour", "Summit Sour", "Valley Sour",
  "Harbor Sour", "Canyon Sour", "Meadow Sour", "Cedar Sour",
  "Willow Sour", "Birch Sour", "Maple Sour", "Stone Sour Craft",
  "Iron Sour", "Bronze Sour", "Pearl Sour", "Onyx Sour",
  "Amber Sour", "Jade Sour", "Ruby Sour", "Sapphire Sour",
];

let sourIndex = 0;
for (const name of SOUR_NAMES) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  if (existingSlugs.has(slug)) continue;

  const spirit = SOUR_SPIRITS[sourIndex % SOUR_SPIRITS.length];
  const mod = SOUR_MODS[sourIndex % SOUR_MODS.length];
  sourIndex++;

  EXPANSION.push(
    cocktail({
      name,
      slug,
      glass: "Coupe",
      family: "Sour",
      method: "Shaken",
      tags: ["modern-classic"],
      ingredients: [
        ing(spirit[1], spirit[0], "spirit", 60),
        ing("lemon-juice", "Lemon juice", "juice", 22.5),
        ing(mod[1], mod[0], mod[1].includes("syrup") ? "syrup" : "liqueur", 15),
        ing("simple-syrup", "Simple syrup", "syrup", 7.5),
      ],
      garnish: ["Lemon twist"],
      preparation: [
        "Shake all ingredients with ice.",
        "Strain into a chilled coupe.",
        "Garnish with lemon twist.",
      ],
    })
  );
}

// Highballs & Collins
const HIGHBALL_NAMES = [
  "Ginger Highball", "Citrus Highball", "Herbal Highball", "Spiced Highball",
  "Berry Highball", "Stone Fruit Highball", "Tropical Highball", "Smoky Highball",
  "Elderflower Collins", "Basil Collins", "Cucumber Collins", "Rose Collins",
  "Lavender Collins", "Thyme Collins", "Rosemary Collins", "Sage Collins",
  "Peach Fizz", "Apricot Fizz", "Raspberry Fizz", "Blackberry Fizz",
  "Cherry Smash", "Plum Smash", "Fig Smash", "Grape Smash",
  "Celery Mule", "Cucumber Mule", "Pineapple Mule", "Passion Mule",
];

let hbIndex = 0;
for (const name of HIGHBALL_NAMES) {
  const slug = name.toLowerCase().replace(/\s+/g, "-");
  if (existingSlugs.has(slug)) continue;

  const isMule = name.includes("Mule");
  const isCollins = name.includes("Collins");
  const isFizz = name.includes("Fizz");
  const isSmash = name.includes("Smash");
  const family = isCollins || isFizz ? "Fizz & Collins" : "Highball";
  const spirit = SOUR_SPIRITS[hbIndex % 4];

  hbIndex++;

  const ingredients = [
    ing(spirit[1], spirit[0], "spirit", 45),
    ing("lime-juice", "Lime juice", "juice", 15),
    ing("simple-syrup", "Simple syrup", "syrup", 15),
  ];

  if (isMule) {
    ingredients.push(ing("ginger-beer", "Ginger beer", "mixer", 120));
  } else if (isCollins || isFizz) {
    ingredients.push(ing("lemon-juice", "Lemon juice", "juice", 22.5));
    ingredients.push(ing("club-soda", "Club soda", "mixer", 90));
  } else {
    ingredients.push(ing("club-soda", "Club soda", "mixer", 120));
  }

  EXPANSION.push(
    cocktail({
      name,
      slug,
      glass: isMule ? "Copper mug" : "Highball",
      family,
      method: "Built",
      tags: ["modern"],
      ingredients,
      garnish: ["Citrus wheel"],
      preparation: [
        "Build spirit and juices over ice.",
        isMule || isCollins || isFizz ? "Top with mixer." : "Top with soda.",
        "Stir gently and garnish.",
      ],
    })
  );
}

// Filter out duplicates against existing catalogue
const unique = EXPANSION.filter((c) => !existingSlugs.has(c.slug));

const outPath = path.join(root, "src/data/cocktails-expanded.json");
fs.writeFileSync(outPath, JSON.stringify(unique, null, 2));

console.log(`Generated ${unique.length} new cocktails (${EXPANSION.length - unique.length} skipped as duplicates)`);
console.log(`Tiki additions: ${unique.filter((c) => c.family === "Tiki").length}`);
console.log(`Written to ${outPath}`);
