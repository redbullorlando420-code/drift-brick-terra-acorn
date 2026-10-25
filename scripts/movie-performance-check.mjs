import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';

const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? resolve('screenshots/movies-performance.json'), [resolve('screenshots')], 'movie performance report');
const refined = process.argv.includes('--refined');
mkdirSync(dirname(output), { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
const results = [];
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    await context.route('http://127.0.0.1:43123/**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false}' }));
    await context.addInitScript(() => {
      localStorage.setItem('reelcase.pulls-paused.v1', 'true');
      localStorage.setItem('reelcase.artwork-mode', 'text');
      localStorage.setItem('reelcase.debug-panel', 'true');
      window.__moviePerf = { frames: [], inputs: [], recording: false };
      let last = performance.now();
      const frame = now => { if (window.__moviePerf.recording) window.__moviePerf.frames.push(now - last); last = now; requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
      document.addEventListener('pointerdown', event => {
        const action = event.target.closest('button')?.textContent?.trim();
        const at = performance.now();
        requestAnimationFrame(() => requestAnimationFrame(() => window.__moviePerf.inputs.push({ action, ms: performance.now() - at })));
      }, true);
    });
    const page = await context.newPage(), errors = [];
    page.setDefaultTimeout(30_000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const result = { viewport: viewport.name, errors };
    results.push(result);
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.waitForFunction(async () => (await indexedDB.databases()).some(db => db.name === 'reelcase'));
      // Isolated browser storage only: no handles, real files or provider traffic.
      await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => { const request = indexedDB.open('reelcase'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
        try {
          for (let start = 0; start < 80_000; start += 512) await new Promise((resolve, reject) => {
            const tx = db.transaction('videos', 'readwrite'), store = tx.objectStore('videos');
            for (let index = start; index < Math.min(start + 512, 80_000); index++) store.put({
              id: `local:qa-${String(index).padStart(8, '0')}`, folderId: 'files:QA movies',
              name: `Movie performance ${index}`, path: `QA/Movie performance ${index}.mp4`,
              extension: index % 2 ? 'mkv' : 'mp4', mime: 'video/mp4', size: 0,duration:5400,
              genre: ['Comedy', 'Action', 'Horror', 'Drama', 'Documentary', 'Science Fiction', 'Other', 'Other'][index % 8],
              year: index % 10 === 0 ? 1950 : 2020, addedAt: Date.now() - index * 1000,
            });
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
          });
        } finally { db.close(); }
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByText(/80,000 indexed/).first().waitFor();
      const navigate = async name => {
        if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
        await page.getByRole('button', { name: new RegExp(`^${name}(?:$|\\s)`) }).first().click();
      };
      const measure = async (name, action) => {
        await page.evaluate(() => { window.__moviePerf.frames = []; window.__moviePerf.inputs = []; window.__moviePerf.recording = true; });
        const at = Date.now();
        await action();
        if (refined) await page.waitForFunction(() => document.querySelector('[data-movie-catalog]')?.getAttribute('aria-busy') === 'false', null, { polling: 'raf' });
        await page.getByRole('list', { name: 'From your source folders · 80,000 titles', exact: true }).waitFor();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        result[name] = await page.evaluate(elapsed => { window.__moviePerf.recording = false; return { elapsedMs: elapsed, maxFrameMs: Math.max(0, ...window.__moviePerf.frames), inputs: window.__moviePerf.inputs }; }, Date.now() - at);
      };
      await measure('navigation', () => navigate('Movies'));
      const rail = page.getByRole('list', { name: 'From your source folders · 80,000 titles', exact: true });
      const before = await rail.locator('[data-video-card-open]').first().getAttribute('data-video-card-id');
      const profiler = process.argv.includes('--profile') && viewport.name === 'desktop' ? await context.newCDPSession(page) : null;
      if (profiler) { await profiler.send('Profiler.enable'); await profiler.send('Profiler.start'); }
      await measure('shuffle', () => page.getByRole('button', { name: 'Random pick', exact: true }).click());
      if (profiler) { const { profile } = await profiler.send('Profiler.stop'); writeFileSync(output.replace(/\.json$/, '.cpuprofile'), JSON.stringify(profile)); await profiler.detach(); }
      const after = await rail.locator('[data-video-card-open]').first().getAttribute('data-video-card-id');
      result.shuffleChanged = before !== after;
      if (!result.shuffleChanged) throw new Error('Random pick did not change the first title');
      for (const label of ['MP4 files · 40000', 'MKV files · 40000', 'Comedy first', 'Action first', 'Science Fiction first', 'All movies']) {
        if (!await page.getByRole('heading', { name: label, exact: true }).count()) throw new Error(`Missing shelf: ${label}`);
      }
      if (refined) {
        await page.getByRole('button', { name: 'Random pick', exact: true }).click();
        await navigate('Home');
        await page.locator('[data-home-ready="true"]').waitFor();
        await measure('returnNavigation', () => navigate('Movies'));
      }
      await page.getByRole('heading', { name: /^Movies/ }).scrollIntoViewIfNeeded();
      result.screenshot = output.replace(/\.json$/, `-${viewport.name}.png`);
      await page.screenshot({ path: result.screenshot });
      result.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      result.cards = await page.locator('[data-video-card]').count();
      if (refined && ['navigation', 'shuffle', 'returnNavigation'].some(name => result[name].maxFrameMs > 200)) throw new Error('Movie frame exceeded the 200 ms responsiveness budget');
      if (refined) {
        await rail.scrollIntoViewIfNeeded();
        const first = rail.locator('[data-video-card-open]').first();
        await first.focus();
        await first.press('End');
        await page.waitForFunction(() => document.activeElement?.closest('[data-rail-index]')?.getAttribute('data-rail-index') === '79999');
        if (await rail.locator('[data-video-card]').count() > 32) throw new Error('Full-library keyboard navigation mounted too many cards');
        await page.locator(':focus').press('Home');
        await page.waitForFunction(() => document.activeElement?.closest('[data-rail-index]')?.getAttribute('data-rail-index') === '0');
        result.fullCatalogKeyboardVerified = true;
        await rail.locator('[data-video-card-open]:not([data-video-card-id="local:qa-00000000"])').first().click();
        await page.getByRole('button', { name: 'Close preview', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Close preview', exact: true }).click();
        result.previewVerified = true;
        // These synthetic titles have no file handles. Preview must retain the
        // existing unavailable-file safeguard, excluding exactly that one row.
        await page.getByRole('heading', { name: 'Movies 79999', exact: true }).waitFor();
        await page.locator('[data-movie-catalog][aria-busy="false"]').waitFor();
        result.unavailableMovieRemoved = true;
        await page.getByRole('heading', { name: 'From your source folders', exact: true }).scrollIntoViewIfNeeded();
        const activeRail = page.getByRole('list', { name: 'From your source folders · 79,999 titles', exact: true });
        await activeRail.waitFor();
        const candidate = activeRail.locator('[data-video-card-open]:not([data-video-card-id="local:qa-00000000"])').first();
        const hiddenId = await candidate.getAttribute('data-video-card-id');
        const toHide = candidate.locator('..');
        await toHide.getByRole('button', { name: /^Hide .+ from your library$/ }).click();
        await page.getByRole('heading', { name: 'Movies 79998', exact: true }).waitFor();
        await page.locator('[data-movie-catalog][aria-busy="false"]').waitFor();
        if (await page.locator(`[data-video-card-id="${hiddenId}"]`).count()) throw new Error('Hidden movie remained in a shelf');
        result.hiddenMovieRemoved = true;
        await page.evaluate(async () => {
          const db = await new Promise(resolve => { const req = indexedDB.open('reelcase'); req.onsuccess = () => resolve(req.result); });
          await new Promise((resolve, reject) => {
            const tx = db.transaction('videos', 'readwrite'), store = tx.objectStore('videos'), request = store.get('local:qa-00000000');
            request.onsuccess = () => store.put({ ...request.result, collection: 'classics' });
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
          }); db.close();
        });
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.getByText(/80,000 indexed/).first().waitFor();
        // The selected destination is itself persisted by the existing app.
        if (!await page.locator('[data-movie-catalog]').count()) await navigate('Movies');
        await page.locator('[data-movie-catalog][aria-busy="false"]').waitFor();
        await page.getByRole('heading', { name: 'Movies 79998', exact: true }).waitFor();
        if (await page.locator(`[data-video-card-id="${hiddenId}"]`).count()) throw new Error('Hidden movie returned after reload');
        const classicHeading = page.getByRole('heading', { name: 'Classic movies', exact: true });
        await classicHeading.scrollIntoViewIfNeeded();
        await page.getByRole('list', { name: 'Classic movies · 1 titles', exact: true }).waitFor();
        result.classicsPersisted = true;
      }
      if (result.overflow || errors.length) throw new Error('Layout or browser errors');
    } catch (error) {
      result.failure = error.message;
      result.failureText = (await page.locator('body').innerText()).slice(-3500);
      await page.screenshot({ path: output.replace(/\.json$/, `-failure-${viewport.name}.png`) });
    }
    console.log(JSON.stringify(result));
    await context.close();
  }
} finally { await browser.close(); }
writeFileSync(output, JSON.stringify(results, null, 2));
if (results.some(result => result.failure)) process.exitCode = 1;
