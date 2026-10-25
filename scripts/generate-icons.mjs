// Renders the app icon SVGs to the PNG/ICO sizes needed by browsers and
// iOS/Android home screens. Run with `npm run icons` (uses Playwright Chromium).
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public', 'icons');

/** Helm wheel (7 spokes) + graduation cap. `scale` shrinks the artwork for maskable safe zones. */
function iconSvg({ rounded, scale }) {
  const cx = 256;
  const cy = 292;
  const spokes = Array.from({ length: 7 }, (_, i) => {
    const a = ((-90 + 360 / 14 + (360 / 7) * i) * Math.PI) / 180;
    const x1 = cx + Math.cos(a) * 30;
    const y1 = cy + Math.sin(a) * 30;
    const x2 = cx + Math.cos(a) * 142;
    const y2 = cy + Math.sin(a) * 142;
    const kx = cx + Math.cos(a) * 158;
    const ky = cy + Math.sin(a) * 158;
    return `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}"/>` +
      `<circle cx="${kx.toFixed(1)}" cy="${ky.toFixed(1)}" r="17" fill="#fff" stroke="none"/>`;
  }).join('');
  const t = `translate(${256 * (1 - scale)} ${256 * (1 - scale)}) scale(${scale})`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3b7bf0"/>
      <stop offset="1" stop-color="#1f4599"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="${rounded ? 112 : 0}" fill="url(#bg)"/>
  <g transform="${t}">
    <g fill="none" stroke="#fff" stroke-width="22" stroke-linecap="round">
      <circle cx="${cx}" cy="${cy}" r="112"/>
      ${spokes}
    </g>
    <circle cx="${cx}" cy="${cy}" r="38" fill="#fff"/>
    <circle cx="${cx}" cy="${cy}" r="16" fill="#2857c0"/>
    <g>
      <path d="M256 52 L392 104 L256 156 L120 104 Z" fill="#fbbf24" stroke="#1f4599" stroke-width="8" stroke-linejoin="round"/>
      <path d="M180 128 v34 c0 18 34 32 76 32 s76 -14 76 -32 v-34 l-76 29 z" fill="#f59e0b" stroke="#1f4599" stroke-width="8" stroke-linejoin="round"/>
      <path d="M374 112 v58" stroke="#fbbf24" stroke-width="8" stroke-linecap="round"/>
      <circle cx="374" cy="176" r="10" fill="#fbbf24"/>
    </g>
  </g>
</svg>
`;
}

/** Minimal .ico container holding one PNG image. */
function pngToIco(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header.writeUInt8(size, 6);
  header.writeUInt8(size, 7);
  header.writeUInt8(0, 8);
  header.writeUInt8(0, 9);
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

await mkdir(outDir, { recursive: true });
const anySvg = iconSvg({ rounded: true, scale: 1 });
const maskSvg = iconSvg({ rounded: false, scale: 0.78 });
const appleSvg = iconSvg({ rounded: false, scale: 0.9 });
await writeFile(join(outDir, 'icon.svg'), anySvg);
await writeFile(join(outDir, 'icon-maskable.svg'), maskSvg);

const browser = await chromium.launch();
const page = await browser.newPage();
async function render(svg, size) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(
    `<html><body style="margin:0;background:transparent">${svg.replace('width="512" height="512"', `width="${size}" height="${size}"`)}</body></html>`,
  );
  return page.locator('svg').screenshot({ omitBackground: true });
}
const targets = [
  ['icon-192.png', anySvg, 192],
  ['icon-512.png', anySvg, 512],
  ['icon-maskable-512.png', maskSvg, 512],
  ['apple-touch-icon-180.png', appleSvg, 180],
];
for (const [name, svg, size] of targets) {
  await writeFile(join(outDir, name), await render(svg, size));
  console.log('wrote', name);
}
await writeFile(join(root, 'public', 'favicon.ico'), pngToIco(await render(anySvg, 32), 32));
console.log('wrote favicon.ico');
await browser.close();
