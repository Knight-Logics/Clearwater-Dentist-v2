import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const REPORTS = path.join(ROOT, 'reports');
const PAGES_PATH = path.join(ROOT, 'src/content/pages.json');

const SNAPSHOTS = [
  { query: 'emergency dentist clearwater fl', route: '/emergency-dentistry-clearwater-fl' },
  { query: 'dentist clearwater fl', route: '/' },
  { query: 'xerf skin tightening clearwater', route: '/XERF-skin-tightening' },
  { query: 'tmj treatment clearwater fl', route: '/tmj-treatment-clearwater-fl' },
  { query: 'toothache home remedies dentist', route: '/taming-toothaches-home-remedies-and-when-to-see-a-dentist' }
];

function readSerperKey() {
  const envPaths = [
    path.join(ROOT, '.env'),
    path.join(path.dirname(ROOT), 'KnightLogics-Growth-System', 'CRM', 'OutreachEngine', '.env')
  ];
  for (const envPath of envPaths) {
    try {
      const text = fsSync.readFileSync(envPath, 'utf8');
      const match = text.match(/^SERPER_API_KEY=(.+)$/m);
      if (match) return match[1].trim();
    } catch {
      // try next
    }
  }
  return process.env.SERPER_API_KEY || '';
}

function estimateTitlePx(text) {
  return [...String(text)].reduce((sum, ch) => sum + (ch === '|' || ch === ':' ? 8 : ch === ch.toUpperCase() && /[A-Z]/.test(ch) ? 11 : 7), 0);
}

function estimateDescPx(text) {
  return [...String(text)].reduce((sum, ch) => sum + (/[A-Z]/.test(ch) ? 8.2 : 6.8), 0);
}

async function serperSearch(apiKey, query) {
  const response = await fetch('https://google.serper.dev/search', {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      q: query,
      gl: 'us',
      location: 'Clearwater, Florida, United States',
      num: 10
    })
  });
  if (!response.ok) {
    throw new Error('Serper request failed: ' + response.status + ' ' + (await response.text()));
  }
  return response.json();
}

async function main() {
  const apiKey = readSerperKey();
  if (!apiKey) {
    console.error('Missing SERPER_API_KEY. Set env var or add OutreachEngine .env path.');
    process.exit(1);
  }

  const pages = JSON.parse(await fs.readFile(PAGES_PATH, 'utf8'));
  const capturedAt = new Date().toISOString().slice(0, 10);
  const results = [];

  for (const snap of SNAPSHOTS) {
    const page = pages.find((entry) => entry.route === snap.route);
    const serp = await serperSearch(apiKey, snap.query);
    const organic = serp.organic || [];
    const rank = organic.findIndex((row) => String(row.link || '').includes('clearwaterdentist.com')) + 1;
    const title = page?.title || '';
    const description = page?.description || '';

    results.push({
      query: snap.query,
      route: snap.route,
      capturedAt,
      clearwaterdentistRank: rank || null,
      v2: {
        title,
        titleChars: title.length,
        titlePxEst: Math.round(estimateTitlePx(title)),
        description,
        descriptionChars: description.length,
        descriptionPxEst: Math.round(estimateDescPx(description)),
        h1: page?.h1 || ''
      },
      titleTruncRisk: estimateTitlePx(title) > 600,
      descriptionTruncRisk: estimateDescPx(description) > 920,
      competitors: organic.slice(0, 5).map((row) => ({
        title: row.title,
        link: row.link,
        snippet: row.snippet
      }))
    });
  }

  await fs.mkdir(REPORTS, { recursive: true });
  const outPath = path.join(REPORTS, 'serp-snapshot-' + capturedAt + '.json');
  await fs.writeFile(outPath, JSON.stringify({ capturedAt, results }, null, 2) + '\n', 'utf8');

  console.log('SERP snapshot saved:', path.relative(ROOT, outPath));
  for (const row of results) {
    console.log(
      row.route,
      '| query:', row.query,
      '| rank:', row.clearwaterdentistRank ?? 'not in top 10',
      '| title px:', row.v2.titlePxEst,
      '| desc px:', row.v2.descriptionPxEst,
      row.descriptionTruncRisk ? '| DESC TRUNC RISK' : ''
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
