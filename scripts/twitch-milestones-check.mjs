import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? resolve(root, 'screenshots/twitch-milestones.json'), [resolve(root, 'screenshots')], 'Twitch report');
mkdirSync(dirname(output), { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
const results = [];
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport });
    const artwork = new Set();
    await context.route('https://fixture.invalid/twitch/**', route => { artwork.add(route.request().url()); return route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360"><rect width="640" height="360" fill="#17304a" /></svg>' }); });
    await context.route('https://player.twitch.tv/**', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Synthetic Twitch player</p>' }));
    await context.route('http://127.0.0.1:43123/**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false}' }));
    await context.addInitScript(() => { localStorage.setItem('reelcase.pulls-paused.v1', 'true'); localStorage.setItem('reelcase.artwork-mode', 'images'); });
    const page = await context.newPage(); page.setDefaultTimeout(30_000);
    await page.addInitScript(() => {
      window.__twitchGate = { inputs: [], peakCards: 0 };
      let pending = false;
      const input = event => {
        if (pending || document.visibilityState !== 'visible') return;
        pending = true; const at = performance.now();
        const action = event.target?.getAttribute?.('aria-label') || event.target?.textContent?.trim().slice(0, 70) || event.type;
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const samples = window.__twitchGate.inputs;
          samples.push({ ms: performance.now() - at, action }); if (samples.length > 64) samples.shift(); pending = false;
        }));
      };
      for (const event of ['click', 'input', 'keydown']) document.addEventListener(event, input, { capture: true, passive: true });
      document.addEventListener('DOMContentLoaded', () => {
        const sample = () => { window.__twitchGate.peakCards = Math.max(window.__twitchGate.peakCards, document.querySelectorAll('[data-video-card-open]').length); };
        new MutationObserver(sample).observe(document.body, { childList: true, subtree: true }); sample();
      }, { once: true });
    });
    const errors = [], result = { viewport: viewport.name, errors };
    page.on('pageerror', error => errors.push(error.message)); page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' }); await page.locator('[data-home-ready="true"]').waitFor();
      await page.waitForFunction(async () => (await indexedDB.databases()).some(db => db.name === 'reelcase'));
      result.storageBeforeBytes = await page.evaluate(async () => (await navigator.storage.estimate()).usage ?? null);
      await page.evaluate(async () => {
        const now = Date.now();
        const follows = Array.from({ length: 240 }, (_, index) => ({ id: `tw:qa-${index}`, kind: 'twitch', handle: `qa-${index}`, title: `Checkpoint creator ${String(index).padStart(3, '0')}`,
          ...(index === 0 ? { twitchArchiveRetry: { attempts: 2, retryAt: now + 300000 }, lastProviderFailure: { kind: 'integrity-challenge', at: now, message: 'Provider integrity challenge', recovery: 'Accepted pages are saved; retry this creator later.', retryAt: now + 300000 } } : {}),
          twitchArchiveCursor: JSON.stringify({ v: 1, stage: 'HIGHLIGHT', after: 'correct-position' }), twitchClipCursor: JSON.stringify({ v: 1, after: 'correct-clips' }), twitchArchiveLastVideoId: '12345',
          twitchArchiveDiagnostics: { at: now, pages: 2, received: 200, accepted: 183, duplicates: 17, resumed: true, stage: 'ARCHIVE', stopReason: index % 2 ? 'entry-budget' : 'challenge', error: index % 2 ? undefined : 'Provider integrity challenge; accepted pages retained' } }));
        localStorage.setItem('reelcase.follows.v1', JSON.stringify({ channels: follows, savedAt: now }));
        const db = await new Promise((resolve, reject) => { const req = indexedDB.open('reelcase'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
        try {
          await new Promise((resolve, reject) => {
            const tx = db.transaction('activity', 'readwrite'); tx.objectStore('activity').put({ channels: follows.map(row => ({ ...row, twitchArchiveCursor: JSON.stringify({ v: 1, stage: 'ARCHIVE', after: 'stale-position' }) })), savedAt: now - 10_000 }, 'follows');
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
          });
          for (let offset = 0; offset < 30_000; offset += 512) await new Promise((resolve, reject) => {
            const tx = db.transaction('remote-cache', 'readwrite'), store = tx.objectStore('remote-cache');
            if (!offset) store.put({ folders: [], checkedAt: now }, 'meta');
            for (let i = offset; i < Math.min(30_000, offset + 512); i++) {
              const live = i < 32, clip = !live && i % 10 === 0;
              const id = live ? `tw:qa-${i}:live` : `${clip ? 'tw:c:' : 'tw:v:'}qa-${i}`, creator = i % 240;
              store.put({ id, folderId: `tw:qa-${creator}`, name: live ? `QA live ${i}` : `Checkpoint VOD ${i}`, path: live ? `twitch/qa-${i}/live` : id, extension: live ? 'live' : clip ? 'clip' : 'vod', mime: 'video/twitch', duration: clip ? 60 : 3600, size: 0, addedAt: new Date(2024,3,2,12).getTime() + i * 60_000,
                poster: `https://fixture.invalid/twitch/${live ? 'live' : 'archive'}-${i}.svg`,
                remote: { kind: 'twitch', live, viewers: live ? 1000 - i : undefined, observedAt: live ? i < 20 ? now : now - 20 * 60_000 : undefined, videoId: `qa-${i}`, channelName: `Checkpoint creator ${String(creator).padStart(3, '0')}`, embedUrl: `https://player.twitch.tv/?video=qa-${i}` } }, `video:${id}`);
            }
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
          });
        } finally { db.close(); }
      });
      result.storageAfterBytes = await page.evaluate(async () => (await navigator.storage.estimate()).usage ?? null);
      if (!Number.isFinite(result.storageBeforeBytes) || !Number.isFinite(result.storageAfterBytes) || result.storageAfterBytes <= result.storageBeforeBytes) throw Error('Browser storage growth was not measured');
      result.storageGrowthBytes = result.storageAfterBytes - result.storageBeforeBytes;
      await page.reload({ waitUntil: 'domcontentloaded' }); await page.getByText(/30,000 indexed/).first().waitFor();
      if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      const start = Date.now(); await page.getByRole('button', { name: /^Twitch(?:$|\s)/ }).first().click();
      const live = page.getByRole('list', { name: 'Live now · 20 titles', exact: true }); await live.waitFor();
      result.liveReadyMs = Date.now() - start;
      if (result.liveReadyMs > 2000) throw Error('Live rail exceeded the 2-second ready budget');
      const initialCardTop = await live.locator('[data-video-card-open]').first().evaluate(node => node.getBoundingClientRect().top);
      if (initialCardTop >= viewport.height) throw Error('Live streams were pushed below the first viewport');
      const mountedLive = await live.locator('[data-video-card-open]').evaluateAll(rows => rows.map(row => row.dataset.videoCardId));
      if (!mountedLive.length || mountedLive.some(id => !/^tw:qa-(?:[0-9]|1[0-9]):live$/.test(id)) || mountedLive.length > 12) throw Error('Live rail contains stale/archive cards or exceeds its mount budget');
      result.initialArtworkRequests = artwork.size;
      if (artwork.size > 32) throw Error('Initial live view loaded an unbounded archive artwork set');
      result.liveScreenshot = output.replace(/\.json$/, `-${viewport.name}-live.png`); await page.screenshot({ path: result.liveScreenshot });
      await page.getByRole('button', { name: 'Next Live now videos', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[aria-label="Live now · 20 titles"]').scrollLeft > 10);
      await page.getByRole('button', { name: 'Previous Live now videos', exact: true }).click();
      await page.waitForFunction(() => document.querySelector('[aria-label="Live now · 20 titles"]').scrollLeft < 1);
      result.scrollSettleMs = await live.evaluate(async rail => {
        const before = rail.scrollLeft, at = performance.now();
        rail.scrollLeft = Math.min(rail.scrollWidth - rail.clientWidth, before + 240);
        let previous = -1, stable = 0;
        while (stable < 2 && performance.now() - at < 1000) {
          await new Promise(requestAnimationFrame);
          stable = rail.scrollLeft === previous ? stable + 1 : 0; previous = rail.scrollLeft;
        }
        if (rail.scrollLeft <= before) throw Error('Live rail did not scroll');
        return Math.round(performance.now() - at);
      });
      if (result.scrollSettleMs > 500) throw Error('Live rail exceeded the 500-ms scroll-settle budget');
      result.liveRailVerified = true;
      const coverage = page.locator('details').filter({ has: page.locator('summary').filter({ hasText: 'Archive coverage' }) });
      await coverage.locator('summary').click(); await coverage.getByText('Showing 30 of 240 creators', { exact: true }).waitFor();
      result.coverageReadyMs = Date.now() - start;
      if (await coverage.getByText(/Last deep pull/).count() !== 30) throw Error('Archive diagnostics mounted more than the first 30 creators');
      if (await coverage.getByText(/Invalid Date|12\/31\/1969/).count()) throw Error('Clip-only creator displayed an invalid archive date');
      await coverage.getByText('Archive retry 2 · explicit retry is available below.', { exact: true }).waitFor();
      const controls = coverage.locator('[data-twitch-pull-controls]');
      await controls.getByLabel('Twitch focused VOD budget').selectOption('500');
      await controls.getByLabel('Twitch focused clip budget').selectOption('250');
      await controls.getByRole('button', { name: 'Queue next 8 creators', exact: true }).click();
      const waiting = controls.getByRole('list', { name: 'Waiting Twitch creators', exact: true });
      if (await waiting.getByRole('listitem').count() !== 8) throw Error('Focused queue did not respect its eight-creator budget');
      if (!await controls.getByRole('button', { name: 'Queue next 8 creators', exact: true }).isDisabled()) throw Error('Full queue still accepts bulk jobs');
      await controls.getByLabel('Twitch focused VOD budget').selectOption('2000');
      await controls.getByLabel('Twitch focused clip budget').selectOption('0');
      if (await waiting.getByText(/500 VODs \/ 250 clips/).count() !== 8) throw Error('Changing the budget rewrote waiting jobs');
      await waiting.getByRole('button').first().click();
      if (await waiting.getByRole('listitem').count() !== 7) throw Error('Queued creator was not removed');
      await coverage.locator('[data-twitch-archive-creators]').getByRole('button', { name: 'Retry this creator', exact: true }).first().click();
      if (await waiting.getByRole('listitem').count() !== 8 || !await waiting.getByRole('listitem').filter({ hasText: 'Checkpoint creator 000' }).getByText('2,000 VODs / 0 clips', { exact: true }).count()) throw Error('Focused retry was blocked by the background cooldown');
      await controls.locator('[data-twitch-queue-status]').filter({ hasText: 'Paused · 8 waiting' }).waitFor();
      result.queueScreenshot = output.replace(/\.json$/, `-${viewport.name}-queue.png`); await controls.evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' })); await page.screenshot({ path: result.queueScreenshot });
      await controls.getByRole('button', { name: 'Clear queue', exact: true }).click();
      await waiting.waitFor({ state: 'detached' });
      result.focusedQueueVerified = true;
      await coverage.getByRole('button', { name: 'Show saved position', exact: true }).first().click();
      await coverage.locator('code').filter({ hasText: 'correct-position' }).waitFor();
      if (await coverage.locator('code').filter({ hasText: 'stale-position' }).count()) throw Error('Stale disk snapshot rewound the checkpoint');
      result.checkpointRecoveryVerified = true;
      await coverage.getByRole('button', { name: 'Hide saved position', exact: true }).first().click();
      await coverage.getByRole('button', { name: 'Show 100 more creators', exact: true }).click();
      await coverage.getByText('Showing 130 of 240 creators', { exact: true }).waitFor();
      await coverage.getByRole('button', { name: 'Show fewer creators', exact: true }).click();
      await coverage.getByText('Showing 30 of 240 creators', { exact: true }).waitFor();
      await coverage.locator('summary').click();
      await page.waitForFunction(() => !document.querySelector('details[open] [data-twitch-archive-creators]'));
      if (await coverage.getByText(/Last deep pull/).count()) throw Error('Collapsed archive coverage retained creator cards');
      result.creatorPagingVerified = true;
      result.pullsRemainPaused = await page.evaluate(() => localStorage.getItem('reelcase.pulls-paused.v1') === 'true');
      await page.getByRole('button', { name: 'Search saved Twitch archive', exact: true }).click();
      const search = page.getByRole('region', { name: 'Search saved Twitch archive', exact: true }); await search.waitFor();
      const status = search.getByRole('status');
      await status.filter({ hasText: '29,968 matches · page 1 · 24 shown' }).waitFor();
      await search.getByLabel('Twitch archive creator', { exact: true }).selectOption('tw:qa-239');
      await search.getByLabel('Twitch archive type', { exact: true }).selectOption('vod');
      await status.filter({ hasText: '125 matches · page 1 · 24 shown' }).waitFor();
      // Results below the six phone-width filters deliberately release their
      // cards until scrolled into view. Bring the grid near the viewport first.
      const showResultStart = () => search.locator('[data-virtual-video-grid]').evaluate(node => node.scrollIntoView({ block: 'start', behavior: 'instant' }));
      await showResultStart();
      const first = search.locator('[data-video-card-open]').first(); await first.waitFor();
      const firstId = await first.getAttribute('data-video-card-id');
      await search.getByRole('button', { name: 'Next archive page', exact: true }).click(); await status.filter({ hasText: 'page 2' }).waitFor();
      if (await search.locator(`[data-video-card-id="${firstId}"]`).count()) throw Error('Keyset page repeated the previous page');
      await search.getByRole('button', { name: 'Previous archive page', exact: true }).click(); await status.filter({ hasText: 'page 1' }).waitFor();
      await search.getByLabel('Twitch archive order', { exact: true }).selectOption('oldest'); await status.filter({ hasText: '125 matches' }).waitFor();
      await showResultStart();
      await search.locator('[data-video-card-id="tw:v:qa-239"]').waitFor();
      await search.getByLabel('Twitch archive type', { exact: true }).selectOption('clip'); await status.filter({ hasText: '0 matches' }).waitFor();
      await search.getByRole('button', { name: 'Reset archive filters', exact: true }).click(); await status.filter({ hasText: '29,968 matches' }).waitFor();
      const title = search.getByLabel('Twitch archive title', { exact: true }); await title.fill('Checkpoint VOD 29998'); await title.fill('Checkpoint VOD 29999');
      await status.filter({ hasText: '1 matches · page 1 · 1 shown' }).waitFor();
      await showResultStart();
      const selected = search.locator('[data-video-card-id="tw:v:qa-29999"]'); await selected.click();
      await page.getByRole('button', { name: 'Close preview', exact: true }).click();
      await selected.waitFor();
      if (!(await selected.evaluate(node => node === document.activeElement))) throw Error('Preview return lost archive-card focus');
      await search.getByRole('button', { name: 'Reset archive filters', exact: true }).click();
      await search.getByLabel('Twitch archive creator', { exact: true }).selectOption('tw:qa-239');
      await search.getByLabel('Twitch archive start date', { exact: true }).fill('2024-04-23'); await search.getByLabel('Twitch archive end date', { exact: true }).fill('2024-04-22');
      await status.filter({ hasText: 'Choose a valid date range' }).waitFor();
      await search.getByLabel('Twitch archive start date', { exact: true }).fill('2024-04-22');
      await status.filter({ hasText: '6 matches · page 1 · 6 shown' }).waitFor();
      result.archiveSearchVerified = true;
      await search.getByRole('heading', { name: 'Search saved archive', exact: true }).scrollIntoViewIfNeeded();
      result.screenshot = output.replace(/\.json$/, `-${viewport.name}.png`); await page.screenshot({ path: result.screenshot });
      result.overflowPixels = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth));
      await search.getByRole('button', { name: 'Close archive search', exact: true }).click(); await search.waitFor({ state: 'detached' });
      result.archiveReleaseVerified = true;
      const measurements = await page.evaluate(() => ({ inputPaintMs: Math.round(Math.max(...window.__twitchGate.inputs.map(row => row.ms))), slowestInputs: [...window.__twitchGate.inputs].sort((a,b) => b.ms-a.ms).slice(0,5), peakMountedCards: window.__twitchGate.peakCards }));
      Object.assign(result, measurements);
      if (!Number.isFinite(result.inputPaintMs) || result.inputPaintMs > 200 || !result.peakMountedCards || result.peakMountedCards > 256) throw Error('Twitch input-paint or mounted-card budget exceeded');
      result.ok = !errors.length && result.overflowPixels === 0 && result.checkpointRecoveryVerified && result.creatorPagingVerified && result.pullsRemainPaused && result.liveRailVerified && result.archiveSearchVerified && result.archiveReleaseVerified && result.focusedQueueVerified;
    } catch (error) { errors.push(error.message); result.ok = false; console.error(JSON.stringify({ viewport: viewport.name, error: error.message, body: (await page.locator('body').innerText()).slice(0, 1200) })); }
    results.push(result); await context.close();
  }
} finally { await browser.close(); }
const report = { ok: results.every(row => row.ok), url, fixture: '30,000 Twitch entries including clips and fresh/stale live states, 240 creators, paused pulling, fixture artwork/player, isolated contexts; stale IDB and fresh localStorage checkpoint mirrors', limitation: 'Provider challenges, streams and artwork are fixtures. Real-provider throughput, native playback and device soak are separate checks.', results };
writeFileSync(output, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); process.exitCode = report.ok ? 0 : 1;
