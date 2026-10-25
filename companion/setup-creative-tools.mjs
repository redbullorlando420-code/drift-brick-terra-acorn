import { mkdirSync, writeFileSync, existsSync, renameSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const here = fileURLToPath(new URL('.', import.meta.url)), tools = join(here, 'tools'); mkdirSync(tools, { recursive: true });
const get = async url => { const r = await fetch(url, { headers: { 'User-Agent': 'Realhub-local-tools' }, signal: AbortSignal.timeout(120000) }); if (!r.ok) throw Error(`Official download failed: HTTP ${r.status}`); return r; };
if (process.platform === 'win32') {
  const release = await (await get('https://api.github.com/repos/rustdesk/rustdesk/releases/latest')).json();
  const asset = release.assets.find(row => /-x86_64\.exe$/.test(row.name));
  if (!asset?.digest?.startsWith('sha256:') || !asset.browser_download_url.startsWith('https://github.com/rustdesk/rustdesk/releases/download/')) throw Error('Official RustDesk release checksum unavailable.');
  const bytes = Buffer.from(await (await get(asset.browser_download_url)).arrayBuffer());
  if (`sha256:${createHash('sha256').update(bytes).digest('hex')}` !== asset.digest) throw Error('RustDesk checksum mismatch.');
  const temporary = join(tools, 'rustdesk.download'); writeFileSync(temporary, bytes); renameSync(temporary, join(tools, 'rustdesk.exe'));
  console.log(`RustDesk ${release.tag_name} portable client verified. No service, password, or remote connection was started.`);
}
const source = join(tools, 'stable-diffusion-webui');
if (!existsSync(source)) execFileSync('git', ['clone', '--depth', '1', 'https://github.com/AUTOMATIC1111/stable-diffusion-webui.git', source], { windowsHide: true, stdio: 'inherit', timeout: 120000 });
console.log('AUTOMATIC1111 source prepared. Its Python runtime, GPU dependencies and a checkpoint are still required; no model was downloaded.');
