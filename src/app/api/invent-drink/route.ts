import { readJsonObject } from "@/lib/request-json";
import { normalizeIngredientIds } from "@/lib/ingredient-intelligence";
import {
  findExistingCocktail,
  findCocktailVariation,
  generateMocktailOriginal,
  generateOriginalCocktail,
} from "@/lib/mixologist/engine";
import { getIngredientById } from "@/lib/cocktail-matching";
import { InventDrinkResponse } from "@/lib/mixologist/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const parsed = await readJsonObject(request, 4096);
  if (parsed.status !== 200) return Response.json({ error: "Invalid or oversized request." }, { status: parsed.status });
  const { ingredientIds } = parsed.body;
  if (!Array.isArray(ingredientIds) || ingredientIds.length < 2 || ingredientIds.length > 32 || !ingredientIds.every((id) => typeof id === "string" && id.length <= 128)) {
    return Response.json(
      { error: "Select 2 to 32 valid ingredients to invent a drink." } satisfies InventDrinkResponse,
      { status: 400 }
    );
  }

  const uniqueIds = normalizeIngredientIds(ingredientIds).filter((id) => Boolean(getIngredientById(id)));
  if (uniqueIds.length < 2) {
    return Response.json(
      { error: "Select at least two ingredients to invent a drink." } satisfies InventDrinkResponse,
      { status: 400 }
    );
  }

  const existing = findExistingCocktail(uniqueIds);
  if (existing) {
    return Response.json({
      invention: existing,
      aiPowered: false,
    } satisfies InventDrinkResponse);
  }

  const variation = findCocktailVariation(uniqueIds);
  if (variation) {
    return Response.json({
      invention: variation,
      aiPowered: false,
    } satisfies InventDrinkResponse);
  }

  const invention =
    generateOriginalCocktail(uniqueIds) ??
    generateMocktailOriginal(uniqueIds);

  if (!invention) {
    const hasSpirits = uniqueIds.some(
      (id) => getIngredientById(id)?.category === "spirit"
    );
    return Response.json(
      {
        error: hasSpirits
          ? "Could not build a balanced drink from these ingredients. Try adding citrus or a sweetener."
          : "Could not build a balanced zero-proof drink. Try adding juice, syrup, or a mixer.",
      } satisfies InventDrinkResponse,
      { status: 422 }
    );
  }

  return Response.json({
    invention,
    aiPowered: false,
  } satisfies InventDrinkResponse);
}
