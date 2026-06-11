import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectPageFaqItems } from './faq-accordion.mjs';
import { applyPageFaqs } from './merge-page-faqs.mjs';
import { buildSchemaGraph } from './schema-graph.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT_DIR = path.join(ROOT, 'reports');

function extractFaqs(page) {
  return collectPageFaqItems(page);
}

async function walk(dir, files = []) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const current = path.join(dir, entry.name);
    if (entry.isDirectory()) await walk(current, files);
    else if (entry.name === 'index.html') files.push(current);
  }
  return files;
}

function routeFromDistFile(file) {
  const rel = path.relative(DIST, file).replace(/\\/g, '/');
  if (rel === 'index.html') return '/';
  return '/' + rel.replace(/\/index\.html$/, '');
}

function countType(graph, type) {
  return graph.filter((node) => {
    const t = node['@type'];
    return t === type || (Array.isArray(t) && t.includes(type));
  }).length;
}

function hasType(graph, type) {
  return countType(graph, type) > 0;
}

function faqCount(graph) {
  const faq = graph.find((node) => node['@type'] === 'FAQPage');
  return faq?.mainEntity?.length || 0;
}

function yn(value) {
  return value ? 'Y' : '-';
}

function pad(str, width) {
  const s = String(str);
  return s.length >= width ? s : s + ' '.repeat(width - s.length);
}

async function main() {
  const pagesRaw = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/pages.json'), 'utf8'));
  const site = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/site.json'), 'utf8'));
  const serviceAreaPages = (site.serviceAreas || []).map((area) => ({
    route: `/${area.slug}`,
    type: 'serviceArea',
    area
  }));
  const pages = applyPageFaqs(pagesRaw.concat(serviceAreaPages), site);
  let googleReviews = {};
  try {
    googleReviews = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/google-reviews.json'), 'utf8'));
  } catch {
    // optional
  }

  const contentByRoute = new Map(pages.map((page) => [page.route, page]));
  for (const area of site.serviceAreas || []) {
    const route = '/' + (area.slug || area.label?.toLowerCase().replace(/\s+/g, '-'));
    if (!contentByRoute.has(route)) {
      contentByRoute.set(route, {
        route,
        type: 'serviceArea',
        h1: area.label,
        title: area.label,
        area
      });
    }
  }

  const htmlFiles = (await walk(DIST)).filter((file) => !file.includes(`${path.sep}admin${path.sep}`));
  const rows = [];

  for (const file of htmlFiles.sort()) {
    const route = routeFromDistFile(file);
    const html = await fs.readFile(file, 'utf8');
    const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    const page = contentByRoute.get(route);

    if (!match) {
      rows.push({
        route,
        pageType: page?.type || '?',
        faqPage: false,
        faqN: 0,
        videoN: 0,
        service: false,
        blog: false,
        place: false,
        contentFaqs: page ? extractFaqs(page).length : 0,
        error: 'missing JSON-LD'
      });
      continue;
    }

    const data = JSON.parse(match[1]);
    const graph = data['@graph'] || [];

    rows.push({
      route,
      pageType: page?.type || '?',
      faqPage: hasType(graph, 'FAQPage'),
      faqN: faqCount(graph),
      videoN: countType(graph, 'VideoObject'),
      service: hasType(graph, 'Service'),
      blog: hasType(graph, 'BlogPosting') || hasType(graph, 'Article'),
      place: hasType(graph, 'Place'),
      contentFaqs: page ? extractFaqs(page).length : 0,
      error: ''
    });
  }

  const faqPages = rows.filter((row) => row.faqPage);
  const videoPages = rows.filter((row) => row.videoN > 0);
  const servicePages = rows.filter((row) => row.service);
  const contentOnlyFaqs = rows.filter((row) => row.contentFaqs > 0 && !row.faqPage);
  const missingContentFaqs = rows.filter((row) => row.contentFaqs === 0 && row.faqPage);

  console.log('Schema coverage map — ' + rows.length + ' routes\n');
  const routeWidth = Math.min(60, Math.max(44, ...rows.map((row) => row.route.length)));

  console.log(
    pad('Route', routeWidth) +
      pad('Type', 12) +
      'FAQ  Vid  Svc  Blog Place  contentQ'
  );
  console.log('-'.repeat(routeWidth + 52));

  for (const row of rows) {
    const flag = row.contentFaqs > 0 && !row.faqPage ? ' !' : '';
    console.log(
      pad(row.route, routeWidth) +
        pad(row.pageType, 12) +
        pad(yn(row.faqPage) + (row.faqN ? '(' + row.faqN + ')' : ''), 5) +
        pad(String(row.videoN || '-'), 5) +
        pad(yn(row.service), 5) +
        pad(yn(row.blog), 5) +
        pad(yn(row.place), 6) +
        String(row.contentFaqs) +
        flag +
        (row.error ? ' [' + row.error + ']' : '')
    );
  }

  console.log('\nSummary');
  console.log('  FAQPage:      ' + faqPages.length + ' routes');
  console.log('  VideoObject:  ' + videoPages.length + ' routes (' + videoPages.reduce((n, r) => n + r.videoN, 0) + ' videos)');
  console.log('  Service:      ' + servicePages.length + ' routes');
  console.log('  Blog/Article: ' + rows.filter((r) => r.blog).length + ' routes');
  console.log('  Place:        ' + rows.filter((r) => r.place).length + ' routes');

  if (contentOnlyFaqs.length) {
    console.log('\nContent has Q&A items but dist missing FAQPage (investigate):');
    for (const row of contentOnlyFaqs) {
      console.log('  ' + row.route + ' (' + row.contentFaqs + ' items)');
    }
  }

  if (missingContentFaqs.length) {
    console.log('\nFAQPage in dist without parseable section items:');
    for (const row of missingContentFaqs) {
      console.log('  ' + row.route);
    }
  }

  const moneyServices = pages.filter(
    (page) =>
      page.type === 'service' &&
      !/\/(how-|what-|why-|the-|taming-|needle-|dental-anxiety|havent-|questions-)/i.test(page.route) &&
      page.route !== '/new-patient-faqs'
  );
  const moneyWithoutFaqs = moneyServices.filter((page) => extractFaqs(page).length === 0);
  console.log('\nMoney service pages without visible FAQ section items: ' + moneyWithoutFaqs.length + '/' + moneyServices.length);
  console.log('  (FAQs merge at build from scripts/page-faq-content.mjs when not already in pages.json)');

  const home = pages.find((page) => page.route === '/');
  if (home) {
    const homeGraph = buildSchemaGraph(home, site, googleReviews);
    const homeTypes = homeGraph['@graph'].map((node) => node['@type']);
    console.log('\nHomepage (/) expected extras: VideoObject=' + homeTypes.filter((t) => t === 'VideoObject').length + ', FAQPage=' + (homeTypes.includes('FAQPage') ? 'yes' : 'no'));
  }

  await fs.mkdir(OUT_DIR, { recursive: true });
  const csvPath = path.join(OUT_DIR, 'schema-coverage-map.csv');
  const header = 'route,page_type,faq_page,faq_count,video_count,service,blog_or_article,place,content_faq_items,notes\n';
  const csv = header + rows.map((row) => [
    row.route,
    row.pageType,
    row.faqPage ? '1' : '0',
    row.faqN,
    row.videoN,
    row.service ? '1' : '0',
    row.blog ? '1' : '0',
    row.place ? '1' : '0',
    row.contentFaqs,
    row.contentFaqs > 0 && !row.faqPage ? 'content_without_schema' : row.error
  ].join(',')).join('\n') + '\n';
  await fs.writeFile(csvPath, csv, 'utf8');
  console.log('\nWrote ' + path.relative(ROOT, csvPath));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
