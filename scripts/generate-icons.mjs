import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');

// Prefer premium icon if available, otherwise fallback to standard
let svgContent;
try {
  svgContent = readFileSync(join(publicDir, 'premium-icon.svg'), 'utf-8');
  console.log('Using premium-icon.svg');
} catch {
  svgContent = readFileSync(join(publicDir, 'icon.svg'), 'utf-8');
  console.log('Using icon.svg');
}

// Generate regular icons
async function generateIcons() {
  console.log('Generating PWA icons...');
  
  // 192x192 icon
  await sharp(Buffer.from(svgContent))
    .resize(192, 192)
    .png()
    .toFile(join(publicDir, 'pwa-192x192.png'));
  console.log('✓ pwa-192x192.png');

  // 512x512 icon
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'pwa-512x512.png'));
  console.log('✓ pwa-512x512.png');

  // Maskable icon (same for now, Android handles the masking)
  await sharp(Buffer.from(svgContent))
    .resize(512, 512)
    .png()
    .toFile(join(publicDir, 'maskable-icon-512x512.png'));
  console.log('✓ maskable-icon-512x512.png');

  // Apple touch icon (180x180)
  await sharp(Buffer.from(svgContent))
    .resize(180, 180)
    .png()
    .toFile(join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ apple-touch-icon.png');

  // Favicon (48x48)
  await sharp(Buffer.from(svgContent))
    .resize(48, 48)
    .png()
    .toFile(join(publicDir, 'favicon.png'));
  console.log('✓ favicon.png');

  console.log('All icons generated!');
}

generateIcons().catch(console.error);
