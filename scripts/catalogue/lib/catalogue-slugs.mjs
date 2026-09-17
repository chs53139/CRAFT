import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const BASE_CATALOGUE_FILES = [
  "src/data/cocktails.json",
  "src/data/cocktails-expanded.json",
  "src/data/craft-originals.json",
  "src/data/mocktails.json",
];

const BATCH_FILES = ["src/data/catalogue-batch-1.json"];

/** @param {{ includeAppliedBatches?: boolean }} [opts] */
export function loadExistingSlugs(opts = {}) {
  const includeAppliedBatches = opts.includeAppliedBatches ?? false;
  const files = [
    ...BASE_CATALOGUE_FILES,
    ...(includeAppliedBatches ? BATCH_FILES : []),
  ];
  const slugs = new Set();
  for (const rel of files) {
    const full = path.join(root, rel);
    if (!fs.existsSync(full)) continue;
    const list = JSON.parse(fs.readFileSync(full, "utf8"));
    if (!Array.isArray(list)) continue;
    for (const c of list) {
      if (c?.slug) slugs.add(c.slug);
    }
  }
  return slugs;
}

export { root as catalogueRoot };
