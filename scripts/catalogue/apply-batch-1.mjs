/**
 * Validate BATCH_1_CANDIDATES and write catalogue batch output files.
 * Run: node scripts/catalogue/apply-batch-1.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { BATCH_1_CANDIDATES } from "./batch-1-candidates.mjs";
import { validateCandidates } from "./validate-candidates.mjs";
import { catalogueRoot, loadExistingSlugs } from "./lib/catalogue-slugs.mjs";

const root = catalogueRoot;
const reportsDir = path.join(root, "reports");
fs.mkdirSync(reportsDir, { recursive: true });

const existingSlugs = loadExistingSlugs();
const validation = validateCandidates(BATCH_1_CANDIDATES, existingSlugs);

if (!validation.ok) {
  console.error("apply-batch-1: validation failed");
  for (const e of validation.errors) console.error(" ", e);
  process.exit(1);
}

const cocktails = BATCH_1_CANDIDATES.map((row) => row.cocktail);
const provenance = {};

for (const row of BATCH_1_CANDIDATES) {
  const slug = row.cocktail.slug;
  provenance[slug] = {
    classification: row.classification,
    verificationState: row.verificationState,
    sourceTier: row.sourceTier,
    sourceTitle: row.sourceTitle,
    sourceAuthor: row.sourceAuthor,
    sourceUrl: row.sourceUrl,
    sourceRecipe: row.sourceRecipe,
    recipeProvenance: row.recipeProvenance,
    historicalNotes: row.historicalNotes,
    creator: row.creator,
    bar: row.bar,
    city: row.city,
    creationYear: row.creationYear,
    alternateNames: row.alternateNames,
    imageStatus: row.imageStatus,
    rarity: row.rarity,
    funFact: row.funFact,
    yearInvented: row.yearInvented,
    regionOfOrigin: row.regionOfOrigin,
    sourceAttribution: [row.sourceTitle, row.sourceAuthor].filter(Boolean).join(" — "),
  };
}

const batchPath = path.join(root, "src/data/catalogue-batch-1.json");
const provPath = path.join(root, "src/data/catalogue-provenance-batch-1.json");
const reportPath = path.join(reportsDir, "catalogue-expansion-report.json");

fs.writeFileSync(batchPath, JSON.stringify(cocktails, null, 2) + "\n");
fs.writeFileSync(provPath, JSON.stringify(provenance, null, 2) + "\n");

const report = {
  generatedAt: new Date().toISOString(),
  batch: "batch-1",
  candidatesValidated: BATCH_1_CANDIDATES.length,
  cocktailsWritten: cocktails.length,
  provenanceEntries: Object.keys(provenance).length,
  slugsAdded: validation.slugs.sort(),
  outputs: {
    cocktails: "src/data/catalogue-batch-1.json",
    provenance: "src/data/catalogue-provenance-batch-1.json",
  },
};

fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + "\n");

console.log(JSON.stringify(report, null, 2));
