/**
 * Catalogue integrity audit. Run: node scripts/audit-catalogue.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), "utf8"));
}

const raw = [
  ...loadJson("src/data/cocktails.json"),
  ...loadJson("src/data/cocktails-expanded.json"),
  ...loadJson("src/data/catalogue-batch-1.json"),
  ...loadJson("src/data/craft-originals.json"),
  ...loadJson("src/data/mocktails.json"),
];

const provenance = loadJson("src/data/cocktail-provenance.json");
const manifest = loadJson("src/data/cocktail-image-manifest.json");
const overrideTs = fs.readFileSync(path.join(root, "src/lib/cocktail-image-overrides.ts"), "utf8");
const overrides = {};
for (const match of overrideTs.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  if (match[1] !== "Record") overrides[match[1]] = match[2];
}

const GENERIC_PATTERNS = [
  /^sharp citrus meets spirit/i,
  /^booze first/i,
  /^tall, cold, and dangerously/i,
  /^a refreshing blend/i,
  /^a sophisticated cocktail/i,
  /^this classic cocktail combines/i,
  /^bright, balanced and refreshing/i,
  /^a delightful combination/i,
  /^zero-proof pour — full flavor/i,
];

const slugMap = new Map();
const nameMap = new Map();
const descriptionCounts = new Map();
const imageSlugCounts = new Map();

for (const c of raw) {
  slugMap.set(c.slug, (slugMap.get(c.slug) ?? 0) + 1);
  const key = c.name.toLowerCase().trim();
  nameMap.set(key, (nameMap.get(key) ?? 0) + 1);
}

const uniqueSlugs = [...new Set(raw.map((c) => c.slug))];
const tiki = uniqueSlugs.filter((slug) => {
  const c = raw.find((x) => x.slug === slug);
  return c?.family === "Tiki" || c?.tags?.includes("tiki");
});

let genericDescriptions = 0;
let missingProvenance = 0;
for (const slug of uniqueSlugs) {
  const c = raw.find((x) => x.slug === slug);
  const prov = provenance[slug];
  if (!prov) missingProvenance++;
  const familyDesc = c?.family ?? "Other";
  if (GENERIC_PATTERNS.some((p) => p.test(familyDesc))) genericDescriptions++;
}

let imageDirect = 0;
let imageTrusted = 0;
let imageMissing = 0;
for (const slug of uniqueSlugs) {
  const entry = manifest.entries?.[slug];
  if (entry?.tier === "direct") {
    imageDirect++;
    imageSlugCounts.set(slug, (imageSlugCounts.get(slug) ?? 0) + 1);
  } else if (entry?.tier === "trusted-override") {
    imageTrusted++;
    const target = overrides[slug] ?? entry.cdnSlug ?? slug;
    imageSlugCounts.set(target, (imageSlugCounts.get(target) ?? 0) + 1);
  } else {
    imageMissing++;
  }
}

const duplicateSlugs = [...slugMap.entries()].filter(([, n]) => n > 1);
const duplicateNames = [...nameMap.entries()].filter(([, n]) => n > 1);
const sharedImages = [...imageSlugCounts.entries()].filter(([, n]) => n > 5);

const report = {
  totalRawRows: raw.length,
  uniqueSlugs: uniqueSlugs.length,
  duplicateSlugEntries: duplicateSlugs.length,
  duplicateNames: duplicateNames.slice(0, 20),
  tikiCount: tiki.length,
  missingProvenance,
  sharedImageTargetsOver5: sharedImages.length,
  topSharedImages: sharedImages.sort((a, b) => b[1] - a[1]).slice(0, 10),
  imageDirect,
  imageTrustedOverride: imageTrusted,
  imageMissingPlaceholder: imageMissing,
  overrideMapSize: Object.keys(overrides).length,
};

console.log(JSON.stringify(report, null, 2));
