import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/site.json'), 'utf8'));
const pages = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/pages.json'), 'utf8'));
const redirects = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/redirects.json'), 'utf8'));

const routes = new Set(pages.map(page => page.route.toLowerCase()));
const redirectFrom = new Set(redirects.map(rule => rule.from.toLowerCase()));
const dist = path.join(ROOT, 'dist');

function resolvePath(route) {
  const base = (route || '/').split('?')[0].split('#')[0] || '/';
  if (routes.has(base.toLowerCase())) return 'page';
  if (redirectFrom.has(base.toLowerCase())) return 'redirect';
  return 'missing';
}

function distExists(route) {
  const clean = route === '/' ? 'index.html' : path.join(route.replace(/^\//, ''), 'index.html');
  return fs.access(path.join(dist, clean)).then(() => true).catch(() => false);
}

const failures = [];

for (const link of [...(site.serviceLinks || []), ...(site.policyLinks || []), ...(site.quickLinks || [])]) {
  if (resolvePath(link.href) === 'missing') failures.push(`Footer/nav link missing page: ${link.href}`);
}

for (const rule of redirects) {
  if (!(await distExists(rule.from))) failures.push(`Redirect not built in dist: ${rule.from}`);
}

const thinServices = ['/solea-sleep', '/oral-cancer-screening', '/bone-grafting'].map(route => {
  const page = pages.find(item => item.route === route);
  return { route, sections: page?.sections?.length || 0 };
});

for (const route of (site.policyLinks || []).map(link => link.href)) {
  const page = pages.find(item => item.route === route);
  if (!page) failures.push(`Policy page missing in content: ${route}`);
  else if ((page.sections || []).length < 3) failures.push(`Policy page too thin: ${route}`);
}

for (const item of thinServices) {
  if (item.sections < 5) failures.push(`Service page still thin (${item.sections} sections): ${item.route}`);
}

console.log('Launch check — Clearwater Dentist v2');
console.log('Pages in content:', pages.length);
console.log('Policy pages:', pages.filter(page => page.type === 'policy').map(page => page.route).join(', ') || 'none');
console.log('Service pages in nav:', site.serviceLinks?.length || 0);
console.log('Thin service section counts:', thinServices.map(item => `${item.route}=${item.sections}`).join(', '));

if (failures.length) {
  console.error('\nFAILURES:');
  failures.forEach(item => console.error(' -', item));
  process.exit(1);
}

console.log('\nPASS: nav, policy, service links, and redirect stubs are aligned.');
