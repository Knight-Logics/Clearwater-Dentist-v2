import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IMG_DIR = path.join(ROOT, 'public/assets/images');
const WEBP_QUALITY = 82;

const CONTENT_GLOBS = [
  path.join(ROOT, 'src/content/pages.json'),
  path.join(ROOT, 'src/content/site.json'),
  path.join(ROOT, 'src/content/asset-map.json'),
  path.join(ROOT, 'src/content/google-reviews.json'),
  path.join(ROOT, 'scripts/build.mjs'),
  path.join(ROOT, 'scripts/clean-page-sections.mjs'),
  path.join(ROOT, 'scripts/llms-content.mjs'),
];

const BROKEN_IMAGE_FIXES = {
  '/assets/images/gum-disease-v2-0000000-1920w.jpg':
    '/assets/images/clearwater-dentist-clearwater-fl-gingivectomy-be1e5855-1920w.jpg',
};

const IMAGE_PATH_RE = /\/assets\/images\/[A-Za-z0-9._-]+\.(?:jpe?g|png|webp)/gi;

function collectImagePaths(text) {
  const refs = new Set();
  for (const match of text.matchAll(IMAGE_PATH_RE)) {
    refs.add(match[0].split('?')[0]);
  }
  return refs;
}

function toWebpPath(imagePath) {
  return imagePath.replace(/\.(jpe?g|png)$/i, '.webp');
}

async function readText(file) {
  return fs.readFile(file, 'utf8');
}

async function writeText(file, text) {
  await fs.writeFile(file, text, 'utf8');
}

async function applyBrokenFixes() {
  for (const file of CONTENT_GLOBS) {
    let text = await readText(file);
    let changed = false;
    for (const [broken, replacement] of Object.entries(BROKEN_IMAGE_FIXES)) {
      if (text.includes(broken)) {
        text = text.split(broken).join(replacement);
        changed = true;
      }
    }
    if (changed) await writeText(file, text);
  }
}

async function convertOne(imagePath) {
  if (/\.webp$/i.test(imagePath)) return { imagePath, webpPath: imagePath, status: 'already-webp' };

  const sourceAbs = path.join(ROOT, 'public', imagePath.replace(/^\//, ''));
  const webpPath = toWebpPath(imagePath);
  const targetAbs = path.join(ROOT, 'public', webpPath.replace(/^\//, ''));

  try {
    await fs.access(sourceAbs);
  } catch {
    return { imagePath, webpPath, status: 'missing-source' };
  }

  const sourceStat = await fs.stat(sourceAbs);
  let targetStat = null;
  try {
    targetStat = await fs.stat(targetAbs);
  } catch {
    targetStat = null;
  }

  if (targetStat && targetStat.mtimeMs >= sourceStat.mtimeMs) {
    return { imagePath, webpPath, status: 'skipped-fresh' };
  }

  await sharp(sourceAbs)
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(targetAbs);

  const saved = sourceStat.size - (await fs.stat(targetAbs)).size;
  return { imagePath, webpPath, status: 'converted', saved };
}

function replaceRasterPaths(text) {
  return text.replace(IMAGE_PATH_RE, (match) => {
    if (/\.webp$/i.test(match)) return match;
    return toWebpPath(match);
  });
}

async function main() {
  console.log('Applying broken image fixes...');
  await applyBrokenFixes();

  const allRefs = new Set();
  const fileTexts = new Map();
  for (const file of CONTENT_GLOBS) {
    const text = await readText(file);
    fileTexts.set(file, text);
    for (const ref of collectImagePaths(text)) allRefs.add(ref);
  }

  const rasterRefs = [...allRefs].filter((ref) => !/\.webp$/i.test(ref)).sort();
  console.log(`Found ${rasterRefs.length} raster image references to convert.`);

  const results = { converted: 0, skipped: 0, missing: 0, saved: 0 };
  const missing = [];
  for (const ref of rasterRefs) {
    const result = await convertOne(ref);
    if (result.status === 'converted') {
      results.converted += 1;
      results.saved += Math.max(0, result.saved || 0);
    } else if (result.status === 'missing-source') {
      results.missing += 1;
      missing.push(ref);
    } else {
      results.skipped += 1;
    }
  }

  let updatedFiles = 0;
  for (const [file, text] of fileTexts.entries()) {
    const next = replaceRasterPaths(text);
    if (next !== text) {
      await writeText(file, next);
      updatedFiles += 1;
    }
  }

  console.log('\n=== WebP conversion complete ===');
  console.log(`Converted: ${results.converted}`);
  console.log(`Skipped (already fresh): ${results.skipped}`);
  console.log(`Missing source: ${results.missing}`);
  console.log(`Estimated bytes saved on disk: ${(results.saved / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Content files updated: ${updatedFiles}`);

  if (missing.length) {
    console.log('\nMissing sources:');
    missing.forEach((ref) => console.log(` - ${ref}`));
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
