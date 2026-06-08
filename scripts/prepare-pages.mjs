import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const OUT = path.join(ROOT, 'pages-deploy');
const BASE = process.env.PAGES_BASE || '/Clearwater-Dentist-v2/';
const BASE_PATH = BASE.replace(/\/$/, '');
const BASE_SEGMENT = BASE_PATH.replace(/^\//, '') + '/';

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  for (const entry of await fs.readdir(src, { withFileTypes: true })) {
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) await copyDir(from, to);
    else await fs.copyFile(from, to);
  }
}

function prefixRootPaths(text) {
  if (!BASE_PATH || BASE_PATH === '/') return text;

  let out = text;
  out = out.replace(
    /\b(href|src|poster|action)=["']\/(?!\/|https?:|#|mailto:|tel:)([^"']*)["']/gi,
    (_match, attr, value) => {
      if (value.startsWith(BASE_SEGMENT)) return `${attr}="/${value}"`;
      return `${attr}="${BASE_PATH}/${value}"`;
    }
  );
  out = out.replace(
    /\b(srcset)=["']([^"']+)["']/gi,
    (_match, attr, value) =>
      `${attr}="${value.replace(/(^|,\s*)\/(?!\/|https?:)([^,\s]+)/g, `$1${BASE_PATH}/$2`)}"`
  );
  out = out.replace(
    /url\((['"]?)\/(?!\/|data:|https?:)([^'")]+)\1\)/gi,
    (_match, quote, value) => {
      if (value.startsWith(BASE_SEGMENT)) return `url(${quote}/${value}${quote})`;
      return `url(${quote}${BASE_PATH}/${value}${quote})`;
    }
  );
  return out;
}

async function injectBase(file) {
  let html = await fs.readFile(file, 'utf8');
  if (html.includes('data-github-pages-base')) return;
  const tag = `<base href="${BASE}" data-github-pages-base>`;
  html = html.includes('<head>')
    ? html.replace('<head>', `<head>\n  ${tag}`)
    : tag + html;
  await fs.writeFile(file, html, 'utf8');
}

async function prefixFile(file) {
  const before = await fs.readFile(file, 'utf8');
  const after = prefixRootPaths(before);
  if (after !== before) await fs.writeFile(file, after, 'utf8');
}

async function walkHtml(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const current = path.join(dir, entry.name);
    if (entry.isDirectory()) await walkHtml(current);
    else if (entry.name === 'index.html') await injectBase(current);
  }
}

async function walkDeployFiles(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const current = path.join(dir, entry.name);
    if (entry.isDirectory()) await walkDeployFiles(current);
    else if (/\.(html|css|js|xml|txt)$/.test(entry.name)) await prefixFile(current);
  }
}

await fs.rm(OUT, { recursive: true, force: true });
await copyDir(DIST, OUT);
await walkHtml(OUT);
await walkDeployFiles(OUT);
console.log(`Prepared ${OUT} with base href ${BASE}`);
