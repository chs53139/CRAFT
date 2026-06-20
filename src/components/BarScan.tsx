"use client";

import { useMemo, useRef, useState } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { ScanDetection, ScanBottlesResponse } from "@/lib/scan-bottles/types";

type Step = "capture" | "scanning" | "review" | "done";

type Props = {
  open: boolean;
  onClose: () => void;
  barIds: string[];
  onConfirm: (ingredientIds: string[]) => void;
};

const MAX_FILE_BYTES = 8 * 1024 * 1024;

function defaultSelected(detections: ScanDetection[], barIds: string[]): Set<number> {
  const barSet = new Set(barIds);
  const selected = new Set<number>();

  detections.forEach((item, index) => {
    if (!item.mappedIngredientId || barSet.has(item.mappedIngredientId)) return;
    if (!item.needsReview) selected.add(index);
  });

  return selected;
}

export function BarScan({ open, onClose, barIds, onConfirm }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("capture");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanBottlesResponse | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [addedCount, setAddedCount] = useState(0);

  const reviewItems = useMemo(() => result?.detections ?? [], [result]);

  if (!open) return null;

  function reset() {
    setStep("capture");
    setPreviewUrl(null);
    setFileName(null);
    setError(null);
    setResult(null);
    setSelected(new Set());
    setAddedCount(0);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleClose() {
    reset();
    onClose();
  }

  async function handleFileChange(file: File | null) {
    setError(null);
    setResult(null);

    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please choose a photo of your bottles.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("Photo must be under 8 MB.");
      return;
    }

    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  async function handleScan() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Add a photo of your bar shelf first.");
      return;
    }

    setStep("scanning");
    setError(null);

    try {
      const base64 = await fileToBase64(file);
      const response = await fetch("/api/scan-bottles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type || "image/jpeg",
        }),
      });

      const data = (await response.json()) as ScanBottlesResponse & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Scan failed. Try another photo.");
      }

      if (data.detections.length === 0) {
        throw new Error("No bottles detected. Try a clearer, well-lit photo.");
      }

      setResult(data);
      setSelected(defaultSelected(data.detections, barIds));
      setStep("review");
    } catch (scanError) {
      setStep("capture");
      setError(scanError instanceof Error ? scanError.message : "Scan failed.");
    }
  }

  function toggleItem(index: number) {
    const item = reviewItems[index];
    if (!item?.mappedIngredientId) return;
    if (barIds.includes(item.mappedIngredientId)) return;

    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  function handleConfirm() {
    const ids = reviewItems
      .filter((_, index) => selected.has(index))
      .map((item) => item.mappedIngredientId)
      .filter((id): id is string => !!id);

    if (ids.length === 0) {
      setError("Select at least one ingredient to add.");
      return;
    }

    onConfirm(ids);
    setAddedCount(ids.length);
    setStep("done");
    setError(null);
  }

  const selectedCount = selected.size;

  return (
    <div className="bar-scan-overlay" role="dialog" aria-modal="true" aria-labelledby="bar-scan-title">
      <div className="bar-scan-panel animate-fade-in">
        <div className="bar-scan-header">
          <div>
            <p className="eyebrow text-[var(--accent-dim)]">Scan My Bar</p>
            <h2 id="bar-scan-title" className="screen-title mt-1">
              {step === "capture" && "Snap your shelf"}
              {step === "scanning" && "Reading labels…"}
              {step === "review" && "Confirm additions"}
              {step === "done" && "Bar updated"}
            </h2>
          </div>
          <button type="button" className="bar-scan-close" onClick={handleClose} aria-label="Close">
            ✕
          </button>
        </div>

        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} onDismiss={() => setError(null)} />
          </div>
        )}

        {step === "capture" && (
          <div className="bar-scan-body">
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              Take or upload a photo of your bottles. CRAFT will suggest matches — nothing is added until
              you confirm.
            </p>

            <label className="bar-scan-upload">
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="sr-only"
                onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
              />
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={previewUrl} alt="Bar preview" className="bar-scan-preview" />
              ) : (
                <div className="bar-scan-upload-placeholder">
                  <span className="text-3xl" aria-hidden>
                    📷
                  </span>
                  <p className="mt-3 text-sm font-medium text-[var(--foreground)]">
                    Tap to take a photo or choose one
                  </p>
                  <p className="mt-1 text-xs text-[var(--muted)]">JPG, PNG, or WebP · up to 8 MB</p>
                </div>
              )}
            </label>

            {fileName && <p className="bar-scan-filename">{fileName}</p>}

            <button type="button" className="btn-primary mt-4 w-full" onClick={handleScan}>
              Scan bottles
            </button>
          </div>
        )}

        {step === "scanning" && (
          <div className="bar-scan-body bar-scan-thinking">
            <div className="bar-scan-spinner" aria-hidden />
            <p className="mt-4 text-sm text-[var(--muted)]">Identifying bottles and mapping to CRAFT…</p>
          </div>
        )}

        {step === "review" && result && (
          <div className="bar-scan-body">
            {result.mock && (
              <p className="bar-scan-demo-note">{result.message ?? "Using demo scan results."}</p>
            )}

            <p className="text-sm text-[var(--muted)]">
              Uncheck anything that looks wrong. Items marked <strong>Needs Review</strong> should be
              double-checked before adding.
            </p>

            <ul className="bar-scan-results">
              {reviewItems.map((item, index) => {
                const alreadyInBar =
                  !!item.mappedIngredientId && barIds.includes(item.mappedIngredientId);
                const disabled = !item.mappedIngredientId || alreadyInBar;
                const checked = selected.has(index);

                return (
                  <li key={`${item.detectedBottleName}-${index}`} className="bar-scan-result-item">
                    <label className={`bar-scan-result-label ${disabled ? "bar-scan-result-disabled" : ""}`}>
                      <input
                        type="checkbox"
                        className="bar-scan-checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => toggleItem(index)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-[var(--foreground)]">
                            {item.detectedBottleName}
                          </p>
                          {item.needsReview && (
                            <span className="bar-scan-review-badge">Needs Review</span>
                          )}
                          {alreadyInBar && (
                            <span className="bar-scan-owned-badge">In bar</span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[var(--muted)]">
                          {item.mappedIngredientName
                            ? `CRAFT: ${item.mappedIngredientName}`
                            : "No CRAFT match found"}
                          {" · "}
                          {item.likelyCategory}
                          {" · "}
                          {Math.round(item.confidence * 100)}% confidence
                        </p>
                        {item.notes && (
                          <p className="mt-1 text-xs italic text-[var(--accent-dim)]">{item.notes}</p>
                        )}
                      </div>
                    </label>
                  </li>
                );
              })}
            </ul>

            <div className="bar-scan-actions">
              <button type="button" className="btn-secondary flex-1" onClick={() => setStep("capture")}>
                Retake
              </button>
              <button
                type="button"
                className="btn-primary flex-1"
                onClick={handleConfirm}
                disabled={selectedCount === 0}
              >
                Add {selectedCount} ingredient{selectedCount === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        )}

        {step === "done" && (
          <div className="bar-scan-body bar-scan-done">
            <p className="text-sm text-[var(--foreground)]">
              Added {addedCount} ingredient{addedCount === 1 ? "" : "s"} to My Bar.
            </p>
            <button type="button" className="btn-primary mt-4 w-full" onClick={handleClose}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}
