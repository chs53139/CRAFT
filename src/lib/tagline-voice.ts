/** Banned novelty / Instagram / T-shirt tagline voice — not allowed in catalogue copy. */
export const BANNED_TAGLINE_PHRASES = [
  "booze first. conversation second",
  "sharp citrus meets spirit",
  "tall, cold, and dangerously easy",
  "umbrella optional. regret unlikely",
  "vacation mode: activated",
  "vacation mode activated",
  "proceed with confidence",
  "trouble never tasted so good",
  "your evening just got interesting",
  "one more won't hurt",
  "strong opinions, stronger drinks",
  "classy with a little chaos",
  "liquid courage",
  "your new favorite bad decision",
  "tiki with conviction",
  "zero compromise",
  "tonight, sorted",
  "full send",
  "no passport required",
  "fizzed up and ready to party",
  "rich enough to apologize for nothing",
  "warm hands, good decisions pending",
  "short glass. long story",
  "doesn't fit a box",
  "bubbles with intention",
  "light, bitter, and unreasonably chic",
  "made for a crowd. or a very honest tuesday",
] as const;

export const BANNED_TAGLINE_PATTERNS = [
  /booze first/i,
  /conversation second/i,
  /vacation mode/i,
  /full send/i,
  /zero compromise/i,
  /tonight, sorted/i,
  /liquid courage/i,
  /bad decision/i,
  /proceed with confidence/i,
  /your evening just got/i,
  /tiki with conviction/i,
  /no passport required/i,
  /channels .+ without the airfare/i,
];

export function isNoveltyTaglineVoice(text: string): boolean {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return false;
  if (BANNED_TAGLINE_PHRASES.some((phrase) => normalized.includes(phrase))) return true;
  return BANNED_TAGLINE_PATTERNS.some((pattern) => pattern.test(text));
}
