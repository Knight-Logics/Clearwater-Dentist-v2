import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapeLeadsFromGsc, scrapeReferralProspects } from './lib/admin-scraper.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const leads = await scrapeLeadsFromGsc(ROOT);
const prospects = await scrapeReferralProspects(ROOT);

console.log('Leads from GSC:', leads.ok ? leads.count : leads.error);
if (leads.ok) {
  leads.leads.slice(0, 3).forEach(row => console.log(' -', row.event, row.page, '·', row.note));
}
console.log('Referral prospects:', prospects.ok ? prospects.count : prospects.error);
if (prospects.ok) {
  prospects.prospects.slice(0, 3).forEach(row => console.log(' -', row.business, '(' + row.group + ')'));
}
