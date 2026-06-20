import { MocktailSubcategory } from "@/lib/types";

export const MOCKTAIL_SUBCATEGORIES: MocktailSubcategory[] = [
  "classic-mocktail",
  "modern-mocktail",
  "wellness",
  "party",
  "coffee",
  "tea",
];

export const MOCKTAIL_SUBCATEGORY_LABELS: Record<MocktailSubcategory, string> = {
  "classic-mocktail": "Classic",
  "modern-mocktail": "Modern",
  wellness: "Wellness",
  party: "Party",
  coffee: "Coffee",
  tea: "Tea",
};

export const MOCKTAIL_SUBCATEGORY_DESCRIPTIONS: Record<MocktailSubcategory, string> = {
  "classic-mocktail": "Shirley Temples, virgin mojitos, and timeless NA pours.",
  "modern-mocktail": "Contemporary zero-proof builds with fresh ingredients.",
  wellness: "Light, hydrating, and feel-good sippers.",
  party: "Crowd-friendly punches and celebration cups.",
  coffee: "Cold brew, espresso, and café-style coolers.",
  tea: "Iced tea, chai, and botanical sparklers.",
};
