import { describe, expect, it } from "vitest";
import { cocktails } from "@/lib/cocktail-data";
import provenanceData from "@/data/cocktail-provenance.json";
import { getProvenanceCount } from "@/lib/cocktail-provenance";
import { isNoveltyTaglineVoice } from "@/lib/tagline-voice";

describe("cocktail provenance", () => {
  it("covers nearly all catalogue entries", () => {
    expect(getProvenanceCount()).toBeGreaterThanOrEqual(580);
  });

  it("does not store cheekyLine taglines in provenance JSON", () => {
    for (const entry of Object.values(provenanceData)) {
      expect(entry).not.toHaveProperty("cheekyLine");
    }
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

  it("gives tiki classics drink-specific history copy", () => {
    const pearl = cocktails.find((c) => c.id === "pearl-diver");
    const parrot = cocktails.find((c) => c.id === "potted-parrot");
    const qb = cocktails.find((c) => c.id === "qb-cooler");

    expect(pearl?.funFact).toMatch(/Don the Beachcomber|buttered rum/i);
    expect(parrot?.funFact).toMatch(/Trader Vic|Bergeron|Polly/i);
    expect(qb?.funFact).toMatch(/Quiet Birdmen|Don the Beachcomber|Q\.?B/i);
    expect(pearl?.funFact).not.toBe(parrot?.funFact);
    expect(pearl?.funFact).not.toMatch(/sibling pour|undefined/i);
    expect(isNoveltyTaglineVoice(pearl?.funFact ?? "")).toBe(false);
  });
});
