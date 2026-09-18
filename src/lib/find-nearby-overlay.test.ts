import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Find Nearby global overlay", () => {
  it("portals sheet to document body via AppOverlayPortal", () => {
    const sheet = readFileSync(join(process.cwd(), "src/components/FindNearbySheet.tsx"), "utf8");
    expect(sheet).toContain("AppOverlayPortal");
    const portal = readFileSync(join(process.cwd(), "src/components/AppOverlayPortal.tsx"), "utf8");
    expect(portal).toContain("document.body");
  });

  it("uses fixed viewport backdrop styling", () => {
    const css = readFileSync(join(process.cwd(), "src/app/globals.css"), "utf8");
    expect(css).toMatch(/\.find-nearby-backdrop[\s\S]*position:\s*fixed/);
  });

  it("stops card navigation when opening from card button", () => {
    const sheet = readFileSync(join(process.cwd(), "src/components/FindNearbySheet.tsx"), "utf8");
    expect(sheet).toContain("stopPropagation");
    expect(sheet).toContain("find_nearby_clicked");
    expect(sheet).toContain("context");
  });

  it("CocktailCard prevents link navigation for Find Nearby", () => {
    const card = readFileSync(join(process.cwd(), "src/components/CocktailCard.tsx"), "utf8");
    expect(card).toContain("stopPropagation");
  });
});
