/**
 * Similarity / repetition audit for cocktail catalogue copy.
 * Run: node scripts/audit-copy.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const prov = JSON.parse(fs.readFileSync(path.join(root, "src/data/cocktail-provenance.json"), "utf8"));

const GENERIC_FUN_FACT = [
  /sibling pour/i,
  /tiki lineage from undefined/i,
  /without the airfare/i,
  /full send/i,
  /no passport required/i,
  /A refreshing/i,
  /A sophisticated/i,
  /A perfectly balanced/i,
];

function normalize(s) {
  return (s || "").trim().toLowerCase().replace(/\s+/g, " ");
}

function firstSentence(s) {
  return (s || "").split(/(?<=[.!?])\s+/)[0]?.trim() ?? "";
}

const facts = [];
const factStarts = new Map();

for (const [slug, entry] of Object.entries(prov)) {
  facts.push({ slug, fact: entry.funFact });
  const start = normalize(firstSentence(entry.funFact)).slice(0, 48);
  if (start.length > 20) factStarts.set(start, (factStarts.get(start) || 0) + 1);
}

function dupes(items, key) {
  const m = new Map();
  for (const item of items) {
    const k = normalize(item[key]);
    if (!k) continue;
    m.set(k, (m.get(k) || 0) + 1);
  }
  return [...m.entries()].filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]);
}

const dupFacts = dupes(facts, "fact");
const dupFactOpeners = [...factStarts.entries()].filter(([, n]) => n > 2).sort((a, b) => b[1] - a[1]);

const genericFacts = facts.filter((f) => GENERIC_FUN_FACT.some((re) => re.test(f.fact)));

console.log("=== CRAFT copy audit (provenance) ===");
console.log(`Entries: ${Object.keys(prov).length}`);
console.log(`Duplicate full fun facts: ${dupFacts.length}`);
console.log(`Repeated fun-fact openers (>2 drinks): ${dupFactOpeners.length}`);
console.log(`Generic/banned fun-fact patterns: ${genericFacts.length}`);
console.log("");
if (dupFactOpeners.length) console.log("Dup opener sample:", dupFactOpeners.slice(0, 5));
if (genericFacts.length) console.log("Generic fact sample:", genericFacts.slice(0, 3).map((g) => g.slug));
