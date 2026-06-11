const SITE_GEO = {
  latitude: 27.9835027,
  longitude: -82.7099534
};

const FAQ_PRIORITY_ROUTES = new Set([
  '/new-patient-faqs',
  '/sedation-dentistry-clearwater-fl',
  '/anti-anxiety-dentist-office',
  '/emergency-dentistry-clearwater-fl',
  '/dental-implants-clearwater-fl',
  '/financing',
  '/laser-dentistry',
  '/gum-disease-treatment',
  '/cosmetic-dentistry',
  '/Invisalign-service-clearwater-fl'
]);

function absUrl(site, path) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return site.domain.replace(/\/$/, '') + (path.startsWith('/') ? path : '/' + path);
}

function siteRoot(site) {
  return site.domain.replace(/\/$/, '') + '/';
}

function pageUrl(site, page) {
  return site.domain.replace(/\/$/, '') + page.route;
}

function stripHtml(text) {
  return String(text || '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function to24Hour(hour, minute, meridiem) {
  let h = Number(hour);
  const m = String(minute).padStart(2, '0');
  const mer = String(meridiem || '').toUpperCase();
  if (mer === 'PM' && h < 12) h += 12;
  if (mer === 'AM' && h === 12) h = 0;
  return String(h).padStart(2, '0') + ':' + m;
}

function openingHoursSpecs(hours) {
  const specs = [];
  for (const row of hours || []) {
    if (!row?.time || /closed/i.test(row.time)) continue;
    const days = [];
    const dayText = String(row.days || '').toLowerCase();
    if (/monday\s*-\s*friday/.test(dayText)) {
      days.push('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday');
    } else if (/monday/.test(dayText)) days.push('Monday');
    if (/tuesday/.test(dayText) && !days.length) days.push('Tuesday');
    if (/wednesday/.test(dayText) && !days.length) days.push('Wednesday');
    if (/thursday/.test(dayText) && !days.length) days.push('Thursday');
    if (/friday/.test(dayText) && !days.length) days.push('Friday');
    if (/saturday/.test(dayText)) days.push('Saturday');
    if (/sunday/.test(dayText)) days.push('Sunday');

    const match = String(row.time).match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match || !days.length) continue;
    specs.push({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: days,
      opens: to24Hour(match[1], match[2], match[3]),
      closes: to24Hour(match[4], match[5], match[6])
    });
  }
  return specs;
}

function parseFaqItem(text) {
  const clean = stripHtml(text);
  const match = clean.match(/^(.+?\?)\s+([\s\S]+)$/);
  if (!match) return null;
  const question = match[1].trim();
  const answer = match[2].trim();
  if (question.length < 8 || answer.length < 12) return null;
  return { question, answer };
}

function extractFaqs(page) {
  const seen = new Set();
  const faqs = [];
  for (const section of page.sections || []) {
    for (const item of section.items || []) {
      const parsed = parseFaqItem(item);
      if (!parsed || seen.has(parsed.question)) continue;
      seen.add(parsed.question);
      faqs.push(parsed);
    }
  }
  return faqs;
}

function isArticleStyleService(page) {
  return page.type === 'service' && /\/(how-|what-|why-|the-|taming-|needle-|dental-anxiety|havent-|questions-)/i.test(page.route);
}

function webpageType(page) {
  if (page.type === 'home') return 'WebPage';
  if (page.type === 'contact') return 'ContactPage';
  if (page.type === 'doctor') return 'ProfilePage';
  if (page.type === 'team') return 'AboutPage';
  if (page.type === 'gallery') return 'CollectionPage';
  if (page.type === 'blogIndex') return 'CollectionPage';
  if (page.type === 'policy') return 'WebPage';
  return 'WebPage';
}

function breadcrumbItems(site, page) {
  const root = siteRoot(site);
  const url = pageUrl(site, page);
  const items = [{ name: 'Home', item: root }];
  if (page.type === 'blogPost') {
    items.push({ name: 'Blog', item: root + 'blog' });
    items.push({ name: page.h1, item: url });
    return items;
  }
  if (page.type === 'blogIndex') {
    items.push({ name: 'Blog', item: url });
    return items;
  }
  if (page.type === 'serviceArea' && page.area) {
    items.push({ name: 'Service Areas', item: root + 'dentist-clearwater-fl' });
    items.push({ name: 'Dentist in ' + page.area.label, item: url });
    return items;
  }
  if (page.route !== '/') {
    items.push({ name: page.h1 || page.title, item: url });
  }
  return items;
}

function dentistNode(site, googleReviews) {
  const addr = site.address || {};
  const root = siteRoot(site);
  const sameAs = [site.googleReviewUrl, ...(site.social || []).map((s) => s.href)].filter(Boolean);
  const node = {
    '@type': ['Dentist', 'LocalBusiness'],
    '@id': root + '#dentist',
    name: site.name,
    url: root,
    telephone: site.phoneTel || site.phoneDisplay,
    email: site.email,
    image: absUrl(site, site.assets?.office || site.assets?.doctor),
    logo: absUrl(site, site.assets?.logo),
    description: site.tagline,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      streetAddress: addr.street,
      addressLocality: addr.city,
      addressRegion: addr.state,
      postalCode: addr.zip,
      addressCountry: addr.country || 'US'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: site.geo?.latitude ?? SITE_GEO.latitude,
      longitude: site.geo?.longitude ?? SITE_GEO.longitude
    },
    hasMap: site.googleReviewUrl,
    openingHoursSpecification: openingHoursSpecs(site.hours),
    sameAs,
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: site.phoneTel || site.phoneDisplay,
      contactType: 'customer service',
      areaServed: 'US-FL',
      availableLanguage: ['English']
    },
    employee: { '@id': root + '#physician' }
  };

  if (googleReviews?.rating && googleReviews?.reviewCount) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: String(googleReviews.rating),
      reviewCount: String(googleReviews.reviewCount),
      bestRating: '5',
      worstRating: '1'
    };
  }

  return node;
}

function organizationNode(site) {
  const root = siteRoot(site);
  return {
    '@type': 'Organization',
    '@id': root + '#organization',
    name: site.name,
    url: root,
    logo: absUrl(site, site.assets?.logo),
    email: site.email,
    telephone: site.phoneTel || site.phoneDisplay,
    sameAs: [site.googleReviewUrl, ...(site.social || []).map((s) => s.href)].filter(Boolean),
    founder: { '@id': root + '#physician' }
  };
}

function physicianNode(site) {
  const root = siteRoot(site);
  return {
    '@type': 'Physician',
    '@id': root + '#physician',
    name: 'Dr. Nadia Pokrovskaya',
    honorificSuffix: 'D.M.D.',
    jobTitle: 'Owner & Dentist',
    medicalSpecialty: 'Dentistry',
    url: root + 'meet-the-doctor',
    image: absUrl(site, site.assets?.doctor),
    worksFor: { '@id': root + '#dentist' },
    memberOf: { '@id': root + '#organization' }
  };
}

function websiteNode(site) {
  const root = siteRoot(site);
  return {
    '@type': 'WebSite',
    '@id': root + '#website',
    url: root,
    name: site.name,
    description: site.tagline,
    publisher: { '@id': root + '#organization' },
    inLanguage: 'en-US'
  };
}

function webpageNode(site, page) {
  const url = pageUrl(site, page);
  const root = siteRoot(site);
  const image = page.heroImage?.src || page.images?.[0]?.src || site.assets?.office;
  return {
    '@type': webpageType(page),
    '@id': url + '#webpage',
    url,
    name: page.title,
    description: page.description || site.tagline,
    isPartOf: { '@id': root + '#website' },
    about: { '@id': root + '#dentist' },
    primaryImageOfPage: image ? { '@type': 'ImageObject', url: absUrl(site, image) } : undefined,
    inLanguage: 'en-US'
  };
}

function breadcrumbNode(site, page) {
  const url = pageUrl(site, page);
  const items = breadcrumbItems(site, page);
  if (items.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    '@id': url + '#breadcrumb',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item
    }))
  };
}

function faqNode(site, page, faqs) {
  if (!faqs.length) return null;
  const url = pageUrl(site, page);
  return {
    '@type': 'FAQPage',
    '@id': url + '#faq',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };
}

function serviceNode(site, page) {
  if (page.type !== 'service' && page.type !== 'serviceArea') return null;
  if (isArticleStyleService(page)) return null;
  const url = pageUrl(site, page);
  const root = siteRoot(site);
  const node = {
    '@type': 'Service',
    '@id': url + '#service',
    name: page.h1 || page.title,
    description: page.description,
    url,
    provider: { '@id': root + '#dentist' },
    areaServed: {
      '@type': 'City',
      name: page.area?.city || site.address?.city || 'Clearwater',
      containedInPlace: {
        '@type': 'State',
        name: page.area?.state || site.address?.state || 'Florida'
      }
    }
  };
  if (page.heroImage?.src) {
    node.image = absUrl(site, page.heroImage.src);
  }
  return node;
}

function articleNode(site, page) {
  const url = pageUrl(site, page);
  const root = siteRoot(site);
  const image = page.heroImage?.src || page.images?.[0]?.src;
  if (page.type === 'blogPost') {
    return {
      '@type': 'BlogPosting',
      '@id': url + '#article',
      headline: page.h1 || page.title,
      description: page.description,
      url,
      image: image ? absUrl(site, image) : undefined,
      author: { '@id': root + '#physician' },
      publisher: { '@id': root + '#organization' },
      mainEntityOfPage: { '@id': url + '#webpage' },
      inLanguage: 'en-US',
      about: page.canonicalService?.href
        ? { '@type': 'Service', url: absUrl(site, page.canonicalService.href), name: page.canonicalService.label }
        : { '@id': root + '#dentist' }
    };
  }
  if (isArticleStyleService(page)) {
    return {
      '@type': 'Article',
      '@id': url + '#article',
      headline: page.h1 || page.title,
      description: page.description,
      url,
      image: image ? absUrl(site, image) : undefined,
      author: { '@id': root + '#physician' },
      publisher: { '@id': root + '#organization' },
      mainEntityOfPage: { '@id': url + '#webpage' },
      inLanguage: 'en-US'
    };
  }
  return null;
}

function videoNodes(site, page) {
  const url = pageUrl(site, page);
  const videos = [...(page.videos || [])];
  if (page.type === 'home' && site.assets?.heroVideo) {
    videos.push({
      src: site.assets.heroVideo,
      poster: site.assets.heroPoster,
      label: 'Welcome to Clearwater Dentist'
    });
  }
  return videos.map((video, index) => ({
    '@type': 'VideoObject',
    '@id': url + '#video-' + (index + 1),
    name: video.label || page.h1 || page.title,
    description: page.description || site.tagline,
    contentUrl: absUrl(site, video.src),
    thumbnailUrl: video.poster ? absUrl(site, video.poster) : undefined,
    uploadDate: '2024-01-01',
    publisher: { '@id': siteRoot(site) + '#organization' }
  }));
}

function reviewNodes(site, googleReviews) {
  const root = siteRoot(site);
  return (googleReviews?.reviews || []).slice(0, 5).map((review, index) => ({
    '@type': 'Review',
    '@id': root + '#review-' + (index + 1),
    author: {
      '@type': 'Person',
      name: review.name || 'Google reviewer'
    },
    reviewBody: review.quote,
    reviewRating: {
      '@type': 'Rating',
      ratingValue: '5',
      bestRating: '5',
      worstRating: '1'
    },
    itemReviewed: { '@id': root + '#dentist' }
  }));
}

function compactNode(node) {
  return JSON.parse(JSON.stringify(node, (_key, value) => (value === undefined ? undefined : value)));
}

export function buildSchemaGraph(page, site, googleReviews) {
  const graph = [
    dentistNode(site, googleReviews),
    organizationNode(site),
    physicianNode(site),
    websiteNode(site),
    webpageNode(site, page)
  ];

  const breadcrumb = breadcrumbNode(site, page);
  if (breadcrumb) graph.push(breadcrumb);

  const faqs = extractFaqs(page);
  if (faqs.length || FAQ_PRIORITY_ROUTES.has(page.route)) {
    const faq = faqNode(site, page, faqs);
    if (faq) {
      graph.push(faq);
      const webpage = graph.find((node) => node['@id'] === pageUrl(site, page) + '#webpage');
      if (webpage) webpage.mainEntity = { '@id': faq['@id'] };
    }
  }

  const service = serviceNode(site, page);
  if (service) {
    graph.push(service);
    const webpage = graph.find((node) => node['@id'] === pageUrl(site, page) + '#webpage');
    if (webpage && !webpage.mainEntity) webpage.mainEntity = { '@id': service['@id'] };
  }

  const article = articleNode(site, page);
  if (article) {
    graph.push(article);
    const webpage = graph.find((node) => node['@id'] === pageUrl(site, page) + '#webpage');
    if (webpage) webpage.mainEntity = { '@id': article['@id'] };
  }

  if (page.type === 'doctor') {
    const webpage = graph.find((node) => node['@id'] === pageUrl(site, page) + '#webpage');
    if (webpage) webpage.mainEntity = { '@id': siteRoot(site) + '#physician' };
  }

  if (page.type === 'home') {
    graph.push(...reviewNodes(site, googleReviews));
  }

  graph.push(...videoNodes(site, page));

  return {
    '@context': 'https://schema.org',
    '@graph': graph.map(compactNode)
  };
}

export function schemaScript(page, site, googleReviews) {
  const graph = buildSchemaGraph(page, site, googleReviews);
  return '<script type="application/ld+json">' + JSON.stringify(graph) + '</script>';
}
