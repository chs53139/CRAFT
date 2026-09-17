import { describe, expect, it } from "vitest";
import { cocktails } from "@/lib/cocktail-data";
import batchProvenance from "@/data/catalogue-provenance-batch-1.json";
import batchCocktails from "@/data/catalogue-batch-1.json";
import { getCocktailProvenance, getProvenanceCount } from "@/lib/cocktail-provenance";
import { isNoveltyTaglineVoice } from "@/lib/tagline-voice";

describe("catalogue batch 1 ingestion", () => {
  it("adds batch cocktails with unique slugs and provenance", () => {
    expect(batchCocktails.length).toBe(84);
    const slugs = new Set(cocktails.map((c) => c.id));
    for (const raw of batchCocktails) {
      expect(slugs.has(raw.slug)).toBe(true);
      expect(getCocktailProvenance(raw.slug)?.funFact).toBeTruthy();
    }
  });

  it("requires source metadata on batch provenance entries", () => {
    for (const [slug, entry] of Object.entries(batchProvenance)) {
      expect(entry.sourceTier).toBeTruthy();
      expect(entry.sourceTitle).toBeTruthy();
      expect(entry.sourceRecipe).toBeTruthy();
      expect(entry.imageStatus).toBe("placeholder");
      expect(slug).toBeTruthy();
    }
  });

  it("avoids novelty taglines in batch fun facts", () => {
    for (const entry of Object.values(batchProvenance)) {
      expect(isNoveltyTaglineVoice(entry.funFact ?? "")).toBe(false);
    }
  });

  it("covers expanded catalogue in provenance count", () => {
    expect(getProvenanceCount()).toBeGreaterThanOrEqual(cocktails.length - 5);
  });
});
