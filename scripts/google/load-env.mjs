import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const GOOGLE_DIR = path.dirname(fileURLToPath(import.meta.url));

export function loadEnvFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return;
  for (const rawLine of fs.readFileSync(filePath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const idx = line.indexOf('=');
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

export function loadDefaultEnv() {
  const secrets = process.env.KL_ACCOUNTS_ENV_PATH || 'C:/Users/nknig/.copilot-secrets/accounts.env';
  loadEnvFile(secrets);
  loadEnvFile(path.join(GOOGLE_DIR, '../../.env.google.local'));
}
