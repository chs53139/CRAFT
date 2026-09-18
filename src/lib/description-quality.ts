import { isNoveltyTaglineVoice } from "@/lib/tagline-voice";

const BANNED_DESCRIPTION_PATTERNS = [
  /a refreshing blend of/i,
  /a sophisticated cocktail/i,
  /a perfect balance of/i,
  /this classic cocktail combines/i,
  /bright, balanced and refreshing/i,
  /a delightful combination/i,
  /sharp citrus meets spirit/i,
  /booze first\. conversation second/i,
  /tall, cold, and dangerously easy/i,
  /a timeless classic/i,
  /a refreshing classic/i,
  /a sophisticated blend/i,
  /a perfectly balanced cocktail/i,
  /a bold and refreshing/i,
  /a delicious combination/i,
  /a refreshing and balanced/i,
  /a classic cocktail with/i,
  /perfect for/i,
  /a sophisticated sip/i,
  /belongs to the tiki tradition/i,
  /elaborate, tropical, and built for escapism/i,
  /a sibling pour to/i,
  /tiki lineage from undefined/i,
  /vacation mode: activated/i,
  /full send/i,
  /no passport required/i,
  /channels .+ without the airfare/i,
];

export function isGenericDescription(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (isNoveltyTaglineVoice(trimmed)) return true;
  return BANNED_DESCRIPTION_PATTERNS.some((pattern) => pattern.test(trimmed));
}

export function findDuplicateDescriptions(descriptions: string[]): Map<string, number> {
  const counts = new Map<string, number>();
  for (const desc of descriptions) {
    const key = desc.trim().toLowerCase();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return new Map([...counts.entries()].filter(([, count]) => count > 1));
}

export function assertCatalogueDescriptionQuality(description: string, slug: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (isGenericDescription(description)) {
    console.warn(`[catalogue] generic description for ${slug}`);
  }
}
