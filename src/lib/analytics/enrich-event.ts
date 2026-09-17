import { getCocktailById } from "@/lib/cocktail-matching";
import { ProductEvent, ProductEventName, ProductEventPayload } from "@/lib/analytics/types";

export function enrichProductEvent<Name extends ProductEventName>(
  name: Name,
  payload: ProductEventPayload[Name]
): ProductEventPayload[Name] {
  if (name === "cocktail_viewed") {
    const p = payload as ProductEventPayload["cocktail_viewed"];
    const cocktail = getCocktailById(p.cocktailId);
    if (!cocktail) return payload;
    return {
      ...p,
      category: cocktail.category,
      rarityBucket: rarityLabel(cocktail.obscurityScore),
    } as ProductEventPayload[Name];
  }

  if (name === "mocktail_viewed") {
    const p = payload as ProductEventPayload["mocktail_viewed"];
    const cocktail = getCocktailById(p.cocktailId);
    if (!cocktail) return payload;
    return {
      ...p,
      category: cocktail.category,
      rarityBucket: rarityLabel(cocktail.obscurityScore),
    } as ProductEventPayload[Name];
  }

  if (name === "cocktail_searched") {
    const p = payload as ProductEventPayload["cocktail_searched"];
    return {
      ...p,
      zeroResults: p.resultCount === 0,
    } as ProductEventPayload[Name];
  }

  return payload;
}

function rarityLabel(obscurityScore: number): string {
  if (obscurityScore >= 72) return "deep_cut";
  if (obscurityScore >= 55) return "hidden_gem";
  if (obscurityScore >= 35) return "well_known";
  return "classic";
}

export function toPersistedEvent<Name extends ProductEventName>(
  name: Name,
  payload: ProductEventPayload[Name],
  at: string
): ProductEvent {
  return {
    name,
    payload: enrichProductEvent(name, payload),
    at,
  } as ProductEvent;
}
