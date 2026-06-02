import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logoSrc = path.join(__dirname, '../src/assets/predicto-logo.png');
const outDir  = path.join(__dirname, '../public');

async function generateIcon(size, outFile) {
  const logoPad = Math.round(size * 0.10);
  const logoW   = size - logoPad * 2;

  // 1. Resize logo to fill icon (white bg, transparent areas kept white)
  const logoBuffer = await sharp(logoSrc)
    .resize(logoW, Math.round(size * 0.52), { fit: 'inside', background: { r: 255, g: 255, b: 255, alpha: 1 } })
    .flatten({ background: { r: 255, g: 255, b: 255 } })
    .png()
    .toBuffer();

  const logoMeta = await sharp(logoBuffer).metadata();
  const logoLeft = Math.round((size - logoMeta.width) / 2);
  const logoTop  = Math.round((size - logoMeta.height) / 2);

  // 2. White square background + logo centered
  await sharp({
    create: { width: size, height: size, channels: 3, background: { r: 255, g: 255, b: 255 } }
  })
    .composite([{ input: logoBuffer, left: logoLeft, top: logoTop }])
    .png()
    .toFile(path.join(outDir, outFile));

  console.log(`✓ ${outFile} (${size}×${size})`);
}

await generateIcon(192, 'icon-192.png');
await generateIcon(512, 'icon-512.png');
console.log('Done.');
