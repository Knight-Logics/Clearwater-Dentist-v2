import fs from 'fs';
import path from 'path';

const root = path.resolve(import.meta.dirname, '..');
const pages = JSON.parse(fs.readFileSync(path.join(root, 'src/content/pages.json'), 'utf8'));
const site = JSON.parse(fs.readFileSync(path.join(root, 'src/content/site.json'), 'utf8'));
const imgDir = path.join(root, 'public/assets/images');

const refs = new Set();
function scan(v) {
  if (typeof v === 'string' && v.includes('/assets/images/')) refs.add(v.split('?')[0]);
  else if (Array.isArray(v)) v.forEach(scan);
  else if (v && typeof v === 'object') Object.values(v).forEach(scan);
}
scan(pages);
scan(site);

const onDisk = new Set(fs.readdirSync(imgDir).map((f) => `/assets/images/${f}`));
const webpOnDisk = new Set([...onDisk].filter((f) => f.endsWith('.webp')));

const raster = [...refs].filter((r) => !/\.svg$/i.test(r));
const byExt = {};
for (const r of raster) {
  const ext = r.split('.').pop().toLowerCase();
  byExt[ext] = (byExt[ext] || 0) + 1;
}

const noWebpSibling = [];
const alreadyWebp = [];
const missingOnDisk = [];
for (const ref of raster) {
  if (!onDisk.has(ref)) missingOnDisk.push(ref);
  if (/\.webp$/i.test(ref)) {
    alreadyWebp.push(ref);
    continue;
  }
  const webp = ref.replace(/\.(jpe?g|png)$/i, '.webp');
  if (onDisk.has(webp)) alreadyWebp.push(ref);
  else noWebpSibling.push({ ref, expectedWebp: webp });
}

console.log('=== Content image audit (pages.json + site.json) ===');
console.log('Unique image paths:', refs.size);
console.log('Raster images (excl SVG):', raster.length);
console.log('Referenced as:', byExt);
console.log('Referenced in content as .webp:', alreadyWebp.filter((r) => /\.webp$/i.test(r)).length);
console.log('Has .webp sibling on disk (not yet referenced):', alreadyWebp.filter((r) => !/\.webp$/i.test(r)).length);
console.log('No .webp version on disk:', noWebpSibling.length);
console.log('Referenced but missing on disk:', missingOnDisk.length);
console.log('\nWebP files on disk (total):', webpOnDisk.size);
console.log([...webpOnDisk].join('\n'));

if (noWebpSibling.length) {
  console.log('\nSample images still needing WebP conversion:');
  noWebpSibling.slice(0, 20).forEach(({ ref }) => console.log(' -', ref));
}
