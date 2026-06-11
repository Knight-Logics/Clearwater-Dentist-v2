/* Clearwater Dentist — referral outreach email previews + leads board (Knight Logics CRM pattern) */
(function () {
  'use strict';

  const SEND_TYPES = [
    { id: 'first_touch', label: 'First intro' },
    { id: 'followup_1', label: 'Follow-up #1' },
    { id: 'followup_2', label: 'Follow-up #2' }
  ];

  const PARTNER_FIT = {
    'Med spas': ['XERF skin tightening', 'Cosmetic dentistry', 'Smile makeovers', 'Event-season whitening'],
    Realtors: ['New mover welcome', 'Family dentistry', 'Emergency line', 'Trusted local dentist'],
    'Wedding planners': ['Pre-wedding whitening', 'Cosmetic consults', 'Smile-ready timelines', 'Vendor partnerships'],
    Employers: ['Family benefits', 'Emergency access', 'Flexible scheduling', 'New hire packets'],
    Salons: ['Beauty + smile synergy', 'Referral cards', 'Local co-marketing', 'Event promos'],
    'Gyms/wellness': ['Holistic wellness', 'Oral health education', 'Member perks', 'Community events']
  };

  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function partnerCity(partner) {
    return partner.city || 'Clearwater';
  }

  function partnerEmail(partner) {
    const email = String(partner.contactEmail || '').trim();
    if (email) return email;
    const slug = String(partner.business || 'contact')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .slice(0, 24) || 'contact';
    return slug + '@example.com';
  }

  function firstNameFromBusiness(business) {
    const clean = String(business || '').replace(/^EXAMPLE\s*[—-]\s*/i, '').trim();
    return clean.split(/[—(,]/)[0].trim() || 'there';
  }

  function fitChips(group) {
    const chips = PARTNER_FIT[group] || PARTNER_FIT['Med spas'];
    return chips.map(chip =>
      '<span style="display:inline-block;margin:0 6px 6px 0;padding:5px 12px;border-radius:999px;border:1px solid #2f6272;background:#163f56;font-size:11px;font-weight:700;color:#d7f0ee;">' + esc(chip) + '</span>'
    ).join('');
  }

  function buildHtmlEmail(opts) {
    const { eyebrow, headline, subline, city, chips, paragraphs, ctaUrl, ctaLabel, signature } = opts;
    const bodyParas = paragraphs.map(p =>
      '<p style="margin:0 0 18px 0;color:#334155;font-size:15px;line-height:1.7;">' + p + '</p>'
    ).join('');
    return '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;border-collapse:collapse;background:#f4f8f7;">' +
      '<tr><td style="padding:0;">' +
      '<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="width:100%;border-collapse:collapse;border:1px solid #d9e2e4;border-radius:16px;overflow:hidden;background:#ffffff;">' +
      '<tr><td style="padding:22px 24px 16px;background:linear-gradient(135deg,#163f56 0%,#0f766e 100%);">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#a7e8df;">' + esc(eyebrow) + '</div>' +
      '<div style="margin-top:8px;font-size:24px;line-height:1.25;font-weight:700;color:#ffffff;">' + esc(headline) + '</div>' +
      '<div style="margin-top:10px;font-size:14px;line-height:1.7;color:#d7f0ee;">' + esc(subline) + '</div>' +
      '<div style="margin-top:8px;font-size:12px;color:#9fd9d0;">' + esc(city) + '</div>' +
      '</td></tr>' +
      '<tr><td style="padding:16px 24px;border-bottom:1px solid #e2e8f0;background:#f7faf9;">' +
      '<div style="font-size:13px;line-height:1.7;color:#334155;"><strong style="color:#142324;">Reply:</strong> ' +
      '<a href="mailto:info@clearwaterdentist.com" style="color:#0f766e;text-decoration:underline;">info@clearwaterdentist.com</a> &nbsp;|&nbsp; ' +
      '<strong style="color:#142324;">Call:</strong> (727) 285-8132 &nbsp;|&nbsp; ' +
      '<a href="https://www.clearwaterdentist.com/" style="color:#0f766e;text-decoration:underline;">clearwaterdentist.com</a></div>' +
      '</td></tr>' +
      '<tr><td style="padding:18px 24px 4px;border-top:1px solid #e2e8f0;">' +
      '<div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#607174;margin-bottom:8px;">Partnership fit</div>' +
      '<div style="margin-bottom:12px;">' + chips + '</div></td></tr>' +
      '<tr><td style="padding:8px 24px 24px;">' + bodyParas +
      '<p style="margin:0 0 18px 0;"><a href="' + esc(ctaUrl) + '" style="display:inline-block;padding:12px 18px;background:#163f56;color:#fff;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">' + esc(ctaLabel) + '</a></p>' +
      '<p style="margin:0;color:#334155;font-size:15px;line-height:1.7;">' + signature + '</p>' +
      '</td></tr></table></td></tr></table>';
  }

  function generateEmailContent(partner, sendType, site) {
    const business = firstNameFromBusiness(partner.business);
    const group = partner.group || 'Med spas';
    const city = partnerCity(partner);
    const angle = partner.angle || 'local patient referrals';
    const fromEmail = 'partnerships@clearwaterdentist.com';
    const fromName = 'Clearwater Dentist · Partnerships';
    const toEmail = partnerEmail(partner);
    const siteUrl = (site && site.domain) || 'https://www.clearwaterdentist.com';
    const chips = fitChips(group);

    let subject;
    let paragraphs;
    let headline;
    let subline;

    if (sendType === 'followup_1') {
      subject = 'Quick follow-up — dental referral partnership in ' + city;
      headline = 'Following up on a referral idea for ' + business;
      subline = 'Short note — happy to send a one-page overview for your team.';
      paragraphs = [
        'Hi,',
        'I reached out last week about a simple referral partnership between <strong>' + esc(business) + '</strong> and <strong>Clearwater Dentist</strong> (Dr. Nadia).',
        'Many ' + esc(group.toLowerCase()) + ' partners like having a trusted dentist to recommend when clients ask about smiles, whitening, or cosmetic options — especially before events.',
        'If helpful, I can send a co-branded handout your front desk can keep on file. No pressure — just wanted to see if this is worth a 10-minute call.'
      ];
    } else if (sendType === 'followup_2') {
      subject = 'Last note — Clearwater Dentist partnership';
      headline = 'Closing the loop on partnership outreach';
      subline = 'Final friendly follow-up unless timing is better later.';
      paragraphs = [
        'Hi,',
        'Last quick note from me on the Clearwater Dentist referral idea for <strong>' + esc(business) + '</strong>.',
        'If now is not the right time, no worries — reply “later” and I will check back in a few months.',
        'If you are open to it, we can start with a simple mutual referral card and a short intro for your team.'
      ];
    } else {
      subject = 'Partnership idea for ' + business + ' patients in ' + city + '?';
      headline = 'Referral partnership · smile + ' + group.toLowerCase();
      subline = 'Clearwater Dentist · Dr. Nadia — cosmetic, family, and emergency dentistry';
      paragraphs = [
        'Hi,',
        'I came across <strong>' + esc(business) + '</strong> in ' + esc(city) + ' and wanted to reach out about a local referral partnership with <strong>Clearwater Dentist</strong>.',
        esc(angle.replace(/^Why:?/i, '').replace(/^Why this route:?/i, '').trim()) + '.',
        'We often meet patients who want both aesthetic skin care and cosmetic dentistry (whitening, veneers, smile makeovers). A simple referral path helps your clients and gives your team a trusted dentist on speed dial.',
        'Would you be open to a 10-minute intro call or a lunch-and-learn for your staff? I can also send a one-page overview first.'
      ];
    }

    const htmlBody = buildHtmlEmail({
      eyebrow: 'Clearwater Dentist · B2B referral',
      headline,
      subline,
      city,
      chips,
      paragraphs,
      ctaUrl: siteUrl + '/contact-us',
      ctaLabel: 'View office & contact',
      signature: '—<br>Clearwater Dentist Partnerships<br>Dr. Nadia\'s office · (727) 285-8132<br><em>Preview — production sends from partnerships@clearwaterdentist.com via Email Agent.</em>'
    });

    const textBody = paragraphs.map(p => p.replace(/<[^>]+>/g, '')).join('\n\n');

    return {
      subject,
      textBody,
      htmlBody,
      fromEmail,
      fromName,
      toEmail,
      businessName: partner.business,
      sendType
    };
  }

  function wrapEmailHtml(fragment) {
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
      '<style>body{margin:0;padding:0;background:#eef2f2;font-family:Inter,Segoe UI,Arial,sans-serif;} img{max-width:100%;height:auto;}</style>' +
      '</head><body>' + fragment + '</body></html>';
  }

  function ensureModal() {
    let modal = document.getElementById('cw-email-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'cw-email-modal';
    modal.className = 'cw-modal';
    modal.hidden = true;
    modal.innerHTML =
      '<div class="cw-modal__backdrop" data-action="close-email-modal" aria-hidden="true"></div>' +
      '<div class="cw-modal__box cw-modal__box--email" role="dialog" aria-modal="true" aria-labelledby="cw-email-modal-title">' +
      '<header class="cw-modal__head"><div><p class="eyebrow">Email preview</p><h2 id="cw-email-modal-title">Referral outreach</h2></div>' +
      '<button type="button" class="cw-modal__close" data-action="close-email-modal" aria-label="Close">×</button></header>' +
      '<div class="cw-modal__toolbar"><label class="field-block cw-modal__send-type"><span>Template</span><select class="select" id="cw-email-send-type"></select></label>' +
      '<button type="button" class="button button-secondary" id="cw-email-copy-subject">Copy subject</button>' +
      '<button type="button" class="button button-primary" id="cw-email-mark-sent">Mark as sent (demo)</button></div>' +
      '<div class="cw-modal__body" id="cw-email-modal-body"></div></div>';
    document.body.appendChild(modal);
    return modal;
  }

  let previewContext = { index: -1 };

  function renderPreviewBody(content) {
    return '<div class="email-preview">' +
      '<div class="email-preview__meta">' +
      '<div><strong>From:</strong> ' + esc(content.fromName) + ' &lt;' + esc(content.fromEmail) + '&gt;</div>' +
      '<div><strong>To:</strong> <span class="email-preview__to">' + esc(content.toEmail) + '</span></div>' +
      '<div><strong>Subject:</strong> <span id="cw-email-subject-text">' + esc(content.subject) + '</span></div>' +
      '<div><strong>Business:</strong> ' + esc(content.businessName) + '</div>' +
      '</div>' +
      '<div class="email-preview__frame-wrap">' +
      '<iframe class="email-preview__iframe" id="cw-email-iframe" title="Email HTML preview" sandbox="allow-same-origin"></iframe>' +
      '</div>' +
      '<details class="email-preview__plain"><summary>Plain-text version</summary><pre id="cw-email-plain"></pre></details>' +
      '<p class="email-preview__note">Preview only. Production: send from <strong>partnerships@clearwaterdentist.com</strong> (or office-approved address) through Email Agent; replies appear in <strong>CRM Reply</strong>; bounces tracked in OutreachEngine.</p>' +
      '</div>';
  }

  function openEmailPreview(partner, index, sendType, site, onMarkSent) {
    const modal = ensureModal();
    const content = generateEmailContent(partner, sendType || 'first_touch', site);
    previewContext = { index, onMarkSent, content };

    const sel = modal.querySelector('#cw-email-send-type');
    sel.innerHTML = SEND_TYPES.map(t =>
      '<option value="' + t.id + '"' + (t.id === (sendType || 'first_touch') ? ' selected' : '') + '>' + esc(t.label) + '</option>'
    ).join('');

    modal.querySelector('#cw-email-modal-body').innerHTML = renderPreviewBody(content);
    const iframe = modal.querySelector('#cw-email-iframe');
    iframe.srcdoc = wrapEmailHtml(content.htmlBody);
    modal.querySelector('#cw-email-plain').textContent = content.textBody;

    modal.hidden = false;
    document.body.classList.add('cw-modal-open');
  }

  function closeEmailModal() {
    const modal = document.getElementById('cw-email-modal');
    if (modal) modal.hidden = true;
    document.body.classList.remove('cw-modal-open');
  }

  function refreshPreviewFromSelect(site) {
    if (previewContext.index < 0 || !previewContext.getPartner) return;
    const partner = previewContext.getPartner(previewContext.index);
    if (!partner) return;
    const sendType = document.getElementById('cw-email-send-type')?.value || 'first_touch';
    openEmailPreview(partner, previewContext.index, sendType, site, previewContext.onMarkSent);
    previewContext.getPartner = previewContext.getPartner;
  }

  function bindGlobalModal(site, getPartner, onMarkSent) {
    if (document.body.dataset.cwEmailModalBound) return;
    document.body.dataset.cwEmailModalBound = '1';

    document.addEventListener('click', event => {
      const closeBtn = event.target.closest('[data-action="close-email-modal"]');
      if (closeBtn) {
        closeEmailModal();
        return;
      }
      const previewBtn = event.target.closest('[data-action="referral-preview"]');
      if (previewBtn) {
        const index = Number(previewBtn.dataset.index);
        const partner = getPartner(index);
        if (partner) {
          previewContext.getPartner = getPartner;
          previewContext.onMarkSent = onMarkSent;
          openEmailPreview(partner, index, previewBtn.dataset.sendType || 'first_touch', site, onMarkSent);
        }
      }
    });

    document.addEventListener('change', event => {
      if (event.target.id === 'cw-email-send-type') {
        previewContext.getPartner = getPartner;
        previewContext.onMarkSent = onMarkSent;
        refreshPreviewFromSelect(site);
      }
    });

    document.addEventListener('click', event => {
      if (event.target.id === 'cw-email-copy-subject' && previewContext.content) {
        navigator.clipboard?.writeText(previewContext.content.subject)
          .then(() => event.target.textContent = 'Copied!')
          .catch(() => {});
        window.setTimeout(() => { event.target.textContent = 'Copy subject'; }, 1600);
      }
      if (event.target.id === 'cw-email-mark-sent' && previewContext.index >= 0 && previewContext.onMarkSent) {
        previewContext.onMarkSent(previewContext.index, previewContext.content);
        closeEmailModal();
      }
    });

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') closeEmailModal();
    });
  }

  function sendQueueHtml(referrals, site) {
    const queue = (referrals || []).filter(p =>
      /to contact|draft email|research/i.test(String(p.status || ''))
    ).slice(0, 5);
    if (!queue.length) {
      return '<p class="report-empty">No partners in the send queue. Set status to <strong>To Contact</strong> or <strong>Draft Email</strong>.</p>';
    }
    return '<div class="send-queue">' + queue.map((partner, i) => {
      const realIndex = referrals.indexOf(partner);
      const preview = generateEmailContent(partner, 'first_touch', site);
      return '<article class="send-queue__row">' +
        '<div class="send-queue__main"><strong>' + esc(partner.business) + '</strong>' +
        '<span class="send-queue__meta">' + esc(partner.group) + ' · ' + esc(partnerEmail(partner)) + '</span></div>' +
        '<div class="send-queue__subject">' + esc(preview.subject) + '</div>' +
        '<button type="button" class="button button-secondary" data-action="referral-preview" data-index="' + realIndex + '">Preview email</button>' +
        '</article>';
    }).join('') + '</div>';
  }

  function leadSourceCounts(leads) {
    const counts = { All: (leads || []).length };
    (leads || []).forEach(lead => {
      const key = String(lead.source || 'Unknown').trim() || 'Unknown';
      counts[key] = (counts[key] || 0) + 1;
    });
    return counts;
  }

  function renderLeadsBoard(leads, options) {
    const opts = options || {};
    const activeFilter = opts.sourceFilter || 'All';
    const counts = leadSourceCounts(leads);
    const sources = ['All'].concat(Object.keys(counts).filter(k => k !== 'All').sort());

    const chips = sources.map(source =>
      '<button type="button" class="lead-filter-chip' + (source === activeFilter ? ' is-active' : '') + '" data-action="lead-filter" data-source="' + esc(source) + '">' +
      esc(source) + '<span class="lead-filter-chip__count">' + (counts[source] || 0) + '</span></button>'
    ).join('');

    const filtered = activeFilter === 'All'
      ? (leads || [])
      : (leads || []).filter(l => String(l.source || '') === activeFilter);

    const cards = filtered.length
      ? '<div class="lead-card-grid">' + filtered.map((lead, displayIndex) => {
        const realIndex = leads.indexOf(lead);
        const intent = /phone|appointment/i.test(lead.event) ? 'high' : 'standard';
        return '<article class="lead-card lead-card--' + intent + '" data-lead-index="' + realIndex + '">' +
          '<div class="lead-card__head"><span class="lead-card__event">' + esc(lead.event) + '</span>' +
          statusPillHtml(lead.status) + '</div>' +
          '<p class="lead-card__source"><span class="lead-source-badge">' + esc(lead.source) + '</span></p>' +
          '<p class="lead-card__page"><code>' + esc(lead.page) + '</code></p>' +
          '<p class="lead-card__date">' + esc(lead.date) + '</p>' +
          (lead.note ? '<p class="lead-card__note">' + esc(lead.note) + '</p>' : '') +
          '<button type="button" class="text-button" data-action="remove-lead" data-index="' + realIndex + '">Remove</button>' +
          '</article>';
      }).join('') + '</div>'
      : '<p class="report-empty">No inquiries for this filter.</p>';

    const bySourceList = Object.entries(counts)
      .filter(([k]) => k !== 'All')
      .sort((a, b) => b[1] - a[1])
      .map(([source, count]) => {
        const pct = counts.All ? Math.round((count / counts.All) * 100) : 0;
        return '<div class="lead-source-row"><span>' + esc(source) + '</span><div class="lead-source-row__bar" aria-hidden="true"><span style="width:' + pct + '%"></span></div><strong>' + count + '</strong></div>';
      }).join('');

    return '<section class="panel leads-board">' +
      '<div class="section-header"><div><h2>Inquiry board</h2><p><strong>' + counts.All + '</strong> logged events — filter by source to see which channels are producing interest.</p></div></div>' +
      '<div class="lead-filter-bar" role="toolbar" aria-label="Filter leads by source">' + chips + '</div>' +
      cards +
      '<div class="lead-source-breakdown"><h3>By source</h3>' + (bySourceList || '<p class="report-empty">No sources yet.</p>') + '</div>' +
      '</section>';
  }

  function statusPillHtml(value) {
    const v = String(value || 'Open');
    const cls = /live|ready|tracked|approved/i.test(v) ? 'status-live' : /need|review/i.test(v) ? 'status-needs' : 'status-default';
    return '<span class="status-pill ' + cls + '">' + esc(v) + '</span>';
  }

  window.CWReferralOutreach = {
    SEND_TYPES,
    generateEmailContent,
    wrapEmailHtml,
    sendQueueHtml,
    renderLeadsBoard,
    openEmailPreview,
    closeEmailModal,
    bindGlobalModal,
    partnerEmail
  };
})();
