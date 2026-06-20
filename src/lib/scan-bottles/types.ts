export type ScanDetection = {
  detectedBottleName: string;
  likelyCategory: string;
  mappedIngredientId: string | null;
  mappedIngredientName: string | null;
  confidence: number;
  needsReview: boolean;
  notes?: string;
};

export type ScanBottlesResponse = {
  detections: ScanDetection[];
  mock: boolean;
  message?: string;
};

export type RawVisionDetection = {
  detectedBottleName: string;
  likelyCategory?: string;
  suggestedIngredientId?: string | null;
  confidence?: number;
  notes?: string;
};
