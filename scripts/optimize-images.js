import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/assets');

const targets = [
  { src: 'hands-trophy.png',    out: 'hands-trophy.webp',    width: 800, quality: 65 },
  { src: 'hands-trophy.png',    out: 'hands-trophy-hq.webp', width: 900, quality: 85 },
  { src: 'var-bg.jpg',          out: 'var-bg.webp',           width: 1080, quality: 90 },
  { src: 'predicto-logo.png',   out: 'predicto-logo.webp',   width: 300, quality: 88 },
  { src: 'special-pick-badge.png', out: 'special-pick-badge.webp', width: 200, quality: 80 },
];

for (const { src, out, width, quality } of targets) {
  const inPath  = path.join(dir, src);
  const outPath = path.join(dir, out);
  const before  = fs.statSync(inPath).size;
  await sharp(inPath)
    .resize(width, null, { withoutEnlargement: true })
    .webp({ quality })
    .toFile(outPath);
  const after = fs.statSync(outPath).size;
  const pct = Math.round((1 - after / before) * 100);
  console.log(`✓  ${src.padEnd(30)} ${(before/1024).toFixed(0).padStart(6)} KB  →  ${(after/1024).toFixed(0).padStart(5)} KB  (-${pct}%)`);
}
console.log('\nDone. Update imports in App.jsx to use .webp files.');
