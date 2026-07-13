import { getCocktailProvenance } from "@/lib/cocktail-provenance";
import { CocktailEra } from "@/lib/types";

export type CuratedMetadata = {
  yearInvented?: number;
  regionOfOrigin?: string;
  sourceAttribution?: string;
};

/** Curated provenance for well-documented cocktails */
export const CURATED_METADATA: Record<string, CuratedMetadata> = {
  "old-fashioned": { yearInvented: 1880, regionOfOrigin: "United States", sourceAttribution: "Classic American canon" },
  sazerac: { yearInvented: 1850, regionOfOrigin: "New Orleans, USA", sourceAttribution: "New Orleans bar tradition" },
  manhattan: { yearInvented: 1870, regionOfOrigin: "New York, USA", sourceAttribution: "Manhattan Club legend" },
  negroni: { yearInvented: 1919, regionOfOrigin: "Florence, Italy", sourceAttribution: "Caffè Casoni" },
  martinez: { yearInvented: 1880, regionOfOrigin: "United States", sourceAttribution: "Jerry Thomas era" },
  margarita: { yearInvented: 1938, regionOfOrigin: "Mexico", sourceAttribution: "Agave bar tradition" },
  daiquiri: { yearInvented: 1898, regionOfOrigin: "Cuba", sourceAttribution: "Cuban rum culture" },
  "mai-tai": { yearInvented: 1944, regionOfOrigin: "California, USA", sourceAttribution: "Trader Vic / Donn Beach lineage" },
  zombie: { yearInvented: 1934, regionOfOrigin: "Hollywood, USA", sourceAttribution: "Don the Beachcomber" },
  "espresso-martini": { yearInvented: 1983, regionOfOrigin: "London, UK", sourceAttribution: "Dick Bradsell" },
  penicillin: { yearInvented: 2005, regionOfOrigin: "New York, USA", sourceAttribution: "Sam Ross, Milk & Honey" },
  "paper-plane": { yearInvented: 2008, regionOfOrigin: "New York, USA", sourceAttribution: "Sam Ross" },
  "last-word": { yearInvented: 1915, regionOfOrigin: "Detroit, USA", sourceAttribution: "Detroit Athletic Club" },
  "corpse-reviver-no-2": { yearInvented: 1930, regionOfOrigin: "London, UK", sourceAttribution: "Harry Craddock, Savoy Cocktail Book" },
  aviation: { yearInvented: 1911, regionOfOrigin: "New York, USA", sourceAttribution: "Hugo Ensslin" },
  "ramos-gin-fizz": { yearInvented: 1888, regionOfOrigin: "New Orleans, USA", sourceAttribution: "Henry C. Ramos" },
  cosmopolitan: { yearInvented: 1987, regionOfOrigin: "New York, USA", sourceAttribution: "1980s–90s bar scene" },
  "craft-ember-line": { yearInvented: 2024, regionOfOrigin: "CRAFT Bar Lab", sourceAttribution: "CRAFT Original" },
  "craft-velvet-compass": { yearInvented: 2024, regionOfOrigin: "CRAFT Bar Lab", sourceAttribution: "CRAFT Original" },
  "craft-copper-orchard": { yearInvented: 2025, regionOfOrigin: "CRAFT Bar Lab", sourceAttribution: "CRAFT Original" },
  "craft-midnight-saber": { yearInvented: 2025, regionOfOrigin: "CRAFT Bar Lab", sourceAttribution: "CRAFT Original" },
  "craft-tidepool-club": { yearInvented: 2025, regionOfOrigin: "CRAFT Bar Lab", sourceAttribution: "CRAFT Original" },
  "craft-laboratory-no-7": { yearInvented: 2026, regionOfOrigin: "CRAFT Bar Lab", sourceAttribution: "CRAFT Original" },
};

const ERA_YEAR: Record<CocktailEra, number> = {
  "pre-prohibition": 1890,
  "golden-age": 1935,
  midcentury: 1965,
  contemporary: 2005,
  tiki: 1940,
  timeless: 1920,
};

const REGION_BY_FAMILY: Record<string, string> = {
  Tiki: "Polynesian-inspired",
  "Spirit-Forward": "United States",
  Sour: "International",
  Highball: "International",
};

export function resolveMetadata(
  slug: string,
  family: string,
  era: CocktailEra,
  isCraftOriginal: boolean
): Required<Pick<CuratedMetadata, "yearInvented" | "regionOfOrigin" | "sourceAttribution">> {
  const provenance = getCocktailProvenance(slug);
  if (provenance) {
    return {
      yearInvented: provenance.yearInvented,
      regionOfOrigin: provenance.regionOfOrigin,
      sourceAttribution: provenance.sourceAttribution,
    };
  }

  const curated = CURATED_METADATA[slug];
  if (curated?.yearInvented && curated.regionOfOrigin && curated.sourceAttribution) {
    return {
      yearInvented: curated.yearInvented,
      regionOfOrigin: curated.regionOfOrigin,
      sourceAttribution: curated.sourceAttribution,
    };
  }

  return {
    yearInvented: curated?.yearInvented ?? ERA_YEAR[era],
    regionOfOrigin: curated?.regionOfOrigin ?? REGION_BY_FAMILY[family] ?? "International",
    sourceAttribution: isCraftOriginal
      ? "CRAFT Original"
      : curated?.sourceAttribution ?? "CRAFT curated · cocktail.glass corpus",
  };
}

export function inferPopularityScore(
  obscurityScore: number,
  isVerifiedClassic: boolean,
  isWellKnown: boolean
): number {
  let score = Math.round(100 - obscurityScore * 0.82);
  if (isVerifiedClassic) score += 8;
  if (isWellKnown) score += 12;
  return Math.max(1, Math.min(100, score));
}
