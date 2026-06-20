import { copyFileSync, mkdirSync, readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = join(root, "public", "brand");
const iconsDir = join(root, "public", "icons");
const splashDir = join(root, "public", "splash");

mkdirSync(iconsDir, { recursive: true });
mkdirSync(splashDir, { recursive: true });

async function rasterizeSvg(svgPath, outputPath, width, height = width) {
  await sharp(readFileSync(svgPath), { density: 320 })
    .resize(width, height, { fit: "contain", background: "#050506" })
    .png()
    .toFile(outputPath);
}

async function generateSplash(width, height, filename) {
  const stackedSvg = readFileSync(join(brandDir, "craft-logo-stacked.svg"));
  const iconWidth = Math.round(width * 0.42);

  const iconPng = await sharp(stackedSvg, { density: 320 })
    .resize(iconWidth, null, { fit: "inside", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: "#050506",
    },
  })
    .composite([{ input: iconPng, gravity: "center" }])
    .png()
    .toFile(join(splashDir, filename));
}

async function main() {
  const primaryMark = join(brandDir, "craft-mark.svg");
  const maskableMark = join(brandDir, "craft-mark-maskable.svg");

  copyFileSync(primaryMark, join(iconsDir, "icon.svg"));
  copyFileSync(join(brandDir, "craft-wordmark.svg"), join(iconsDir, "craft-wordmark.svg"));

  await rasterizeSvg(primaryMark, join(iconsDir, "favicon-16.png"), 16);
  await rasterizeSvg(primaryMark, join(iconsDir, "favicon-32.png"), 32);
  await rasterizeSvg(primaryMark, join(iconsDir, "apple-touch-icon.png"), 180);
  await rasterizeSvg(primaryMark, join(iconsDir, "icon-192.png"), 192);
  await rasterizeSvg(primaryMark, join(iconsDir, "icon-512.png"), 512);
  await rasterizeSvg(maskableMark, join(iconsDir, "icon-maskable-512.png"), 512);

  await generateSplash(1290, 2796, "apple-splash-1290-2796.png");
  await generateSplash(1170, 2532, "apple-splash-1170-2532.png");
  await generateSplash(750, 1334, "apple-splash-750-1334.png");

  console.log("CRAFT brand assets generated in public/icons and public/splash");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
