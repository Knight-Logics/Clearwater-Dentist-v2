import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadDefaultEnv } from './load-env.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const ENV_OUT = path.join(ROOT, '.env.google.local');
const SITE = JSON.parse(await fs.readFile(path.join(ROOT, 'src/content/site.json'), 'utf8'));

function collectAccountCandidates() {
  const accounts = new Set();
  for (const [key, value] of Object.entries(process.env)) {
    if (!value) continue;
    if (key === 'GBP_ACCOUNT_NAME' || key === 'CLEARWATER_GBP_ACCOUNT_NAME' || /_GBP_ACCOUNT_NAME$/i.test(key)) {
      accounts.add(value.startsWith('accounts/') ? value : `accounts/${value}`);
    }
  }
  return [...accounts];
}

async function gbpAccessToken() {
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

async function gbpPost(url, accessToken, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`GBP API ${response.status}: ${JSON.stringify(payload)}`);
  return payload;
}

async function listLocationsForAccount(accountName, accessToken) {
  const locations = [];
  let pageToken = '';
  do {
    const query = new URLSearchParams({
      readMask: 'name,title,storefrontAddress,websiteUri,metadata'
    });
    if (pageToken) query.set('pageToken', pageToken);
    const payload = await gbpGet(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?${query}`,
      accessToken
    );
    locations.push(...(payload.locations || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  return locations;
}

function matchesClearwater(location) {
  const title = String(location.title || '').toLowerCase();
  const website = String(location.websiteUri || '').toLowerCase();
  const address = JSON.stringify(location.storefrontAddress || {}).toLowerCase();
  const placeId = String(location.metadata?.placeId || '').toLowerCase();
  const targetPlace = 'chijddsi0kbuwogrvbizchzsq3s';
  return title.includes('clearwater dentist')
    || website.includes('clearwaterdentist.com')
    || address.includes('mcmullen booth')
    || (placeId && placeId === targetPlace);
}

async function searchGoogleLocations(accessToken) {
  const addr = SITE.address || {};
  const payload = await gbpPost(
    'https://mybusinessbusinessinformation.googleapis.com/v1/googleLocations:search',
    accessToken,
    {
      location: {
        languageCode: 'en',
        title: SITE.name || 'Clearwater Dentist',
        storefrontAddress: {
          regionCode: addr.country || 'US',
          locality: addr.city || 'Clearwater',
          administrativeArea: addr.state || 'FL',
          postalCode: addr.zip || '33759',
          addressLines: [addr.street || '1700 N McMullen Booth Rd, Ste A1']
        }
      }
    }
  );
  const matches = (payload.googleLocations || []).filter(entry => {
    const title = String(entry.location?.title || '').toLowerCase();
    const website = String(entry.location?.websiteUri || '').toLowerCase();
    return title.includes('clearwater dentist') || website.includes('clearwaterdentist.com');
  });
  return matches[0] || payload.googleLocations?.[0] || null;
}

async function writeEnv(accountName, locationName) {
  const lines = [
    '# Auto-discovered by npm run discover:gbp',
    `CLEARWATER_GBP_ACCOUNT_NAME=${accountName}`,
    `CLEARWATER_GBP_LOCATION_NAME=${locationName}`,
    `CLEARWATER_GBP_LOCATION_TITLE=${SITE.name || 'Clearwater Dentist'}`,
    ''
  ];
  await fs.writeFile(ENV_OUT, lines.join('\n'), 'utf8');
}

async function main() {
  loadDefaultEnv();
  const accessToken = await gbpAccessToken();
  console.log('GBP OAuth access token refreshed.');

  const existingAccount = process.env.CLEARWATER_GBP_ACCOUNT_NAME || process.env.GBP_ACCOUNT_NAME;
  const existingLocation = process.env.CLEARWATER_GBP_LOCATION_NAME || process.env.GBP_LOCATION_NAME;
  if (existingAccount && existingLocation) {
    console.log(`Direct IDs already configured: ${existingAccount} / ${existingLocation}`);
    return;
  }

  const accounts = collectAccountCandidates();
  console.log(`Scanning ${accounts.length} known GBP account(s) for "${SITE.name}"...`);

  for (const accountName of accounts) {
    try {
      const locations = await listLocationsForAccount(accountName, accessToken);
      console.log(`  ${accountName}: ${locations.length} location(s)`);
      const hit = locations.find(matchesClearwater);
      if (hit) {
        await writeEnv(accountName, hit.name);
        console.log(`Found Clearwater Dentist at ${hit.name} under ${accountName}`);
        console.log(`Wrote ${ENV_OUT}`);
        return;
      }
    } catch (error) {
      console.warn(`  ${accountName}: ${error.message}`);
    }
  }

  console.log('Account scan missed. Trying googleLocations:search...');
  const searchHit = await searchGoogleLocations(accessToken);
  if (searchHit?.location?.name) {
    const locationName = searchHit.location.name;
    const accountName = searchHit.account ? searchHit.account : existingAccount;
    if (!accountName) {
      throw new Error(`Found location ${locationName} but no account name. Add CLEARWATER_GBP_ACCOUNT_NAME manually.`);
    }
    await writeEnv(accountName, locationName);
    console.log(`Search matched ${locationName} under ${accountName}`);
    console.log(`Wrote ${ENV_OUT}`);
    return;
  }

  throw new Error(
    'Could not resolve Clearwater Dentist GBP IDs. Open Google Business Profile for the listing, or add CLEARWATER_GBP_ACCOUNT_NAME and CLEARWATER_GBP_LOCATION_NAME to .env.google.local manually.'
  );
}

await main();
