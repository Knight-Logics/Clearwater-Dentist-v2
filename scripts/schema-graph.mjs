const SITE_GEO = {
  latitude: 27.9835027,
  longitude: -82.7099534
};

const DENTIST_KNOWS_ABOUT = [
  'Cosmetic dentistry',
  'Dental implants',
  'Sedation dentistry',
  'Emergency dentistry',
  'XERF skin tightening',
  'Anxiety-friendly dental care'
];

const VIDEO_SCHEMA_META = {
  '6qrr3vuprfkb7oix65k8-elmjyubzqwcgczf8kujh-2024-clearwater-dentist-intro-video-desktop-v-v-optimized': {
    id: 'video-welcome-intro',
    name: 'Meet Dr. Nadia Pokrovskaya at Clearwater Dentist',
    description: 'Dr. Nadia introduces Clearwater Dentist and explains the practice\'s comfort-focused approach to family, cosmetic, and emergency dentistry.',
    uploadDate: '2024-06-15T09:00:00-04:00',
    duration: 'PT1M45S',
    poster: '/assets/images/6qrr3vuprfkb7oix65k8-elmjyubzqwcgczf8kujh-2024-clearwater-dentist-intro-video-desktop-v-v2-0.webp'
  },
  '6qrr3vuprfkb7oix65k8-elmjyubzqwcgczf8kujh-2024-clearwater-dentist-intro-video-mobile': {
    id: 'video-welcome-intro-mobile',
    name: 'Meet Dr. Nadia Pokrovskaya at Clearwater Dentist',
    description: 'Dr. Nadia introduces Clearwater Dentist and explains the practice\'s comfort-focused approach to family, cosmetic, and emergency dentistry.',
    uploadDate: '2024-06-15T09:00:00-04:00',
    duration: 'PT1M45S',
    poster: '/assets/images/6qrr3vuprfkb7oix65k8-elmjyubzqwcgczf8kujh-2024-clearwater-dentist-intro-video-desktop-v-v2-0.webp'
  },
  'wzdvza5yrog6hu70zyqp-office-v': {
    id: 'video-office-tour',
    name: 'Office tour at Clearwater Dentist',
    description: 'Take a look inside the Clearwater Dentist office and the calm, patient-focused environment Dr. Nadia and her team created.',
    uploadDate: '2024-03-01T10:00:00-05:00',
    duration: 'PT2M30S',
    poster: '/assets/images/clearwater-dentist-clearwater-fl-front-of-dental-office-1920w.webp'
  },
  'clearwater-dentist-featured-video-therapy-dog': {
    id: 'video-therapy-dog',
    name: 'Dental therapy dogs at Clearwater Dentist',
    description: 'Learn how therapy dogs help anxious patients feel calmer during dental visits at Clearwater Dentist in Clearwater, FL.',
    uploadDate: '2024-04-01T10:00:00-04:00',
    duration: 'PT1M20S',
    poster: '/assets/images/485a7112-1920w.webp'
  },
  'e3msq9urtahssy3tq3kg-dr-nadia-interview-2024-edited-v': {
    id: 'video-dr-nadia-intro',
    name: 'Meet Dr. Nadia Pokrovskaya at Clearwater Dentist',
    description: 'Dr. Nadia Pokrovskaya discusses her background, philosophy of care, and what patients can expect at Clearwater Dentist.',
    uploadDate: '2024-05-01T10:00:00-04:00',
    duration: 'PT3M00S',
    poster: '/assets/images/clearwater-dentist-clearwater-fl-dr-nadia-pokrovskaya-2-739bdcb2-1920w.webp'
  },
  'urpldxkqiwfqgznlujv4-clearwater-dentistry-dr-nadia-2024-testimony-video-edited-2-v': {
    id: 'video-patient-testimony',
    name: 'Patient testimonial at Clearwater Dentist',
    description: 'A Clearwater Dentist patient shares their experience with the team and results of treatment.',
    uploadDate: '2024-05-15T10:00:00-04:00',
    duration: 'PT2M00S',
    poster: '/assets/images/clearwater-dentist-clearwater-fl-front-staff-parallax-1280w.webp'
  },
  'ywmr4zpsfw700hobq1fq-julia-patient-testimonial-v': {
    id: 'video-julia-testimonial',
    name: 'Julia patient testimonial at Clearwater Dentist',
    description: 'Patient Julia shares her experience at Clearwater Dentist.',
    uploadDate: '2024-05-15T10:00:00-04:00',
    duration: 'PT1M30S',
    poster: '/assets/images/clearwater-dentist-clearwater-fl-smile-lady-2880w.webp'
  },
  'do-you-need-a-dental-crown-v': {
    id: 'video-dental-crown',
    name: 'Do you need a dental crown?',
    description: 'Educational video from Clearwater Dentist about when a dental crown may be recommended.',
    uploadDate: '2024-02-01T10:00:00-05:00',
    duration: 'PT2M15S',
    poster: '/assets/images/clearwater-dentist-clearwater-fl-crowns-and-bridges-1920w.webp'
  },
  'scared-of-the-dentist-v': {
    id: 'video-scared-of-dentist',
    name: 'Scared of the dentist?',
    description: 'How Clearwater Dentist helps anxious patients feel more comfortable during dental care.',
    uploadDate: '2024-02-01T10:00:00-05:00',
    duration: 'PT2M00S',
    poster: '/assets/images/sedation-dentist-v2-0000000-1920w.webp'
  },
  'sedation-dentist-v': {
    id: 'video-sedation-dentist',
    name: 'Sedation dentistry at Clearwater Dentist',
    description: 'Overview of sedation options for patients with dental anxiety at Clearwater Dentist.',
    uploadDate: '2024-02-01T10:00:00-05:00',
    duration: 'PT2M30S',
    poster: '/assets/images/sedation-dentist-v2-0000000-1920w.webp'
  },
  'veneers-dentist-v': {
    id: 'video-veneers',
    name: 'Porcelain veneers at Clearwater Dentist',
    description: 'Learn about porcelain veneer treatment options at Clearwater Dentist.',
    uploadDate: '2024-02-01T10:00:00-05:00',
    duration: 'PT2M00S',
    poster: '/assets/images/clearwater-dentist-clearwater-fl-veneer-1920w.webp'
  },
  'gum-disease-v': {
    id: 'video-gum-disease',
    name: 'Gum disease treatment at Clearwater Dentist',
    description: 'Educational overview of gum disease treatment at Clearwater Dentist.',
    uploadDate: '2024-02-01T10:00:00-05:00',
    duration: 'PT2M00S',
    poster: '/assets/images/clearwater-dentist-clearwater-fl-gingivectomy-be1e5855-1920w.webp'
  },
  'gru61qftnm5yovvxsqhn-smile-makeover-v': {
    id: 'video-smile-makeover',
    name: 'Smile makeover at Clearwater Dentist',
    description: 'Overview of smile makeover planning and cosmetic dentistry at Clearwater Dentist.',
    uploadDate: '2024-02-01T10:00:00-05:00',
    duration: 'PT2M30S',
    poster: '/assets/images/clearwater-dentist-clearwater-fl-smile-makeover-ab960fc4-256c5e17-1920w.webp'
  }
};

let assetOriginOverride = null;

function absUrl(site, path) {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  const origin = (assetOriginOverride || site.domain).replace(/\/$/, '');
  return origin + (path.startsWith('/') ? path : '/' + path);
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

function areaServedNodes(site) {
  const areas = site.serviceAreas || [];
  const cities = areas.length
    ? areas.map((area) => area.city || area.label?.replace(/,.*$/, '').trim())
    : [site.address?.city || 'Clearwater'];
  return [...new Set(cities.filter(Boolean))].map((city) => ({
    '@type': 'City',
    name: city,
    containedInPlace: {
      '@type': 'State',
      name: site.address?.state || 'Florida'
    }
  }));
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

function isMoneyServicePage(page) {
  return page.type === 'service' && !isArticleStyleService(page) && page.route !== '/new-patient-faqs';
}

function webpageType(page) {
  if (page.type === 'home') return 'WebPage';
  if (page.type === 'contact') return 'ContactPage';
  if (page.type === 'doctor') return 'ProfilePage';
  if (page.type === 'team') return 'AboutPage';
  if (page.type === 'gallery') return 'CollectionPage';
  if (page.type === 'blogIndex') return 'CollectionPage';
  return 'WebPage';
}

function breadcrumbItems(site, page) {
  const root = siteRoot(site);
  const url = pageUrl(site, page);
  const items = [{ name: 'Home', item: root }];

  if (page.route === '/') return items;

  if (page.type === 'blogPost') {
    items.push({ name: 'Blog', item: root + 'blog' });
    items.push({ name: page.h1, item: url });
    return items;
  }

  if (page.type === 'blogIndex') {
    items.push({ name: 'Blog', item: url });
    return items;
  }

  if (page.type === 'service' || page.type === 'serviceArea') {
    items.push({ name: 'Services', item: root + 'general-dentistry' });
    items.push({ name: page.h1 || page.title, item: url });
    return items;
  }

  if (page.type === 'finance') {
    items.push({ name: 'Financing', item: root + 'financing' });
    if (page.route !== '/financing') {
      items.push({ name: page.h1 || page.title, item: url });
    }
    return items;
  }

  if (page.type === 'policy') {
    items.push({ name: page.h1 || page.title, item: url });
    return items;
  }

  items.push({ name: page.h1 || page.title, item: url });
  return items;
}

function dentistNode(site, googleReviews) {
  const addr = site.address || {};
  const root = siteRoot(site);
  const sameAs = [site.googleReviewUrl, ...(site.social || []).map((s) => s.href)].filter(Boolean);
  const node = {
    '@type': 'Dentist',
    '@id': root + '#dentist',
    name: site.name,
    url: root,
    telephone: site.phoneTel || site.phoneDisplay,
    email: site.email,
    image: absUrl(site, site.assets?.office || site.assets?.doctor),
    logo: absUrl(site, site.assets?.logo),
    description: site.tagline,
    priceRange: '$$',
    medicalSpecialty: ['Dentistry', 'Cosmetic dentistry', 'Emergency dentistry'],
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
    areaServed: areaServedNodes(site),
    sameAs,
    founder: { '@id': root + '#dr-nadia' },
    employee: { '@id': root + '#dr-nadia' }
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
    founder: { '@id': root + '#dr-nadia' }
  };
}

function personNode(site, page) {
  const root = siteRoot(site);
  const node = {
    '@type': 'Person',
    '@id': root + '#dr-nadia',
    name: 'Dr. Nadia Pokrovskaya, D.M.D.',
    jobTitle: 'Dentist',
    url: root + 'meet-the-doctor',
    image: absUrl(site, site.assets?.doctor),
    worksFor: { '@id': root + '#dentist' },
    knowsAbout: DENTIST_KNOWS_ABOUT
  };

  if (page?.type === 'doctor') {
    node.description = page.description || site.tagline;
    node.mainEntityOfPage = { '@id': pageUrl(site, page) + '#webpage' };
  }

  return node;
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
  const node = {
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

  if (page.type === 'doctor') {
    node.mainEntity = { '@id': root + '#dr-nadia' };
  }

  return node;
}

function breadcrumbNode(site, page) {
  const url = pageUrl(site, page);
  const items = breadcrumbItems(site, page);
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
  if (!isMoneyServicePage(page) && page.type !== 'serviceArea' && page.route !== '/new-patient-faqs') {
    if (page.type === 'finance') {
      const url = pageUrl(site, page);
      const root = siteRoot(site);
      return {
        '@type': 'Service',
        '@id': url + '#service',
        name: page.h1 || page.title,
        description: page.description,
        serviceType: 'Dental financing',
        url,
        provider: { '@id': root + '#dentist' },
        areaServed: areaServedNodes(site)
      };
    }
    return null;
  }

  if (isArticleStyleService(page)) return null;

  const url = pageUrl(site, page);
  const root = siteRoot(site);
  const node = {
    '@type': 'Service',
    '@id': url + '#service',
    name: page.h1 || page.title,
    description: page.description,
    serviceType: page.h1 || page.title,
    url,
    provider: { '@id': root + '#dentist' },
    areaServed: page.area
      ? [{
          '@type': 'City',
          name: page.area.city || page.area.label,
          containedInPlace: { '@type': 'State', name: page.area.state || 'Florida' }
        }]
      : areaServedNodes(site)
  };

  if (page.heroImage?.src) {
    node.image = absUrl(site, page.heroImage.src);
  }

  return node;
}

function placeNode(site, page) {
  if (page.type !== 'serviceArea' || !page.area) return null;
  const url = pageUrl(site, page);
  const addr = site.address || {};
  return {
    '@type': 'Place',
    '@id': url + '#place',
    name: 'Clearwater Dentist — ' + page.area.label,
    description: page.description,
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
    }
  };
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
      author: { '@id': root + '#dr-nadia' },
      publisher: { '@id': root + '#organization' },
      mainEntityOfPage: { '@id': url + '#webpage' },
      inLanguage: 'en-US',
      about: page.canonicalService?.href
        ? { '@type': 'Service', url: pageUrl(site, { route: page.canonicalService.href }), name: page.canonicalService.label }
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
      author: { '@id': root + '#dr-nadia' },
      publisher: { '@id': root + '#organization' },
      mainEntityOfPage: { '@id': url + '#webpage' },
      inLanguage: 'en-US'
    };
  }
  return null;
}

function videoSlug(src) {
  return String(src || '').split('/').pop()?.replace(/\.mp4$/i, '') || '';
}

function videoPoster(site, page, video, meta) {
  return video.poster || meta?.poster || site.assets?.heroPoster || page.heroImage?.src || page.images?.[0]?.src || site.assets?.office;
}

function videosForSchema(site, page) {
  if (page.type === 'home') {
    if (!site.assets?.heroVideo) return [];
    return [{
      src: site.assets.heroVideo,
      poster: site.assets.heroPoster,
      label: 'Welcome to Clearwater Dentist'
    }];
  }

  return (page.videos || []).slice(0, 2);
}

function videoNodes(site, page) {
  const pageBase = pageUrl(site, page);
  const root = siteRoot(site);

  return videosForSchema(site, page).map((video) => {
    const slug = videoSlug(video.src);
    const meta = VIDEO_SCHEMA_META[slug] || {};
    const poster = videoPoster(site, page, video, meta);
    const contentUrl = absUrl(site, video.src);
    const thumbnailUrl = poster ? absUrl(site, poster) : undefined;
    if (!contentUrl || !thumbnailUrl) return null;

    const videoId = meta.id || ('video-' + slug.slice(0, 24));
    const node = {
      '@type': 'VideoObject',
      '@id': pageBase + '#' + videoId,
      name: meta.name || video.label || page.h1 || page.title,
      description: meta.description || page.description || site.tagline,
      contentUrl,
      thumbnailUrl,
      uploadDate: meta.uploadDate || '2024-06-15T09:00:00-04:00',
      inLanguage: 'en-US',
      publisher: { '@id': root + '#organization' }
    };

    if (meta.duration) node.duration = meta.duration;
    if (video.embedUrl) node.embedUrl = video.embedUrl;

    return node;
  }).filter(Boolean);
}

function compactNode(node) {
  return JSON.parse(JSON.stringify(node));
}

function setWebpageMainEntity(graph, page, site, id) {
  const webpage = graph.find((node) => node['@id'] === pageUrl(site, page) + '#webpage');
  if (webpage) webpage.mainEntity = { '@id': id };
}

export function buildSchemaGraph(page, site, googleReviews, options = {}) {
  const previousAssetOrigin = assetOriginOverride;
  assetOriginOverride = options.assetOrigin || null;

  const graph = [
    dentistNode(site, googleReviews),
    organizationNode(site),
    personNode(site, page),
    websiteNode(site),
    webpageNode(site, page),
    breadcrumbNode(site, page)
  ];

  const faqs = extractFaqs(page);
  const faq = faqNode(site, page, faqs);
  if (faq) {
    graph.push(faq);
    setWebpageMainEntity(graph, page, site, faq['@id']);
  }

  const service = serviceNode(site, page);
  if (service) {
    graph.push(service);
    const webpage = graph.find((node) => node['@id'] === pageUrl(site, page) + '#webpage');
    if (webpage && !webpage.mainEntity) webpage.mainEntity = { '@id': service['@id'] };
  }

  const place = placeNode(site, page);
  if (place) graph.push(place);

  const article = articleNode(site, page);
  if (article) {
    graph.push(article);
    setWebpageMainEntity(graph, page, site, article['@id']);
  }

  const videos = videoNodes(site, page);
  graph.push(...videos);

  if (videos.length) {
    const webpage = graph.find((node) => node['@id'] === pageUrl(site, page) + '#webpage');
    if (webpage && !webpage.mainEntity) webpage.mainEntity = { '@id': videos[0]['@id'] };
  }

  const payload = {
    '@context': 'https://schema.org',
    '@graph': graph.map(compactNode)
  };

  assetOriginOverride = previousAssetOrigin;
  return payload;
}

export function schemaScript(page, site, googleReviews, options = {}) {
  const graph = buildSchemaGraph(page, site, googleReviews, options);
  return '<script type="application/ld+json">' + JSON.stringify(graph) + '</script>';
}
