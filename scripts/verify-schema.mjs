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

const requiredGlobal = ['Dentist', 'LocalBusiness', 'Organization', 'Physician', 'WebSite'];
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
  for (const type of requiredGlobal) {
    if (!types.has(type)) {
      console.error('Missing ' + type + ':', path.relative(DIST, file));
      failures++;
    }
  }
}

if (failures) {
  console.error(failures + ' schema verification issue(s)');
  process.exit(1);
}

console.log('Schema verified on ' + files.length + ' HTML pages.');
