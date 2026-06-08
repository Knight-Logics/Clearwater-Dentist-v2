# Clean Rebuild Strategy

## Objective

Create a clean static conversion in `DentistClearwater v2` that stops fighting Duda's generated DOM. The old rebuild remains useful as a local content and asset source, but v2 owns its own layout, naming, assets, responsive behavior, and QA artifacts.

## Structural decision

The source site has many routes, but the source project should not have a folder per page. V2 keeps all editable page content in `src/content/pages.json`; the many route folders only exist in generated `dist/` because static hosting needs `/route/index.html` files.

## Asset decision

All local Duda CDN assets were copied into `public/assets/` by asset type instead of preserving nested `cdn/irp/lirp/static/...` folders. The generated `asset-map.json` records how old paths map to clean paths. Duda CSS and JavaScript were intentionally not copied into the frontend.

## Code decision

The generated site uses semantic HTML and reusable components: header, nav, hero, article sections, galleries, contact layout, blog cards, related service cards, footer, JSON-LD, sitemap, and robots file. Class names are readable and scoped to site concepts rather than Duda widget IDs.

## Responsive decision

The CSS uses grid collapse points, stable media aspect ratios, wrapping buttons, no fixed-width content columns on mobile, and a real mobile navigation drawer. The desktop-shrunk viewport case is covered by the same breakpoints as phones and tablets.

## QA decision

Verification is not only visual. `verify-static` checks that generated HTML does not contain Duda runtime tokens and that all referenced local assets exist. `qa-screenshots` captures desktop, tablet, and mobile screenshots across home, a major service page, gallery, contact, and a blog post, then records horizontal overflow and element-level overflow candidates.

## Known tradeoff

This is a clean conversion, not a pixel-for-pixel Duda clone. It preserves routes, metadata, copy, images, media, service navigation, reviews, CTAs, and business data while replacing Duda's layout/runtime with maintainable static code.
