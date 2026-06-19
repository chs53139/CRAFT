import { Ingredient } from "@/lib/types";

/** Shop name shown on the “Buy …” recommendation card */
const BUY_LABELS: Record<string, string> = {
  "maraschino-liqueur": "Luxardo",
  campari: "Campari",
  aperol: "Aperol",
  "cointreau": "Cointreau",
  "green-chartreuse": "Chartreuse",
  "yellow-chartreuse": "Chartreuse",
  benedictine: "Benedictine",
  "grand-marnier": "Grand Marnier",
  absinthe: "Absinthe",
};

export function getBuyLabel(ingredient: Ingredient): string {
  return BUY_LABELS[ingredient.id] ?? ingredient.name;
}
