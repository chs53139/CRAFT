export type CocktailProvenance = {
  yearInvented: number;
  regionOfOrigin: string;
  sourceAttribution: string;
  funFact: string;
  cheekyLine: string;
};

import provenanceData from "@/data/cocktail-provenance.json";

const provenance = provenanceData as Record<string, CocktailProvenance>;

export function getCocktailProvenance(slug: string): CocktailProvenance | undefined {
  return provenance[slug];
}

export function hasProvenance(slug: string): boolean {
  return slug in provenance;
}

export function getProvenanceCount(): number {
  return Object.keys(provenance).length;
}
