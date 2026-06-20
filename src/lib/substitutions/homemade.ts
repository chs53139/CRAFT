import { HomemadeAlternative } from "./types";

export const HOMEMADE_ALTERNATIVES: HomemadeAlternative[] = [
  {
    ingredientId: "simple-syrup",
    name: "Simple syrup",
    confidence: 68,
    notes: "Not identical to bottled syrup, but works in a pinch with pantry sugar and water.",
    flavorImpact: "Clean sweetness; slightly thinner mouthfeel than rich syrups.",
    instructions: [
      "Combine equal parts granulated sugar and hot water.",
      "Stir until fully dissolved, then cool.",
      "Store refrigerated up to 2 weeks.",
    ],
  },
  {
    ingredientId: "honey-syrup",
    name: "Honey syrup",
    confidence: 65,
    notes: "Diluted honey behaves more like a cocktail syrup than raw honey.",
    flavorImpact: "Floral sweetness with more body than simple syrup.",
    instructions: [
      "Mix 1 part honey with 1 part warm water.",
      "Stir until combined and let cool.",
      "Use slightly less than the recipe calls for — honey runs sweeter.",
    ],
  },
  {
    ingredientId: "grenadine",
    name: "Grenadine",
    confidence: 62,
    notes: "Real pomegranate grenadine is tart-sweet; this quick version is sweeter and less complex.",
    flavorImpact: "Fruit-forward sweetness with less bitter pomegranate depth.",
    instructions: [
      "Simmer 2 parts pomegranate juice with 1 part sugar until dissolved.",
      "Cool and add a few drops of lemon juice for balance.",
      "Skip the neon bar syrup — this is closer to the real thing.",
    ],
  },
  {
    ingredientId: "demerara-syrup",
    name: "Demerara syrup",
    confidence: 66,
    notes: "Demerara sugar adds molasses notes simple syrup cannot replicate exactly.",
    flavorImpact: "Richer, darker sweetness — excellent in spirit-forward drinks.",
    instructions: [
      "Combine 2 parts demerara sugar with 1 part hot water.",
      "Stir until dissolved and cool before use.",
    ],
  },
  {
    ingredientId: "agave-syrup",
    name: "Agave syrup",
    confidence: 64,
    notes: "Agave nectar diluted slightly makes a workable cocktail sweetener.",
    flavorImpact: "Soft, neutral sweetness with a faint vegetal note.",
    instructions: [
      "Mix 2 parts agave nectar with 1 part warm water.",
      "Stir to combine and cool.",
    ],
  },
];

const homemadeMap = new Map(HOMEMADE_ALTERNATIVES.map((item) => [item.ingredientId, item]));

export function getHomemadeAlternative(ingredientId: string): HomemadeAlternative | undefined {
  return homemadeMap.get(ingredientId);
}
