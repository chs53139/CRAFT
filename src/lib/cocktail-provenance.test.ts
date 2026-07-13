import { describe, expect, it } from "vitest";
import { cocktails } from "@/lib/cocktail-data";
import { getProvenanceCount } from "@/lib/cocktail-provenance";

describe("cocktail provenance", () => {
  it("covers nearly all catalogue entries", () => {
    expect(getProvenanceCount()).toBeGreaterThanOrEqual(679);
  });

  it("assigns a unique tagline to every cocktail", () => {
    const taglines = cocktails.map((c) => c.cheekyLine);
    const unique = new Set(taglines);
    expect(unique.size).toBe(cocktails.length);
    expect(cocktails.length).toBe(getProvenanceCount());
  });

  it("uses historically grounded years for classics", () => {
    const negroni = cocktails.find((c) => c.id === "negroni");
    const zombie = cocktails.find((c) => c.id === "zombie");
    const penicillin = cocktails.find((c) => c.id === "penicillin");

    expect(negroni?.yearInvented).toBe(1919);
    expect(zombie?.yearInvented).toBe(1934);
    expect(penicillin?.yearInvented).toBe(2005);
  });

  it("provides distinct fun facts for classics", () => {
    const negroni = cocktails.find((c) => c.id === "negroni");
    const margarita = cocktails.find((c) => c.id === "margarita");

    expect(negroni?.funFact).toContain("Negroni");
    expect(margarita?.funFact).toContain("Tequila");
    expect(negroni?.funFact).not.toBe(margarita?.funFact);
  });

  it("avoids era-default year clustering for the full catalogue", () => {
    const yearCounts = new Map<number, number>();
    for (const c of cocktails) {
      yearCounts.set(c.yearInvented, (yearCounts.get(c.yearInvented) ?? 0) + 1);
    }
    const maxShared = Math.max(...yearCounts.values());
    expect(maxShared).toBeLessThan(25);
  });

  it("gives expanded cocktails unique taglines", () => {
    const pearl = cocktails.find((c) => c.id === "pearl-diver");
    const aku = cocktails.find((c) => c.id === "aku-aku");

    expect(pearl?.cheekyLine).toBeTruthy();
    expect(aku?.cheekyLine).toBeTruthy();
    expect(pearl?.cheekyLine).not.toBe(aku?.cheekyLine);
    expect(pearl?.cheekyLine).not.toBe("Vacation mode: activated.");
  });
});
