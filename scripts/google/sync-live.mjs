import fs from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';
import { loadDefaultEnv, loadEnvFile } from './load-env.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const CONFIG = JSON.parse(await fs.readFile(path.join(ROOT, 'scripts/google/config.json'), 'utf8'));

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function pct(value) {
  return `${((Number(value) || 0) * 100).toFixed(2)}%`;
}

function urlToRoute(url) {
  try {
    const pathname = new URL(url).pathname.replace(/\/$/, '') || '/';
    return pathname;
  } catch {
    const cleaned = String(url || '').split('?')[0].split('#')[0].replace(/\/$/, '') || '/';
    return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  }
}

async function persistGscToken(oauth2) {
  const creds = oauth2.credentials || {};
  if (!creds.refresh_token && !creds.access_token) return;
  let existing = {};
  try {
    existing = JSON.parse(await fs.readFile(CONFIG.gsc.tokenFile, 'utf8'));
  } catch {}
  const merged = {
    ...existing,
    ...creds,
    refresh_token: creds.refresh_token || existing.refresh_token
  };
  await fs.writeFile(CONFIG.gsc.tokenFile, `${JSON.stringify(merged, null, 2)}\n`, 'utf8');
}

async function getGscAuth() {
  loadEnvFile(CONFIG.gsc.envFile);
  const tokenRaw = await fs.readFile(CONFIG.gsc.tokenFile, 'utf8');
  const token = JSON.parse(tokenRaw);
  const clientId = process.env.GSC_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GSC_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('Missing GSC_OAUTH_CLIENT_ID / GSC_OAUTH_CLIENT_SECRET in Knight Logics .env.gsc.local');
  }
  const oauth2 = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost');
  oauth2.setCredentials(token);
  oauth2.on('tokens', async tokens => {
    oauth2.setCredentials({ ...oauth2.credentials, ...tokens });
    await persistGscToken(oauth2);
  });
  try {
    const { credentials } = await oauth2.refreshAccessToken();
    oauth2.setCredentials({ ...token, ...credentials });
    await persistGscToken(oauth2);
  } catch (error) {
    const message = error?.message || String(error);
    if (/invalid_grant/i.test(message)) {
      throw new Error('invalid_grant');
    }
    throw error;
  }
  return oauth2;
}

function launchGscReauth() {
  const gscScript = path.resolve(path.dirname(CONFIG.gsc.tokenFile), 'scripts/gsc_api.py');
  console.error('Opening browser for GSC re-auth (one-time). Complete sign-in, then re-run npm run sync:google.');
  return new Promise((resolve, reject) => {
    const child = spawn('python', [gscScript, 'auth'], {
      cwd: path.dirname(CONFIG.gsc.tokenFile),
      stdio: 'inherit',
      shell: process.platform === 'win32'
    });
    child.on('error', reject);
    child.on('close', code => (code === 0 ? resolve() : reject(new Error(`gsc_api.py auth exited with code ${code}`))));
  });
}

function collectGbpAccountCandidates() {
  const accounts = new Set();
  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;
    if (key === 'CLEARWATER_GBP_ACCOUNT_NAME' || key === 'GBP_ACCOUNT_NAME' || /_GBP_ACCOUNT_NAME$/i.test(key)) {
      accounts.add(value.startsWith('accounts/') ? value : `accounts/${value}`);
    }
  }
  return [...accounts];
}

async function resolveGbpFromKnownAccounts(accessToken, titleHint) {
  const directAccount = process.env.CLEARWATER_GBP_ACCOUNT_NAME || process.env.GBP_ACCOUNT_NAME;
  const directLocation = process.env.CLEARWATER_GBP_LOCATION_NAME || process.env.GBP_LOCATION_NAME;
  if (directAccount && directLocation) {
    return { account: directAccount, location: directLocation };
  }

  for (const accountName of collectGbpAccountCandidates()) {
    try {
      const locationsPayload = await gbpGet(
        `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,websiteUri,storefrontAddress,metadata`,
        accessToken
      );
      const locations = locationsPayload.locations || [];
      const hit = locations.find(item => String(item.title || '').toLowerCase().includes(titleHint))
        || locations.find(item => String(item.websiteUri || '').toLowerCase().includes('clearwaterdentist.com'));
      if (hit) return { account: accountName, location: hit.name, discovered: true };
    } catch (error) {
      console.warn(`GBP location scan failed for ${accountName}: ${error.message}`);
    }
  }
  return null;
}

async function resolveGscProperty(searchconsole, auth) {
  const { data } = await searchconsole.sites.list({ auth });
  const sites = data.siteEntry || [];
  const preferred = [CONFIG.gsc.siteUrl, CONFIG.gsc.siteUrlFallback];
  for (const candidate of preferred) {
    const match = sites.find(site => site.siteUrl === candidate);
    if (match) return match.siteUrl;
  }
  const hint = 'clearwaterdentist.com';
  const fuzzy = sites.find(site => String(site.siteUrl || '').toLowerCase().includes(hint));
  if (fuzzy) return fuzzy.siteUrl;
  throw new Error(`No Clearwater GSC property found. Available: ${sites.map(site => site.siteUrl).join(', ') || 'none'}`);
}

async function fetchGsc(auth) {
  const searchconsole = google.searchconsole('v1');
  const siteUrl = await resolveGscProperty(searchconsole, auth);
  const startDate = daysAgo(CONFIG.gsc.days || 90);
  const endDate = daysAgo(3);

  const [queries, pages, summary] = await Promise.all([
    searchconsole.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: { startDate, endDate, dimensions: ['query'], rowLimit: 50, dataState: 'all' }
    }),
    searchconsole.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: { startDate, endDate, dimensions: ['page'], rowLimit: 50, dataState: 'all' }
    }),
    searchconsole.searchanalytics.query({
      auth,
      siteUrl,
      requestBody: { startDate, endDate, dataState: 'all' }
    })
  ]);

  const totals = summary.data.rows?.[0] || null;
  return {
    connected: true,
    siteUrl,
    period: { startDate, endDate },
    totals: totals ? {
      clicks: totals.clicks || 0,
      impressions: totals.impressions || 0,
      ctr: totals.ctr || 0,
      position: totals.position || 0
    } : null,
    queries: (queries.data.rows || []).map(row => ({
      query: row.keys?.[0] || '',
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    })),
    pages: (pages.data.rows || []).map(row => ({
      page: row.keys?.[0] || '',
      route: urlToRoute(row.keys?.[0] || ''),
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0
    }))
  };
}

async function gbpAccessToken() {
  loadDefaultEnv();
  const clientId = process.env.GBP_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GBP_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GBP_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing GBP_OAUTH_CLIENT_ID, GBP_OAUTH_CLIENT_SECRET, or GBP_REFRESH_TOKEN in accounts.env');
  }
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: 'refresh_token'
  });
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const payload = await response.json();
  if (!response.ok || !payload.access_token) {
    throw new Error(`GBP token refresh failed: ${JSON.stringify(payload)}`);
  }
  return payload.access_token;
}

async function gbpGet(url, accessToken) {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/json' }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`GBP API ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
}

function sumMetricSeries(series) {
  const values = series?.dailyMetricTimeSeries?.[0]?.timeSeries?.datedValues || [];
  return values.reduce((sum, entry) => sum + Number(entry?.value || 0), 0);
}

async function fetchGbp(accessToken) {
  const titleHint = (process.env.CLEARWATER_GBP_LOCATION_TITLE || CONFIG.gbp.locationTitle || 'Clearwater Dentist').toLowerCase();
  const resolved = await resolveGbpFromKnownAccounts(accessToken, titleHint);
  let account = resolved?.account;
  let location = resolved?.location;
  if (resolved?.discovered) {
    console.log(`GBP resolved via known account scan: ${account} / ${location}`);
  }

  if (!account || !location) {
    if (!process.env.CLEARWATER_GBP_ACCOUNT_NAME && !process.env.CLEARWATER_GBP_LOCATION_NAME) {
      console.warn('GBP direct IDs not set. Trying account discovery (may fail if GBP account-management quota is 0).');
      console.warn('Run npm run discover:gbp or set CLEARWATER_GBP_ACCOUNT_NAME and CLEARWATER_GBP_LOCATION_NAME in .env.google.local.');
    }
    const accounts = (await gbpGet('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', accessToken)).accounts || [];
    if (!accounts.length) throw new Error('No GBP accounts returned.');
    account = account
      || accounts.find(item => String(item.accountName || '').toLowerCase().includes(CONFIG.gbp.accountHint || 'clearwater'))?.name
      || accounts[0].name;

    const locationsPayload = await gbpGet(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${account}/locations?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,metadata`,
      accessToken
    );
    const locations = locationsPayload.locations || [];
    location = location
      || locations.find(item => String(item.title || '').toLowerCase().includes(titleHint))?.name
      || locations[0]?.name;
  }

  if (!location) throw new Error('Could not resolve Clearwater Dentist GBP location.');

  const locationPayload = await gbpGet(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${location}?readMask=name,title,storefrontAddress,phoneNumbers,websiteUri,metadata,categories`,
    accessToken
  );

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - 28);
  const fmt = d => `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;

  let performance = null;
  let actions = [];
  try {
    const metrics = [
      'BUSINESS_IMPRESSIONS_DESKTOP_MAPS',
      'BUSINESS_IMPRESSIONS_MOBILE_MAPS',
      'BUSINESS_IMPRESSIONS_DESKTOP_SEARCH',
      'BUSINESS_IMPRESSIONS_MOBILE_SEARCH',
      'CALL_CLICKS',
      'WEBSITE_CLICKS',
      'BUSINESS_DIRECTION_REQUESTS'
    ];
    const query = new URLSearchParams();
    for (const metric of metrics) query.append('dailyMetrics', metric);
    query.set('dailyRange.startDate.year', String(start.getFullYear()));
    query.set('dailyRange.startDate.month', String(start.getMonth() + 1));
    query.set('dailyRange.startDate.day', String(start.getDate()));
    query.set('dailyRange.endDate.year', String(end.getFullYear()));
    query.set('dailyRange.endDate.month', String(end.getMonth() + 1));
    query.set('dailyRange.endDate.day', String(end.getDate()));
    const performanceUrl = `https://businessprofileperformance.googleapis.com/v1/${location}:fetchMultiDailyMetricsTimeSeries?${query.toString()}`;
    performance = await gbpGet(performanceUrl, accessToken);
    const series = performance.multiDailyMetricTimeSeries || [];
    const metricTotals = {};
    for (const entry of series) {
      const metric = entry.dailyMetricTimeSeries?.[0]?.dailyMetric;
      if (!metric) continue;
      metricTotals[metric] = sumMetricSeries(entry);
    }
    const mapImpressions = (metricTotals.BUSINESS_IMPRESSIONS_DESKTOP_MAPS || 0) + (metricTotals.BUSINESS_IMPRESSIONS_MOBILE_MAPS || 0);
    const searchImpressions = (metricTotals.BUSINESS_IMPRESSIONS_DESKTOP_SEARCH || 0) + (metricTotals.BUSINESS_IMPRESSIONS_MOBILE_SEARCH || 0);
    actions = [
      { label: 'Map impressions (28d)', value: String(mapImpressions) },
      { label: 'Search impressions (28d)', value: String(searchImpressions) },
      { label: 'Website clicks (28d)', value: String(metricTotals.WEBSITE_CLICKS || 0) },
      { label: 'Calls (28d)', value: String(metricTotals.CALL_CLICKS || 0) },
      { label: 'Direction requests (28d)', value: String(metricTotals.BUSINESS_DIRECTION_REQUESTS || 0) }
    ];
  } catch (error) {
    performance = { error: error.message };
  }

  return {
    connected: true,
    account,
    location: {
      name: locationPayload.name,
      title: locationPayload.title,
      address: locationPayload.storefrontAddress,
      phone: locationPayload.phoneNumbers?.primaryPhone || '',
      websiteUri: locationPayload.websiteUri || '',
      categories: locationPayload.categories
    },
    actions,
    performance28d: performance
  };
}

function toAdminShape(live) {
  const seoOpportunities = (live.gsc?.queries || []).map(row => ({
    query: row.query,
    page: '',
    impressions: row.impressions,
    clicks: row.clicks,
    ctr: pct(row.ctr),
    position: Number(row.position || 0).toFixed(1),
    action: 'Review live Search Console query performance',
    status: 'Live'
  }));

  const pageTraffic = new Map((live.gsc?.pages || []).map(row => [row.route.toLowerCase(), row]));

  return {
    syncedAt: live.syncedAt,
    gsc: live.gsc,
    gbp: live.gbp,
    adminPatch: {
      seoOpportunities,
      pageTraffic: Object.fromEntries(pageTraffic),
      gbpActions: live.gbp?.actions || [],
      metrics: live.gsc?.totals ? [
        { label: 'GSC clicks (90d)', value: String(live.gsc.totals.clicks), delta: `Live · ${live.gsc.siteUrl}` },
        { label: 'GSC impressions (90d)', value: String(live.gsc.totals.impressions), delta: 'Live Search Console' },
        { label: 'Avg position (90d)', value: Number(live.gsc.totals.position || 0).toFixed(1), delta: `CTR ${pct(live.gsc.totals.ctr)}` },
        { label: 'GBP location', value: live.gbp?.location?.title || '—', delta: 'Live Business Profile' }
      ] : []
    },
    dataSources: [
      {
        label: 'Google Search Console',
        status: live.gsc?.connected ? 'connected' : 'not-connected',
        detail: live.gsc?.connected
          ? `Live data for ${live.gsc.siteUrl}. Last sync ${live.syncedAt}.`
          : (live.gsc?.error === 'invalid_grant'
            ? 'OAuth token expired — re-run GSC auth in Knight Logics Growth System, then sync again.'
            : `Sync failed: ${live.gsc?.error || 'unknown error'}`)
      },
      {
        label: 'Google Business Profile',
        status: live.gbp?.connected ? 'connected' : 'not-connected',
        detail: live.gbp?.connected
          ? `Live profile: ${live.gbp.location?.title || 'Clearwater Dentist'}. Last sync ${live.syncedAt}.`
          : (/429|quota|rate.?limit/i.test(String(live.gbp?.error || ''))
            ? 'Account discovery blocked by quota — set CLEARWATER_GBP_ACCOUNT_NAME and CLEARWATER_GBP_LOCATION_NAME in .env.google.local.'
            : `Sync failed: ${String(live.gbp?.error || 'unknown error').slice(0, 160)}`)
      }
    ]
  };
}

async function main() {
  const result = { syncedAt: new Date().toISOString(), errors: [] };
  try {
    const auth = await getGscAuth();
    result.gsc = await fetchGsc(auth);
    console.log(`GSC connected: ${result.gsc.siteUrl} (${result.gsc.totals?.clicks || 0} clicks / ${result.gsc.totals?.impressions || 0} impressions)`);
  } catch (error) {
    result.gsc = { connected: false, error: error.message };
    result.errors.push(`GSC: ${error.message}`);
    console.error('GSC sync failed:', error.message);
    if (String(error.message).includes('invalid_grant')) {
      if (process.argv.includes('--reauth-gsc')) {
        try {
          await launchGscReauth();
          const auth = await getGscAuth();
          result.gsc = await fetchGsc(auth);
          console.log(`GSC connected after re-auth: ${result.gsc.siteUrl}`);
        } catch (reauthError) {
          console.error('GSC re-auth failed:', reauthError.message);
        }
      } else {
        console.error('GSC refresh token expired/revoked. Re-run with: npm run sync:google -- --reauth-gsc');
      }
    }
  }

  try {
    const accessToken = await gbpAccessToken();
    result.gbp = await fetchGbp(accessToken);
    console.log(`GBP connected: ${result.gbp.location?.title || 'location'} (${result.gbp.actions?.length || 0} metrics)`);
  } catch (error) {
    result.gbp = { connected: false, error: error.message };
    result.errors.push(`GBP: ${error.message}`);
    console.error('GBP sync failed:', error.message);
  }

  const output = toAdminShape(result);
  const outPath = path.resolve(ROOT, CONFIG.output);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${outPath}`);
  if (result.errors.length) process.exitCode = 1;
}

await main();
