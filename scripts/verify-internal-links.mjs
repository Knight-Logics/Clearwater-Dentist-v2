import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

const checks = [
  ['index.html', 'oral-cancer-screening'],
  ['index.html', 'solea-sleep'],
  ['financing/index.html', 'financial-policy'],
  ['new-patient-faqs/index.html', 'financial-policy'],
  ['contact-us/index.html', 'privacy-policy'],
  ['dental-implants-clearwater-fl/index.html', 'bone-grafting'],
  ['emergency-dentistry-clearwater-fl/index.html', 'tooth-extraction-clearwater-fl'],
  ['laser-dentistry/index.html', 'solea-sleep']
];

let failed = 0;
for (const [file, route] of checks) {
  const html = fs.readFileSync(path.join(DIST, file), 'utf8');
  const ok = html.includes('href="/' + route.replace(/^\//, '') + '"');
  console.log(file, '->', route, ok ? 'OK' : 'MISSING');
  if (!ok) failed += 1;
}

const home = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const cards = (home.match(/class="service-card cw-service-card"/g) || []).length;
console.log('homepage service cards:', cards, cards === 8 ? 'OK' : 'EXPECTED 8');
if (cards !== 8) failed += 1;

process.exit(failed ? 1 : 0);
