import {
  findExistingCocktail,
  findCocktailVariation,
  generateOriginalCocktail,
} from "@/lib/mixologist/engine";
import { InventDrinkResponse } from "@/lib/mixologist/types";

export const runtime = "nodejs";

type InventRequestBody = {
  ingredientIds?: string[];
};

export async function POST(request: Request) {
  let body: InventRequestBody;

  try {
    body = (await request.json()) as InventRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." } satisfies InventDrinkResponse, {
      status: 400,
    });
  }

  const ingredientIds = body.ingredientIds;
  if (!Array.isArray(ingredientIds) || ingredientIds.length < 2) {
    return Response.json(
      { error: "Select at least two ingredients to invent a drink." } satisfies InventDrinkResponse,
      { status: 400 }
    );
  }

  const uniqueIds = [...new Set(ingredientIds.map((id) => id.trim()).filter(Boolean))];
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

  const invention = generateOriginalCocktail(uniqueIds);
  if (!invention) {
    return Response.json(
      {
        error:
          "Could not build a balanced drink from these ingredients. Try adding a spirit, citrus, or sweetener.",
      } satisfies InventDrinkResponse,
      { status: 422 }
    );
  }

  return Response.json({
    invention,
    aiPowered: false,
  } satisfies InventDrinkResponse);
}
