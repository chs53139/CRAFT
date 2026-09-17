/**
 * Catalogue gap audit vs canonical target checklist.
 * Run: node scripts/catalogue/gap-audit.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reportsDir = path.join(root, "reports");
fs.mkdirSync(reportsDir, { recursive: true });

function loadCatalogue() {
  const parts = [
    "src/data/cocktails.json",
    "src/data/cocktails-expanded.json",
    "src/data/craft-originals.json",
    "src/data/mocktails.json",
    "src/data/catalogue-batch-1.json",
  ];
  const raw = [];
  for (const rel of parts) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) continue;
    raw.push(...JSON.parse(fs.readFileSync(full, "utf8")));
  }
  const map = new Map();
  for (const c of raw) map.set(c.slug, c);
  return { raw, unique: [...map.values()], slugs: new Set(map.keys()) };
}

const TARGET_SLUGS = JSON.parse(
  fs.readFileSync(path.join(root, "scripts/catalogue/target-canonical-slugs.json"), "utf8")
);

const { unique, slugs } = loadCatalogue();

const byFamily = {};
const byTag = { tiki: 0, "modern-classic": 0, historical: 0 };
const eraProxy = { pre1920: 0, midcentury: 0, contemporary: 0 };

for (const c of unique) {
  byFamily[c.family] = (byFamily[c.family] ?? 0) + 1;
  if (c.family === "Tiki" || c.tags?.includes("tiki")) byTag.tiki++;
  if (c.tags?.includes("modern-classic")) byTag["modern-classic"]++;
  if (c.tags?.includes("historical")) byTag.historical++;
}

const missingTargets = TARGET_SLUGS.filter((slug) => !slugs.has(slug));
const presentTargets = TARGET_SLUGS.filter((slug) => slugs.has(slug));

const report = {
  generatedAt: new Date().toISOString(),
  catalogueBefore: {
    totalUnique: unique.length,
    alcoholicEstimate: unique.filter((c) => !c.tags?.includes("mocktail")).length,
    mocktails: unique.filter((c) => c.tags?.includes("mocktail")).length,
    byFamily,
    tikiTagged: byTag.tiki,
    modernClassicTagged: byTag["modern-classic"],
  },
  targetChecklist: {
    total: TARGET_SLUGS.length,
    present: presentTargets.length,
    missing: missingTargets.length,
    missingSlugs: missingTargets,
  },
  overrepresentedFamilies: Object.entries(byFamily)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5),
  notes: [
    "Target list is a canonical gap checklist — not every missing slug is auto-ingested.",
    "Expansion batch must pass source-first validation separately.",
  ],
};

const outPath = path.join(reportsDir, "catalogue-gap-audit.json");
fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
console.log(`\nWrote ${outPath}`);
