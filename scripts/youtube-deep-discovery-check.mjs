import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';

const origin = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? 'screenshots/youtube-deep-dev.json', [resolve('screenshots')]);
const stableMetadata = process.argv.includes('--stable-metadata');
const browser = await chromium.launch({ headless: true, args: ['--no-proxy-server'], ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
const results = [];
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    await context.route('http://127.0.0.1:43123/**', route => route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false}' }));
    await context.route('https://i.ytimg.com/vi/qa-discovery-*/**', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#ad844c"/></svg>' }));
    await context.route('https://www.youtube.com/embed/qa-discovery-*', route => route.fulfill({ contentType: 'text/html', body: '<p>Discovery preview fixture</p>' }));
    await context.addInitScript(() => {
      localStorage.setItem('reelcase.pulls-paused.v1', 'true');
      window.__deepPerf = { peakCards: 0, longTasks: [], observing: false };
      const NativeWorker = window.Worker;
      window.__deepPerf.rankingWorkers = [];
      window.Worker = class extends NativeWorker {
        constructor(...args) {
          super(...args);
          if (!String(args[0]).includes('youtube-ranking')) return;
          this.trace = { started: performance.now(), rows: 0, ready: null, result: null, ended: null };
          window.__deepPerf.rankingWorkers.push(this.trace);
          this.addEventListener('message', () => { this.trace.result ??= performance.now(); });
        }
        postMessage(message, ...rest) {
          if (this.trace) {
            if (message.type === 'append') this.trace.rows += message.rows.length;
            if (message.type === 'ready') this.trace.ready = performance.now();
          }
          super.postMessage(message, ...rest);
        }
        terminate() { if (this.trace) this.trace.ended = performance.now(); super.terminate(); }
      };
      new PerformanceObserver(list => { if (window.__deepPerf.observing) window.__deepPerf.longTasks.push(...list.getEntries().map(entry => entry.duration)); }).observe({ type: 'longtask', buffered: false });
      document.addEventListener('DOMContentLoaded', () => new MutationObserver(() => {
        window.__deepPerf.peakCards = Math.max(window.__deepPerf.peakCards, document.querySelectorAll('[data-video-card]').length);
      }).observe(document.body, { childList: true, subtree: true }), { once: true });
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    try {
      await page.goto(origin, { waitUntil: 'domcontentloaded' });
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.waitForFunction(async () => (await indexedDB.databases()).some(db => db.name === 'reelcase'));
      console.log(`${viewport.name}: seed 60,000 videos (80% from one creator)`);
      await page.evaluate(async stableMetadata => {
        const creators = ['dominant', ...Array.from({ length: 120 }, (_, index) => `rare-${index}`)];
        localStorage.setItem('reelcase.follows.v1', JSON.stringify({ channels: creators.map(creator => ({ id: `yt:${creator}`, kind: 'youtube', handle: creator, title: creator, channelId: creator })), savedAt: Date.now() }));
        const db = await new Promise((resolve, reject) => { const req = indexedDB.open('reelcase'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
        try {
          for (let offset = 0; offset < 60_000; offset += 512) await new Promise((resolve, reject) => {
            const tx = db.transaction(stableMetadata ? ['remote-cache', 'activity'] : 'remote-cache', 'readwrite'), store = tx.objectStore('remote-cache');
            if (!offset) store.put({ folders: [], checkedAt: Date.now() }, 'meta');
            for (let index = offset; index < Math.min(offset + 512, 60_000); index++) {
              const creator = index < 48_000 ? 'dominant' : `rare-${index % 120}`;
              const id = `yt:v:qa-discovery-${index}`;
              if (stableMetadata) tx.objectStore('activity').put({ id, tags: ['science'], provenance: { tags: { science: 'manual' }, lockedFields: ['tags'], updatedAt: Date.now() } }, `metadata-enrichment:${id}`);
              store.put({ id, folderId: `yt:${creator}`, name: `Science archive ${index}`, path: id, extension: 'yt', mime: 'video/youtube', size: 0, duration: 420, addedAt: Date.now() - index * 60_000,
                poster: `https://i.ytimg.com/vi/qa-discovery-${index}/hqdefault.jpg`,
                remote: { kind: 'youtube', channelId: creator, channelName: creator, videoId: `qa-discovery-${index}`, youtubeType: index >= 48_000 && index % 3 === 0 ? 'short' : 'upload', publishedSource: 'rss', embedUrl: `https://www.youtube.com/embed/qa-discovery-${index}` } }, `video:${id}`);
            }
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
          });
          localStorage.setItem('reelcase.media-feedback.v1', JSON.stringify({ ratings: { 'yt:v:qa-discovery-48017': 5, 'yt:v:qa-discovery-0': 1 }, creatorFavorites: { 'rare-17': true } }));
        } finally { db.close(); }
      }, stableMetadata);
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByText(/60,000 indexed/).first().waitFor({ timeout: 45000 });
      if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      await page.getByRole('button', { name: /^YouTube(?:\s|$)/ }).first().click();
      console.log(`${viewport.name}: open recommendations`);
      await page.getByRole('button', { name: 'Explore recommendations and full catalog', exact: true }).click();
      const deep = page.getByRole('region', { name: 'YouTube deep discovery', exact: true });
      await deep.scrollIntoViewIfNeeded();
      await page.evaluate(() => { window.__deepPerf.observing = true; window.__deepPerf.longTasks = []; });
      const started = Date.now();
      await deep.getByRole('button', { name: 'Load creator and topic shelves', exact: true }).click();
      console.log(`${viewport.name}: rank discovery`);
      await page.waitForFunction(() => Number(document.querySelector('[aria-label="YouTube deep discovery"]')?.getAttribute('data-discovery-ranked')) === 96, null, { timeout: 45000 });
      const firstBatchMs = Date.now() - started;
      const grid = deep.locator('[data-discovery-catalog="ranked"]');
      const revealGrid = async () => {
        await grid.evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      };
      await revealGrid();
      await grid.locator('[data-video-card-open]').first().waitFor();
      const ids = () => grid.locator('[data-video-card-open]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-video-card-id')));
      const first = await ids();
      assert.equal(first[0], 'yt:v:qa-discovery-48017', 'explicit feedback ranks the favored title first');
      assert.ok(!first.includes('yt:v:qa-discovery-0'), 'disliked videos must stay out');
      assert.ok(new Set(first.map(id => { const index = +id.split('-').at(-1); return index < 48000 ? 'dominant' : `rare-${index % 120}`; })).size >= Math.min(18, first.length));
      const nextPageStarted = Date.now();
      await deep.getByRole('button', { name: 'Rank 96 more videos', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[aria-label="YouTube deep discovery"]')?.getAttribute('data-discovery-ranked') === '192');
      const nextPageMs = Date.now() - nextPageStarted;
      await revealGrid();
      assert.deepEqual((await ids()).slice(0, first.length), first, 'next batch must not shuffle already visible cards');
      await grid.getByRole('button', { name: /Next page/ }).click();
      const gapMs = await page.evaluate(async () => {
        let last = performance.now(), worst = 0;
        for (let index = 0; index < 18; index++) {
          window.scrollBy(0, index < 9 ? 160 : -160);
          await new Promise(requestAnimationFrame);
          const now = performance.now(); worst = Math.max(worst, now - last); last = now;
        }
        return worst;
      });
      await grid.scrollIntoViewIfNeeded();
      await page.waitForTimeout(750);
      const beforeReturn = await page.evaluate(() => ({ workers: window.__deepPerf.rankingWorkers.length, rows: window.__deepPerf.rankingWorkers.reduce((sum, worker) => sum + worker.rows, 0) }));
      await grid.locator('[data-video-card-open]').first().click();
      await page.getByRole('button', { name: 'Close preview', exact: true }).click();
      await page.waitForFunction(() => document.activeElement?.hasAttribute('data-video-card-open'));
      await page.waitForFunction(stable => {
        const count = Number(document.querySelector('[aria-label="YouTube deep discovery"]')?.getAttribute('data-discovery-ranked'));
        return stable ? count === 192 : count > 0;
      }, stableMetadata);
      await page.waitForTimeout(1000);
      const afterReturn = await page.evaluate(() => ({ workers: window.__deepPerf.rankingWorkers.length, rows: window.__deepPerf.rankingWorkers.reduce((sum, worker) => sum + worker.rows, 0), released: window.__deepPerf.rankingWorkers.every(worker => worker.ended !== null) }));
      if (stableMetadata) {
        assert.equal(afterReturn.workers, beforeReturn.workers, 'a quick preview return must reuse finished ranking without constructing another worker');
        assert.equal(afterReturn.rows, beforeReturn.rows, 'a quick preview return must not repack the catalog');
        assert.equal(afterReturn.released, true, 'cached results must not require retaining a hidden ranking worker');
      }
      const nextAfterReturnStarted = Date.now();
      await page.waitForFunction(() => document.querySelector('[aria-label="YouTube deep discovery"]')?.getAttribute('aria-busy') === 'false');
      const beforeMore = Number(await deep.getAttribute('data-discovery-ranked'));
      await deep.getByRole('button', { name: 'Rank 96 more videos', exact: true }).click();
      await page.waitForFunction(expected => Number(document.querySelector('[aria-label="YouTube deep discovery"]')?.getAttribute('data-discovery-ranked')) === expected, beforeMore + 96);
      const nextAfterReturnMs = Date.now() - nextAfterReturnStarted;
      const details = deep.locator('details');
      await details.locator('summary').click();
      await deep.getByRole('heading', { name: /^YouTube · science/ }).waitFor();
      assert.ok(await deep.locator('.media-shelf').count() <= 10);
      await details.locator('summary').click();
      await deep.getByRole('button', { name: 'Newest first · full archive', exact: true }).click();
      const newest = deep.locator('[data-discovery-catalog="newest"]');
      await newest.scrollIntoViewIfNeeded();
      await newest.locator('[data-video-card-open]').first().waitFor();
      assert.ok((await newest.locator('[data-video-card-open]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-video-card-id')))).every(id => +id.split('-').at(-1) < 48000));
      await deep.getByRole('button', { name: 'Ranked discovery', exact: true }).click();
      await grid.scrollIntoViewIfNeeded();
      // Return once more so this mix starts without a worker. A reshuffle must
      // rebuild on demand, return a fresh first batch and retain explicit taste.
      await grid.locator('[data-video-card-open]').first().click();
      await page.getByRole('button', { name: 'Close preview', exact: true }).click();
      await page.getByRole('button', { name: 'Mix it up', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[aria-label="YouTube deep discovery"]')?.getAttribute('data-discovery-ranked') === '96');
      await revealGrid();
      assert.equal((await ids())[0], 'yt:v:qa-discovery-48017');
      await deep.evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      await page.screenshot({ path: output.replace('.json', `-${viewport.name}.png`) });
      const formats = page.getByRole('region', { name: 'YouTube video formats', exact: true });
      await formats.getByRole('button', { name: 'Shorts · 4,000', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[aria-label="YouTube deep discovery"]')?.getAttribute('data-discovery-ranked') === '96' && /4,000 eligible/.test(document.querySelector('[aria-label="YouTube deep discovery"]')?.textContent));
      await grid.scrollIntoViewIfNeeded();
      await grid.locator('[data-video-card-open]').first().waitFor();
      assert.ok((await ids()).every(id => { const index = +id.split('-').at(-1); return index >= 48000 && index % 3 === 0; }));
      const ratedId = (await ids())[0], ratedIndex = +ratedId.split('-').at(-1);
      await grid.locator('[data-video-card-open]').first().click();
      await page.getByRole('button', { name: `Rate Science archive ${ratedIndex} 1 stars`, exact: true }).click();
      await page.getByRole('button', { name: 'Close preview', exact: true }).click();
      await page.waitForFunction(() => /3,999 eligible/.test(document.querySelector('[aria-label="YouTube deep discovery"]')?.textContent));
      await revealGrid();
      assert.ok(!(await ids()).includes(ratedId), 'a new dislike must invalidate cached discovery and remove the title');
      const measurements = await page.evaluate(() => ({ peakCards: window.__deepPerf.peakCards, worstMainTaskMs: Math.max(0, ...window.__deepPerf.longTasks), overflow: document.documentElement.scrollWidth > innerWidth,
        rankingWorkers: window.__deepPerf.rankingWorkers.map(row => ({ rows: row.rows, packingMs: row.ready === null ? null : Math.round(row.ready - row.started), scoringMs: row.ready === null || row.result === null ? null : Math.round(row.result - row.ready), completed: row.result !== null })) }));
      assert.equal(measurements.overflow, false); assert.ok(measurements.peakCards <= 120);
      const transferredRows = measurements.rankingWorkers.reduce((sum, worker) => sum + worker.rows, 0);
      assert.ok(transferredRows <= 600_000, `ranking repeatedly repacked the catalog: ${transferredRows.toLocaleString()} rows`);
      assert.ok(gapMs < 250, `scroll frame stall ${gapMs}ms`);
      assert.deepEqual(errors, []);
      results.push({ viewport: viewport.name, firstBatchMs, nextPageMs, previewReturnRepackedRows: afterReturn.rows - beforeReturn.rows, releasedWorkerVerified: afterReturn.released, nextAfterReturnMs, coldMixVerified: true, ratingInvalidationVerified: true, scrollWorstFrameMs: Math.round(gapMs), ...measurements, errors, ok: true });
    } catch (error) {
      console.error(`${viewport.name}: ${error.message}`);
      await page.screenshot({ path: output.replace('.json', `-failure-${viewport.name}.png`) });
      results.push({ viewport: viewport.name, ok: false, error: error.message, errors });
    } finally { await context.close(); }
  }
} finally { await browser.close(); }
const report = { ok: results.every(result => result.ok), stableMetadata, fixture: `60,000 saved YouTube videos, 48,000 from one creator; ${stableMetadata ? 'saved manually locked science tags' : 'automatic tag enrichment'}; real ranking worker; isolated browser storage; artwork/embeds stubbed`, results };
writeFileSync(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.ok ? 0 : 1;
