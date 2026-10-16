import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';

const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? 'screenshots/artwork-viewer-dev.json', [resolve('screenshots')]);
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
const results = [];
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    let holding = true, starts = 0, cancelled = 0, fallbackStarts = 0;
    const pending = new Map();
    await context.route('http://127.0.0.1:43123/**', route => route.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false}' }));
    await context.route('https://www.youtube.com/embed/qa-*', route => route.fulfill({ contentType: 'text/html', body: '<p>Artwork admission fixture player</p>' }));
    await context.route('https://i.ytimg.com/vi/qa-*/**', async route => {
      const request = route.request(); starts++;
      if (!request.url().endsWith('/maxresdefault.jpg')) fallbackStarts++;
      if (holding) await new Promise(resolve => pending.set(request, resolve));
      pending.delete(request);
      if (request.failure()) return;
      await route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#ad844c"/></svg>' });
    });
    context.on('requestfailed', request => {
      if (!request.url().includes('i.ytimg.com/vi/qa-')) return;
      cancelled++; pending.get(request)?.(); pending.delete(request);
    });
    await context.addInitScript(() => {
      localStorage.setItem('reelcase.pulls-paused.v1', 'true');
      localStorage.removeItem('reelcase.artwork-mode');
    });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.waitForFunction(async () => (await indexedDB.databases()).some(db => db.name === 'reelcase'));
      console.log(`${viewport.name}: seed 60k entries and hold unfinished artwork`);
      await page.evaluate(async () => {
        localStorage.setItem('reelcase.follows.v1', JSON.stringify({ channels: Array.from({ length: 120 }, (_, i) => ({ id: `yt:creator-${i}`, kind: 'youtube', title: `Creator ${i}`, handle: `creator-${i}` })), savedAt: Date.now() }));
        const db = await new Promise((resolve, reject) => { const req = indexedDB.open('reelcase'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
        try {
          for (let offset = 0; offset < 60_000; offset += 512) await new Promise((resolve, reject) => {
            const tx = db.transaction('remote-cache', 'readwrite'), store = tx.objectStore('remote-cache');
            if (!offset) store.put({ folders: [], checkedAt: Date.now() }, 'meta');
            for (let i = offset; i < Math.min(offset + 512, 60_000); i++) {
              const videoId = `qa-${String(i).padStart(8, '0')}`, id = `yt:v:${videoId}`;
              store.put({ id, folderId: `yt:creator-${i % 120}`, name: `Artwork archive ${i}`, path: id, extension: 'yt', mime: 'video/youtube', size: 0,
                addedAt: Date.now() - i * 60_000, poster: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
                remote: { kind: 'youtube', videoId, channelId: `creator-${i % 120}`, channelName: `Creator ${i % 120}`, youtubeType: 'upload', publishedSource: 'rss', embedUrl: `https://www.youtube.com/embed/${videoId}` } }, `video:${id}`);
            }
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
          });
        } finally { db.close(); }
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.getByText(/60,000 indexed/).first().waitFor({ timeout: 45000 });
      if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      await page.getByRole('button', { name: /^YouTube(?:\s|$)/ }).first().click();
      const card = page.locator('[data-video-card-open]').first();
      await card.waitFor();
      await card.scrollIntoViewIfNeeded();
      const waitLoading = () => page.waitForFunction(() => [...document.querySelectorAll('[data-video-card] img')].some(image => !image.complete));
      const waitWithdrawn = () => page.waitForFunction(() => [...document.querySelectorAll('[data-video-card] img')].every(image => image.complete));
      console.log(`${viewport.name}: wait for loading cards`);
      await waitLoading();
      // Control visibility deterministically in headless Chromium, then use
      // real lifecycle events and assert the card DOM follows both gates.
      await page.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await waitWithdrawn();
      console.log(`${viewport.name}: pagehide withdraws loading cards`);
      await page.evaluate(() => window.dispatchEvent(new Event('pagehide')));
      await waitWithdrawn();
      await page.evaluate(() => {
        delete document.visibilityState;
        document.dispatchEvent(new Event('visibilitychange'));
      });
      await waitWithdrawn();
      console.log(`${viewport.name}: pageshow resumes loading cards`);
      await page.evaluate(() => window.dispatchEvent(new Event('pageshow')));
      await waitLoading();
      console.log(`${viewport.name}: preview and player must withdraw unfinished card images`);
      const previewStarted = Date.now();
      await card.click();
      await page.getByRole('button', { name: 'Close preview', exact: true }).waitFor();
      const previewReadyMs = Date.now() - previewStarted;
      await waitWithdrawn();
      await page.getByRole('button', { name: 'Watch now', exact: true }).click();
      await page.getByRole('button', { name: 'Close', exact: true }).waitFor();
      await waitWithdrawn();
      await page.screenshot({ path: output.replace('.json', `-player-${viewport.name}.png`) });
      await page.getByRole('button', { name: 'Close', exact: true }).click();
      await waitLoading();
      // Repeated interruptions must not consume URLs or strand subscriptions.
      for (let cycle = 0; cycle < 3; cycle++) {
        await card.click();
        await page.getByRole('button', { name: 'Close preview', exact: true }).waitFor();
        await waitWithdrawn();
        await page.getByRole('button', { name: 'Close preview', exact: true }).click();
        await waitLoading();
      }
      holding = false;
      for (const resolve of pending.values()) resolve();
      pending.clear();
      await page.waitForFunction(() => [...document.querySelectorAll('[data-video-card] img')].some(image => image.complete && image.naturalWidth >= 300));
      const readyImages = await page.locator('[data-video-card] img').evaluateAll(images => images.filter(image => image.complete && image.naturalWidth >= 300).length);
      // A painted image stays present when a viewer opens; only unfinished
      // candidates lose admission. This prevents a flash on preview return.
      await card.click();
      await page.getByRole('button', { name: 'Close preview', exact: true }).waitFor();
      assert.ok(await page.locator('[data-video-card] img').evaluateAll(images => images.some(image => image.complete && image.naturalWidth >= 300)));
      await page.getByRole('button', { name: 'Close preview', exact: true }).click();
      // A real second tab changes Settings; the existing mounted cards must
      // receive the native storage event without a reload or navigation.
      console.log(`${viewport.name}: live artwork preferences across tabs`);
      const settingsPage = await context.newPage();
      await settingsPage.goto(url, { waitUntil: 'domcontentloaded' });
      await settingsPage.locator('[data-home-ready="true"]').waitFor();
      if (viewport.name === 'mobile') await settingsPage.getByRole('button', { name: 'Open menu', exact: true }).click();
      const tools = settingsPage.getByRole('button', { name: 'Tools', exact: true });
      if (await tools.getAttribute('aria-expanded') === 'false') await tools.click();
      await settingsPage.getByRole('button', { name: /^Settings(?:\s|$)/ }).first().click();
      await settingsPage.getByRole('button', { name: 'Use text-first provider rows', exact: true }).click();
      await page.bringToFront();
      await page.waitForFunction(() => document.documentElement.dataset.artworkMode === 'text' && document.querySelectorAll('[data-video-card]').length > 0 && document.querySelectorAll('[data-video-card] img').length === 0);
      await card.waitFor();
      await page.screenshot({ path: output.replace('.json', `-text-${viewport.name}.png`) });
      await settingsPage.bringToFront();
      await settingsPage.getByRole('button', { name: 'Text-first provider rows on', exact: true }).click();
      await page.bringToFront();
      await page.waitForFunction(() => document.documentElement.dataset.artworkMode === 'images' && [...document.querySelectorAll('[data-video-card] img')].some(image => image.complete && image.naturalWidth >= 300));
      await settingsPage.close();
      // Finish the opacity transition before capturing the restored artwork.
      await page.waitForTimeout(200);
      await page.screenshot({ path: output.replace('.json', `-${viewport.name}.png`) });
      assert.ok(previewReadyMs <= 2000); assert.equal(fallbackStarts, 0, 'pause must not blacklist or exhaust a healthy candidate');
      assert.deepEqual(errors, []);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      results.push({ viewport: viewport.name, ok: true, previewReadyMs, starts, cancelled, fallbackStarts, readyImages, liveArtworkPreferencesVerified: true, errors });
    } catch (error) {
      results.push({ viewport: viewport.name, ok: false, error: error.message, starts, cancelled, fallbackStarts,
        images: await page.locator('[data-video-card] img').evaluateAll(images => images.map(image => ({ src: image.src, complete: image.complete, width: image.naturalWidth }))), errors });
      await page.screenshot({ path: output.replace('.json', `-failure-${viewport.name}.png`) });
    } finally {
      holding = false; for (const resolve of pending.values()) resolve(); pending.clear(); await context.close();
    }
  }
} finally { await browser.close(); }
const report = { ok: results.every(result => result.ok), fixture: '60k YouTube entries, intentionally held CDN responses, paused pulling, isolated desktop/mobile contexts; synthetic embeds and offline Companion', results };
writeFileSync(output, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); process.exitCode = report.ok ? 0 : 1;
