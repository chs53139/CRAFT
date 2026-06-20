import { Cocktail } from "@/lib/types";
import { MixologistInvention } from "@/lib/mixologist/types";
import { CRAFT_DESCRIPTION, CRAFT_TAGLINE } from "@/lib/brand";

export type SharePayload = {
  title: string;
  text: string;
  url: string;
};

export function getAppBaseUrl(): string {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL ?? "";
}

export function toAbsoluteShareUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getAppBaseUrl();
  if (!base) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildCocktailSharePath(cocktailId: string): string {
  return `/cocktails/${cocktailId}`;
}

export function buildCocktailSharePayload(cocktail: Cocktail): SharePayload {
  const url = toAbsoluteShareUrl(buildCocktailSharePath(cocktail.id));
  const kind =
    cocktail.drinkType === "mocktail"
      ? "Mocktail"
      : cocktail.collections.includes("hidden-gem")
        ? "Hidden gem"
        : "Cocktail";

  const flavorHint =
    cocktail.flavorProfile.length > 0
      ? ` · ${cocktail.flavorProfile.slice(0, 3).join(", ")}`
      : "";

  return {
    title: `${cocktail.name} · CRAFT`,
    text: `${kind}${flavorHint}\n${cocktail.description}`,
    url,
  };
}

export function buildInventionSharePayload(
  invention: MixologistInvention,
  shareUrl: string
): SharePayload {
  const flavorHint =
    invention.flavorProfile.length > 0
      ? ` · ${invention.flavorProfile.slice(0, 3).join(", ")}`
      : "";

  return {
    title: `${invention.name} · CRAFT Original`,
    text: `AI creation${flavorHint}\n${invention.tagline}`,
    url: toAbsoluteShareUrl(shareUrl),
  };
}

export function formatShareClipboard(payload: SharePayload): string {
  return `${payload.title}\n\n${payload.text}\n\n${payload.url}\n\n${CRAFT_TAGLINE}`;
}

export function canUseNativeShare(payload: SharePayload): boolean {
  if (typeof navigator === "undefined" || typeof navigator.share !== "function") {
    return false;
  }

  if (typeof navigator.canShare === "function") {
    try {
      return navigator.canShare(payload);
    } catch {
      return true;
    }
  }

  return true;
}

export async function copyShareText(payload: SharePayload): Promise<void> {
  const text = formatShareClipboard(payload);
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  if (typeof document === "undefined") return;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}

export async function sharePayload(payload: SharePayload): Promise<"shared" | "copied"> {
  if (canUseNativeShare(payload)) {
    await navigator.share(payload);
    return "shared";
  }

  await copyShareText(payload);
  return "copied";
}

export const DEFAULT_OG_DESCRIPTION = CRAFT_DESCRIPTION;
