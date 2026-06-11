/* Clearwater Dentist — admin visual preview (?cwAdminPreview=1&cwRoute=/path) */
(function () {
  'use strict';

  if (!/[?&]cwAdminPreview=1(?:&|$)/.test(window.location.search)) return;

  const STATE_KEY = 'cw-admin-demo-state-v1';
  const PREVIEW_DRAFT_KEY = 'cw-admin-preview-draft-v1';
  const COMPARE_REVEAL_DIRS = ['left', 'bottom', 'right-soft'];

  let FIELDS = [];
  let activeKey = null;
  let dragState = null;
  let currentRoute = '/';

  function getPreviewRoute() {
    const match = window.location.search.match(/[?&]cwRoute=([^&]+)/);
    if (!match) return '/';
    try {
      const route = decodeURIComponent(match[1]);
      return route.startsWith('/') ? route : '/' + route;
    } catch {
      return '/';
    }
  }

  function readJson(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function emptyEdits() {
    return { text: {}, images: {}, buttons: {} };
  }

  function normalizeContent(raw) {
    const content = Object.assign({}, raw || {});
    content.pageEdits = Object.assign(emptyEdits(), content.pageEdits || {});
    content.pageEdits.text = Object.assign({}, content.pageEdits.text || {});
    content.pageEdits.images = Object.assign({}, content.pageEdits.images || {});
    content.pageEdits.buttons = Object.assign({}, content.pageEdits.buttons || {});
    content.collections = content.collections || {};
    content.collections.beforeAfter = Array.isArray(content.collections.beforeAfter) ? content.collections.beforeAfter : null;

    const legacyText = {
      heroHeadline: 'home.hero-h1',
      heroSubline: 'home.hero-subline',
      doctorNote: 'home.hero-lede',
      heroEyebrow: 'home.hero-eyebrow'
    };
    Object.keys(legacyText).forEach(oldKey => {
      if (content[oldKey] && !content.pageEdits.text[legacyText[oldKey]]) {
        content.pageEdits.text[legacyText[oldKey]] = content[oldKey];
      }
    });
    if (content.images && typeof content.images === 'object') {
      Object.keys(content.images).forEach(key => {
        const mapped = 'home.' + key;
        if (!content.pageEdits.images[mapped]) content.pageEdits.images[mapped] = content.images[key];
      });
    }
    return content;
  }

  function getDraft() {
    const preview = readJson(PREVIEW_DRAFT_KEY);
    if (preview && preview.content) return normalizeContent(preview.content);
    const saved = readJson(STATE_KEY);
    return normalizeContent(saved && saved.content ? saved.content : {});
  }

  function scrapeBeforeAfterCases() {
    return Array.from(document.querySelectorAll('[data-cw-compare-grid] .compare-card')).map((card, index) => ({
      id: card.getAttribute('data-cw-compare-id') || ('case-' + index),
      name: card.querySelector('h3')?.textContent?.trim() || 'Smile case',
      before: card.querySelector('.compare-before')?.getAttribute('src') || '',
      after: card.querySelector('.compare-after')?.getAttribute('src') || ''
    }));
  }

  function compareCardHtml(pair, index) {
    const dir = COMPARE_REVEAL_DIRS[index % COMPARE_REVEAL_DIRS.length] || 'left';
    const caseId = pair.id || ('case-' + index);
    const name = pair.name || 'Smile case';
    const before = pair.before || '';
    const after = pair.after || '';
    return '<article class="compare-card cw-reveal" data-cw-compare-id="' + caseId + '" data-cw-compare-index="' + index + '" data-cw-reveal="' + dir + '">' +
      '<div class="compare-slider" style="--position:50%">' +
      '<img class="compare-img compare-before" data-cw-edit="home.compare-' + index + '-before" data-cw-edit-label="Before image ' + (index + 1) + '" data-cw-edit-type="img" src="' + before + '" alt="' + name + ' before" loading="' + (index === 0 ? 'eager' : 'lazy') + '">' +
      '<div class="compare-after-wrap"><img class="compare-img compare-after" data-cw-edit="home.compare-' + index + '-after" data-cw-edit-label="After image ' + (index + 1) + '" data-cw-edit-type="img" src="' + after + '" alt="' + name + ' after" loading="' + (index === 0 ? 'eager' : 'lazy') + '"></div>' +
      '<input class="compare-range" type="range" min="0" max="100" value="50" aria-label="Reveal before and after image">' +
      '<span class="compare-handle" aria-hidden="true"></span>' +
      '<span class="compare-label compare-label-before">Before</span>' +
      '<span class="compare-label compare-label-after">After</span></div>' +
      '<h3 data-cw-edit="home.compare-' + index + '-title" data-cw-edit-label="Case title ' + (index + 1) + '" data-cw-edit-type="text">' + name + '</h3></article>';
  }

  function renderBeforeAfterGrid(cases) {
    const grid = document.querySelector('[data-cw-compare-grid]');
    if (!grid || !cases || !cases.length) return;
    grid.innerHTML = cases.map((pair, index) => compareCardHtml(pair, index)).join('');
    if (window.mainJsInitCompareSliders) window.mainJsInitCompareSliders(grid);
    else grid.querySelectorAll('.compare-range').forEach(input => {
      const card = input.closest('.compare-slider');
      if (!card) return;
      input.addEventListener('input', () => { card.style.setProperty('--position', input.value + '%'); });
    });
  }

  function syncBeforeAfterFromEdits(content, cases) {
    return (cases || []).map((item, index) => {
      const titleKey = 'home.compare-' + index + '-title';
      const beforeKey = 'home.compare-' + index + '-before';
      const afterKey = 'home.compare-' + index + '-after';
      return {
        id: item.id || ('case-' + index),
        name: content.pageEdits.text[titleKey] || item.name || 'Smile case',
        before: (content.pageEdits.images[beforeKey] && content.pageEdits.images[beforeKey].src) || item.before || '',
        after: (content.pageEdits.images[afterKey] && content.pageEdits.images[afterKey].src) || item.after || ''
      };
    });
  }

  function autoTagImages() {
    const routePrefix = currentRoute === '/' ? 'home' : currentRoute.replace(/^\//, '').replace(/\//g, '--');
    document.querySelectorAll('.article-body img, .content-section img, .cw-inline-figure-img, .cw-team-profile-img').forEach((img, index) => {
      if (img.closest('[data-cw-compare-grid]')) return;
      if (img.hasAttribute('data-cw-edit')) return;
      const key = routePrefix + '.content-img-' + index;
      img.setAttribute('data-cw-edit', key);
      img.setAttribute('data-cw-edit-label', 'Content image ' + (index + 1));
      img.setAttribute('data-cw-edit-type', 'img');
    });
  }

  function buildFieldsFromDOM() {
    autoTagImages();
    const fields = [];
    document.querySelectorAll('[data-cw-edit]').forEach(el => {
      const key = el.getAttribute('data-cw-edit');
      if (!key) return;
      const label = el.getAttribute('data-cw-edit-label') || key;
      let type = el.getAttribute('data-cw-edit-type') || 'text';
      if (!el.getAttribute('data-cw-edit-type')) {
        if (el.tagName === 'VIDEO' && el.hasAttribute('poster')) type = 'poster';
        else if (el.tagName === 'IMG') type = 'img';
        else if (el.classList.contains('cw-before-after-band__media') || (el.hasAttribute('data-before-after-parallax'))) type = 'background';
        else if (el.tagName === 'A' && el.classList.contains('btn')) type = 'button';
      }
      fields.push({
        key,
        selector: '[data-cw-edit="' + key.replace(/"/g, '\\"') + '"]',
        type,
        label,
        el,
        positionTarget: type === 'poster' ? '.home-hero-media' : null
      });
    });
    return fields;
  }

  function applyText(field, el, value) {
    if (value == null || !String(value).trim()) return;
    el.textContent = value;
  }

  function applyButton(field, el, value) {
    if (!value) return;
    if (value.text != null && String(value.text).trim()) el.textContent = value.text;
    if (value.href) el.setAttribute('href', value.href);
  }

  function applyField(field, content) {
    const el = field.el || document.querySelector(field.selector);
    if (!el) return;
    const edits = content.pageEdits || emptyEdits();

    if (field.type === 'text') {
      applyText(field, el, edits.text[field.key]);
      return;
    }
    if (field.type === 'button') {
      applyButton(field, el, edits.buttons[field.key]);
      return;
    }

    const entry = edits.images[field.key] || { src: '', position: '50% 50%' };
    if (field.type === 'poster') {
      if (entry.src) el.setAttribute('poster', entry.src);
      if (entry.position) el.style.objectPosition = entry.position;
    }
    if (field.type === 'img') {
      if (entry.src) el.setAttribute('src', entry.src);
      if (entry.position) el.style.objectPosition = entry.position;
    }
    if (field.type === 'background') {
      if (entry.src) el.style.backgroundImage = 'url("' + String(entry.src).replace(/"/g, '\\"') + '")';
      if (entry.position) el.style.backgroundPosition = entry.position;
    }
  }

  function applyDraft(content) {
    const normalized = normalizeContent(content);
    if (currentRoute === '/') {
      let cases = normalized.collections.beforeAfter;
      if (!cases || !cases.length) cases = scrapeBeforeAfterCases();
      cases = syncBeforeAfterFromEdits(normalized, cases);
      renderBeforeAfterGrid(cases);
      normalized.collections.beforeAfter = cases;
    }
    FIELDS = buildFieldsFromDOM();
    FIELDS.forEach(field => applyField(field, normalized));
  }

  function fieldByKey(key) {
    return FIELDS.find(field => field.key === key);
  }

  function notifyParent(message) {
    if (window.parent && window.parent !== window) {
      window.parent.postMessage(Object.assign({ source: 'cw-site-preview', route: currentRoute }, message), '*');
    }
  }

  function scrollToField(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function setActive(key) {
    document.querySelectorAll('[data-cw-edit].is-selected').forEach(node => {
      node.classList.remove('is-selected');
      node.removeAttribute('contenteditable');
    });
    activeKey = key || null;
    if (!key) {
      notifyParent({ type: 'cw-deselect' });
      return;
    }
    const field = fieldByKey(key);
    const el = field && (field.el || document.querySelector(field.selector));
    if (!el || !field) return;
    el.classList.add('is-selected');
    scrollToField(el);
    if (field.type === 'text' || field.type === 'button') {
      el.setAttribute('contenteditable', 'true');
      el.focus();
    }
    notifyParent({ type: 'cw-select', key, fieldType: field.type, label: field.label });
  }

  function readTextValue(key) {
    const field = fieldByKey(key);
    const el = field && (field.el || document.querySelector(field.selector));
    return el ? el.textContent.trim() : '';
  }

  function readButtonValue(key) {
    const field = fieldByKey(key);
    const el = field && (field.el || document.querySelector(field.selector));
    if (!el) return { text: '', href: '' };
    return { text: el.textContent.trim(), href: el.getAttribute('href') || '' };
  }

  function dragTarget(field, el) {
    if (field.type === 'poster') return document.querySelector(field.positionTarget) || el;
    return el;
  }

  function updateImagePosition(field, el, clientX, clientY) {
    const target = dragTarget(field, el);
    const rect = target.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    const position = x.toFixed(1) + '% ' + y.toFixed(1) + '%';
    if (field.type === 'img') el.style.objectPosition = position;
    if (field.type === 'background') el.style.backgroundPosition = position;
    if (field.type === 'poster') el.style.objectPosition = position;
    notifyParent({ type: 'cw-change', key: field.key, position, src: null });
  }

  function bindImageDrag(field, el) {
    const target = dragTarget(field, el);
    target.addEventListener('pointerdown', event => {
      if (activeKey !== field.key) return;
      event.preventDefault();
      dragState = { field, el, target, pointerId: event.pointerId };
      target.setPointerCapture(event.pointerId);
      updateImagePosition(field, el, event.clientX, event.clientY);
    });
    target.addEventListener('pointermove', event => {
      if (!dragState || dragState.target !== target) return;
      event.preventDefault();
      updateImagePosition(dragState.field, dragState.el, event.clientX, event.clientY);
    });
    target.addEventListener('pointerup', event => {
      if (!dragState || dragState.target !== target) return;
      dragState = null;
      try { target.releasePointerCapture(event.pointerId); } catch {}
    });
  }

  function applyImageFile(field, el, src) {
    if (field.type === 'poster') el.setAttribute('poster', src);
    else if (field.type === 'img') el.setAttribute('src', src);
    else el.style.backgroundImage = 'url("' + String(src).replace(/"/g, '\\"') + '")';
    notifyParent({ type: 'cw-change', key: field.key, src, position: null });
  }

  function wireFields() {
    FIELDS.forEach(field => {
      const el = field.el || document.querySelector(field.selector);
      if (!el) return;
      field.el = el;
      el.setAttribute('title', 'Click to edit: ' + field.label);

      el.addEventListener('click', event => {
        event.preventDefault();
        event.stopPropagation();
        setActive(field.key);
      });

      if (field.type === 'text') {
        el.addEventListener('input', () => {
          notifyParent({ type: 'cw-change', key: field.key, value: readTextValue(field.key) });
        });
        el.addEventListener('blur', () => {
          notifyParent({ type: 'cw-change', key: field.key, value: readTextValue(field.key) });
        });
      }

      if (field.type === 'button') {
        const pushButton = () => notifyParent({ type: 'cw-change', key: field.key, button: readButtonValue(field.key) });
        el.addEventListener('input', pushButton);
        el.addEventListener('blur', pushButton);
      }

      if (field.type === 'img' || field.type === 'background' || field.type === 'poster') {
        bindImageDrag(field, el);
        const dropTarget = dragTarget(field, el);
        dropTarget.addEventListener('dragover', event => {
          if (activeKey !== field.key) return;
          event.preventDefault();
          dropTarget.classList.add('is-drop-target');
        });
        dropTarget.addEventListener('dragleave', () => dropTarget.classList.remove('is-drop-target'));
        dropTarget.addEventListener('drop', event => {
          if (activeKey !== field.key) return;
          event.preventDefault();
          dropTarget.classList.remove('is-drop-target');
          const file = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
          if (!file || !file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = () => applyImageFile(field, el, String(reader.result || ''));
          reader.readAsDataURL(file);
        });
      }
    });

    document.body.addEventListener('click', event => {
      if (!event.target.closest('[data-cw-edit]')) setActive(null);
    });
  }

  window.addEventListener('message', event => {
    const data = event.data || {};
    if (data.source !== 'cw-admin-editor') return;
    if (data.type === 'cw-apply-draft' && data.content) applyDraft(data.content);
    if (data.type === 'cw-select-field' && data.key) setActive(data.key);
  });

  function blockPreviewNavigation() {
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || link.closest('[data-cw-edit]')) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
  }

  function init() {
    currentRoute = getPreviewRoute();
    document.body.classList.add('cw-admin-preview-mode');
    const draft = getDraft();
    if (currentRoute === '/' && (!draft.collections.beforeAfter || !draft.collections.beforeAfter.length)) {
      draft.collections.beforeAfter = scrapeBeforeAfterCases();
    }
    applyDraft(draft);
    wireFields();
    blockPreviewNavigation();
    notifyParent({
      type: 'cw-preview-ready',
      route: currentRoute,
      fields: FIELDS.map(field => ({ key: field.key, label: field.label, type: field.type })),
      beforeAfterCases: (draft.collections && draft.collections.beforeAfter) || []
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
