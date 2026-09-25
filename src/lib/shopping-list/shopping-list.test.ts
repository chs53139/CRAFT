import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { appendShoppingListItem } from "@/lib/shopping-list/mutations";
import { sanitizeAnalyticsPayload } from "@/lib/analytics/sanitize-payload";
import { ingredientUnlockPreview } from "@/lib/bar-intelligence/bar-health";
import { matchCocktails } from "@/lib/cocktail-matching";
import { countUnionUnlocks } from "@/lib/shopping-list/unlock-union";

describe("shopping list", () => {
  it("does not duplicate ingredients", () => {
    const row = { ingredientId: "campari", addedAt: "2026-01-01T00:00:00.000Z" };
    const first = appendShoppingListItem([], row);
    expect(first.added).toBe(true);
    expect(first.items).toHaveLength(1);

    const second = appendShoppingListItem(first.items, {
      ...row,
      addedAt: "2026-01-02T00:00:00.000Z",
    });
    expect(second.added).toBe(false);
    expect(second.items).toHaveLength(1);
  });

  it("supports find_nearby source in Find Nearby sheet", () => {
    const sheet = readFileSync(join(process.cwd(), "src/components/FindNearbySheet.tsx"), "utf8");
    expect(sheet).toContain('source="find_nearby"');
    expect(sheet).toContain('presentation="sheet"');
  });

  it("does not put ZIP into shopping list analytics payloads", () => {
    const out = sanitizeAnalyticsPayload({
      ingredientId: "campari",
      source: "find_nearby",
      postalCode: "91384",
      zip: "91384",
    });
    const serialized = JSON.stringify(out);
    expect(serialized).not.toMatch(/91384|postal|zip/i);
    expect(out).toMatchObject({ ingredientId: "campari", source: "find_nearby" });
  });

  it("union unlock math unchanged (no double-count vs sum of singles)", () => {
    const bar = ["london-dry-gin", "sweet-vermouth"];
    const matches = matchCocktails(bar);
    const sumSingles =
      ingredientUnlockPreview(bar, "campari", matches).unlocks +
      ingredientUnlockPreview(bar, "aperol", matches).unlocks;
    const union = countUnionUnlocks(bar, ["campari", "aperol"], matches);
    expect(union.count).toBeLessThanOrEqual(sumSingles);
  });
});
