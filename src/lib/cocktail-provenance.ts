export type CocktailProvenance = {
  yearInvented?: number | null;
  regionOfOrigin: string;
  sourceAttribution: string;
  funFact: string;
};

import provenanceData from "@/data/cocktail-provenance.json";
import provenanceBatch1 from "@/data/catalogue-provenance-batch-1.json";

type StoredProvenance = CocktailProvenance & Record<string, unknown>;

const provenance: Record<string, StoredProvenance> = {
  ...(provenanceData as Record<string, StoredProvenance>),
  ...(provenanceBatch1 as Record<string, StoredProvenance>),
};

function normalizeProvenance(row: StoredProvenance | undefined): CocktailProvenance | undefined {
  if (!row) return undefined;
  return {
    yearInvented: row.yearInvented ?? undefined,
    regionOfOrigin: row.regionOfOrigin ?? "",
    sourceAttribution: row.sourceAttribution ?? "",
    funFact: row.funFact ?? "",
  };
}

export function getCocktailProvenance(slug: string): CocktailProvenance | undefined {
  return normalizeProvenance(provenance[slug]);
}

export function hasProvenance(slug: string): boolean {
  return slug in provenance;
}

export function getProvenanceCount(): number {
  return Object.keys(provenance).length;
}
