import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createBarScanProviderFromEnv } from "@/lib/scan-bottles/provider";
import { sanitizeAnalyticsPayload } from "@/lib/analytics/sanitize-payload";
import { getCocktailDisplaySubtitle } from "@/lib/copy-hierarchy";
import { cocktails } from "@/lib/cocktail-data";
import { shouldOfferInstallPrompt } from "@/lib/pwa/engagement";

describe("Growth Pass 2 regressions", () => {
  it("bar scan provider is unconfigured without fake detections", async () => {
    const provider = createBarScanProviderFromEnv();
    const result = await provider.scanImage({ imageBase64: "abc", mimeType: "image/jpeg" });
    expect(result.unconfigured).toBe(true);
    expect(result.detections).toEqual([]);
    expect(result.mock).toBe(false);
  });

  it("scan API route does not import mock results", () => {
    const source = readFileSync(
      join(process.cwd(), "src/app/api/scan-bottles/route.ts"),
      "utf8"
    );
    expect(source).not.toContain("getMockScanResults");
  });

  it("blocks image data in analytics payloads", () => {
    const out = sanitizeAnalyticsPayload({
      ingredientId: "campari",
      imageBase64: "secret",
      photoUrl: "x",
    });
    expect(JSON.stringify(out)).not.toMatch(/secret|photo/i);
  });

  it("install prompt not offered without browser engagement (node env)", () => {
    expect(shouldOfferInstallPrompt()).toBe(false);
  });

  it("blank subtitles remain valid", () => {
    const blank = cocktails.filter(
      (c) => !getCocktailDisplaySubtitle(c.description, c.funFact)
    );
    expect(blank.length).toBeGreaterThan(100);
  });

  it("Home count logic unchanged", () => {
    const home = readFileSync(join(process.cwd(), "src/app/page.tsx"), "utf8");
    expect(home).toContain("countWithinReach");
    expect(home).toContain("MakeableCountBanner");
  });
});
