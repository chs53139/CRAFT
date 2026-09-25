"use client";

import { useEffect, useRef, useState } from "react";
import { AppOverlayPortal } from "@/components/AppOverlayPortal";
import { trackProductEvent } from "@/lib/analytics";
import {
  detectInstallPlatform,
  markInstallCompleted,
  markInstallDismissed,
  shouldOfferInstallPrompt,
  type InstallPlatform,
} from "@/lib/pwa/engagement";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallCraftPromptHost() {
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState<InstallPlatform>("other");
  const deferred = useRef<BeforeInstallPromptEvent | null>(null);
  const shown = useRef(false);

  useEffect(() => {
    setPlatform(detectInstallPlatform());

    function onBeforeInstall(e: Event) {
      e.preventDefault();
      deferred.current = e as BeforeInstallPromptEvent;
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  useEffect(() => {
    if (shown.current) return;
    if (!shouldOfferInstallPrompt()) return;
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const timer = window.setTimeout(() => {
      if (shown.current) return;
      shown.current = true;
      setOpen(true);
      trackProductEvent("install_prompt_shown", { platform: detectInstallPlatform() });
    }, 2500);

    return () => window.clearTimeout(timer);
  }, []);

  function dismiss() {
    markInstallDismissed();
    trackProductEvent("install_dismissed", { platform });
    setOpen(false);
  }

  async function startInstall() {
    trackProductEvent("install_started", { platform });
    const prompt = deferred.current;
    if (prompt) {
      await prompt.prompt();
      const choice = await prompt.userChoice;
      if (choice.outcome === "accepted") {
        markInstallCompleted();
        trackProductEvent("install_completed", { platform });
      }
      setOpen(false);
      return;
    }
    setOpen(true);
  }

  if (!open) return null;

  return (
    <AppOverlayPortal active={open}>
      <div className="find-nearby-backdrop" role="presentation" onClick={dismiss}>
        <div
          className="find-nearby-sheet animate-fade-in-up"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-craft-title"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="eyebrow text-[var(--accent-dim)]">Install</p>
          <h2 id="install-craft-title" className="find-nearby-title">
            Keep CRAFT behind the bar
          </h2>
          <p className="find-nearby-copy">
            Add CRAFT to your Home Screen for quick access when you&apos;re pouring.
          </p>

          {platform === "ios" ? (
            <ol className="install-steps mt-4 space-y-2 text-sm text-[var(--foreground)]">
              <li>1. Tap Share in Safari</li>
              <li>2. Add to Home Screen</li>
              <li>3. Open CRAFT from your Home Screen</li>
            </ol>
          ) : deferred.current ? (
            <button type="button" className="btn-primary mt-4 w-full" onClick={() => void startInstall()}>
              Install CRAFT
            </button>
          ) : (
            <p className="mt-4 text-sm text-[var(--muted)]">
              Use your browser menu to install this app or add it to your Home Screen.
            </p>
          )}

          <div className="find-nearby-actions mt-5">
            <button type="button" className="btn-secondary flex-1" onClick={dismiss}>
              Not now
            </button>
          </div>
        </div>
      </div>
    </AppOverlayPortal>
  );
}

export function InstallCraftManualButton() {
  const [open, setOpen] = useState(false);
  const platform = detectInstallPlatform();

  return (
    <>
      <button type="button" className="account-row w-full text-left" onClick={() => setOpen(true)}>
        <div>
          <p className="text-sm font-semibold text-[var(--foreground)]">Install CRAFT</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">Add to Home Screen for quick access</p>
        </div>
        <span className="text-[var(--accent)]">→</span>
      </button>
      {open ? (
        <AppOverlayPortal active={open}>
          <div className="find-nearby-backdrop" role="presentation" onClick={() => setOpen(false)}>
            <div className="find-nearby-sheet" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <p className="eyebrow text-[var(--accent-dim)]">Install CRAFT</p>
              {platform === "ios" ? (
                <ol className="install-steps mt-3 space-y-2 text-sm text-[var(--foreground)]">
                  <li>Share → Add to Home Screen → Add</li>
                </ol>
              ) : (
                <p className="mt-3 text-sm text-[var(--muted)]">
                  Open the browser menu and choose Install app or Add to Home Screen.
                </p>
              )}
              <button type="button" className="btn-secondary mt-4 w-full" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </AppOverlayPortal>
      ) : null}
    </>
  );
}
