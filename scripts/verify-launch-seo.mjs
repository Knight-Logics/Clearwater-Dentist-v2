import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const pages = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/pages.json'), 'utf8'));
const site = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/site.json'), 'utf8'));
const redirects = JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/redirects.json'), 'utf8'));
const errors = [];

if (pages.some((page) => (page.h1 || '').includes(' at Clearwater, FL'))) {
  errors.push('H1 grammar still uses "at Clearwater, FL"');
}
if (pages.some((page) => !page.description)) {
  errors.push('Missing meta descriptions remain');
}
if (pages.filter((page) => page.type === 'blogPost').some((page) => !page.canonicalService)) {
  errors.push('Blog posts missing canonicalService links');
}
if (pages.some((page) => /[\u{1F300}-\u{1FAFF}]/u.test(page.title || ''))) {
  errors.push('Emoji still present in a title');
}

for (const file of ['sitemap.xml', 'robots.txt', '.htaccess', '_redirects', 'llms.txt', 'llms-full.txt', 'humans.txt']) {
  if (!fs.existsSync(path.join(DIST, file))) errors.push(`Missing dist/${file}`);
}

for (const area of site.serviceAreas || []) {
  if (!fs.existsSync(path.join(DIST, area.slug, 'index.html'))) {
    errors.push(`Missing service area page /${area.slug}`);
  }
}

const redirectText = fs.readFileSync(path.join(DIST, '_redirects'), 'utf8');
for (const rule of ['/teeth-whitening', '/veneers', '/family-dentistry-clearwater-fl', '/ampify/*', '/restorative-']) {
  if (!redirectText.includes(rule)) errors.push(`Missing _redirects rule for ${rule}`);
}

const htaccess = fs.readFileSync(path.join(DIST, '.htaccess'), 'utf8');
if (!htaccess.includes('ampify')) errors.push('Missing ampify wildcard in .htaccess');

const home = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
if (home.includes('site-admin-preview.css')) errors.push('Admin preview CSS still in production HTML');

const llms = fs.readFileSync(path.join(DIST, 'llms.txt'), 'utf8');
if (llms.includes('/llm.txt') && !llms.includes('/llms.txt')) {
  errors.push('llms.txt uses wrong path /llm.txt — must be /llms.txt');
}
for (const token of ['Canonical Business Facts', 'Do Not Infer', 'Intent Mapping', 'XERF', 'llms-full.txt']) {
  if (!llms.includes(token)) errors.push(`llms.txt missing section/token: ${token}`);
}

const llmsFull = fs.readFileSync(path.join(DIST, 'llms-full.txt'), 'utf8');
for (const token of ['Canonical Business Facts', 'Do Not Infer', 'Intent Mapping', 'Complete Page Catalog', 'Schema Overview', 'XERF-skin-tightening', '/blog/', 'dentist-clearwater-fl']) {
  if (!llmsFull.includes(token)) errors.push(`llms-full.txt missing ${token}`);
}

const robots = fs.readFileSync(path.join(DIST, 'robots.txt'), 'utf8');
if (!robots.includes('/llms.txt') || !robots.includes('/llms-full.txt')) {
  errors.push('robots.txt missing llms.txt / llms-full.txt discovery comments');
}

const sitemap = fs.readFileSync(path.join(DIST, 'sitemap.xml'), 'utf8');
const urlCount = (sitemap.match(/<loc>/g) || []).length;

console.log(`Sitemap URLs: ${urlCount}`);
console.log(`Redirect rules: ${redirects.length}`);
console.log(`Expected pages: ${pages.length + (site.serviceAreas || []).length}`);

if (errors.length) {
  console.error('Verification failed:');
  for (const error of errors) console.error(' -', error);
  process.exit(1);
}

console.log('Launch SEO verification passed.');
