/**
 * Builds trusted-only image overrides + manifest for the live catalogue.
 * Never assigns family-pool proxy images (Mai Tai for random Tiki, etc.).
 * Run: node scripts/generate-image-overrides.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const IMAGE_BASE = "https://cocktail.glass/images";

/** Same cocktail on CDN under a different slug (not a related-drink proxy). */
const SAME_DRINK_CDN_ALIASES = {
  tradewinds: "trade-winds",
};

const TRUSTED_STRIP_SUFFIXES = [
  "-trader-vics",
  "-royal-hawaiian",
  "-papa-doble",
  "-split-base",
  "-split",
  "-modern",
  "-smoky",
  "-variation",
  "-spiced",
  "-honey",
  "-lavender",
  "-cognac",
  "-rye",
  "-mezcal",
  "-cynar",
  "-reposado",
  "-amargo",
  "-perfect",
  "-yellow",
  "-violette",
  "-boston",
  "-passion",
];

function loadCatalogue() {
  const raw = JSON.parse(fs.readFileSync(path.join(root, "src/data/cocktails.json"), "utf8"));
  const exp = JSON.parse(
    fs.readFileSync(path.join(root, "src/data/cocktails-expanded.json"), "utf8")
  );
  const orig = JSON.parse(fs.readFileSync(path.join(root, "src/data/craft-originals.json"), "utf8"));
  const mock = JSON.parse(fs.readFileSync(path.join(root, "src/data/mocktails.json"), "utf8"));
  const batch1Path = path.join(root, "src/data/catalogue-batch-1.json");
  const batch1 = fs.existsSync(batch1Path)
    ? JSON.parse(fs.readFileSync(batch1Path, "utf8"))
    : [];
  const map = new Map();
  for (const c of [...raw, ...exp, ...batch1, ...orig, ...mock]) map.set(c.slug, c);
  return [...map.values()];
}

function inferTrustedParent(slug, catalogueSlugs) {
  for (const suffix of TRUSTED_STRIP_SUFFIXES) {
    if (slug.endsWith(suffix)) {
      const base = slug.slice(0, -suffix.length);
      if (catalogueSlugs.has(base)) return base;
    }
  }
  const candidates = [...catalogueSlugs]
    .filter((base) => base !== slug && slug.startsWith(`${base}-`))
    .sort((a, b) => b.length - a.length);
  return candidates[0] ?? null;
}

const cdnCache = new Map();

async function cdnExists(slug) {
  if (cdnCache.has(slug)) return cdnCache.get(slug);
  try {
    const res = await fetch(`${IMAGE_BASE}/${slug}.webp`, { method: "HEAD" });
    const ok = res.ok;
    cdnCache.set(slug, ok);
    return ok;
  } catch {
    cdnCache.set(slug, false);
    return false;
  }
}

async function main() {
  const cocktails = loadCatalogue();
  const catalogueSlugs = new Set(cocktails.map((c) => c.slug));

  const overrides = {};
  const manifest = {};
  const stats = {
    total: cocktails.length,
    direct: 0,
    trustedOverride: 0,
    missing: 0,
    staleOverridesRemoved: 0,
  };

  const previousOverrides = {};
  const overridesPath = path.join(root, "src/lib/cocktail-image-overrides.ts");
  if (fs.existsSync(overridesPath)) {
    const content = fs.readFileSync(overridesPath, "utf8");
    for (const match of content.matchAll(/"([^"]+)":\s*"([^"]+)"/g)) {
      if (match[1] !== "Record") previousOverrides[match[1]] = match[2];
    }
  }

  for (const cocktail of cocktails) {
    const { slug } = cocktail;

    if (await cdnExists(slug)) {
      manifest[slug] = { tier: "direct", cdnSlug: slug };
      stats.direct++;
      continue;
    }

    const parent = inferTrustedParent(slug, catalogueSlugs);
    if (parent && (await cdnExists(parent))) {
      overrides[slug] = parent;
      manifest[slug] = { tier: "trusted-override", cdnSlug: parent };
      stats.trustedOverride++;
      continue;
    }

    const alias = SAME_DRINK_CDN_ALIASES[slug];
    if (alias && (await cdnExists(alias))) {
      overrides[slug] = alias;
      manifest[slug] = { tier: "trusted-override", cdnSlug: alias };
      stats.trustedOverride++;
      continue;
    }

    manifest[slug] = { tier: "missing" };
    stats.missing++;
  }

  for (const key of Object.keys(previousOverrides)) {
    if (!catalogueSlugs.has(key)) stats.staleOverridesRemoved++;
  }

  const sortedOverrides = Object.fromEntries(
    Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b))
  );

  const overrideLines = Object.entries(sortedOverrides).map(
    ([k, v]) => `  "${k}": "${v}",`
  );
  const overridesTs = `/**
 * Trusted variant → parent CDN slug only (same drink, verified on cocktail.glass).
 * Generated via: node scripts/generate-image-overrides.mjs
 * Do not add family-pool proxies (e.g. unrelated Mai Tai for other Tiki drinks).
 */
export const COCKTAIL_IMAGE_SLUGS: Record<string, string> = {
${overrideLines.length ? `${overrideLines.join("\n")}\n` : ""}};

export function resolveCocktailImageOverride(slug: string): string | undefined {
  return COCKTAIL_IMAGE_SLUGS[slug];
}
`;

  fs.writeFileSync(overridesPath, overridesTs);
  fs.writeFileSync(
    path.join(root, "src/data/cocktail-image-manifest.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), stats, entries: manifest }, null, 2)
  );

  console.log(JSON.stringify({ ...stats, trustedOverrideCount: Object.keys(sortedOverrides).length }, null, 2));
}

main();
