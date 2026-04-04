/**
 * Image optimization script
 * Resizes and converts local images to WebP at the correct display size.
 *
 * Run:  node scripts/optimize-images.mjs
 * Deps: npm install --save-dev jimp   (pure JS, no native binaries needed)
 */

import { Jimp } from "jimp";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

// ── images to process ──────────────────────────────────────────────────────
// Each entry: { src, dest, width, height, quality }
const tasks = [
  {
    // Logo used in Header / Footer / StaticPage — displayed at 40-48px,
    // 96px covers 2× retina, 128px is enough for any screen.
    src: "src/assets/logo-icon.png",
    dest: "src/assets/logo-icon.webp",
    width: 128,
    height: 128,
    quality: 90,
  },
  {
    // logo.png used in ArticleSchema (og image URL) and possibly admin
    src: "src/assets/logo.png",
    dest: "src/assets/logo.webp",
    width: 256,
    height: 256,
    quality: 90,
  },
  {
    // Favicon: browsers display at 16-32px; 64px handles all retina cases
    src: "public/favicon-v2.png",
    dest: "public/favicon-v2.webp",
    width: 64,
    height: 64,
    quality: 90,
  },
  {
    // Keep a small PNG fallback for browsers that don't support WebP favicons
    src: "public/favicon-v2.png",
    dest: "public/favicon-v2-small.png",
    width: 64,
    height: 64,
    quality: 90,
    png: true,
  },
];

let ok = 0;
let fail = 0;

for (const t of tasks) {
  const srcPath = path.join(root, t.src);
  const destPath = path.join(root, t.dest);

  if (!existsSync(srcPath)) {
    console.warn(`  SKIP  ${t.src} — file not found`);
    continue;
  }

  try {
    const before = readFileSync(srcPath).length;
    const img = await Jimp.read(srcPath);

    img.resize({ w: t.width, h: t.height });

    if (t.png) {
      await img.write(destPath);
    } else {
      // jimp writes WebP when the dest extension is .webp
      img.quality(t.quality);
      await img.write(destPath);
    }

    const after = readFileSync(destPath).length;
    const saving = Math.round((1 - after / before) * 100);
    console.log(
      `  OK    ${t.dest.padEnd(38)} ${(before / 1024).toFixed(1)}KB → ${(after / 1024).toFixed(1)}KB  (-${saving}%)`
    );
    ok++;
  } catch (err) {
    console.error(`  FAIL  ${t.dest}: ${err.message}`);
    fail++;
  }
}

console.log(`\nDone: ${ok} succeeded, ${fail} failed.`);
if (ok > 0) {
  console.log(`
Next steps:
  1. Update imports in Header.tsx / Footer.tsx / StaticPage.tsx:
       import logoIcon from "@/assets/logo-icon.webp";
  2. Update <link rel="icon"> in index.html to point to /favicon-v2.webp
  3. Delete the old oversized files once everything looks good.
`);
}
