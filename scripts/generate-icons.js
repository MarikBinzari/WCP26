import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoSrc = path.join(__dirname, '../src/assets/predicto-logo.png');
const outDir  = path.join(__dirname, '../public');

const NAVY = { r: 0, g: 32, b: 91, alpha: 1 };

async function generateIcon(size, outFile) {
  const cardPad  = Math.round(size * 0.12);   // padding navy → card
  const cardW    = size - cardPad * 2;
  const cardH    = cardW;
  const radius   = Math.round(size * 0.18);
  const logoPad  = Math.round(size * 0.10);   // padding inside card
  const logoW    = cardW - logoPad * 2;

  // 1. Resize logo to fit inside card
  const logoBuffer = await sharp(logoSrc)
    .resize(logoW, Math.round(cardH * 0.55), { fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();
  const logoLeft = Math.round((cardW - logoMeta.width) / 2);
  const logoTop  = Math.round((cardH - logoMeta.height) / 2);

  // 2. White rounded card with logo
  const cardSvgBg = `<svg width="${cardW}" height="${cardH}">
    <rect width="${cardW}" height="${cardH}" rx="${radius}" ry="${radius}" fill="white"/>
  </svg>`;

  const cardBuffer = await sharp(Buffer.from(cardSvgBg))
    .composite([{ input: logoBuffer, left: logoLeft, top: logoTop }])
    .png()
    .toBuffer();

  // 3. Navy square background + card centered
  await sharp({
    create: { width: size, height: size, channels: 4, background: NAVY }
  })
    .composite([{ input: cardBuffer, left: cardPad, top: cardPad }])
    .png()
    .toFile(path.join(outDir, outFile));

  console.log(`✓ ${outFile} (${size}×${size})`);
}

await generateIcon(192, 'icon-192.png');
await generateIcon(512, 'icon-512.png');
console.log('Done.');
