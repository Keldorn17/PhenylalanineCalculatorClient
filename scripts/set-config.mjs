import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, '../public/config.json');

const currentConfig = existsSync(configPath)
  ? JSON.parse(readFileSync(configPath, 'utf-8'))
  : { apiHost: 'http://localhost:8080', apiPrefix: '/api/v1' };

const envApiHost = process.env.API_HOST?.trim();
const envApiPrefix = process.env.API_PREFIX?.trim();

if (envApiHost === undefined && envApiPrefix === undefined) {
  console.log(
    `[config] No API_HOST or API_PREFIX env vars set. Keeping existing public/config.json (${currentConfig.apiHost}${currentConfig.apiPrefix}).`,
  );
  process.exit(0);
}

const rawHost = envApiHost ?? currentConfig.apiHost;
const rawPrefix = envApiPrefix ?? currentConfig.apiPrefix;

const apiHost = rawHost.replace(/\/+$/, '');
const normalizedPrefix = rawPrefix.replace(/\/+$/, '');
const apiPrefix =
  normalizedPrefix && !normalizedPrefix.startsWith('/') ? `/${normalizedPrefix}` : normalizedPrefix;

const updatedConfig = {
  ...currentConfig,
  apiHost,
  apiPrefix,
};

writeFileSync(configPath, `${JSON.stringify(updatedConfig, null, 2)}\n`, 'utf-8');
console.log(`[config] Updated public/config.json -> ${apiHost}${apiPrefix}`);
