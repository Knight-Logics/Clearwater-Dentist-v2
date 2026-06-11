/* Clearwater Dentist — visual page editor for admin */
(function () {
  'use strict';

  window.CWVisualEditor = (function () {
    const PREVIEW_DRAFT_KEY = 'cw-admin-preview-draft-v1';

    function emptyEdits() {
      return { text: {}, images: {}, buttons: {} };
    }

    function normalizeContent(content) {
      const base = Object.assign({}, content || {});
      base.pageEdits = Object.assign(emptyEdits(), base.pageEdits || {});
      base.pageEdits.text = Object.assign({}, base.pageEdits.text || {});
      base.pageEdits.images = Object.assign({}, base.pageEdits.images || {});
      base.pageEdits.buttons = Object.assign({}, base.pageEdits.buttons || {});
      base.collections = base.collections || {};
      if (!Array.isArray(base.collections.beforeAfter)) base.collections.beforeAfter = [];
      return base;
    }

    function storageSet(key, value) {
      try { window.localStorage.setItem(key, JSON.stringify(value)); } catch {}
    }

    function escapeHtml(value) {
      return String(value == null ? '' : value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
    }

    function groupFields(fields, route) {
      const prefix = route === '/' ? 'home.' : route.replace(/^\//, '').replace(/\//g, '--') + '.';
      const buckets = {
        Hero: [],
        Content: [],
        Buttons: [],
        Images: [],
        'Before & after': [],
        Other: []
      };
      fields.forEach(field => {
        if (!field.key.startsWith(prefix) && route !== '/') {
          if (field.key.startsWith('home.')) return;
        }
        const local = field.key.replace(prefix, '');
        if (field.type === 'button') buckets.Buttons.push(field);
        else if (/^compare-/.test(local) || field.key.includes('compare-')) buckets['Before & after'].push(field);
        else if (field.type === 'img' || field.type === 'poster' || field.type === 'background') buckets.Images.push(field);
        else if (/^hero-/.test(local)) buckets.Hero.push(field);
        else if (field.type === 'text') buckets.Content.push(field);
        else buckets.Other.push(field);
      });
      return Object.entries(buckets).filter(([, items]) => items.length).map(([label, items]) => ({ label, items }));
    }

    function previewUrl(route) {
      const path = route === '/' ? '/' : route;
      return path + '?cwAdminPreview=1&cwRoute=' + encodeURIComponent(route);
    }

    function mount(root, options) {
      const opts = options || {};
      const pages = (opts.pages || []).slice().sort((a, b) => {
        if (a.route === '/') return -1;
        if (b.route === '/') return 1;
        return String(a.title).localeCompare(String(b.title));
      });
      let dirty = false;
      let draft = normalizeContent(opts.content);
      let currentRoute = '/';
      let iframe = null;
      let selectedKey = null;
      let fields = [];
      let beforeAfterCases = draft.collections.beforeAfter.slice();

      root.innerHTML =
        '<div class="cw-visual-editor">' +
          '<div class="cw-visual-editor__toolbar">' +
            '<div class="cw-visual-editor__toolbar-copy">' +
              '<strong>Page editor</strong>' +
              '<span>Switch pages above the preview. Click blocks to edit text, buttons, and images.</span>' +
            '</div>' +
            '<div class="cw-visual-editor__toolbar-actions">' +
              '<a class="button button-secondary" id="cw-open-live" href="/" target="_blank" rel="noopener noreferrer">Open live page ↗</a>' +
              '<button class="button button-primary" type="button" id="cw-visual-save" disabled>Save changes</button>' +
            '</div>' +
          '</div>' +
          '<div class="cw-page-nav" id="cw-page-nav">' +
            '<div class="cw-page-nav__quick" id="cw-page-quick"></div>' +
            '<label class="cw-page-nav__select-wrap">Page<select class="select" id="cw-page-select"></select></label>' +
          '</div>' +
          '<div class="admin-unsaved-banner" id="cw-unsaved-banner" hidden role="status">' +
            '<strong>Changes are currently not saved.</strong>' +
            ' Click <em>Save changes</em> to keep drafts on this computer (not live on clearwaterdentist.com yet).' +
          '</div>' +
          '<div class="cw-visual-editor__body">' +
            '<iframe class="cw-visual-editor__frame" id="cw-visual-frame" title="Page draft preview"></iframe>' +
            '<aside class="cw-visual-editor__inspector" id="cw-visual-inspector" aria-live="polite">' +
              '<div id="cw-collections-panel"></div>' +
              '<div class="cw-visual-editor__field-list" id="cw-visual-field-list"></div>' +
              '<div class="cw-visual-editor__selection" id="cw-visual-selection" hidden>' +
                '<p class="cw-visual-editor__inspector-kicker">Selected element</p>' +
                '<h3 id="cw-visual-inspector-title">—</h3>' +
                '<div id="cw-visual-inspector-body"></div>' +
              '</div>' +
            '</aside>' +
          '</div>' +
        '</div>';

      const banner = root.querySelector('#cw-unsaved-banner');
      const saveBtn = root.querySelector('#cw-visual-save');
      const fieldList = root.querySelector('#cw-visual-field-list');
      const collectionsPanel = root.querySelector('#cw-collections-panel');
      const selectionPanel = root.querySelector('#cw-visual-selection');
      const inspectorTitle = root.querySelector('#cw-visual-inspector-title');
      const inspectorBody = root.querySelector('#cw-visual-inspector-body');
      const pageSelect = root.querySelector('#cw-page-select');
      const pageQuick = root.querySelector('#cw-page-quick');
      const openLive = root.querySelector('#cw-open-live');
      iframe = root.querySelector('#cw-visual-frame');

      function markDirty() {
        dirty = true;
        banner.hidden = false;
        saveBtn.disabled = false;
      }

      function clearDirty() {
        dirty = false;
        banner.hidden = true;
        saveBtn.disabled = true;
      }

      function pushDraftToPreview() {
        if (!iframe || !iframe.contentWindow) return;
        draft.collections.beforeAfter = beforeAfterCases.slice();
        iframe.contentWindow.postMessage({ source: 'cw-admin-editor', type: 'cw-apply-draft', content: draft }, '*');
        storageSet(PREVIEW_DRAFT_KEY, { content: draft, updatedAt: new Date().toISOString() });
      }

      function loadRoute(route, forceReload) {
        currentRoute = route || '/';
        openLive.href = currentRoute;
        pageSelect.value = currentRoute;
        pageQuick.querySelectorAll('[data-route]').forEach(btn => {
          btn.classList.toggle('is-active', btn.dataset.route === currentRoute);
        });
        const target = previewUrl(currentRoute);
        if (forceReload || iframe.getAttribute('src') !== target) {
          iframe.src = target;
        } else {
          pushDraftToPreview();
        }
        renderCollectionsPanel();
      }

      function selectFieldInPreview(key) {
        if (!iframe || !iframe.contentWindow) return;
        iframe.contentWindow.postMessage({ source: 'cw-admin-editor', type: 'cw-select-field', key }, '*');
      }

      function fieldMeta(key) {
        return fields.find(field => field.key === key);
      }

      function ensureImageEntry(key) {
        draft.pageEdits.images[key] = Object.assign({ src: '', position: '50% 50%' }, draft.pageEdits.images[key]);
        return draft.pageEdits.images[key];
      }

      function ensureButtonEntry(key) {
        draft.pageEdits.buttons[key] = Object.assign({ text: '', href: '' }, draft.pageEdits.buttons[key]);
        return draft.pageEdits.buttons[key];
      }

      function renderCollectionsPanel() {
        if (currentRoute !== '/') {
          collectionsPanel.innerHTML = '';
          return;
        }
        const rows = beforeAfterCases.map((item, index) =>
          '<div class="cw-case-row">' +
            '<strong>' + escapeHtml(item.name || ('Case ' + (index + 1))) + '</strong>' +
            '<span class="cw-case-row__meta">' + (item.before && item.after ? '2 images' : 'Needs images') + '</span>' +
            '<button type="button" class="text-button" data-case-select="' + index + '">Edit</button>' +
            '<button type="button" class="text-button" data-case-remove="' + index + '">Remove</button>' +
          '</div>'
        ).join('');
        collectionsPanel.innerHTML =
          '<div class="cw-collections-panel">' +
            '<p class="cw-visual-editor__inspector-kicker">Before &amp; after cases</p>' +
            '<p class="cw-visual-hint cw-visual-hint--tight">Add a new slider — upload before &amp; after images after it appears.</p>' +
            '<div class="cw-case-list">' + (rows || '<p class="cw-visual-hint">No cases yet.</p>') + '</div>' +
            '<button type="button" class="button button-secondary cw-case-add" id="cw-case-add">+ Add before/after case</button>' +
          '</div>';

        collectionsPanel.querySelector('#cw-case-add')?.addEventListener('click', () => {
          const index = beforeAfterCases.length;
          beforeAfterCases.push({
            id: 'case-' + Date.now(),
            name: 'New smile case',
            before: '',
            after: ''
          });
          draft.pageEdits.text['home.compare-' + index + '-title'] = 'New smile case';
          markDirty();
          pushDraftToPreview();
          renderCollectionsPanel();
        });
        collectionsPanel.querySelectorAll('[data-case-remove]').forEach(btn => {
          btn.addEventListener('click', () => {
            const index = Number(btn.dataset.caseRemove);
            beforeAfterCases.splice(index, 1);
            markDirty();
            pushDraftToPreview();
            renderCollectionsPanel();
          });
        });
        collectionsPanel.querySelectorAll('[data-case-select]').forEach(btn => {
          btn.addEventListener('click', () => {
            const index = Number(btn.dataset.caseSelect);
            selectFieldInPreview('home.compare-' + index + '-title');
          });
        });
      }

      function renderFieldList() {
        const groups = groupFields(fields, currentRoute);
        fieldList.innerHTML =
          '<p class="cw-visual-editor__inspector-kicker">Editable on this page</p>' +
          '<p class="cw-visual-hint cw-visual-hint--tight">' + fields.length + ' blocks · route <code>' + escapeHtml(currentRoute) + '</code></p>' +
          groups.map(group =>
            '<details class="cw-visual-field-group" open>' +
              '<summary>' + escapeHtml(group.label) + ' <span>(' + group.items.length + ')</span></summary>' +
              '<div class="cw-visual-field-group__items">' +
                group.items.map(item =>
                  '<button type="button" class="cw-visual-field-btn' + (item.key === selectedKey ? ' is-active' : '') + '" data-field-key="' + escapeHtml(item.key) + '">' +
                    '<span class="cw-visual-field-btn__type">' + escapeHtml(item.type) + '</span>' +
                    '<span class="cw-visual-field-btn__label">' + escapeHtml(item.label) + '</span>' +
                  '</button>'
                ).join('') +
              '</div>' +
            '</details>'
          ).join('');

        fieldList.querySelectorAll('[data-field-key]').forEach(button => {
          button.addEventListener('click', () => selectFieldInPreview(button.dataset.fieldKey));
        });
      }

      function renderInspector(key) {
        const meta = fieldMeta(key);
        selectedKey = key || null;
        renderFieldList();
        if (!meta) {
          selectionPanel.hidden = true;
          return;
        }
        selectionPanel.hidden = false;
        inspectorTitle.textContent = meta.label || key;

        if (meta.type === 'text') {
          const value = draft.pageEdits.text[meta.key] || '';
          inspectorBody.innerHTML =
            '<label class="field-block wide"><span>Text</span>' +
            '<textarea class="cw-visual-text" rows="5">' + escapeHtml(value) + '</textarea></label>' +
            '<p class="cw-visual-hint">Click the block on the page to type inline.</p>';
          inspectorBody.querySelector('.cw-visual-text').addEventListener('input', event => {
            draft.pageEdits.text[meta.key] = event.target.value;
            markDirty();
            pushDraftToPreview();
          });
          return;
        }

        if (meta.type === 'button') {
          const entry = ensureButtonEntry(meta.key);
          inspectorBody.innerHTML =
            '<label class="field-block"><span>Button label</span><input class="field cw-visual-btn-text" value="' + escapeHtml(entry.text || '') + '"></label>' +
            '<label class="field-block wide"><span>Link (href)</span><input class="field cw-visual-btn-href" value="' + escapeHtml(entry.href || '') + '"></label>' +
            '<p class="cw-visual-hint">Click the button on the page to edit label inline. Use this panel for the link URL.</p>';
          const textInput = inspectorBody.querySelector('.cw-visual-btn-text');
          const hrefInput = inspectorBody.querySelector('.cw-visual-btn-href');
          textInput.addEventListener('input', () => {
            entry.text = textInput.value;
            markDirty();
            pushDraftToPreview();
          });
          hrefInput.addEventListener('change', () => {
            entry.href = hrefInput.value.trim();
            markDirty();
            pushDraftToPreview();
          });
          return;
        }

        const entry = ensureImageEntry(meta.key);
        inspectorBody.innerHTML =
          '<div class="cw-visual-dropzone" tabindex="0">' +
            '<strong>Drop replacement image</strong>' +
            '<span>Or drag onto the image in the preview</span>' +
            '<input type="file" accept="image/*" class="cw-visual-file">' +
          '</div>' +
          '<label class="field-block"><span>Focal position</span>' +
          '<input class="field cw-visual-position" value="' + escapeHtml(entry.position || '50% 50%') + '"></label>' +
          '<p class="cw-visual-hint">Drag the selected image in the preview to reposition.</p>';

        const fileInput = inspectorBody.querySelector('.cw-visual-file');
        const positionInput = inspectorBody.querySelector('.cw-visual-position');
        const dropzone = inspectorBody.querySelector('.cw-visual-dropzone');

        function applyFile(file) {
          if (!file || !file.type.startsWith('image/')) return;
          const reader = new FileReader();
          reader.onload = () => {
            entry.src = String(reader.result || '');
            markDirty();
            pushDraftToPreview();
          };
          reader.readAsDataURL(file);
        }

        dropzone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', () => applyFile(fileInput.files && fileInput.files[0]));
        dropzone.addEventListener('dragover', event => { event.preventDefault(); dropzone.classList.add('is-active'); });
        dropzone.addEventListener('dragleave', () => dropzone.classList.remove('is-active'));
        dropzone.addEventListener('drop', event => {
          event.preventDefault();
          dropzone.classList.remove('is-active');
          applyFile(event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]);
        });
        positionInput.addEventListener('change', () => {
          entry.position = positionInput.value.trim() || '50% 50%';
          markDirty();
          pushDraftToPreview();
        });
      }

      function buildPageNav() {
        const quickRoutes = ['/', '/meet-the-doctor', '/contact-us', '/general-dentistry', '/dental-implants-clearwater-fl', '/before-and-after'];
        const quickPages = quickRoutes.map(route => pages.find(p => p.route === route)).filter(Boolean);
        pageQuick.innerHTML = quickPages.map(page =>
          '<button type="button" class="cw-page-tab" data-route="' + escapeHtml(page.route) + '">' + escapeHtml(page.route === '/' ? 'Home' : (page.title || page.route).split('|')[0].trim().slice(0, 28)) + '</button>'
        ).join('');
        pageSelect.innerHTML = pages.map(page =>
          '<option value="' + escapeHtml(page.route) + '">' + escapeHtml((page.title || page.route).replace(/\s+/g, ' ').slice(0, 72)) + '</option>'
        ).join('');
        pageQuick.querySelectorAll('[data-route]').forEach(btn => {
          btn.addEventListener('click', () => loadRoute(btn.dataset.route, true));
        });
        pageSelect.addEventListener('change', () => loadRoute(pageSelect.value, true));
      }

      function handlePreviewMessage(event) {
        const data = event.data || {};
        if (data.source !== 'cw-site-preview') return;
        if (data.type === 'cw-preview-ready') {
          if (data.route) currentRoute = data.route;
          fields = data.fields || [];
          if (Array.isArray(data.beforeAfterCases) && data.beforeAfterCases.length) {
            beforeAfterCases = data.beforeAfterCases.slice();
          }
          renderCollectionsPanel();
          renderFieldList();
          pushDraftToPreview();
          return;
        }
        if (data.type === 'cw-select') {
          renderInspector(data.key);
          return;
        }
        if (data.type === 'cw-deselect') {
          selectedKey = null;
          selectionPanel.hidden = true;
          renderFieldList();
          return;
        }
        if (data.type === 'cw-change') {
          if (data.value != null && data.key) draft.pageEdits.text[data.key] = data.value;
          if (data.button && data.key) draft.pageEdits.buttons[data.key] = data.button;
          if (data.key && (data.src || data.position)) {
            const entry = ensureImageEntry(data.key);
            if (data.src) entry.src = data.src;
            if (data.position) entry.position = data.position;
          }
          markDirty();
          storageSet(PREVIEW_DRAFT_KEY, { content: draft, updatedAt: new Date().toISOString() });
        }
      }

      saveBtn.addEventListener('click', () => {
        draft.collections.beforeAfter = beforeAfterCases.slice();
        if (typeof opts.onSave === 'function') opts.onSave(draft);
        try { window.localStorage.removeItem(PREVIEW_DRAFT_KEY); } catch {}
        clearDirty();
        if (typeof opts.onToast === 'function') opts.onToast('Page drafts saved on this computer.');
      });

      window.addEventListener('message', handlePreviewMessage);
      iframe.addEventListener('load', pushDraftToPreview);

      buildPageNav();
      loadRoute('/', true);

      return {
        isDirty: () => dirty,
        getDraft: () => draft,
        destroy: () => window.removeEventListener('message', handlePreviewMessage)
      };
    }

    return { mount };
  })();
})();
