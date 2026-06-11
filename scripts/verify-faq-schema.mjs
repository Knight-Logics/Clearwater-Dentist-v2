import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

async function walk(dir, files = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const current = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(current, files);
    else if (entry.name === 'index.html') files.push(current);
  }
  return files;
}

function routeFromFile(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '');
}

function faqCountInGraph(html) {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) return 0;
  const data = JSON.parse(match[1]);
  const faq = (data['@graph'] || []).find((node) => node['@type'] === 'FAQPage');
  return faq?.mainEntity?.length || 0;
}

const files = (await walk(DIST)).filter((file) => !file.includes(`${path.sep}admin${path.sep}`));
const rows = [];

for (const file of files) {
  const html = await fs.readFile(file, 'utf8');
  const route = routeFromFile(file);
  const accordion = (html.match(/<details class="cw-faq-item"/g) || []).length;
  const schemaCount = faqCountInGraph(html);
  rows.push({ route, accordion, schemaCount });
}

const withAccordion = rows.filter((row) => row.accordion > 0);
const withSchema = rows.filter((row) => row.schemaCount > 0);
const uiOnly = rows.filter((row) => row.accordion > 0 && row.schemaCount === 0);
const schemaOnly = rows.filter((row) => row.accordion === 0 && row.schemaCount > 0);
const mismatchedCounts = rows.filter((row) => row.accordion > 0 && row.schemaCount > 0 && row.accordion !== row.schemaCount);

console.log('FAQ UI vs JSON-LD audit — ' + rows.length + ' routes\n');
console.log('Pages with visible FAQ accordion:', withAccordion.length);
console.log('Pages with FAQPage JSON-LD:     ', withSchema.length);
console.log('Accordion questions == schema Qs: ', mismatchedCounts.length === 0 ? 'yes (all matched)' : mismatchedCounts.length + ' mismatches');

if (uiOnly.length) {
  console.log('\nUI accordion but NO FAQPage schema:');
  uiOnly.forEach((row) => console.log('  ' + row.route + ' (' + row.accordion + ' questions)'));
}

if (schemaOnly.length) {
  console.log('\nFAQPage schema but NO accordion:');
  schemaOnly.forEach((row) => console.log('  ' + row.route + ' (' + row.schemaCount + ' questions)'));
}

if (mismatchedCounts.length) {
  console.log('\nQuestion count mismatch (UI vs schema):');
  mismatchedCounts.forEach((row) => console.log('  ' + row.route + ' ui=' + row.accordion + ' schema=' + row.schemaCount));
}

if (uiOnly.length || schemaOnly.length || mismatchedCounts.length) {
  process.exit(1);
}

console.log('\nEvery page with a visible FAQ accordion has matching FAQPage JSON-LD.');
