"use client";

import { useCallback, useState } from "react";
import { SharePayload, sharePayload } from "@/lib/share";

type Props = {
  payload: SharePayload;
  className?: string;
  label?: string;
  compact?: boolean;
};

export function ShareButton({ payload, className = "", label, compact }: Props) {
  const [status, setStatus] = useState<"idle" | "copied" | "shared">("idle");

  const handleShare = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        const result = await sharePayload(payload);
        setStatus(result);
        window.setTimeout(() => setStatus("idle"), 2200);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setStatus("copied");
        window.setTimeout(() => setStatus("idle"), 2200);
      }
    },
    [payload]
  );

  const ariaLabel =
    status === "copied"
      ? "Link copied"
      : status === "shared"
        ? "Shared"
        : label ?? "Share";

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={ariaLabel}
      title={ariaLabel}
      className={`share-button ${compact ? "share-button-compact" : ""} ${className}`}
    >
      <span aria-hidden className="share-button-icon">
        {status === "copied" ? (
          "✓"
        ) : status === "shared" ? (
          "↗"
        ) : (
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v10" strokeLinecap="round" />
            <path d="M8 9l4-4 4 4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 19h14" strokeLinecap="round" />
          </svg>
        )}
      </span>
      {!compact && status !== "idle" ? (
        <span className="share-button-label">
          {status === "copied" ? "Copied" : "Shared"}
        </span>
      ) : null}
    </button>
  );
}
