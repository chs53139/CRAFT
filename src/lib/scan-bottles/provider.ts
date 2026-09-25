import { finalizeDetections } from "@/lib/scan-bottles/mapping";
import { RawVisionDetection, ScanBottlesResponse } from "@/lib/scan-bottles/types";

export type BarScanProviderState = "configured" | "unconfigured" | "error";

export type BarScanProvider = {
  id: string;
  state: BarScanProviderState;
  scanImage(input: { imageBase64: string; mimeType: string }): Promise<ScanBottlesResponse>;
};

/** No remote vision API — honest unconfigured response. */
export const unconfiguredBarScanProvider: BarScanProvider = {
  id: "unconfigured",
  state: "unconfigured",
  async scanImage() {
    return {
      mock: false,
      unconfigured: true,
      detections: [],
      message:
        "Bottle recognition is not configured on this server. Add bottles manually or check back after vision provider setup.",
    };
  },
};

export function createBarScanProviderFromEnv(): BarScanProvider {
  const configured = (process.env.BAR_SCAN_PROVIDER ?? "").trim().toLowerCase();
  if (configured && configured !== "none" && configured !== "unconfigured") {
    return unconfiguredBarScanProvider;
  }
  return unconfiguredBarScanProvider;
}

/** Test-only helper to finalize raw detections through mapping. */
export function buildScanResponseFromRaw(
  raw: RawVisionDetection[],
  options?: { mock?: boolean; message?: string }
): ScanBottlesResponse {
  return {
    mock: options?.mock ?? false,
    detections: finalizeDetections(raw),
    message: options?.message,
  };
}
