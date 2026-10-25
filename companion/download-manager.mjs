import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, realpathSync, statSync } from 'node:fs';
import { join, sep, basename, extname } from 'node:path';

const BROWSERS = new Set(['chrome', 'edge', 'firefox']);
export function youtubeBrowserAuth(body) {
  if (body.useBrowserSession !== undefined && typeof body.useBrowserSession !== 'boolean') throw new Error('Browser sign-in must be explicitly enabled.');
  if (!body.useBrowserSession) {
    if (body.browser && body.browser !== 'none') throw new Error('Enable browser sign-in before choosing a browser.');
    return 'none';
  }
  if (!BROWSERS.has(body.browser)) throw new Error('Choose Chrome, Edge or Firefox. Browser paths and custom flags are not accepted.');
  return body.browser;
}
export function downloadMessage(value) {
  const text = String(value).replace(/\x1b\[[0-9;]*m/g, '');
  if (/\b(?:cookie|authorization|set-cookie)\s*:/i.test(text)) return 'Authentication information omitted from downloader output.';
  return text.replace(/([?&](?:token|signature|sig|key|auth|session)[^=\s]*=)[^&\s]+/ig, '$1[redacted]').slice(0, 700);
}

export function youtubeWatchUrl(id) {
  if (typeof id !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(id)) throw new Error('A valid YouTube video ID is required.');
  return `https://www.youtube.com/watch?v=${id}`;
}

/** One process at a time. Completion comes from process exit AND a completed file. */
export function createDownloadManager({ root, approveRoot, spawnProcess = spawn, onSettled = () => {} }) {
  const jobs = [], pending = [];
  let active = null;
  const manifest = root ? join(root, '.realhub-downloads.json') : null;
  if (manifest) {
    try {
      const saved = JSON.parse(readFileSync(manifest, 'utf8'));
      for (const job of Array.isArray(saved) ? saved.slice(0, 40) : []) {
        if (!job || typeof job.id !== 'string' || typeof job.key !== 'string') continue;
        jobs.push({ ...job, ...(['queued', 'running'].includes(job.status) ? { status: 'error', detail: 'Companion stopped before this download finished. Retry to resume.' } : {}) });
      }
    } catch { /* First use, or an unreadable local history. */ }
  }
  const save = () => {
    if (!manifest || !approveRoot(root)) return;
    try { writeFileSync(manifest, JSON.stringify(jobs.slice(0, 40))); } catch { /* Downloads still work if history cannot be written. */ }
  };
  const settle = (job, status, detail) => {
    if (!['queued', 'running'].includes(job.status)) return;
    Object.assign(job, { status, detail, updatedAt: Date.now() });
    save(); onSettled({ ...job });
  };
  const pump = () => {
    if (active || !pending.length) return;
    const next = pending.shift(), { job, binary } = next;
    if (job.status !== 'queued') { pump(); return; }
    let child, timeout, buffer = '', lastError = '', finished = false;
    const finish = (code, error) => {
      if (finished) return;
      finished = true; clearTimeout(timeout);
      if (job.status !== 'cancelled') {
        let files = [];
        try {
          if (approveRoot(job.path)) files = readdirSync(job.path).filter(name => /\.(mp4|webm|mkv|m4a|flv|3gp|ogg|mov)$/i.test(name)).filter(name => {
            const file = realpathSync(join(job.path, name));
            return file.startsWith(`${realpathSync(job.path)}${sep}`) && statSync(file).size > 0;
          });
        } catch { /* An unavailable folder cannot be called a completed save. */ }
        if (code === 0 && files.length) {
          Object.assign(job, { progress: 100, file: files[0] });
          settle(job, 'done', 'Saved to your computer.');
        } else settle(job, 'error', downloadMessage(error || lastError || (code === 0 ? 'No video file was saved. Live, private, or unavailable videos may not be downloadable.' : `youtube downloader exited with code ${code ?? 'unknown'}.`)));
      }
      active = null; pump();
    };
    try {
      if (!approveRoot(root)) throw new Error('The approved download folder is unavailable.');
      const folder = join(root, job.source === 'youtube' ? job.key : job.id);
      mkdirSync(folder, { recursive: true });
      if (!approveRoot(folder)) throw new Error('The download folder is outside the approved roots.');
      Object.assign(job, { status: 'running', path: realpathSync(folder), detail: 'Connecting to the video provider…', updatedAt: Date.now() });
      // No shell, user config, playlists or client-supplied flags. Cookie access
      // is a literal browser enum authorized for this job; no export to disk/UI.
      child = spawnProcess(binary, ['--ignore-config', '--no-playlist', '--no-mtime', '--restrict-filenames', '--newline',
        ...(job.engine === 'yt-dlp' ? ['--js-runtimes', 'node'] : []),
        ...(job.browser && job.browser !== 'none' ? ['--cookies-from-browser', job.browser] : []),
        ...(job.source === 'youtube' ? ['--match-filter', '!is_live', '-f', 'best[ext=mp4]/best'] : []),
        '-o', join(job.path, '%(title).120s [%(id)s].%(ext)s'), '--', job.url],
      { cwd: job.path, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
      active = { job, child, finish };
      const consume = data => {
        buffer = (buffer + String(data)).slice(-8192);
        const lines = buffer.split(/[\r\n]+/); buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (/ERROR:|WARNING:/i.test(line)) lastError = downloadMessage(line.trim());
          const percent = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
          if (job.status !== 'running') continue;
          if (percent) { job.progress = Math.min(100, Math.max(0, Number(percent[1]))); job.detail = downloadMessage(line.trim()).slice(0, 300); }
          else if (/\[download\]|\[youtube\]/.test(line)) job.detail = downloadMessage(line.trim()).slice(0, 300);
        }
      };
      child.stdout?.on('data', consume); child.stderr?.on('data', consume);
      child.once('error', error => finish(null, error.message));
      child.once('close', code => { if (buffer.trim()) consume('\n'); finish(code); });
      timeout = setTimeout(() => { settle(job, 'error', 'Download timed out after two hours. Retry when the video is available.'); child.kill(); }, 2 * 60 * 60_000);
      timeout.unref?.(); save();
    } catch (error) { finish(null, error.message); }
  };
  return {
    list: () => jobs.map(job => ({ ...job })),
    enqueue({ key, url, title, binary, source = 'youtube', engine = 'youtube-dl', browser = 'none' }) {
      if (browser !== 'none' && (!BROWSERS.has(browser) || engine !== 'yt-dlp' || source !== 'youtube')) throw new Error('Browser sign-in requires the YouTube yt-dlp downloader.');
      const duplicate = jobs.find(job => job.key === key && job.source === source && ['queued', 'running'].includes(job.status));
      if (duplicate) return { ...duplicate };
      if (!root || !approveRoot(root)) throw new Error('An approved download folder is required.');
      if (pending.length >= 8) throw new Error('The download queue is full. Wait for a download to finish.');
      if (typeof key !== 'string' || !/^[\w-]{1,80}$/.test(key)) throw new Error('Invalid download key.');
      const job = { id: randomUUID(), key, source, engine, browser, url, title: String(title || key).slice(0, 250), status: 'queued', detail: 'Waiting for the current download.', progress: 0, createdAt: Date.now(), updatedAt: Date.now(), path: root };
      // Never evict a queued/running job from the bounded history.
      if (jobs.length >= 40) { const index = jobs.findLastIndex(row => !['queued', 'running'].includes(row.status)); if (index >= 0) jobs.splice(index, 1); }
      jobs.unshift(job); pending.push({ job, binary }); save(); pump(); return { ...job };
    },
    media(id) {
      const job = jobs.find(row => row.id === id && row.status === 'done' && row.source === 'youtube');
      if (!job || !/^[\w-]{11}$/.test(job.key) || !job.file || basename(job.file) !== job.file || !/\.(mp4|webm|mkv|mov|ogg|3gp)$/i.test(job.file)) return null;
      try {
        if (!approveRoot(root) || !approveRoot(job.path)) return null;
        const folder = realpathSync(join(root, job.key));
        if (realpathSync(job.path) !== folder) return null;
        const path = realpathSync(join(folder, job.file));
        if (!path.startsWith(folder + sep) || !approveRoot(path)) return null;
        const stat = statSync(path);
        if (!stat.isFile() || !stat.size) return null;
        return { path, size: stat.size, mime: ({ '.mp4': 'video/mp4', '.webm': 'video/webm', '.ogg': 'video/ogg', '.mov': 'video/quicktime', '.mkv': 'video/x-matroska', '.3gp': 'video/3gpp' })[extname(path).toLowerCase()] };
      } catch { return null; }
    },
    cancel(id) {
      const job = jobs.find(row => row.id === id);
      if (!job) throw new Error('Download not found.');
      if (['queued', 'running'].includes(job.status)) {
        settle(job, 'cancelled', 'Cancelled. Any partial file stays on your computer for a later retry.');
        if (active?.job.id === id) active.child.kill();
        const index = pending.findIndex(row => row.job.id === id); if (index >= 0) pending.splice(index, 1);
      }
      return { ...job };
    },
    shutdown() { for (const row of pending) settle(row.job, 'error', 'Companion stopped. Retry to resume.'); pending.length = 0; if (active) { settle(active.job, 'error', 'Companion stopped. Retry to resume.'); active.child.kill(); } },
  };
}
