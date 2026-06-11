import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pagesPath = path.join(ROOT, 'src/content/pages.json');
const sitePath = path.join(ROOT, 'src/content/site.json');

const META_DESCRIPTIONS = {
  'new-patient-faqs':
    'New patient FAQs for Clearwater Dentist — what to expect at your first visit, forms, insurance, financing options, and how to prepare for care with Dr. Nadia Pokrovskaya.',
  'clearwater-dentist-dental-benefit-plans':
    'Learn about dental benefit programs and membership-style savings options available through Clearwater Dentist in Clearwater, FL.',
  'clearwater-dentist-join-the-safety-harbor-chamber-of-commerce':
    'Clearwater Dentist is a proud member of the Safety Harbor Chamber of Commerce, serving Pinellas County families with concierge dental care.',
  'the-clearwater-glow-up-5-secrets-to-a-vacation-ready-smile-without-the-resort-price-tag':
    'Discover five cosmetic dentistry tips from Clearwater Dentist for a brighter, vacation-ready smile without resort-level pricing.',
  'v-soft-pdo-thread-lifts-in-clearwater-lift-smooth-and-rejuvenate-without-surgery':
    'V Soft PDO thread lifts in Clearwater, FL at Clearwater Dentist — non-surgical facial rejuvenation to lift, smooth, and refresh your appearance.'
};

const BLOG_CANONICAL_SERVICES = {
  'blog-emergency-dentist-clearwater-fl': {
    href: '/emergency-dentistry-clearwater-fl',
    label: 'Emergency Dentistry in Clearwater, FL',
    blurb: 'Need urgent dental care today? Learn about same-day emergency visits at our Clearwater office.'
  },
  'blog-are-dental-implants-painful': {
    href: '/dental-implants-clearwater-fl',
    label: 'Dental Implants in Clearwater, FL',
    blurb: 'Ready to explore implant treatment? See how Dr. Nadia plans comfortable, natural-looking implant care.'
  },
  'blog-dental-cleaning-frequency-implants': {
    href: '/dental-implants-clearwater-fl',
    label: 'Dental Implants in Clearwater, FL',
    blurb: 'Implants need the right maintenance plan. Review our implant services and ongoing care approach.'
  },
  'blog-dental-implant-process-timeline': {
    href: '/dental-implants-clearwater-fl',
    label: 'Dental Implants in Clearwater, FL',
    blurb: 'Understand the full implant process from consultation to final restoration at Clearwater Dentist.'
  },
  'blog-dental-implant-timeline': {
    href: '/dental-implants-clearwater-fl',
    label: 'Dental Implants in Clearwater, FL',
    blurb: 'See how implant timelines are planned step by step for Clearwater patients.'
  },
  'blog-how-long-do-dental-implants-last': {
    href: '/dental-implants-clearwater-fl',
    label: 'Dental Implants in Clearwater, FL',
    blurb: 'Long-lasting implant results start with the right plan. Explore implant options with our team.'
  },
  'blog-dentist-for-anxious-patients-clearwater': {
    href: '/anti-anxiety-dentist-office',
    label: 'Anti-Anxiety Dentistry in Clearwater, FL',
    blurb: 'Nervous about dental visits? Learn how our calm, patient-paced approach helps anxious patients.'
  },
  'blog-therapy-dog-dentist-clearwater': {
    href: '/dental-therapy-dogs-clearwater-fl',
    label: 'Dental Therapy Dogs in Clearwater, FL',
    blurb: 'Meet our therapy dog program and see how it supports comfortable visits for anxious patients.'
  },
  'blog-smile-makeover-timeline': {
    href: '/smile-makeover',
    label: 'Smile Makeover in Clearwater, FL',
    blurb: 'Planning a smile transformation? Review smile makeover options and typical treatment timelines.'
  },
  'blog-smile-makeover-timeline-clearwater': {
    href: '/smile-makeover',
    label: 'Smile Makeover in Clearwater, FL',
    blurb: 'Explore customized smile makeover planning at our Clearwater dental office.'
  },
  'blog-questions-to-ask-dentist-consultation': {
    href: '/general-dentistry',
    label: 'General Dentistry in Clearwater, FL',
    blurb: 'Preparing for a dental consultation? Start with our general dentistry and new patient resources.'
  },
  'blog-havent-been-to-dentist-in-years': {
    href: '/general-dentistry',
    label: 'General Dentistry in Clearwater, FL',
    blurb: 'Returning after time away? Our team helps you ease back into care with a judgment-free visit.'
  },
  'blog-why-clearwater-dentist-dr-nadia': {
    href: '/meet-the-doctor',
    label: 'Meet Dr. Nadia Pokrovskaya',
    blurb: 'Learn more about Dr. Nadia’s background, philosophy, and approach to patient care.'
  }
};

function stripEmoji(text) {
  return String(text || '')
    .replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]+\s*/u, '')
    .trim();
}

const pages = JSON.parse(await fs.readFile(pagesPath, 'utf8'));
let h1Fixes = 0;
let metaFixes = 0;
let blogLinks = 0;
let emojiFixes = 0;

for (const page of pages) {
  if (page.h1 && page.h1.includes(' at Clearwater, FL')) {
    page.h1 = page.h1.replace(' at Clearwater, FL', ' in Clearwater, FL');
    h1Fixes += 1;
  }

  if (!page.description && META_DESCRIPTIONS[page.slug]) {
    page.description = META_DESCRIPTIONS[page.slug];
    metaFixes += 1;
  }

  if (BLOG_CANONICAL_SERVICES[page.slug]) {
    page.canonicalService = BLOG_CANONICAL_SERVICES[page.slug];
    blogLinks += 1;
  }

  if (page.title && /[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/u.test(page.title)) {
    page.title = stripEmoji(page.title);
    emojiFixes += 1;
  }
}

await fs.writeFile(pagesPath, JSON.stringify(pages, null, 2) + '\n', 'utf8');

const site = JSON.parse(await fs.readFile(sitePath, 'utf8'));
site.pageCount = pages.length + (site.serviceAreas || []).length;
site.quickLinks = (site.quickLinks || []).filter((link) => link.href !== '/llms-full.txt');
if (!site.quickLinks.some((link) => link.href === '/llms.txt')) {
  site.quickLinks.push({ href: '/llms.txt', label: 'LLMs Index' });
}
await fs.writeFile(sitePath, JSON.stringify(site, null, 2) + '\n', 'utf8');

console.log(`Patched pages.json: ${h1Fixes} H1 fixes, ${metaFixes} meta descriptions, ${blogLinks} blog service links, ${emojiFixes} emoji titles removed.`);
