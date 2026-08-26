/**
 * Generates PWA icons from an inline SVG mark.
 *
 * PLACEHOLDER ARTWORK. The mark is two overlapping circles (companionship)
 * on the brand fill. Replace `mark()` with the real Sakha artwork when it
 * exists, then re-run: `node scripts/generate-icons.mjs`
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";

const BRAND = "#5551FF"; // color/brand/500
const WHITE = "#FFFFFF"; // color/neutral/0

/** @param {number} size @param {number} inset fraction of padding (maskable safe zone) */
function mark(size, inset = 0) {
  const pad = size * inset;
  const box = size - pad * 2;
  const cx = pad + box / 2;
  const cy = pad + box / 2;
  const r = box * 0.19;
  const dx = box * 0.13;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" fill="${BRAND}"/>
  <circle cx="${cx - dx}" cy="${cy}" r="${r}" fill="${WHITE}" fill-opacity="0.75"/>
  <circle cx="${cx + dx}" cy="${cy}" r="${r}" fill="${WHITE}" fill-opacity="0.75"/>
</svg>`;
}

await mkdir("public/icons", { recursive: true });

const targets = [
  { file: "public/icons/icon-192.png", size: 192, inset: 0 },
  { file: "public/icons/icon-512.png", size: 512, inset: 0 },
  { file: "public/icons/icon-maskable-512.png", size: 512, inset: 0.14 },
  { file: "public/apple-icon.png", size: 180, inset: 0 },
];

for (const { file, size, inset } of targets) {
  await sharp(Buffer.from(mark(size, inset))).png().toFile(file);
  console.log("wrote", file);
}
