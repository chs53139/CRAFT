import { buildIngredientCatalogForPrompt, finalizeDetections } from "./mapping";
import { RawVisionDetection, ScanBottlesResponse } from "./types";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

type VisionPayload = {
  imageBase64: string;
  mimeType: string;
};

function parseVisionJson(content: string): RawVisionDetection[] {
  const parsed = JSON.parse(content) as { bottles?: RawVisionDetection[] };
  if (!Array.isArray(parsed.bottles)) {
    throw new Error("Vision response missing bottles array.");
  }
  return parsed.bottles.filter((item) => item.detectedBottleName?.trim());
}

export async function scanBottlesWithOpenAI({
  imageBase64,
  mimeType,
}: VisionPayload): Promise<ScanBottlesResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const bytes = Buffer.from(imageBase64, "base64").byteLength;
  if (bytes > MAX_IMAGE_BYTES) {
    throw new Error("Image is too large. Please use a photo under 8 MB.");
  }

  const catalog = buildIngredientCatalogForPrompt();
  const prompt = `You are helping identify liquor bottles in a home bar photo for a cocktail app.

List every distinct liquor bottle you can clearly see. For each bottle return:
- detectedBottleName: brand and style as read from the label
- likelyCategory: one of spirit, liqueur, mixer, garnish, other
- suggestedIngredientId: best matching id from the CRAFT catalogue below, or null if unsure
- confidence: 0 to 1
- notes: optional uncertainty (partial label, glare, similar bottles, etc.)

Only include real bottles you can see. Do not invent bottles.
Prefer exact catalogue ids when possible.

CRAFT ingredient catalogue (id: name):
${catalog}

Respond with JSON only:
{"bottles":[{"detectedBottleName":"","likelyCategory":"","suggestedIngredientId":null,"confidence":0,"notes":""}]}`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI request failed (${response.status}): ${errorText.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("OpenAI returned an empty response.");
  }

  const rawItems = parseVisionJson(content);

  return {
    mock: false,
    detections: finalizeDetections(rawItems),
  };
}
