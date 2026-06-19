import { Ingredient } from "@/lib/types";

/** Mock shelf prices (USD) for ROI estimates — not real-time pricing. */
const OVERRIDES: Record<string, number> = {
  campari: 35,
  "aperol": 28,
  "sweet-vermouth": 22,
  "dry-vermouth": 22,
  "vermouth-sweet": 22,
  "vermouth-dry": 22,
  "triple-sec": 18,
  "cointreau": 38,
  "maraschino-liqueur": 28,
  luxardo: 28,
  "green-chartreuse": 45,
  "yellow-chartreuse": 45,
  "benedictine": 40,
  "grand-marnier": 42,
  "absinthe": 48,
  "gin-london-dry": 28,
  "vodka": 24,
  "bourbon": 32,
  "rye-whiskey": 34,
  "scotch-whisky": 38,
  "tequila-blanco": 30,
  "rum-white": 26,
  "rum-dark": 28,
  "prosecco": 16,
  "champagne": 45,
  "angostura-bitters": 8,
  bitters: 8,
  "lime-juice": 4,
  "lemon-juice": 4,
  "simple-syrup": 6,
  "ginger-beer": 5,
  tonic: 4,
  "club-soda": 2,
};

const CATEGORY_RANGE: Record<
  Ingredient["category"],
  { min: number; max: number }
> = {
  spirit: { min: 24, max: 48 },
  liqueur: { min: 18, max: 42 },
  mixer: { min: 3, max: 8 },
  garnish: { min: 2, max: 6 },
  other: { min: 6, max: 14 },
};

function hashId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) >>> 0;
  }
  return h;
}

export function getIngredientCostUsd(ingredient: Ingredient): number {
  const key = ingredient.id.toLowerCase();
  if (OVERRIDES[key] !== undefined) return OVERRIDES[key];

  for (const [pattern, price] of Object.entries(OVERRIDES)) {
    if (key.includes(pattern)) return price;
  }

  const { min, max } = CATEGORY_RANGE[ingredient.category];
  const span = max - min;
  const offset = hashId(ingredient.id) % (span + 1);
  return min + offset;
}

/** Cocktails unlocked per dollar, scaled to 0–10. Calibrated: 31 unlocks @ $35 ≈ 9.2 */
export function calculateRoiScore(
  unlocksCount: number,
  movesToOneAway: number,
  costUsd: number
): number {
  const value = unlocksCount + movesToOneAway * 0.25;
  const raw = (value / costUsd) * 10.4;
  return Math.min(10, Math.round(raw * 10) / 10);
}
