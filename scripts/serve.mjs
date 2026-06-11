import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scrapeLeadsFromGsc, scrapeReferralProspects } from './lib/admin-scraper.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const portArg = process.argv.includes('--port') ? process.argv[process.argv.indexOf('--port') + 1] : process.env.PORT;
const PORT = Number(portArg || 4178);
const EMAIL_AGENT_ORIGIN = process.env.EMAIL_AGENT_ORIGIN || 'http://127.0.0.1:5100';

const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.mp4': 'video/mp4',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8'
};

let redirectRules = [];

async function loadRedirectRules() {
  try {
    const raw = await fs.readFile(path.join(DIST, '_redirects'), 'utf8');
    redirectRules = raw.split('\n').map(line => line.trim()).filter(Boolean).map((line) => {
      const parts = line.split(/\s+/);
      if (parts.length < 3) return null;
      return { from: parts[0], to: parts[1], code: Number(parts[2]) || 301 };
    }).filter(Boolean);
  } catch {
    redirectRules = [];
  }
}

function matchRedirect(pathname) {
  for (const rule of redirectRules) {
    if (rule.from.includes('://') || rule.from.includes('*')) continue;
    if (rule.from === pathname) return rule.to;
  }
  if (pathname.startsWith('/ampify/')) {
    const tail = pathname.slice('/ampify/'.length);
    if (tail === 'teeth-whitening') return '/teeth-whitening-clearwater-fl';
    return tail ? `/${tail}` : '/';
  }
  if (pathname === '/ampify') return '/';
  return null;
}

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]).replace(/\\/g, '/');
  const target = clean === '/' ? path.join(DIST, 'index.html') : path.join(DIST, clean.replace(/^\//, ''));
  const normalized = path.normalize(target);
  if (!normalized.startsWith(DIST)) return null;
  return normalized;
}

function proxyEmailAgent(req, res, targetUrl) {
  const headers = { ...req.headers, host: '127.0.0.1:5100' };
  delete headers['accept-encoding'];

  const proxyReq = http.request(targetUrl, { method: req.method, headers }, proxyRes => {
    const outHeaders = { ...proxyRes.headers };
    outHeaders['access-control-allow-origin'] = '*';
    res.writeHead(proxyRes.statusCode || 502, outHeaders);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', () => {
    res.writeHead(502, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'email_agent_unreachable', detail: 'Start Email Agent on port 5100' }));
  });

  if (req.method === 'GET' || req.method === 'HEAD') {
    proxyReq.end();
    return;
  }

  req.pipe(proxyReq);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', 'http://127.0.0.1');

  if (url.pathname.startsWith('/api/email-proxy/')) {
    const apiPath = url.pathname.replace('/api/email-proxy', '/api') + url.search;
    proxyEmailAgent(req, res, EMAIL_AGENT_ORIGIN + apiPath);
    return;
  }

  if (url.pathname === '/api/admin/scrape-leads' && req.method === 'GET') {
    try {
      const payload = await scrapeLeadsFromGsc(ROOT);
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
      res.end(JSON.stringify(payload));
    } catch (error) {
      res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: String(error.message || error) }));
    }
    return;
  }

  if (url.pathname === '/api/admin/scrape-referrals' && req.method === 'GET') {
    try {
      const payload = await scrapeReferralProspects(ROOT);
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'access-control-allow-origin': '*' });
      res.end(JSON.stringify(payload));
    } catch (error) {
      res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: false, error: String(error.message || error) }));
    }
    return;
  }

  const redirectTarget = matchRedirect(url.pathname);
  if (redirectTarget) {
    res.writeHead(301, { location: redirectTarget });
    res.end();
    return;
  }

  let file = safePath(url.pathname);
  if (!file) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  try {
    let stat = await fs.stat(file).catch(() => null);
    if (stat && stat.isDirectory()) file = path.join(file, 'index.html');
    else if (!stat && !path.extname(file)) file = path.join(file, 'index.html');
    const data = await fs.readFile(file);
    res.writeHead(200, { 'content-type': types[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('Not found');
  }
});

server.listen(PORT, '127.0.0.1', async () => {
  await loadRedirectRules();
  console.log('Serving dist at http://127.0.0.1:' + PORT);
  console.log('Loaded redirect rules:', redirectRules.length);
  console.log('Email Agent proxy: /api/email-proxy/* -> ' + EMAIL_AGENT_ORIGIN + '/api/*');
});
