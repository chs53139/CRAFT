import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

describe("Install CRAFT UI", () => {
  const prompt = readFileSync(join(process.cwd(), "src/components/InstallCraftPrompt.tsx"), "utf8");
  const more = readFileSync(join(process.cwd(), "src/app/more/page.tsx"), "utf8");

  it("shows iOS instructions instead of a fake install API", () => {
    expect(prompt).toContain('platform === "ios"');
    expect(prompt).toContain("Add to Home Screen");
  });

  it("uses deferred install flow for beforeinstallprompt outcomes", () => {
    expect(prompt).toContain("runDeferredInstallPrompt");
    expect(prompt).toContain('outcome === "accepted"');
    expect(prompt).toContain("install_completed");
  });

  it("keeps manual Install CRAFT on More", () => {
    expect(more).toContain("InstallCraftManualButton");
  });

  it("delays auto prompt and checks engagement", () => {
    expect(prompt).toContain("shouldOfferInstallPrompt");
    expect(prompt).toContain("display-mode: standalone");
    expect(prompt).toContain("2500");
  });
});
