import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? resolve('screenshots/youtube-download-dev.json'), [resolve('screenshots')]);
mkdirSync(resolve('screenshots'), { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
const results = [];
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage(), errors = [], result = { viewport: viewport.name, errors };
    page.setDefaultTimeout(15000); page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && !/favicon|net::ERR_|Failed to load resource.*503/.test(message.text())) errors.push(message.text()); });
    await context.addInitScript(() => { localStorage.setItem('reelcase.pulls-paused.v1', 'true'); localStorage.setItem('reelcase.sidebar.groups.v1', JSON.stringify({ library: true, workspace: true, tools: true })); });
    // Provider content and the native process are fixtures; no real download is triggered by browser tests.
    for (const host of ['www.youtube.com', 'www.youtube-nocookie.com', 'i.ytimg.com']) await context.route(`https://${host}/**`, route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Provider fixture</p>' }));
    let mode = 'ready', jobs = [], reads = 0, starts = 0, cancels = 0, lastInput, resumes=0;
    // A tiny browser-generated test clip verifies real decoding/seeking without
    // using anyone's media or signed-in provider session.
    let clip;
    await context.route('http://127.0.0.1:43123/**', async route => {
      const request = route.request(), path = new URL(request.url()).pathname;
      const headers = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type', 'cache-control': 'no-store' };
      if (request.method() === 'OPTIONS') return route.fulfill({ status: 204, headers });
      let body = { ok: true };
      if (path === '/youtube/downloads') {
        if (request.method() === 'GET') { reads++; body = mode === 'old' ? { ok: false, error: 'Download action not found.' } : { ok: true, configured: mode !== 'setup', engine: ['auth','recovery'].includes(mode) ? 'yt-dlp' : 'youtube-dl', browserAuth: ['auth','recovery'].includes(mode), localPlayback: ['auth','recovery'].includes(mode), version: ['auth','recovery'].includes(mode) ? 'test-current' : '2025.11.26', path: 'C:\\Realhub Downloads', jobs,taskRecovery:mode==='recovery',...(mode==='recovery'?{recovery:{persistent:true,maxEntries:40,retained:jobs.length}}:{}) }; }
        else {
          starts++; const input = request.postDataJSON(); lastInput = input; assert.equal(input.videoId, 'BaW_jenozKc'); assert.equal(Object.hasOwn(input, 'url'), false);
          const job = { id: 'qa-job', key: input.videoId, title: input.title, status: 'running', progress: 12, detail: 'Downloading test fixture', path: 'C:\\Realhub Downloads\\BaW_jenozKc', updatedAt: Date.now() };
          jobs = [job]; body = { ok: true, job };
        }
      } else if (/\/media$/.test(path)) { assert.equal(request.headers().origin, new URL(url).origin); return route.fulfill({ status: 200, headers, contentType: 'video/webm', body: Buffer.from(clip) }); }
      else if (/\/resume$/.test(path)) { resumes++;lastInput=request.postDataJSON();jobs=jobs.map(job=>({...job,status:'running',attempt:2,browser:'none',detail:'Resumed existing receipt.'}));body={ok:true,job:jobs[0]}; }
       else if (/\/cancel$/.test(path)) { cancels++; jobs = jobs.map(job => ({ ...job, status: 'cancelled', detail: 'Cancelled.' })); body = { ok: true, job: jobs[0] }; }
      else if (path === '/health') body = { ok: true, service: 'reelcase-companion', version: 11, capabilities: ['youtube-downloads'] };
      return route.fulfill({ status: 200, headers, contentType: 'application/json', body: JSON.stringify(body) });
    });
    const nav = async name => {
      if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      await page.getByRole('navigation', { name: 'Library navigation' }).getByRole('button', { name: new RegExp(`^${name}(?:\\s+\\d+)?$`) }).click();
      const explore = page.getByRole('button', { name: 'Explore recommendations and full catalog', exact: true });
      if (await explore.isVisible()) await explore.click();
    };
    const download = () => page.getByRole('button', { name: 'Download YouTube video: Download QA upload', exact: true });
    const dialog = () => page.getByRole('dialog', { name: 'YouTube download', exact: true });
    const close = () => page.getByRole('button', { name: 'Close YouTube download', exact: true }).click();
    try {
      console.log(`${viewport.name}: seed`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await page.locator('[data-home-ready="true"]').waitFor();
      clip = await page.evaluate(async () => {
      const canvas = document.createElement('canvas'); canvas.width = 160; canvas.height = 90;
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d'); ctx.fillStyle = '#112233'; ctx.fillRect(0, 0, 160, 90);
      await new Promise(requestAnimationFrame);
      const stream = canvas.captureStream(0), track = stream.getVideoTracks()[0], recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp8' }), chunks = [];
      const stopped = new Promise(resolve => { recorder.ondataavailable = event => chunks.push(event.data); recorder.onstop = resolve; });
      let tick = 0; const timer = setInterval(() => { ctx.fillStyle = tick++ % 2 ? '#112233' : '#223344'; ctx.fillRect(0, 0, 160, 90); track.requestFrame(); }, 80);
      recorder.start(100); await new Promise(resolve => setTimeout(resolve, 2000)); clearInterval(timer); recorder.stop(); await stopped;
      stream.getTracks().forEach(track => track.stop()); canvas.remove(); return [...new Uint8Array(await new Blob(chunks).arrayBuffer())];
    });
      result.clipBytes = clip.length;
      assert.ok(clip.length > 256, 'test recorder must produce actual video frames');

      await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => { const request = indexedDB.open('reelcase'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
        const rows = [{ id: 'BaW_jenozKc', name: 'Download QA upload' }, { id: '12345678901', name: 'Download QA live', live: true }];
        const follows = [{ id: 'yt:download-qa', kind: 'youtube', handle: 'download-qa', title: 'Download QA creator' }];
        localStorage.setItem('reelcase.follows.v1', JSON.stringify({ channels: follows, savedAt: Date.now() }));
        await new Promise((resolve, reject) => { const tx = db.transaction('remote-cache', 'readwrite'), store = tx.objectStore('remote-cache'); store.put({ folders: [], checkedAt: Date.now() }, 'meta');
          for (const row of rows) store.put({ id: `yt:v:${row.id}`, folderId: 'yt:download-qa', name: row.name, path: `youtube/${row.id}`, extension: 'youtube', mime: 'video/youtube', size: 0, duration: 10, addedAt: Date.now(),
            remote: { kind: 'youtube', videoId: row.id, channelName: 'Download QA creator', watchUrl: `https://www.youtube.com/watch?v=${row.id}`, embedUrl: `https://www.youtube.com/embed/${row.id}`, ...(row.live ? { live: true, youtubeType: 'live', observedAt: Date.now() } : { youtubeType: 'upload', publishedSource: 'rss' }) } }, `video:yt:v:${row.id}`);
          tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); db.close();
      });
      await page.reload(); await page.locator('[data-home-ready="true"]').waitFor(); await nav('YouTube');
      await download().first().waitFor(); assert.equal(reads, 0, 'cards must not probe the downloader');
      await download().first().click(); await dialog().getByText('youtube-dl 2025.11.26', { exact: true }).waitFor();
      assert.equal(starts, 0, 'opening a panel does not start a download');
      result.readyScreenshot = output.replace(/\.json$/, `-ready-${viewport.name}.png`); await page.screenshot({ path: result.readyScreenshot });
      await page.getByRole('button', { name: 'Download with youtube-dl', exact: true }).click();
      await page.getByRole('button', { name: 'Cancel download', exact: true }).waitFor(); assert.equal(starts, 1);
      await close(); const closedReads = reads; await page.waitForTimeout(2300); assert.equal(reads, closedReads, 'closed panels do not poll');
      await download().first().click(); await page.getByRole('button', { name: 'Cancel download', exact: true }).click(); await dialog().getByText('Cancelled', { exact: true }).waitFor(); assert.equal(cancels, 1);
      await page.getByRole('button', { name: 'Retry download', exact: true }).click(); await page.getByRole('button', { name: 'Cancel download', exact: true }).waitFor();
      jobs[0] = { ...jobs[0], status: 'error', detail: 'ERROR: Video unavailable' };
      await page.getByRole('button', { name: 'Check status', exact: true }).click(); await dialog().getByText('Download failed', { exact: true }).waitFor();
      assert.ok(await dialog().getByRole('region',{name:'Download failure guidance'}).getByText('Video unavailable or unsupported by the downloader.', { exact: true }).isVisible());
      await page.getByRole('button', { name: 'Retry download', exact: true }).click(); await page.getByRole('button', { name: 'Cancel download', exact: true }).waitFor();
      jobs[0] = { ...jobs[0], status: 'done', progress: 100, detail: 'Saved to your computer.', file: 'Test video.mp4' };
      await page.getByRole('button', { name: 'Check status', exact: true }).click(); await dialog().getByText('Download complete', { exact: true }).waitFor();
      result.completeScreenshot = output.replace(/\.json$/, `-complete-${viewport.name}.png`); await page.screenshot({ path: result.completeScreenshot });
      await close(); const settledReads = reads; await page.waitForTimeout(2200); assert.equal(reads, settledReads);
      await page.reload(); await page.locator('[data-home-ready="true"]').waitFor(); await nav('YouTube'); await download().first().click(); await dialog().getByText('Download complete', { exact: true }).waitFor(); await close();
      console.log(`${viewport.name}: preview/player`);
      await page.locator('[data-video-card-open]').filter({ hasText: 'Download QA upload' }).first().click();
      const preview = page.getByRole('dialog', { name: 'Preview: Download QA upload', exact: true }); await preview.waitFor();
      await preview.getByRole('button', { name: 'Download YouTube video: Download QA upload', exact: true }).click(); await dialog().waitFor(); await close(); assert.ok(await preview.isVisible());
      await preview.getByRole('button', { name: 'Watch now', exact: true }).click(); const player = page.getByRole('dialog', { name: 'Player: Download QA upload', exact: true }); await player.waitFor();
      await player.getByRole('button', { name: 'Download YouTube video: Download QA upload', exact: true }).click(); await dialog().waitFor(); await close();
      await player.getByRole('button', { name: 'Use browser sign-in', exact: true }).click(); await dialog().waitFor(); await close();
      const closeBox = await player.getByRole('button', { name: 'Close', exact: true }).boundingBox();
      assert.ok(closeBox && closeBox.x >= 0 && closeBox.x + closeBox.width <= viewport.width && closeBox.y + closeBox.height <= viewport.height, 'player close action stays on screen');
      result.playerScreenshot = output.replace(/\.json$/, `-player-${viewport.name}.png`); await page.screenshot({ path: result.playerScreenshot });
      await player.getByRole('button', { name: 'Close', exact: true }).click();
      mode = 'setup'; await download().first().click(); await dialog().getByText('Setup needed', { exact: true }).waitFor(); assert.equal(await dialog().getByRole('button', { name: 'Download with youtube-dl', exact: true }).count(), 0);
      result.setupScreenshot = output.replace(/\.json$/, `-setup-${viewport.name}.png`); await page.screenshot({ path: result.setupScreenshot }); await close();
      mode = 'old'; await download().first().click(); await dialog().getByRole('alert').waitFor(); assert.ok(await dialog().getByText('Setup needed', { exact: true }).isVisible()); await close();
      mode = 'ready'; await nav('Live'); await page.getByRole('button', { name: 'Download YouTube video: Download QA live', exact: true }).first().click(); await dialog().getByText('youtube-dl 2025.11.26', { exact: true }).waitFor();
      assert.ok(await dialog().getByText(/archived video after it ends/).isVisible()); assert.equal(await dialog().getByRole('button', { name: 'Download with youtube-dl', exact: true }).count(), 0); await close();
      await nav('YouTube'); mode = 'auth'; jobs = [];
      await download().first().click(); await dialog().getByText('yt-dlp test-current', { exact: true }).waitFor();
      const consent = dialog().getByRole('checkbox', { name: 'Use my signed-in browser for this download', exact: true });
      assert.equal(await consent.isChecked(), false); const beforeConsent = starts;
      await consent.check(); await dialog().getByRole('combobox', { name: 'Signed-in browser', exact: true }).selectOption('firefox');
      assert.equal(starts, beforeConsent, 'choosing a session does not access it or start a download');
      result.authScreenshot = output.replace(/\.json$/, `-auth-${viewport.name}.png`); await page.screenshot({ path: result.authScreenshot });
      await dialog().getByRole('button', { name: 'Download with yt-dlp', exact: true }).click();
      await dialog().getByRole('button', { name: 'Cancel download', exact: true }).waitFor();
      assert.equal(lastInput.useBrowserSession, true); assert.equal(lastInput.browser, 'firefox');
      assert.equal(await consent.isChecked(),false,'consent resets after accepted attempt');
      jobs[0] = { ...jobs[0], status: 'error', detail: 'ERROR: Could not decrypt browser cookie database' };
      await dialog().getByRole('button', { name: 'Check status', exact: true }).click(); await dialog().getByText('Download failed', { exact: true }).waitFor();
      await dialog().getByRole('region', {name:'Download failure guidance'}).getByRole('note').waitFor();
      assert.equal(await dialog().locator('[data-download-failure]').getAttribute('data-download-failure'),'session-unreadable');
      for(const [detail,kind] of [['Cookies expired token=SECRET_SESSION','session-expired'],['Sign in to confirm your age Cookie: SECRET_COOKIE','access-restricted']]){jobs[0]={...jobs[0],status:'error',detail};await dialog().getByRole('button',{name:'Check status',exact:true}).click();await dialog().locator(`[data-download-failure="${kind}"]`).waitFor();assert(!(await dialog().innerText()).includes('SECRET_'));}
      result.failureScreenshot=output.replace(/\.json$/,`-failure-guidance-${viewport.name}.png`);await page.screenshot({path:result.failureScreenshot});
      await dialog().getByRole('button', { name: 'Retry download', exact: true }).click();
      jobs[0] = { ...jobs[0], status: 'done', progress: 100, file: 'Test video.webm', detail: 'Saved to your computer.' };
      await dialog().getByRole('button', { name: 'Check status', exact: true }).click(); await dialog().getByRole('button', { name: 'Watch saved video', exact: true }).click();
      const local = dialog().getByLabel('Saved video: Download QA upload', { exact: true });
      await local.scrollIntoViewIfNeeded();
      await local.evaluate(async video => { video.muted = true; await Promise.race([video.play(), new Promise((_, reject) => setTimeout(() => reject(new Error('Local test clip did not start')), 10000))]); });
      await page.waitForFunction(() => document.querySelector('video[aria-label="Saved video: Download QA upload"]')?.readyState >= 2);
      await local.evaluate(video => { video.currentTime = 0.1; });
      await page.waitForFunction(() => document.querySelector('video[aria-label="Saved video: Download QA upload"]')?.currentTime >= 0.1);
      result.localScreenshot = output.replace(/\.json$/, `-local-${viewport.name}.png`); await page.screenshot({ path: result.localScreenshot });
      await close(); await download().first().click(); await dialog().getByText('yt-dlp test-current', { exact: true }).waitFor();
      assert.equal(await dialog().getByRole('checkbox', { name: 'Use my signed-in browser for this download' }).isChecked(), false, 'browser consent resets when the panel closes');
      await close();
       mode='recovery';jobs[0]={...jobs[0],status:'interrupted',detail:'Companion stopped before completion.',browser:'firefox'};const beforeResume=starts;await download().first().click();await dialog().getByText('Interrupted · resume needed',{exact:true}).waitFor();assert.equal(starts,beforeResume);assert.equal(await dialog().getByRole('checkbox',{name:'Use my signed-in browser for this download'}).isChecked(),false);await dialog().getByRole('button',{name:'Resume download',exact:true}).click();await dialog().getByText('Resumed existing receipt.',{exact:true}).waitFor();assert.equal(resumes,1);assert.equal(lastInput.useBrowserSession,undefined);assert.equal(jobs[0].id,'qa-job');await close();
       Object.assign(result, {interruptedResume:true,resumes, browserAuthOptIn: true, browserRetry: true, localVideoDecodedAndSeeked: true, consentReset: true });
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false); assert.deepEqual(errors, []);
      Object.assign(result, { starts, cancels, reads, cardsDoNotPoll: true, closeStopsPolling: true, reloadRestoresStatus: true, previewAndPlayer: true, setupAndErrors: true, liveExcluded: true, ok: true });
    } catch (error) { result.ok = false; result.error = error.stack; result.media = await page.evaluate(() => { const video = document.querySelector('video'); return video ? { readyState: video.readyState, networkState: video.networkState, error: video.error?.message, currentSrc: video.currentSrc } : null; }).catch(() => null); await page.screenshot({ path: output.replace(/\.json$/, `-failure-${viewport.name}.png`) }).catch(() => {}); }
    results.push(result); await context.close();
  }
} finally { await browser.close(); }
writeFileSync(output, JSON.stringify(results, null, 2)); console.log(JSON.stringify(results, null, 2));
if (results.some(result => !result.ok)) process.exitCode = 1;
