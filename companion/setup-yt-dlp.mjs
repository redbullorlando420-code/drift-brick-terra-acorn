/** Official, checksum-verified yt-dlp installation; never reads browser data. */
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync, renameSync, chmodSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
const here = fileURLToPath(new URL('.', import.meta.url));
const get = async url => {
  const response = await fetch(url, { headers: { 'User-Agent': 'Realhub-yt-dlp-setup' }, signal: AbortSignal.timeout(120000) });
  if (!response.ok) throw new Error('Official yt-dlp request failed (' + response.status + ').');
  return response;
};
const release = await (await get('https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest')).json();
const filename = process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp';
const asset = release.assets?.find(row => row.name === filename), sums = release.assets?.find(row => row.name === 'SHA2-256SUMS');
if (!asset || !sums) throw new Error('Official yt-dlp binary/checksum missing.');
for (const item of [asset, sums]) if (!item.browser_download_url.startsWith('https://github.com/yt-dlp/yt-dlp/releases/download/')) throw new Error('Unexpected yt-dlp asset host.');
const checksums = await (await get(sums.browser_download_url)).text();
const expected = checksums.split(/\r?\n/).find(line => line.trim().endsWith(' ' + filename))?.trim().split(/\s+/)[0];
const bytes = Buffer.from(await (await get(asset.browser_download_url)).arrayBuffer());
if (!expected || createHash('sha256').update(bytes).digest('hex') !== expected) throw new Error('yt-dlp checksum verification failed.');
const tools = join(here, 'tools'); mkdirSync(tools, { recursive: true });
const binary = join(tools, filename), temp = binary + '.download';
writeFileSync(temp, bytes); chmodSync(temp, 0o755); renameSync(temp, binary);
const version = execFileSync(binary, ['--ignore-config', '--version'], { encoding: 'utf8', windowsHide: true, timeout: 15000 }).trim();
const config = join(here, '.local-youtube-dl.json');
let previous = {}; try { previous = JSON.parse(readFileSync(config, 'utf8')); } catch { /* First setup. */ }
const downloadRoot = previous.downloadRoot || fileURLToPath(new URL('../downloads/YouTube/', import.meta.url));
mkdirSync(downloadRoot, { recursive: true });
writeFileSync(config, JSON.stringify({ ...previous, downloadRoot, ytDlpVersion: version, ytDlpRelease: release.html_url }, null, 2));
console.log(JSON.stringify({ ok: true, engine: 'yt-dlp', version, binary, downloadRoot, sha256: expected }));
