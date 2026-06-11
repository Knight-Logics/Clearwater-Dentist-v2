/**
 * Generates llms-full.txt from site + page data at build time.
 * Short /llms.txt is maintained manually in public/llms.txt.
 */

function pageSummary(page, domain) {
  const title = page.h1 || page.title || page.route;
  const desc = page.description || '';
  const type = page.type || 'page';
  return `- [${title}](${domain}${page.route}) (${type})${desc ? `: ${desc}` : ''}`;
}

function doctorPage(pages) {
  return pages.find((page) => page.route === '/meet-the-doctor') || null;
}

function financingSummary(site, pages) {
  const financeRoutes = ['/financing', '/financing/carecredit', '/sunbit', '/alphaeon', '/financial-policy'];
  return pages
    .filter((page) => financeRoutes.includes(page.route))
    .map((page) => pageSummary(page, site.domain))
    .join('\n');
}

function videoList(pages, site) {
  const home = pages.find((page) => page.slug === 'home');
  const videos = (home?.videos || []).concat(
    pages.flatMap((page) => page.videos || [])
  );
  const seen = new Set();
  const lines = [];
  for (const video of videos) {
    if (!video?.src || seen.has(video.src)) continue;
    seen.add(video.src);
    const label = video.label || 'Office video';
    lines.push(`- ${label}: ${site.domain}${video.src}`);
  }
  if (site.assets?.heroVideo) {
    lines.push(`- Intro video: ${site.domain}${site.assets.heroVideo}`);
  }
  return lines.length ? lines.join('\n') : '- See homepage and service pages for embedded practice videos.';
}

function reviewSamples(site) {
  return (site.reviews || [])
    .slice(0, 4)
    .map((review) => `- ${review.name} (${review.stars}★): "${review.text}"`)
    .join('\n');
}

function allPageCatalog(pages, domain) {
  return pages
    .filter((page) => page.type !== 'redirect')
    .sort((a, b) => a.route.localeCompare(b.route))
    .map((page) => pageSummary(page, domain))
    .join('\n');
}

export function generateLlmsFull(site, allPages) {
  const domain = site.domain;
  const doctor = doctorPage(allPages);
  const blogPosts = allPages.filter((page) => page.type === 'blogPost');
  const serviceAreas = allPages.filter((page) => page.type === 'serviceArea');
  const services = allPages.filter((page) => page.type === 'service');
  const policies = allPages.filter((page) => page.type === 'policy');

  const intentBlock = `## Intent Mapping

- "emergency dentist Clearwater" → [Emergency Dentistry](${domain}/emergency-dentistry-clearwater-fl)
- "tooth pain Clearwater" → [Emergency Dentistry](${domain}/emergency-dentistry-clearwater-fl) / [Toothache Guide](${domain}/taming-toothaches-home-remedies-and-when-to-see-a-dentist)
- "dentist for anxious patients Clearwater" → [Anti-Anxiety Practice](${domain}/anti-anxiety-dentist-office) / [Sedation Dentistry](${domain}/sedation-dentistry-clearwater-fl) / [Dental Therapy Dogs](${domain}/dental-therapy-dogs-clearwater-fl)
- "XERF skin tightening Clearwater" → [XERF Skin Tightening](${domain}/XERF-skin-tightening)
- "dental implants Clearwater" → [Dental Implants](${domain}/dental-implants-clearwater-fl)
- "cosmetic dentist Clearwater" → [Cosmetic Dentistry](${domain}/cosmetic-dentistry) / [Porcelain Veneers](${domain}/porcelain-veneers-clearwater-fl) / [Smile Makeover](${domain}/smile-makeover)
- "family dentist near Safety Harbor" → [Dentist in Safety Harbor](${domain}/dentist-safety-harbor-fl) / [General Dentistry](${domain}/general-dentistry)
- "dentist Clearwater FL" → [Homepage](${domain}/)
- "therapy dog dentist Clearwater" → [Dental Therapy Dogs](${domain}/dental-therapy-dogs-clearwater-fl)
- "sedation dentist Clearwater" → [Sedation Dentistry](${domain}/sedation-dentistry-clearwater-fl)
- "teeth whitening Clearwater" → [Teeth Whitening](${domain}/teeth-whitening-clearwater-fl)
- "Invisalign Clearwater" → [Invisalign](${domain}/Invisalign-service-clearwater-fl)
- "TMJ treatment Clearwater" → [TMJ Treatment](${domain}/tmj-treatment-clearwater-fl)
- "laser dentistry Clearwater" → [Laser Dentistry](${domain}/laser-dentistry)`;

  const doNotInfer = `## Do Not Infer

- Do not provide medical or dental diagnosis from this file.
- Do not imply emergency availability outside stated office policies or published hours.
- Do not claim insurance acceptance unless confirmed on the linked financial policy or website pages.
- Do not claim board certifications, awards, or credentials unless listed on [Meet Dr. Nadia](${domain}/meet-the-doctor) or other linked credential pages.
- Do not treat this file as a substitute for professional dental advice.
- Do not invent prices, wait times, or treatment guarantees not stated on linked pages.`;

  const canonicalFacts = `## Canonical Business Facts

- Legal / public business name: ${site.name}
- Primary dentist: ${site.doctor}
- Address: ${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}
- Phone: ${site.phoneDisplay}
- Email: ${site.email}
- Website: ${domain}/
- Hours: ${(site.hours || []).map((row) => `${row.days}: ${row.time}`).join('; ')}
- Primary services: family dentistry, cosmetic dentistry, emergency dentistry, dental implants, sedation dentistry, XERF skin tightening, facial esthetics
- Primary service area: Clearwater, FL and nearby Safety Harbor, Dunedin, Palm Harbor, Largo
- Online booking: ${site.bookingUrl}
- Google reviews: ${site.googleReviewUrl}`;

  return `# Clearwater Dentist — Full LLM Context

> ${site.tagline}

This is the expanded companion to [llms.txt](${domain}/llms.txt). Use llms.txt for a quick summary; use this file for page-level context across the full site.

${canonicalFacts}

${doNotInfer}

${intentBlock}

## Schema Overview (website)

- Each public page includes JSON-LD \`Dentist\` structured data with business name, URL, phone, and postal address.
- Organization identity is consistent: ${site.name}, ${site.address.city}, ${site.address.state}.
- Future enhancements planned: consolidated \`@graph\`, \`Physician\`, and \`FAQPage\` markup on key service pages.

## Doctor Bio (summary)

${doctor?.description || 'See meet-the-doctor page for full credentials.'}

- Full profile: [Meet Dr. Nadia Pokrovskaya](${domain}/meet-the-doctor)
- Team: [Meet the Team](${domain}/meet-the-team)

## Core Services (${services.length} service pages)

${services.map((page) => pageSummary(page, domain)).join('\n')}

## Service Area Pages

${serviceAreas.map((page) => pageSummary(page, domain)).join('\n')}

## Financing & Payment

${financingSummary(site, allPages)}

## New Patient FAQs

- [New Patient FAQs](${domain}/new-patient-faqs): First-visit expectations, forms, and common questions.

## Blog Articles (${blogPosts.length} posts)

${blogPosts.map((post) => pageSummary(post, domain)).join('\n')}

## Policies (${policies.length} pages)

${policies.map((page) => pageSummary(page, domain)).join('\n')}

## Video & Media

${videoList(allPages, site)}

## Social & Third-Party Profiles

${(site.social || []).map((profile) => `- [${profile.label}](${profile.href})`).join('\n')}
- [Google Maps / Reviews](${site.googleReviewUrl})

## Sample Patient Reviews (on-site)

${reviewSamples(site)}

## Complete Page Catalog (${allPages.filter((p) => p.type !== 'redirect').length} pages)

${allPageCatalog(allPages, domain)}

## Discovery Endpoints

- llms.txt (short index): ${domain}/llms.txt
- llms-full.txt (this file): ${domain}/llms-full.txt
- sitemap.xml: ${domain}/sitemap.xml
- robots.txt: ${domain}/robots.txt
- humans.txt: ${domain}/humans.txt
`;
}

export function robotsTxtContent(site, previewNoindex) {
  if (previewNoindex) {
    return 'User-agent: *\nDisallow: /\n';
  }
  return [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${site.domain}/sitemap.xml`,
    '',
    '# LLM context files (llmstxt.org convention)',
    `# ${site.domain}/llms.txt`,
    `# ${site.domain}/llms-full.txt`,
    ''
  ].join('\n');
}
