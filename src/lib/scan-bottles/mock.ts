import { finalizeDetections } from "./mapping";
import { ScanBottlesResponse } from "./types";

export function getMockScanResults(): ScanBottlesResponse {
  return {
    mock: true,
    message: "Demo scan — add OPENAI_API_KEY to enable live bottle recognition.",
    detections: finalizeDetections([
      {
        detectedBottleName: "Buffalo Trace Kentucky Straight Bourbon",
        likelyCategory: "spirit",
        suggestedIngredientId: "bourbon",
        confidence: 0.91,
      },
      {
        detectedBottleName: "Tanqueray London Dry Gin",
        likelyCategory: "spirit",
        suggestedIngredientId: "london-dry-gin",
        confidence: 0.89,
      },
      {
        detectedBottleName: "Campari",
        likelyCategory: "liqueur",
        suggestedIngredientId: "campari",
        confidence: 0.94,
      },
      {
        detectedBottleName: "Dark rum (label partly hidden)",
        likelyCategory: "spirit",
        confidence: 0.58,
        notes: "Label is partially obscured — please confirm the rum style.",
      },
    ]),
  };
}
