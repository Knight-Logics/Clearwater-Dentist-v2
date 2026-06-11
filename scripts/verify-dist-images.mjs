import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '..', 'dist');
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name.endsWith('.html')) htmlFiles.push(full);
  }
}

walk(dist);

const exts = {};
const bad = [];
for (const file of htmlFiles) {
  const text = fs.readFileSync(file, 'utf8');
  for (const match of text.matchAll(/(?:src|poster)=["'](\/assets\/images\/[^"']+)["']/g)) {
    const ref = match[1];
    const ext = ref.split('.').pop().toLowerCase();
    exts[ext] = (exts[ext] || 0) + 1;
    if (!['webp', 'svg'].includes(ext)) bad.push({ file: path.relative(dist, file), ref });
  }
}

console.log('Built HTML raster image extensions:', exts);
if (bad.length) {
  console.error(`Found ${bad.length} non-WebP raster image references in dist:`);
  bad.slice(0, 20).forEach((item) => console.error(` - ${item.file}: ${item.ref}`));
  process.exit(1);
}

console.log('OK: all /assets/images raster refs in dist are WebP (or SVG).');
