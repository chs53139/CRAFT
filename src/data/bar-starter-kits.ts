export type BarStarterKit = {
  id: string;
  label: string;
  description: string;
  ingredientIds: string[];
};

export const BAR_STARTER_KITS: BarStarterKit[] = [
  {
    id: "classic-home",
    label: "Classic home bar",
    description: "Spirit-forward staples for Manhattans, Old Fashioneds, and more.",
    ingredientIds: [
      "bourbon",
      "rye-whiskey",
      "london-dry-gin",
      "sweet-vermouth",
      "dry-vermouth",
      "angostura-bitters",
      "simple-syrup",
      "lemon-juice",
    ],
  },
  {
    id: "agave-night",
    label: "Agave night",
    description: "Margaritas, Palomas, and tequila sours.",
    ingredientIds: ["tequila-blanco", "lime-juice", "triple-sec", "grapefruit-soda"],
  },
  {
    id: "zero-proof-bar",
    label: "Zero-proof bar",
    description: "Mixers, juices, and syrups for mocktails at home.",
    ingredientIds: [
      "club-soda",
      "ginger-beer",
      "lime-juice",
      "lemon-juice",
      "simple-syrup",
      "grenadine",
      "mint",
      "cold-brew-coffee",
    ],
  },
  {
    id: "bitter-stirred",
    label: "Bitter & stirred",
    description: "Negronis, Boulevards, and aperitivo hour.",
    ingredientIds: ["campari", "london-dry-gin", "sweet-vermouth", "prosecco"],
  },
];
