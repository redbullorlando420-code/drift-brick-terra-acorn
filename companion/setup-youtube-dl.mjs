/** Operator-run installer. Only official youtube-dl release assets are executed. */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, renameSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

const here = fileURLToPath(new URL('.', import.meta.url));
const releaseUrl = 'https://api.github.com/repos/ytdl-org/ytdl-nightly/releases/latest';
const get = async url => {
  const response = await fetch(url, { headers: { 'User-Agent': 'Realhub-youtube-dl-setup' }, signal: AbortSignal.timeout(120_000) });
  if (!response.ok) throw new Error(`Official release request failed (${response.status}).`);
  return response;
};
const release = await (await get(releaseUrl)).json();
const filename = process.platform === 'win32' ? 'youtube-dl.exe' : 'youtube-dl';
const asset = release.assets?.find(row => row.name === filename), sums = release.assets?.find(row => row.name === 'SHA2-256SUMS');
if (!asset || !sums) throw new Error('The official release is missing the binary or checksum.');
for (const item of [asset, sums]) if (!item.browser_download_url.startsWith('https://github.com/ytdl-org/ytdl-nightly/releases/download/')) throw new Error('Unexpected release asset host.');
const checksums = await (await get(sums.browser_download_url)).text();
const expected = checksums.split(/\r?\n/).find(line => line.trim().endsWith(` ${filename}`))?.trim().split(/\s+/)[0];
const bytes = Buffer.from(await (await get(asset.browser_download_url)).arrayBuffer());
if (!expected || createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('youtube-dl checksum verification failed.');
const tools = join(here, 'tools'); mkdirSync(tools, { recursive: true });
const binary = join(tools, filename), temp = `${binary}.download`;
writeFileSync(temp, bytes); chmodSync(temp, 0o755); renameSync(temp, binary);
const version = execFileSync(binary, ['--ignore-config', '--version'], { encoding: 'utf8', windowsHide: true, timeout: 15000 }).trim();
let previous = {};
try { previous = JSON.parse(readFileSync(join(here, '.local-youtube-dl.json'), 'utf8')); } catch { /* New setup. */ }
const downloadRoot = typeof previous.downloadRoot === 'string' && previous.downloadRoot ? previous.downloadRoot : fileURLToPath(new URL('../downloads/YouTube/', import.meta.url));
mkdirSync(downloadRoot, { recursive: true });
writeFileSync(join(here, '.local-youtube-dl.json'), JSON.stringify({ downloadRoot, version, release: release.html_url }, null, 2));
console.log(JSON.stringify({ ok: true, engine: 'youtube-dl', version, binary, downloadRoot, sha256: expected }, null, 2));
