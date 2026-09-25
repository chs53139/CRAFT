import { describe, expect, it, vi } from "vitest";
import { runDeferredInstallPrompt } from "@/lib/pwa/install-flow";

describe("runDeferredInstallPrompt", () => {
  it("returns null when no deferred prompt exists", async () => {
    await expect(runDeferredInstallPrompt(null)).resolves.toBeNull();
  });

  it("returns accepted only when the browser reports acceptance", async () => {
    const prompt = vi.fn().mockResolvedValue(undefined);
    const deferred = {
      prompt,
      userChoice: Promise.resolve({ outcome: "accepted" as const }),
    };
    await expect(runDeferredInstallPrompt(deferred)).resolves.toBe("accepted");
    expect(prompt).toHaveBeenCalledOnce();
  });

  it("returns dismissed when the user declines", async () => {
    const deferred = {
      prompt: vi.fn().mockResolvedValue(undefined),
      userChoice: Promise.resolve({ outcome: "dismissed" as const }),
    };
    await expect(runDeferredInstallPrompt(deferred)).resolves.toBe("dismissed");
  });
});
