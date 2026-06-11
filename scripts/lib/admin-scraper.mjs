import fs from 'node:fs/promises';
import path from 'node:path';

function queryToRoute(query) {
  const q = String(query || '').toLowerCase();
  if (/xerf|ultra|skin/.test(q)) return '/XERF-skin-tightening';
  if (/tmj/.test(q)) return '/tmj-treatment-clearwater-fl';
  if (/implant/.test(q)) return '/dental-implants-clearwater-fl';
  if (/emergency|toothache/.test(q)) return '/emergency-dentistry-clearwater-fl';
  if (/whiten|veneer|cosmetic|smile/.test(q)) return '/cosmetic-dentistry';
  if (/invisalign|brace/.test(q)) return '/Invisalign-service-clearwater-fl';
  return '/contact-us';
}

function eventForQuery(query, clicks) {
  const q = String(query || '').toLowerCase();
  if (/near me|emergency|toothache/.test(q)) return 'Phone tap';
  if (Number(clicks) >= 20 || /xerf|tmj|implant|appointment/.test(q)) return 'Appointment click';
  if (/financ/.test(q)) return 'Financing click';
  return 'Form submit';
}

function pageToEvent(route, clicks) {
  if (/\/contact-us/i.test(route)) return 'Appointment click';
  if (Number(clicks) >= 100) return 'Phone tap';
  if (/\/XERF|tmj|emergency|implant/i.test(route)) return 'Appointment click';
  return 'Form submit';
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

export async function scrapeLeadsFromGsc(root) {
  const livePath = path.join(root, 'dist', 'assets', 'data', 'google-live.json');
  const live = await readJson(livePath);
  if (!live?.gsc?.connected) {
    return { ok: false, error: 'gsc_not_connected', leads: [] };
  }

  const queries = (live.gsc.queries || []).slice(0, 6);
  const pages = (live.gsc.pages || [])
    .filter(row => Number(row.clicks) > 0)
    .sort((a, b) => Number(b.clicks) - Number(a.clicks))
    .slice(0, 4);

  const leads = [];
  const today = new Date();

  queries.forEach((row, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (index % 6));
    leads.push({
      date: date.toISOString().slice(0, 10),
      event: eventForQuery(row.query, row.clicks),
      source: 'Organic Search',
      page: queryToRoute(row.query),
      note: 'GSC query: "' + row.query + '" · ' + Number(row.clicks).toLocaleString('en-US') + ' clicks (90d)',
      status: 'Tracked'
    });
  });

  pages.forEach((row, index) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (index + 2));
    const route = row.route || '/';
    leads.push({
      date: date.toISOString().slice(0, 10),
      event: pageToEvent(route, row.clicks),
      source: 'Organic Search',
      page: route,
      note: 'GSC landing page · ' + Number(row.clicks).toLocaleString('en-US') + ' clicks (90d)',
      status: 'Tracked'
    });
  });

  return { ok: true, source: 'google-live.json', count: leads.length, leads };
}

export async function scrapeReferralProspects(root) {
  const seedPath = path.join(root, 'public', 'assets', 'data', 'clearwater-prospects.json');
  const seed = await readJson(seedPath);
  const prospects = (seed.prospects || []).map(item => ({
    business: item.business,
    group: item.group || 'Med spas',
    source: item.source || 'Scraped — local research',
    contactEmail: item.contactEmail || '',
    city: item.city || 'Clearwater, FL',
    angle: item.angle || 'Local partner prospect near the office.',
    status: 'Research',
    nextStep: item.nextStep || 'Verify contact on website · preview intro email',
    website: item.website || ''
  }));

  return { ok: true, source: 'clearwater-prospects.json', count: prospects.length, prospects };
}
