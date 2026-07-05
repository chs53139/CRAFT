/**
 * Validates that every cocktail resolves to an existing CDN image.
 * Run: node scripts/check-cocktail-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

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

const overrideMap = {};
const overrideContent = fs.readFileSync(path.join(root, "src/lib/cocktail-image-overrides.ts"), "utf8");
for (const match of overrideContent.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
  if (match[1] !== "Record") overrideMap[match[1]] = match[2];
}

function resolveSlug(slug) {
  return mocktailMap[slug] ?? overrideMap[slug] ?? slug;
}

const IMAGE_BASE = "https://cocktail.glass/images";

async function exists(url) {
  try {
    const res = await fetch(url, { method: "HEAD" });
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const missing = [];
  const batchSize = 25;

  for (let i = 0; i < all.length; i += batchSize) {
    const batch = all.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (c) => {
        const resolved = resolveSlug(c.slug);
        const url = `${IMAGE_BASE}/${resolved}.webp`;
        const ok = await exists(url);
        if (!ok) missing.push({ slug: c.slug, resolved, name: c.name });
      })
    );
    process.stdout.write(`\rChecked ${Math.min(i + batchSize, all.length)}/${all.length}`);
  }

  console.log(`\n\nUnresolved: ${missing.length}`);
  if (missing.length) {
    for (const m of missing) {
      console.log(`  ${m.slug} -> ${m.resolved} (${m.name})`);
    }
    process.exit(1);
  }
  console.log("All 681 cocktail images resolve to valid CDN URLs.");
}

main();
