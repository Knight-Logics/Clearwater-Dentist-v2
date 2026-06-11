export const FAQ_HEADING_RE = /frequently asked questions/i;

function stripHtml(text) {
  return String(text || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseFaqItem(text) {
  const clean = stripHtml(text);
  const match = clean.match(/^(.+?\?)\s+([\s\S]+)$/);
  if (!match) return null;
  const question = match[1].trim();
  const answer = match[2].trim();
  if (question.length < 8 || answer.length < 12) return null;
  return { question, answer, source: String(text || '') };
}

export function isFaqSection(section) {
  return FAQ_HEADING_RE.test(section?.heading || '');
}

export function collectPageFaqItems(page) {
  const seen = new Set();
  const items = [];

  for (const section of page.sections || []) {
    for (const item of section.items || []) {
      const parsed = parseFaqItem(item);
      if (!parsed || seen.has(parsed.question)) continue;
      seen.add(parsed.question);
      items.push(parsed);
    }
  }

  return items;
}

export function contentSections(page, sections) {
  const list = sections || page.sections || [];

  return list
    .map((section) => ({
      ...section,
      items: (section.items || []).filter((item) => !parseFaqItem(item))
    }))
    .filter((section) => {
      if (isFaqSection(section)) return false;
      return (section.body || []).length || (section.items || []).length || section.figure;
    });
}

export function faqBandCopy(page) {
  if (page.route === '/') {
    return {
      eyebrow: 'FAQ',
      title: 'Common questions before your first visit',
      intro: 'Direct answers patients and search engines look for about appointments, emergencies, financing, and what to expect at Clearwater Dentist.'
    };
  }
  if (page.route === '/new-patient-faqs') {
    return {
      eyebrow: 'New Patient FAQ',
      title: 'Answers to our most common new patient questions',
      intro: 'Everything from office policies and insurance to your first visit, services, and comfort options at our Clearwater, FL practice.'
    };
  }
  if (page.type === 'serviceArea' && page.area) {
    return {
      eyebrow: 'Local FAQ',
      title: `Common questions from patients near ${page.area.label}`,
      intro: `Helpful answers for ${page.area.city} families visiting Clearwater Dentist for general, cosmetic, emergency, and implant care.`
    };
  }
  const title = String(page.h1 || page.title || 'this treatment').replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]+\s*/u, '').trim();
  return {
    eyebrow: 'FAQ',
    title: `Common questions about ${title}`,
    intro: 'Clear, straightforward answers about this treatment at Clearwater Dentist — what to expect, candidacy, comfort, and how to get started.'
  };
}

export function faqAccordionHtml(page, items, helpers) {
  if (!items.length) return '';

  const { e, attr, richText, cwEdit, cwRevealAttr } = helpers;
  const copy = faqBandCopy(page);
  const routeKey = page.route === '/' ? 'home' : String(page.route || '').replace(/^\//, '').replace(/\//g, '--');
  const headingId = 'cw-faq-heading-' + routeKey;

  const cards = items.map((item, index) => {
    const answerSource = item.source.replace(/^(.+?\?)\s+/, '');
    const answerHtml = richText(answerSource || item.answer);
    return '<details class="cw-faq-item"' + cwEdit(page.route, 'faq-' + index + '-q', 'FAQ question ' + (index + 1)) + '>'
      + '<summary>' + e(item.question) + '</summary>'
      + '<div class="cw-faq-item__answer"' + cwEdit(page.route, 'faq-' + index + '-a', 'FAQ answer ' + (index + 1)) + '><p>' + answerHtml + '</p></div>'
      + '</details>';
  }).join('');

  const moreLink = page.route === '/'
    ? ''
    : page.route !== '/new-patient-faqs'
      ? '<p class="cw-faq-band__more"><a href="/new-patient-faqs">More new patient FAQs</a></p>'
      : '';

  return '<section class="cw-faq-band cw-reveal" id="faqs" aria-labelledby="' + attr(headingId) + '"' + cwRevealAttr('bottom', 100) + '>'
    + '<div class="cw-faq-band__inner">'
    + '<div class="cw-faq-band__head section-head">'
    + '<p class="cw-kicker"' + cwEdit(page.route, 'faq-eyebrow', 'FAQ eyebrow') + '>' + e(copy.eyebrow) + '</p>'
    + '<h2 id="' + attr(headingId) + '"' + cwEdit(page.route, 'faq-title', 'FAQ title') + '>' + e(copy.title) + '</h2>'
    + '<p class="cw-faq-band__intro"' + cwEdit(page.route, 'faq-intro', 'FAQ intro') + '>' + e(copy.intro) + '</p>'
    + '</div>'
    + '<div class="cw-faq-list">' + cards + '</div>'
    + moreLink
    + '</div></section>';
}
