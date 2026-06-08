import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesPath = path.join(ROOT, 'src/content/pages.json');
const googleReviews = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/google-reviews.json'), 'utf8'));

function normalizePersonName(name) {
  return String(name || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

const GOOGLE_REVIEW_NAME_KEYS = new Set(
  googleReviews.reviews.flatMap(review => {
    const normalized = normalizePersonName(review.name);
    return [normalized, normalized.replace(/\s/g, '')];
  })
);

const SERVICE_JUNK_HEADINGS = new Set([
  'immediate help!',
  'immediate help',
  'high quality and professional dental services',
  'a story to tell...',
  'why work with our team'
]);

function headingLooksLikeReviewName(heading) {
  const normalized = normalizePersonName(heading);
  const compact = normalized.replace(/\s/g, '');
  if (GOOGLE_REVIEW_NAME_KEYS.has(normalized) || GOOGLE_REVIEW_NAME_KEYS.has(compact)) return true;
  for (const key of GOOGLE_REVIEW_NAME_KEYS) {
    if (key.replace(/\s/g, '') === compact) return true;
  }
  return false;
}

export function isGoogleReviewSection(section) {
  const body = section.body || [];
  const text = body.join('\n');
  const heading = String(section.heading || '').trim();

  if (headingLooksLikeReviewName(heading)) return true;
  if (/\bLocal Guide\b/.test(text) && /"/.test(text)) return true;
  if (/\d+\s+reviews?\b/i.test(text) && /"/.test(text)) return true;

  if (
    body.length &&
    body.every(line => {
      const trimmed = line.trim();
      return (
        !trimmed ||
        trimmed.startsWith('"') ||
        /^\d+\s+(hours?|days?|weeks?|months?|years?)\s+ago$/i.test(trimmed) ||
        /\d+\s+reviews?/i.test(trimmed) ||
        /Local Guide/i.test(trimmed) ||
        /Mc Mullen Booth/i.test(trimmed)
      );
    }) &&
    body.some(line => line.trim().startsWith('"'))
  ) {
    if (
      heading &&
      heading.length < 48 &&
      !/\b(dental|dentistry|teeth|smile|treatment|care|implant|veneer|clearwater|emergency|gum|whitening|invisalign|crown|bridge|sedation)\b/i.test(heading)
    ) {
      return true;
    }
  }

  return false;
}

export function isScrapedJunkSection(section) {
  const heading = normalizePersonName(section.heading);
  const body = section.body || [];

  if (SERVICE_JUNK_HEADINGS.has(heading)) return true;
  if (body.some(line => /^before$/i.test(line.trim())) && body.some(line => /^after$/i.test(line.trim()))) return true;
  if (heading === 'dr. nadia pokrovskaya' && body.join(' ').includes('I love working as a dentist')) return true;

  return false;
}

export function shouldOmitServiceSection(section) {
  return isGoogleReviewSection(section) || isScrapedJunkSection(section);
}

export function servicePageSections(page) {
  if (page.type !== 'service') return page.sections || [];
  return (page.sections || []).filter(section => !shouldOmitServiceSection(section));
}

const GALLERY_CASE_STUDY_NAME = /^[A-Z][a-z]+(?:['\u2019]s)?\s+[A-Z]\.?$/;

const GALLERY_BODY_RESUME_MARKERS = [
  /^whether you(?:'|\u2019)?re/i,
  /^if you(?:'|\u2019)?re looking/i,
  /^if you(?:'|\u2019)?re ready/i,
  /^our repair/i,
  /^these natural/i
];

function isGalleryCaseStudyName(line) {
  const trimmed = String(line || '').trim();
  return trimmed.length > 0 && trimmed.length <= 40 && GALLERY_CASE_STUDY_NAME.test(trimmed);
}

function shouldResumeGalleryBody(line) {
  const trimmed = String(line || '').trim();
  return GALLERY_BODY_RESUME_MARKERS.some(marker => marker.test(trimmed));
}

export function cleanGallerySectionBody(body) {
  if (!Array.isArray(body)) return [];

  const kept = [];
  let skippingCaseStudy = false;

  for (const line of body) {
    const trimmed = String(line || '').trim();
    if (!trimmed) continue;

    if (isGalleryCaseStudyName(trimmed)) {
      skippingCaseStudy = true;
      continue;
    }

    if (skippingCaseStudy) {
      if (shouldResumeGalleryBody(trimmed)) {
        skippingCaseStudy = false;
        kept.push(line);
      }
      continue;
    }

    if (/^before\s*&\s*after$/i.test(trimmed)) continue;

    kept.push(line);
  }

  return kept;
}

export function galleryPageSections(page) {
  if (page.type !== 'gallery' || !Array.isArray(page.sections)) return page.sections || [];

  return page.sections.map(section => ({
    ...section,
    body: cleanGallerySectionBody(section.body)
  }));
}

async function cleanPagesFile() {
  const pages = JSON.parse(await fs.readFile(pagesPath, 'utf8'));
  let removedSections = 0;
  let removedGalleryLines = 0;

  for (const page of pages) {
    if (page.type === 'service' && Array.isArray(page.sections)) {
      const next = servicePageSections(page);
      removedSections += page.sections.length - next.length;
      page.sections = next;
      continue;
    }

    if (page.type === 'gallery' && Array.isArray(page.sections)) {
      for (const section of page.sections) {
        const before = section.body?.length || 0;
        section.body = cleanGallerySectionBody(section.body);
        removedGalleryLines += Math.max(0, before - section.body.length);
      }
    }
  }

  await fs.writeFile(pagesPath, JSON.stringify(pages, null, 2) + '\n', 'utf8');
  console.log('Removed', removedSections, 'scraped sections from service pages in pages.json');
  console.log('Removed', removedGalleryLines, 'scraped gallery case-study lines in pages.json');
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  await cleanPagesFile();
}
