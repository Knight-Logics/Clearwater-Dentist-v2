import { PAGE_FAQS, serviceAreaFaqs } from './page-faq-content.mjs';

const FAQ_HEADING_RE = /frequently asked questions/i;

function hasParseableFaqItems(items = []) {
  return items.some((item) => {
    const clean = String(item || '').trim();
    const match = clean.match(/^(.+?\?)\s+([\s\S]+)$/);
    return match && match[1].length >= 8 && match[2].length >= 12;
  });
}

function upsertFaqSection(sections, faqDef) {
  const next = [...sections];
  const heading = faqDef.heading || 'Frequently Asked Questions';
  const existingIdx = next.findIndex((section) => FAQ_HEADING_RE.test(section.heading || ''));

  if (existingIdx >= 0) {
    if (hasParseableFaqItems(next[existingIdx].items)) return next;
    next[existingIdx] = { ...next[existingIdx], heading, items: faqDef.items };
    return next;
  }

  if (faqDef.replaceSection) {
    const replaceIdx = next.findIndex((section) => section.heading === faqDef.replaceSection);
    if (replaceIdx >= 0) {
      next[replaceIdx] = { heading, items: faqDef.items };
      return next;
    }
  }

  next.push({ heading, items: faqDef.items });
  return next;
}

export function applyPageFaqs(pages, site) {
  return pages.map((page) => {
    let faqDef = PAGE_FAQS[page.route];

    if (!faqDef && page.type === 'serviceArea' && page.area) {
      faqDef = { items: serviceAreaFaqs(page.area, site) };
    }

    if (!faqDef?.items?.length) return page;

    const sections = upsertFaqSection(page.sections || [], faqDef);
    return { ...page, sections };
  });
}

export function homeFaqSection(page) {
  const section = (page.sections || []).find((item) => FAQ_HEADING_RE.test(item.heading || ''));
  if (!section?.items?.length) return null;
  return section;
}
