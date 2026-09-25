export type InstallPromptChoice = "accepted" | "dismissed";

export type DeferredInstallPrompt = {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: InstallPromptChoice }>;
};

/** Runs the browser install prompt; returns outcome or null when no prompt is available. */
export async function runDeferredInstallPrompt(
  deferred: DeferredInstallPrompt | null
): Promise<InstallPromptChoice | null> {
  if (!deferred) return null;
  await deferred.prompt();
  const choice = await deferred.userChoice;
  return choice.outcome;
}
