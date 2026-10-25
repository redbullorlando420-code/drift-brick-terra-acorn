import { createQwenEngine } from './qwen-engine.mjs';
import { existsSync, openSync, closeSync } from 'node:fs';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';

/** Stop reading at the byte budget, including chunked responses with no length. */
export async function readEngineJson(response, maxBytes = 20_000_000) {
  const tooLarge = () => Object.assign(new Error('The local API response exceeded its size budget.'), { connectionIssue: 'engine' });
  if (Number(response.headers?.get('content-length')) > maxBytes) {
    await response.body?.cancel().catch(() => {});
    throw tooLarge();
  }
  let text;
  if (response.body?.getReader) {
    const reader = response.body.getReader(), decoder = new TextDecoder(), parts = [];
    let bytes = 0;
    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > maxBytes) { await reader.cancel(); throw tooLarge(); }
        parts.push(decoder.decode(value, { stream: true }));
      }
      parts.push(decoder.decode()); text = parts.join('');
    } finally { reader.releaseLock(); }
  } else {
    text = await response.text();
    if (Buffer.byteLength(text, 'utf8') > maxBytes) throw tooLarge();
  }
  try { return JSON.parse(text); } catch { throw Object.assign(new Error('AUTOMATIC1111 returned an unreadable API response. Check the engine in its WebUI.'), { connectionIssue: 'engine' }); }
}

export function generationPayload(body) {
  if (typeof body?.prompt !== 'string' || !body.prompt.trim() || body.prompt.length > 4000) throw new Error('Enter a prompt of up to 4,000 characters.');
  if (body.negativePrompt !== undefined && (typeof body.negativePrompt !== 'string' || body.negativePrompt.length > 4000)) throw new Error('Negative prompt must contain at most 4,000 characters.');
  const integer = (value, min, max, fallback) => value === undefined ? fallback : Number.isInteger(value) && value >= min && value <= max ? value : (() => { throw new Error('Generation settings are outside the allowed limits.'); })();
  const width = integer(body.width, 256, 768, 512), height = integer(body.height, 256, 768, 512);
  if (width % 64 || height % 64) throw new Error('Image dimensions must be multiples of 64 between 256 and 768.');
  return { prompt: body.prompt.trim(), negative_prompt: body.negativePrompt ?? '', steps: integer(body.steps, 1, 40, 20), width, height, seed: integer(body.seed, -1, 2147483647, -1), cfg_scale: 7, batch_size: 1, n_iter: 1, send_images: true, save_images: false };
}
export function remotePeer(value) {
  if (typeof value !== 'string' || !/^\d{9,12}$/.test(value)) throw new Error('Enter a RustDesk ID containing 9–12 digits. URLs, passwords and command arguments are not accepted.');
  return value;
}
export function createCreativeTools({ dir, spawnProcess = spawn, fetchLocal = fetch, now = Date.now, models }) {
  const rustdesk = process.env.RUSTDESK_PATH || join(dir, 'tools', process.platform === 'win32' ? 'rustdesk.exe' : 'rustdesk');
  let armed = null, child = null, lastLaunch = 0, generation = false, engine = null;
  const source = join(dir,'tools','stable-diffusion-webui'), python = join(source,'venv','Scripts','python.exe');
  const canStart = () => existsSync(join(dir,'tools','stable-diffusion-ready.json')) && existsSync(python) && existsSync(join(source,'venv','Lib','site-packages','torch')) && (existsSync(join(source,'models','Stable-diffusion','v1-5-pruned-emaonly-fp16.safetensors')) || existsSync(join(source,'models','Stable-diffusion','v1-5-pruned-emaonly.safetensors')));
  const audit = [];
  const record = event => { audit.unshift({ event, at: now() }); audit.splice(20); };
  const sd = async (path, body, timeout = 3000) => {
    const response = await fetchLocal(`http://127.0.0.1:7860/sdapi/v1/${path}`, { method: body ? 'POST' : 'GET', headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...(process.env.REELCASE_SD_API_AUTH ? { Authorization: `Basic ${Buffer.from(process.env.REELCASE_SD_API_AUTH).toString('base64')}` } : {}) }, body: body ? JSON.stringify(body) : undefined, redirect: 'error', signal: AbortSignal.timeout(timeout) });
    if (!response.ok) throw Object.assign(new Error(`AUTOMATIC1111 returned HTTP ${response.status}. Check its local API and authentication.`), { connectionIssue: response.status === 401 || response.status === 403 ? 'authentication' : 'engine' });
    return readEngineJson(response, path === 'txt2img' ? 20_000_000 : 512_000);
  };
  const qwen = models ? createQwenEngine({ dir, models, validate:generationPayload, spawnProcess, fetchLocal }) : null;
  const handle = async function handle(path, method, body = {}, origin = '') {
    if (path.startsWith('/studio/models')) return models?.action(path, method, body) ?? null;
    if (qwen && path.startsWith('/studio/qwen/')) {
      if (path === '/studio/qwen/start' && method === 'POST') {
        if (generation) throw Error('Wait for the current image generation.');
        let connected = false; try { await sd('sd-models'); connected = true; } catch {}
        if (connected || engine) throw Error('Stop AUTOMATIC1111 before starting Qwen to preserve GPU memory.');
      }
      if (path === '/studio/qwen/generate' && method === 'POST') {
        if (generation) throw Error('A generation is already running.'); generation = true;
        try { return await qwen(path, method, body); } finally { generation = false; }
      }
      return qwen(path, method, body);
    }
    if (path === '/studio/status' && method === 'GET') {
      try { const models = await sd('sd-models'); return { ok: true, connected: true, ready: Array.isArray(models) && models.length > 0, models: Array.isArray(models) ? models.slice(0, 50).map(row => String(row.title ?? row.model_name)) : [], busy: generation, canStart: canStart(), ownedEngine: Boolean(engine) }; }
      catch (cause) { return { ok: true, connected: false, ready: false, models: [], canStart: canStart(), ownedEngine: Boolean(engine), ...(cause.connectionIssue ? { connectionIssue: cause.connectionIssue } : {}), note: cause.connectionIssue ? cause.message : engine ? 'Local engine is starting. Check status again shortly.' : 'Start AUTOMATIC1111 locally with --api, on 127.0.0.1:7860, and load a checkpoint.' }; }
    }
    if (path === '/studio/refresh' && method === 'POST') { await sd('refresh-checkpoints', {}); return {ok:true}; }
    if (path === '/studio/start' && method === 'POST') {
      if (qwen && (await qwen('/studio/qwen/status', 'GET')).connected) throw Error('Stop the Qwen engine before starting AUTOMATIC1111 to preserve GPU memory.');
      if (!canStart()) throw new Error('Finish Install-Stable-Diffusion.cmd before starting the engine.');
      if (engine) return { ok: true, note: 'Local engine is already starting or running.' };
      try { await sd('sd-models'); return { ok: true, note: 'A local engine is already running; no second process was started.' }; } catch (cause) { if (cause.connectionIssue) throw cause; /* Start only when the API is unreachable. */ }
      const log = openSync(join(dir,'tools','stable-diffusion-engine.log'),'a');
      try {
        const started = spawnProcess(python, ['launch.py','--api','--server-name','127.0.0.1','--port','7860','--disable-extra-extensions'], { cwd: source, shell: false, windowsHide: true, stdio: ['ignore',log,log], env: {...process.env, HF_HOME:join(dir,'tools','hf-cache'), TORCH_HOME:join(dir,'tools','torch-cache'), PIP_CACHE_DIR:join(dir,'tools','pip-cache'), PYTHONUNBUFFERED:'1', GRADIO_ANALYTICS_ENABLED:'False', HF_HUB_DISABLE_TELEMETRY:'1', GIT_TERMINAL_PROMPT:'0'} });
        engine = started;
        const release = () => { if (engine === started) engine = null; };
        started.once('error',release); started.once('exit',release);
      } finally { closeSync(log); }
      return {ok:true,note:'Starting the local engine. The first start installs WebUI dependencies and loads the checkpoint. Check status again shortly.'};
    }
    if (path === '/studio/stop' && method === 'POST') {
      if (generation) throw Error('Interrupt generation and wait for it to finish before stopping.');
      if (!engine) return {ok:true,note:'No engine owned by Companion is running. Stop any externally started engine in its own window.'};
      const owned = engine;
      if (process.platform === 'win32' && Number.isInteger(owned.pid)) spawnProcess('taskkill.exe',['/PID',String(owned.pid),'/T','/F'],{shell:false,windowsHide:true,stdio:'ignore'}).once('error',()=>{});
      else owned.kill();
      return {ok:true,note:'Stop requested for the engine process tree started by Companion.'};
    }
    if (path === '/studio/generate' && method === 'POST') {
      const payload = generationPayload(body);
      if (generation) throw new Error('A generation is already running. Wait for it or interrupt it.');
      generation = true;
      try { if (body.model) { const models = await sd('sd-models'); if (!models.some(row => row.title === body.model)) throw Error('Choose an available checkpoint.'); payload.override_settings = { sd_model_checkpoint: body.model }; payload.override_settings_restore_afterwards = true; }
        const result = await sd('txt2img', payload, 10 * 60_000); const image = result.images?.[0];
        if (typeof image !== 'string' || !/^[A-Za-z0-9+/=\r\n]+$/.test(image) || !image.startsWith('iVBORw0KGgo')) throw new Error('The local API did not return a PNG image.');
        return { ok: true, image, info: String(result.info ?? '').slice(0, 8000) };
      } finally { generation = false; }
    }
    if (path === '/studio/interrupt' && method === 'POST') { if (!generation) return { ok: true }; await sd('interrupt', {}, 5000); return { ok: true }; }
    if (path === '/remote/status' && method === 'GET') return { ok: true, installed: existsSync(rustdesk), armed: Boolean(armed && armed.expires > now()), launcherRunning: Boolean(child), audit, mode: 'native-outbound' };
    if (path === '/remote/arm' && method === 'POST') {
      const peer = remotePeer(body.peer);
      if (!existsSync(rustdesk)) throw new Error('RustDesk is not installed. Run Setup-Creative-Tools.cmd in the Companion folder.');
      if (child) throw new Error('A launcher is already active. Lock launch controls before preparing another request.');
      armed = { peer, origin, token: randomBytes(24).toString('hex'), expires: now() + 30_000 }; record('One-use connection approval prepared');
      return { ok: true, token: armed.token, expires: armed.expires };
    }
    if (path === '/remote/connect' && method === 'POST') {
      const peer = remotePeer(body.peer), approval = armed; armed = null;
      if (!approval || approval.origin !== origin || approval.peer !== peer || approval.token !== body.token || approval.expires <= now() || body.confirmation !== `CONNECT ${peer}`) throw new Error('Approval expired or did not match. Prepare a new connection and type its confirmation.');
      if (child || now() - lastLaunch < 5000) throw new Error('A launcher is already active. Close it before trying again.');
      const launched = spawnProcess(rustdesk, ['--connect', peer, '--no-server'], { shell: false, windowsHide: true, stdio: 'ignore' });
      child = launched; lastLaunch = now(); record('User requested a native connection');
      launched.once('error', () => { record('Native launcher failed'); if (child === launched) child = null; });
      launched.once('exit', () => { record('Native launcher exited; this does not prove a session ended'); if (child === launched) child = null; });
      return { ok: true, note: 'RustDesk was launched. Complete authentication and permissions in its native window. This website cannot verify the remote session or its permissions.' };
    }
    if (path === '/remote/revoke' && method === 'POST') {
      if (armed && armed.origin === origin && armed.token === body.token) { armed = null; record('One-use connection approval cancelled'); }
      return { ok: true };
    }
    if (path === '/remote/lock' && method === 'POST') {
      armed = null;
      if (child) { child.kill(); child = null; }
      record('Web launch controls locked');
      return { ok: true, note: 'New launches are locked and the tracked launcher was stopped. End any handed-off session in RustDesk; the website cannot guarantee that a native session disconnected.' };
    }
    return null;
  };
  handle.shutdown = async () => {
    if(engine){const owned=engine;if(process.platform==='win32')spawnProcess('taskkill.exe',['/PID',String(owned.pid),'/T','/F'],{shell:false,windowsHide:true,stdio:'ignore'}).once('error',()=>{});else owned.kill();}
    await qwen?.shutdown();
  };
  return handle;
}

