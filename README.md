# DentistClearwater v2 Clean Rebuild

This folder is a clean static rebuild of Clearwater Dentist. It is generated from the local `ClearwaterDentist/rebuild/dist` mirror, but the output does not keep Duda class names, Duda runtime scripts, Duda CSS packages, or CDN-hosted asset paths.

## Documentation

- **`LAUNCH-NOTES-AND-COMPARISON.md`** — GSC findings, live vs v2 comparison matrix, launch SEO work log, cutover strategy, client talking points.
- **PageSpeed Insights (v2 GitHub preview):** https://pagespeed.web.dev/analysis/https-knight-logics-github-io-Clearwater-Dentist-v2/fvk9iuafl6?form_factor=desktop
- **`../ClearwaterDentist/REBUILD-COMPARISON-NOTES.md`** — Pointer to GSC exports in the audit folder.
- **`../ClearwaterDentist/AUDIT.md`** — Full pre-rebuild site audit (Jun 4, 2026).
- **`clearwater_dentist_gsc_url_migration_map.xlsx`** — URL migration + query opportunities.

## Folder strategy

- `src/content/` stores extracted page data, site data, and the old-to-new asset map.
- `public/assets/` stores organized local assets: images, video, icons, fonts, and documents.
- `assets/css/styles.css` and `assets/js/main.js` are the only sitewide frontend files copied into `dist`.
- `scripts/build.mjs` regenerates every static route into `dist`.
- `scripts/verify-static.mjs` checks for missing assets and legacy Duda tokens.
- `scripts/qa-screenshots.mjs` starts a local server, captures desktop/tablet/mobile screenshots, and writes a layout report.
- `logs/` and `screenshots/` contain QA evidence from the rebuild.

## Commands

```powershell
cd "E:\Website Audit\High Prospective Clients\DentistClearwater v2"

# Production build (patches pages.json + builds indexable dist)
npm run build:production

# Verify launch SEO (redirects, llms, H1s, service areas)
npm run verify:launch-seo

# Local preview (supports 301 redirects)
npm run serve

# GitHub preview only — blocks indexing
$env:PREVIEW_NOINDEX = "true"; node scripts/build.mjs
```

Preview: http://127.0.0.1:4178
