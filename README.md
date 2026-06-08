# DentistClearwater v2 Clean Rebuild

This folder is a clean static rebuild of Clearwater Dentist. It is generated from the local `ClearwaterDentist/rebuild/dist` mirror, but the output does not keep Duda class names, Duda runtime scripts, Duda CSS packages, or CDN-hosted asset paths.

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
cd "E:Website AuditHigh Prospective ClientsDentistClearwater v2"
node scripts/build.mjs
node scripts/verify-static.mjs
node scripts/qa-screenshots.mjs
node scripts/serve.mjs --port 4178
```

Preview: http://127.0.0.1:4178
