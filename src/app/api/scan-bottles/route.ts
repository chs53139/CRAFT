import { readJsonObject } from "@/lib/request-json";
import { createBarScanProviderFromEnv } from "@/lib/scan-bottles/provider";

export const runtime = "nodejs";

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"]);

export async function POST(request: Request) {
  const parsed = await readJsonObject(request, 4 * 1024 * 1024);
  if (parsed.status !== 200) return Response.json({ error: "Invalid or oversized request." }, { status: parsed.status });
  const { imageBase64: image, mimeType: mime } = parsed.body;
  const imageBase64 = typeof image === "string" ? image.trim() : "";
  const mimeType = typeof mime === "string" ? mime.trim() : "image/jpeg";
  if (!imageBase64 || imageBase64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(imageBase64) || (mime !== undefined && typeof mime !== "string")) {
    return Response.json({ error: "A valid base64 image is required." }, { status: 400 });
  }

  if (!ALLOWED_MIME.has(mimeType)) {
    return Response.json({ error: "Unsupported image type." }, { status: 400 });
  }

  const provider = createBarScanProviderFromEnv();
  const result = await provider.scanImage({ imageBase64, mimeType });
  return Response.json(result);
}
