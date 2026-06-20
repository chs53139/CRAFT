import { getMockScanResults } from "@/lib/scan-bottles/mock";
import { scanBottlesWithOpenAI } from "@/lib/scan-bottles/openai";
import { ScanBottlesResponse } from "@/lib/scan-bottles/types";

export const runtime = "nodejs";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

type ScanRequestBody = {
  imageBase64?: string;
  mimeType?: string;
};

export async function POST(request: Request) {
  let body: ScanRequestBody;

  try {
    body = (await request.json()) as ScanRequestBody;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const imageBase64 = body.imageBase64?.trim();
  const mimeType = body.mimeType?.trim() || "image/jpeg";

  if (!imageBase64) {
    return Response.json({ error: "imageBase64 is required." }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(mimeType)) {
    return Response.json({ error: "Unsupported image type." }, { status: 400 });
  }

  if (!process.env.OPENAI_API_KEY) {
    const mock = getMockScanResults();
    return Response.json(mock satisfies ScanBottlesResponse);
  }

  try {
    const result = await scanBottlesWithOpenAI({ imageBase64, mimeType });
    return Response.json(result satisfies ScanBottlesResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scan failed.";
    return Response.json({ error: message }, { status: 500 });
  }
}
