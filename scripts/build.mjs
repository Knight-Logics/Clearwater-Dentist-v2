import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { galleryPageSections, servicePageSections } from './clean-page-sections.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const PUBLIC = path.join(ROOT, 'public');
const site = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/site.json'), 'utf8'));
const pages = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/pages.json'), 'utf8'));
const googleReviews = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/google-reviews.json'), 'utf8'));
const APPOINTMENT_PATH = '/contact-us';
const REVIEW_AVATAR_COLORS = ['review-avatar--blue', 'review-avatar--red', 'review-avatar--green', 'review-avatar--orange', 'review-avatar--purple', 'review-avatar--teal'];

const serviceImages = {
  '/dental-implants-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-woman-dental-implants-6627bd42-07d3fb59-1920w.jpg',
  '/cosmetic-dentistry': '/assets/images/clearwater-dentist-clearwater-fl-smile-lady-2880w.jpg',
  '/smile-makeover': '/assets/images/clearwater-dentist-clearwater-fl-smile-makeover-ab960fc4-256c5e17-1920w.jpg',
  '/porcelain-veneers-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-veneer-1920w.png',
  '/Invisalign-service-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-invisalign-girl-fd93d95a-2880w.jpg',
  '/teeth-whitening-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-teeth-whitening-1920w.png',
  '/emergency-dentistry-clearwater-fl': '/assets/images/clearwater-dentist-clearwater-fl-emergency-2-1920w.png',
  '/gum-disease-treatment': '/assets/images/clearwater-dentist-clearwater-fl-gingivectomy-be1e5855-1920w.jpg'
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
  }
};

const serviceCardIcon = '<svg class="cw-service-card__icon" viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="3.5" fill="none" stroke="currentColor" stroke-width="1.5"></rect><path d="M8 12.25l2.75 2.75L16.5 9.25" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>';

const videoCarouselSlides = [
  {
    tab: 'Clearwater Dentist',
    title: 'Clearwater Dentist',
    desc: 'Why Join Clearwater Dentist?',
    src: '/assets/video/wzdvza5yrog6hu70zyqp-office-v.mp4',
    poster: '/assets/images/wzdvza5yrog6hu70zyqp-office-v2-0000000-1920w.jpg'
  },
  {
    tab: 'Smile Makeover',
    title: 'Smile Makeover',
    desc: 'What is Smile Makeover?',
    src: '/assets/video/gru61qftnm5yovvxsqhn-smile-makeover-v.mp4',
    poster: '/assets/images/gru61qftnm5yovvxsqhn-smile-makeover-v2-0000000-1920w.jpg'
  },
  {
    tab: 'Gum Disease',
    title: 'Gum Disease',
    desc: 'What is Gum Disease?',
    src: '/assets/video/general-v.mp4',
    poster: '/assets/images/general-v2-0000000-1920w.jpg'
  },
  {
    tab: 'Veneers',
    title: 'Veneers',
    desc: 'How Much Are Veneers?',
    src: '/assets/video/veneers-dentist-v.mp4',
    poster: '/assets/images/veneers-dentist-v2-0000000-1920w.jpg'
  },
  {
    tab: 'Sedation',
    title: 'Sedation',
    desc: 'How We Help Reduce Anxiety',
    src: '/assets/video/sedation-dentist-v.mp4',
    poster: '/assets/images/sedation-dentist-v2-0000000-1920w.jpg'
  },
  {
    tab: 'Dogs',
    title: 'Dogs',
    desc: 'Scared Of Dentist?',
    src: '/assets/video/scared-of-the-dentist-v.mp4',
    poster: '/assets/images/scared-of-the-dentist-v2-0000000-1920w.jpg'
  },
  {
    tab: 'Dental Crown',
    title: 'Dental Crown',
    desc: 'Do You Need a Dental Crown?',
    src: '/assets/video/do-you-need-a-dental-crown-v.mp4',
    poster: '/assets/images/do-you-need-a-dental-crown-v2-0000000-1920w.jpg'
  }
];

const beforeAfterPairs = [
  {
    name: 'Restorative Smile Renewal',
    before: '/assets/images/4-5f84c482-50be5873-50c6f43b-5b31c7bf-b0ddaaaf-51f6a7c5-7a328735-70980e3c-1920w.png',
    after: '/assets/images/5-ae8bb993-9f57610f-b7ca963b-c6b3aead-ea1c3f27-39b8498f-4e212feb-1920w.png'
  },
  {
    name: 'Smile Makeover',
    before: '/assets/images/screenshot-2025-12-04-at-2-48-40-pm-de03c815-1bdd2457-9435e2a6-5cb22128-3e8f8488-3d10d599-5e.png',
    after: '/assets/images/screenshot-2025-12-04-at-2-49-20-pm-b327eaf9-5dcb1b1e-1920w.png'
  },
  {
    name: 'Full Smile Repair',
    before: '/assets/images/img-20250924-115520-1-1920w.jpg',
    after: '/assets/images/img-20250924-115518-281-29-aba1cc49-592781a0-108b1bfd-1920w.png'
  }
];

function e(value) {
  return String(value || '').replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
function attr(value) { return e(value).replace(/`/g, '&#96;'); }
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
function pageByRoute(route) {
  return pages.find(page => page.route === route) || {};
}
function isActive(item, currentRoute) {
  if (item.href === currentRoute) return true;
  return !!(item.children || []).some(child => isActive(child, currentRoute));
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
    { label: 'Services', href: '/general-dentistry', children: [
      { label: 'Dental Implants', href: '/dental-implants-clearwater-fl' },
      { label: 'Cosmetic Dentistry', href: '/cosmetic-dentistry' },
      { label: 'Smile Makeover', href: '/smile-makeover' },
      { label: 'Porcelain Veneers', href: '/porcelain-veneers-clearwater-fl' },
      { label: 'Invisalign', href: '/Invisalign-service-clearwater-fl' },
      { label: 'Teeth Whitening', href: '/teeth-whitening-clearwater-fl' },
      { label: 'Emergency Dentistry', href: '/emergency-dentistry-clearwater-fl' },
      { label: 'Gum Disease Treatment', href: '/gum-disease-treatment' },
      { label: 'Root Canal', href: '/root-canal-clearwater-fl' },
      { label: 'Crowns & Bridges', href: '/crowns-and-bridges' },
      { label: 'Sedation Dentistry', href: '/sedation-dentistry-clearwater-fl' },
      { label: 'Facial Esthetics', href: '/facial-esthetics' }
    ] },
    { label: 'Before & After', href: '/before-and-after' },
    { label: 'Financing', href: '/financing', children: [
      { label: 'Financing Options', href: '/financing' },
      { label: 'CareCredit', href: '/financing/carecredit' },
      { label: 'Sunbit', href: '/sunbit' },
      { label: 'Alphaeon', href: '/alphaeon' }
    ] },
    { label: 'Blog', href: '/blog' },
    { label: 'Contact', href: '/contact-us' }
  ];
}
function renderNav(items, currentRoute, nested) {
  return '<ul class="' + (nested ? 'site-subnav' : 'site-nav') + '">' + items.map(item => {
    const children = item.children && item.children.length ? '<button class="subnav-toggle" aria-expanded="false" aria-label="Open ' + attr(item.label) + ' menu">+</button>' + renderNav(item.children, currentRoute, true) : '';
    const active = isActive(item, currentRoute) ? ' is-active' : '';
    return '<li class="nav-item' + (children ? ' has-children' : '') + active + '"><a href="' + attr(item.href) + '">' + e(item.label) + '</a>' + children + '</li>';
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
  return '<header class="site-header" data-site-header><div class="header-inner"><div class="brand-wrap"><a class="brand" href="/" aria-label="Clearwater Dentist home">' + (logo ? '<img src="' + attr(logo) + '" alt="Clearwater Dentist logo" width="58" height="58">' : '') + '<span class="brand-text"><strong>' + e(site.name) + '</strong><small>' + e(site.doctor) + '</small></span></a><div class="cw-site-header__social cw-brand-social" aria-label="Social media">' + headerSocial() + '</div></div><nav id="primary-menu" class="primary-menu" aria-label="Primary navigation">' + renderNav(navTree(), page.route, false) + '</nav><div class="header-mobile-end">' + headerCtaStack() + '<button class="menu-button" type="button" data-menu-toggle aria-controls="primary-menu" aria-expanded="false"><span></span><span></span><span></span><b>Menu</b></button></div></div></header>';
}
function socialIcon(label) {
  const codes = { Facebook: '&#xea90;', Instagram: '&#xea92;', YouTube: '&#xea9d;', Pinterest: '&#xf0d2;', TikTok: '&#xe813;' };
  return codes[label] || '•';
}
function footer() {
  const addr = site.address || {};
  const logo = site.assets.logoWhite || site.assets.logo || '';
  const social = (site.social || []).map(s => '<a class="social-link" href="' + attr(s.href) + '" target="_blank" rel="noopener" aria-label="' + attr(s.label) + '"><span class="social-glyph" aria-hidden="true">' + socialIcon(s.label) + '</span></a>').join('');
  return '<footer class="site-footer"><div class="footer-grid"><section class="footer-brand">' + (logo ? '<img src="' + attr(logo) + '" alt="Clearwater Dentist logo" width="108" height="108" decoding="async">' : '') + '<h2>' + e(site.name) + '</h2><p>' + e(site.tagline) + '</p><div class="social-row">' + social + '</div></section><section><h2>Office</h2><p>' + e(addr.street) + '<br>' + e(addr.city) + ', ' + e(addr.state) + ' ' + e(addr.zip) + '</p>' + (site.hours || []).map(h => '<p><strong>' + e(h.days) + '</strong><br>' + e(h.time) + '</p>').join('') + '<p><a href="tel:' + attr(site.phoneTel) + '">' + e(site.phoneDisplay) + '</a><br><a href="mailto:' + attr(site.email) + '">' + e(site.email) + '</a></p></section><section><h2>Services</h2><ul>' + linkList((site.serviceLinks || []).slice(0, 8)) + '</ul></section><section><h2>Quick Links</h2><ul>' + linkList(site.quickLinks || []) + '</ul></section></div><div class="footer-bottom"><ul class="footer-policies">' + linkList(site.policyLinks || []) + '</ul><p class="copyright">&copy; 2026 Clearwater Dentist. All Rights Reserved.</p></div></footer>';
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
  return '<section class="page-hero page-hero--gallery">' + heroPanels(page) + '<div class="page-hero-overlay" aria-hidden="true"></div><div class="page-hero-inner"><div class="page-hero-copy"><p class="eyebrow">' + e(kicker || page.type.replace(/([A-Z])/g, ' $1')) + '</p><h1>' + e(page.h1) + '</h1>' + (page.description ? '<p class="lede">' + e(page.description) + '</p>' : '') + '<div class="hero-actions"><a class="btn primary" href="' + APPOINTMENT_PATH + '">Request Appointment</a><a class="btn secondary" href="tel:' + attr(site.phoneTel) + '">Call ' + e(site.phoneDisplay) + '</a></div></div></div></section>';
}
function sectionHtml(section) {
  return '<section class="content-section"><h2>' + e(section.heading) + '</h2>' + (section.body || []).map(p => '<p>' + e(p) + '</p>').join('') + (section.items && section.items.length ? '<ul class="check-list">' + section.items.map(i => '<li>' + e(i) + '</li>').join('') + '</ul>' : '') + '</section>';
}
function mediaHtml(page) {
  const vids = (page.videos || []).map(v => videoMarkup(v, 'content-video')).join('');
  const embeds = (page.embeds || []).map(x => '<iframe class="content-embed" src="' + attr(x.src) + '" title="' + attr(x.label || 'Video') + '" loading="lazy" allowfullscreen></iframe>').join('');
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
  const links = pages.filter(page => page.type === 'service' && page.route !== currentRoute).slice(0, 10).map(page => ({ href: page.route, label: page.h1 || page.title }));
  return '<aside class="related-card"><h2>Helpful Services</h2><ul>' + linkList(links) + '</ul><a class="btn secondary full" href="/general-dentistry#service-directory">All Services</a><a class="btn primary full" href="' + APPOINTMENT_PATH + '">Schedule Consultation</a></aside>';
}
function compareCard(pair, index) {
  return '<article class="compare-card"><div class="compare-slider" style="--position:50%"><img class="compare-img compare-before" src="' + attr(pair.before) + '" alt="' + attr(pair.name + ' before') + '" loading="' + (index === 0 ? 'eager' : 'lazy') + '"><div class="compare-after-wrap"><img class="compare-img compare-after" src="' + attr(pair.after) + '" alt="' + attr(pair.name + ' after') + '" loading="' + (index === 0 ? 'eager' : 'lazy') + '"></div><input class="compare-range" type="range" min="0" max="100" value="50" aria-label="Reveal before and after image"><span class="compare-handle" aria-hidden="true"></span><span class="compare-label compare-label-before">Before</span><span class="compare-label compare-label-after">After</span></div><h3>' + e(pair.name) + '</h3></article>';
}
function beforeAfterSection(limit) {
  const parallaxBg = site.assets.beforeAfterParallax || '/assets/images/patient-looking-at-mirror-at-teeth-1920w.jpeg';
  return '<section class="before-after-band cw-before-after-band"><div class="cw-before-after-band__media" data-before-after-parallax style="background-image:url(' + attr(parallaxBg) + ')"></div><div class="cw-before-after-band__scrim" aria-hidden="true"></div><div class="cw-before-after-band__inner"><div class="section-head"><p class="eyebrow">Before & After</p><h2>Drag to compare real smile transformations.</h2><p>These are real patients treated at our Clearwater office. Drag the slider on each image to compare results from implants, smile makeovers, and full-mouth restoration cases planned for natural function and appearance.</p><a href="/before-and-after">View full gallery</a></div><div class="compare-grid">' + beforeAfterPairs.slice(0, limit || 3).map(compareCard).join('') + '</div></div></section>';
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
function serviceCard(service) {
  const image = serviceImages[service.href] || site.assets.office;
  const copy = serviceTileCopy[service.href] || {
    headline: 'Looking for ' + service.label.toLowerCase() + ' in Clearwater?',
    hoverTitle: service.label,
    hoverDetail: 'Learn how Clearwater Dentist can help with personalized, patient-focused care tailored to your goals and comfort level.'
  };
  return '<a class="service-card cw-service-card" href="' + attr(service.href) + '"><img class="cw-service-card__bg" src="' + attr(image) + '" alt="" loading="lazy" decoding="async"><span class="cw-service-card__overlay" aria-hidden="true"></span><span class="cw-service-card__panel cw-service-card__panel--front">' + serviceCardIcon + '<strong class="cw-service-card__headline">' + e(copy.headline) + '</strong>' + serviceCardPeek(copy.hoverDetail) + '</span><span class="cw-service-card__panel cw-service-card__panel--hover"><strong class="cw-service-card__title">' + e(copy.hoverTitle || service.label) + '</strong><span class="cw-service-card__detail">' + e(copy.hoverDetail) + '</span><span class="cw-service-card__cta-btn">Learn more</span></span></a>';
}
function servicesSection() {
  const cards = (site.serviceLinks || []).slice(0, 8).map(serviceCard).join('');
  return '<section class="home-band cw-service-band"><div class="cw-service-band__inner"><div class="section-head"><p class="eyebrow">Our Dental Services</p><h2>Find the right care path for your smile.</h2><p>Whether you need a routine visit, cosmetic upgrade, or same-day emergency care, our team builds treatment around your comfort and long-term oral health. Each service below links to a dedicated page with what to expect, financing options, and how Dr. Nadia approaches your care.</p></div><div class="service-grid cw-service-mosaic">' + cards + '</div></div></section>';
}
const carouselMuteBtn = '<button type="button" class="cw-slide-mute" aria-pressed="true" aria-label="Unmute video"><span class="cw-slide-mute__icon cw-slide-mute__off" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg></span><span class="cw-slide-mute__icon cw-slide-mute__on" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg></span></button>';
const carouselFullscreenIcon = '<svg viewBox="0 0 36 36" width="22" height="22" fill="currentColor" aria-hidden="true"><path d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z"></path><path d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z"></path><path d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z"></path><path d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z"></path></svg>';
const carouselArrows = '<button type="button" class="cw-carousel-arrow cw-carousel-arrow--prev" data-carousel-prev aria-label="Previous videos"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg></button><button type="button" class="cw-carousel-arrow cw-carousel-arrow--next" data-carousel-next aria-label="Next videos"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg></button>';
function carouselSlide(slide, idx) {
  return '<article class="cw-video-carousel__slide" data-carousel-slide data-slide-index="' + idx + '"><div class="cw-video-carousel__media"><video loop muted playsinline preload="metadata" poster="' + attr(slide.poster) + '"><source src="' + attr(slide.src) + '" type="video/mp4"></video>' + carouselMuteBtn + '<button type="button" class="cw-fullscreen-btn" data-cw-modal-trigger data-cw-video-src="' + attr(slide.src) + '" data-cw-video-title="' + attr(slide.title) + '" aria-label="Watch ' + attr(slide.title) + ' in full screen">' + carouselFullscreenIcon + '</button></div><div class="cw-video-carousel__caption"><strong>' + e(slide.title) + '</strong><p>' + e(slide.desc) + '</p></div></article>';
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
  return '<div class="' + attr(panelClass) + '"><p class="eyebrow">Meet The Doctor</p><h3>' + e(site.doctor) + '</h3><p>' + e(site.tagline) + '</p><p>Dr. Nadia focuses on functional, minimally invasive, aesthetic dentistry delivered with patience and an artistic eye.</p><a class="btn secondary" href="/meet-the-doctor">Meet Dr. Nadia</a></div>';
}
function whyChecklist(items) {
  const rows = items.map(item => '<li><span class="cw-why-band__check" aria-hidden="true"><svg viewBox="0 0 16 16" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="2.5 8.2 6.2 11.8 13.5 4.5"></polyline></svg></span><span class="cw-why-band__check-copy"><strong>' + e(item[0]) + '</strong><span>' + e(item[1]) + '</span></span></li>').join('');
  return '<div class="cw-why-band__panel cw-why-band__checks"><ul class="cw-why-band__checklist">' + rows + '</ul></div>';
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
  const whyBg = site.assets.whyBandParallax || '/assets/images/clearwater-dentist-clearwater-fl-front-staff-1920w.jpg';
  const doctorCutout = site.assets.doctorCutout || site.assets.doctor || site.assets.office;
  return '<section class="why-band cw-why-band"><div class="cw-why-band__media" data-why-parallax style="background-image:url(' + attr(whyBg) + ')"></div><div class="cw-why-band__scrim" aria-hidden="true"></div><div class="cw-why-band__inner"><div class="cw-why-band__figure"><img class="cw-why-band__doctor" src="' + attr(doctorCutout) + '" alt="' + attr(site.doctor) + '" loading="lazy" decoding="async"></div><div class="cw-why-band__content"><div class="cw-why-band__panel cw-why-band__head"><h2>Why Come to Clearwater Dentist?</h2><p class="cw-why-band__lede">Modern care with a calmer chairside experience — from your first hello through your final result.</p><p class="cw-why-band__intro">Patients choose our office for thoughtful planning, advanced technology, and a culture built around reducing dental anxiety. We explain options clearly, coordinate care in-house when possible, and help you move forward with confidence.</p></div><div class="cw-why-band__panel-row">' + doctorMeetCopy() + whyChecklist(items) + '</div></div></div></section>';
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
function googleTrustSection() {
  const rating = Number(googleReviews.rating || 4.9).toFixed(1);
  const count = Number(googleReviews.reviewCount || 0).toLocaleString('en-US');
  const cards = (googleReviews.reviews || []).map(googleReviewCard).join('');
  const addr = site.address || {};
  const officePhoto = site.assets.office || '/assets/images/clearwater-dentist-clearwater-fl-front-of-dental-office-1920w.jpg';
  const addressLine = e(addr.street) + ' · ' + e(addr.city) + ', ' + e(addr.state) + ' ' + e(addr.zip);
  return '<section class="cw-google-trust-band" aria-label="Patient reviews and location"><div class="cw-google-trust"><div class="review-layout review-layout--stacked"><div class="review-carousel-shell" data-review-carousel><div class="review-showcase-header"><div class="review-showcase-brand"><img class="google-mark" src="/assets/icons/google-g-logo.svg" alt="" width="38" height="38" decoding="async" aria-hidden="true"><div><strong>See what patients said before you book</strong><div class="review-showcase-score"><span class="review-stars" aria-label="' + attr(rating) + ' out of 5 stars">★★★★★</span><span>' + rating + ' · ' + count + ' Google reviews</span></div></div></div><div class="review-carousel-controls"><button class="review-carousel-btn" type="button" data-review-prev aria-label="Previous review card">&#8249;</button><button class="review-carousel-btn" type="button" data-review-next aria-label="Next review card">&#8250;</button></div></div><p class="cw-trust-intro">Patients consistently mention our friendly team, thorough explanations, and Dr. Nadia&apos;s attention to detail. Browse recent Google reviews from real visits, then see our Clearwater office on the map below.</p><div class="review-carousel-track-outer"><div class="review-carousel-track" data-review-track>' + cards + '</div></div><div class="review-carousel-dots" data-review-dots></div><div class="review-carousel-footer"><a class="review-carousel-link" href="' + attr(googleReviews.googleUrl || site.googleReviewUrl) + '" target="_blank" rel="noopener noreferrer">See all reviews on Google</a></div></div><div class="cw-trust-map-row" data-cw-map-row><div class="map-card"><div class="map-frame-wrap"><iframe src="' + attr(googleReviews.mapEmbed) + '" width="600" height="450" style="border:0;" allowfullscreen loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Clearwater Dentist on Google Maps"></iframe><a class="map-place-badge" href="' + attr(googleReviews.googleUrl || site.googleReviewUrl) + '" target="_blank" rel="noopener noreferrer" aria-label="Clearwater Dentist ' + attr(rating) + ' stars, ' + attr(count) + ' Google reviews"><strong class="map-place-badge__name">Clearwater Dentist</strong><span class="map-place-badge__score"><span class="map-place-badge__stars" aria-hidden="true">★★★★★</span><span>' + rating + ' · ' + count + ' reviews</span></span></a></div><p class="map-card__address">' + addressLine + '</p></div><figure class="cw-trust-office-photo" data-cw-map-photo aria-hidden="false"><img src="' + attr(officePhoto) + '" alt="Clearwater Dentist office exterior at 1700 N McMullen Booth Rd" width="640" height="480" loading="lazy" decoding="async"></figure></div></div></div></section>';
}
function finalCta() {
  return '<section class="cta-band"><h2>Ready to schedule your visit?</h2><p>New patients are welcome. Request an appointment online, call our Clearwater office directly, or review financing and insurance options before your consultation with Dr. Nadia.</p><div class="hero-actions"><a class="btn primary" href="/contact-us">Request Appointment</a><a class="btn secondary" href="/financing">View Financing</a></div></section>';
}
function serviceDirectorySection() {
  const directory = pages.filter(page => ['service', 'finance', 'doctor', 'team', 'gallery'].includes(page.type) && page.route !== '/general-dentistry').map(page => ({ href: page.route, label: page.h1 || page.title }));
  return '<section id="service-directory" class="directory-band"><div class="section-head"><p class="eyebrow">Complete Page Directory</p><h2>Every treatment and patient page is reachable from here.</h2><p>This keeps the rebuild clean without turning the header into a giant menu.</p></div><div class="directory-grid">' + directory.map(item => '<a class="directory-link" href="' + attr(item.href) + '">' + e(item.label) + '</a>').join('') + '</div></section>';
}
function renderHome(page) {
  const video = site.assets.heroVideo;
  const poster = site.assets.heroPoster || site.assets.office;
  const heroInner = '<section class="home-hero" data-home-hero-parallax><div class="home-hero-media">' + (video ? '<video autoplay muted loop playsinline poster="' + attr(poster) + '"><source src="' + attr(video) + '" type="video/mp4"></video>' : '<img src="' + attr(poster) + '" alt="Clearwater Dentist office" loading="eager">') + '</div><div class="home-hero-copy"><p class="eyebrow">Family & Cosmetic Dentistry in Clearwater, FL</p><h1 class="cw-hero-welcome cw-welcome-glimmer">' + e(page.h1 || 'Welcome to the Office of Dr. Nadia') + '</h1><p class="cw-hero-smile cw-smile-glimmer">You Deserve a Beautiful Smile</p><p class="lede">Concierge dental care for patients who want calm visits, modern technology, and a smile they feel proud to show.</p><div class="hero-actions"><a class="btn primary" href="/contact-us">Request Appointment</a><a class="btn secondary" href="tel:' + attr(site.phoneTel) + '">Call ' + e(site.phoneDisplay) + '</a></div><div class="hero-pills"><a href="/emergency-dentistry-clearwater-fl">Same-day emergencies</a><a href="/anti-anxiety-dentist-office">Anti-anxiety care</a><a href="/financing">Flexible financing</a><a href="/before-and-after">Before & afters</a></div></div></section>';
  return '<div class="home-hero-stage">' + heroInner + homeLeadForm() + '</div>' + servicesSection() + whySection() + googleTrustSection() + beforeAfterSection(3) + videoCarouselSection() + finalCta();
}
function renderGeneric(page) {
  const sections = page.type === 'service' ? servicePageSections(page) : (page.sections || []);
  return hero(page, page.type === 'blogPost' ? 'Dental Blog' : page.type) + '<div class="content-layout"><article class="article-body">' + sections.map(sectionHtml).join('') + mediaHtml(page) + galleryHtml((page.images || []).slice(1), 8) + '</article>' + relatedServices(page.route) + '</div>' + (page.route === '/general-dentistry' ? serviceDirectorySection() : '');
}
function renderBlogIndex(page) {
  const posts = pages.filter(p => p.type === 'blogPost').map(post => '<article class="post-card"><a href="' + attr(post.route) + '">' + imageTag(post.heroImage || { src: site.assets.office, alt: post.h1 }, '', false) + '<span>Dental Blog</span><h2>' + e(post.h1) + '</h2><p>' + e(post.description || ((post.sections[0] && post.sections[0].body[0]) || 'Read more from Clearwater Dentist.')) + '</p></a></article>').join('');
  return hero(page, 'Dental Blog') + '<section class="post-grid">' + posts + '</section>';
}
function renderContact(page) {
  const addr = site.address || {};
  return hero(page, 'Contact') + '<section class="contact-grid"><div class="contact-panel"><h2>Contact the office</h2><p><strong>Phone</strong><br><a href="tel:' + attr(site.phoneTel) + '">' + e(site.phoneDisplay) + '</a></p><p><strong>Email</strong><br><a href="mailto:' + attr(site.email) + '">' + e(site.email) + '</a></p><p><strong>Address</strong><br>' + e(addr.street) + '<br>' + e(addr.city) + ', ' + e(addr.state) + ' ' + e(addr.zip) + '</p><a class="btn primary full" href="/contact-us">Request Appointment</a></div><form class="contact-form" action="#" method="post"><h2>Request an Appointment</h2><label>Name<input name="name" autocomplete="name" required></label><label>Phone<input name="phone" type="tel" autocomplete="tel" required></label><label>Email<input name="email" type="email" autocomplete="email"></label><label>How can we help?<textarea name="message" rows="5"></textarea></label><p class="fine-print">We do not accept State Insurances, HMOs, or Medicaid. This static form is ready to connect to the selected form endpoint.</p><button class="btn primary" type="submit">Send Request</button></form></section>';
}
function renderGallery(page) {
  const sections = galleryPageSections(page);
  return hero(page, 'Before & After') + '<div class="content-layout"><article class="article-body">' + sections.map(sectionHtml).join('') + '</article>' + relatedServices(page.route) + '</div>' + beforeAfterSection(3) + galleryHtml(page.images || [], 30);
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
function layout(page, main) {
  return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>' + e(page.title) + '</title><meta name="description" content="' + attr(page.description || site.tagline) + '"><link rel="canonical" href="' + attr(site.domain + page.route) + '"><link rel="stylesheet" href="/assets/css/styles.css"><link rel="stylesheet" href="/assets/css/overrides.css"><script src="/assets/js/main.js" defer></script>' + schema(page) + '</head><body class="page-' + attr(page.type) + '" ' + chatBodyAttrs() + '><a class="skip-link" href="#main">Skip to content</a>' + header(page) + '<main id="main">' + main + '</main>' + footer() + chatScriptTag() + '</body></html>';
}
function render(page) {
  if (page.type === 'home') return renderHome(page);
  if (page.type === 'blogIndex') return renderBlogIndex(page);
  if (page.type === 'contact') return renderContact(page);
  if (page.type === 'gallery') return renderGallery(page);
  return renderGeneric(page);
}
function sitemap() {
  const urls = pages.map(page => '<url><loc>' + site.domain + page.route + '</loc><changefreq>' + (page.type === 'blogPost' ? 'weekly' : 'monthly') + '</changefreq><priority>' + (page.route === '/' ? '1.0' : '0.7') + '</priority></url>').join('');
  return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">' + urls + '</urlset>\n';
}
async function main() {
  if (!DIST.startsWith(ROOT)) throw new Error('Unsafe dist path');
  await fs.rm(DIST, { recursive: true, force: true });
  await fs.mkdir(DIST, { recursive: true });
  await copyDir(PUBLIC, DIST);
  for (const page of pages) {
    const dir = outDir(page.route);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, 'index.html'), layout(page, render(page)), 'utf8');
  }
  await fs.writeFile(path.join(DIST, 'sitemap.xml'), sitemap(), 'utf8');
  await fs.writeFile(path.join(DIST, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + site.domain + '/sitemap.xml\n', 'utf8');
  await fs.writeFile(path.join(DIST, 'humans.txt'), 'Clean rebuild for Clearwater Dentist. Source generated in DentistClearwater v2.\n', 'utf8');
  console.log('Built ' + pages.length + ' pages into ' + DIST);
}
await main();
