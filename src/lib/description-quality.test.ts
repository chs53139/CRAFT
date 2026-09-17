import { describe, expect, it } from "vitest";
import { cocktails } from "@/lib/cocktail-data";
import { findDuplicateDescriptions, isGenericDescription } from "@/lib/description-quality";

describe("description quality", () => {
  it("flags known generic templates", () => {
    expect(isGenericDescription("Sharp citrus meets spirit. Clean and confident.")).toBe(true);
    expect(isGenericDescription("Negroni — stirred Spirit-Forward with gin, campari, sweet vermouth.")).toBe(
      false
    );
  });

  it("keeps duplicate catalogue descriptions low", () => {
    const duplicates = findDuplicateDescriptions(cocktails.map((c) => c.description));
    expect(duplicates.size).toBeLessThan(12);
  });

  it("avoids banned generic templates in catalogue blurbs", () => {
    const bad = cocktails.filter((c) => isGenericDescription(c.description));
    expect(bad.length).toBeLessThan(5);
  });
});
