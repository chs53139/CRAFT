import type { Cocktail } from "@/lib/types";

export const BAR_TOOLS = [
  { id: "jigger", name: "Jigger", alternative: "Measuring spoons or a marked measuring cup" },
  { id: "shaker", name: "Cocktail shaker", alternative: "A securely sealed food-safe jar" },
  { id: "strainer", name: "Cocktail strainer", alternative: "A small kitchen sieve" },
  { id: "mixing-glass", name: "Mixing glass", alternative: "A sturdy glass or measuring jug" },
  { id: "bar-spoon", name: "Bar spoon", alternative: "A long spoon" },
  { id: "blender", name: "Blender", alternative: "" },
  { id: "muddler", name: "Muddler", alternative: "The end of a clean wooden spoon" },
  { id: "fine-strainer", name: "Fine-mesh strainer", alternative: "A fine kitchen sieve" },
  { id: "citrus-press", name: "Citrus press", alternative: "Squeeze citrus by hand" },
  { id: "peeler", name: "Peeler", alternative: "A small knife" },
] as const;
export type BarToolId = typeof BAR_TOOLS[number]["id"];
export function normalizeToolIds(value: unknown): BarToolId[] {
  return Array.isArray(value) ? BAR_TOOLS.filter(t => value.includes(t.id)).map(t => t.id) : [];
}
/** Preparation guidance only; never affects ingredient makeability. */
export function getCocktailTools(cocktail: Pick<Cocktail, "method" | "instructions">) {
  const ids = new Set<BarToolId>(["jigger"]);
  const method = cocktail.method.toLowerCase();
  const steps = cocktail.instructions.join(" ").toLowerCase();
  if (/shak/.test(method)) ids.add("shaker");
  if (/stirr/.test(method)) { ids.add("mixing-glass"); ids.add("bar-spoon"); }
  if (/blend/.test(method) || /\bblend(?:er)?\b/.test(steps)) ids.add("blender");
  if (/swizzl/.test(method) || /\bswizzle\b/.test(steps)) ids.add("bar-spoon");
  if (/\bstrain(?:ed)?\b/.test(steps)) ids.add("strainer");
  if (/double[- ]strain|fine[- ]strain/.test(steps)) ids.add("fine-strainer");
  if (/\bmuddle/.test(steps)) ids.add("muddler");
  return BAR_TOOLS.filter(t => ids.has(t.id));
}
