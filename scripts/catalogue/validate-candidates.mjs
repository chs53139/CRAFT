/**
 * Validate expansion batch candidates against CRAFT catalogue rules.
 * Run: node scripts/catalogue/validate-candidates.mjs [path/to/candidates.mjs]
 */
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadExistingSlugs } from "./lib/catalogue-slugs.mjs";

const SOURCE_TIERS = new Set([
  "primary_authoritative",
  "high_quality_secondary",
  "other_verified",
]);

const RARITIES = new Set(["classic", "well_known", "hidden_gem", "deep_cut"]);

const REQUIRED_TOP = [
  "classification",
  "verificationState",
  "sourceTier",
  "sourceTitle",
  "sourceAuthor",
  "sourceUrl",
  "sourceRecipe",
  "recipeProvenance",
  "historicalNotes",
  "creator",
  "bar",
  "city",
  "creationYear",
  "alternateNames",
  "imageStatus",
  "rarity",
  "funFact",
  "yearInvented",
  "regionOfOrigin",
  "cocktail",
];

const REQUIRED_COCKTAIL = [
  "name",
  "slug",
  "glass",
  "family",
  "method",
  "tags",
  "ingredients",
  "garnish",
  "preparation",
];

/**
 * @param {unknown[]} candidates
 * @param {Set<string>} existingSlugs
 */
export function validateCandidates(candidates, existingSlugs) {
  const errors = [];
  const seen = new Set();

  if (!Array.isArray(candidates)) {
    return { ok: false, errors: ["Candidates must be an array"], slugs: [] };
  }

  for (let i = 0; i < candidates.length; i++) {
    const row = candidates[i];
    const prefix = `[${i}]`;

    for (const key of REQUIRED_TOP) {
      if (!(key in row)) errors.push(`${prefix} missing field: ${key}`);
    }

    if (row.classification !== "new_canonical") {
      errors.push(`${prefix} classification must be new_canonical`);
    }
    if (row.verificationState !== "verified") {
      errors.push(`${prefix} verificationState must be verified`);
    }
    if (!SOURCE_TIERS.has(row.sourceTier)) {
      errors.push(`${prefix} invalid sourceTier: ${row.sourceTier}`);
    }
    if (row.imageStatus !== "placeholder") {
      errors.push(`${prefix} imageStatus must be placeholder`);
    }
    if (!RARITIES.has(row.rarity)) {
      errors.push(`${prefix} invalid rarity: ${row.rarity}`);
    }
    if (!Array.isArray(row.alternateNames)) {
      errors.push(`${prefix} alternateNames must be an array`);
    }

    const c = row.cocktail;
    if (!c || typeof c !== "object") {
      errors.push(`${prefix} cocktail must be an object`);
      continue;
    }

    for (const key of REQUIRED_COCKTAIL) {
      if (!(key in c)) errors.push(`${prefix} cocktail missing: ${key}`);
    }

    const slug = c.slug;
    if (typeof slug !== "string" || !slug) {
      errors.push(`${prefix} invalid slug`);
      continue;
    }

    if (seen.has(slug)) errors.push(`${prefix} duplicate batch slug: ${slug}`);
    seen.add(slug);

    if (existingSlugs.has(slug)) {
      errors.push(`${prefix} slug already in catalogue: ${slug}`);
    }

    if (!Array.isArray(c.ingredients) || c.ingredients.length === 0) {
      errors.push(`${prefix} cocktail must have ingredients`);
    }
    if (Array.isArray(c.ingredients) && c.ingredients.length < 2) {
      errors.push(`${prefix} cocktail must have at least two ingredients`);
    } else {
      for (const [j, ing] of c.ingredients.entries()) {
        for (const k of ["ref", "name", "type", "amount", "unit"]) {
          if (!(k in ing)) errors.push(`${prefix} ingredient[${j}] missing ${k}`);
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    slugs: [...seen],
    count: candidates.length,
  };
}

async function main() {
  const arg =
    process.argv[2] ??
    path.join(path.dirname(fileURLToPath(import.meta.url)), "batch-1-candidates.mjs");
  const mod = await import(pathToFileUrl(arg));
  const candidates = mod.BATCH_1_CANDIDATES ?? mod.default;
  const existingSlugs = loadExistingSlugs();
  const result = validateCandidates(candidates, existingSlugs);

  if (!result.ok) {
    console.error("Validation failed:");
    for (const e of result.errors) console.error(" ", e);
    process.exit(1);
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        count: result.count,
        slugs: result.slugs.sort(),
      },
      null,
      2
    )
  );
}

function pathToFileUrl(p) {
  const resolved = path.resolve(p);
  return pathToFileURL(resolved).href;
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) main();
