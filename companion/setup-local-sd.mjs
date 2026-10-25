/** Fresh, project-local NVIDIA setup. Does not modify the system Python/PATH. */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { unzipSync } from 'fflate';
import { verifiedDownload } from './verified-download.mjs';
if (process.platform !== 'win32') throw Error('This installer targets this Windows/NVIDIA workstation.');
const here = fileURLToPath(new URL('.', import.meta.url)), tools = join(here, 'tools'), source = join(tools, 'stable-diffusion-webui');
const get = async url => { const r = await fetch(url, { headers: { 'User-Agent': 'Realhub-local-SD-setup' }, signal: AbortSignal.timeout(30*60_000) }); if (!r.ok) throw Error(`Download returned HTTP ${r.status}: ${new URL(url).hostname}`); return r; };
mkdirSync(tools, { recursive: true });
const uv = join(tools, 'uv.exe');
if (!existsSync(uv)) {
  const release = await (await get('https://api.github.com/repos/astral-sh/uv/releases/latest')).json();
  const asset = release.assets.find(row => row.name === 'uv-x86_64-pc-windows-msvc.zip');
  if (!asset?.digest?.startsWith('sha256:') || !asset.browser_download_url.startsWith('https://github.com/astral-sh/uv/releases/download/')) throw Error('Official uv checksum unavailable.');
  const bytes = Buffer.from(await (await get(asset.browser_download_url)).arrayBuffer());
  if (`sha256:${createHash('sha256').update(bytes).digest('hex')}` !== asset.digest) throw Error('uv checksum mismatch.');
  const entries = unzipSync(bytes), key = Object.keys(entries).find(key => /(?:^|\/)uv\.exe$/.test(key));
  if (!key) throw Error('uv executable missing from verified archive.');
  writeFileSync(uv, entries[key]);
}
const env = { ...process.env, UV_PYTHON_INSTALL_DIR: join(tools,'python'), UV_CACHE_DIR: join(tools,'uv-cache'), PIP_CACHE_DIR: join(tools,'pip-cache') };
const run = (binary, args, cwd = source) => execFileSync(binary, args, { cwd, env, windowsHide: true, stdio: 'inherit', timeout: 30*60_000 });
if (!existsSync(source)) run('git', ['clone','--depth','1','--branch','dev','https://github.com/AUTOMATIC1111/stable-diffusion-webui.git', source], here);
else {
  run('git', ['fetch','--depth','1','origin','dev']);
  run('git', ['checkout','--detach','FETCH_HEAD']);
}
const pythonBase = join(tools, 'python310');
if (!existsSync(join(pythonBase, 'python.exe'))) {
  // Direct extraction avoids uv's directory rename on locked-down Windows volumes.
  const available = JSON.parse(execFileSync(uv, ['python','list','3.10','--only-downloads','--show-urls','--output-format','json'], {encoding:'utf8',windowsHide:true}));
  const item = available.find(row => row.implementation === 'cpython' && row.arch === 'x86_64' && row.os === 'windows');
  const file = decodeURIComponent(new URL(item.url).pathname.split('/').pop());
  const tag = new URL(item.url).pathname.split('/').at(-2);
  const release = await (await get(`https://api.github.com/repos/astral-sh/python-build-standalone/releases/tags/${tag}`)).json();
  const asset = release.assets?.find(row => row.name === file);
  if (!asset?.digest?.startsWith('sha256:')) throw Error('Official Python archive checksum unavailable.');
  const bytes = Buffer.from(await (await get(asset.browser_download_url)).arrayBuffer());
  if (`sha256:${createHash('sha256').update(bytes).digest('hex')}` !== asset.digest) throw Error('Python checksum mismatch.');
  const archive = join(tools,'python310.tar.gz'); writeFileSync(archive,bytes); mkdirSync(pythonBase,{recursive:true});
  run('tar.exe',['-xf',archive,'-C',pythonBase,'--strip-components','1'],here);
}
const venv = join(source,'venv');
if (!existsSync(join(venv,'Scripts','python.exe'))) run(join(pythonBase,'python.exe'), ['-m','venv',venv]);
const python = join(venv,'Scripts','python.exe');
run(python, ['-m','pip','install','--upgrade','pip']);
const wheels = join(tools, 'wheels'); mkdirSync(wheels, { recursive: true });
const wheel = join(wheels, 'torch-2.7.1+cu128-cp310-cp310-win_amd64.whl');
const wheelUrl = 'https://download.pytorch.org/whl/cu128/torch-2.7.1%2Bcu128-cp310-cp310-win_amd64.whl';
const probe = await fetch(wheelUrl, { headers: { Range: 'bytes=0-0' }, signal: AbortSignal.timeout(15000) });
const wheelSize = Number(probe.headers.get('content-range')?.split('/')[1]); await probe.body?.cancel();
if (!Number.isFinite(wheelSize) || wheelSize < 1e9 || wheelSize > 5e9) throw Error('Unexpected official PyTorch wheel size.');
await Promise.all([
  verifiedDownload(wheelUrl, wheel, wheelSize, '5174f02de8ca14df87c8e333c4c39cf3ce93a323c9d470d690301d110a053b3c', 'CUDA PyTorch'),
  prepareModel(),
]);
run(python, ['-m','pip','install',wheel,'torchvision==0.22.1+cu128','--extra-index-url','https://download.pytorch.org/whl/cu128']);
run(python, ['-c', 'import torch; print("CUDA:", torch.cuda.is_available(), "PyTorch:", torch.__version__); assert torch.cuda.is_available(); print(torch.cuda.get_device_name()); print(torch.randn(8,device="cuda").sum().item())']);
async function prepareModel() {
const models = join(source,'models','Stable-diffusion'); mkdirSync(models, {recursive:true});
for (const name of ['README.md']) {
  const response = await fetch(`https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5/raw/main/${name}`);
  if (response.ok) writeFileSync(join(models, `SD15-${name}`), await response.text());
}
const checkpoint = join(models,'v1-5-pruned-emaonly.safetensors');
if (!existsSync(checkpoint)) {
  await verifiedDownload('https://huggingface.co/Comfy-Org/stable-diffusion-v1-5-archive/resolve/main/v1-5-pruned-emaonly-fp16.safetensors?download=true', join(models,'v1-5-pruned-emaonly-fp16.safetensors'), 2132696762, 'e9476a13728cd75d8279f6ec8bad753a66a1957ca375a1464dc63b37db6e3916', 'SD 1.5 FP16 checkpoint');
}
}
writeFileSync(join(tools,'stable-diffusion-ready.json'), JSON.stringify({installedAt:new Date().toISOString(),python:'3.10',torch:'2.7.1+cu128',model:'SD 1.5',source:execFileSync('git',['rev-parse','HEAD'],{cwd:source,encoding:'utf8',windowsHide:true}).trim()},null,2));
console.log('Python, CUDA PyTorch and SD 1.5 checkpoint ready. Start-Stable-Diffusion.cmd installs remaining WebUI dependencies and starts only on loopback.');
