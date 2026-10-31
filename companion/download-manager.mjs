import { createDownloadPreflight, downloadEstimate, readDownloadPreflight } from './download-preflight.mjs';
import { downloadFailure } from './download-auth.mjs';
import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdirSync, readdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, realpathSync, statSync } from 'node:fs';
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
export function createDownloadManager({ root, approveRoot, rootAuthority, authorizeSession, space, budget, now=Date.now, spawnProcess = spawn, onSettled = () => {}, writeReceipt = writeFileSync, commitReceipt = renameSync }) {
  const jobs = [], pending = [];
  const preflight=createDownloadPreflight({root,authority:rootAuthority,approveRoot,space,budget});
  let active = null, stopped = false, persistenceError = '', unsupportedManifest = false;
  const manifest = root ? join(root, '.realhub-downloads.json') : null;
  if (manifest && approveRoot(root) && (!rootAuthority || rootAuthority.check(manifest))) {
    try {
      if (statSync(manifest).size > 512 * 1024) throw Error('Oversized receipt file');
      const saved = JSON.parse(readFileSync(manifest, 'utf8'));
      if (!Array.isArray(saved) && (saved?.version !== 2 || !Array.isArray(saved.jobs))) { unsupportedManifest = true; throw Error('Unsupported receipt version'); }
      const seen = new Set();
      for (const raw of (Array.isArray(saved) ? saved : saved.jobs).slice(0, 40)) {
        if (!raw || typeof raw.id !== 'string' || !/^[\w-]{1,80}$/.test(raw.id) || seen.has(raw.id) || typeof raw.key !== 'string' || !/^[\w-]{1,80}$/.test(raw.key) || !['youtube','offline'].includes(raw.source) || !['queued','running','done','error','cancelled','interrupted','paused'].includes(raw.status)) continue;
        let url;try { url = raw.source === 'youtube' ? youtubeWatchUrl(raw.key) : checkedOfflineUrl(raw.url); } catch { continue; }
        seen.add(raw.id);
        const job = {id:raw.id,key:raw.key,source:raw.source,url,engine:raw.engine==='yt-dlp'?'yt-dlp':'youtube-dl',browser:BROWSERS.has(raw.browser)?raw.browser:'none',title:String(raw.title||raw.key).slice(0,250),status:raw.status,detail:raw.source==='youtube'&&raw.status==='error'?downloadFailure(raw.detail).message:downloadMessage(raw.detail||''),progress:Math.max(0,Math.min(100,Number(raw.progress)||0)),createdAt:Number(raw.createdAt)||Date.now(),updatedAt:Number(raw.updatedAt)||Date.now(),attempt:Math.max(1,Math.min(10000,Number(raw.attempt)||1)),path:typeof raw.path==='string'?raw.path:root,...(typeof raw.folderName==='string'&&raw.folderName===raw.id?{folderName:raw.folderName}:{}),estimatedBytes:downloadEstimate(raw.estimatedBytes),preflight:readDownloadPreflight(raw.preflight),...(typeof raw.file==='string'&&basename(raw.file)===raw.file?{file:raw.file}:{})};
        if (['queued','running'].includes(job.status)) Object.assign(job,{status:'interrupted',detail:'Companion stopped before this download finished. Resume explicitly; browser sign-in is not reused.'});
        jobs.push(job);
      }
    } catch (error) { if (error.code !== 'ENOENT') { unsupportedManifest = true; persistenceError='Saved job history is unreadable or uses an unsupported version. Preserve the receipt file and use a compatible Companion before starting new downloads.'; } }
  }
  const save = () => {
    if (unsupportedManifest) return false;
    if (!manifest || !approveRoot(root)) { persistenceError='An approved download folder is required to save job receipts.'; return false; }
    const temporary = manifest+'.'+randomUUID()+'.tmp';let access;
    try { access=rootAuthority?.lease(root);rootAuthority?.assertWrite(manifest);access?.assert(temporary,{write:true});writeReceipt(temporary, JSON.stringify({version:2,savedAt:Date.now(),jobs:jobs.slice(0,40)}),{flag:'wx'});access?.assert(temporary);rootAuthority?.assertWrite(manifest);commitReceipt(temporary,manifest);persistenceError='';return true; }
    catch { try { if(access)access.assert(temporary);unlinkSync(temporary); } catch {} persistenceError='Job receipts could not be saved. Check the destination storage, then restart Companion before starting or resuming downloads; existing files are retained.';return false; } finally{access?.release();}
  };
  const publicJob = ({url,...job}) => ({...job});
  const completedFile = job => {
    if (job.status!=='done' || !job.file || basename(job.file)!==job.file || !/\.(mp4|webm|mkv|m4a|flv|3gp|ogg|mov)$/i.test(job.file)) return false;
    try {const folder=realpathSync(join(root,job.folderName||(job.source==='youtube'?job.key:job.id)));if(!approveRoot(root)||!approveRoot(folder)||realpathSync(job.path)!==folder)return false;const file=realpathSync(join(folder,job.file));return file.startsWith(folder+sep)&&Boolean(approveRoot(file))&&statSync(file).isFile()&&statSync(file).size>0;}catch{return false;}
  };
  const settle = (job, status, detail) => {
    if (!['queued', 'running'].includes(job.status)) return;
    Object.assign(job, { status, detail, updatedAt: Date.now() });
    save(); onSettled(publicJob(job));
  };
  const watchAccess = (job,browser=job.browser) => {
    const rootLease=rootAuthority?.lease(root);let session;
    try{if(browser!=='none'&&authorizeSession)session=authorizeSession();}catch(error){rootLease?.release();throw error;}
    const signal=AbortSignal.any([rootLease?.signal,session?.signal].filter(Boolean));
    const access={signal,assert:()=>{rootLease?.assert();session?.assert();},release:()=>{rootLease?.release();session?.release();signal.removeEventListener('abort',abort);}};
    const abort=()=>{settle(job,'interrupted',session?.signal.aborted?'Browser-session permission changed. The download stopped; partial files are retained. Resume explicitly without session access or review permissions.':'Folder access changed. The download stopped; partial files are retained.');for(let i=pending.length-1;i>=0;i--)if(pending[i].job===job){pending[i].access?.release();pending.splice(i,1);}if(active?.job===job)active.child.kill();};
    signal.addEventListener('abort',abort,{once:true});return access;
  };
  const pump = () => {
    if (stopped || active || !pending.length) return;
    const next = pending.shift(), { job, binary, access } = next;
    if (job.status !== 'queued') { access?.release();pump(); return; }
    let child, timeout, folderAccess, prepared=false, lastSpaceCheck=now(), buffer = '', lastError = '', finished = false;
    const finish = (code, error) => {
      if (finished) return;
      finished = true; clearTimeout(timeout);
      if (['queued','running'].includes(job.status)) {
        let files = [];
        try {
          access?.assert();folderAccess?.assert();
          if (approveRoot(job.path)) files = readdirSync(job.path).filter(name => /\.(mp4|webm|mkv|m4a|flv|3gp|ogg|mov)$/i.test(name)).filter(name => {
            const file = realpathSync(join(job.path, name));
            return Boolean(approveRoot(file)) && file.startsWith(`${realpathSync(job.path)}${sep}`) && statSync(file).size > 0;
          });
        } catch { /* An unavailable folder cannot be called a completed save. */ }
        if (code === 0 && files.length) {
          Object.assign(job, { progress: 100, file: files[0] });
          settle(job, 'done', 'Saved to your computer.');
        } else { const reason = error || lastError || (code === 0 ? 'No video file was saved.' : 'Downloader failed.'); settle(job, 'error', job.source === 'youtube' ? downloadFailure(reason).message : downloadMessage(reason)); }
      }
      try{if(prepared){folderAccess?.assert();preflight.checkpoint(job);}}catch{if(job.status!=='done')job.detail+=' Partial files could not be verified; start a fresh copy if resume is blocked.';}
      save();access?.release();folderAccess?.release();active = null; pump();
    };
    try {
      access?.assert();if (!approveRoot(root)) throw new Error('The approved download folder is unavailable.');
      const folder = join(root, job.folderName || (job.source === 'youtube' ? job.key : job.id));
      try{job.preflight=preflight.inspect(job);}catch{job.preflight={state:'files-unverified',checkedAt:Date.now()};settle(job,'paused','Existing destination files could not be verified. Keep them and start a fresh copy.');access?.release();pump();return;}
      if(job.preflight.state!=='ready'){settle(job,'paused',job.preflight.state==='low-space'?'Not enough disk space for the estimate and safety margin. Free space, then resume explicitly.':'Available disk space could not be measured. Check the destination, then resume explicitly.');access?.release();pump();return;}
      if(rootAuthority)rootAuthority.ensureDirectory(folder);else mkdirSync(folder, { recursive: true });
      if (!approveRoot(folder)) throw new Error('The download folder is outside the approved roots.');
      folderAccess=rootAuthority?.lease(folder);folderAccess?.signal.addEventListener('abort',()=>{settle(job,'interrupted','Folder identity changed. The download stopped; partial files are retained.');child?.kill();},{once:true});
      preflight.checkpoint({...job,path:realpathSync(folder)});prepared=true;
      Object.assign(job, { status: 'running', path: realpathSync(folder), detail: 'Connecting to the video provider…', updatedAt: Date.now() });
      if (!save()) throw Error(persistenceError);
      // No shell, user config, playlists or client-supplied flags. Cookie access
      // is a literal browser enum authorized for this job; no export to disk/UI.
      access?.assert();folderAccess?.assert();
      child = spawnProcess(binary, ['--ignore-config', '--no-playlist', '--continue', '--no-overwrites', '--no-mtime', '--restrict-filenames', '--newline',
        ...(job.engine === 'yt-dlp' ? ['--js-runtimes', 'node'] : []),
        ...(job.browser && job.browser !== 'none' ? ['--cookies-from-browser', job.browser] : []),
        ...(job.source === 'youtube' ? ['--match-filter', '!is_live', '-f', 'best[ext=mp4]/best'] : []),
        '-o', join(job.path, '%(title).120s [%(id)s].%(ext)s'), '--', job.url],
      { cwd: job.path, windowsHide: true, shell: false, stdio: ['ignore', 'pipe', 'pipe'] });
      active = { job, child, finish };
      const consume = data => {
        try{access?.assert();folderAccess?.assert();}catch{child.kill();return;}
        if(now()-lastSpaceCheck>5000){lastSpaceCheck=Date.now();try{const checked=preflight.inspect(job,{checkFiles:false});if(checked.freeBytes===null||checked.freeBytes<checked.marginBytes){job.preflight=checked;settle(job,'paused','Disk safety margin reached. Partial files are retained. Free space, then resume explicitly.');child.kill();return;}}catch{settle(job,'interrupted','Destination access changed. Check the folder before resuming.');child.kill();return;}}
        buffer = (buffer + String(data)).slice(-8192);
        const lines = buffer.split(/[\r\n]+/); buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (/ERROR:|WARNING:/i.test(line)) lastError = downloadMessage(line.trim());
          const percent = line.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
          if (job.status !== 'running') continue;
          if (percent) { job.progress = Math.min(100, Math.max(0, Number(percent[1]))); job.detail = job.source === 'youtube' ? `Downloading video · ${Math.round(job.progress)}%` : downloadMessage(line.trim()).slice(0, 300); }
          else if (/\[download\]|\[youtube\]/.test(line)) job.detail = job.source === 'youtube' ? 'Receiving video from YouTube…' : downloadMessage(line.trim()).slice(0, 300);
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
    list: () => {let changed=false;for(const job of jobs)if(job.status==='done'&&!completedFile(job)){Object.assign(job,{status:'interrupted',detail:'The completed file is unavailable or no longer approved. Resume only after checking the destination.'});changed=true;}if(changed)save();return jobs.map(publicJob);},
    budget:()=>({...preflight.budget}),
    recovery: () => ({ version:2, persistent:Boolean(root&&approveRoot(root)&&!persistenceError&&!unsupportedManifest), error:persistenceError||undefined, retained:jobs.length, maxEntries:40, maxPending:8, active:active?1:0 }),
    enqueue({ key, url, title, binary, source = 'youtube', engine = 'youtube-dl', browser = 'none', forceNew = false, estimatedBytes }) {
      if (!['youtube','offline'].includes(source)) throw Error('Unsupported download source.');
      if (stopped) throw Error('Companion is stopping. Check saved job receipts after restarting.');
      if (browser !== 'none' && (!BROWSERS.has(browser) || engine !== 'yt-dlp' || source !== 'youtube')) throw new Error('Browser sign-in requires the YouTube yt-dlp downloader.');
      const duplicate = jobs.find(job => job.key === key && job.source === source && ['queued', 'running'].includes(job.status));
      if (duplicate) return publicJob(duplicate);
      const completed = jobs.find(job=>job.key===key&&job.source===source&&completedFile(job));
      if (completed && !forceNew) return publicJob(completed);
      if (!root || !approveRoot(root)) throw new Error('An approved download folder is required.');
      if (pending.length >= 8) throw new Error('The download queue is full. Wait for a download to finish.');
      if (typeof key !== 'string' || !/^[\w-]{1,80}$/.test(key)) throw new Error('Invalid download key.');
      url = source==='youtube' ? youtubeWatchUrl(key) : checkedOfflineUrl(url);
      const jobId=randomUUID();
      const job = { id: jobId, folderName:jobId,estimatedBytes:downloadEstimate(estimatedBytes),key, source, engine, browser, url, title: downloadMessage(title || key).slice(0, 250), status: 'queued', detail: 'Waiting for the current download.', progress: 0, createdAt: Date.now(), updatedAt: Date.now(), attempt:1, path: root };
      // Never evict a queued/running job from the bounded history.
      const access=watchAccess(job);
      let evicted; if (jobs.length >= 40) { const index = jobs.findLastIndex(row => !['queued', 'running'].includes(row.status)); if (index >= 0) evicted = { index, job: jobs.splice(index, 1)[0] }; }
      jobs.unshift(job);if(!save()){jobs.splice(jobs.indexOf(job),1);if(evicted)jobs.splice(evicted.index,0,evicted.job);access.release();throw Error(persistenceError);}pending.push({job,binary,access});pump();return publicJob(job);
    },
    resume(id,{binary,engine='yt-dlp',browser='none'}={}) {
      const job=jobs.find(row=>row.id===id);if(!job)throw Error('Download receipt not found.');
      if(['queued','running'].includes(job.status))return publicJob(job);
      if(completedFile(job))return publicJob(job);
      if(stopped||active?.job.id===id)throw Error('Wait for the previous process to stop before resuming.');
      if(!root||!approveRoot(root))throw Error('An approved download folder is required.');
      if(pending.length>=8)throw Error('The download queue is full.');
      if(browser!=='none'&&(!BROWSERS.has(browser)||engine!=='yt-dlp'||job.source!=='youtube'))throw Error('Browser sign-in requires explicit YouTube yt-dlp consent.');
      const access=watchAccess(job,browser),prior={...job};Object.assign(job,{status:'queued',engine,browser,progress:0,attempt:job.attempt+1,updatedAt:Date.now(),detail:'Resume requested. Existing partial files are kept.'});delete job.file;
      if(!save()){Object.assign(job,prior);throw Error(persistenceError);}pending.push({job,binary,access:watchAccess(job)});pump();return publicJob(job);
    },
    media(id) {
      const job = jobs.find(row => row.id === id && row.status === 'done' && row.source === 'youtube');
      if (!job || !/^[\w-]{11}$/.test(job.key) || !job.file || basename(job.file) !== job.file || !/\.(mp4|webm|mkv|mov|ogg|3gp)$/i.test(job.file)) return null;
      try {
        if (!approveRoot(root) || !approveRoot(job.path)) return null;
        const folder = realpathSync(join(root, job.folderName || job.key));
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
      if (['queued', 'running', 'interrupted', 'paused'].includes(job.status)) {
        if(job.status==='interrupted'||job.status==='paused'){Object.assign(job,{status:'cancelled',detail:'Cancelled. Partial files are retained.',updatedAt:Date.now()});save();}
        else settle(job, 'cancelled', 'Cancelled. Any partial file stays on your computer for a later retry.');
        if (active?.job.id === id) active.child.kill();
        const index = pending.findIndex(row => row.job.id === id); if (index >= 0){pending[index].access?.release();pending.splice(index, 1);}
      }
      return publicJob(job);
    },
    shutdown() { stopped=true;for (const row of pending){settle(row.job, 'interrupted', 'Companion stopped. Resume explicitly to continue.');row.access?.release();} pending.length = 0; if (active) { settle(active.job, 'interrupted', 'Companion stopped. Resume explicitly to continue.'); active.child.kill(); } },
  };
}

function checkedOfflineUrl(value) {
  const url = new URL(value);
  if(url.protocol!=='https:'||url.username||url.password||url.href.length>4096)throw Error('A public HTTPS URL without embedded credentials is required.');
  return url.href;
}
