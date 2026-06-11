(function () {
  'use strict';

  const PASSWORD_HASH = '6a420a9e1bd52c7147cbb5296366cb82a550468d0dcad9c9e3b24be631ce6685';
  const SESSION_KEY = 'cw-admin-session-v1';
  const STATE_KEY = 'cw-admin-demo-state-v1';
  const DATA_URL = '/assets/data/admin-dashboard.json';
  const LIVE_DATA_URL = '/assets/data/google-live.json';
  const NAV_SECTIONS = [
    {
      title: 'Reports',
      items: [
        { id: 'overview', label: 'Dashboard', hint: 'Google search & snapshots' },
        { id: 'seo', label: 'SEO / Search', hint: 'Real Search Console queries' }
      ]
    },
    {
      title: 'Website Manager',
      items: [
        { id: 'content', label: 'Page editor', hint: 'All pages — click to edit' },
        { id: 'pages', label: 'Pages', hint: '77-page launch & SEO board' },
        { id: 'videos', label: 'Videos', hint: 'Embeds, transcripts, schema' }
      ]
    },
    {
      title: 'Growth & CRM',
      items: [
        { id: 'referrals', label: 'Referral partners', hint: 'Find · Email · Track' },
        { id: 'mailbox', label: 'Outreach inbox', hint: 'Sent mail & CRM replies' },
        { id: 'leads', label: 'Leads & inquiries', hint: 'Calls, bookings, form interest' }
      ]
    },
    {
      title: 'Marketing',
      items: [
        { id: 'reviews', label: 'Reviews', hint: 'Reply drafts & request link' },
        { id: 'gbp', label: 'Google Business Profile', hint: 'Posts, checklist, stats' },
        { id: 'campaigns', label: 'Campaigns', hint: 'XERF, new patient pushes' }
      ]
    },
    {
      title: 'Settings',
      items: [
        { id: 'help', label: 'How to use', hint: 'Guide for every tab' },
        { id: 'compliance', label: 'Approvals', hint: 'Sign-off before publish' },
        { id: 'exports', label: 'Backup & export', hint: 'Save CRM & workspace data' }
      ]
    }
  ];
  const navItems = NAV_SECTIONS.flatMap(section => section.items);

  const app = document.getElementById('admin-app');
  const login = document.getElementById('admin-login');
  const loginForm = document.getElementById('admin-login-form');
  const loginInput = document.getElementById('admin-password');
  const loginMessage = document.getElementById('admin-login-message');
  const main = document.getElementById('admin-main');
  const nav = document.getElementById('admin-nav');
  const viewTitle = document.getElementById('view-title');
  const viewKicker = document.getElementById('view-kicker');
  const toastEl = document.getElementById('toast');
  const logoutButton = document.getElementById('logout-button');
  const exportButton = document.getElementById('export-button');
  const navToggle = document.getElementById('nav-toggle');

  let state = null;
  let currentView = 'overview';
  let overviewTab = 'analytics';
  let filters = { pageSearch: '', pageStatus: 'All', pageCategory: 'All', referralGroup: 'All', referralStatus: 'All', leadSource: 'All' };
  let referralFlowStep = 'find';
  let baseReferralSamples = [];
  let toastTimer = null;
  let visualEditor = null;
  let emailAgentPanel = null;

  const PARTNER_PACKAGES = {
    'Med spas': ['QR desk card', 'Co-branded brochure PDF', 'XERF + smile one-pager'],
    'Realtors': ['QR desk card', 'New mover welcome PDF', 'Emergency line card'],
    'Wedding planners': ['QR desk card', 'Cosmetic smile one-pager', 'Seasonal whitening offer'],
    'Employers': ['QR desk card', 'Benefits fair flyer', 'Family dentistry overview'],
    'Salons': ['QR desk card', 'Whitening before events handout'],
    'Gyms/wellness': ['QR desk card', 'Sports guard + emergency line card']
  };
  const LEGACY_REFERRAL_STATUS = {
    'need outreach': 'To Contact',
    prospect: 'Research',
    prospecting: 'Research',
    emailed: 'Contacted',
    'follow up': 'Nurture',
    'follow-up': 'Nurture',
    active: 'Active Partner',
    partner: 'Active Partner',
    declined: 'Closed'
  };
  const BUILT_IN_REFERRAL_SAMPLES = [
    {
      business: 'Skin NV Med Spa — Clearwater',
      group: 'Med spas',
      source: 'Manual research',
      city: 'Clearwater, FL',
      angle: 'Upscale med spa on US-19; event-season whitening demand.',
      status: 'Research',
      nextStep: 'Find GM name on site; check Google reviews for patient questions about teeth'
    },
    {
      business: 'Evolve Medical Aesthetics — Pinellas',
      group: 'Med spas',
      source: 'Manual research',
      contactEmail: 'hello@evolvemed.example',
      city: 'Pinellas County, FL',
      angle: 'Laser/skin focus — natural intro for XERF demo day with hygienist.',
      status: 'To Contact',
      nextStep: 'Preview intro email'
    },
    {
      business: 'Sand Key / Island Estates realtor group',
      group: 'Realtors',
      source: 'Manual research',
      contactEmail: 'partners@islandestates.example',
      angle: 'High-volume relocations — new movers need family dentist + emergency line.',
      status: 'Draft Email',
      nextStep: 'Draft new-mover welcome PDF for Dr. Nadia approval'
    }
  ];
  const reportTabs = [
    ['analytics', 'Analytics'],
    ['website', 'Website'],
    ['referrals', 'Referrals']
  ];

  const fallbackData = {
    generatedAt: new Date().toISOString(),
    site: { name: 'Clearwater Dentist', domain: 'https://www.clearwaterdentist.com', phoneDisplay: '(727) 285-8132', googleReviewUrl: '#', pageCount: 77, serviceCount: 77 },
    metrics: [{ label: 'Tracked pages', value: '77', delta: 'Demo content model' }],
    content: {}, leads: [], servicePages: [], seoOpportunities: [], gbp: { actions: [], checklist: [], postDraft: {} },
    reviews: [], videos: [], campaigns: [], referrals: [], approvals: [], complianceGuardrails: []
  };

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  }
  function attr(value) { return escapeHtml(value).replace(/`/g, '&#96;'); }
  function slug(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'item'; }
  async function sha256(value) {
    if (!window.crypto || !window.crypto.subtle) throw new Error('crypto-unavailable');
    const hash = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(hash)).map(byte => byte.toString(16).padStart(2, '0')).join('');
  }
  function storageGet(key) { try { return window.localStorage.getItem(key); } catch { return null; } }
  function storageSet(key, value) { try { window.localStorage.setItem(key, value); } catch {} }
  function sessionGet(key) { try { return window.sessionStorage.getItem(key); } catch { return null; } }
  function sessionSet(key, value) { try { window.sessionStorage.setItem(key, value); } catch {} }
  function sessionRemove(key) { try { window.sessionStorage.removeItem(key); } catch {} }

  function mergeState(base, saved) {
    if (!saved) return base;
    const merged = Object.assign({}, base, saved);
    merged.site = Object.assign({}, base.site || {}, saved.site || {});
    merged.content = Object.assign({}, base.content || {}, saved.content || {});
    if (saved.content && saved.content.images) {
      merged.content.images = Object.assign({}, (base.content || {}).images || {}, saved.content.images);
    }
    if (saved.content && saved.content.pageEdits) {
      merged.content.pageEdits = Object.assign({ text: {}, images: {}, buttons: {} }, base.content?.pageEdits || {}, saved.content.pageEdits);
      merged.content.pageEdits.text = Object.assign({}, (base.content?.pageEdits || {}).text, saved.content.pageEdits.text);
      merged.content.pageEdits.images = Object.assign({}, (base.content?.pageEdits || {}).images, saved.content.pageEdits.images);
      merged.content.pageEdits.buttons = Object.assign({}, (base.content?.pageEdits || {}).buttons, saved.content.pageEdits.buttons);
    }
    if (saved.content && saved.content.collections) {
      merged.content.collections = Object.assign({}, base.content?.collections || {}, saved.content.collections);
    }
    merged.gbp = Object.assign({}, base.gbp || {}, saved.gbp || {});
    ['metrics', 'leads', 'servicePages', 'seoOpportunities', 'reviews', 'videos', 'campaigns', 'approvals', 'complianceGuardrails'].forEach(key => {
      merged[key] = Array.isArray(saved[key]) ? saved[key] : (base[key] || []);
    });
    merged.referrals = mergeReferralPartners(base.referrals || [], saved && saved.referrals);
    if (!Array.isArray(merged.gbp.actions)) merged.gbp.actions = (base.gbp || {}).actions || [];
    if (!Array.isArray(merged.gbp.checklist)) merged.gbp.checklist = (base.gbp || {}).checklist || [];
    merged.gbp.postDraft = Object.assign({}, ((base.gbp || {}).postDraft || {}), ((saved.gbp || {}).postDraft || {}));
    if (!Array.isArray(merged.dataSources) || !merged.dataSources.length) merged.dataSources = base.dataSources || [];
    return merged;
  }

  function sanitizeReferrals(list) {
    return (list || [])
      .filter(item => item && typeof item === 'object' && String(item.business || '').trim())
      .map(normalizeReferralPartner);
  }

  function partnerSlug(business) {
    return String(business || 'partner')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'partner';
  }

  function partnerQrUrl(slug) {
    const site = (state && state.site && state.site.domain) || 'https://www.clearwaterdentist.com';
    const base = String(site).replace(/\/$/, '');
    return base + '/ref/' + (slug || 'partner');
  }

  function defaultPackageForGroup(group) {
    return PARTNER_PACKAGES[group] || ['QR desk card', 'Partner welcome PDF', 'Emergency line card'];
  }

  function normalizeReferralStatus(status) {
    const raw = String(status || 'Research').trim();
    const key = raw.toLowerCase();
    if (LEGACY_REFERRAL_STATUS[key]) return LEGACY_REFERRAL_STATUS[key];
    const canonical = ['Research', 'To Contact', 'Draft Email', 'Contacted', 'Nurture', 'Active Partner', 'Closed'];
    const match = canonical.find(item => item.toLowerCase() === key);
    return match || 'Research';
  }

  function normalizeReferralPartner(item) {
    if (!item || typeof item !== 'object') return item;
    item.status = normalizeReferralStatus(item.status);
    item.source = item.source || 'Manual research';
    item.slug = item.slug || partnerSlug(item.business);
    if (!Array.isArray(item.package) || !item.package.length) {
      item.package = defaultPackageForGroup(item.group);
    }
    item.materialsSent = Object.assign({
      qr: false,
      brochure: false,
      welcomeEmail: false
    }, item.materialsSent || {});
    item.qrUrl = item.qrUrl || partnerQrUrl(item.slug);
    return item;
  }

  function mergeReferralPartners(baseList, savedList) {
    const base = referralSeedList(baseList);
    if (!Array.isArray(savedList) || !savedList.length) return base;
    const merged = savedList.map(normalizeReferralPartner).filter(item => item && item.business);
    const seen = new Set(merged.map(item => String(item.business || '').toLowerCase()));
    base.forEach(sample => {
      const key = String(sample.business || '').toLowerCase();
      if (key && !seen.has(key)) merged.push(sample);
    });
    return merged.length ? merged : base;
  }

  function referralSeedList(baseList) {
    const fromJson = sanitizeReferrals(baseList || []);
    if (fromJson.length) return fromJson;
    return BUILT_IN_REFERRAL_SAMPLES.map(item => normalizeReferralPartner(Object.assign({}, item)));
  }

  function referralEmptyHintHtml(step, counts) {
    counts = counts || referralFlowCounts();
    const total = (state.referrals || []).length;
    if (!total) {
      return '<div class="referral-flow__empty-boot">' +
        '<p><strong>No referral partners saved in this browser.</strong> Load the Clearwater sample list or add your first lead below.</p>' +
        '<div class="referral-flow__empty-actions">' +
        '<button type="button" class="button button-primary" data-action="referral-restore-samples">Load sample partners</button>' +
        '<button type="button" class="button button-secondary" data-action="reset-demo">Reset entire demo</button>' +
        '</div></div>';
    }
    const hints = [];
    if (step !== 'find' && counts.find) hints.push('<button type="button" class="text-button" data-action="referral-flow-step" data-step="find">Step 1 — ' + counts.find + ' in research</button>');
    if (step !== 'email' && counts.email) hints.push('<button type="button" class="text-button" data-action="referral-flow-step" data-step="email">Step 2 — ' + counts.email + ' ready to email</button>');
    if (step !== 'track' && counts.track) hints.push('<button type="button" class="text-button" data-action="referral-flow-step" data-step="track">Step 3 — ' + counts.track + ' in pipeline</button>');
    if (!hints.length) return '<p class="report-empty">Nothing matches this step. Change <strong>Status</strong> on a row in the partner registry below, or add a new lead.</p>';
    return '<p class="referral-flow__empty-hint">Nothing in this step yet. ' + hints.join(' · ') + '</p>';
  }

  function friendlyGoogleSyncIssue(service, error) {
    const message = String(error || 'not connected');
    if (service === 'gsc' && message === 'invalid_grant') {
      return 'The long-lived GSC refresh token expired (common with OAuth apps in Testing mode — access tokens auto-refresh, but refresh tokens can die after ~7 days). Run <code>npm run sync:google:reauth</code> once to sign in in the browser, then sync again.';
    }
    if (service === 'gbp' && (/429|quota|rate.?limit/i.test(message))) {
      if (/quota_limit_value":"0"|quota_limit_value\\":\\"0"/i.test(message)) {
        return 'The CustomerAccounts Google Cloud project has <strong>0 requests/minute</strong> quota on Business Profile APIs — Google is blocking all GBP calls, not just account lookup. Request a quota increase in GCP for <code>mybusinessbusinessinformation.googleapis.com</code> and <code>businessprofileperformance.googleapis.com</code>, or set direct IDs in <code>.env.google.local</code> once quota is restored: <code>CLEARWATER_GBP_ACCOUNT_NAME=accounts/…</code> and <code>CLEARWATER_GBP_LOCATION_NAME=locations/…</code> (from business.google.com → your listing).';
      }
      return 'GBP account discovery is rate-limited. Run <code>npm run discover:gbp</code> or add <code>CLEARWATER_GBP_ACCOUNT_NAME</code> and <code>CLEARWATER_GBP_LOCATION_NAME</code> to <code>.env.google.local</code>.';
    }
    return escapeHtml(message.length > 180 ? message.slice(0, 177) + '…' : message);
  }
  function applyGoogleLiveData(data, live) {
    if (!live) return data;
    const merged = Object.assign({}, data);
    merged.googleLive = {
      syncedAt: live.syncedAt,
      gsc: live.gsc || null,
      gbp: live.gbp || null
    };
    if (live.dataSources?.length) {
      merged.dataSources = (merged.dataSources || []).map(source => {
        const liveSource = live.dataSources.find(item => item.label === source.label);
        return liveSource ? Object.assign({}, source, liveSource) : source;
      });
      for (const liveSource of live.dataSources) {
        if (!(merged.dataSources || []).some(source => source.label === liveSource.label)) {
          merged.dataSources.push(liveSource);
        }
      }
    }
    if (!live.gsc?.connected && !live.gbp?.connected) return merged;
    if (live.adminPatch?.seoOpportunities?.length) {
      merged.seoOpportunities = live.adminPatch.seoOpportunities;
    }
    if (live.adminPatch?.metrics?.length) {
      merged.metrics = live.adminPatch.metrics;
    }
    if (live.adminPatch?.gbpActions?.length && merged.gbp) {
      merged.gbp = Object.assign({}, merged.gbp, {
        property: live.gbp?.location?.title || merged.gbp.property,
        testProfile: `Live sync ${formatReportDate(live.syncedAt)}`,
        actions: live.adminPatch.gbpActions
      });
    }
    const traffic = live.adminPatch?.pageTraffic || {};
    if (Array.isArray(merged.servicePages) && Object.keys(traffic).length) {
      merged.servicePages = merged.servicePages.map(page => {
        const row = traffic[String(page.route || '').toLowerCase()];
        if (!row) return page;
        return Object.assign({}, page, {
          impressions: row.impressions,
          clicks: row.clicks,
          position: Number(row.position || page.position || 0).toFixed(1)
        });
      });
    }
    return merged;
  }
  async function loadBaseData() {
    try {
      const [dashboardRes, liveRes] = await Promise.all([
        fetch(DATA_URL, { cache: 'no-store' }),
        fetch(LIVE_DATA_URL, { cache: 'no-store' }).catch(() => null)
      ]);
      if (!dashboardRes.ok) throw new Error('bad-response');
      const data = await dashboardRes.json();
      let live = null;
      if (liveRes && liveRes.ok) {
        try { live = await liveRes.json(); } catch {}
      }
      if (!Array.isArray(data.reviews) || !data.reviews.length) {
        data.reviews = [{ id: 'review-demo', name: 'Google patient', rating: 5, text: 'Friendly team, comfortable visit, and helpful explanations.', source: 'Google', status: 'Needs Review', reply: 'Thank you for sharing your experience with our team.' }];
      }
      return applyGoogleLiveData(data, live);
    } catch {
      return fallbackData;
    }
  }

  async function reloadDashboardFromBase(options) {
    const opts = options || {};
    const base = await loadBaseData();
    let saved = null;
    if (!opts.fresh) {
      try { saved = JSON.parse(storageGet(STATE_KEY) || 'null'); } catch {}
    }
    state = mergeState(base, saved);
    baseReferralSamples = referralSeedList(base.referrals || []);
    state.referrals = sanitizeReferrals(state.referrals || []);
    if (!state.referrals.length) state.referrals = baseReferralSamples.map(item => normalizeReferralPartner(Object.assign({}, item)));
    referralFlowStep = opts.referralsStep || pickReferralFlowStep();
    bindOutreachModule();
    renderNav();
    if (opts.view) selectView(opts.view);
    else renderView();
    updateSidebarModePill();
  }

  async function initDashboard() {
    const base = await loadBaseData();
    let saved = null;
    try { saved = JSON.parse(storageGet(STATE_KEY) || 'null'); } catch {}
    state = mergeState(base, saved);
    baseReferralSamples = referralSeedList(base.referrals || []);
    state.referrals = sanitizeReferrals(state.referrals || []);
    if (!state.referrals.length) {
      state.referrals = baseReferralSamples.map(item => normalizeReferralPartner(Object.assign({}, item)));
    }
    referralFlowStep = pickReferralFlowStep();
    bindOutreachModule();
    renderNav();
    const legacyRedirects = {};
    const hashView = window.location.hash.replace('#', '').split('&')[0];
    const target = legacyRedirects[hashView] || hashView;
    if (target === 'overview' && ['glance', 'marketing', 'operations', 'seo'].includes(overviewTab)) overviewTab = 'analytics';
    selectView(navItems.some(item => item.id === target) ? target : 'overview');
    updateSidebarModePill();
  }

  function saveState(message) {
    storageSet(STATE_KEY, JSON.stringify(state));
    if (message) showToast(message);
    renderNav();
  }
  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
  }
  function unlock() {
    document.body.classList.remove('is-locked');
    login.hidden = true;
    login.setAttribute('aria-hidden', 'true');
    app.hidden = false;
    app.removeAttribute('aria-hidden');
    initDashboard();
  }
  function lock() {
    sessionRemove(SESSION_KEY);
    app.hidden = true;
    app.setAttribute('aria-hidden', 'true');
    login.hidden = false;
    login.removeAttribute('aria-hidden');
    document.body.classList.add('is-locked');
    if (loginInput) loginInput.focus();
  }
  function countForView(id) {
    if (!state) return '';
    const map = {
      pages: state.servicePages.length,
      seo: state.seoOpportunities.length,
      reviews: state.reviews.length,
      referrals: state.referrals.length,
      leads: state.leads.length,
      campaigns: state.campaigns.length,
      videos: state.videos.length,
      compliance: state.approvals.length
    };
    return map[id] || '';
  }
  function navMeta(viewId) {
    for (const section of NAV_SECTIONS) {
      const item = section.items.find(entry => entry.id === viewId);
      if (item) return { section: section.title, item };
    }
    return null;
  }
  function renderNav() {
    nav.innerHTML = NAV_SECTIONS.map((section, index) => {
      const title = '<p class="nav-section-title' + (index ? ' nav-section-title--spaced' : '') + '">' + escapeHtml(section.title) + '</p>';
      const buttons = section.items.map(item => {
        const count = countForView(item.id);
        return '<button class="nav-button' + (item.id === currentView ? ' is-active' : '') + '" type="button" data-view="' + item.id + '"><span class="nav-button__text"><span class="nav-button__label">' + escapeHtml(item.label) + '</span><span class="nav-button__hint">' + escapeHtml(item.hint || '') + '</span></span>' + (count ? '<span class="nav-count">' + escapeHtml(count) + '</span>' : '') + '</button>';
      }).join('');
      return title + buttons;
    }).join('');
  }
  function selectView(id) {
    currentView = id;
    const meta = navMeta(id) || navMeta('overview');
    const item = meta?.item || navItems[0];
    viewTitle.textContent = item.label;
    viewKicker.textContent = (meta?.section || 'Reports') + ' · clearwaterdentist.com';
    window.location.hash = id;
    document.body.classList.remove('admin-menu-open');
    navToggle.setAttribute('aria-expanded', 'false');
    renderNav();
    renderView();
    main.focus({ preventScroll: true });
  }
  function statusClass(value) {
    const normalized = slug(value);
    if (/live|ready|tracked|approved/.test(normalized)) return 'status-live';
    if (/need|review|queued|draft|imported|idea/.test(normalized)) return 'status-needs';
    if (/risk|block/.test(normalized)) return 'status-risk';
    return 'status-default';
  }
  function statusPill(value) { return '<span class="status-pill ' + statusClass(value) + '">' + escapeHtml(value || 'Open') + '</span>'; }
  function metricGrid(metrics, kind) {
    if (kind) return metricGridBadged(metrics, kind);
    return '<div class="metric-grid">' + (metrics || []).map(metric => '<article class="metric-card"><p class="metric-label">' + escapeHtml(metric.label) + '</p><p class="metric-value">' + escapeHtml(metric.value) + '</p><p class="metric-delta">' + escapeHtml(metric.delta || '') + '</p></article>').join('') + '</div>';
  }
  function panel(title, subtitle, body, action) {
    return '<section class="panel"><div class="section-header"><div><h2>' + escapeHtml(title) + '</h2>' + (subtitle ? '<p>' + escapeHtml(subtitle) + '</p>' : '') + '</div>' + (action || '') + '</div>' + body + '</section>';
  }
  function table(headers, rows, tableClass, colClasses) {
    const head = headers.map((h, i) => '<th' + (colClasses && colClasses[i] ? ' class="' + colClasses[i] + '"' : '') + '>' + escapeHtml(h) + '</th>').join('');
    return '<div class="table-scroll"><table class="data-table' + (tableClass ? ' ' + tableClass : '') + '"><thead><tr>' + head + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
  }
  function checkChips(page) {
    const checks = [['Title', page.titleDone], ['Meta', page.metaDone], ['H1', page.h1Done], ['FAQ', page.faqDone], ['Schema', page.schemaDone], ['Video', page.videoAdded]];
    return '<div class="checks">' + checks.map(check => '<span class="check-chip' + (check[1] ? ' is-on' : '') + '">' + escapeHtml(check[0]) + '</span>').join('') + '</div>';
  }
  function field(name, label, value, textarea) {
    return '<label class="field-block' + (textarea ? ' wide' : '') + '"><span>' + escapeHtml(label) + '</span>' + (textarea ? '<textarea name="' + attr(name) + '">' + escapeHtml(value || '') + '</textarea>' : '<input class="field" name="' + attr(name) + '" value="' + attr(value || '') + '">') + '</label>';
  }
  function formatReportDate(value) {
    if (!value) return 'Not set';
    try {
      return new Date(value).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return String(value);
    }
  }
  function countByField(items, key) {
    const counts = {};
    (items || []).forEach(item => {
      const label = String(item[key] || 'Unknown').trim() || 'Unknown';
      counts[label] = (counts[label] || 0) + 1;
    });
    return counts;
  }
  function referralPipelineCounts() {
    return countByField(state.referrals, 'status');
  }
  function referralsNeedingAction() {
    return (state.referrals || []).filter(item => !/contacted|partner|active|closed|won/i.test(String(item.status || ''))).length;
  }
  function overviewHeadlineMetrics() {
    const referrals = state.referrals || [];
    const totals = state.googleLive?.gsc?.totals;
    const pages = state.servicePages || [];
    const pagesLive = pages.filter(page => page.status === 'Live' || page.status === 'Approved').length;
    if (isGscLive() && totals) {
      return [
        { label: 'Google clicks (90d)', value: Number(totals.clicks || 0).toLocaleString('en-US'), delta: 'Real — Google Search' },
        { label: 'Google impressions (90d)', value: Number(totals.impressions || 0).toLocaleString('en-US'), delta: 'Real — Google Search' },
        { label: 'Avg search position', value: Number(totals.position || 0).toFixed(1), delta: 'Lower is better' },
        { label: 'Referral prospects', value: String(referrals.length), delta: referralsNeedingAction() + ' need outreach' }
      ];
    }
    return [
      { label: 'Website pages live', value: String(pagesLive), delta: pages.length + ' pages tracked' },
      { label: 'Search queries tracked', value: String((state.seoOpportunities || []).length), delta: isGscLive() ? 'Live Google data' : 'Run sync for live data' },
      { label: 'Referral prospects', value: String(referrals.length), delta: referralsNeedingAction() + ' need outreach' },
      { label: 'Pages needing SEO work', value: String(pages.filter(page => !/^(live|approved)$/i.test(String(page.status || ''))).length), delta: 'Team labels in Website tab' }
    ];
  }
  function statusBreakdownHtml(counts, total) {
    const order = ['Live', 'Approved', 'Draft Review', 'Needs SEO', 'Imported', 'Queued'];
    const entries = Object.entries(counts).sort((a, b) => {
      const left = order.indexOf(a[0]);
      const right = order.indexOf(b[0]);
      return (left === -1 ? 99 : left) - (right === -1 ? 99 : right);
    });
    return '<div class="report-breakdown">' + entries.map(([status, count]) => {
      const pct = total ? Math.round((count / total) * 100) : 0;
      return '<div class="report-breakdown__row"><div class="report-breakdown__head"><span>' + escapeHtml(status) + '</span><strong>' + count + '</strong></div><div class="report-breakdown__bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div></div>';
    }).join('') + '</div>';
  }
  function seoReadinessHtml() {
    const pages = state.servicePages || [];
    const total = pages.length || 1;
    const checks = [
      ['Title tags', page => page.titleDone],
      ['Meta descriptions', page => page.metaDone],
      ['H1 headings', page => page.h1Done],
      ['FAQ sections', page => page.faqDone],
      ['Schema markup', page => page.schemaDone],
      ['Video embeds', page => page.videoAdded]
    ];
    return '<div class="report-readiness">' + checks.map(([label, isDone]) => {
      const done = pages.filter(isDone).length;
      const pct = Math.round((done / total) * 100);
      return '<div class="report-readiness__row"><span>' + escapeHtml(label) + '</span><div class="report-readiness__track" aria-hidden="true"><span style="width:' + pct + '%"></span></div><strong>' + done + '/' + total + '</strong></div>';
    }).join('') + '</div>';
  }
  function attentionListHtml() {
    const items = [];
    const pagesPending = (state.servicePages || []).filter(page => !/^(live|approved)$/i.test(String(page.status || ''))).length;
    if (pagesPending) items.push({ label: pagesPending + ' pages still need launch review', view: 'pages' });
    const seoOpen = (state.seoOpportunities || []).filter(item => !/done|complete|closed/i.test(item.status)).length;
    if (seoOpen) items.push({ label: seoOpen + ' SEO opportunities to review', view: 'seo' });
    const referralOpen = referralsNeedingAction();
    if (referralOpen) items.push({ label: referralOpen + ' referral partners need outreach', view: 'referrals' });
    const leadsRecent = (state.leads || []).length;
    if (leadsRecent) items.push({ label: leadsRecent + ' patient inquiries in CRM log', view: 'leads' });
    const reviewsOpen = (state.reviews || []).filter(item => /need|review/i.test(item.status)).length;
    if (reviewsOpen) items.push({ label: reviewsOpen + ' Google review replies to approve', view: 'reviews' });
    if (!items.length) {
      return '<p class="report-empty">No urgent items right now. Use the sidebar when you want to dig into a specific area.</p>';
    }
    return '<div class="report-attention">' + items.map(item => '<button class="report-attention__item" type="button" data-view="' + item.view + '"><span>' + escapeHtml(item.label) + '</span><span class="report-attention__go">Open</span></button>').join('') + '</div>';
  }
  function referralSummaryHtml() {
    const counts = referralPipelineCounts();
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return '<p class="report-empty">No referral prospects yet. Open Referral CRM to add partners.</p>';
    return '<ul class="report-list">' + entries.map(([status, count]) => '<li><span>' + escapeHtml(status) + '</span><strong>' + count + '</strong></li>').join('') + '</ul>';
  }
  function defaultDataSources() {
    const gsc = isGscLive();
    const gbp = isGbpLive();
    return [
      { label: 'Google Search Console', status: gsc ? 'connected' : 'not-connected', detail: gsc ? 'Live search queries and page traffic from Google.' : 'Not loaded — analytics tab will show examples only.' },
      { label: 'Google Business Profile', status: gbp ? 'connected' : 'not-connected', detail: gbp ? 'Live profile metrics from Google.' : 'Not connected — map/call stats not available in this dashboard yet.' },
      { label: 'Growth & CRM', status: 'local', detail: 'Referral partners and patient inquiry log. Saves on this computer until you export a backup.' },
      { label: 'Website optimization board', status: 'local', detail: 'Launch status and SEO checklist for the 77-page rebuild.' },
      { label: 'Google Analytics 4', status: 'not-connected', detail: 'Website visitor and conversion analytics — not wired in yet.' }
    ];
  }
  function sourceStatusClass(status) {
    const value = slug(status);
    if (value === 'connected' || value === 'live') return 'source-live';
    if (value === 'local' || value === 'partial') return 'source-local';
    if (value === 'demo') return 'source-demo';
    return 'source-off';
  }
  function sourceStatusLabel(status) {
    const map = {
      connected: 'Live connection',
      live: 'Live connection',
      local: 'Local workspace',
      partial: 'Partially real',
      demo: 'Demo data',
      'not-connected': 'Not connected'
    };
    return map[status] || status;
  }
  function isGscLive() { return Boolean(state?.googleLive?.gsc?.connected); }
  function isGbpLive() { return Boolean(state?.googleLive?.gbp?.connected); }
  function dataChip(type, label) {
    const map = { live: 'source-live', local: 'source-local', demo: 'source-demo', missing: 'source-off' };
    return '<span class="data-chip ' + (map[type] || 'source-off') + '"><span class="data-chip__dot" aria-hidden="true"></span>' + escapeHtml(label) + '</span>';
  }
  function dataLegendHtml() {
    return '<div class="data-legend"><p class="data-legend__label">Key</p>' + dataChip('live', 'Real from Google') + dataChip('local', 'Team notes (saved here)') + dataChip('demo', 'Example / planning') + dataChip('missing', 'Not connected') + '</div>';
  }
  function truthList(items, empty) {
    if (!items.length) return '<p class="truth-panel__empty">' + escapeHtml(empty) + '</p>';
    return '<ul class="truth-panel__list">' + items.map(item => '<li>' + item + '</li>').join('') + '</ul>';
  }
  function clientTruthPanelHtml() {
    const gsc = isGscLive();
    const gbp = isGbpLive();
    const synced = state.googleLive?.syncedAt;
    const totals = state.googleLive?.gsc?.totals;
    const real = [];
    if (gsc && totals) {
      real.push('<strong>Google Search</strong> — real numbers from Google, last updated ' + escapeHtml(formatReportDate(synced)) + '. About <strong>' + Number(totals.clicks || 0).toLocaleString('en-US') + ' clicks</strong> and <strong>' + Number(totals.impressions || 0).toLocaleString('en-US') + ' impressions</strong> in the last ~90 days.');
      real.push('Search terms people use to find the office, and which website pages get traffic.');
    } else if (gsc) {
      real.push('<strong>Google Search</strong> — connected, last updated ' + escapeHtml(formatReportDate(synced)) + '.');
    }
    if (gbp) {
      real.push('<strong>Google Business Profile</strong> — real map views, calls, and website clicks from Google.');
    }
    real.push('<strong>Review link</strong> — the official Google link patients can use to leave a review.');
    const workspace = [
      '<strong>Growth &amp; CRM</strong> — referral partners plus leads/inquiries (calls, bookings, forms) your team logs here',
      '<strong>Website Manager</strong> — content drafts, page launch status, and video readiness for clearwaterdentist.com',
      'Review &amp; GBP drafts — <strong>nothing posts automatically</strong>'
    ];
    const missing = [];
    if (!gbp) {
      missing.push('<strong>Google Business Profile stats</strong> (calls from Maps, map views) — waiting on Google API approval. Does not reset nightly.');
    }
    if (!gsc) {
      missing.push('<strong>Google Search stats</strong> — not loaded on this computer yet.');
    }
    missing.push('<strong>Phone calls &amp; form submissions</strong> from the live website — not in this dashboard yet');
    missing.push('<strong>Google Analytics</strong> visitor counts — not wired in yet');
    const headline = gsc
      ? 'Organized like your Whistle Stop admin: Reports up top, website tools together, CRM for partners and patient inquiries.'
      : 'Reports, website tools, and CRM are grouped in the sidebar. Run Google sync to load live search analytics.';
    return '<section class="truth-panel" aria-label="What this dashboard does"><div class="truth-panel__intro"><h2>What this dashboard is for</h2><p>' + headline + '</p></div><div class="truth-panel__grid"><article class="truth-panel__card truth-panel__card--real"><h3>Real from Google</h3>' + truthList(real, 'Search analytics not loaded yet.') + '</article><article class="truth-panel__card truth-panel__card--workspace"><h3>Your team\'s tools</h3>' + truthList(workspace, '') + '</article><article class="truth-panel__card truth-panel__card--missing"><h3>Coming later</h3>' + truthList(missing, 'All core items connected.') + '</article></div></section>';
  }
  function screenTruthLine(viewId) {
    const gsc = isGscLive();
    const lines = {
      overview: '',
      seo: gsc
        ? 'Every row is <strong>real Google Search data</strong> for clearwaterdentist.com.'
        : 'Rows are examples until Google Search sync runs.',
      content: '<strong>Website Manager</strong> — click the homepage preview to edit copy and images. Saves as a draft on this computer until published.',
      pages: gsc
        ? 'Traffic numbers are <strong>real from Google</strong>. Launch status saves in your workspace.'
        : 'Traffic numbers are placeholders until sync. Launch status saves in your workspace.',
      videos: '<strong>Website Manager</strong> — track which videos are embedded and schema-ready on the site.',
      referrals: 'Three steps: <strong>find leads</strong> → <strong>email them</strong> → <strong>track partners</strong> who respond.',
      mailbox: '<strong>Partnership mail</strong> — single-mailbox Email Agent view. Demo uses <strong>support@knightlogics.com</strong>; connects live when Email Agent runs on port 5100.',
      leads: '<strong>Growth &amp; CRM</strong> — patient inquiry log (phone taps, booking clicks, forms). Will connect to call tracking later; log manually for now.',
      reviews: 'The <strong>review link is real</strong>. Review cards are drafts until posted in Google.',
      gbp: isGbpLive()
        ? 'Live Google Business Profile metrics where connected; drafts are team notes.'
        : 'GBP performance placeholders until API connects. Checklist and post drafts are team notes.',
      campaigns: 'Planned marketing pushes (XERF, new patients, etc.) — scheduling only, not live ad data.',
      compliance: 'Internal sign-off queue before website, GBP, or review content goes live.',
      exports: 'Download a backup of CRM, website notes, and workspace data.',
      help: 'Full instructions for every sidebar tab — expand sections below or use the guides at the top of each screen.'
    };
    const text = lines[viewId];
    return text ? '<p class="screen-truth-line">' + text + '</p>' : '';
  }
  function viewDataSources(viewId) {
    const gsc = isGscLive();
    const gbp = isGbpLive();
    const map = {
      overview: [
        gsc ? ['live', 'Search Console queries & page traffic'] : ['missing', 'Search Console (run sync)'],
        gbp ? ['live', 'Business Profile metrics'] : ['missing', 'Business Profile API'],
        ['local', 'Page launch status & SEO checkboxes'],
        ['demo', 'Leads, campaigns, referrals, review drafts'],
        ['missing', 'Google Analytics 4']
      ],
      leads: [['local', 'Events you log here'], ['demo', 'Sample attribution rows'], ['missing', 'GA4, call tracking, forms']],
      content: [['local', 'Draft copy in browser'], ['demo', 'Not published to live site'], ['missing', 'Production CMS']],
      pages: [
        gsc ? ['live', 'GSC impressions / clicks per page'] : ['demo', 'GSC traffic columns (sample until sync)'],
        ['local', 'Status, keywords, SEO checkboxes'],
        ['missing', 'Live page editor / CMS']
      ],
      seo: [
        gsc ? ['live', 'Search Console query board'] : ['demo', 'Query rows are sample data'],
        ['missing', 'Bing Webmaster, rank trackers']
      ],
      gbp: [
        gbp ? ['live', 'Profile performance metrics'] : ['demo', 'Performance numbers are sample'],
        ['local', 'Checklist & post drafts'],
        ['missing', 'Live GBP posting API']
      ],
      reviews: [['partial', 'Google review request link is real'], ['demo', 'Review cards & reply drafts'], ['missing', 'Live review sync feed']],
      videos: [['live', 'Video files from site build'], ['local', 'Transcript / embed / schema flags'], ['missing', 'YouTube Studio API']],
      campaigns: [['demo', 'Campaign calendar planning'], ['local', 'Saved in browser'], ['missing', 'Ad platforms']],
      referrals: [['demo', 'Outreach prospect list'], ['local', 'Saved in browser'], ['missing', 'CRM / email integration']],
      compliance: [['demo', 'Approval queue'], ['local', 'Saved in browser'], ['missing', 'Production workflow']],
      exports: [['local', 'Export / import browser workspace'], ['demo', 'Demo-only — not production data']]
    };
    return (map[viewId] || map.overview).map(([type, label]) => {
      const chipType = type === 'partial' ? 'local' : type;
      return [chipType, label];
    });
  }
  function tabGuideHtml(viewId) {
    if (!window.CWTabGuides || typeof window.CWTabGuides.renderGuide !== 'function') return '';
    const open = viewId !== 'content';
    return window.CWTabGuides.renderGuide(viewId, { open });
  }
  function viewDataSourceHtml(viewId) {
    return (viewId === 'overview' ? clientTruthPanelHtml() : '') + screenTruthLine(viewId);
  }
  function updateSidebarModePill() {
    const pill = document.querySelector('.mode-pill');
    if (!pill) return;
    if (isGscLive() && isGbpLive()) {
      pill.textContent = 'Google: all live';
      pill.className = 'mode-pill mode-pill--live';
    } else if (isGscLive()) {
      pill.textContent = 'Google: search only';
      pill.className = 'mode-pill mode-pill--partial';
    } else if (isGbpLive()) {
      pill.textContent = 'Google: profile only';
      pill.className = 'mode-pill mode-pill--partial';
    } else {
      pill.textContent = 'Planning mode';
      pill.className = 'mode-pill';
    }
  }
  function metricCard(metric, kind) {
    const badge = kind === 'live'
      ? '<span class="metric-badge metric-badge--live">Real</span>'
      : kind === 'demo'
        ? '<span class="metric-badge metric-badge--demo">Example</span>'
        : '<span class="metric-badge metric-badge--local">Team note</span>';
    return '<article class="metric-card metric-card--' + kind + '">' + badge + '<p class="metric-label">' + escapeHtml(metric.label) + '</p><p class="metric-value">' + escapeHtml(metric.value) + '</p><p class="metric-delta">' + escapeHtml(metric.delta || '') + '</p></article>';
  }
  function metricGridBadged(metrics, kind) {
    return '<div class="metric-grid">' + (metrics || []).map(metric => metricCard(metric, kind)).join('') + '</div>';
  }
  function liveSyncBannerHtml() {
    return '';
  }
  function dataSourcesPanelHtml() {
    const sources = (state.dataSources && state.dataSources.length) ? state.dataSources : defaultDataSources();
    const rows = sources.map(source => '<tr><td><span class="row-title">' + escapeHtml(source.label) + '</span></td><td><span class="source-pill ' + sourceStatusClass(source.status) + '">' + escapeHtml(sourceStatusLabel(source.status)) + '</span></td><td>' + escapeHtml(source.detail) + '</td></tr>');
    return panel('Connection status (plain English)', 'Quick reference for what is hooked up vs still planning.', table(['Source', 'Status', 'Notes'], rows));
  }
  function reportTabsHtml(active) {
    return '<div class="report-tabs" role="tablist" aria-label="Report sections">' + reportTabs.map(([id, label]) => '<button type="button" class="report-tab' + (id === active ? ' is-active' : '') + '" role="tab" aria-selected="' + (id === active ? 'true' : 'false') + '" data-report-tab="' + id + '">' + escapeHtml(label) + '</button>').join('') + '</div>';
  }
  function pagesNeedingWorkRows(limit) {
    return (state.servicePages || []).filter(page => !/^(live|approved)$/i.test(String(page.status || ''))).slice(0, limit || 12).map(page => '<tr><td><span class="row-title">' + escapeHtml(page.title) + '</span><small>' + escapeHtml(page.route) + '</small></td><td>' + escapeHtml(page.category) + '</td><td>' + statusPill(page.status) + '</td><td>' + checkChips(page) + '</td></tr>');
  }
  function categoryBreakdownHtml() {
    const counts = countByField(state.servicePages, 'category');
    const total = (state.servicePages || []).length || 1;
    return statusBreakdownHtml(counts, total);
  }
  function renderOverviewAnalytics() {
    const pages = state.servicePages || [];
    const statusCounts = countByField(pages, 'status');
    const metricKind = isGscLive() ? 'live' : 'local';
    const topQueries = (state.seoOpportunities || []).slice().sort((a, b) => Number(b.clicks || 0) - Number(a.clicks || 0)).slice(0, 8);
    const queryRows = topQueries.map(item => '<tr><td><span class="row-title">' + escapeHtml(item.query) + '</span></td><td>' + escapeHtml(item.clicks) + '</td><td>' + escapeHtml(item.impressions) + '</td><td>' + escapeHtml(item.position) + '</td></tr>');
    return metricGridBadged(overviewHeadlineMetrics(), metricKind) + '<div class="split-grid">' + panel('What needs attention', 'Action items for your team.', attentionListHtml()) + panel('Referral pipeline', 'Partner outreach status — open Referral CRM to edit.', referralSummaryHtml(), '<button class="button button-secondary" type="button" data-view="referrals">Open Referral CRM</button>') + '</div><div class="split-grid">' + panel(isGscLive() ? 'Top searches (real)' : 'Top searches (examples)', isGscLive() ? 'What people typed into Google to find the site.' : 'Run sync to replace with real Google data.', queryRows.length ? table(['Search term', 'Clicks', 'Impr.', 'Pos.'], queryRows) : '<p class="report-empty">No search rows loaded.</p>', '<button class="button button-secondary" type="button" data-view="seo">Full search report</button>') + panel('Website launch summary', 'How many pages are marked live vs in progress.', statusBreakdownHtml(statusCounts, pages.length), '<button class="text-button" type="button" data-report-tab="website">Website tab</button>') + '</div>' + dataSourcesPanelHtml();
  }
  function renderOverviewReferrals() {
    const referrals = state.referrals || [];
    const groups = countByField(referrals, 'group');
    const rows = referrals.slice(0, 12).map(item => '<tr><td><span class="row-title">' + escapeHtml(item.business) + '</span><small>' + escapeHtml(item.group) + '</small></td><td>' + escapeHtml(item.angle) + '</td><td>' + statusPill(item.status) + '</td><td>' + escapeHtml(item.nextStep) + '</td></tr>');
    return metricGridBadged([
      { label: 'Total prospects', value: String(referrals.length), delta: 'In Referral CRM' },
      { label: 'Need outreach', value: String(referralsNeedingAction()), delta: 'To contact / research / draft' },
      { label: 'Partner groups', value: String(Object.keys(groups).length), delta: 'Med spas, realtors, etc.' },
      { label: 'Contacted+', value: String(referrals.filter(item => /contacted|partner|active/i.test(String(item.status || ''))).length), delta: 'In conversation or active' }
    ], 'local') + panel('Referral pipeline snapshot', 'Summary only — use Referral CRM in the sidebar to add partners and update status.', rows.length ? table(['Business', 'Angle', 'Status', 'Next step'], rows) : '<p class="report-empty">No prospects yet.</p>', '<button class="button button-primary" type="button" data-view="referrals">Open Referral CRM</button>') + panel('By partner type', 'Where outreach focus is grouped.', statusBreakdownHtml(groups, referrals.length || 1));
  }
  function renderOverviewWebsite() {
    const pages = state.servicePages || [];
    const typeCounts = countByField(pages, 'pageType');
    const workRows = pagesNeedingWorkRows(15);
    return '<div class="split-grid">' + panel('Launch status by page', 'How many pages are marked live, imported, in draft review, or need SEO work.', statusBreakdownHtml(countByField(pages, 'status'), pages.length), '<button class="button button-secondary" type="button" data-view="pages">Open page board</button>') + panel('SEO readiness checklist', 'Counts of pages with titles, meta, H1, FAQ, schema, and video in place.', seoReadinessHtml(), '<button class="button button-secondary" type="button" data-view="pages">Edit checks</button>') + '</div><div class="split-grid">' + panel('Pages by category', 'How the rebuild is grouped (services, policies, blog, etc.).', categoryBreakdownHtml()) + panel('Pages by type', 'Content model types across the site.', statusBreakdownHtml(typeCounts, pages.length)) + '</div>' + panel('Pages still needing work', 'First 15 routes that are not marked Live or Approved.', workRows.length ? table(['Page', 'Category', 'Status', 'Checks'], workRows) : '<p class="report-empty">Every tracked page is marked live or approved.</p>');
  }
  function renderOverviewSeo() {
    const seo = (state.seoOpportunities || []).slice().sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0));
    const seoRows = seo.slice(0, 15).map(item => '<tr><td><span class="row-title">' + escapeHtml(item.query) + '</span><small>' + escapeHtml(item.page) + '</small></td><td>' + escapeHtml(item.impressions) + '</td><td>' + escapeHtml(item.clicks) + '</td><td>' + escapeHtml(item.ctr || '—') + '</td><td>' + escapeHtml(item.position) + '</td><td>' + escapeHtml(item.action) + '</td><td>' + statusPill(item.status) + '</td></tr>');
    const imprTotal = seo.reduce((sum, item) => sum + Number(item.impressions || 0), 0);
    const clickTotal = seo.reduce((sum, item) => sum + Number(item.clicks || 0), 0);
    const pageSeoRows = (state.servicePages || []).slice().sort((a, b) => Number(b.impressions || 0) - Number(a.impressions || 0)).slice(0, 10).map(page => '<tr><td><span class="row-title">' + escapeHtml(page.title) + '</span><small>' + escapeHtml(page.route) + '</small></td><td>' + escapeHtml(page.impressions) + '</td><td>' + escapeHtml(page.clicks) + '</td><td>' + escapeHtml(page.position) + '</td><td>' + escapeHtml(page.targetKeyword) + '</td></tr>');
    const gscTotals = state.googleLive?.gsc?.totals;
    const metrics = isGscLive() && gscTotals ? [
      { label: 'Tracked queries', value: String(seo.length), delta: 'Live Search Console' },
      { label: 'GSC impressions (90d)', value: Number(gscTotals.impressions || 0).toLocaleString('en-US'), delta: 'Live API total' },
      { label: 'GSC clicks (90d)', value: Number(gscTotals.clicks || 0).toLocaleString('en-US'), delta: 'CTR ' + (gscTotals.ctr ? (Number(gscTotals.ctr) * 100).toFixed(2) + '%' : '—') },
      { label: 'Avg position (90d)', value: Number(gscTotals.position || 0).toFixed(1), delta: 'Live Search Console' }
    ] : [
      { label: 'Tracked queries', value: String(seo.length), delta: 'Demo Search Console board' },
      { label: 'Demo impressions', value: imprTotal.toLocaleString('en-US'), delta: 'Sum of sample query rows' },
      { label: 'Demo clicks', value: clickTotal.toLocaleString('en-US'), delta: 'Not live GSC yet' },
      { label: 'Pages with keywords', value: String((state.servicePages || []).filter(page => page.targetKeyword).length), delta: 'Editable in Page Control' }
    ];
    const liveMeta = state.googleLive;
    let liveNote;
    if (liveMeta?.gsc?.connected) {
      liveNote = '<section class="panel report-callout report-callout--live"><strong>Real Google Search data</strong> — ' + escapeHtml(liveMeta.gsc.period?.startDate || '') + ' through ' + escapeHtml(liveMeta.gsc.period?.endDate || '') + '. These are the same kinds of numbers you would see in Google Search Console.</section>';
    } else if (liveMeta?.syncedAt) {
      liveNote = '<section class="panel report-callout report-callout--warn"><strong>Google Search is not loaded.</strong> The table below shows examples only.</section>';
    } else {
      liveNote = '<section class="panel report-callout"><strong>Google Search is not loaded yet.</strong> The table below shows examples only.</section>';
    }
    const metricKind = isGscLive() ? 'live' : 'demo';
    return liveNote + metricGridBadged(metrics, metricKind) + '<div class="split-grid">' + panel('Top search queries', isGscLive() ? 'Real — pulled from Google Search.' : 'Examples only — not real search data.', seoRows.length ? table(['Query', 'Impr.', 'Clicks', 'CTR', 'Pos.', 'Action', 'Status'], seoRows, 'data-table--seo', ['', '', '', 'col-ctr', '', 'col-action', '']) : '<p class="report-empty">No SEO rows loaded.</p>', '<button class="button button-secondary" type="button" data-view="seo">Open SEO board</button>') + panel('Top pages by traffic', isGscLive() ? 'Real — pulled from Google Search.' : 'Examples only — not real traffic.', pageSeoRows.length ? table(['Page', 'Impr.', 'Clicks', 'Pos.', 'Keyword'], pageSeoRows) : '<p class="report-empty">No page traffic rows loaded.</p>') + '</div>';
  }
  function renderOverviewTab(tab) {
    const renderers = {
      analytics: renderOverviewAnalytics,
      website: renderOverviewWebsite,
      referrals: renderOverviewReferrals
    };
    return (renderers[tab] || renderOverviewAnalytics)();
  }

  function destroyVisualEditor() {
    if (visualEditor && typeof visualEditor.destroy === 'function') visualEditor.destroy();
    visualEditor = null;
  }

  function destroyEmailAgent() {
    if (emailAgentPanel && typeof emailAgentPanel.destroy === 'function') emailAgentPanel.destroy();
    emailAgentPanel = null;
  }

  function renderView() {
    if (!state) return;
    destroyVisualEditor();
    destroyEmailAgent();
    document.body.classList.toggle('admin-body--visual-editor', currentView === 'content');
    document.body.classList.toggle('admin-body--email-agent', currentView === 'mailbox');
    const renderers = {
      overview: renderOverview,
      seo: renderSeo,
      content: renderContent,
      pages: renderPages,
      videos: renderVideos,
      referrals: renderReferrals,
      mailbox: renderMailbox,
      leads: renderLeads,
      reviews: renderReviews,
      gbp: renderGbp,
      campaigns: renderCampaigns,
      compliance: renderCompliance,
      exports: renderExports,
      help: renderHelp
    };
    let body = '';
    try {
      body = (renderers[currentView] || renderOverview)();
    } catch (error) {
      console.error('Admin render failed:', currentView, error);
      body = '<section class="panel"><div class="section-header"><div><h2>Could not load this screen</h2><p>' +
        escapeHtml(error && error.message ? error.message : String(error)) +
        '</p></div></div><p class="report-empty">Try <button type="button" class="button button-secondary" data-action="reset-demo">Reset demo</button> or hard-refresh the page (Ctrl+Shift+R).</p></section>';
    }
    const prefix = (currentView === 'content' || currentView === 'mailbox')
      ? (currentView === 'mailbox' ? '' : tabGuideHtml('content'))
      : currentView === 'referrals'
        ? screenTruthLine('referrals')
        : viewDataSourceHtml(currentView) + tabGuideHtml(currentView);
    main.innerHTML = prefix + body;
    updateSidebarModePill();
    bindViewEvents();
    if (currentView === 'content') mountVisualEditor();
    if (currentView === 'mailbox') mountEmailAgent();
  }

  function renderMailbox() {
    return '<div class="cw-email-agent-host" id="cw-email-agent-host"></div>';
  }

  function mountEmailAgent() {
    const host = document.getElementById('cw-email-agent-host');
    if (!host || !window.CWEmailAgent) return;
    emailAgentPanel = window.CWEmailAgent.mount(host, { onToast: showToast });
  }

  function renderOverview() {
    const intro = '<section class="panel report-intro"><p class="report-intro__eyebrow">clearwaterdentist.com · ' + escapeHtml(formatReportDate(state.generatedAt)) + '</p><h2>Dashboard</h2><p>Google Search analytics, website launch progress, and CRM snapshots. Use <strong>Growth &amp; CRM</strong> for referral partners and patient inquiries.</p></section>';
    return '<div class="dashboard-grid report-shell">' + intro + reportTabsHtml(overviewTab) + '<div class="report-tab-panel" role="tabpanel">' + renderOverviewTab(overviewTab) + '</div></div>';
  }

  function bindOutreachModule() {
    if (!window.CWReferralOutreach || document.body.dataset.cwOutreachBound) return;
    document.body.dataset.cwOutreachBound = '1';
    window.CWReferralOutreach.bindGlobalModal(
      state.site,
      index => (state.referrals || [])[index],
      (index, content) => {
        const item = state.referrals[index];
        if (!item) return;
        item.status = 'Contacted';
        const today = new Date().toISOString().slice(0, 10);
        item.nextStep = today + ' sent "' + (content.sendType || 'first_touch') + '" preview · follow up in 5 business days';
        item.lastEmailSubject = content.subject;
        saveState('Marked as sent (demo) — update when real email goes out.');
        renderView();
      }
    );
  }

  function renderLeads() {
    const referralLeadCount = state.leads.filter(l => /referral/i.test(l.source)).length;
    const scrapeBar = '<div class="scrape-bar"><div><strong>Lead scraper</strong><p>Pull real examples from synced Google Search data (queries + top landing pages). Requires <code>npm run sync:google</code> first.</p></div>' +
      '<button type="button" class="button button-primary" data-action="scrape-leads">Scrape from Google Search</button></div>';
    const form = '<form id="lead-form" class="form-grid"><label class="field-block"><span>Inquiry type</span><select class="select" name="event"><option>Phone tap</option><option>Appointment click</option><option>Form submit</option><option>Financing click</option><option>Video play</option><option>New patient question</option></select></label><label class="field-block"><span>Source</span><select class="select" name="source"><option>Organic Search</option><option>Google Business Profile</option><option>Referral partner</option><option>Direct</option><option>Paid social</option></select></label><label class="field-block wide"><span>Page on clearwaterdentist.com</span><input class="field" name="page" value="/contact-us"></label><label class="field-block wide"><span>Note (optional)</span><input class="field" name="note" placeholder="e.g. Kontour Med Spa sent them — whitening consult"></label><div class="save-row wide"><button class="button button-primary" type="submit">Log inquiry</button></div></form>';
    const metrics = metricGridBadged([
      { label: 'Total inquiries', value: String(state.leads.length), delta: 'All sources' },
      { label: 'High intent', value: String(state.leads.filter(l => /phone|appointment/i.test(l.event)).length), delta: 'Phone / booking clicks' },
      { label: 'From Google search', value: String(state.leads.filter(l => /organic|search/i.test(l.source)).length), delta: 'SEO attribution' },
      { label: 'Referral partner', value: String(referralLeadCount), delta: 'Tied to B2B outreach' }
    ], 'local');
    const board = window.CWReferralOutreach
      ? window.CWReferralOutreach.renderLeadsBoard(state.leads, { sourceFilter: filters.leadSource })
      : '';
    return '<div class="dashboard-grid">' + scrapeBar + metrics + board + '<div class="split-grid">' + panel('Log new inquiry', 'Front desk or analytics flagged something — record source and page URL.', form) + panel('Connect to referral outreach', 'When source is Referral partner, name the business in the note so you can tie patients back to the partner list.', '<p class="report-empty">Open <button class="text-button" type="button" data-view="referrals">Referral partners</button> to preview outreach emails and track who was contacted.</p>') + '</div></div>';
  }

  function renderContent() {
    return '<div class="cw-visual-editor-host" id="cw-visual-editor-host"></div>';
  }

  function mountVisualEditor() {
    const host = document.getElementById('cw-visual-editor-host');
    if (!host || !window.CWVisualEditor) return;
    const pageOptions = [{ route: '/', title: 'Home' }].concat(
      (state.servicePages || []).filter(page => page.route && page.route !== '/').map(page => ({
        route: page.route,
        title: page.title || page.route
      }))
    );
    const seen = new Set();
    const pages = pageOptions.filter(page => {
      if (seen.has(page.route)) return false;
      seen.add(page.route);
      return true;
    });
    visualEditor = window.CWVisualEditor.mount(host, {
      content: state.content || {},
      pages,
      onSave(draft) {
        state.content = Object.assign({}, state.content || {}, draft);
        if (draft.pageEdits) state.content.pageEdits = draft.pageEdits;
        if (draft.collections) state.content.collections = draft.collections;
        saveState();
      },
      onToast: showToast
    });
  }

  function renderPages() {
    const categories = Array.from(new Set(state.servicePages.map(p => p.category))).sort();
    const statuses = Array.from(new Set(state.servicePages.map(p => p.status))).sort();
    const search = filters.pageSearch.toLowerCase();
    const filtered = state.servicePages.filter(page => {
      const haystack = [page.title, page.route, page.targetKeyword, page.category].join(' ').toLowerCase();
      return (!search || haystack.includes(search)) && (filters.pageStatus === 'All' || page.status === filters.pageStatus) && (filters.pageCategory === 'All' || page.category === filters.pageCategory);
    });
    const toolbar = '<form id="page-filter-form" class="toolbar"><input class="field" name="pageSearch" placeholder="Search pages" value="' + attr(filters.pageSearch) + '"><select class="select" name="pageStatus"><option>All</option>' + statuses.map(s => '<option' + (s === filters.pageStatus ? ' selected' : '') + '>' + escapeHtml(s) + '</option>').join('') + '</select><select class="select" name="pageCategory"><option>All</option>' + categories.map(c => '<option' + (c === filters.pageCategory ? ' selected' : '') + '>' + escapeHtml(c) + '</option>').join('') + '</select><button class="button button-secondary" type="submit">Apply</button></form>';
    const trafficLabel = isGscLive() ? 'GSC live' : 'GSC demo';
    const rows = filtered.map(page => '<tr><td><span class="row-title">' + escapeHtml(page.title) + '</span><small>' + escapeHtml(page.route) + '</small></td><td>' + escapeHtml(page.category) + '<small>' + escapeHtml(page.pageType || '') + '</small></td><td class="col-keyword"><input class="field" data-action="keyword" data-id="' + attr(page.id) + '" value="' + attr(page.targetKeyword) + '"></td><td><select class="select" data-action="page-status" data-id="' + attr(page.id) + '">' + ['Live', 'Imported', 'Draft Review', 'Needs SEO', 'Queued', 'Approved'].map(s => '<option' + (s === page.status ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></td><td class="col-checks">' + checkChips(page) + '</td><td class="col-traffic">' + escapeHtml(page.impressions) + '<small>' + escapeHtml(page.clicks) + ' clicks, pos ' + escapeHtml(page.position) + '</small></td><td><button class="text-button" data-action="mark-reviewed" data-id="' + attr(page.id) + '" type="button">Reviewed</button></td></tr>');
    const boardNote = isGscLive()
      ? 'Traffic columns are live Search Console data. Status and checkboxes save in your browser.'
      : 'Traffic columns are demo sample data until sync runs. Status and checkboxes save in your browser.';
    return '<div class="dashboard-grid">' + panel('Website optimization board', boardNote, toolbar + table(['Page', 'Category', 'Keyword', 'Status', 'Checks', trafficLabel, ''], rows, 'data-table--pages', ['', '', 'col-keyword', '', 'col-checks', 'col-traffic', ''])) + '</div>';
  }

  function renderSeo() {
    const rows = state.seoOpportunities.map((item, index) => '<tr><td><span class="row-title">' + escapeHtml(item.query) + '</span><small>' + escapeHtml(item.page) + '</small></td><td>' + escapeHtml(item.impressions) + '</td><td>' + escapeHtml(item.clicks) + '</td><td class="col-ctr">' + escapeHtml(item.ctr) + '</td><td>' + escapeHtml(item.position) + '</td><td class="col-action">' + escapeHtml(item.action) + '</td><td>' + statusPill(item.status) + '</td><td><button class="text-button" data-action="seo-queue" data-index="' + index + '" type="button">Queue</button></td></tr>');
    const subtitle = isGscLive()
      ? 'Live Search Console queries from the last sync (' + escapeHtml(state.googleLive.gsc.siteUrl) + ').'
      : 'Demo sample rows — run npm run sync:google to load live Search Console data.';
    return '<div class="dashboard-grid">' + panel('GSC Opportunity Board', subtitle, table(['Query', 'Impr.', 'Clicks', 'CTR', 'Pos.', 'Action', 'Status', ''], rows, 'data-table--seo', ['', '', '', 'col-ctr', '', 'col-action', '', '']), '<a class="button button-secondary" href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer">Open GSC</a>') + '</div>';
  }

  function renderGbp() {
    const live = isGbpLive();
    const actionMetrics = metricGridBadged((state.gbp.actions || []).map(item => ({ label: item.label, value: item.value, delta: live ? 'From Google' : 'Placeholder only' })), live ? 'live' : 'demo');
    const checklist = '<div class="checklist">' + (state.gbp.checklist || []).map((item, index) => '<label><input type="checkbox" data-action="gbp-check" data-index="' + index + '"' + (item.done ? ' checked' : '') + '><span>' + escapeHtml(item.label) + '</span></label>').join('') + '</div>';
    const d = state.gbp.postDraft || {};
    const form = '<form id="gbp-form" class="form-grid"><label class="field-block"><span>Draft title</span><input class="field" name="title" value="' + attr(d.title || '') + '"></label><label class="field-block"><span>Channel</span><input class="field" name="channel" value="' + attr(d.channel || 'GBP Draft') + '"></label><label class="field-block wide"><span>Draft body</span><textarea name="body">' + escapeHtml(d.body || '') + '</textarea></label><label class="field-block"><span>Status</span><select class="select" name="status"><option' + (d.status === 'Needs Approval' ? ' selected' : '') + '>Needs Approval</option><option' + (d.status === 'Ready to Test' ? ' selected' : '') + '>Ready to Test</option><option' + (d.status === 'Approved Draft' ? ' selected' : '') + '>Approved Draft</option></select></label><div class="save-row"><button class="button button-primary" type="submit">Save GBP Draft</button></div></form>';
    const perfNote = live
      ? 'Live Business Profile metrics from the last sync.'
      : 'Performance numbers are demo samples — Business Profile API is not connected (quota blocked or IDs missing).';
    const callout = live
      ? '<section class="panel report-callout report-callout--live"><strong>These performance numbers are real from Google.</strong> The checklist and post drafts below are team notes only.</section>'
      : '<section class="panel report-callout"><strong>These performance numbers are placeholders.</strong> Google has not approved Business Profile API access yet — it does not reset daily. Checklist and drafts are team notes only.</section>';
    return '<div class="dashboard-grid">' + callout + panel('GBP performance', perfNote, actionMetrics) + '<div class="split-grid">' + panel('GBP Checklist', (state.gbp.testProfile || 'Local operations checklist') + ' — saved in browser.', checklist) + panel('GBP Post Draft', 'Draft-first; no live posting from this dashboard.', form) + '</div></div>';
  }

  function renderReviews() {
    const cards = '<div class="three-grid">' + state.reviews.map((review, index) => '<article class="review-card"><div><strong>' + escapeHtml(review.name) + '</strong><div class="star-row">' + '*****'.slice(0, Number(review.rating || 5)) + '</div></div><blockquote>' + escapeHtml(review.text || 'Review text ready for import.') + '</blockquote><p>' + escapeHtml(review.reply || '') + '</p><div class="action-footer">' + statusPill(review.status) + '<button class="text-button" data-action="review-approved" data-index="' + index + '" type="button">Approve reply</button></div></article>').join('') + '</div>';
    const link = state.site.googleReviewUrl || '#';
    return '<div class="dashboard-grid">' + panel('Review Manager', 'Review cards are demo/sample. Reply drafts save locally — not posted to Google automatically.', cards) + panel('Review Request Link', 'This Google Maps review link is real and safe to use in production materials.', '<p><a href="' + attr(link) + '" target="_blank" rel="noopener noreferrer">' + escapeHtml(link) + '</a></p><button class="button button-secondary" data-action="copy-review-link" type="button">Copy Link</button>') + '</div>';
  }

  function renderVideos() {
    const cards = '<div class="video-grid">' + state.videos.map((video, index) => {
      const media = video.poster ? '<img class="video-poster" src="' + attr(video.poster) + '" alt="">' : '<video controls preload="metadata" src="' + attr(video.source) + '"></video>';
      return '<article class="video-card">' + media + '<div class="video-card-body"><h3>' + escapeHtml(video.title) + '</h3><p>' + escapeHtml(video.category) + (video.route ? ' - ' + escapeHtml(video.route) : '') + '</p><div class="checks"><span class="check-chip' + (video.transcript ? ' is-on' : '') + '">Transcript</span><span class="check-chip' + (video.embedded ? ' is-on' : '') + '">Embed</span><span class="check-chip' + (video.schemaReady ? ' is-on' : '') + '">Schema</span></div><div class="action-footer">' + statusPill(video.status) + '<button class="text-button" data-action="video-ready" data-index="' + index + '" type="button">Mark ready</button></div></div></article>';
    }).join('') + '</div>';
    return '<div class="dashboard-grid">' + panel('Site videos', 'Website Manager — track Dr. Nadia videos, embeds on service pages, transcripts, and VideoObject schema.', cards) + '</div>';
  }

  function renderCampaigns() {
    const cards = '<div class="three-grid">' + state.campaigns.map((campaign, index) => '<article class="campaign-card"><h3>' + escapeHtml(campaign.name) + '</h3><p>' + escapeHtml(campaign.focus) + '</p><div class="channel-list">' + (campaign.channels || []).map(ch => '<span class="channel-chip">' + escapeHtml(ch) + '</span>').join('') + '</div><div class="action-footer"><span>' + escapeHtml(campaign.due) + '</span>' + statusPill(campaign.status) + '</div><button class="button button-secondary" data-action="campaign-queue" data-index="' + index + '" type="button">Queue Approval</button></article>').join('') + '</div>';
    const form = '<form id="campaign-form" class="form-grid"><label class="field-block"><span>Campaign</span><input class="field" name="name" value="New patient welcome push"></label><label class="field-block"><span>Focus</span><input class="field" name="focus" value="New patients"></label><label class="field-block"><span>Due date</span><input class="field" name="due" type="date"></label><div class="save-row"><button class="button button-primary" type="submit">Add Campaign</button></div></form>';
    return '<div class="dashboard-grid">' + panel('Campaign Calendar', 'Plan website, GBP, social, video, and referral pushes from one queue.', cards) + panel('Add Campaign', '', form) + '</div>';
  }

  function referralFlowCounts() {
    const all = sanitizeReferrals(state.referrals || []);
    return {
      find: all.filter(item => /^research$/i.test(String(item.status || ''))).length,
      email: all.filter(item => /^(to contact|draft email)$/i.test(String(item.status || ''))).length,
      track: all.filter(item => /^(contacted|nurture|active partner|closed)$/i.test(String(item.status || ''))).length
    };
  }

  function pickReferralFlowStep() {
    const counts = referralFlowCounts();
    if (counts.find > 0) return 'find';
    if (counts.email > 0) return 'email';
    if (counts.track > 0) return 'track';
    return 'find';
  }

  function referralsForFlowStep(step) {
    const all = sanitizeReferrals(state.referrals || []);
    if (step === 'find') return all.filter(item => /^research$/i.test(String(item.status || '')));
    if (step === 'email') return all.filter(item => /^(to contact|draft email)$/i.test(String(item.status || '')));
    if (step === 'track') return all.filter(item => /^(contacted|nurture|active partner|closed)$/i.test(String(item.status || '')));
    return all;
  }

  function referralFlowNavHtml() {
    const counts = referralFlowCounts();
    const steps = [
      { id: 'find', num: '1', title: 'Find leads', hint: 'Research prospects', count: counts.find },
      { id: 'email', num: '2', title: 'Email them', hint: 'Preview & send intros', count: counts.email },
      { id: 'track', num: '3', title: 'Referral partners', hint: 'Replies & active partners', count: counts.track }
    ];
    return '<nav class="referral-flow__nav" aria-label="Referral workflow">' + steps.map(step =>
      '<button type="button" class="referral-flow__step' + (referralFlowStep === step.id ? ' is-active' : '') + '" data-action="referral-flow-step" data-step="' + step.id + '">' +
      '<span class="referral-flow__num">' + step.num + '</span>' +
      '<span class="referral-flow__copy"><strong>' + escapeHtml(step.title) + '</strong><small>' + escapeHtml(step.hint) + '</small></span>' +
      '<span class="referral-flow__count">' + step.count + '</span></button>'
    ).join('') + '</nav>';
  }

  function referralHowToHtml() {
    const applyUrl = ((state.site && state.site.domain) || 'https://www.clearwaterdentist.com').replace(/\/$/, '') + '/contact-us?interest=referral-partner';
    return '<aside class="referral-flow__howto">' +
      '<h3>How partners get on this list</h3>' +
      '<div class="referral-flow__howto-grid">' +
      '<article><strong>1 — You research &amp; add</strong><p>Step 1 form below. Use Google Maps, Instagram, or drive-by near the office.</p></article>' +
      '<article><strong>2 — They request partnership</strong><p>Share this link on your site or in email: <a href="' + attr(applyUrl) + '" target="_blank" rel="noopener">' + escapeHtml(applyUrl) + '</a> (routes to contact form with referral interest).</p></article>' +
      '<article><strong>3 — Office introduces them</strong><p>Front desk adds them here and sets <em>Source</em> to Office intro.</p></article>' +
      '</div>' +
      '<p class="referral-flow__howto-qr"><strong>Active partners</strong> each get a unique QR → <code>/ref/{slug}</code> on clearwaterdentist.com so you know which business sent the patient (separate from in-office patient refer-a-friend programs).</p>' +
      '</aside>';
  }

  function partnerMaterialChecks(item, idx) {
    const sent = item.materialsSent || {};
    return '<div class="partner-card__materials">' +
      '<span class="partner-card__materials-label">Delivered?</span>' +
      '<label class="partner-check"><input type="checkbox" data-action="referral-material" data-index="' + idx + '" data-key="qr"' + (sent.qr ? ' checked' : '') + '> QR card</label>' +
      '<label class="partner-check"><input type="checkbox" data-action="referral-material" data-index="' + idx + '" data-key="brochure"' + (sent.brochure ? ' checked' : '') + '> Brochure PDF</label>' +
      '<label class="partner-check"><input type="checkbox" data-action="referral-material" data-index="' + idx + '" data-key="welcomeEmail"' + (sent.welcomeEmail ? ' checked' : '') + '> Welcome email</label>' +
      '</div>';
  }

  function partnerRegistryCard(item, idx) {
    if (!item || !item.business) return '';
    const email = item.contactEmail || (window.CWReferralOutreach ? window.CWReferralOutreach.partnerEmail(item) : '');
    const slug = item.slug || partnerSlug(item.business);
    const url = item.qrUrl || partnerQrUrl(slug);
    const qrImg = 'https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=' + encodeURIComponent(url);
    const isActive = /active partner/i.test(item.status);
    const pkg = (item.package || defaultPackageForGroup(item.group)).map(line => '<li>' + escapeHtml(line) + '</li>').join('');
    const qrBlock = isActive
      ? '<div class="partner-card__qr">' +
        '<img src="' + attr(qrImg) + '" width="110" height="110" alt="QR code for ' + attr(item.business) + '">' +
        '<div class="partner-card__qr-meta"><code>' + escapeHtml(url) + '</code>' +
        '<button type="button" class="button button-secondary button--compact" data-action="referral-copy-qr" data-index="' + idx + '">Copy link</button></div></div>'
      : '<p class="partner-card__qr-pending">QR is generated when status is <strong>Active Partner</strong>.</p>';

    return '<article class="partner-card">' +
      '<header class="partner-card__head"><div><h3>' + escapeHtml(item.business) + '</h3><p>' + escapeHtml(item.group) + ' · ' + escapeHtml(item.source || 'Manual research') + '</p></div>' + statusPill(item.status) + '</header>' +
      '<p class="partner-card__angle">' + escapeHtml(item.angle) + '</p>' +
      '<div class="partner-card__meta"><span>' + (email ? escapeHtml(email) : 'No email yet') + '</span><span>' + escapeHtml(item.city || 'Clearwater, FL') + '</span></div>' +
      '<div class="partner-card__package"><strong>They receive</strong><ul>' + pkg + '</ul></div>' +
      qrBlock +
      (isActive ? partnerMaterialChecks(item, idx) : '') +
      '<div class="partner-card__foot"><input class="field" data-action="referral-next" data-index="' + idx + '" value="' + attr(item.nextStep || '') + '" placeholder="Next step — date + outcome">' +
      '<select class="select" data-action="referral-status" data-index="' + idx + '">' +
      ['Research', 'To Contact', 'Draft Email', 'Contacted', 'Nurture', 'Active Partner', 'Closed'].map(s => '<option' + (s === item.status ? ' selected' : '') + '>' + s + '</option>').join('') +
      '</select></div></article>';
  }

  function renderAddPartnerForm() {
    return '<form id="referral-form" class="referral-flow__form form-grid">' +
      '<label class="field-block"><span>Business name</span><input class="field" name="business" required placeholder="e.g. Skin NV Med Spa"></label>' +
      '<label class="field-block"><span>Partner type</span><select class="select" name="group"><option>Med spas</option><option>Realtors</option><option>Wedding planners</option><option>Employers</option><option>Salons</option><option>Gyms/wellness</option></select></label>' +
      '<label class="field-block"><span>How they were added</span><select class="select" name="source"><option>Manual research</option><option>Partner application</option><option>Office intro</option></select></label>' +
      '<label class="field-block wide"><span>Why they are a fit</span><input class="field" name="angle" placeholder="e.g. XERF patients also ask about veneers"></label>' +
      '<label class="field-block"><span>Contact email</span><input class="field" name="contactEmail" type="email" placeholder="optional for now"></label>' +
      '<label class="field-block"><span>City</span><input class="field" name="city" value="Clearwater, FL"></label>' +
      '<div class="save-row wide"><button class="button button-primary" type="submit">Add referral partner</button></div></form>';
  }

  function renderAddPartnerSection() {
    const total = (state.referrals || []).length;
    return '<section class="referral-flow__add-panel" id="referral-add-section">' +
      '<header class="referral-flow__panel-head"><h2>Add a referral partner</h2><p>Start here — this form is always available, even when the list is empty. ' +
      (total ? '<strong>' + total + '</strong> partner' + (total === 1 ? '' : 's') + ' saved in this browser.' : 'No partners saved yet.') + '</p></header>' +
      '<div class="scrape-bar scrape-bar--compact"><div><strong>Quick fill</strong><p>Load demo samples or scrape local Clearwater prospects.</p></div>' +
      '<div class="referral-flow__toolbar">' +
      '<button type="button" class="button button-secondary" data-action="referral-restore-samples">Load samples</button>' +
      '<button type="button" class="button button-secondary" data-action="scrape-referrals">Scrape prospects</button>' +
      '<button type="button" class="button button-secondary" data-action="reset-referrals">Reset partners</button>' +
      '</div></div>' +
      renderAddPartnerForm() +
      '</section>';
  }

  function renderPartnerRegistry() {
    const all = sanitizeReferrals(state.referrals || []);
    if (!all.length) {
      return '<section class="referral-flow__registry referral-flow__registry--empty">' +
        '<header class="referral-flow__panel-head"><h2>Partner registry</h2><p>Active and in-progress partners appear here after you add them above.</p></header>' +
        '<p class="report-empty">No partners yet — use <strong>Add a referral partner</strong> at the top of this page.</p></section>';
    }
    const cards = all.map((item, idx) => partnerRegistryCard(item, idx)).filter(Boolean).join('');
    return '<section class="referral-flow__registry"><header class="referral-flow__panel-head"><h2>Partner registry</h2><p>Every prospect and active partner in one place — status, what they receive, QR link, and delivery checklist.</p></header><div class="partner-registry">' + cards + '</div></section>';
  }

  function referralTableRows(items, step) {
    if (!items.length) return '';
    const statusOptions = {
      find: ['Research', 'To Contact'],
      email: ['To Contact', 'Draft Email', 'Contacted'],
      track: ['Contacted', 'Nurture', 'Active Partner', 'Closed']
    }[step] || ['Research', 'To Contact', 'Draft Email', 'Contacted', 'Nurture', 'Active Partner', 'Closed'];

    return items.map(item => {
      const idx = state.referrals.indexOf(item);
      const email = item.contactEmail || (window.CWReferralOutreach ? window.CWReferralOutreach.partnerEmail(item) : '');
      let actions = '';
      if (step === 'find') {
        actions = '<button type="button" class="button button-secondary button--compact" data-action="referral-queue-email" data-index="' + idx + '">Ready to email</button>';
      }
      if (step === 'email') {
        actions = '<button type="button" class="button button-primary button--compact" data-action="referral-preview" data-index="' + idx + '">Preview</button> ' +
          '<button type="button" class="button button-secondary button--compact" data-action="referral-contacted" data-index="' + idx + '">Mark sent</button>';
      }
      if (step === 'track') {
        actions = '<button type="button" class="button button-secondary button--compact" data-action="referral-active" data-index="' + idx + '">Active partner</button>';
      }
      actions += ' <button type="button" class="text-button" data-action="remove-referral" data-index="' + idx + '">Remove</button>';

      return '<tr><td><span class="row-title">' + escapeHtml(item.business) + '</span><small>' + escapeHtml(item.group) + ' · ' + escapeHtml(item.source || 'Manual research') + '</small></td>' +
        '<td class="col-muted">' + escapeHtml(item.angle) + '</td>' +
        '<td>' + (email ? escapeHtml(email) : '<span class="col-muted">Add email</span>') + '</td>' +
        '<td><select class="select" data-action="referral-status" data-index="' + idx + '">' +
        statusOptions.map(s => '<option' + (s === item.status ? ' selected' : '') + '>' + s + '</option>').join('') + '</select></td>' +
        '<td><input class="field" data-action="referral-next" data-index="' + idx + '" value="' + attr(item.nextStep || '') + '"></td>' +
        '<td class="referral-row__actions">' + actions + '</td></tr>';
    }).join('');
  }

  function renderReferralsFind() {
    const items = referralsForFlowStep('find');
    const rows = referralTableRows(items, 'find');
    const body = rows
      ? table(['Business', 'Why', 'Email', 'Status', 'Notes', ''], rows, 'data-table--referrals')
      : '<p class="report-empty">No one in <strong>Research</strong> right now. Add a partner above or change status on a row in the registry.</p>';
    return '<section class="referral-flow__panel"><header class="referral-flow__panel-head"><h2>Step 1 — Research queue</h2><p>Prospects you are researching before outreach.</p></header>' + body + '</section>';
  }

  function renderReferralsEmail() {
    const items = referralsForFlowStep('email');
    const queue = window.CWReferralOutreach
      ? window.CWReferralOutreach.sendQueueHtml(state.referrals, state.site)
      : '<p class="report-empty">Email preview module not loaded.</p>';
    const rows = referralTableRows(items, 'email');
    const body = '<div class="referral-flow__email-actions">' +
      '<button type="button" class="button button-primary" data-view="mailbox">Open outreach inbox</button>' +
      '<span class="referral-flow__email-hint">Sent mail, CRM replies, and live demo send live in <strong>Outreach inbox</strong>.</span></div>' +
      '<div class="referral-flow__subblock"><h3>Send queue</h3>' + queue + '</div>' +
      '<div class="referral-flow__subblock"><h3>Ready to email</h3>' + (rows
        ? table(['Business', 'Why', 'Email', 'Status', 'Next step', ''], rows, 'data-table--referrals')
        : referralEmptyHintHtml('email')) + '</div>';
    return '<section class="referral-flow__panel"><header class="referral-flow__panel-head"><h2>Email them</h2><p>Preview the partnership intro, send from the outreach mailbox, then mark <strong>sent</strong> so they move to step 3 when they reply.</p></header>' + body + '</section>';
  }

  function renderReferralsTrack() {
    const items = referralsForFlowStep('track');
    const active = items.filter(item => /active partner/i.test(item.status)).length;
    const rows = referralTableRows(items, 'track');
    const body = '<p class="referral-flow__track-summary"><strong>' + active + '</strong> active partner' + (active === 1 ? '' : 's') + ' · log patients who mention a partner in <button type="button" class="text-button" data-view="leads">Leads &amp; inquiries</button></p>' +
      (rows
        ? table(['Business', 'Why', 'Email', 'Status', 'Next step', ''], rows, 'data-table--referrals')
        : referralEmptyHintHtml('track'));
    return '<section class="referral-flow__panel"><header class="referral-flow__panel-head"><h2>Referral partners</h2><p>Businesses you emailed who replied, are in follow-up, or are actively referring patients. Mark <strong>Active Partner</strong> to unlock their QR code and delivery checklist in the registry below.</p></header>' + body + '</section>';
  }

  function renderReferrals() {
    state.referrals = sanitizeReferrals(state.referrals || []);
    const stepPanel = referralFlowStep === 'email'
      ? renderReferralsEmail()
      : referralFlowStep === 'track'
        ? renderReferralsTrack()
        : renderReferralsFind();
    return '<div class="referral-flow">' +
      referralFlowNavHtml() +
      renderAddPartnerSection() +
      referralHowToHtml() +
      stepPanel +
      renderPartnerRegistry() +
      '</div>';
  }

  function renderHelp() {
    const legend = dataLegendHtml();
    const guide = window.CWTabGuides ? window.CWTabGuides.renderGuide('help') : '<p class="report-empty">Guide module not loaded.</p>';
    return '<div class="dashboard-grid">' + legend + guide + '</div>';
  }

  function renderCompliance() {
    const rows = state.approvals.map((item, index) => '<tr><td><span class="row-title">' + escapeHtml(item.item) + '</span><small>' + escapeHtml(item.type) + '</small></td><td>' + escapeHtml(item.owner) + '</td><td>' + statusPill(item.status) + '</td><td>' + escapeHtml(item.risk) + '</td><td><button class="text-button" data-action="approve-item" data-index="' + index + '" type="button">Approve</button></td></tr>');
    return '<div class="dashboard-grid">' + panel('Approval Log', 'Track marketing, GBP, review, image, and testimonial approvals before publish.', table(['Item', 'Owner', 'Status', 'Risk note', ''], rows)) + panel('Guardrails', 'Keep the demo separate from patient and clinical systems.', '<ul class="guardrail-list">' + state.complianceGuardrails.map(item => '<li>' + escapeHtml(item) + '</li>').join('') + '</ul>') + '</div>';
  }

  function renderExports() {
    const importForm = '<form id="import-form" class="form-grid"><label class="field-block wide"><span>Import JSON</span><textarea name="bundle" placeholder="Paste a dashboard export bundle"></textarea></label><div class="save-row wide"><button class="button button-secondary" data-action="reset-demo" type="button">Reset Demo</button><button class="button button-primary" type="submit">Import Bundle</button></div></form>';
    const body = '<div class="action-list"><article class="action-item"><h3>Dashboard state</h3><p>Downloads local demo edits, queue changes, and dashboard data.</p><button class="button button-primary" data-action="export-all" type="button">Download JSON</button></article><article class="action-item"><h3>Production note</h3><p>Real publishing should use authenticated backend storage, OAuth tokens, audit logs, and vendor-approved workflows.</p></article></div>';
    return '<div class="split-grid">' + panel('Exports', 'Move demo edits into review packets without touching production systems.', body) + panel('Import / Reset', '', importForm) + '</div>';
  }

  function bindViewEvents() {
    const leadForm = document.getElementById('lead-form');
    if (leadForm) leadForm.addEventListener('submit', handleLeadSubmit);
    const filterForm = document.getElementById('page-filter-form');
    if (filterForm) filterForm.addEventListener('submit', handlePageFilter);
    const gbpForm = document.getElementById('gbp-form');
    if (gbpForm) gbpForm.addEventListener('submit', handleGbpSubmit);
    const campaignForm = document.getElementById('campaign-form');
    if (campaignForm) campaignForm.addEventListener('submit', handleCampaignSubmit);
    const referralForm = document.getElementById('referral-form');
    if (referralForm) referralForm.addEventListener('submit', handleReferralSubmit);
    const referralFilterForm = document.getElementById('referral-filter-form');
    if (referralFilterForm) referralFilterForm.addEventListener('submit', handleReferralFilter);
    const importForm = document.getElementById('import-form');
    if (importForm) importForm.addEventListener('submit', handleImportSubmit);
  }

  function handleLeadSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    state.leads.unshift({ date: new Date().toISOString().slice(0, 10), event: data.event, source: data.source, page: data.page, note: data.note || '', status: 'Tracked' });
    saveState('Inquiry logged.');
    renderView();
  }
  function handlePageFilter(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    filters.pageSearch = data.pageSearch || '';
    filters.pageStatus = data.pageStatus || 'All';
    filters.pageCategory = data.pageCategory || 'All';
    renderView();
  }
  function handleGbpSubmit(event) {
    event.preventDefault();
    state.gbp.postDraft = Object.fromEntries(new FormData(event.currentTarget).entries());
    saveState('GBP draft saved locally.');
    renderView();
  }
  function handleCampaignSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    state.campaigns.unshift({ name: data.name, focus: data.focus, status: 'Idea', channels: ['Website banner', 'GBP draft', 'Social caption'], owner: 'Knight Logics', due: data.due || new Date().toISOString().slice(0, 10) });
    saveState('Campaign added.');
    renderView();
  }
  function handleReferralFilter(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    filters.referralGroup = data.referralGroup || 'All';
    filters.referralStatus = data.referralStatus || 'All';
    renderView();
  }
  function handleReferralSubmit(event) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    state.referrals.unshift(normalizeReferralPartner({
      business: data.business,
      group: data.group,
      source: data.source || 'Manual research',
      contactEmail: data.contactEmail || '',
      city: data.city || 'Clearwater, FL',
      angle: data.angle,
      status: 'Research',
      nextStep: data.contactEmail ? 'Verify contact on website' : 'Find GM email'
    }));
    referralFlowStep = 'find';
    saveState('Lead added.');
    renderView();
  }
  async function restoreReferralSamples() {
    try {
      const base = await loadBaseData();
      baseReferralSamples = referralSeedList(base.referrals || []);
      state.referrals = baseReferralSamples.map(item => normalizeReferralPartner(Object.assign({}, item)));
      referralFlowStep = 'find';
      saveState('Sample partners loaded.');
      renderView();
      showToast('Loaded ' + state.referrals.length + ' sample partners.');
    } catch {
      state.referrals = BUILT_IN_REFERRAL_SAMPLES.map(item => normalizeReferralPartner(Object.assign({}, item)));
      referralFlowStep = 'find';
      saveState('Loaded built-in sample partners.');
      renderView();
    }
  }

  function resetReferralPartnersOnly() {
    state.referrals = baseReferralSamples.map(item => normalizeReferralPartner(Object.assign({}, item)));
    referralFlowStep = 'find';
    saveState('Referral partners reset to defaults.');
    renderView();
    showToast('Referral partners reset (' + state.referrals.length + ').');
  }

  async function resetEntireDemo() {
    try { window.localStorage.removeItem(STATE_KEY); } catch {}
    showToast('Resetting demo...');
    try {
      await reloadDashboardFromBase({ fresh: true, view: currentView || 'referrals', referralsStep: 'find' });
      showToast('Demo reset complete.');
    } catch {
      window.location.href = window.location.pathname + '?reset=' + Date.now() + '#referrals';
      window.location.reload();
    }
  }

  async function importScrapedLeads() {
    try {
      const res = await fetch('/api/admin/scrape-leads', { cache: 'no-store' });
      const data = await res.json();
      if (!data.ok) {
        showToast(data.error === 'gsc_not_connected' ? 'Run npm run sync:google first.' : 'Lead scrape failed.');
        return;
      }
      const seen = new Set((state.leads || []).map(lead => String(lead.note || '') + '|' + String(lead.page || '')));
      let added = 0;
      (data.leads || []).forEach(lead => {
        const key = String(lead.note || '') + '|' + String(lead.page || '');
        if (seen.has(key)) return;
        seen.add(key);
        state.leads.unshift(lead);
        added += 1;
      });
      saveState(added ? 'Added ' + added + ' leads from Google Search.' : 'No new leads to add.');
      renderView();
    } catch {
      showToast('Lead scraper unavailable — use npm run serve.');
    }
  }

  async function importScrapedReferrals() {
    try {
      const res = await fetch('/api/admin/scrape-referrals', { cache: 'no-store' });
      const data = await res.json();
      if (!data.ok) {
        showToast('Prospect scrape failed.');
        return;
      }
      const seen = new Set((state.referrals || []).map(item => String(item.business || '').toLowerCase()));
      let added = 0;
      (data.prospects || []).forEach(item => {
        const key = String(item.business || '').toLowerCase();
        if (!key || seen.has(key)) return;
        seen.add(key);
        state.referrals.unshift(normalizeReferralPartner(item));
        added += 1;
      });
      state.referrals = sanitizeReferrals(state.referrals);
      referralFlowStep = pickReferralFlowStep();
      saveState(added ? 'Added ' + added + ' local prospects.' : 'No new prospects to add.');
      renderView();
    } catch {
      showToast('Prospect scraper unavailable — use npm run serve.');
    }
  }

  function handleImportSubmit(event) {
    event.preventDefault();
    const text = new FormData(event.currentTarget).get('bundle');
    try {
      state = mergeState(state, JSON.parse(text));
      saveState('Dashboard bundle imported.');
      renderView();
    } catch {
      showToast('Import failed: invalid JSON.');
    }
  }
  function findPage(id) { return state.servicePages.find(page => page.id === id); }
  function downloadJson(filename, data) {
    const blob = new Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  main.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    const index = Number(button.dataset.index);
    const id = button.dataset.id;
    if (action === 'remove-referral') state.referrals.splice(index, 1);
    if (action === 'remove-lead') state.leads.splice(index, 1);
    if (action === 'mark-reviewed') { const page = findPage(id); if (page) page.status = 'Approved'; }
    if (action === 'seo-queue') state.seoOpportunities[index].status = 'Queued';
    if (action === 'review-approved') state.reviews[index].status = 'Approved Draft';
    if (action === 'video-ready') Object.assign(state.videos[index], { transcript: true, embedded: true, schemaReady: true, status: 'Ready' });
    if (action === 'campaign-queue') state.campaigns[index].status = 'Queued';
    if (action === 'referral-queue-email') {
      const item = state.referrals[index];
      if (item) {
        item.status = 'To Contact';
        item.nextStep = item.nextStep || 'Preview intro email';
        referralFlowStep = 'email';
      }
    }
    if (action === 'referral-contacted') {
      const item = state.referrals[index];
      if (item) {
        item.status = 'Contacted';
        item.nextStep = new Date().toISOString().slice(0, 10) + ' intro sent · follow up in 5 days';
        referralFlowStep = 'track';
      }
    }
    if (action === 'referral-active') {
      const item = state.referrals[index];
      if (item) {
        item.status = 'Active Partner';
        item.slug = item.slug || partnerSlug(item.business);
        item.qrUrl = partnerQrUrl(item.slug);
        item.nextStep = item.nextStep || 'Print QR desk card + brochure · deliver to front desk';
      }
    }
    if (action === 'referral-restore-samples') {
      restoreReferralSamples();
      return;
    }
    if (action === 'reset-referrals') {
      resetReferralPartnersOnly();
      return;
    }
    if (action === 'scrape-leads') {
      importScrapedLeads();
      return;
    }
    if (action === 'scrape-referrals') {
      importScrapedReferrals();
      return;
    }
    if (action === 'referral-copy-qr') {
      const item = state.referrals[index];
      if (item) {
        const url = item.qrUrl || partnerQrUrl(item.slug || partnerSlug(item.business));
        navigator.clipboard?.writeText(url).then(() => showToast('Partner QR link copied.')).catch(() => showToast('Copy unavailable in this browser.'));
      }
      return;
    }
    if (action === 'referral-flow-step') {
      referralFlowStep = button.dataset.step || 'find';
      renderView();
      return;
    }
    if (action === 'approve-item') state.approvals[index].status = 'Approved';
    if (action === 'export-content') downloadJson('clearwater-content-draft.json', state.content);
    if (action === 'export-all') downloadJson('clearwater-admin-dashboard-export.json', state);
    if (action === 'copy-review-link') {
      navigator.clipboard?.writeText(state.site.googleReviewUrl || '').then(() => showToast('Review link copied.')).catch(() => showToast('Copy unavailable in this browser.'));
    }
    if (action === 'reset-demo') {
      resetEntireDemo();
      return;
    }
    if (action === 'lead-filter') {
      filters.leadSource = button.dataset.source || 'All';
      renderView();
      return;
    }
    if (action === 'referral-preview') return;
    if (['ea-open', 'ea-view', 'ea-sync', 'ea-reply', 'ea-send-demo', 'referral-flow-step', 'referral-preview', 'referral-queue-email', 'referral-copy-qr', 'referral-restore-samples', 'reset-referrals', 'reset-demo', 'scrape-leads', 'scrape-referrals'].includes(action)) return;
    if (!['copy-review-link', 'export-content', 'export-all'].includes(action)) {
      saveState('Dashboard updated.');
      renderView();
    }
  });

  main.addEventListener('change', event => {
    const target = event.target;
    if (target.dataset.action === 'page-status') {
      const page = findPage(target.dataset.id);
      if (page) page.status = target.value;
      saveState('Page status updated.');
    }
    if (target.dataset.action === 'gbp-check') {
      state.gbp.checklist[Number(target.dataset.index)].done = target.checked;
      saveState('GBP checklist updated.');
      renderView();
    }
    if (target.dataset.action === 'referral-status') {
      const item = state.referrals[Number(target.dataset.index)];
      if (item) {
        item.status = target.value;
        if (/active partner/i.test(item.status)) {
          item.slug = item.slug || partnerSlug(item.business);
          item.qrUrl = partnerQrUrl(item.slug);
        }
        saveState('Referral status updated.');
        renderView();
      }
    }
    if (target.dataset.action === 'referral-material') {
      const item = state.referrals[Number(target.dataset.index)];
      if (item) {
        item.materialsSent = item.materialsSent || { qr: false, brochure: false, welcomeEmail: false };
        item.materialsSent[target.dataset.key] = target.checked;
        saveState('Materials checklist updated.');
      }
    }
  });

  main.addEventListener('input', event => {
    const target = event.target;
    if (target.dataset.action === 'keyword') {
      const page = findPage(target.dataset.id);
      if (page) page.targetKeyword = target.value;
      saveState();
    }
    if (target.dataset.action === 'referral-next') {
      const item = state.referrals[Number(target.dataset.index)];
      if (item) {
        item.nextStep = target.value;
        saveState();
      }
    }
  });

  app.addEventListener('click', event => {
    const tabButton = event.target.closest('[data-report-tab]');
    if (tabButton) {
      overviewTab = tabButton.dataset.reportTab;
      renderView();
      return;
    }
    const button = event.target.closest('[data-view]');
    if (button) selectView(button.dataset.view);
  });

  loginForm.addEventListener('submit', async event => {
    event.preventDefault();
    loginMessage.textContent = '';
    try {
      const digest = await sha256(loginInput.value || '');
      if (digest === PASSWORD_HASH) {
        sessionSet(SESSION_KEY, 'unlocked');
        unlock();
      } else {
        loginMessage.textContent = 'Incorrect password.';
      }
    } catch {
      loginMessage.textContent = 'Serve this page from localhost or HTTPS to use the password gate.';
    }
  });

  logoutButton.addEventListener('click', lock);
  exportButton.addEventListener('click', () => { if (state) downloadJson('clearwater-admin-dashboard-export.json', state); });
  navToggle.addEventListener('click', () => {
    const open = !document.body.classList.contains('admin-menu-open');
    document.body.classList.toggle('admin-menu-open', open);
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      document.body.classList.remove('admin-menu-open');
      navToggle.setAttribute('aria-expanded', 'false');
    }
  });

  if (sessionGet(SESSION_KEY) === 'unlocked') unlock();
  else lock();
})();
