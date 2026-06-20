import { MixologistInvention } from "@/lib/mixologist/types";

export type SharedInventionPayload = {
  name: string;
  tagline: string;
  flavorProfile: string[];
  ingredients: Array<{ name: string; amount: string }>;
  instructions: string[];
  method: string;
  glassware: string;
  source?: MixologistInvention["source"];
};

function toBase64Url(value: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(value, "utf8").toString("base64url");
  }

  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  const normalized = padded + "=".repeat(padLength);

  if (typeof Buffer !== "undefined") {
    return Buffer.from(normalized, "base64").toString("utf8");
  }

  const binary = atob(normalized);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function inventionToSharePayload(
  invention: MixologistInvention
): SharedInventionPayload {
  return {
    name: invention.name,
    tagline: invention.tagline,
    flavorProfile: invention.flavorProfile,
    ingredients: invention.ingredients.map((item) => ({
      name: item.name,
      amount: item.amount,
    })),
    instructions: invention.instructions,
    method: invention.method,
    glassware: invention.glassware,
    source: invention.source,
  };
}

export function encodeInventionToken(invention: MixologistInvention): string {
  const payload = inventionToSharePayload(invention);
  return toBase64Url(JSON.stringify(payload));
}

export function decodeInventionToken(token: string): SharedInventionPayload | null {
  try {
    const parsed = JSON.parse(fromBase64Url(token)) as SharedInventionPayload;
    if (!parsed?.name || !parsed?.tagline || !Array.isArray(parsed.ingredients)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function buildInventionSharePath(invention: MixologistInvention): string {
  return `/share/creation/${encodeInventionToken(invention)}`;
}

export function getInventionShareUrl(invention: MixologistInvention, baseUrl?: string): string {
  const path = buildInventionSharePath(invention);
  if (!baseUrl) return path;
  return `${baseUrl}${path}`;
}

export function sharedPayloadToInvention(
  payload: SharedInventionPayload
): MixologistInvention {
  return {
    name: payload.name,
    tagline: payload.tagline,
    flavorProfile: payload.flavorProfile,
    ingredients: payload.ingredients.map((item) => ({
      ingredientId: item.name,
      name: item.name,
      amount: item.amount,
    })),
    instructions: payload.instructions,
    method: payload.method,
    glassware: payload.glassware,
    source: payload.source ?? "original",
    confidence: 100,
    sweetness: "balanced",
    strength: "medium",
    aiPowered: true,
  };
}
