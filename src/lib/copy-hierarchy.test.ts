import { describe, expect, it } from "vitest";
import { cocktails } from "@/lib/cocktail-data";
import {
  auditCatalogueCopyHierarchy,
  extractFlavorSubtitleFromFunFact,
  getCocktailDisplaySubtitle,
  getHistoryDisplayText,
  isHistoricalProvenanceSentence,
  isMaterialDuplicateCopy,
} from "@/lib/copy-hierarchy";
import { isGenericDescription } from "@/lib/description-quality";

describe("copy hierarchy", () => {
  it("detects normalized duplicate subtitle and history", () => {
    const a = "Created at Trader Vic's by Victor Bergeron in 1944.";
    const b = "Trader Vic created the drink in 1944.";
    expect(isMaterialDuplicateCopy(a, b)).toBe(true);
  });

  it("allows blank subtitle", () => {
    expect(getCocktailDisplaySubtitle("", "Created in 1930 at the Savoy.")).toBe("");
    expect(extractFlavorSubtitleFromFunFact("Created in 1930 at the Savoy.")).toBe("");
  });

  it("keeps distinct flavor subtitle separate from history", () => {
    const funFact =
      "Allspice dram turns a plain bourbon sour into something that smells like Kingston spice markets. Named for the Lion's Tail tavern legend in Kingston.";
    const subtitle = extractFlavorSubtitleFromFunFact(funFact);
    expect(subtitle.length).toBeGreaterThan(10);
    const history = getHistoryDisplayText(funFact, subtitle);
    expect(history.toLowerCase()).not.toContain("allspice dram");
    expect(isMaterialDuplicateCopy(subtitle, history)).toBe(false);
  });

  it("catalogue-wide: no display subtitle duplicates history", () => {
    const audit = auditCatalogueCopyHierarchy(
      cocktails.map((c) => ({ id: c.id, description: c.description, funFact: c.funFact }))
    );
    for (const row of audit.rows) {
      if (!row.subtitleNow) continue;
      const cocktail = cocktails.find((c) => c.id === row.slug)!;
      const historyOnScreen = getHistoryDisplayText(cocktail.funFact, row.subtitleNow);
      expect(isMaterialDuplicateCopy(row.subtitleNow, historyOnScreen)).toBe(false);
      expect(isGenericDescription(row.subtitleNow)).toBe(false);
    }
  });

  it("reports catalogue audit stats", () => {
    const audit = auditCatalogueCopyHierarchy(
      cocktails.map((c) => ({ id: c.id, description: c.description, funFact: c.funFact }))
    );
    expect(audit.blankSubtitle + audit.distinctSubtitle).toBe(cocktails.length);

    let legacyDuplicates = 0;
    for (const c of cocktails) {
      const legacyLead =
        c.funFact.match(/[^.!?]+[.!?]+/g)?.slice(0, 2).join(" ").trim() ?? c.funFact.trim();
      if (
        legacyLead &&
        (isMaterialDuplicateCopy(legacyLead, c.funFact) ||
          isHistoricalProvenanceSentence(legacyLead.split(".")[0] ?? legacyLead))
      ) {
        legacyDuplicates += 1;
      }
    }
    expect(legacyDuplicates).toBeGreaterThan(50);
  });
});
