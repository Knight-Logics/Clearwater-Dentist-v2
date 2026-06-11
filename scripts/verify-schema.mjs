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

const files = (await walk(DIST)).filter((file) => !file.includes(`${path.sep}admin${path.sep}`));
let failures = 0;

for (const file of files) {
  const html = await fs.readFile(file, 'utf8');
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  if (!match) {
    console.error('Missing JSON-LD:', path.relative(DIST, file));
    failures++;
    continue;
  }

  const data = JSON.parse(match[1]);
  if (!data['@graph']) {
    console.error('Missing @graph:', path.relative(DIST, file));
    failures++;
    continue;
  }

  const types = new Set(data['@graph'].flatMap((node) => Array.isArray(node['@type']) ? node['@type'] : [node['@type']]));
  const ids = data['@graph'].map((node) => node['@id']).filter(Boolean);

  for (const required of ['Dentist', 'Organization', 'Person', 'WebSite', 'BreadcrumbList']) {
    if (!types.has(required)) {
      console.error('Missing ' + required + ':', path.relative(DIST, file));
      failures++;
    }
  }

  const dentistCount = data['@graph'].filter((node) => node['@type'] === 'Dentist' || (Array.isArray(node['@type']) && node['@type'].includes('Dentist'))).length;
  const orgCount = data['@graph'].filter((node) => node['@type'] === 'Organization').length;
  const localBusinessCount = data['@graph'].filter((node) => node['@type'] === 'LocalBusiness' || (Array.isArray(node['@type']) && node['@type'].includes('LocalBusiness'))).length;
  const reviewCount = data['@graph'].filter((node) => node['@type'] === 'Review').length;

  if (dentistCount !== 1) {
    console.error('Expected 1 Dentist node, found ' + dentistCount + ':', path.relative(DIST, file));
    failures++;
  }
  if (orgCount !== 1) {
    console.error('Expected 1 Organization node, found ' + orgCount + ':', path.relative(DIST, file));
    failures++;
  }
  if (localBusinessCount > 0) {
    console.error('Unexpected LocalBusiness node on:', path.relative(DIST, file));
    failures++;
  }
  if (reviewCount > 0) {
    console.error('Review nodes should not be stuffed on:', path.relative(DIST, file));
    failures++;
  }

  for (const video of data['@graph'].filter((node) => node['@type'] === 'VideoObject')) {
    if (!video.name || !video.thumbnailUrl || !video.uploadDate || !(video.contentUrl || video.embedUrl)) {
      console.error('Invalid VideoObject on:', path.relative(DIST, file), video['@id']);
      failures++;
    }
  }

  if (new Set(ids).size !== ids.length) {
    console.error('Duplicate @id values on:', path.relative(DIST, file));
    failures++;
  }
}

if (failures) {
  console.error(failures + ' schema verification issue(s)');
  process.exit(1);
}

console.log('Schema verified on ' + files.length + ' HTML pages.');
