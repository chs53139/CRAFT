import { describe, expect, it } from "vitest";
import { getCocktailTools, normalizeToolIds } from "@/lib/bar-tools";
describe("bar tools", () => {
  it("rejects unknown inventory IDs and deduplicates saved tools", () => {
    expect(normalizeToolIds(["jigger", "jigger", "campari"])).toEqual(["jigger"]);
    expect(normalizeToolIds(null)).toEqual([]);
  });
  it("distinguishes shaken, stirred, blended, and built preparation", () => {
    const ids = (method: string) => getCocktailTools({ method, instructions: [] }).map(t => t.id);
    expect(ids("Shaken")).toContain("shaker");
    expect(ids("Stirred")).toContain("mixing-glass");
    expect(ids("Blended")).toContain("blender");
    expect(ids("Built")).not.toContain("shaker");
  });
  it("detects muddling and fine straining in recipe instructions", () => {
    const tools = getCocktailTools({ method: "Shaken", instructions: ["Muddle mint. Double-strain into the glass."] }).map(t => t.id);
    expect(tools).toContain("muddler");
    expect(tools).toContain("fine-strainer");
  });
});
