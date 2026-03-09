/**
 * Generate static assets: OG image, apple-touch-icon, favicon.
 * Uses sharp (bundled with Next.js) to composite SVG-rendered text onto solid backgrounds.
 *
 * Run: node scripts/generate-assets.mjs
 */

import sharp from "sharp";
import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, "..", "public");

// ── OG Image (1200×630) ────────────────────────────────────────────────────

async function generateOGImage() {
  const width = 1200;
  const height = 630;

  // Build an SVG with all the text elements
  const svg = `
  <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="#1A1A1A"/>

    <!-- Game name -->
    <text x="600" y="280" text-anchor="middle"
          font-family="Inter, system-ui, -apple-system, sans-serif" font-size="64"
          fill="#A07820" font-weight="bold" letter-spacing="2">YIDDISH OR BULLSHIT</text>

    <!-- Tagline -->
    <text x="600" y="350" text-anchor="middle"
          font-family="Inter, system-ui, -apple-system, sans-serif" font-size="24"
          fill="#FFFFFF">Real Yiddish words. Fake Yiddish words. You decide.</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(width, height)
    .png()
    .toFile(join(publicDir, "og-image.png"));

  console.log("✓ og-image.png (1200×630)");
}

// ── Apple Touch Icon (180×180) ──────────────────────────────────────────────

async function generateAppleTouchIcon() {
  const size = 180;

  const svg = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#1A1A1A"/>
    <text x="90" y="105" text-anchor="middle" dominant-baseline="central"
          font-family="Georgia, 'Times New Roman', serif" font-size="68"
          fill="#A07820" font-weight="bold" letter-spacing="1">YB</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(publicDir, "apple-touch-icon.png"));

  console.log("✓ apple-touch-icon.png (180×180)");
}

// ── Favicon (32×32 PNG saved as .ico) ───────────────────────────────────────
// Modern browsers accept PNG favicons. We generate a 32×32 PNG.

async function generateFavicon() {
  const size = 32;

  const svg = `
  <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="#1A1A1A" rx="4"/>
    <text x="16" y="19" text-anchor="middle" dominant-baseline="central"
          font-family="Georgia, 'Times New Roman', serif" font-size="14"
          fill="#A07820" font-weight="bold" letter-spacing="0.3">YB</text>
  </svg>`;

  // Generate as PNG (modern browsers support PNG favicons via <link rel="icon">)
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toFile(join(publicDir, "favicon.png"));

  // Also create an ICO-compatible version (just a renamed PNG — works in all modern browsers)
  const pngBuffer = await sharp(Buffer.from(svg))
    .resize(size, size)
    .png()
    .toBuffer();
  writeFileSync(join(publicDir, "favicon.ico"), pngBuffer);

  console.log("✓ favicon.png + favicon.ico (32×32)");
}

// ── Run all ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("Generating assets...\n");
  await generateOGImage();
  await generateAppleTouchIcon();
  await generateFavicon();
  console.log("\nDone! Assets placed in public/");
}

main().catch((err) => {
  console.error("Failed:", err);
  process.exit(1);
});
