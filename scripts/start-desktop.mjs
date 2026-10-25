import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { open, readFile, unlink, mkdir } from 'node:fs/promises';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
export async function readiness(url, service, fetcher = fetch) {
 try {
  const response = await fetcher(new URL(service === 'Companion' ? '/health' : '/', url), { headers: { Origin: 'http://127.0.0.1:8080' }, signal: AbortSignal.timeout(1500), redirect: 'error' });
  const text = await response.text();
  if (!response.ok) return 'Foreign';
  if (service === 'Companion') { try { return JSON.parse(text).service === 'reelcase-companion' ? 'Ready' : 'Foreign'; } catch { return 'Foreign'; } }
  return /<title[^>]*>[^<]*(Realhub|Reelcase)/i.test(text) ? 'Ready' : 'Foreign';
 } catch (error) { return error?.cause?.code === 'ECONNREFUSED' ? 'Stopped' : 'Waiting'; }
}
export async function startServices({ probe, start, wait = () => new Promise(r => setTimeout(r, 500)), timeout = 120000, now = Date.now }) {
 const deadline = now() + timeout;
 for (const service of ['Server', 'Companion']) { const state = await probe(service); if (state === 'Foreign') throw new Error(service + ' port belongs to another application. No process was stopped.'); if (state === 'Stopped') start(service); }
 while (now() < deadline) { const states = await Promise.all(['Server', 'Companion'].map(probe)); if (states.includes('Foreign')) throw new Error('Another application is using a required port. No process was stopped.'); if (states.every(s => s === 'Ready')) return; await wait(); }
 throw new Error('Startup timed out. Check this console for the server and Companion errors.');
}
export async function launch({ browser = true } = {}) {
 const root = resolve(dirname(fileURLToPath(import.meta.url)), '..'), app = 'http://127.0.0.1:8080/', children = [];
 await mkdir(join(root, '.grok'), { recursive: true }); const lock = join(root, '.grok', 'desktop-start.lock'); let handle;
 try { handle = await open(lock, 'wx'); } catch {
  let alive = false; try { const pid = Number(await readFile(lock, 'utf8')); if (pid > 0) { process.kill(pid, 0); alive = true; } } catch {}
  if (alive) { console.log('Realhub launcher is already open.'); if (browser) spawn('explorer.exe', [app], { shell: false, stdio: 'ignore' }).on('error', console.error); return; }
  await unlink(lock).catch(() => {}); handle = await open(lock, 'wx');
 }
 await handle.writeFile(String(process.pid)); const cleanup = async () => { await handle.close().catch(() => {}); await unlink(lock).catch(() => {}); };
 console.log('Realhub — local server and Companion. Leave this window open. Ctrl+C stops services started here.');
 const stop = () => { for (const child of children) if (child.exitCode === null && child.pid) { if (process.platform === 'win32') spawn('taskkill.exe', ['/PID', String(child.pid), '/T', '/F'], { shell: false, stdio: 'ignore' }).on('error', console.error); else child.kill(); } void cleanup().finally(() => process.exit()); };
 process.once('SIGINT', stop); process.once('SIGTERM', stop);
 try {
  await startServices({ probe: service => readiness(service === 'Server' ? app : 'http://127.0.0.1:43123/', service), start: service => {
   const npm = join(dirname(process.execPath), 'node_modules', 'npm', 'bin', 'npm-cli.js'); if (service === 'Server' && !existsSync(npm)) throw new Error('Node.js npm CLI is missing. Repair Node.js.');
   const child = spawn(process.execPath, service === 'Server' ? [npm, 'run', 'dev'] : ['companion/reelcase-companion.mjs'], { cwd: root, shell: false, stdio: 'inherit' }); child.on('error', console.error); children.push(child);
  } });
  console.log('Realhub is ready. Existing services were reused.'); if (browser) spawn('explorer.exe', [app], { shell: false, stdio: 'ignore' }).on('error', console.error); await cleanup();
 } catch (error) { console.error(error.message); await cleanup(); process.exitCode = 1; }
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await launch({ browser: !process.argv.includes('--no-browser') });
