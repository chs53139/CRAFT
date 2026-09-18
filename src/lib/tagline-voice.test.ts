import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cocktails } from "@/lib/cocktail-data";
import { isGenericDescription } from "@/lib/description-quality";
import { isNoveltyTaglineVoice } from "@/lib/tagline-voice";

describe("tagline system removed", () => {
  it("flags banned novelty voice examples", () => {
    expect(isNoveltyTaglineVoice("Booze first. Conversation second.")).toBe(true);
    expect(isNoveltyTaglineVoice("Vacation mode: activated.")).toBe(true);
    expect(isNoveltyTaglineVoice("Tiki with conviction.")).toBe(true);
  });

  it("does not expose cheekyLine on catalogue cocktails", () => {
    for (const c of cocktails) {
      expect("cheekyLine" in c).toBe(false);
    }
  });

  it("keeps user-facing descriptions free of novelty tagline voice", () => {
    const bad = cocktails.filter(
      (c) => isNoveltyTaglineVoice(c.description) || isGenericDescription(c.description)
    );
    expect(bad.map((c) => c.id)).toEqual([]);
  });

  it("keeps fun facts free of novelty tagline voice", () => {
    const bad = cocktails.filter((c) => isNoveltyTaglineVoice(c.funFact));
    expect(bad.length).toBe(0);
  });

  it("allows optional subtitles; history stays in funFact", () => {
    expect(cocktails.every((c) => c.funFact.trim().length > 0)).toBe(true);
    const withDescription = cocktails.filter((c) => c.description.trim().length > 0);
    expect(withDescription.length).toBeLessThan(cocktails.length);
  });

  it("does not ship familyDescriptions tagline templates in cocktail-data", () => {
    const source = readFileSync(join(process.cwd(), "src/lib/cocktail-data.ts"), "utf8");
    expect(source).not.toMatch(/familyDescriptions/);
    expect(source).not.toMatch(/Booze first/);
    expect(source).not.toMatch(/cheekyLine/);
  });

  it("does not ship TAGLINE_TEMPLATES or generateCheekyLine in provenance generator", () => {
    const source = readFileSync(
      join(process.cwd(), "scripts/generate-cocktail-provenance.mjs"),
      "utf8"
    );
    expect(source).not.toMatch(/TAGLINE_TEMPLATES/);
    expect(source).not.toMatch(/generateUniqueTagline/);
    expect(source).not.toMatch(/KNOWN_CHEEKY/);
    expect(source).not.toMatch(/generateCheekyLine/);
    expect(source).not.toMatch(/cheekyLine/);
  });
});
