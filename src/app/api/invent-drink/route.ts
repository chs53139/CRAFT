import {
  findExistingCocktail,
  findCocktailVariation,
  generateOriginalCocktail,
} from "@/lib/mixologist/engine";
import { inventDrinkWithOpenAI } from "@/lib/mixologist/openai";
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

  if (!process.env.OPENAI_API_KEY) {
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
      invention: {
        ...invention,
        mock: true,
        notes:
          invention.notes ??
          "Demo mode — add OPENAI_API_KEY on the server for AI-generated originals.",
      },
      mock: true,
      aiPowered: false,
      message: "Demo mode — add OPENAI_API_KEY to enable AI-generated originals.",
    } satisfies InventDrinkResponse);
  }

  try {
    const invention = await inventDrinkWithOpenAI(uniqueIds);
    return Response.json({
      invention,
      aiPowered: true,
      mock: false,
    } satisfies InventDrinkResponse);
  } catch (error) {
    const fallback = generateOriginalCocktail(uniqueIds);
    if (fallback) {
      return Response.json({
        invention: {
          ...fallback,
          notes: "AI was unavailable — showing a rule-based original instead.",
        },
        aiPowered: false,
        mock: false,
        message: error instanceof Error ? error.message : "AI generation failed.",
      } satisfies InventDrinkResponse);
    }

    return Response.json(
      {
        error: error instanceof Error ? error.message : "Could not invent a drink.",
      } satisfies InventDrinkResponse,
      { status: 500 }
    );
  }
}
