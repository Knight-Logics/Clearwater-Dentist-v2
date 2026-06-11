/* Single-mailbox Email Agent panel for Clearwater admin (demo: support@knightlogics.com) */
(function () {
  'use strict';

  const ACCOUNT = {
    id: 'zoho_knightlogics',
    email: 'support@knightlogics.com',
    displayName: 'Knight Logics',
    label: 'Clearwater partnership demo'
  };

  const DEMO_SEND_TO = 'nick@tryknightlogics.com';

  const PROXY = '/api/email-proxy';
  const VIEWS = [
    { id: 'inbox', label: 'Inbox' },
    { id: 'crm_reply', label: 'CRM Replies' },
    { id: 'crm_sent', label: 'CRM Sent' },
    { id: 'manual_sent', label: 'Manual Sent' },
    { id: 'all_mail', label: 'All mail' }
  ];

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function avatarColor(email) {
    let hash = 0;
    const s = String(email || '?');
    for (let i = 0; i < s.length; i++) hash = s.charCodeAt(i) + ((hash << 5) - hash);
    const hues = ['#163f56', '#0f766e', '#2f6272', '#b87a2c', '#5b4b8a'];
    return hues[Math.abs(hash) % hues.length];
  }

  function initials(name, email) {
    const n = String(name || '').trim();
    if (n && n !== 'null') {
      const parts = n.split(/\s+/).filter(Boolean);
      if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
      return n.slice(0, 2).toUpperCase();
    }
    return String(email || '?').slice(0, 2).toUpperCase();
  }

  function formatDate(value) {
    if (!value) return '';
    try {
      const d = new Date(value);
      const now = new Date();
      if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      }
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return String(value);
    }
  }

  function wrapEmailHtml(html) {
    if (!html) return '';
    if (/<html/i.test(html)) {
      const baseline = '<style>html,body{margin:0;padding:0}body{padding:16px;color:#202124;font:14px/1.6 Arial,sans-serif}img{max-width:100%!important;height:auto!important}</style>';
      return /<\/head>/i.test(html) ? html.replace(/<\/head>/i, baseline + '</head>') : html;
    }
    return '<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;padding:16px;color:#202124;font:14px/1.6 Arial,sans-serif}img{max-width:100%!important;height:auto!important}</style></head><body>' + html + '</body></html>';
  }

  function referralEmailContent() {
    if (window.CWReferralOutreach) {
      return window.CWReferralOutreach.generateEmailContent({
        business: 'Kontour Medical Aesthetics',
        group: 'Med spas',
        city: 'Clearwater, FL',
        contactEmail: DEMO_SEND_TO,
        angle: 'XERF + cosmetic dentistry — patients often ask about veneers and whitening before events'
      }, 'first_touch', { domain: 'https://www.clearwaterdentist.com' });
    }
    return {
      subject: 'Partnership idea for Kontour Medical Aesthetics patients in Clearwater?',
      textBody: 'Hi,\n\nPartnership intro for Clearwater Dentist (Dr. Nadia) — med spa referral path with XERF skin tightening + smile makeovers.\n\n— Knight Logics',
      htmlBody: '<p>Partnership intro for <strong>Clearwater Dentist</strong> referral program.</p>'
    };
  }

  function buildDemoMessages() {
    const outreach = referralEmailContent();

    return [
      {
        id: 'demo-9002',
        demo: true,
        account_id: ACCOUNT.id,
        subject: outreach.subject,
        from_name: 'Clearwater Dentist Partnerships',
        from_email: ACCOUNT.email,
        to_name: 'Nicholas Knight',
        to_email: DEMO_SEND_TO,
        received_at: new Date(Date.now() - 3600000 * 28).toISOString(),
        snippet: 'I came across Kontour Medical Aesthetics in Clearwater and wanted to reach out about a local referral partnership with Clearwater Dentist…',
        body_text: outreach.textBody,
        body_html: outreach.htmlBody,
        is_unread: false,
        folder: 'sent',
        has_attachments: false,
        categories: ['KL Auto Sent'],
        priority: { level: null }
      },
      {
        id: 'demo-9001',
        demo: true,
        account_id: ACCOUNT.id,
        subject: 'Re: ' + outreach.subject,
        from_name: 'Maria — Kontour Medical Aesthetics',
        from_email: 'manager@kontourmed.example',
        to_name: 'Knight Logics Support',
        to_email: ACCOUNT.email,
        received_at: new Date(Date.now() - 3600000 * 5).toISOString(),
        snippet: 'Yes — we would be open to a short call next week. Can you send the brochure PDF with QR for our front desk?',
        body_text: 'Hi,\n\nYes — we would be open to a short call next week. Can you send the brochure PDF with QR for our front desk? We get a lot of patients asking about teeth before events.\n\nThanks,\nMaria\nOffice Manager, Kontour Medical Aesthetics',
        body_html: '<p>Hi,</p><p>Yes — we would be open to a short call next week. Can you send the <strong>brochure PDF with QR</strong> for our front desk? We get a lot of patients asking about teeth before events.</p><p>Thanks,<br>Maria<br><em>Office Manager, Kontour Medical Aesthetics</em></p>',
        is_unread: true,
        folder: 'inbox',
        has_attachments: false,
        categories: ['KL CRM Reply'],
        priority: { level: 'p1' }
      },
      {
        id: 'demo-9004',
        demo: true,
        account_id: ACCOUNT.id,
        subject: 'Clearwater Dentist — med spa brochure + QR proof',
        from_name: 'Nicholas Knight',
        from_email: 'nick@tryknightlogics.com',
        to_name: 'Knight Logics Support',
        to_email: ACCOUNT.email,
        received_at: new Date(Date.now() - 3600000 * 80).toISOString(),
        snippet: 'Draft PDF + QR for Kontour partnership packet — review before print run.',
        body_text: 'Team,\n\nAttached draft PDF + QR placement for the Kontour med spa partner packet.\n\nQR will point to: clearwaterdentist.com/ref/kontour-med-spa\n\n— Nick',
        body_html: '<p>Team,</p><p>Draft <strong>PDF + QR</strong> for the Kontour med spa partner packet.</p><p>QR will point to: <a href="https://www.clearwaterdentist.com/contact-us">clearwaterdentist.com/ref/kontour-med-spa</a></p><p>— Nick</p>',
        is_unread: true,
        folder: 'inbox',
        has_attachments: true,
        categories: [],
        priority: { level: 'p1' }
      },
      {
        id: 'demo-9003',
        demo: true,
        account_id: ACCOUNT.id,
        subject: 'Mail delivery failed: office@bad-address.example',
        from_name: 'Mail Delivery Subsystem',
        from_email: 'mailer-daemon@zoho.com',
        to_name: '',
        to_email: ACCOUNT.email,
        received_at: new Date(Date.now() - 3600000 * 52).toISOString(),
        snippet: 'Delivery failed for recipient office@bad-address.example',
        body_text: 'Bounce notification (demo) — live Email Agent hides these in System Auto-Trash.',
        body_html: '<p><strong>Delivery failed</strong> for <code>office@bad-address.example</code></p><p>In production, OutreachEngine marks the send as <em>bounced</em> and re-queues the lead.</p>',
        is_unread: false,
        folder: 'inbox',
        has_attachments: false,
        categories: ['System Auto-Trash'],
        priority: { level: null }
      }
    ];
  }

  function filterMessages(messages, view) {
    return messages.filter(item => {
      const cats = item.categories || [];
      const folder = String(item.folder || '').toLowerCase();
      if (cats.some(c => /System Auto-Trash/i.test(c))) return view === 'all_mail';
      if (view === 'crm_reply') return folder !== 'sent' && cats.some(c => /CRM Reply/i.test(c));
      if (view === 'crm_sent') return folder === 'sent' && cats.some(c => /Auto Sent/i.test(c));
      if (view === 'manual_sent') return folder === 'sent' && !cats.some(c => /Auto Sent|CRM Reply/i.test(c));
      if (view === 'all_mail') return true;
      if (view === 'inbox') return folder !== 'sent' && !cats.some(c => /System Auto-Trash/i.test(c));
      return true;
    });
  }

  function countViews(messages) {
    const counts = { inbox: 0, crm_reply: 0, crm_sent: 0, manual_sent: 0 };
    VIEWS.forEach(v => {
      if (v.id === 'all_mail') return;
      const items = filterMessages(messages, v.id);
      if (v.id === 'inbox') counts.inbox = items.filter(m => m.is_unread).length;
      else counts[v.id] = items.length;
    });
    return counts;
  }

  function mergeCatalog(demo, live) {
    const map = new Map();
    demo.forEach(m => map.set(String(m.id), m));
    live.forEach(m => map.set(String(m.id), m));
    return map;
  }

  async function apiFetch(path, options) {
    const url = PROXY + path;
    const res = await fetch(url, Object.assign({ cache: 'no-store' }, options || {}));
    if (!res.ok) throw new Error('api-' + res.status);
    return res.json();
  }

  function EmailAgentPanel(host, options) {
    const onToast = (options && options.onToast) || function () {};
    let destroyed = false;
    let agentLive = false;
    let currentView = 'crm_sent';
    let catalog = mergeCatalog(buildDemoMessages(), []);
    let messages = [];
    let selectedId = null;
    let selectedMessage = null;
    let viewCounts = {};
    let searchQuery = '';
    let syncing = false;
    let replyOpen = false;

    const demoMessages = buildDemoMessages();

    host.innerHTML =
      '<div class="cw-ea">' +
      '<header class="cw-ea__header">' +
      '<div class="cw-ea__identity"><p class="cw-ea__eyebrow">Single mailbox · Email Agent style</p>' +
      '<h2 class="cw-ea__title">' + esc(ACCOUNT.email) + '</h2>' +
      '<p class="cw-ea__sub">' + esc(ACCOUNT.label) + ' · demo CRM sent → <strong>' + esc(DEMO_SEND_TO) + '</strong></p></div>' +
      '<div class="cw-ea__search-wrap"><input class="cw-ea__search" type="search" placeholder="Search mail" aria-label="Search mail"></div>' +
      '<div class="cw-ea__header-actions">' +
      '<span class="cw-ea__status" data-role="status">Checking connection…</span>' +
      '<button type="button" class="button button-primary" data-action="ea-send-demo">Send live referral demo</button>' +
      '<button type="button" class="button button-secondary" data-action="ea-sync">Sync mail</button>' +
      '<a class="button button-secondary" href="http://127.0.0.1:5100/" target="_blank" rel="noopener noreferrer">Open full Email Agent</a>' +
      '</div></header>' +
      '<div class="cw-ea__stats" data-role="stats"></div>' +
      '<div class="cw-ea__workspace">' +
      '<nav class="cw-ea__sidebar" data-role="sidebar" aria-label="Mail folders"></nav>' +
      '<section class="cw-ea__list-panel"><div class="cw-ea__list-toolbar"><strong data-role="list-title">CRM Sent</strong><span data-role="list-count"></span></div><div class="cw-ea__list" data-role="list"></div></section>' +
      '<section class="cw-ea__read-panel" data-role="read"><div class="cw-ea__read-empty">Select a message to read</div></section>' +
      '</div></div>';

    const els = {
      status: host.querySelector('[data-role="status"]'),
      stats: host.querySelector('[data-role="stats"]'),
      sidebar: host.querySelector('[data-role="sidebar"]'),
      list: host.querySelector('[data-role="list"]'),
      listTitle: host.querySelector('[data-role="list-title"]'),
      listCount: host.querySelector('[data-role="list-count"]'),
      read: host.querySelector('[data-role="read"]'),
      search: host.querySelector('.cw-ea__search')
    };

    function setStatus(text, kind) {
      els.status.textContent = text;
      els.status.className = 'cw-ea__status cw-ea__status--' + (kind || 'default');
    }

    function allMessages() {
      return Array.from(catalog.values());
    }

    function getMessage(id) {
      return catalog.get(String(id)) || null;
    }

    function renderStats() {
      const merged = allMessages();
      viewCounts = countViews(merged);
      const sent = viewCounts.crm_sent || 0;
      const replies = viewCounts.crm_reply || 0;
      const unread = viewCounts.inbox || 0;
      els.stats.innerHTML =
        '<article class="cw-ea__stat"><span class="cw-ea__stat-label">Unread inbox</span><strong>' + unread + '</strong></article>' +
        '<article class="cw-ea__stat"><span class="cw-ea__stat-label">CRM replies</span><strong>' + replies + '</strong></article>' +
        '<article class="cw-ea__stat"><span class="cw-ea__stat-label">CRM sent</span><strong>' + sent + '</strong></article>' +
        '<article class="cw-ea__stat"><span class="cw-ea__stat-label">Mailbox</span><strong>' + (agentLive ? 'Live + demo' : 'Demo') + '</strong><small>Showcase thread always visible</small></article>';
    }

    function renderSidebar() {
      const merged = allMessages();
      viewCounts = countViews(merged);
      els.sidebar.innerHTML = VIEWS.map(view => {
        const count = view.id === 'inbox'
          ? (viewCounts.inbox || 0)
          : (viewCounts[view.id] || 0);
        const badge = count ? '<span class="cw-ea__nav-badge">' + count + '</span>' : '';
        return '<button type="button" class="cw-ea__nav-item' + (currentView === view.id ? ' is-active' : '') + '" data-action="ea-view" data-view="' + view.id + '">' +
          esc(view.label) + badge + '</button>';
      }).join('');
    }

    function visibleMessages() {
      let list = messages.slice();
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        list = list.filter(m =>
          [m.subject, m.from_email, m.from_name, m.snippet, m.to_email, m.to_name].join(' ').toLowerCase().includes(q)
        );
      }
      return list;
    }

    function renderList() {
      const viewLabel = (VIEWS.find(v => v.id === currentView) || {}).label || 'Mail';
      els.listTitle.textContent = viewLabel;
      const list = visibleMessages();
      els.listCount.textContent = list.length + ' message' + (list.length === 1 ? '' : 's');
      if (!list.length) {
        els.list.innerHTML = '<p class="cw-ea__list-empty">No messages in this view. Try <strong>CRM Sent</strong> for the referral demo.</p>';
        return;
      }
      els.list.innerHTML = list.map(msg => {
        const isSent = String(msg.folder || '').toLowerCase() === 'sent';
        const from = isSent ? ('To: ' + (msg.to_name || msg.to_email || '—')) : (msg.from_name || msg.from_email || 'Unknown');
        const email = isSent ? (msg.to_email || '') : (msg.from_email || '');
        const selected = String(selectedId) === String(msg.id);
        return '<button type="button" class="cw-ea__row' + (msg.is_unread ? ' is-unread' : '') + (selected ? ' is-selected' : '') + '" data-action="ea-open" data-id="' + esc(msg.id) + '">' +
          '<span class="cw-ea__avatar" style="background:' + avatarColor(email) + '">' + esc(initials(isSent ? msg.to_name : msg.from_name, email)) + '</span>' +
          '<span class="cw-ea__row-body">' +
          '<span class="cw-ea__row-from">' + esc(from) + (msg.demo ? ' <span class="cw-ea__demo-tag">demo</span>' : '') + '</span>' +
          '<span class="cw-ea__row-subject">' + esc(msg.subject || '(no subject)') + '</span>' +
          '<span class="cw-ea__row-snippet">' + esc(msg.snippet || '') + '</span>' +
          '</span>' +
          '<span class="cw-ea__row-meta">' +
          (msg.categories && msg.categories.length ? '<span class="cw-ea__chip">' + esc(msg.categories[0]) + '</span>' : '') +
          '<span class="cw-ea__row-date">' + esc(formatDate(msg.received_at)) + '</span>' +
          '</span></button>';
      }).join('');
    }

    function resizeReadIframe(iframe) {
      if (!iframe) return;
      iframe.onload = () => {
        try {
          const doc = iframe.contentDocument;
          const height = doc && doc.documentElement ? doc.documentElement.scrollHeight : 480;
          iframe.style.height = Math.max(height + 24, 320) + 'px';
        } catch {
          iframe.style.height = '480px';
        }
      };
    }

    function renderRead(message) {
      replyOpen = false;
      if (!message) {
        els.read.innerHTML = '<div class="cw-ea__read-empty">Select a message to read</div>';
        return;
      }
      const chips = (message.categories || []).map(c => '<span class="cw-ea__chip">' + esc(c) + '</span>').join('');
      const canReply = String(message.folder || '').toLowerCase() !== 'sent';
      els.read.innerHTML =
        '<div class="cw-ea__read-toolbar">' +
        (canReply ? '<button type="button" class="button button-secondary" data-action="ea-reply">Reply</button>' : '') +
        '<button type="button" class="button button-secondary" data-action="ea-open" data-id="' + esc(message.id) + '">Refresh</button>' +
        '</div>' +
        '<header class="cw-ea__read-head">' +
        '<h3>' + esc(message.subject || '(no subject)') + '</h3>' +
        '<div class="cw-ea__read-meta">' +
        '<div><strong>From:</strong> ' + esc(message.from_name || '') + ' &lt;' + esc(message.from_email || '') + '&gt;</div>' +
        '<div><strong>To:</strong> ' + esc(message.to_name || '') + ' &lt;' + esc(message.to_email || '') + '&gt;</div>' +
        '<div><strong>Date:</strong> ' + esc(formatDate(message.received_at)) + '</div>' +
        (chips ? '<div class="cw-ea__read-chips">' + chips + '</div>' : '') +
        '</div></header>' +
        '<div class="cw-ea__read-body" data-role="read-body">' +
        (message.body_html
          ? '<iframe class="cw-ea__read-iframe" title="Email body" sandbox="allow-same-origin"></iframe>'
          : '<pre class="cw-ea__read-text"></pre>') +
        '</div>' +
        '<div class="cw-ea__reply-panel" data-role="reply-panel" hidden></div>';

      if (message.body_html) {
        const iframe = els.read.querySelector('.cw-ea__read-iframe');
        iframe.srcdoc = wrapEmailHtml(message.body_html);
        resizeReadIframe(iframe);
      } else {
        const pre = els.read.querySelector('.cw-ea__read-text');
        if (pre) pre.textContent = message.body_text || message.snippet || '(no content)';
      }
    }

    function renderReplyComposer(message) {
      const panel = els.read.querySelector('[data-role="reply-panel"]');
      if (!panel || !message) return;
      replyOpen = true;
      panel.hidden = false;
      const subject = /^re:/i.test(message.subject || '') ? message.subject : 'Re: ' + (message.subject || '');
      panel.innerHTML =
        '<h4>Reply to ' + esc(message.from_email || message.from_name) + '</h4>' +
        '<label class="field-block"><span>Subject</span><input class="field cw-ea__reply-subject" value="' + esc(subject) + '"></label>' +
        '<label class="field-block wide"><span>Message</span><textarea class="cw-ea__reply-body" rows="6">Thanks Maria — I will send the brochure PDF with QR code for Kontour this week.\n\n— Clearwater Dentist Partnerships</textarea></label>' +
        '<p class="cw-ea__reply-note">Demo only until compose is wired to Email Agent. Live send uses <code>POST /api/compose</code> on port 5100.</p>';
    }

    async function openMessage(id) {
      selectedId = String(id);
      let message = getMessage(selectedId);

      if (!message && agentLive) {
        try {
          const data = await apiFetch('/message/' + encodeURIComponent(id));
          catalog.set(String(data.id), data);
          message = data;
        } catch {
          onToast('Could not load message from Email Agent.');
        }
      }

      if (message) {
        message.is_unread = false;
        selectedMessage = message;
        catalog.set(String(message.id), message);
        renderList();
        renderRead(message);
        return;
      }

      onToast('Message not found.');
    }

    function refreshViewMessages() {
      const merged = allMessages();
      messages = filterMessages(merged, currentView);
      messages.sort((a, b) => new Date(b.received_at || 0) - new Date(a.received_at || 0));
    }

    async function loadLiveMail() {
      try {
        await apiFetch('/health');
        agentLive = true;
        setStatus('Email Agent connected', 'live');
      } catch {
        agentLive = false;
        setStatus('Email Agent offline — demo thread active', 'demo');
        return;
      }

      try {
        const data = await apiFetch('/inbox?account=' + encodeURIComponent(ACCOUNT.id) + '&view=all_mail&limit=200');
        const live = data.messages || [];
        catalog = mergeCatalog(demoMessages, live);
      } catch {
        agentLive = false;
        setStatus('Proxy error — demo thread only', 'demo');
        catalog = mergeCatalog(demoMessages, []);
      }
    }

    async function loadMessages() {
      if (destroyed) return;
      await loadLiveMail();
      refreshViewMessages();

      if (selectedId && !getMessage(selectedId)) {
        selectedId = null;
        selectedMessage = null;
      }

      renderStats();
      renderSidebar();
      renderList();
      renderRead(selectedMessage);

      if (!selectedMessage && currentView === 'crm_sent') {
        const first = messages[0];
        if (first) openMessage(first.id);
      }
    }

    async function syncMail() {
      if (syncing) return;
      syncing = true;
      const syncBtn = host.querySelector('[data-action="ea-sync"]');
      if (syncBtn) syncBtn.disabled = true;
      setStatus('Syncing…', 'sync');
      try {
        if (agentLive) {
          await apiFetch('/fetch?account=' + encodeURIComponent(ACCOUNT.id) + '&watch=1', { method: 'POST' });
          onToast('Mailbox sync requested.');
          await loadLiveMail();
          refreshViewMessages();
        } else {
          onToast('Start Email Agent on port 5100 for live sync.');
        }
      } catch {
        onToast('Sync failed — is Email Agent running?');
      } finally {
        await loadMessages();
        syncing = false;
        if (syncBtn) syncBtn.disabled = false;
      }
    }

    async function sendLiveDemo() {
      const content = referralEmailContent();
      if (!agentLive) {
        onToast('Email Agent offline — open CRM Sent to preview the referral email.');
        currentView = 'crm_sent';
        await loadMessages();
        return;
      }
      try {
        await apiFetch('/compose', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_id: ACCOUNT.id,
            to: DEMO_SEND_TO,
            subject: content.subject,
            body: content.textBody + '\n\n(HTML version sent in production — see CRM Sent preview in admin.)'
          })
        });
        onToast('Live demo sent to ' + DEMO_SEND_TO + ' — click Sync mail.');
        await apiFetch('/fetch?account=' + encodeURIComponent(ACCOUNT.id) + '&sent_only=1', { method: 'POST' });
        await loadMessages();
        currentView = 'crm_sent';
        refreshViewMessages();
        renderSidebar();
        renderList();
      } catch (err) {
        onToast('Send failed — check Email Agent / Zoho credentials.');
      }
    }

    host.addEventListener('click', event => {
      const btn = event.target.closest('[data-action]');
      if (!btn || !host.contains(btn)) return;

      const action = btn.dataset.action;
      if (!action || !action.startsWith('ea-')) return;

      event.preventDefault();
      event.stopPropagation();

      if (action === 'ea-view') {
        currentView = btn.dataset.view || 'inbox';
        selectedId = null;
        selectedMessage = null;
        refreshViewMessages();
        renderSidebar();
        renderList();
        renderRead(null);
        if (currentView === 'crm_sent' && messages[0]) openMessage(messages[0].id);
        return;
      }
      if (action === 'ea-open') {
        openMessage(btn.dataset.id);
        return;
      }
      if (action === 'ea-reply') {
        if (selectedMessage) renderReplyComposer(selectedMessage);
        return;
      }
      if (action === 'ea-sync') {
        syncMail();
        return;
      }
      if (action === 'ea-send-demo') {
        sendLiveDemo();
      }
    });

    els.search.addEventListener('input', () => {
      searchQuery = els.search.value.trim();
      renderList();
    });

    loadMessages();

    return {
      destroy() {
        destroyed = true;
        host.innerHTML = '';
      },
      reload: loadMessages
    };
  }

  window.CWEmailAgent = {
    ACCOUNT,
    DEMO_SEND_TO,
    mount(host, options) {
      return EmailAgentPanel(host, options);
    }
  };
})();
