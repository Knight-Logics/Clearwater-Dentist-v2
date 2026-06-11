# Clearwater Dentist — Launch Notes & Live vs Rebuild Comparison

**Client:** Dr. Nadia Pokrovskaya, D.M.D. — Clearwater Dentist  
**Domain:** https://www.clearwaterdentist.com/  
**Live platform:** Duda (DUDAONE) via Xpress, INC  
**Rebuild:** `DentistClearwater v2` (static HTML/CSS/JS)  
**Last updated:** June 11, 2026  
**Prepared by:** Knight Logics

---

## Purpose of this document

This file is the running record for:

- Google Search Console (GSC) findings from exports in `ClearwaterDentist/`
- SEO / AEO / GEO audit conclusions
- **Side-by-side comparison: live Duda site vs v2 rebuild**
- Launch SEO work completed in v2 (redirects, llms files, service areas, on-page fixes)
- What is **done**, **deferred**, and **blocked on domain transfer / proposal acceptance**

Use this for client meetings, proposal follow-up, and post-cutover validation.

---

## GSC & audit data sources

| File | Location | What it contains |
|------|----------|------------------|
| Coverage summary | `ClearwaterDentist/clearwaterdentist.com-Coverage-2026-06-10.xlsx` | Indexed vs not-indexed chart + issue **counts** |
| Coverage summary (duplicate export) | `ClearwaterDentist/clearwaterdentist.com-Coverage-2026-06-10 (1).xlsx` | Same structure as above |
| **404 URL drilldown** | `ClearwaterDentist/clearwaterdentist.com-Coverage-Drilldown-2026-06-10.xlsx` | **11 specific 404 URLs** |
| AMP 5xx drilldown | `ClearwaterDentist/clearwaterdentist.com-AMP-Issue-2026-06-10.xlsx` | **10 `/ampify/*` URLs** with server errors |
| URL migration + queries | `DentistClearwater v2/clearwater_dentist_gsc_url_migration_map.xlsx` | 78 landing URLs, 999 queries, migration priorities |
| Full site audit | `ClearwaterDentist/AUDIT.md` | Crawl, PSI, schema, on-page, local SEO (Jun 4, 2026) |
| Pre-visit summary | `ClearwaterDentist/PRE-VISIT-AUDITS.md` | Platform discovery, PSI links, meeting prep |

### PageSpeed Insights (v2 preview)

| Report | URL |
|--------|-----|
| **Desktop PSI (Jun 11, 2026)** | https://pagespeed.web.dev/analysis/https-knight-logics-github-io-Clearwater-Dentist-v2/fvk9iuafl6?form_factor=desktop |
| Mobile PSI | Append `?form_factor=mobile` or switch device in PSI UI |
| Live Duda baseline (Jun 3, 2026) | See `ClearwaterDentist/AUDIT.md` — mobile **66**, desktop **89** |

### Rich Results / structured data

| Tool | URL | Notes |
|------|-----|-------|
| Rich Results Test (Jun 11) | https://search.google.com/test/rich-results/result?id=NhHTc9aFxE9QfgA4LqsuCA | Crawl **succeeded**. Valid: Local businesses, Organization, Review snippets. **Videos were invalid** on homepage (5 items) — fixed by using hero video only, required thumbnails, and `SCHEMA_ASSET_ORIGIN` on GitHub deploy so asset URLs resolve on preview. |
| Schema implementation | `scripts/schema-graph.mjs` | Single `@graph` on all **82** public pages |

---

## GSC snapshot (live site, June 2026)

### Indexation trend

| Metric | Value | Notes |
|--------|------:|-------|
| **Indexed pages** | 54 | Up from 51 (Mar 14, 2026) |
| **Not indexed** | 76 | Down from 93 — improving slowly |
| **Index rate** | ~42% | 54 of ~130 known URLs |
| **Daily impressions** | ~1,400–2,200 | Stable |

### Critical coverage buckets (counts only — drill down in GSC for full URL lists)

| Issue | Pages | Source |
|-------|------:|--------|
| Excluded by `noindex` | 21 | Website |
| Crawled – currently not indexed | 26 | Google systems |
| Not found (404) | 10 | Website |
| Discovered – currently not indexed | 7 | Google systems |
| Server error (5xx) | 6 | Website |
| Page with redirect | 6 | Website |

### Performance (16-month GSC — migration map)

| Metric | Value |
|--------|------:|
| Total clicks | 1,386 |
| Total impressions | 208,397 |
| Overall CTR | **0.67%** |
| Weighted avg position | ~13 |
| Landing URLs with visibility | 78 |

**Top CTR opportunity:** "dentist clearwater" — 22,906 impressions, 39 clicks (0.17% CTR). SERP copy fix could add ~400+ clicks/year at target 2% CTR.

**Top traffic pages to preserve at cutover:**

1. `/` (+ UTM homepage variant) — 775 clicks combined  
2. `/XERF-skin-tightening` — 366 clicks, 32K impressions  
3. `/tmj-treatment-clearwater-fl` — 43 clicks  
4. `/taming-toothaches-home-remedies-and-when-to-see-a-dentist` — 41 clicks, 16K impressions  
5. `/emergency-dentistry-clearwater-fl` — 20,522 impressions, **0.06% CTR** (title/meta rewrite opportunity)

---

## GSC 404 drilldown → v2 redirect mapping

From `clearwaterdentist.com-Coverage-Drilldown-2026-06-10.xlsx`:

| GSC 404 URL | Last crawled | v2 action |
|-------------|--------------|-----------|
| `https://www.clearwaterdentist.com/copy-of-home` | Apr 24, 2026 | 301 → `/` |
| `https://www.clearwaterdentist.com/restorative-` | May 7, 2026 | 301 → `/restorative-dentist-clearwater` |
| `https://www.clearwaterdentist.com/aesthetic` | Feb 25, 2026 | 301 → `/facial-esthetics` |
| `https://www.clearwaterdentist.com/family-dentistry-clearwater-fl` | Jan 15, 2026 | 301 → `/general-dentistry` |
| `https://impact.clearwaterdentist.com/` | Feb 12, 2026 | Host 301 → `www` (when DNS points to new host) |
| `https://impact.clearwaterdentist.com/home` | Feb 12, 2026 | Host 301 → `www` |
| `https://impact.clearwaterdentist.com/meet-the-doctor` | May 15, 2026 | Host 301 → `www/meet-the-doctor` |
| `https://impact.clearwaterdentist.com/smile-makeover` | Apr 19, 2026 | Host 301 → `www/smile-makeover` |
| `https://impact.clearwaterdentist.com/contact-us` | Feb 15, 2026 | Host 301 → `www/contact-us` |
| `https://impact.clearwaterdentist.com/terms-and-conditions` | Feb 15, 2026 | Host 301 → `www/terms-and-conditions` |

**Also mapped (not in 404 export but GSC/AMP related):** `/teeth-whitening`, `/veneers`, `/xerfa76ea7ac`, `/ultrac9d83452`, `/before---afters`, `/carecredit`, `/martha-referral`, all `/ampify/*` paths.

All rules live in `src/content/redirects.json` and are emitted to `dist/_redirects` + `dist/.htaccess`.

---

## GSC AMP 5xx drilldown → v2 redirect mapping

From `clearwaterdentist.com-AMP-Issue-2026-06-10.xlsx` (Duda AMP plugin `/ampify/*`):

| AMP URL (5xx) | Canonical target in v2 |
|---------------|------------------------|
| `/ampify/` | `/` |
| `/ampify/general-dentistry` | `/general-dentistry` |
| `/ampify/smile-makeover` | `/smile-makeover` |
| `/ampify/tmj-treatment-clearwater-fl` | `/tmj-treatment-clearwater-fl` |
| `/ampify/dental-therapy-dogs-clearwater-fl` | `/dental-therapy-dogs-clearwater-fl` |
| `/ampify/teeth-whitening` | `/teeth-whitening-clearwater-fl` |
| `/ampify/laser-dentistry` | `/laser-dentistry` |
| `/ampify/porcelain-veneers-clearwater-fl` | `/porcelain-veneers-clearwater-fl` |
| `/ampify/gum-disease-treatment` | `/gum-disease-treatment` |
| `/ampify/implant-supported-dentures-clearwater-fl` | `/implant-supported-dentures-clearwater-fl` |

**v2 approach:** No AMP at all. Wildcard `/ampify/*` → canonical path in `.htaccess` and `_redirects`. Eliminates entire broken AMP layer.

---

## Live site vs v2 rebuild — comparison matrix

| Area | Live Duda site | v2 rebuild | Verdict |
|------|----------------|------------|---------|
| **Platform** | Duda + Xpress vendor lock-in | Static HTML/CSS/JS, self-hosted | ✅ v2 superior |
| **Runtime errors** | ChunkLoadErrors, 49/90 resources failed (Rich Results test) | No Duda runtime | ✅ v2 superior |
| **AMP** | 10–16 `/ampify/*` URLs returning 5xx | No AMP; 301 wildcard to canonical | ✅ v2 superior |
| **Server 5xx** | 6 pages (GSC) + AMP errors | Static hosting — errors eliminated | ✅ v2 superior |
| **404 handling** | 10 known 404s (GSC drilldown) | 21 redirect rules incl. all GSC 404s + legacy URLs | ✅ v2 superior |
| **Indexed pages** | 54 / ~130 (~42%) | Should improve post-cutover (cleaner HTML, redirects) | ✅ v2 should win |
| **Page count** | ~72 URLs (Jun 4 crawl) | **82 pages** (77 content + 5 service areas) | ✅ v2 broader |
| **URL preservation** | Original URLs | 77/78 GSC money URLs covered; `/veneers` → 301 | ✅ v2 ready |
| **Homepage H1** | 4× duplicate "Welcome To" H1s | Single H1 | ✅ v2 superior |
| **Missing H1s** | 35+ URLs (incl. all 13 blog posts) | **0 missing H1s** | ✅ v2 superior |
| **H1 grammar** | "~25 service pages: X at Clearwater, FL" | Fixed to "in Clearwater, FL" (18 pages) | ✅ v2 superior |
| **Meta descriptions** | Missing/truncated on several (Alphaeon, FAQs, etc.) | All pages have descriptions; 5 gaps filled Jun 10 | ✅ v2 superior |
| **Title quality (money pages)** | Template-heavy; weak emergency CTR | Rewritten emergency, XERF, general, home titles | ✅ v2 superior |
| **Emoji in SERP titles** | Needle-free dentistry page had emoji | Emoji removed | ✅ v2 superior |
| **NAP / phone numbers** | 6+ phones on site | Single canonical: **(727) 285-8132** | ✅ v2 superior |
| **Booking paths** | Dual booking systems, conversion confusion | Single Dentrix Ascend URL in `site.json` | ✅ v2 superior |
| **Empty financing pages** | Alphaeon / Sunbit thin or empty | ~3,100 chars content each | ✅ v2 superior |
| **Blog internal linking** | Weak blog → money page links | 13 blog posts → canonical service CTAs | ✅ v2 superior |
| **Service area pages** | None (Safety Harbor, Dunedin, etc.) | **5 new pages** from `site.json` | ✅ v2 superior |
| **Local SEO landing** | No "dentist near [city]" pages | `/dentist-clearwater-fl`, safety-harbor, dunedin, palm-harbor, largo | ✅ v2 superior |
| **Mobile performance** | PSI **66**, LCP **9.4s** | Not benchmarked yet — static should beat Duda | ⚠️ v2 likely wins (verify PSI) |
| **Desktop performance** | PSI **89** | Not benchmarked yet | ⚠️ verify after cutover |
| **Schema** | 7 valid items; 3× redundant Dentist blocks | Single `@graph` per page: Dentist + LocalBusiness + Organization + Physician + WebSite | ✅ v2 superior |
| **FAQPage schema** | None | Auto-extracted on FAQ pages (18 Qs on `/new-patient-faqs`) + priority money pages | ✅ v2 superior |
| **Physician / E-E-A-T schema** | Dr. Nadia not structured | `Physician` entity on every page; `ProfilePage` on `/meet-the-doctor` | ✅ v2 superior |
| **llms.txt (GEO)** | Does not exist | ✅ Created with prompt-style Q&A | ✅ v2 superior |
| **llms-full.txt** | N/A | ✅ Auto-generated at build (XERF, blogs, areas) | ✅ v2 superior |
| **humans.txt** | N/A | ✅ Created | ✅ v2 superior |
| **robots.txt** | Basic | Includes sitemap + llms.txt comment | ✅ v2 superior |
| **Sitemap** | Duda-generated | 82 URLs, priority-weighted | ✅ v2 superior |
| **Redirects** | Duda chains, meta refresh | Server 301 via `_redirects` + `.htaccess` | ✅ v2 superior |
| **Admin preview assets** | N/A | Stripped from production build | ✅ v2 superior |
| **CTR on impressions** | 0.67% site-wide | Better titles started; homepage H1 still soft for "dentist clearwater" | ⚠️ ongoing |
| **Crawled-not-indexed** | 26 URLs | Cleaner content; may still need consolidation | ⚠️ ongoing post-launch |

### Overall grades (qualitative)

| Layer | Live | v2 | Notes |
|-------|------|-----|-------|
| **Technical SEO / crawl** | C | A- | v2 fixes 5xx, AMP, 404s, Duda bloat |
| **On-page SEO** | C | A- | H1s, meta, titles improved; full JSON-LD `@graph` on all pages |
| **Local SEO** | C+ | B+ | Service areas + `geo`, `openingHours`, `sameAs`, `AggregateRating` in schema |
| **AEO (snippets / AI answers)** | D | B- | FAQPage schema on FAQ + priority service pages |
| **GEO (LLM discovery)** | F | B | llms.txt + llms-full now in v2 |
| **Conversion / UX** | D | B | Single phone, single booking path |
| **Performance** | D+ mobile | TBD | Run PSI on v2 before client demo |

---

## SEO / AEO / GEO notes (summary)

### SEO (Google Search)

- **Strength on live:** Exact-match domain, 72+ URLs, active blog, XERF page is a traffic anchor.
- **Weakness on live:** Low indexation rate, broken AMP, Duda JS failures, weak SERP CTR, NAP chaos, missing H1s.
- **v2 improvements:** Static crawlable HTML, redirects, improved titles on money pages, service areas, single NAP.
- **Still needed:** Schema `@graph` cleanup, FAQPage markup, homepage SERP test for "dentist clearwater", PSI benchmark.

### AEO (Answer engines / featured snippets)

- FAQ content on `new-patient-faqs` and blog posts exists in v2.
- Blog posts now link to canonical service pages (emergency, implants, anxiety, therapy dogs).
- **Deferred:** FAQPage JSON-LD, speakable direct-answer blocks, HowTo on contact flow.

### GEO (Generative / LLM discovery)

**Path convention:** Use **`/llms.txt`** (not `/llm.txt`) and optionally **`/llms-full.txt`**.

| File | Purpose |
|------|---------|
| **`/llms.txt`** | Short AI summary: canonical facts, do-not-infer guardrails, top services, key pages, service areas, **intent mapping**, high-value questions, link to full file |
| **`/llms-full.txt`** | Expanded context: all 82 pages with summaries, doctor bio, financing, policies, videos, reviews, social/GBP links, schema overview, complete page catalog (auto-generated at build) |

**`llms.txt` sections (June 10 update):**
- Canonical Business Facts (NAP, hours, services, service area)
- Do Not Infer (medical/dental safety guardrails for YMYL)
- Intent Mapping (query → page, e.g. "emergency dentist Clearwater" → Emergency Dentistry)
- High-Value Questions (supplement to intent mapping)
- Optional → link to `llms-full.txt`

**Discovery:** `robots.txt` includes commented URLs for both llms files.

**Realistic expectation:** `llms.txt` is low/medium signal for ChatGPT recommendations vs GBP, reviews, indexed pages, and citations — but cheap and useful for agents that fetch it directly.

- Live site had **neither** file.
- v2 has both, maintained in `public/llms.txt` + `scripts/llms-content.mjs`.

---

## Launch SEO work completed (June 10, 2026)

### Redirects & infrastructure

- [x] Expanded `src/content/redirects.json` to **21 rules** (GSC 404s, AMP, short URLs, legacy slugs)
- [x] `/ampify/*` wildcard in `dist/.htaccess` and `dist/_redirects`
- [x] `impact.clearwaterdentist.com/*` host redirects (active when DNS points to new host)
- [x] Server **301 only** — removed HTML meta-refresh redirect stub pages from build output
- [x] `PREVIEW_NOINDEX=false` by default (production indexable; set `PREVIEW_NOINDEX=true` only for GitHub preview)
- [x] Local `serve.mjs` returns HTTP 301 for redirect rules (dev testing)

### On-page (`pages.json` via `scripts/apply-launch-seo.mjs`)

- [x] 18 H1 fixes: "at Clearwater, FL" → "in Clearwater, FL"
- [x] 5 missing meta descriptions filled (incl. `new-patient-faqs`)
- [x] 13 blog posts: `canonicalService` + rendered CTA band to money pages
- [x] Emoji removed from needle-free dentistry title

### New pages (build-time from `site.json` serviceAreas)

- [x] `/dentist-clearwater-fl`
- [x] `/dentist-safety-harbor-fl`
- [x] `/dentist-dunedin-fl`
- [x] `/dentist-palm-harbor-fl`
- [x] `/dentist-largo-fl`

### GEO files

- [x] `public/llms.txt` — compact index + Questions People Ask
- [x] `llms-full.txt` — auto-generated in `scripts/build.mjs` at each build
- [x] `public/humans.txt` — team/site credits

### Production build hygiene

- [x] `site-admin-preview.css` / JS only load when `PREVIEW_NOINDEX=true`
- [x] `robots.txt` references llms.txt

### Verification

```powershell
cd "E:\Website Audit\High Prospective Clients\DentistClearwater v2"
npm run build:production
npm run verify:launch-seo
```

Last verified: **82 sitemap URLs**, **21 redirects**, all checks passed.

---

## Structured data sprint (completed Jun 11, 2026)

Implemented in `scripts/schema-graph.mjs` — injected on **all 82 public pages** via `build.mjs`.

### Global `@graph` nodes (every page)

| Type | Purpose |
|------|---------|
| `Dentist` + `LocalBusiness` | Canonical practice entity (`#dentist`) — NAP, `geo`, hours, `priceRange`, `sameAs`, `AggregateRating` |
| `Organization` | Brand entity with logo + social profiles |
| `Physician` | Dr. Nadia Pokrovskaya, D.M.D. — E-E-A-T |
| `WebSite` | Site-level publisher node |
| `WebPage` / `ContactPage` / `ProfilePage` / `CollectionPage` | Page-type-specific shell |
| `BreadcrumbList` | All pages except homepage |

### Page-type enhancements

| Page type | Additional schema |
|-----------|-------------------|
| `home` | `Review` samples + hero `VideoObject` |
| `service` | `Service` + `FAQPage` when Q&A items detected |
| `serviceArea` | `Service` with `areaServed` city |
| `blogPost` | `BlogPosting` + author → Physician |
| `doctor` | `mainEntity` → Physician |
| `contact` | `ContactPage` |
| Article-style service URLs | `Article` instead of `Service` |
| Pages with `videos[]` | `VideoObject` per video |

### Verify after build

```powershell
npm run build:production
npm run verify:schema
```

**Rich Results Test note:** Google may fail to crawl `knight-logics.github.io` previews. After domain cutover, re-test `/`, `/meet-the-doctor`, `/new-patient-faqs`, `/dental-implants-clearwater-fl`, and one blog post.

---

## Deferred (intentional — next phase)

| Item | Why deferred |
|------|----------------|
| PageSpeed / Core Web Vitals | PSI link logged above; continue tuning mobile LCP |
| Homepage H1/title A/B for "dentist clearwater" | Needs client approval on positioning |
| GSC URL lists for 21×noindex + 26×crawled-not-indexed | Export drilldowns from GSC when ready |
| Submit v2 sitemap | **After domain transfer + proposal acceptance** |
| GBP / citation NAP cleanup | Needs GBP access |
| `impact.clearwaterdentist.com` DNS | Redirect rules ready; needs DNS at cutover |

---

## Sitemap & GSC strategy (client decision)

**Current plan (agreed in session):**

- Do **not** submit v2 sitemap until domain points to v2 and client accepts proposal.
- Live Duda sitemap remains authoritative until cutover — protects existing indexed URLs.
- At cutover: submit `https://www.clearwaterdentist.com/sitemap.xml` (82 URLs), then URL Inspection on top 5 money pages.

**Why this is smart:** Live money pages (especially XERF, homepage, emergency) keep earning impressions during sales cycle. v2 sitemap submission triggers recrawl of the full new structure — best done once, at launch.

---

## Client meeting talking points

1. **"Your site is visible but not clicking"** — 208K impressions at 0.67% CTR; v2 has better emergency/XERF/home titles ready.
2. **"Google is fighting your platform"** — 10 AMP 5xx errors, 6 server errors, Duda JS failures; v2 removes all of that.
3. **"Only 42% of your pages are indexed"** — v2 has cleaner HTML, proper H1s, redirects, and 5 new local pages.
4. **"Your #3 page is XERF"** — URL preserved exactly; now also in llms.txt for AI discovery.
5. **"One phone, one booking path"** — conversion fix independent of SEO.
6. **"We built what Duda couldn't"** — service area pages, llms.txt, blog→service links, 21 redirect rules mapped to your GSC exports.

---

## Key file locations (v2 project)

| Path | Purpose |
|------|---------|
| `src/content/pages.json` | All page content (77 routes) |
| `src/content/site.json` | Business data, service areas, nav |
| `src/content/redirects.json` | 21 redirect rules |
| `public/llms.txt` | LLM compact index |
| `public/humans.txt` | humans.txt |
| `scripts/build.mjs` | Static site generator |
| `scripts/schema-graph.mjs` | JSON-LD `@graph` builder (all pages) |
| `scripts/verify-schema.mjs` | Post-build schema verification |
| `scripts/apply-launch-seo.mjs` | Patches pages.json (H1, meta, blog links) |
| `scripts/verify-launch-seo.mjs` | Post-build verification |
| `dist/` | Production output (deploy this) |
| `dist/_redirects` | Netlify/Vercel 301 rules |
| `dist/.htaccess` | Apache 301 rules + ampify wildcard |
| `clearwater_dentist_gsc_url_migration_map.xlsx` | Performance + migration priorities |

---

## Commands reference

```powershell
cd "E:\Website Audit\High Prospective Clients\DentistClearwater v2"

# Full production build (patches + build, indexable)
npm run build:production

# Verify launch SEO checks
npm run verify:launch-seo

# Local preview with 301 redirect support
npm run serve
# → http://127.0.0.1:4178

# GitHub preview only (noindex)
$env:PREVIEW_NOINDEX = "true"
node scripts/build.mjs
```

---

## Change log

| Date | Change |
|------|--------|
| 2026-06-04 | Initial AUDIT.md, crawl, PSI baseline on live Duda site |
| 2026-06-10 | GSC exports analyzed (Coverage, AMP, 404 drilldown) |
| 2026-06-10 | Launch SEO batch: redirects, llms, service areas, H1/meta/blog fixes, admin CSS strip |
| 2026-06-10 | This document created — live vs v2 comparison + launch notes |
| 2026-06-11 | PageSpeed Insights v2 link added; full JSON-LD `@graph` schema on all 82 pages |
| 2026-06-11 | GitHub Pages mobile hero video 404 fixed (`prepare-pages.mjs` + `resolveSitePath`) |
| 2026-06-11 | Rich Results video schema fix — 1 hero `VideoObject`, poster fallbacks, preview asset origin in CI |

---

*Maintained as part of the Clearwater Dentist rebuild engagement. Update this file when PSI, Rich Results, or cutover work completes.*
