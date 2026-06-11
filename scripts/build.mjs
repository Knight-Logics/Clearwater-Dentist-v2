import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { galleryPageSections, servicePageSections } from './clean-page-sections.mjs';
import { generateLlmsFull, robotsTxtContent } from './llms-content.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const site = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/site.json'), 'utf8'));
const pages = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/pages.json'), 'utf8'));
const redirects = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/redirects.json'), 'utf8'));
const googleReviews = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/google-reviews.json'), 'utf8'));
const PREVIEW_NOINDEX = process.env.PREVIEW_NOINDEX === 'true';
const INCLUDE_ADMIN_PREVIEW = PREVIEW_NOINDEX;
const APPOINTMENT_PATH = '/contact-us';

function serviceAreaPages() {
  return (site.serviceAreas || []).map((area) => ({
    route: `/${area.slug}`,
    slug: area.slug,
    type: 'serviceArea',
    title: `Dentist in ${area.label} | Clearwater Dentist`,
    description: `Looking for a dentist near ${area.city}, ${area.state}? Clearwater Dentist serves ${area.label} and nearby neighborhoods with family, cosmetic, emergency, and implant dentistry.`,
    h1: `Dentist in ${area.label}`,
    area
  }));
}

const allPages = pages.concat(serviceAreaPages());
const REVIEW_AVATAR_COLORS = ['review-avatar--blue', 'review-avatar--red', 'review-avatar--green', 'review-avatar--orange', 'review-avatar--purple', 'review-avatar--teal'];

const serviceImages = {
  '/general-dentistry': '/assets/images/clearwater-dentist-clearwater-fl-front-of-dental-office-1920w.webp',
  '/dental-implants-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-woman-dental-implants-6627bd42-07d3fb59-1920w.webp',
  '/implant-supported-dentures-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-old-person-smiling-17cba580-1920w.webp',
  '/bone-grafting': '/assets/images/clearwater-dentist-clearwater-fl-dr-nadia-pokrovskaya-2-42fee302-cc2dcf47-1920w.webp',
  '/tooth-extraction-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-tooth-extraction-d8c9769c-260a362d-2880w.webp',
  '/cosmetic-dentistry': '/assets/images/clearwater-dentist-clearwater-fl-smile-lady-2880w.webp',
  '/smile-makeover': '/assets/images/clearwater-dentist-clearwater-fl-smile-makeover-ab960fc4-256c5e17-1920w.webp',
  '/porcelain-veneers-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-veneer-1920w.webp',
  '/Invisalign-service-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-invisalign-girl-fd93d95a-2880w.webp',
  '/teeth-whitening-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-teeth-whitening-1920w.webp',
  '/emergency-dentistry-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-emergency-2-1920w.webp',
  '/gum-disease-treatment': '/assets/images/clearwater-dentist-clearwater-fl-gingivectomy-be1e5855-1920w.webp',
  '/root-canal-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-root-canal-1920w.webp',
  '/crowns-and-bridges': '/assets/images/clearwater-dentist-clearwater-fl-crowns-and-bridges-1920w.webp',
  '/sedation-dentistry-clearwater-fl': '/assets/images/sedation-dentist-v2-0000000-1920w.webp',
  '/laser-dentistry': '/assets/images/clearwater-dentist-clearwater-fl-laser-dentistry-1920w.webp',
  '/facial-esthetics': '/assets/images/screenshot-2025-12-05-at-2-33-21-pm-1920w.webp',
  '/Ultra-skin-resurfacing': '/assets/images/ljxyvgwytwgsk6zlvv3i-prd-1749-ultra-branded-social-assets-motion-03-1-v2-0000000.webp',
  '/oral-cancer-screening': '/assets/images/clearwater-dentist-clearwater-fl-front-of-dental-office-1920w.webp',
  '/solea-sleep': '/assets/images/clearwater-dentist-clearwater-fl-laser-dentistry-1920w.webp',
  '/tmj-treatment-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-dr-nadia-pokrovskaya-2-739bdcb2-1920w.webp'
};

const serviceTileCopy = {
  '/dental-implants-clearwater-fl': {
    headline: 'Missing teeth holding your smile back?',
    hoverTitle: 'Dental Implants',
    hoverDetail: 'At Clearwater Dentist, implant treatment replaces missing teeth with secure, natural-looking restorations — from single implants to full-arch solutions planned for long-term comfort and confidence.'
  },
  '/cosmetic-dentistry': {
    headline: 'Want a brighter, more confident smile?',
    hoverTitle: 'Cosmetic Dentistry',
    hoverDetail: 'Dr. Nadia combines artistry with modern cosmetic techniques — whitening, bonding, veneers, and smile design — to help you achieve a look that feels authentically yours.'
  },
  '/smile-makeover': {
    headline: 'Ready for a complete smile transformation?',
    hoverTitle: 'Smile Makeover',
    hoverDetail: 'A personalized smile makeover addresses color, shape, alignment, and proportion so your final result looks balanced, natural, and tailored to your facial features.'
  },
  '/porcelain-veneers-clearwater-fl': {
    headline: 'Looking for a flawless, natural-looking smile?',
    hoverTitle: 'Porcelain Veneers',
    hoverDetail: 'Custom porcelain veneers refine chips, gaps, stains, and uneven edges with conservative prep and an artistic eye for shade, symmetry, and natural texture.'
  },
  '/Invisalign-service-clearwater-fl': {
    headline: 'Seeking clear, discreet orthodontic care?',
    hoverTitle: 'Invisalign Clear Aligners',
    hoverDetail: 'Invisalign straightens teeth with removable clear aligners and digital planning — a comfortable alternative to braces for many teens and adults in Clearwater.'
  },
  '/teeth-whitening-clearwater-fl': {
    headline: 'Ready to brighten your smile?',
    hoverTitle: 'Professional Teeth Whitening',
    hoverDetail: 'In-office and take-home whitening options lift stains safely for a noticeably brighter smile — ideal before events or as part of a broader cosmetic plan.'
  },
  '/emergency-dentistry-clearwater-fl': {
    headline: 'Need urgent dental care right now?',
    hoverTitle: 'Emergency Dentistry',
    hoverDetail: 'Same-day emergency appointments for tooth pain, broken teeth, lost fillings, and swelling — so you get relief quickly from a calm, patient-focused team.'
  },
  '/gum-disease-treatment': {
    headline: 'Worried about bleeding or swollen gums?',
    hoverTitle: 'Gum Disease Treatment',
    hoverDetail: 'At Clearwater Dentist, periodontal care targets infection and inflammation with deep cleanings, laser-assisted treatment options, and ongoing maintenance to help protect your teeth and smile.'
  },
  '/tooth-extraction-clearwater-fl': {
    headline: 'Need a tooth removed with gentle care?',
    hoverTitle: 'Tooth Extraction',
    hoverDetail: 'Comfort-focused extractions for damaged, infected, or problematic teeth — with sedation options and clear guidance on healing and replacement choices.'
  },
  '/implant-supported-dentures-clearwater-fl': {
    headline: 'Tired of loose or shifting dentures?',
    hoverTitle: 'Implant-Supported Dentures',
    hoverDetail: 'Secure full-arch and partial solutions anchored by dental implants for improved stability, chewing confidence, and a more natural feel day to day.'
  },
  '/bone-grafting': {
    headline: 'Need more bone before implants or extractions?',
    hoverTitle: 'Bone Grafting',
    hoverDetail: 'Bone grafting rebuilds jaw support so implant placement and long-term restorative plans have a stronger, healthier foundation.'
  },
  '/general-dentistry': {
    headline: 'Due for a checkup or preventive visit?',
    hoverTitle: 'General Dentistry',
    hoverDetail: 'Comprehensive exams, cleanings, fillings, and preventive care for families in Clearwater — built around comfort and long-term oral health.'
  },
  '/sedation-dentistry-clearwater-fl': {
    headline: 'Anxious about your next dental visit?',
    hoverTitle: 'Sedation Dentistry',
    hoverDetail: 'Oral conscious sedation and a calm, patient-paced approach help anxious patients complete treatment with less stress and more confidence.'
  },
  '/laser-dentistry': {
    headline: 'Interested in needle-free, laser-assisted care?',
    hoverTitle: 'Laser Dentistry',
    hoverDetail: 'Advanced laser technology supports gentler gum treatment, soft-tissue procedures, and select restorative workflows with less discomfort.'
  },
  '/solea-sleep': {
    headline: 'Snoring or sleep-disordered breathing concerns?',
    hoverTitle: 'Solea Sleep',
    hoverDetail: 'Laser-assisted snoring treatment designed to help eligible patients breathe more easily at night without surgery or appliances in many cases.'
  },
  '/oral-cancer-screening': {
    headline: 'Due for an oral cancer screening?',
    hoverTitle: 'Oral Cancer Screening',
    hoverDetail: 'Thorough oral pathology exams and patient education to catch mouth, jaw, and soft-tissue concerns early.'
  },
  '/tmj-treatment-clearwater-fl': {
    headline: 'Jaw pain, clicking, or teeth grinding?',
    hoverTitle: 'TMJ Treatment',
    hoverDetail: 'Custom oral appliances and thoughtful planning for jaw pain, headaches, and TMJ-related symptoms.'
  }
};

const serviceCardIcon = '<svg class="cw-service-card__icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.5"></rect><path d="M8 12.25l2.75 2.75L16.5 9.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

const videoCarouselSlides = [
  {
    tab: 'Clearwater Dentist',
    title: 'Clearwater Dentist',
    desc: 'Why Join Clearwater Dentist?',
    src: '/assets/video/wzdvza5yrog6hu70zyqp-office-v.mp4',
    poster: '/assets/images/wzdvza5yrog6hu70zyqp-office-v2-0000000-1920w.webp'
  },
  {
    tab: 'Smile Makeover',
    title: 'Smile Makeover',
    desc: 'What is Smile Makeover?',
    src: '/assets/video/gru61qftnm5yovvxsqhn-smile-makeover-v.mp4',
    poster: '/assets/images/gru61qftnm5yovvxsqhn-smile-makeover-v2-0000000-1920w.webp'
  },
  {
    tab: 'Gum Disease',
    title: 'Gum Disease',
    desc: 'What is Gum Disease?',
    src: '/assets/video/gum-disease-v.mp4',
    poster: '/assets/images/general-v2-0000000-1920w.webp'
  },
  {
    tab: 'Veneers',
    title: 'Veneers',
    desc: 'How Much Are Veneers?',
    src: '/assets/video/veneers-dentist-v.mp4',
    poster: '/assets/images/veneers-dentist-v2-0000000-1920w.webp'
  },
  {
    tab: 'Sedation',
    title: 'Sedation',
    desc: 'How We Help Reduce Anxiety',
    src: '/assets/video/sedation-dentist-v.mp4',
    poster: '/assets/images/sedation-dentist-v2-0000000-1920w.webp'
  },
  {
    tab: 'Dogs',
    title: 'Dogs',
    desc: 'Scared Of Dentist?',
    src: '/assets/video/scared-of-the-dentist-v.mp4',
    poster: '/assets/images/scared-of-the-dentist-v2-0000000-1920w.webp'
  },
  {
    tab: 'Dental Crown',
    title: 'Dental Crown',
    desc: 'Do You Need a Dental Crown?',
    src: '/assets/video/do-you-need-a-dental-crown-v.mp4',
    poster: '/assets/images/do-you-need-a-dental-crown-v2-0000000-1920w.webp'
  }
];

const beforeAfterPairs = [
  {
    name: 'Restorative Smile Renewal',
    before: '/assets/images/4-5f84c482-50be5873-50c6f43b-5b31c7bf-b0ddaaaf-51f6a7c5-7a328735-70980e3c-1920w.webp',
    after: '/assets/images/5-ae8bb993-9f57610f-b7ca963b-c6b3aead-ea1c3f27-39b8498f-4e212feb-1920w.webp'
  },
  {
    name: 'Smile Makeover',
    before: '/assets/images/screenshot-2025-12-04-at-2-48-40-pm-de03c815-1bdd2457-9435e2a6-5cb22128-3e8f8488-3d10d599-5e.webp',
    after: '/assets/images/screenshot-2025-12-04-at-2-49-20-pm-b327eaf9-5dcb1b1e-1920w.webp'
  },
  {
    name: 'Full Smile Repair',
    before: '/assets/images/img-20250924-115520-1-1920w.webp',
    after: '/assets/images/img-20250924-115518-281-29-aba1cc49-592781a0-108b1bfd-1920w.webp'
  },
  {
    name: 'Cosmetic Smile Makeover',
    before: '/assets/images/screenshot-2025-12-04-at-3-37-49-pm-1920w.webp',
    after: '/assets/images/screenshot-2025-12-04-at-3-38-29-pm-1920w.webp'
  },
  {
    name: 'Complete Smile Transformation',
    before: '/assets/images/screenshot-2025-12-18-at-9-54-23-am-1920w.webp',
    after: '/assets/images/screenshot-2025-12-18-at-9-54-39-am-1920w.webp'
  }
];

function e(value) {
  return String(value || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function attr(value) { return e(value).replace(/`/g, '&#96;'); }
function routeKey(route) {
  return route === '/' ? 'home' : String(route || '').replace(/^\//, '').replace(/\//g, '--');
}
function cwEdit(route, id, label, type) {
  const key = routeKey(route) + '.' + id;
  let out = ' data-cw-edit="' + attr(key) + '" data-cw-edit-label="' + attr(label) + '"';
  if (type) out += ' data-cw-edit-type="' + attr(type) + '"';
  return out;
}
function cleanRoute(route) { return route.startsWith('/') ? route.slice(1) : route; }
function outDir(route) { return route === '/' ? DIST : path.join(DIST, cleanRoute(route)); }
async function copyDir(src, dest) {
  try { await fs.access(src); } catch { return; }
  await fs.mkdir(dest, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(s, d);
    else await fs.copyFile(s, d);
  }
}
function linkList(items) {
  return (items || []).map(item => '<li><a href="' + attr(item.href) + '">' + e(item.label) + '</a></li>').join('');
}
const internalLinkRoutes = new Set([
  ...allPages.map(page => page.route),
  ...(site.serviceAreas || []).map(area => `/${area.slug}`),
  ...(site.serviceLinks || []).map(item => item.href),
  ...(site.policyLinks || []).map(item => item.href),
  ...(site.quickLinks || []).map(item => item.href),
  '/blog',
  '/financing/carecredit'
]);
function richText(value) {
  const text = String(value || '');
  let html = '';
  const pattern = /\[([^\]]+)\]\((\/[^)\s]+)\)/g;
  let lastIndex = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    html += e(text.slice(lastIndex, match.index));
    const href = match[2];
    html += internalLinkRoutes.has(href)
      ? '<a href="' + attr(href) + '">' + e(match[1]) + '</a>'
      : e(match[0]);
    lastIndex = match.index + match[0].length;
  }
  html += e(text.slice(lastIndex));
  return html;
}
function policyLinksBlock(route) {
  if (route === '/financing') {
    return '<section class="content-section cw-inline-policy-links"><h2>Practice Policies</h2><p>Review our <a href="/financial-policy">Financial Policy</a> for insurance, payments, membership plans, and cancellation terms. You can also read our <a href="/privacy-policy">Privacy Policy</a> and <a href="/notice-of-privacy-practices">Notice of Privacy Practices</a>.</p></section>';
  }
  if (route === '/new-patient-faqs') {
    return '<section class="content-section cw-inline-policy-links"><h2>Policies & Privacy</h2><p>New patients should review our <a href="/financial-policy">Financial Policy</a> before their first visit. Information submitted through forms is handled according to our <a href="/privacy-policy">Privacy Policy</a>.</p></section>';
  }
  return '';
}
function pageByRoute(route) {
  return allPages.find(page => page.route === route) || {};
}
function isActive(item, currentRoute) {
  if (item.href === currentRoute) return true;
  return !!(item.children || []).some(child => isActive(child, currentRoute));
}
function serviceNavGroups() {
  const groups = (site.serviceNavGroups || []).map(group => ({
    label: group.label,
    href: group.href,
    children: (group.children || []).map(item => ({ label: item.label, href: item.href }))
  }));
  return groups.concat([{
    label: 'All Services',
    href: '/general-dentistry#service-directory',
    children: []
  }]);
}
function navListClass(options) {
  if (!options.nested) return 'site-nav';
  if (options.megaMenu && options.depth >= 2) return 'site-subnav site-subnav--flyout';
  if (options.megaMenu && options.depth === 1) return 'site-subnav cw-services-nav';
  return 'site-subnav';
}
function navTree() {
  return [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/meet-the-doctor', children: [
      { label: 'Meet Dr. Nadia', href: '/meet-the-doctor' },
      { label: 'Meet The Team', href: '/meet-the-team' },
      { label: 'Anti-Anxiety Practice', href: '/anti-anxiety-dentist-office' },
      { label: 'Dental Therapy Dogs', href: '/dental-therapy-dogs-clearwater-fl' }
    ] },
    { label: 'Services', href: '/general-dentistry', megaMenu: true, children: serviceNavGroups() },
    { label: 'Before & After', href: '/before-and-after' },
    { label: 'Financing', href: '/financing', children: [
      { label: 'Financing Options', href: '/financing' },
      { label: 'CareCredit', href: '/financing/carecredit' },
      { label: 'Sunbit', href: '/sunbit' },
      { label: 'Alphaeon', href: '/alphaeon' },
      { label: 'Financial Policy', href: '/financial-policy' }
    ] },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact-us' }
  ];
}
function renderNav(items, currentRoute, options) {
  const opts = options || {};
  const depth = opts.depth || 0;
  return '<ul class="' + navListClass(opts) + '">' + items.map(item => {
    const childItems = item.children && item.children.length ? item.children : [];
    const childOpts = {
      nested: true,
      depth: depth + 1,
      megaMenu: !!(opts.megaMenu || item.megaMenu)
    };
    const children = childItems.length
      ? '<button class="subnav-toggle" type="button" aria-expanded="false" aria-label="Expand ' + attr(item.label) + ' submenu"><span class="cw-subnav-toggle__icon" aria-hidden="true"></span></button>' + renderNav(childItems, currentRoute, childOpts)
      : '';
    const active = isActive(item, currentRoute) ? ' is-active' : '';
    const directoryClass = item.label === 'All Services' ? ' cw-services-nav__directory' : '';
    return '<li class="nav-item' + (children ? ' has-children' : '') + directoryClass + active + '"><a href="' + attr(item.href) + '">' + e(item.label) + '</a>' + children + '</li>';
  }).join('') + '</ul>';
}
const phoneIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M6.6 10.8c1.5 2.9 3.7 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.5.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.3 21 3 13.7 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.5.1.3 0 .7-.2 1L6.6 10.8z"/></svg>';
function headerSocial() {
  return (site.social || []).map(s => '<a class="cw-site-header__social-link" href="' + attr(s.href) + '" target="_blank" rel="noopener noreferrer" aria-label="' + attr(s.label) + '"><span class="social-glyph cw-header-social-icon" aria-hidden="true">' + socialIcon(s.label) + '</span></a>').join('');
}
function headerCtaStack() {
  return '<div class="header-actions cw-site-header__actions"><div class="cw-site-header__cta-stack"><div class="cw-site-header__ctas"><a class="cw-site-header__btn--book" href="' + APPOINTMENT_PATH + '">Request Visit</a><a class="cw-site-header__call" href="tel:' + attr(site.phoneTel) + '" aria-label="Call ' + attr(site.phoneDisplay) + '"><span class="cw-site-header__call-icon">' + phoneIcon + '</span><span class="cw-site-header__call-text"><span class="cw-site-header__call-label">Call Now</span><span class="cw-site-header__call-number">' + e(site.phoneDisplay) + '</span></span></a></div></div></div>';
}
function header(page) {
  const logo = site.assets.logo || site.assets.logoWhite || '';
  return '<header class="site-header" data-site-header><div class="header-inner"><div class="brand-wrap"><a class="brand" href="/" aria-label="Clearwater Dentist home">' + (logo ? '<img src="' + attr(logo) + '" alt="Clearwater Dentist logo" width="58" height="58">' : '') + '<span class="brand-text"><strong>' + e(site.name) + '</strong><small>' + e(site.doctor) + '</small></span></a><div class="cw-site-header__social cw-brand-social" aria-label="Social media">' + headerSocial() + '</div></div><nav id="primary-menu" class="primary-menu" aria-label="Primary navigation">' + renderNav(navTree(), page.route, { depth: 0 }) + '</nav><div class="header-mobile-end">' + headerCtaStack() + '<button class="menu-button" type="button" data-menu-toggle aria-controls="primary-menu" aria-expanded="false"><span></span><span></span><span></span><b>Menu</b></button></div></div></header>';
}
function socialIcon(label) {
  const codes = { Facebook: '&#xea90;', Instagram: '&#xea92;', YouTube: '&#xea9d;', Pinterest: '&#xf0d2;', TikTok: '&#xe813;' };
  return codes[label] || '•';
}
function footerOfficeCompact() {
  const addr = site.address || {};
  const hours = (site.hours || []).map(h => '<span><strong>' + e(h.days) + '</strong> ' + e(h.time) + '</span>').join('<span class="footer-office__sep" aria-hidden="true"> · </span>');
  return '<div class="footer-office"><p class="footer-office__label">Office</p><div class="footer-office__details"><p class="footer-office__address">' + e(addr.street) + ', ' + e(addr.city) + ', ' + e(addr.state) + ' ' + e(addr.zip) + '</p><p class="footer-office__hours">' + hours + '</p><p class="footer-office__contact"><a href="tel:' + attr(site.phoneTel) + '">' + e(site.phoneDisplay) + '</a><span class="footer-office__sep" aria-hidden="true"> · </span><a href="mailto:' + attr(site.email) + '">' + e(site.email) + '</a></p></div></div>';
}
function footer() {
  const logo = site.assets.logoWhite || site.assets.logo || '';
  const social = (site.social || []).map(s => '<a class="social-link" href="' + attr(s.href) + '" target="_blank" rel="noopener" aria-label="' + attr(s.label) + '"><span class="social-glyph" aria-hidden="true">' + socialIcon(s.label) + '</span></a>').join('');
  return '<footer class="site-footer"><div class="footer-grid"><section class="footer-brand">' + (logo ? '<img src="' + attr(logo) + '" alt="Clearwater Dentist logo" width="108" height="108" decoding="async">' : '') + '<h2>' + e(site.name) + '</h2><p>' + e(site.tagline) + '</p><div class="social-row">' + social + '</div></section><section class="footer-services"><h2>Services</h2><ul class="footer-services__list">' + linkList(site.serviceLinks || []) + '</ul></section><section class="footer-quick-links"><h2>Quick Links</h2><ul class="footer-quick-links__list">' + linkList(site.quickLinks || []) + '</ul></section>' + footerOfficeCompact() + '</div><div class="footer-bottom"><ul class="footer-policies">' + linkList(site.policyLinks || []) + '</ul><p class="copyright">&copy; 2026 Clearwater Dentist. All Rights Reserved.</p></div></footer>';
}
function imageTag(image, cls, eager) {
  if (!image || !image.src) return '';
  return '<img class="' + attr(cls || '') + '" src="' + attr(image.src) + '" alt="' + attr(image.alt || 'Clearwater Dentist') + '" loading="' + (eager ? 'eager' : 'lazy') + '" decoding="async">';
}
function uniqueImages(images) {
  const seen = new Set();
  return images.filter(image => {
    if (!image || !image.src || seen.has(image.src)) return false;
    seen.add(image.src);
    return true;
  });
}
function heroImages(page) {
  const images = uniqueImages([
    page.heroImage,
    ...(page.images || []),
    serviceImages[page.route] ? { src: serviceImages[page.route], alt: page.h1 } : null,
    { src: site.assets.office, alt: 'Clearwater Dentist office' },
    { src: site.assets.doctor, alt: site.doctor },
    { src: site.assets.heroPoster, alt: 'Clearwater Dentist patient visit' }
  ]).slice(0, 4);
  return images.length >= 2 ? images : uniqueImages([...images, { src: site.assets.office, alt: 'Clearwater Dentist office' }, { src: site.assets.doctor, alt: site.doctor }]).slice(0, 2);
}
const heroPanelSlots = [
  ['left', 0],
  ['bottom', 1],
  ['top', 2],
  ['right', 3]
];
function heroPanelImages(page) {
  const pool = uniqueImages([
    ...heroImages(page),
    { src: site.assets.office, alt: 'Clearwater Dentist office' },
    { src: site.assets.doctor, alt: site.doctor },
    { src: site.assets.heroPoster, alt: 'Clearwater Dentist patient visit' }
  ]);
  return heroPanelSlots.map(([, index]) => pool[index % pool.length]);
}
function heroPanels(page) {
  const images = heroPanelImages(page);
  return '<div class="page-hero-bg page-hero-bg--grid" aria-hidden="true">' + heroPanelSlots.map(([position, index]) => {
    const image = images[index];
    return '<div class="page-hero-panel page-hero-panel--' + position + '" data-hero-panel>' + imageTag(image, '', index === 0) + '</div>';
  }).join('') + '</div>';
}
function hero(page, kicker) {
  const rk = page.route;
  const eyebrow = kicker || page.type.replace(/([A-Z])/g, ' $1');
  return '<section class="page-hero page-hero--gallery">' + heroPanels(page) + '<div class="page-hero-overlay" aria-hidden="true"></div><div class="page-hero-inner"><div class="page-hero-copy"><p class="eyebrow"' + cwEdit(rk, 'hero-eyebrow', 'Hero eyebrow') + '>' + e(eyebrow) + '</p><h1' + cwEdit(rk, 'hero-h1', 'Page headline') + '>' + e(page.h1) + '</h1>' + (page.description ? '<p class="lede"' + cwEdit(rk, 'hero-lede', 'Hero intro') + '>' + e(page.description) + '</p>' : '') + '<div class="hero-actions"><a class="btn primary"' + cwEdit(rk, 'hero-cta-book', 'Book button', 'button') + ' href="' + APPOINTMENT_PATH + '">Request Appointment</a><a class="btn secondary"' + cwEdit(rk, 'hero-cta-call', 'Call button', 'button') + ' href="tel:' + attr(site.phoneTel) + '">Call ' + e(site.phoneDisplay) + '</a></div></div></div></section>';
}
const THERAPY_DOG_NAMES = ['Barbie', 'Baby', 'Chucha', 'Pusha'];
const MAP_EMBED_ROUTES = new Set(['/', '/contact-us']);

function isMapEmbed(item) {
  return String(item?.src || '').includes('google.com/maps');
}
function pageEmbeds(page) {
  const embeds = page.embeds || [];
  if (MAP_EMBED_ROUTES.has(page.route) || page.type === 'contact') return embeds;
  return embeds.filter(item => !isMapEmbed(item));
}
function usesInlineMedia(page) {
  return page.type === 'doctor' || page.type === 'team' || page.type === 'service';
}
function contentImages(page) {
  const images = page.images || [];
  let rest = images.slice(1).filter(img => !isReviewImage(img));
  if (page.type === 'team') {
    const first = images[0];
    if (first && !rest.some(img => img.src === first.src)) rest.unshift(first);
  }
  if (page.route === '/dental-therapy-dogs-clearwater-fl') {
    const barbie = images.find(img => imageMatchesName(img, 'Barbie'));
    if (barbie && !rest.some(img => img.src === barbie.src)) rest.unshift(barbie);
  }
  if (page.route === '/anti-anxiety-dentist-office') {
    const office = images[0];
    if (office && !rest.some(img => img.src === office.src)) rest.unshift(office);
    rest = rest.filter(img => !isReviewImage(img));
  }
  return rest;
}
function isReviewImage(image) {
  const alt = String(image.alt || '').toLowerCase();
  return alt.includes('rating') || alt.includes('testimonial') || alt.includes('review') || alt.includes('five-star');
}
function roleFromAlt(alt) {
  const text = String(alt || '').trim();
  const dash = text.indexOf(' - ');
  if (dash !== -1) return text.slice(dash + 3).trim().toLowerCase();
  const parts = text.split(/\s+/);
  return parts.length > 1 ? parts.slice(1).join(' ').toLowerCase() : text.toLowerCase();
}
function personNameFromAlt(alt) {
  const text = String(alt || '').trim();
  const dash = text.indexOf(' - ');
  return dash !== -1 ? text.slice(0, dash).trim() : text.split(/\s+/)[0];
}
function imageNameKey(image) {
  const alt = String(image.alt || '');
  const dogMatch = alt.match(/therapy dog\s*-\s*(\w+)/i);
  if (dogMatch) return dogMatch[1].toLowerCase();
  if (/^barbie/i.test(alt.trim())) return 'barbie';
  const file = String(image.src || '').toLowerCase();
  const dogFile = file.match(/dog-([a-z]+)/);
  if (dogFile) return dogFile[1];
  return alt.split(' - ')[0].split(',')[0].trim().toLowerCase();
}
function imageMatchesName(image, name) {
  const key = imageNameKey(image);
  const target = String(name || '').trim().toLowerCase();
  return key === target || key.startsWith(target);
}
function sectionText(section) {
  return [section.heading || '', ...(section.body || []), ...(section.items || [])].join(' ').toLowerCase();
}
function keywordOverlapScore(image, section) {
  const alt = String(image.alt || '').toLowerCase();
  const heading = (section.heading || '').toLowerCase();
  const text = sectionText(section);
  const stop = new Set(['the', 'and', 'with', 'clearwater', 'dentist', 'dental', 'florida', 'patient', 'care', 'office']);
  const words = alt.split(/[^a-z0-9]+/).filter(word => word.length > 3 && !stop.has(word));
  let score = 0;
  for (const word of words) {
    if (heading.includes(word)) score += 18;
    if (text.includes(word)) score += 10;
  }
  return score;
}
function buildServiceSectionImageMap(page, sections, images) {
  const map = new Map();
  const pool = [...images];
  const eligible = sections
    .map((section, index) => ({ section, index }))
    .filter(({ section }) => {
      const heading = (section.heading || '').toLowerCase();
      return heading && heading !== 'overview';
    });

  for (const { section, index } of eligible) {
    const best = pool
      .map(img => ({ img, score: matchScoreForSection(img, section, page) }))
      .filter(entry => entry.score > 0)
      .sort((a, b) => b.score - a.score)[0];
    if (best) {
      map.set(index, [best.img]);
      pool.splice(pool.findIndex(img => img.src === best.img.src), 1);
    }
  }

  for (const { index } of eligible) {
    if (!map.has(index) && pool.length) map.set(index, [pool.shift()]);
  }

  if (pool.length && eligible.length) {
    const lastIndex = eligible[eligible.length - 1].index;
    map.set(lastIndex, [...(map.get(lastIndex) || []), ...pool]);
  }

  return map;
}
function matchTeamScore(image, section) {
  const role = roleFromAlt(image.alt);
  const heading = (section.heading || '').toLowerCase();
  const alt = String(image.alt || '').toLowerCase();
  if (role === heading) return 100 + (alt.includes(' - ') ? 1 : 0);
  if (role.includes(heading) && heading.length > 4) return 80;
  if (heading.includes(role) && role.length > 4) return 70;
  if (alt.includes(heading)) return 60;
  return 0;
}
function matchScoreForSection(image, section, page) {
  const alt = String(image.alt || '').toLowerCase();
  const heading = (section.heading || '').toLowerCase();
  const text = sectionText(section);
  if (page.type === 'team') return matchTeamScore(image, section);
  if (isReviewImage(image)) return 0;
  if (heading.includes('barbie') && alt.includes('barbie')) return 100;
  if ((heading.includes('space') || heading.includes('breathe')) && (alt.includes('office') || alt.includes('bright') || alt.includes('open'))) return 90;
  if (heading.includes('comfort') && alt.includes('sedation')) return 85;
  if (text.includes('front desk') && alt.includes('staff')) return 80;
  if (alt.includes('therapy dog') && (text.includes('therapy') || text.includes('dog') || heading.includes('dog'))) return 70;
  if (alt.includes('dog') && heading.includes('journey')) return 65;
  if (alt.includes('nadia') && (text.includes('nadia') || page.type === 'doctor')) return 80;
  if (page.type === 'service') {
    const overlap = keywordOverlapScore(image, section);
    if (overlap > 0) return overlap;
  }
  return 0;
}
function pickSectionImages(section, page, ctx, sectionIndex) {
  const heading = (section.heading || '').toLowerCase();
  if (heading === 'overview') return [];
  if (ctx.sectionImageMap && sectionIndex !== undefined) {
    const assigned = ctx.sectionImageMap.get(sectionIndex) || [];
    const picked = assigned.filter(img => !ctx.usedSrcs.has(img.src));
    picked.forEach(img => ctx.usedSrcs.add(img.src));
    return picked;
  }
  if (page.route === '/dental-therapy-dogs-clearwater-fl' && heading.includes('meet our therapy dogs')) return [];
  if (page.type === 'doctor' && heading.includes('dr. nadia')) {
    const imgs = ctx.images.filter(img => !ctx.usedSrcs.has(img.src));
    imgs.forEach(img => ctx.usedSrcs.add(img.src));
    return imgs;
  }
  const matches = ctx.images
    .filter(img => !ctx.usedSrcs.has(img.src))
    .map(img => ({ img, score: matchScoreForSection(img, section, page) }))
    .filter(x => x.score > 0)
    .sort((a, b) => b.score - a.score);
  const limit = page.route === '/anti-anxiety-dentist-office' || page.type === 'team' || heading.includes('barbie') ? 1 : 4;
  const picked = matches.slice(0, limit).map(x => x.img);
  picked.forEach(img => ctx.usedSrcs.add(img.src));
  return picked;
}
function mediaInsertAfterParagraph(page, section) {
  if (page.type === 'doctor' && (section.heading || '').toLowerCase().includes('dr. nadia')) return 3;
  return 0;
}
function renderSectionMedia(images) {
  if (!images.length) return '';
  return inlineGalleryHtml(images);
}
function therapyDogProfiles(ctx) {
  return THERAPY_DOG_NAMES.map(name => {
    const image = ctx.images.find(img => !ctx.usedSrcs.has(img.src) && imageMatchesName(img, name));
    if (!image) return null;
    ctx.usedSrcs.add(image.src);
    return { name, image };
  }).filter(Boolean);
}
function inlineProfileGridHtml(profiles) {
  if (!profiles.length) return '';
  return '<div class="cw-profile-grid">' + profiles.map(profile => '<figure class="cw-profile-card">' + imageTag(profile.image, '', false) + '<figcaption>' + e(profile.name) + '</figcaption></figure>').join('') + '</div>';
}
function inlineSingleFigureHtml(image) {
  return '<figure class="cw-inline-figure">' + imageTag(image, 'cw-inline-figure-img', false) + '</figure>';
}
function inlineGalleryHtml(images) {
  if (!images.length) return '';
  if (images.length === 1) return inlineSingleFigureHtml(images[0]);
  return '<div class="cw-inline-gallery">' + images.map(img => '<figure>' + imageTag(img, 'cw-inline-gallery-img', false) + '</figure>').join('') + '</div>';
}
function teamProfileHtml(image) {
  const role = roleFromAlt(image.alt);
  const roleLabel = role.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  return '<figure class="cw-team-profile">' + imageTag(image, 'cw-team-profile-img', false) + '<figcaption><strong>' + e(personNameFromAlt(image.alt)) + '</strong><span>' + e(roleLabel) + '</span></figcaption></figure>';
}
function inlineVideosHtml(videos) {
  return videos.map(video => '<div class="cw-inline-media">' + videoMarkup(video, 'content-video') + '</div>').join('');
}
function inlineSectionHtml(section, page, ctx, isLast, sectionIndex) {
  const heading = section.heading || '';
  const headingKey = heading.toLowerCase();
  const isMeetDogs = page.route === '/dental-therapy-dogs-clearwater-fl' && headingKey.includes('meet our therapy dogs');
  let leadMedia = '';
  let bodyHtml = '';
  let sectionImages = [];

  if (page.type === 'team' && headingKey !== 'overview') {
    const teamImage = pickSectionImages(section, page, ctx, sectionIndex)[0];
    if (teamImage) leadMedia += teamProfileHtml(teamImage);
  } else if (!isMeetDogs) {
    sectionImages = pickSectionImages(section, page, ctx, sectionIndex);
  }

  const insertAfter = mediaInsertAfterParagraph(page, section);
  let mediaInserted = false;
  const body = section.body || [];
  for (let i = 0; i < body.length; i++) {
    const name = String(body[i] || '').trim();
    if (THERAPY_DOG_NAMES.some(dog => dog.toLowerCase() === name.toLowerCase())) continue;
    bodyHtml += '<p' + cwEdit(page.route, 'section-' + sectionIndex + '-p-' + i, (heading || 'Section') + ' — paragraph ' + (i + 1)) + '>' + richText(body[i]) + '</p>';
    if (isMeetDogs && i === 0) {
      const profiles = therapyDogProfiles(ctx);
      if (profiles.length) bodyHtml += inlineProfileGridHtml(profiles);
      const extraDogs = ctx.images.filter(img => !ctx.usedSrcs.has(img.src) && /therapy dog|with therapy dog|with dog/i.test(img.alt || ''));
      if (extraDogs.length) {
        bodyHtml += inlineGalleryHtml(extraDogs);
        extraDogs.forEach(img => ctx.usedSrcs.add(img.src));
      }
      if (ctx.videos.length) bodyHtml += inlineVideosHtml(ctx.videos.splice(0, 1));
    } else if (!mediaInserted && sectionImages.length && i === insertAfter) {
      bodyHtml += renderSectionMedia(sectionImages);
      mediaInserted = true;
    }
  }

  if (!mediaInserted && sectionImages.length) {
    bodyHtml = renderSectionMedia(sectionImages) + bodyHtml;
  }

  if (isLast) {
    const remaining = ctx.images.filter(img => !ctx.usedSrcs.has(img.src));
    if (remaining.length) {
      bodyHtml += renderSectionMedia(remaining);
      remaining.forEach(img => ctx.usedSrcs.add(img.src));
    }
    if (ctx.videos.length) bodyHtml += inlineVideosHtml(ctx.videos.splice(0));
    if (ctx.embeds.length) {
      bodyHtml += ctx.embeds.splice(0).map(x => '<iframe class="content-embed" src="' + attr(x.src) + '" title="' + attr(x.label || 'Video') + '" loading="lazy" allowfullscreen></iframe>').join('');
    }
  }

  const sectionClass = page.type === 'service'
    ? 'content-section cw-gallery-section cw-reveal'
    : 'content-section';
  const revealAttrs = page.type === 'service'
    ? cwRevealAttr(GALLERY_REVEAL_DIRS[sectionIndex % GALLERY_REVEAL_DIRS.length], sectionIndex * 90)
    : '';
  const sid = 'section-' + sectionIndex;
  return '<section class="' + sectionClass + '"' + revealAttrs + '><h2' + cwEdit(page.route, sid + '-h2', heading || 'Section heading') + '>' + e(heading) + '</h2>' + leadMedia + bodyHtml + (section.items && section.items.length ? '<ul class="check-list">' + section.items.map(i => '<li>' + richText(i) + '</li>').join('') + '</ul>' : '') + sectionFigureHtml(section.figure) + '</section>';
}
function renderInlineSections(page) {
  const sections = page.type === 'service' ? servicePageSections(page) : (page.sections || []);
  const images = contentImages(page);
  const ctx = {
    usedSrcs: new Set(),
    images,
    videos: [...(page.videos || [])],
    embeds: [...pageEmbeds(page)],
    sectionImageMap: page.type === 'service' ? buildServiceSectionImageMap(page, sections, images) : null
  };
  return sections.map((section, index) => inlineSectionHtml(section, page, ctx, index === sections.length - 1, index)).join('');
}
function sectionFigureHtml(figure) {
  if (!figure?.src) return '';
  return '<figure class="cw-inline-figure cw-section-figure">' + imageTag(figure, 'cw-inline-figure-img', false) + '</figure>';
}
function sectionHtml(section, page, sectionIndex) {
  const sid = 'section-' + sectionIndex;
  const body = (section.body || []).map((p, pi) => '<p' + cwEdit(page.route, sid + '-p-' + pi, (section.heading || 'Section') + ' — paragraph ' + (pi + 1)) + '>' + richText(p) + '</p>').join('');
  return '<section class="content-section"><h2' + cwEdit(page.route, sid + '-h2', section.heading || 'Section heading') + '>' + e(section.heading) + '</h2>' + body + (section.items && section.items.length ? '<ul class="check-list">' + section.items.map(i => '<li>' + richText(i) + '</li>').join('') + '</ul>' : '') + sectionFigureHtml(section.figure) + '</section>';
}
function mediaHtml(page) {
  const vids = (page.videos || []).map(v => videoMarkup(v, 'content-video')).join('');
  const embeds = pageEmbeds(page).map(x => '<iframe class="content-embed" src="' + attr(x.src) + '" title="' + attr(x.label || 'Video') + '" loading="lazy" allowfullscreen></iframe>').join('');
  return vids || embeds ? '<section class="media-section"><h2>Featured Media</h2><div class="media-grid">' + vids + embeds + '</div></section>' : '';
}
function videoMarkup(video, cls) {
  return '<div class="video-frame"><video class="' + attr(cls || '') + '" controls preload="metadata" playsinline poster="' + attr(video.poster || '') + '"><source src="' + attr(video.src) + '" type="video/mp4"></video></div>';
}
function galleryHtml(images, limit) {
  const imgs = (images || []).slice(0, limit || 12);
  if (!imgs.length) return '';
  return '<section class="image-gallery"><h2>Photo Gallery</h2><div class="gallery-grid">' + imgs.map(img => '<figure>' + imageTag(img, '', false) + '<figcaption>' + e(img.alt || 'Clearwater Dentist') + '</figcaption></figure>').join('') + '</div></section>';
}
function relatedServices(currentRoute) {
  const links = (site.serviceLinks || []).filter(item => item.href !== currentRoute).slice(0, 10);
  return '<aside class="related-card"><h2>Helpful Services</h2><ul>' + linkList(links) + '</ul><a class="btn secondary full" href="/general-dentistry#service-directory">All Services</a><a class="btn primary full" href="' + APPOINTMENT_PATH + '">Schedule Consultation</a></aside>';
}
const COMPARE_REVEAL_DIRS = ['left', 'bottom', 'right-soft'];
const GALLERY_REVEAL_DIRS = ['left', 'right-soft', 'bottom', 'left-soft', 'right'];
const galleryTreatmentHighlights = [
  {
    title: 'Dental Implants',
    desc: 'Replace missing teeth with secure, natural-looking implant restorations in Clearwater, FL.',
    href: '/dental-implants-clearwater-fl',
    image: '/assets/images/clearwater-dentist-clearwater-fl-woman-dental-implants-6627bd42-07d3fb59-1920w.webp'
  },
  {
    title: 'Smile Makeover',
    desc: 'Comprehensive smile design combining cosmetic and restorative treatments.',
    href: '/smile-makeover',
    image: '/assets/images/clearwater-dentist-clearwater-fl-smile-makeover-ab960fc4-256c5e17-1920w.webp'
  },
  {
    title: 'Porcelain Veneers',
    desc: 'Refine shape, shade, and symmetry with custom veneers crafted for your features.',
    href: '/porcelain-veneers-clearwater-fl',
    image: '/assets/images/clearwater-dentist-clearwater-fl-veneer-1920w.webp'
  },
  {
    title: 'Cosmetic Dentistry',
    desc: 'Whitening, bonding, and aesthetic treatments for a confident Clearwater smile.',
    href: '/cosmetic-dentistry',
    image: '/assets/images/clearwater-dentist-clearwater-fl-smile-lady-2880w.webp'
  }
];
const SERVICE_REVEAL_DIRS = ['left', 'right', 'bottom', 'left-soft', 'right-soft', 'bottom', 'left', 'right'];
function cwRevealAttr(direction, stagger) {
  let attrs = ' data-cw-reveal="' + direction + '"';
  if (stagger) attrs += ' data-cw-reveal-stagger="' + stagger + '"';
  return attrs;
}
function compareCard(pair, index) {
  const dir = COMPARE_REVEAL_DIRS[index] || 'left';
  const caseId = pair.id || ('case-' + index);
  return '<article class="compare-card cw-reveal" data-cw-compare-id="' + attr(caseId) + '" data-cw-compare-index="' + index + '"' + cwRevealAttr(dir, index * 100) + '><div class="compare-slider" style="--position:50%"><img class="compare-img compare-before"' + cwEdit('/', 'compare-' + index + '-before', 'Before image ' + (index + 1), 'img') + ' src="' + attr(pair.before) + '" alt="' + attr(pair.name + ' before') + '" loading="' + (index === 0 ? 'eager' : 'lazy') + '"><div class="compare-after-wrap"><img class="compare-img compare-after"' + cwEdit('/', 'compare-' + index + '-after', 'After image ' + (index + 1), 'img') + ' src="' + attr(pair.after) + '" alt="' + attr(pair.name + ' after') + '" loading="' + (index === 0 ? 'eager' : 'lazy') + '"></div><input class="compare-range" type="range" min="0" max="100" value="50" aria-label="Reveal before and after image"><span class="compare-handle" aria-hidden="true"></span><span class="compare-label compare-label-before">Before</span><span class="compare-label compare-label-after">After</span></div><h3' + cwEdit('/', 'compare-' + index + '-title', 'Case title ' + (index + 1)) + '>' + e(pair.name) + '</h3></article>';
}
function beforeAfterSection(limit) {
  const parallaxBg = site.assets.beforeAfterParallax || '/assets/images/patient-looking-at-mirror-at-teeth-1920w.webp';
  return '<section class="before-after-band cw-before-after-band"><div class="cw-before-after-band__media" data-before-after-parallax' + cwEdit('/', 'before-after-bg', 'Before & after background', 'background') + ' style="background-image:url(' + attr(parallaxBg) + ')"></div><div class="cw-before-after-band__scrim" aria-hidden="true"></div><div class="cw-before-after-band__inner"><div class="section-head"><p class="eyebrow"' + cwEdit('/', 'before-after-eyebrow', 'Before & after eyebrow') + '>Before & After</p><h2' + cwEdit('/', 'before-after-headline', 'Before & after headline') + '>Drag to compare real smile transformations.</h2><p' + cwEdit('/', 'before-after-intro', 'Before & after intro') + '>These are real patients treated at our Clearwater office. Drag the slider on each image to compare results from implants, smile makeovers, and full-mouth restoration cases planned for natural function and appearance.</p><a href="/before-and-after">View full gallery</a></div><div class="compare-grid" data-cw-compare-grid>' + beforeAfterPairs.slice(0, limit || 3).map(compareCard).join('') + '</div></div></section>';
}
function homeLeadForm() {
  return '<section id="homeLeadForm" class="home-lead-panel"><div class="home-lead-panel__enter"><div><p class="eyebrow">New Patients</p><h2>Request an appointment without leaving the page.</h2><p>Tell us how to reach you and what brought you in. Our team follows up during office hours with scheduling options, new-patient details, and answers to common first-visit questions.</p><div class="mini-actions"><a href="/contact-us">Contact page</a><a href="/financing">Financing options</a></div></div><form class="mini-form" action="/contact-us" method="get"><label>Name<input name="name" autocomplete="name" required></label><label>Phone<input name="phone" type="tel" autocomplete="tel" required></label><label>What do you need?<select name="reason"><option>New patient visit</option><option>Emergency appointment</option><option>Cosmetic consultation</option><option>Dental implants</option></select></label><button class="btn primary" type="submit">Start Request</button></form></div></section>';
}
function serviceCardPeek(detail) {
  const text = String(detail || '').trim();
  if (!text) return '';
  const peek = text.length > 118 ? text.slice(0, 115).trim() + '...' : text;
  return '<span class="cw-service-card__peek">' + e(peek) + '</span>';
}
function serviceCard(service, index) {
  const image = serviceImages[service.href] || site.assets.office;
  const copy = serviceTileCopy[service.href] || {
    headline: 'Looking for ' + service.label.toLowerCase() + ' in Clearwater?',
    hoverTitle: service.label,
    hoverDetail: 'Learn how Clearwater Dentist can help with personalized, patient-focused care tailored to your goals and comfort level.'
  };
  const dir = SERVICE_REVEAL_DIRS[index % SERVICE_REVEAL_DIRS.length] || 'left';
  const stagger = (index % 4) * 85;
  return '<a class="service-card cw-service-card cw-reveal"' + cwRevealAttr(dir, stagger) + ' href="' + attr(service.href) + '"><img class="cw-service-card__bg" src="' + attr(image) + '" alt="" loading="lazy" decoding="async"><span class="cw-service-card__overlay" aria-hidden="true"></span><span class="cw-service-card__panel cw-service-card__panel--front">' + serviceCardIcon + '<strong class="cw-service-card__headline">' + e(copy.headline) + '</strong>' + serviceCardPeek(copy.hoverDetail) + '</span><span class="cw-service-card__panel cw-service-card__panel--hover"><strong class="cw-service-card__title">' + e(copy.hoverTitle || service.label) + '</strong><span class="cw-service-card__detail">' + e(copy.hoverDetail) + '</span><span class="cw-service-card__cta-btn">Learn more</span></span></a>';
}
function servicesSection() {
  const services = (site.serviceLinks || []).slice(0, 8);
  const cards = services.map((service, index) => serviceCard(service, index)).join('');
  return '<section class="home-band cw-service-band"><div class="cw-service-band__inner"><div class="section-head"><p class="eyebrow">Our Dental Services</p><h2>Find the right care path for your smile.</h2><p>Whether you need a routine visit, cosmetic upgrade, or same-day emergency care, our team builds treatment around your comfort and long-term oral health. Explore our most requested services below, or browse the full directory for every treatment we offer.</p></div><div class="service-grid cw-service-mosaic">' + cards + '</div><p class="cw-service-band__more"><a href="/general-dentistry#service-directory">View the complete service directory</a></p></div></section>';
}
const carouselMuteBtn = '<button type="button" class="cw-slide-mute" aria-pressed="true" aria-label="Unmute video"><span class="cw-slide-mute__icon cw-slide-mute__off" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg></span><span class="cw-slide-mute__icon cw-slide-mute__on" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></span></button>';
const carouselFullscreenIcon = '<svg viewBox="0 0 36 36" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"></path><path d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"></path><path d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"></path><path d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"></path></svg>';
const carouselArrows = '<button type="button" class="cw-carousel-arrow cw-carousel-arrow--prev" data-carousel-prev aria-label="Previous videos"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button><button type="button" class="cw-carousel-arrow cw-carousel-arrow--next" data-carousel-next aria-label="Next videos"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>';
function carouselSlide(slide, idx) {
  return '<article class="cw-video-carousel__slide" data-carousel-slide data-slide-index="' + idx + '"><div class="cw-video-carousel__media"><video loop muted playsinline preload="none" poster="' + attr(slide.poster) + '" data-cw-lazy-src="' + attr(slide.src) + '"></video>' + carouselMuteBtn + '<button type="button" class="cw-fullscreen-btn" data-cw-modal-trigger data-cw-video-src="' + attr(slide.src) + '" data-cw-video-title="' + attr(slide.title) + '" aria-label="Watch ' + attr(slide.title) + ' in full screen">' + carouselFullscreenIcon + '</button></div><div class="cw-video-carousel__caption"><strong>' + e(slide.title) + '</strong><p>' + e(slide.desc) + '</p></div></article>';
}
function carouselTabs() {
  return '<div class="cw-carousel-tabs" role="tablist" aria-label="Choose a video to watch">' + videoCarouselSlides.map((slide, idx) => '<button type="button" class="cw-carousel-tab' + (idx === 0 ? ' is-active' : '') + '" data-cw-tab="' + idx + '" role="tab" aria-selected="' + (idx === 0 ? 'true' : 'false') + '"><span class="cw-carousel-tab__dot" aria-hidden="true"></span><span class="cw-carousel-tab__label">' + e(slide.tab) + '</span></button>').join('') + '</div>';
}
function videoCarouselModal() {
  return '<div class="cw-video-modal" id="cw-video-modal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Video player"><div class="cw-video-modal__backdrop" data-cw-modal-close></div><div class="cw-video-modal__dialog" role="document"><button type="button" class="cw-video-modal__close" data-cw-modal-close aria-label="Close video"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button><div class="cw-video-modal__frame"><video class="cw-video-modal__video" controls playsinline preload="auto"></video></div><h3 class="cw-video-modal__title"></h3></div></div>';
}
function videoCarouselSection() {
  const slides = videoCarouselSlides.map(carouselSlide).join('');
  return '<section class="cw-home-video-carousel" aria-label="Office video library"><div class="cw-video-carousel-wrap"><div class="cw-video-carousel__intro section-head"><p class="eyebrow">Patient Education</p><h2>Short videos that answer common questions.</h2><p>Dr. Nadia and the team recorded these explainers on implants, cosmetic care, anxiety support, and everyday treatment planning. Watch in the carousel below or open any clip full-screen when you are ready.</p></div><div class="cw-video-carousel" data-video-carousel><div class="cw-video-carousel__viewport"><div class="cw-video-carousel__film" data-carousel-film>' + slides + '</div></div>' + carouselArrows + carouselTabs() + '</div></div></section>' + videoCarouselModal();
}
function doctorMeetCopy(className) {
  const panelClass = className === 'doctor-band__copy' ? 'doctor-band__copy' : 'cw-why-band__panel cw-why-band__doctor-copy';
  return '<div class="' + attr(panelClass) + ' cw-reveal"' + cwRevealAttr('bottom', 120) + '><p class="eyebrow">Meet The Doctor</p><h3>' + e(site.doctor) + '</h3><p>' + e(site.tagline) + '</p><p>Dr. Nadia focuses on functional, minimally invasive, aesthetic dentistry delivered with patience and an artistic eye.</p><a class="btn secondary" href="/meet-the-doctor">Meet Dr. Nadia</a></div>';
}
function whyChecklist(items) {
  const rows = items.map(item => '<li><span class="cw-why-band__check" aria-hidden="true"><svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2.5 8.2 6.2 11.8 13.5 4.5"></polyline></svg></span><span class="cw-why-band__check-copy"><strong>' + e(item[0]) + '</strong><span>' + e(item[1]) + '</span></span></li>').join('');
  return '<div class="cw-why-band__panel cw-why-band__checks cw-reveal"' + cwRevealAttr('right', 200) + '><ul class="cw-why-band__checklist">' + rows + '</ul></div>';
}
function doctorSection() {
  return '<section class="doctor-band"><div class="doctor-image"><img src="' + attr(site.assets.doctor || site.assets.office) + '" alt="' + attr(site.doctor) + '" loading="lazy"></div>' + doctorMeetCopy('doctor-band__copy') + '</section>';
}
function whySection() {
  const items = [
    ['Same-day emergency help', 'Urgent dental pain and broken teeth are routed to care quickly.'],
    ['Anti-anxiety visits', 'Sedation options, blankets, pillows, and therapy dog support help patients feel safe.'],
    ['Cosmetic and restorative planning', 'Treatment plans are built around health, function, and a natural-looking final smile.'],
    ['Flexible payment paths', 'Financing and benefit plan options help patients make treatment realistic.']
  ];
  const whyBg = site.assets.whyBandParallax || '/assets/images/clearwater-dentist-clearwater-fl-front-staff-1920w.webp';
  const doctorCutout = site.assets.doctorCutout || site.assets.doctor || site.assets.office;
  const doctorCutoutFull = doctorCutout.replace(/-640w(?=\.webp$)/i, '');
  const doctorImgAttrs = doctorCutout !== doctorCutoutFull
    ? ' src="' + attr(doctorCutout) + '" srcset="' + attr(doctorCutout) + ' 640w, ' + attr(doctorCutoutFull) + ' 1081w" sizes="(min-width: 900px) 320px, 72vw" width="640" height="650"'
    : ' src="' + attr(doctorCutout) + '"';
  return '<section class="why-band cw-why-band"><div class="cw-why-band__media" data-why-parallax style="background-image:url(' + attr(whyBg) + ')"></div><div class="cw-why-band__scrim" aria-hidden="true"></div><div class="cw-why-band__inner"><div class="cw-why-band__figure"><img class="cw-why-band__doctor cw-reveal"' + cwRevealAttr('left', 0) + doctorImgAttrs + ' alt="' + attr(site.doctor) + '" loading="lazy" decoding="async"></div><div class="cw-why-band__content"><div class="cw-why-band__panel cw-why-band__head"><h2>Why Come to Clearwater Dentist?</h2><p class="cw-why-band__lede cw-slide-reveal">Modern care with a calmer chairside experience — from your first hello through your final result.</p><p class="cw-why-band__intro">Patients choose our office for thoughtful planning, advanced technology, and a culture built around reducing dental anxiety. We explain options clearly, coordinate care in-house when possible, and help you move forward with confidence.</p></div><div class="cw-why-band__panel-row">' + doctorMeetCopy() + whyChecklist(items) + '</div></div></div></section>';
}
function reviewInitials(name) {
  const parts = String(name || '').replace(/"/g, '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
function googleReviewCard(review, index) {
  const color = REVIEW_AVATAR_COLORS[index % REVIEW_AVATAR_COLORS.length];
  return '<article class="review-card"><div class="review-card-top"><div class="review-avatar ' + color + '">' + e(reviewInitials(review.name)) + '</div><div class="review-card-person"><h3>' + e(review.name) + '</h3><p class="review-card-meta">' + e(review.meta) + '</p></div></div><span class="review-card-stars" aria-label="5 out of 5 stars">★★★★★</span><p class="review-card-quote">"' + e(review.quote) + '"</p><p class="review-card-date">' + e(review.date) + '</p></article>';
}
function contactMapSection() {
  const embed = googleReviews.mapEmbed;
  if (!embed) return '';
  const addr = site.address || {};
  const rating = Number(googleReviews.rating || 4.9).toFixed(1);
  const count = Number(googleReviews.reviewCount || 0).toLocaleString('en-US');
  const officePhoto = site.assets.office || '/assets/images/clearwater-dentist-clearwater-fl-front-of-dental-office-1920w.webp';
  const addressLine = e(addr.street) + ' · ' + e(addr.city) + ', ' + e(addr.state) + ' ' + e(addr.zip);
  return '<section class="contact-map-band cw-google-trust" aria-label="Office location"><div class="cw-google-trust"><div class="cw-trust-map-row cw-trust-map-row--contact" data-cw-map-row><div class="map-card"><div class="map-frame-wrap"><iframe src="' + attr(embed) + '" width="600" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Clearwater Dentist on Google Maps"></iframe><a class="map-place-badge" href="' + attr(googleReviews.googleUrl || site.googleReviewUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="Clearwater Dentist ' + attr(rating) + ' stars, ' + attr(count) + ' Google reviews"><strong class="map-place-badge__name">Clearwater Dentist</strong><span class="map-place-badge__score"><span class="map-place-badge__stars" aria-hidden="true">★★★★★</span><span>' + rating + ' · ' + count + ' reviews</span></span></a></div><p class="map-card__address">' + addressLine + '</p></div><figure class="cw-trust-office-photo" data-cw-map-photo aria-hidden="false"><img src="' + attr(officePhoto) + '" alt="Clearwater Dentist office exterior at 1700 N McMullen Booth Rd" width="640" height="480" loading="lazy" decoding="async"></figure></div></div></section>';
}
function googleTrustSection() {
  const rating = Number(googleReviews.rating || 4.9).toFixed(1);
  const count = Number(googleReviews.reviewCount || 0).toLocaleString('en-US');
  const cards = (googleReviews.reviews || []).map(googleReviewCard).join('');
  const addr = site.address || {};
  const officePhoto = site.assets.office || '/assets/images/clearwater-dentist-clearwater-fl-front-of-dental-office-1920w.webp';
  const addressLine = e(addr.street) + ' · ' + e(addr.city) + ', ' + e(addr.state) + ' ' + e(addr.zip);
  return '<section class="cw-google-trust-band" aria-label="Patient reviews and location"><div class="cw-google-trust"><div class="review-layout review-layout--stacked"><div class="review-carousel-shell cw-reveal"' + cwRevealAttr('bottom', 0) + ' data-review-carousel><div class="review-showcase-header"><div class="review-showcase-brand"><div><strong>See what patients said before you book</strong><div class="review-showcase-score"><img class="google-mark" src="/assets/icons/google-g-logo.svg" alt="" width="38" height="38" decoding="async" aria-hidden="true"><span class="review-stars" aria-label="' + attr(rating) + ' out of 5 stars">★★★★★</span><span>' + rating + ' · ' + count + ' Google reviews</span></div></div></div><div class="review-carousel-controls"><button class="review-carousel-btn" type="button" data-review-prev aria-label="Previous review card">&#8249;</button><button class="review-carousel-btn" type="button" data-review-next aria-label="Next review card">&#8250;</button></div></div><p class="cw-trust-intro">Patients consistently mention our friendly team, thorough explanations, and Dr. Nadia&apos;s attention to detail. Browse recent Google reviews from real visits, then see our Clearwater office on the map below.</p><div class="review-carousel-track-outer"><div class="review-carousel-track" data-review-track>' + cards + '</div></div><div class="review-carousel-dots" data-review-dots></div><div class="review-carousel-footer"><a class="review-carousel-link" href="' + attr(googleReviews.googleUrl || site.googleReviewUrl) + '" target="_blank" rel="noopener noreferrer">See all reviews on Google</a></div></div><div class="cw-trust-map-row" data-cw-map-row><div class="map-card cw-reveal"' + cwRevealAttr('left', 0) + '><div class="map-frame-wrap"><iframe src="' + attr(googleReviews.mapEmbed) + '" width="600" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Clearwater Dentist on Google Maps"></iframe><a class="map-place-badge" href="' + attr(googleReviews.googleUrl || site.googleReviewUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="Clearwater Dentist ' + attr(rating) + ' stars, ' + attr(count) + ' Google reviews"><strong class="map-place-badge__name">Clearwater Dentist</strong><span class="map-place-badge__score"><span class="map-place-badge__stars" aria-hidden="true">★★★★★</span><span>' + rating + ' · ' + count + ' reviews</span></span></a></div><p class="map-card__address">' + addressLine + '</p></div><figure class="cw-trust-office-photo cw-reveal"' + cwRevealAttr('right-soft', 120) + ' data-cw-map-photo aria-hidden="false"><img src="' + attr(officePhoto) + '" alt="Clearwater Dentist office exterior at 1700 N McMullen Booth Rd" width="640" height="480" loading="lazy" decoding="async"></figure></div></div></div></section>';
}
function finalCta() {
  return '<section class="cta-band cw-reveal"' + cwRevealAttr('right', 0) + '><h2' + cwEdit('/', 'final-cta-headline', 'Bottom CTA headline') + '>Ready to schedule your visit?</h2><p' + cwEdit('/', 'final-cta-intro', 'Bottom CTA text') + '>New patients are welcome. Request an appointment online, call our Clearwater office directly, or review financing and insurance options before your consultation with Dr. Nadia.</p><div class="hero-actions"><a class="btn primary"' + cwEdit('/', 'final-cta-book', 'Bottom book button', 'button') + ' href="/contact-us">Request Appointment</a><a class="btn secondary"' + cwEdit('/', 'final-cta-finance', 'Bottom financing button', 'button') + ' href="/financing">View Financing</a></div></section>';
}
function serviceDirectorySection() {
  const directory = (site.serviceLinks || []).filter(item => item.href !== '/general-dentistry');
  return '<section id="service-directory" class="directory-band"><div class="section-head"><p class="eyebrow">All Services</p><h2>Every core treatment page in one place.</h2><p>From preventive visits and emergency care to implants, cosmetic dentistry, and advanced esthetic treatments — browse the full service lineup below.</p></div><div class="directory-grid">' + directory.map(item => '<a class="directory-link" href="' + attr(item.href) + '">' + e(item.label) + '</a>').join('') + '</div></section>';
}
function renderHome(page) {
  const video = site.assets.heroVideo;
  const poster = site.assets.heroPoster || site.assets.office;
  const rk = page.route;
  const heroInner = '<section class="home-hero" data-home-hero-parallax><div class="home-hero-media">' + (video ? '<video autoplay muted loop playsinline preload="none"' + cwEdit(rk, 'hero-poster', 'Hero video poster', 'poster') + ' poster="' + attr(poster) + '" data-cw-hero-video data-cw-lazy-src="' + attr(video) + '"></video>' : '<img' + cwEdit(rk, 'hero-poster-img', 'Hero image', 'img') + ' src="' + attr(poster) + '" alt="Clearwater Dentist office" loading="eager" fetchpriority="high">') + '</div><div class="home-hero-copy"><p class="eyebrow"' + cwEdit(rk, 'hero-eyebrow', 'Hero eyebrow') + '>Family & Cosmetic Dentistry in Clearwater, FL</p><h1 class="cw-hero-welcome cw-welcome-glimmer"' + cwEdit(rk, 'hero-h1', 'Hero headline') + '>' + e(page.h1 || 'Welcome to the Office of Dr. Nadia') + '</h1><p class="cw-hero-smile cw-smile-glimmer"' + cwEdit(rk, 'hero-subline', 'Hero subline') + '>You Deserve a Beautiful Smile</p><p class="lede"' + cwEdit(rk, 'hero-lede', 'Hero description') + '>Concierge dental care for patients who want calm visits, modern technology, and a smile they feel proud to show.</p><div class="hero-actions"><a class="btn primary"' + cwEdit(rk, 'hero-cta-book', 'Hero book button', 'button') + ' href="/contact-us">Request Appointment</a><a class="btn secondary"' + cwEdit(rk, 'hero-cta-call', 'Hero call button', 'button') + ' href="tel:' + attr(site.phoneTel) + '">Call ' + e(site.phoneDisplay) + '</a></div><div class="hero-pills"><a' + cwEdit(rk, 'hero-pill-0', 'Hero pill 1', 'button') + ' href="/emergency-dentistry-clearwater-fl">Same-day emergencies</a><a' + cwEdit(rk, 'hero-pill-1', 'Hero pill 2', 'button') + ' href="/anti-anxiety-dentist-office">Anti-anxiety care</a><a' + cwEdit(rk, 'hero-pill-2', 'Hero pill 3', 'button') + ' href="/financing">Flexible financing</a><a' + cwEdit(rk, 'hero-pill-3', 'Hero pill 4', 'button') + ' href="/before-and-after">Before & afters</a></div></div></section>';
  return '<div class="home-hero-stage">' + heroInner + homeLeadForm() + '</div>' + servicesSection() + whySection() + googleTrustSection() + beforeAfterSection(3) + videoCarouselSection() + finalCta();
}
function pageKicker(page) {
  if (page.type === 'blogPost') return 'Dental Blog';
  if (page.type === 'policy') return 'Practice Policy';
  if (page.type === 'serviceArea') return 'Service Areas';
  return page.type;
}
function blogServiceCtaBand(page) {
  const target = page.canonicalService;
  if (!target || page.type !== 'blogPost') return '';
  return '<section class="content-section cw-blog-service-cta"><h2>Related care at Clearwater Dentist</h2><p>' + e(target.blurb) + '</p><p><a class="btn primary" href="' + attr(target.href) + '">Explore ' + e(target.label) + '</a></p></section>';
}
function renderGeneric(page) {
  const sidebar = page.type === 'policy' ? '' : relatedServices(page.route);
  const articleBody = usesInlineMedia(page)
    ? renderInlineSections(page)
    : (page.sections || []).map((section, index) => sectionHtml(section, page, index)).join('');
  const tailMedia = usesInlineMedia(page) ? '' : mediaHtml(page);
  const tailGallery = usesInlineMedia(page) ? '' : galleryHtml((page.images || []).slice(1), 8);
  const serviceFooter = page.type === 'service' ? serviceHighlightsBand(page) + serviceCtaBand(page) : '';
  const blogFooter = page.type === 'blogPost' ? blogServiceCtaBand(page) : '';
  return hero(page, pageKicker(page)) + '<div class="content-layout' + (page.type === 'policy' ? ' content-layout--policy' : '') + '"><article class="article-body">' + articleBody + blogFooter + policyLinksBlock(page.route) + tailMedia + tailGallery + '</article>' + sidebar + '</div>' + (page.route === '/general-dentistry' ? serviceDirectorySection() : '') + serviceFooter;
}
function serviceAreaHighlights(area) {
  const links = [
    { href: '/general-dentistry', label: 'General Dentistry', desc: 'Preventive exams, cleanings, and family care.' },
    { href: '/emergency-dentistry-clearwater-fl', label: 'Emergency Dentistry', desc: 'Same-day urgent visits when pain cannot wait.' },
    { href: '/dental-implants-clearwater-fl', label: 'Dental Implants', desc: 'Secure, natural-looking tooth replacement options.' },
    { href: '/cosmetic-dentistry', label: 'Cosmetic Dentistry', desc: 'Whitening, veneers, and smile design.' }
  ];
  return '<section class="cw-gallery-discover" aria-label="Dental services for ' + attr(area.label) + '"><div class="cw-gallery-discover__inner"><div class="section-head"><p class="eyebrow">Local Dental Care</p><h2>Popular services for patients near ' + e(area.label) + '</h2><p>Our Clearwater office welcomes patients from ' + e(area.city) + ' and surrounding neighborhoods including ' + e(area.neighbors) + '.</p></div><div class="cw-gallery-highlight-grid">' + links.map((item, index) => '<a class="cw-gallery-highlight cw-reveal" href="' + attr(item.href) + '"' + cwRevealAttr(GALLERY_REVEAL_DIRS[index % GALLERY_REVEAL_DIRS.length], index * 100) + '><span class="cw-gallery-highlight__copy"><strong>' + e(item.label) + '</strong><p>' + e(item.desc) + '</p><span class="cw-gallery-highlight__link">Learn more</span></span></a>').join('') + '</div></div></section>';
}
function renderServiceArea(page) {
  const area = page.area || {};
  const otherAreas = (site.serviceAreas || []).filter(item => item.slug !== area.slug);
  const areaLinks = otherAreas.length
    ? '<section class="content-section"><h2>More service areas near Clearwater</h2><ul class="check-list">' + otherAreas.map(item => '<li><a href="/' + attr(item.slug) + '">Dentist in ' + e(item.label) + '</a></li>').join('') + '</ul></section>'
    : '';
  const body = '<section class="content-section"><h2>Serving ' + e(area.label) + ' from our Clearwater office</h2><p>' + e(area.intro) + '</p><p>Clearwater Dentist is located at ' + e(site.address.street) + ', ' + e(site.address.city) + ', ' + e(site.address.state) + ' ' + e(site.address.zip) + ' — a convenient drive for patients in ' + e(area.city) + ' and nearby communities.</p><p>Whether you need a routine checkup, cosmetic smile planning, dental implants, sedation-supported care, or same-day emergency treatment, Dr. Nadia Pokrovskaya and our team provide concierge-style dentistry with modern technology and a calm, patient-focused experience.</p></section>' + areaLinks;
  return hero(page, 'Service Areas') + '<div class="content-layout"><article class="article-body">' + body + '</article>' + relatedServices('/general-dentistry') + '</div>' + serviceAreaHighlights(area) + serviceCtaBand(page);
}
function renderBlogIndex(page) {
  const posts = allPages.filter(p => p.type === 'blogPost').map(post => '<article class="post-card"><a href="' + attr(post.route) + '">' + imageTag(post.heroImage || { src: site.assets.office, alt: post.h1 }, '', false) + '<span>Dental Blog</span><h2>' + e(post.h1) + '</h2><p>' + e(post.description || ((post.sections[0] && post.sections[0].body[0]) || 'Read more from Clearwater Dentist.')) + '</p></a></article>').join('');
  return hero(page, 'Dental Blog') + '<section class="post-grid">' + posts + '</section>';
}
function renderContact(page) {
  const addr = site.address || {};
  return hero(page, 'Contact') + '<section class="contact-grid"><div class="contact-panel"><h2>Contact the office</h2><p><strong>Phone</strong><br><a href="tel:' + attr(site.phoneTel) + '">' + e(site.phoneDisplay) + '</a></p><p><strong>Email</strong><br><a href="mailto:' + attr(site.email) + '">' + e(site.email) + '</a></p><p><strong>Address</strong><br>' + e(addr.street) + '<br>' + e(addr.city) + ', ' + e(addr.state) + ' ' + e(addr.zip) + '</p><p class="fine-print">Payment and insurance questions? Read our <a href="/financial-policy">Financial Policy</a>.</p><a class="btn primary full" href="/contact-us">Request Appointment</a></div><form class="contact-form" action="#" method="post"><h2>Request an Appointment</h2><label>Name<input name="name" autocomplete="name" required></label><label>Phone<input name="phone" type="tel" autocomplete="tel" required></label><label>Email<input name="email" type="email" autocomplete="email"></label><label>How can we help?<textarea name="message" rows="5"></textarea></label><p class="fine-print">We do not accept State Insurances, HMOs, or Medicaid. Information you submit is handled according to our <a href="/privacy-policy">Privacy Policy</a> and <a href="/notice-of-privacy-practices">Notice of Privacy Practices</a>.</p><button class="btn primary" type="submit">Send Request</button></form></section>' + contactMapSection();
}
function gallerySectionHtml(section, index) {
  const dir = GALLERY_REVEAL_DIRS[index % GALLERY_REVEAL_DIRS.length];
  return '<section class="content-section cw-gallery-section cw-reveal"' + cwRevealAttr(dir, index * 90) + '><h2>' + e(section.heading) + '</h2>' + (section.body || []).map(p => '<p>' + richText(p) + '</p>').join('') + (section.items && section.items.length ? '<ul class="check-list">' + section.items.map(i => '<li>' + richText(i) + '</li>').join('') + '</ul>' : '') + sectionFigureHtml(section.figure) + '</section>';
}
function galleryHighlightsBand() {
  const cards = galleryTreatmentHighlights.map((item, index) => '<a class="cw-gallery-highlight cw-reveal" href="' + attr(item.href) + '"' + cwRevealAttr(GALLERY_REVEAL_DIRS[index % GALLERY_REVEAL_DIRS.length], index * 100) + '>' + imageTag({ src: item.image, alt: item.title + ' at Clearwater Dentist' }, 'cw-gallery-highlight__img', false) + '<span class="cw-gallery-highlight__copy"><strong>' + e(item.title) + '</strong><p>' + e(item.desc) + '</p><span class="cw-gallery-highlight__link">Learn more</span></span></a>').join('');
  return '<section class="cw-gallery-discover" aria-label="Treatments featured in our before and after gallery"><div class="cw-gallery-discover__inner"><div class="section-head cw-reveal"' + cwRevealAttr('bottom', 0) + '><p class="eyebrow">Smile Transformations</p><h2>Explore the treatments behind these results.</h2><p>Every before and after photo reflects a personalized plan at our Clearwater, FL dental office. Browse the services most often associated with these transformations, then request a consultation to discuss your goals with Dr. Nadia.</p></div><div class="cw-gallery-highlight-grid">' + cards + '</div></div></section>';
}
function galleryCtaBand() {
  return '<section class="cw-gallery-cta cw-reveal"' + cwRevealAttr('bottom', 120) + '><div class="cw-gallery-cta__inner"><p class="eyebrow">Clearwater Dentist</p><h2>Ready to start your smile transformation?</h2><p>Schedule a consultation at our Clearwater office to review your options for dental implants, cosmetic dentistry, restorative care, and flexible financing.</p><div class="hero-actions"><a class="btn primary" href="' + APPOINTMENT_PATH + '">Request Appointment</a><a class="btn secondary" href="tel:' + attr(site.phoneTel) + '">Call ' + e(site.phoneDisplay) + '</a></div></div></section>';
}
function servicePageTitle(page) {
  return String(page.h1 || page.title || 'Dental Care').replace(/^[\u{1F300}-\u{1FAFF}\u2600-\u27BF]+\s*/u, '').trim();
}
function serviceNavGroupFor(route) {
  for (const group of site.serviceNavGroups || []) {
    if ((group.children || []).some(child => child.href === route)) return group;
  }
  return null;
}
function relatedServiceHighlights(page, limit = 4) {
  const current = page.route;
  const group = serviceNavGroupFor(current);
  let pool = [];
  if (group) pool = (group.children || []).filter(child => child.href !== current);
  if (pool.length < limit) {
    const seen = new Set([current, ...pool.map(item => item.href)]);
    for (const link of site.serviceLinks || []) {
      if (seen.has(link.href)) continue;
      pool.push(link);
      seen.add(link.href);
      if (pool.length >= limit) break;
    }
  }
  return pool.slice(0, limit).map(link => ({
    title: link.label,
    href: link.href,
    desc: (serviceTileCopy[link.href]?.hoverDetail || 'Personalized dental care at Clearwater Dentist in Clearwater, FL.').slice(0, 160),
    image: serviceImages[link.href] || site.assets.office
  }));
}
function serviceHighlightsBand(page) {
  const items = relatedServiceHighlights(page);
  if (!items.length) return '';
  const group = serviceNavGroupFor(page.route);
  const eyebrow = group ? group.label : 'Related Services';
  const title = servicePageTitle(page);
  const cards = items.map((item, index) => '<a class="cw-gallery-highlight cw-reveal" href="' + attr(item.href) + '"' + cwRevealAttr(GALLERY_REVEAL_DIRS[index % GALLERY_REVEAL_DIRS.length], index * 100) + '>' + imageTag({ src: item.image, alt: item.title + ' at Clearwater Dentist' }, 'cw-gallery-highlight__img', false) + '<span class="cw-gallery-highlight__copy"><strong>' + e(item.title) + '</strong><p>' + e(item.desc) + '</p><span class="cw-gallery-highlight__link">Learn more</span></span></a>').join('');
  return '<section class="cw-gallery-discover" aria-label="Related dental services"><div class="cw-gallery-discover__inner"><div class="section-head cw-reveal"' + cwRevealAttr('bottom', 0) + '><p class="eyebrow">' + e(eyebrow) + '</p><h2>Explore related care at Clearwater Dentist.</h2><p>' + richText('Patients often combine treatments related to ' + title + ' with other services in our Clearwater, FL office. Browse related care below, or see the [full service directory](/general-dentistry#service-directory) for every option we offer.') + '</p></div><div class="cw-gallery-highlight-grid">' + cards + '</div></div></section>';
}
function serviceCtaBand(page) {
  const title = servicePageTitle(page);
  const rk = page.route;
  return '<section class="cw-gallery-cta cw-reveal"' + cwRevealAttr('bottom', 120) + '><div class="cw-gallery-cta__inner"><p class="eyebrow"' + cwEdit(rk, 'service-cta-eyebrow', 'Service CTA eyebrow') + '>Clearwater Dentist</p><h2' + cwEdit(rk, 'service-cta-headline', 'Service CTA headline') + '>Ready to learn more about ' + e(title) + '?</h2><p' + cwEdit(rk, 'service-cta-intro', 'Service CTA intro') + '>' + richText('Request a consultation at our Clearwater office. Dr. Nadia and our team will review your goals, explain your options, and discuss [financing](/financing) when helpful.') + '</p><div class="hero-actions"><a class="btn primary"' + cwEdit(rk, 'service-cta-book', 'Service CTA book button', 'button') + ' href="' + APPOINTMENT_PATH + '">Request Appointment</a><a class="btn secondary"' + cwEdit(rk, 'service-cta-call', 'Service CTA call button', 'button') + ' href="tel:' + attr(site.phoneTel) + '">Call ' + e(site.phoneDisplay) + '</a></div></div></section>';
}
function renderGallery(page) {
  const sections = galleryPageSections(page);
  return hero(page, 'Before & After') + beforeAfterSection(5) + '<div class="content-layout cw-gallery-content"><article class="article-body">' + sections.map(gallerySectionHtml).join('') + '</article>' + relatedServices(page.route) + '</div>' + galleryHighlightsBand() + galleryCtaBand();
}
function schema(page) {
  const addr = site.address || {};
  return '<script type="application/ld+json">' + JSON.stringify({ '@context': 'https://schema.org', '@type': 'Dentist', name: site.name, url: site.domain + page.route, telephone: site.phoneDisplay, address: { '@type': 'PostalAddress', streetAddress: addr.street, addressLocality: addr.city, addressRegion: addr.state, postalCode: addr.zip, addressCountry: 'US' } }) + '</script>';
}
function chatBodyAttrs() {
  const chat = site.chat || {};
  if (!chat.enabled || chat.provider !== 'tidio' || !chat.tidioPublicKey) {
    return 'data-chat-enabled="false"';
  }
  let attrs = 'data-chat-enabled="true" data-chat-provider="tidio" data-chat-tidio-key="' + attr(chat.tidioPublicKey) + '"';
  if (chat.placeholder) attrs += ' data-chat-placeholder="true"';
  if (chat.productionNotificationEmail) {
    attrs += ' data-chat-production-email="' + attr(chat.productionNotificationEmail) + '"';
  }
  return attrs;
}
function chatScriptTag() {
  const chat = site.chat || {};
  if (!chat.enabled || chat.provider !== 'tidio' || !chat.tidioPublicKey) return '';
  return '<script src="/assets/js/site-chat.js" defer></script>';
}
function robotsMeta(noindex) {
  if (!noindex) return '';
  return '<meta name="robots" content="noindex,nofollow">';
}
function layout(page, main, options) {
  const opts = options || {};
  const noindex = opts.noindex || PREVIEW_NOINDEX;
  const canonical = site.domain + (opts.canonicalRoute || page.route);
  const previewAssets = INCLUDE_ADMIN_PREVIEW
    ? '<link rel="stylesheet" href="/assets/css/site-admin-preview.css"><script src="/assets/js/site-admin-preview.js" defer></script>'
    : '';
  const headPreload = page.type === 'home' && site.assets?.heroPoster
    ? '<link rel="preload" as="image" href="' + attr(site.assets.heroPoster) + '" fetchpriority="high">'
    : '';
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><script>document.documentElement.classList.add(\'js\');</script><meta name="viewport" content="width=device-width, initial-scale=1">' + robotsMeta(noindex) + headPreload + '<title>' + e(page.title) + '</title><meta name="description" content="' + attr(page.description || site.tagline) + '"><link rel="canonical" href="' + attr(canonical) + '"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/overrides.css">' + previewAssets + '<script src="/assets/js/main.js" defer></script>' + schema(page) + '</head><body class="page-' + attr(page.type) + '" ' + chatBodyAttrs() + '><a class="skip-link" href="#main">Skip to content</a>' + header(page) + '<main id="main">' + main + '</main>' + footer() + chatScriptTag() + '</body></html>';
}
function htaccessRules() {
  const lines = [
    '# Clearwater Dentist v2 — generated redirect map for Apache',
    'RewriteEngine On',
    ''
  ];
  for (const rule of redirects) {
    const from = rule.from.replace(/\/$/, '') || '/';
    lines.push('Redirect 301 ' + from + ' ' + rule.to);
  }
  lines.push(
    '',
    '# Legacy Duda AMP paths (GSC AMP 5xx cleanup)',
    'RewriteRule ^ampify/teeth-whitening/?$ /teeth-whitening-clearwater-fl [R=301,L,NC]',
    'RewriteRule ^ampify/?$ / [R=301,L,NC]',
    'RewriteRule ^ampify/(.+)$ /$1 [R=301,L,NC]',
    '',
    '# Legacy impact subdomain URLs (GSC 404 cleanup when host points here)',
    'RewriteCond %{HTTP_HOST} ^impact\\.clearwaterdentist\\.com$ [NC]',
    'RewriteRule ^$ https://www.clearwaterdentist.com/ [R=301,L]',
    'RewriteCond %{HTTP_HOST} ^impact\\.clearwaterdentist\\.com$ [NC]',
    'RewriteRule ^home/?$ https://www.clearwaterdentist.com/ [R=301,L]',
    'RewriteCond %{HTTP_HOST} ^impact\\.clearwaterdentist\\.com$ [NC]',
    'RewriteRule ^(.+)$ https://www.clearwaterdentist.com/$1 [R=301,L]',
    '',
    '# Canonicalize homepage UTM variants',
    'RewriteCond %{QUERY_STRING} (^|&)utm_ [NC]',
    'RewriteRule ^$ /? [R=301,L]'
  );
  return lines.join('\n') + '\n';
}
function netlifyRedirects() {
  const lines = redirects.map(rule => rule.from + ' ' + rule.to + ' 301');
  lines.push('/ampify/teeth-whitening /teeth-whitening-clearwater-fl 301');
  lines.push('/ampify/* /:splat 301');
  lines.push('/ampify / 301');
  lines.push('https://impact.clearwaterdentist.com/* https://www.clearwaterdentist.com/:splat 301');
  lines.push('/?utm_* / 301');
  return lines.join('\n') + '\n';
}
function render(page) {
  if (page.type === 'home') return renderHome(page);
  if (page.type === 'blogIndex') return renderBlogIndex(page);
  if (page.type === 'contact') return renderContact(page);
  if (page.type === 'gallery') return renderGallery(page);
  if (page.type === 'serviceArea') return renderServiceArea(page);
  return renderGeneric(page);
}
const SITEMAP_EXCLUDED_TYPES = new Set(['redirect']);
const PRIMARY_SERVICE_ROUTES = new Set((site.serviceLinks || []).map(item => item.href));
function sitemapPriority(page) {
  if (page.route === '/') return '1.0';
  if (page.type === 'serviceArea') return '0.8';
  if (PRIMARY_SERVICE_ROUTES.has(page.route)) return '0.9';
  if (page.type === 'blogPost') return '0.6';
  if (page.type === 'policy') return '0.3';
  if (['contact', 'gallery', 'finance', 'doctor', 'team', 'blogIndex'].includes(page.type)) return '0.7';
  return '0.5';
}
function sitemapChangefreq(page) {
  if (page.route === '/') return 'weekly';
  if (page.type === 'serviceArea') return 'monthly';
  if (page.type === 'blogPost') return 'monthly';
  if (PRIMARY_SERVICE_ROUTES.has(page.route)) return 'monthly';
  return 'yearly';
}
function indexablePages() {
  return allPages.filter(page => !SITEMAP_EXCLUDED_TYPES.has(page.type) && !page.noindex);
}
function sitemap() {
  const urls = indexablePages().map(page => '<url><loc>' + site.domain + page.route + '</loc><changefreq>' + sitemapChangefreq(page) + '</changefreq><priority>' + sitemapPriority(page) + '</priority></url>').join('');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>\n';
}
async function main() {
  if (!DIST.startsWith(ROOT)) throw new Error('Unsafe dist path');
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  await copyDir(PUBLIC, DIST);
  for (const page of allPages) {
    const dir = outDir(page.route);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'index.html'), layout(page, render(page)), 'utf8');
  }
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap(), 'utf8');
  await fs.writeFile(path.join(DIST, 'llms-full.txt'), generateLlmsFull(site, allPages), 'utf8');
  await fs.writeFile(path.join(DIST, 'robots.txt'), robotsTxtContent(site, PREVIEW_NOINDEX), 'utf8');
  await fs.writeFile(path.join(DIST, '.htaccess'), htaccessRules(), 'utf8');
  await fs.writeFile(path.join(DIST, '_redirects'), netlifyRedirects(), 'utf8');
  console.log('Built ' + allPages.length + ' pages into ' + DIST + ' (preview noindex: ' + PREVIEW_NOINDEX + ')');
}
await main();
