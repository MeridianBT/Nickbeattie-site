// Makes the responsive AVIF/WebP/JPEG sets the site expects.
//
//   Headshot:     assets/img/headshot.jpg            -> assets/img/headshot-{480,800,1200}.{avif,webp,jpg}  (cropped 4:5)
//   Case shots:   assets/img/cases/src/<key>.{png,jpg} -> assets/img/cases/<key>-{640,1280}.{avif,webp,jpg}
//   Video poster: assets/video/hoshin-poster-src.{png,jpg} -> assets/video/hoshin-poster.jpg (1600px wide)
//
// One-off setup (in this folder):  npm install --no-save sharp
// Then run:                         node tools/optimise-images.mjs
// Then flip the matching switches in main.js (CONFIG.ASSETS / CONFIG.CASE_SHOTS).
import sharp from 'sharp';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const at = (...p) => path.join(root, ...p);

async function variants(src, outBase, widths, { aspect } = {}) {
  for (const w of widths) {
    let img = sharp(src).rotate();
    img = aspect
      ? img.resize({ width: w, height: Math.round(w / aspect), fit: 'cover', position: 'attention' })
      : img.resize({ width: w, withoutEnlargement: true });
    await img.clone().avif({ quality: 55 }).toFile(`${outBase}-${w}.avif`);
    await img.clone().webp({ quality: 78 }).toFile(`${outBase}-${w}.webp`);
    await img.clone().jpeg({ quality: 80, mozjpeg: true }).toFile(`${outBase}-${w}.jpg`);
  }
  console.log('✓', path.relative(root, outBase), widths.join('/'));
}

const headshot = at('assets/img/headshot.jpg');
if (existsSync(headshot)) await variants(headshot, at('assets/img/headshot'), [480, 800, 1200], { aspect: 4 / 5 });
else console.log('· no assets/img/headshot.jpg yet');

const caseSrc = at('assets/img/cases/src');
if (existsSync(caseSrc)) {
  for (const f of readdirSync(caseSrc).filter((f) => /\.(png|jpe?g|webp)$/i.test(f))) {
    const key = f.replace(/\.[^.]+$/, '');
    await variants(path.join(caseSrc, f), at('assets/img/cases', key), [640, 1280]);
  }
} else {
  mkdirSync(caseSrc, { recursive: true });
  console.log('· created assets/img/cases/src/ — put screenshots there named after the CASE_SHOTS keys');
}

for (const ext of ['png', 'jpg']) {
  const poster = at(`assets/video/hoshin-poster-src.${ext}`);
  if (existsSync(poster)) {
    await sharp(poster).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(at('assets/video/hoshin-poster.jpg'));
    console.log('✓ assets/video/hoshin-poster.jpg');
  }
}
