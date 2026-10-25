import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';

const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? resolve('screenshots/history-performance.json'), [resolve('screenshots')], 'history report');
const refined = process.argv.includes('--refined');
mkdirSync(dirname(output), { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
const results = [];
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    await context.route('http://127.0.0.1:43123/**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false}' }));
    await context.addInitScript(() => {
      localStorage.setItem('reelcase.pulls-paused.v1', 'true');
      localStorage.setItem('reelcase.artwork-mode', 'text');
      localStorage.setItem('reelcase.debug-panel', 'true');
      window.__historyPerf = { frames: [], inputs: [], recording: false };
      let last = performance.now();
      const frame = now => { if (window.__historyPerf.recording) window.__historyPerf.frames.push(now - last); last = now; requestAnimationFrame(frame); };
      requestAnimationFrame(frame);
      document.addEventListener('pointerdown', event => {
        const action = event.target.closest('button')?.textContent?.trim(), at = performance.now();
        requestAnimationFrame(() => requestAnimationFrame(() => window.__historyPerf.inputs.push({ action, ms: performance.now() - at })));
      }, true);
    });
    const page = await context.newPage(), errors = [], downloads = [];
    page.setDefaultTimeout(30_000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    page.on('download', download => downloads.push(download));
    const result = { viewport: viewport.name, errors }; results.push(result);
    const progress = stage => console.log(JSON.stringify({ viewport: viewport.name, stage }));
    try {
      progress('initial render');
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.waitForFunction(async () => (await indexedDB.databases()).some(db => db.name === 'reelcase'));
      progress('seed');
      await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => { const request = indexedDB.open('reelcase'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
        try {
          for (let start = 0; start < 80_000; start += 512) await new Promise((resolve, reject) => {
            const tx = db.transaction('videos', 'readwrite'), store = tx.objectStore('videos');
            for (let index = start; index < Math.min(start + 512, 80_000); index++) store.put({ id: `local:qa-${String(index).padStart(8, '0')}`, folderId: 'files:QA history',
              name: `History performance ${index}`, path: `QA/History performance ${index}.mp4`, extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: Date.now() - index });
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
          });
          await new Promise((resolve, reject) => {
            const at = Date.now() - 60_000, history = Array.from({ length: 60_000 }, (_, index) => ({
              id: `local:qa-${String(index).padStart(8, '0')}`, eventId: `qa-event-${index}`, at: at - index % 10 * 86_400_000 - index,
              source: ['open', 'progress', 'watch-room'][index % 3], position: 25, duration: 420,
              url: `https://example.invalid/watch/${index}`, title: `History performance ${index}`,
            })).sort((a, b) => b.at - a.at);
            const tx = db.transaction('activity', 'readwrite');
            tx.objectStore('activity').put({ history, savedAt: at }, 'primary');
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
          });
        } finally { db.close(); }
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      progress('restore');
      await page.getByText(/80,000 indexed/).first().waitFor();
      const navigate = async name => {
        if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
        await page.getByRole('button', { name: new RegExp(`^${name}(?:$|\\s)`) }).first().click();
      };
      const ready = async () => {
        if (refined) await page.waitForFunction(() => document.querySelector('[data-history-catalog]')?.getAttribute('aria-busy') === 'false'
          && document.querySelector('[data-history-export] button')?.disabled === false);
        await page.getByLabel('Recent history activity', { exact: true }).waitFor();
      };
      const measure = async (name, action) => {
        await page.evaluate(() => { window.__historyPerf.frames = []; window.__historyPerf.inputs = []; window.__historyPerf.recording = true; });
        const at = Date.now(); await action(); await ready();
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        result[name] = await page.evaluate(elapsed => { window.__historyPerf.recording = false; return { elapsedMs: elapsed, maxFrameMs: Math.max(0, ...window.__historyPerf.frames), inputs: window.__historyPerf.inputs }; }, Date.now() - at);
      };
      await measure('navigation', () => navigate('History'));
      progress('filters');
      await page.getByText(/60000 saved watch events/).waitFor();
      await page.getByLabel('History controls').getByRole('button', { name: 'Playback', exact: true }).click(); await ready();
      await measure('sourceFilter', () => page.getByRole('button', { name: 'Everything', exact: true }).click());
      const exportRows = async (name, count) => {
        let download;
        await measure(name, async () => {
          const pending = page.waitForEvent('download');
          await page.getByRole('button', { name: 'Export visible', exact: true }).click(); download = await pending;
        });
        const stream = await download.createReadStream(); let json = ''; for await (const chunk of stream) json += chunk.toString();
        const rows = JSON.parse(json);
        if (rows.length !== count || !rows.every(row => row.eventId.startsWith('qa-event-') && row.title.startsWith('History performance ') && row.url.startsWith('https://example.invalid/watch/') && row.positionSeconds === 25)) throw new Error(`Incomplete export: ${rows.length} != ${count}`);
        if (!rows.every((row, index) => index === 0 || Date.parse(rows[index - 1].occurredAt) >= Date.parse(row.occurredAt))) throw new Error('Export lost newest-first order');
        result[`${name}Rows`] = rows.length;
      };
      await exportRows('exportAll', 60_000);
      progress('exported all');
      await measure('timeFilter', () => page.getByRole('button', { name: '24 hours', exact: true }).click());
      await page.getByRole('list', { name: 'Media catalog · 6,000 titles', exact: true }).waitFor({ state: 'attached' });
      await page.getByRole('button', { name: 'Watch Room', exact: true }).click(); await ready();
      await exportRows('exportFiltered', 2000);
      await page.getByRole('button', { name: '7 days', exact: true }).click(); await ready();
      await page.getByRole('list', { name: 'Media catalog · 14,000 titles', exact: true }).waitFor({ state: 'attached' });
      if (refined) {
        await page.getByRole('button', { name: 'Everything', exact: true }).click(); await ready();
        await page.getByRole('button', { name: 'All time', exact: true }).click(); await ready();
        const count = downloads.length;
        await page.getByRole('button', { name: 'Export visible', exact: true }).click();
        await page.getByRole('button', { name: 'Cancel export', exact: true }).click();
        await page.waitForFunction(() => document.querySelector('[data-history-export]')?.getAttribute('aria-busy') === 'false');
        if (downloads.length !== count) throw new Error('Cancelled export downloaded a file');
        await page.getByRole('button', { name: 'Playback', exact: true }).click();
        await page.getByRole('button', { name: 'Direct opens', exact: true }).click();
        await page.getByRole('button', { name: 'Watch Room', exact: true }).click(); await ready();
        await page.getByRole('list', { name: 'Media catalog · 20,000 titles', exact: true }).waitFor({ state: 'attached' });
        result.cancellationVerified = true;
        const grid = page.locator('[data-virtual-video-grid]');
        await grid.scrollIntoViewIfNeeded();
        const loaded = Number(await grid.getAttribute('data-grid-loaded'));
        await grid.getByRole('button', { name: /^Show more/ }).click();
        await page.waitForFunction(before => Number(document.querySelector('[data-virtual-video-grid]')?.getAttribute('data-grid-loaded')) > before, loaded);
        await page.getByRole('button', { name: 'List view', exact: true }).click();
        await page.getByRole('button', { name: 'Grid view', exact: true }).click();
        if (await grid.locator('[data-video-card]').count() > 256) throw new Error('History grid mounted too many cards');
        result.pagingVerified = true;
        await page.getByRole('button', { name: 'Everything', exact: true }).click(); await ready();
        const beforeNavigation = downloads.length;
        await page.getByRole('button', { name: 'Export visible', exact: true }).click();
        await navigate('Home'); await page.locator('[data-home-ready="true"]').waitFor();
        await navigate('History'); await ready();
        if (downloads.length !== beforeNavigation) throw new Error('An abandoned History export downloaded after navigation');
        result.navigationCancellationVerified = true;
        await page.evaluate(() => {
          const original = URL.createObjectURL;
          window.__restoreHistoryDownload = () => { URL.createObjectURL = original; delete window.__restoreHistoryDownload; };
          URL.createObjectURL = blob => { if (blob.type === 'application/json') throw new Error('QA download unavailable'); return original(blob); };
        });
        try {
          await page.getByRole('button', { name: 'Export visible', exact: true }).click();
          await page.getByRole('alert').filter({ hasText: 'QA download unavailable' }).waitFor();
        } finally { await page.evaluate(() => window.__restoreHistoryDownload()); }
        await page.getByRole('button', { name: '24 hours', exact: true }).click(); await ready();
        await exportRows('exportRetry', 6000);
        result.exportFailureRecoveryVerified = true;
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.getByText(/80,000 indexed/).first().waitFor();
        if (!await page.getByLabel('History controls', { exact: true }).count()) await navigate('History');
        await ready();
        await page.getByText(/60000 saved watch events/).waitFor();
        await page.getByRole('list', { name: 'Media catalog · 60,000 titles', exact: true }).waitFor({ state: 'attached' });
        if (await page.getByLabel('Recent history activity').locator('button:disabled').count()) throw new Error('Restored history titles were not actionable');
        result.persistenceVerified = true;
      }
      await page.getByRole('heading', { name: 'History', exact: true }).scrollIntoViewIfNeeded();
      if (refined && (result.exportAll.maxFrameMs > 100 || result.exportAll.inputs.some(input => input.ms > 100))) throw new Error('History export exceeded the 100 ms responsiveness budget');
      result.screenshot = output.replace(/\.json$/, `-${viewport.name}.png`); await page.screenshot({ path: result.screenshot });
      result.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      if (result.overflow || errors.length) throw new Error('Layout or browser errors');
    } catch (error) { result.failure = error.message; result.failureText = (await page.locator('body').innerText({ timeout: 5000 }).catch(() => '')).slice(-2000); await page.screenshot({ path: output.replace(/\.json$/, `-failure-${viewport.name}.png`), timeout: 5000 }).catch(() => {}); }
    console.log(JSON.stringify(result)); await context.close();
  }
} finally { await browser.close(); }
writeFileSync(output, JSON.stringify(results, null, 2));
if (results.some(result => result.failure)) process.exitCode = 1;
