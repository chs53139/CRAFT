/**
 * Generates and validates cocktail image slug overrides.
 * Run: node scripts/generate-image-overrides.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const IMAGE_BASE = "https://cocktail.glass/images";

const raw = JSON.parse(fs.readFileSync(path.join(root, "src/data/cocktails.json"), "utf8"));
const exp = JSON.parse(fs.readFileSync(path.join(root, "src/data/cocktails-expanded.json"), "utf8"));
const orig = JSON.parse(fs.readFileSync(path.join(root, "src/data/craft-originals.json"), "utf8"));
const mock = JSON.parse(fs.readFileSync(path.join(root, "src/data/mocktails.json"), "utf8"));
const all = [...raw, ...exp, ...orig, ...mock];

const mocktailMap = {
  "shirley-temple": "shirley-temple",
  "virgin-mojito": "virgin-mojito",
  "virgin-pina-colada": "pina-colada",
  "roy-rogers": "shirley-temple",
  "cucumber-garden-cooler": "gin-and-tonic",
  "hibiscus-ginger-fizz": "french-75",
  "sparkling-rosemary-grapefruit": "paloma",
  "salted-vanilla-cola-highball": "cuba-libre",
  "green-detox-refresher": "mojito",
  "ginger-turmeric-spritzer": "moscow-mule",
  "lavender-honey-lemonade": "tom-collins",
  "coconut-mint-hydration-cooler": "mojito",
  "virgin-sunrise-punch": "tequila-sunrise",
  "sparkling-berry-party-cup": "bellini",
  "tropical-sunset-spritz": "aperol-spritz",
  "citrus-celebration-punch": "planters-punch",
  "iced-vanilla-coffee-shakerato": "espresso-martini",
  "cold-brew-tonic": "espresso-martini",
  "maple-mocha-cooler": "espresso-martini",
  "espresso-sparkler": "espresso-martini",
  "iced-london-fog": "hot-toddy",
  "green-tea-ginger-refresher": "moscow-mule",
  "chai-spiced-sparkler": "hot-toddy",
  "hibiscus-iced-tea-lemonade": "tom-collins",
};

const existingOverrides = {};
const overridesPath = path.join(root, "src/lib/cocktail-image-overrides.ts");
if (fs.existsSync(overridesPath)) {
  const content = fs.readFileSync(overridesPath, "utf8");
  for (const match of content.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
    if (match[1] !== "Record") existingOverrides[match[1]] = match[2];
  }
}

const FAMILY_POOLS = {
  Tiki: [
    "mai-tai", "zombie", "scorpion", "jungle-bird", "painkiller", "saturn",
    "jet-pilot", "planters-punch", "pina-colada", "fog-cutter", "test-pilot",
    "three-dots-and-a-dash", "navy-grog", "missionarys-downfall", "rum-swizzle",
  ],
  Sour: [
    "whiskey-sour", "margarita", "daiquiri", "sidecar", "cosmopolitan",
    "clover-club", "bee's-knees", "gimlet", "tommys-margarita", "penicillin",
  ],
  "Spirit-Forward": [
    "old-fashioned", "manhattan", "negroni", "boulevardier", "sazerac",
    "martinez", "rob-roy", "toronto",
  ],
  Highball: [
    "gin-and-tonic", "moscow-mule", "dark-n-stormy", "cuba-libre", "paloma",
    "tom-collins", "highball",
  ],
  "Fizz & Collins": ["tom-collins", "french-75", "ramos-gin-fizz", "gin-fizz"],
  "Champagne Cocktail": ["french-75", "mimosa", "bellini", "champagne-cocktail"],
  Spritz: ["aperol-spritz", "hugo", "spritz"],
  Punch: ["planters-punch", "punch", "ti-punch"],
  "Hot Drink": ["hot-toddy", "irish-coffee", "mulled-wine"],
  "Flip & Nog": ["eggnog", "grasshopper", "brandy-alexander"],
  Other: ["martini", "negroni", "old-fashioned"],
  Shot: ["shot", "kamikaze"],
};

const STRIP_SUFFIXES = [
  "-trader-vics", "-royal-hawaiian", "-papa-doble", "-split-base", "-split",
  "-modern", "-smoky", "-variation", "-spiced", "-honey", "-lavender",
  "-cognac", "-rye", "-mezcal", "-cynar", "-reposado", "-amargo", "-perfect",
  "-yellow", "-violette", "-boston", "-passion", "-craft",
];

const baseSlugs = new Set(raw.map((c) => c.slug));
const cache = new Map();

async function cdnExists(slug) {
  if (cache.has(slug)) return cache.get(slug);
  try {
    const res = await fetch(`${IMAGE_BASE}/${slug}.webp`, { method: "HEAD" });
    const ok = res.ok;
    cache.set(slug, ok);
    return ok;
  } catch {
    cache.set(slug, false);
    return false;
  }
}

function hashSlug(slug) {
  let h = 0;
  for (const c of slug) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h;
}

function pickFromPool(slug, pool) {
  return pool[hashSlug(slug) % pool.length];
}

async function resolveSlug(slug, family, overrides) {
  if (mocktailMap[slug]) return mocktailMap[slug];
  if (overrides[slug]) return overrides[slug];
  if (await cdnExists(slug)) return slug;

  let candidate = slug;
  for (const suffix of STRIP_SUFFIXES) {
    if (candidate.endsWith(suffix)) {
      candidate = candidate.slice(0, -suffix.length);
      if (await cdnExists(candidate)) return candidate;
      if (baseSlugs.has(candidate)) {
        const baseOk = await cdnExists(candidate);
        if (baseOk) return candidate;
      }
    }
  }

  for (const base of baseSlugs) {
    if (slug.startsWith(`${base}-`) && (await cdnExists(base))) return base;
  }

  const pool = FAMILY_POOLS[family] ?? FAMILY_POOLS.Other;
  for (const pick of pool) {
    if (await cdnExists(pick)) return pick;
  }

  return pickFromPool(slug, pool);
}

async function main() {
  const overrides = { ...existingOverrides };
  const unresolved = [];

  for (const cocktail of all) {
    const direct = await cdnExists(cocktail.slug);
    if (direct) continue;

    const resolved = await resolveSlug(cocktail.slug, cocktail.family, overrides);
    if (resolved !== cocktail.slug) {
      overrides[cocktail.slug] = resolved;
    }

    const finalOk = await cdnExists(
      mocktailMap[cocktail.slug] ?? overrides[cocktail.slug] ?? cocktail.slug
    );
    if (!finalOk) unresolved.push(cocktail.slug);
  }

  const sorted = Object.fromEntries(
    Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b))
  );

  const lines = Object.entries(sorted).map(([k, v]) => `  "${k}": "${v}",`);
  const output = `/**
 * Maps cocktail slugs to cocktail.glass CDN slugs when no direct photo exists.
 * Generated/validated via: node scripts/generate-image-overrides.mjs
 */
export const COCKTAIL_IMAGE_SLUGS: Record<string, string> = {
${lines.join("\n")}
};

export function resolveCocktailImageOverride(slug: string): string | undefined {
  return COCKTAIL_IMAGE_SLUGS[slug];
}
`;

  fs.writeFileSync(overridesPath, output);
  console.log(`Wrote ${Object.keys(sorted).length} overrides`);
  console.log(`Unresolved after mapping: ${unresolved.length}`);
  if (unresolved.length) console.log(unresolved.join("\n"));
}

main();
