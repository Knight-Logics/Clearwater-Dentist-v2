/* Clearwater Dentist admin — per-tab instructions (collapsible) */
(function () {
  'use strict';

  const GUIDES = {
    overview: {
      title: 'Dashboard — start here',
      summary: 'A snapshot of Google search performance, website launch progress, and CRM notes. Read-only for Google; your team edits save in this browser only.',
      sections: [
        {
          heading: 'What this tab is for',
          body: '<p>The Dashboard answers three questions at a glance:</p><ul><li><strong>Are people finding us on Google?</strong> (Analytics tab — real when Search Console is synced)</li><li><strong>Is the new 77-page website ready?</strong> (Website tab — launch status you mark in Pages)</li><li><strong>How is partner outreach going?</strong> (Referrals tab — summary only; edit in Referral partners)</li></ul>'
        },
        {
          heading: 'What is real vs planning/demo',
          body: '<ul><li><strong>Real from Google:</strong> Search clicks, impressions, top queries (after <code>npm run sync:google</code>).</li><li><strong>Your team\'s notes:</strong> Referral list, leads log, page status — saved in this browser until you Export.</li><li><strong>Not connected yet:</strong> Live phone/form tracking, Google Analytics visitors, automatic emails/SMS to site visitors.</li></ul>'
        },
        {
          heading: 'Recommended weekly routine',
          body: '<ol><li>Open <strong>SEO / Search</strong> — note top 3 search terms and any page that needs copy updates.</li><li>Open <strong>Pages</strong> — mark anything still in Draft / Needs SEO.</li><li>Open <strong>Referral partners</strong> — run the weekly contact update (see next section).</li><li>Use <strong>Page editor</strong> for copy/image changes, then <strong>Backup &amp; export</strong> before switching computers.</li></ol>'
        },
        {
          heading: 'Weekly referral update — what “update who you contacted” means',
          body: '<p>This is a <strong>10–15 minute Friday habit</strong> (or Monday planning). You are not sending email from this screen — you are keeping an honest log so the office and Knight Logics know outreach happened and what to do next.</p>' +
            '<ol><li><strong>Open Growth &amp; CRM → Referral partners.</strong></li>' +
            '<li><strong>Filter Status → To Contact</strong> (and separately <strong>Nurture</strong> for follow-ups due). These are your action queue for the week.</li>' +
            '<li><strong>For each business you emailed, called, or visited:</strong><ul>' +
            '<li>Change <strong>Status</strong> to <em>Contacted</em> (or <em>Nurture</em> if they said “call me next month”).</li>' +
            '<li>Edit <strong>Next step</strong> with a date and outcome — e.g. <code>6/7 emailed intro — awaiting office mgr · follow up 6/14</code>.</li>' +
            '<li>On mobile cards, tap <strong>Mark contacted</strong> for a quick status bump (then fix Next step if needed).</li></ul></li>' +
            '<li><strong>Add 1–2 new prospects</strong> you researched (Google Maps, Instagram, drive-by near the office). Fill in <strong>Why / angle</strong> so anyone reading the row knows why this partner type matters.</li>' +
            '<li><strong>Close or pause dead ends</strong> — Status <em>Closed</em> if they declined; note why in Next step so you do not re-contact blindly.</li>' +
            '<li><strong>Check Dashboard → Referrals tab</strong> — pipeline counts should move (fewer “need outreach,” more Contacted / Active).</li>' +
            '<li><strong>If the front desk heard “X sent me,”</strong> log it in <strong>Leads &amp; inquiries</strong> with source <em>Referral partner</em> — that ties outreach to real patients.</li>' +
            '<li><strong>Before a client call:</strong> Settings → Backup → Download JSON so your weekly notes are not lost on another computer.</li></ol>' +
            '<p><strong>Status cheat sheet:</strong> Research (finding contact info) → To Contact (ready to reach out) → Draft Email (copy being written) → Contacted (outreach sent) → Nurture (waiting on them) → Active Partner (mutually referring) → Closed (not pursuing).</p>'
        },
        {
          heading: 'Email, SMS & messaging visitors',
          body: '<p><strong>You cannot legally or technically message random people just because they visited the website.</strong> Browsers do not give you their phone or email unless they submit a form, start chat, book an appointment, or opt in to texting.</p><ul><li><strong>What you can do today:</strong> Chat widget on the site (Tidio — still on a placeholder account until the office connects their own), phone calls, form submissions to your existing systems.</li><li><strong>What requires setup:</strong> Appointment reminders, review-request texts, and nurture emails only for patients who <strong>opted in</strong> (TCPA / HIPAA-aware workflows).</li><li><strong>Knight Logics uses:</strong> Formspree + chat + optional ntfy alerts for <em>our</em> leads — not bulk SMS to anonymous visitors. Outbound partner email lives in a separate Outreach CRM for <em>business</em> prospects, not patients.</li></ul><p>Ask the office: <em>What system sends their texts today? (Solutionreach, Weave, HubSpot, etc.)</em> — we should connect to that, not replace it blindly.</p>'
        }
      ]
    },
    seo: {
      title: 'SEO / Search',
      summary: 'Read-only Google Search Console report — what people typed to find clearwaterdentist.com. Use it to decide which pages to improve; it does not edit the site for you.',
      sections: [
        {
          heading: 'What this tab is for',
          body: '<p>Shows <strong>search queries</strong> (keywords), <strong>impressions</strong> (times you appeared in Google), <strong>clicks</strong>, <strong>CTR</strong>, and <strong>average position</strong> over ~90 days.</p><p>Example: lots of impressions for “xerf treatment near me” with position ~4 means you are visible — consider strengthening the XERF page and GBP posts.</p>'
        },
        {
          heading: 'How to use it (step by step)',
          body: '<ol><li>Confirm the green <strong>Real from Google</strong> banner (or run sync if missing).</li><li>Sort mentally by <strong>impressions</strong> (demand) and <strong>clicks</strong> (results).</li><li>Pick 1–3 queries where you want more clicks → open that service page in <strong>Page editor</strong> or update the keyword in <strong>Pages</strong>.</li><li>Click <strong>Queue</strong> only as a personal reminder (saves in this browser — not a task system).</li><li>Re-check after the next Google sync in a few weeks.</li></ol>'
        },
        {
          heading: 'What this does NOT do',
          body: '<ul><li>Does not change titles, meta tags, or page copy automatically.</li><li>Does not replace <a href="https://search.google.com/search-console" target="_blank" rel="noopener">Google Search Console</a> — use Open GSC for full detail.</li><li>Does not track phone calls, forms, or bookings (see Leads &amp; inquiries).</li></ul>'
        }
      ]
    },
    content: {
      title: 'Page editor',
      summary: 'Click-to-edit draft preview of clearwaterdentist.com pages. Saves on this computer only until your developer publishes to the live site.',
      sections: [
        {
          heading: 'How to use it',
          body: '<ol><li>Use the <strong>page tabs</strong> or dropdown to switch routes (Home, services, About, etc.).</li><li>Click any highlighted block to edit text; click buttons to change label + link in the right panel.</li><li>For images: select → drag to reposition → drop a new file or use the upload zone.</li><li>On Home: use <strong>+ Add before/after case</strong> for new smile sliders (needs before + after images).</li><li>Yellow banner = unsaved → click <strong>Save changes</strong> (still a draft — not live on the internet).</li></ol>'
        },
        {
          heading: 'What this does NOT do',
          body: '<p>Does not push changes to clearwaterdentist.com automatically. Production publish is a separate deploy step. Does not edit header/footer navigation or live Google review quotes.</p>'
        }
      ]
    },
    pages: {
      title: 'Pages board',
      summary: 'Internal launch checklist for all 77 routes — status, target keyword, SEO checkboxes, and (when synced) real traffic per URL.',
      sections: [
        {
          heading: 'What this tab is for',
          body: '<p>Project-management view for the rebuild: which pages are <strong>Live</strong>, still in <strong>Draft Review</strong>, or <strong>Needs SEO</strong>. Traffic columns come from Google when synced.</p>'
        },
        {
          heading: 'How to use it',
          body: '<ol><li>Filter by category (Services, Blog, Policy, etc.).</li><li>Set <strong>Status</strong> when the office approves a page for launch.</li><li>Enter a <strong>target keyword</strong> matching what you want to rank for (align with SEO / Search queries).</li><li>Check off Title / Meta / H1 / FAQ / Schema / Video as you verify each page.</li></ol>'
        },
        {
          heading: 'What this does NOT do',
          body: '<p>Does not edit page content (use Page editor). Does not submit anything to Google.</p>'
        }
      ]
    },
    videos: {
      title: 'Videos',
      summary: 'Checklist of Dr. Nadia videos on the site — embed, transcript, and schema readiness. Tracking only; does not upload to YouTube.',
      sections: [
        {
          heading: 'How to use it',
          body: '<p>Mark videos <strong>Ready</strong> when embedded on the right service page, transcript exists, and VideoObject schema is in place. Helps ensure SEO and accessibility for video content.</p>'
        }
      ]
    },
    referrals: {
      title: 'Referral partners',
      summary: 'Three steps only: find local business leads → email partnership intros → track who responds and becomes an active referral partner.',
      sections: [
        {
          heading: 'Step 1 — Find leads',
          body: '<p>Add med spas, realtors, wedding vendors, employers. Status starts at <strong>Research</strong>. Click <strong>Ready to email</strong> when you have a contact address.</p>'
        },
        {
          heading: 'Step 2 — Email them',
          body: '<p>Preview the intro, send from <strong>Outreach inbox</strong>, then <strong>Mark sent</strong>. Replies show in Outreach inbox → CRM Replies.</p>'
        },
        {
          heading: 'Step 3 — Referral partners',
          body: '<p>Businesses who replied or agreed to refer. Mark <strong>Active Partner</strong> to unlock their unique QR link in the <strong>Partner registry</strong>. Check off QR card, brochure, and welcome email when delivered.</p>'
        },
        {
          heading: 'How partners get added',
          body: '<ul><li><strong>Manual research</strong> — you add them in Step 1.</li><li><strong>Partner application</strong> — they submit via <code>/contact-us?interest=referral-partner</code> (future self-service form).</li><li><strong>Office intro</strong> — front desk heard about them and adds the row.</li></ul>'
        },
        {
          heading: 'QR codes — do partners need their own?',
          body: '<p>Yes — each <strong>active B2B partner</strong> gets a unique QR that points to <code>clearwaterdentist.com/ref/{slug}</code>. When a patient scans it at the med spa or realtor office, you know which partner sent them. This is separate from in-office patient “refer a friend” programs (Dentrix, Solutionreach).</p><p>Production: Knight Logics generates printable QR desk cards + PDF brochures per partner (same pattern as the Knight Logics referral asset script).</p>'
        },
        {
          heading: 'Not the same as in-office patient referrals',
          body: '<p>Patient “refer a friend” rewards usually live in Dentrix, Solutionreach, etc. This flow is <strong>B2B partnerships</strong> only.</p>'
        }
      ]
    },
    mailbox: {
      title: 'Partnership mail',
      summary: 'Single-mailbox Email Agent view for partnership outreach. Demo mailbox: support@knightlogics.com. Production: partnerships@clearwaterdentist.com.',
      sections: [
        {
          heading: 'What this tab is for',
          body: '<p>Same layout as Knight Logics <strong>Email Agent</strong>, but locked to <strong>one mailbox</strong> — inbox, CRM Replies, CRM Sent, and manual sent in one place. Use it to see outbound partner intros and inbound replies without opening the full multi-account Email Agent.</p>'
        },
        {
          heading: 'Live vs sample mode',
          body: '<ul><li><strong>Live</strong> — Email Agent running on <code>http://127.0.0.1:5100</code> and Clearwater admin served via <code>npm run serve</code> (proxies <code>/api/email-proxy</code>).</li><li><strong>Sample</strong> — If Email Agent is offline, you still see realistic demo threads (CRM reply, outbound intro, bounce).</li></ul><p>Click <strong>Sync mail</strong> to poll Zoho for <code>support@knightlogics.com</code> (account <code>zoho_knightlogics</code>).</p>'
        },
        {
          heading: 'Folders explained',
          body: '<ul><li><strong>Inbox</strong> — unread general mail for the mailbox</li><li><strong>CRM Replies</strong> — responses from businesses you emailed via outreach</li><li><strong>CRM Sent</strong> — automated partnership intros / follow-ups</li><li><strong>Manual Sent</strong> — hand-written messages</li></ul>'
        }
      ]
    },
    leads: {
      title: 'Leads & inquiries',
      summary: 'Manual log of high-intent events until call tracking and forms feed in automatically.',
      sections: [
        {
          heading: 'What this tab is for',
          body: '<p>A simple <strong>inquiry log</strong>: phone taps, booking clicks, form interest, financing clicks. Use it when you learn how someone found the office until GA4 / call tracking connects.</p>'
        },
        {
          heading: 'Inquiry board (lead GUI)',
          body: '<p>The <strong>Inquiry board</strong> shows every logged event as cards with source badges and counts. Use the filter chips at the top (<em>All</em>, <em>Organic Search</em>, <em>Referral partner</em>, etc.) to see how many leads came from each channel and which specific inquiries are in each bucket.</p><p>High-intent events (phone taps, appointment clicks) have a teal accent on the card.</p>'
        },
        {
          heading: 'How to use it',
          body: '<ol><li>Front desk hears “I found you on Google” → <strong>Log inquiry</strong> with source Organic Search and page URL.</li><li>Referral from a med spa → source <strong>Referral partner</strong> + note the business name in the Note field.</li><li>Filter the board by source to report “we got 3 referral partner leads this month.”</li><li>Review counts monthly in Reports → Referrals snapshot.</li></ol>'
        },
        {
          heading: 'Email & SMS to these leads',
          body: '<p>Logging here does <strong>not</strong> send messages. To text or email a patient, you need their <strong>opt-in</strong> and your existing patient communication tool (Weave, Solutionreach, etc.). This dashboard is attribution notes only — not a replacement for HIPAA-compliant patient messaging.</p>'
        }
      ]
    },
    reviews: {
      title: 'Reviews',
      summary: 'Draft reply workspace + the real Google review link to share with happy patients.',
      sections: [
        {
          heading: 'What is real',
          body: '<p>The <strong>Google review request link</strong> is real and safe to use on cards, email signatures, and front-desk handouts.</p>'
        },
        {
          heading: 'What is demo',
          body: '<p>Review cards and reply drafts are samples. Approving a reply here does <strong>not</strong> post to Google — staff still replies in Google Business Profile or your review tool.</p>'
        },
        {
          heading: 'How to use it',
          body: '<ol><li>Copy the review link for staff scripts.</li><li>Draft reply language for common themes (friendly team, Dr. Nadia, etc.).</li><li>Move to Approvals when legal/office wants sign-off before posting.</li></ol>'
        }
      ]
    },
    gbp: {
      title: 'Google Business Profile',
      summary: 'GBP checklist, post drafts, and (when API approved) live map performance stats.',
      sections: [
        {
          heading: 'Current status',
          body: '<p>Performance numbers may be <strong>placeholders</strong> until Google approves Business Profile API quota. Checklist and post drafts are always <strong>team notes</strong> — nothing posts to Google from this dashboard automatically.</p>'
        },
        {
          heading: 'How to use it',
          body: '<ol><li>Use checklist before monthly GBP posts (photos, services, hours).</li><li>Write post drafts here → copy into business.google.com when approved.</li><li>Do not publish medical claims without office sign-off (see Approvals).</li></ol>'
        }
      ]
    },
    campaigns: {
      title: 'Campaigns',
      summary: 'Planning calendar for marketing pushes (XERF, new patients, seasonal) — not live ad performance.',
      sections: [
        {
          heading: 'What this tab is for',
          body: '<p>Coordinate <em>when</em> to promote what across website banner, GBP, social, and email — internal planning only.</p>'
        },
        {
          heading: 'How to use it',
          body: '<ol><li>Add campaigns with due dates and channels.</li><li>Queue items into Approvals before go-live.</li><li>Execute actual posts/ads in Meta Ads, GBP, Mailchimp, etc. — outside this tool.</li></ol>'
        }
      ]
    },
    compliance: {
      title: 'Approvals',
      summary: 'Sign-off queue before website, GBP, review, or campaign content goes live.',
      sections: [
        {
          heading: 'Why this exists',
          body: '<p>Dental and cosmetic claims, patient photos, and review replies need office approval. Track what is waiting on Dr. Nadia vs Knight Logics vs front desk.</p>'
        }
      ]
    },
    exports: {
      title: 'Backup & export',
      summary: 'Download or restore everything your team typed into this dashboard (CRM, page notes, drafts).',
      sections: [
        {
          heading: 'How to use it',
          body: '<ol><li><strong>Download JSON</strong> before client meetings or when changing computers.</li><li><strong>Import</strong> the same file to restore.</li><li><strong>Reset Demo</strong> clears local edits — use carefully.</li></ol><p>Export does not publish the website or sync to Google.</p>'
        }
      ]
    },
    help: {
      title: 'Full guide — all sections',
      summary: 'Complete instructions for every tab in this dashboard.',
      sections: []
    }
  };

  function renderSection(section) {
    return '<details class="tab-guide__block"><summary>' + section.heading + '</summary><div class="tab-guide__block-body">' + section.body + '</div></details>';
  }

  function renderGuide(viewId, options) {
    const opts = options || {};
    const guide = GUIDES[viewId];
    if (!guide) return '';

    if (viewId === 'help') {
      const all = Object.keys(GUIDES).filter(id => id !== 'help').map(id => {
        const g = GUIDES[id];
        const sections = (g.sections || []).map(renderSection).join('');
        return '<details class="tab-guide tab-guide--nested" open><summary class="tab-guide__title">' + g.title + '</summary><p class="tab-guide__summary">' + g.summary + '</p><div class="tab-guide__sections">' + sections + '</div></details>';
      }).join('');
      return '<section class="tab-guide tab-guide--index" aria-label="Dashboard guide">' +
        '<details class="tab-guide__shell" open><summary class="tab-guide__shell-title">How to use this dashboard — complete guide</summary>' +
        '<p class="tab-guide__summary">Expand any section below. <strong>Green/Real</strong> = from Google. <strong>Blue/Team</strong> = saved in your browser. <strong>Orange/Demo</strong> = sample or planning only.</p>' +
        all + '</details></section>';
    }

    const open = opts.open !== false;
    const sections = (guide.sections || []).map(renderSection).join('');
    return '<section class="tab-guide" aria-label="Instructions for this screen">' +
      '<details class="tab-guide__shell"' + (open ? ' open' : '') + '>' +
      '<summary class="tab-guide__shell-title">How to use: ' + guide.title + '</summary>' +
      '<p class="tab-guide__summary">' + guide.summary + '</p>' +
      '<div class="tab-guide__sections">' + sections + '</div>' +
      '</details></section>';
  }

  window.CWTabGuides = { GUIDES, renderGuide };
})();
