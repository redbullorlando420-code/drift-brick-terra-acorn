#!/usr/bin/env node
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
import { PERFORMANCE_BUDGETS, performanceReleaseVerdict } from './performance-release-verdict.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? resolve(root, 'screenshots/performance-release.json'), [resolve(root, 'screenshots')], 'performance report');
const denseActivity = process.argv.includes('--dense-activity');
const searchStats = process.argv.includes('--search-stats');
const denseSaved = process.argv.includes('--dense-saved');
const recoveryUi = process.argv.includes('--recovery-ui');
const idleRecovery = process.argv.includes('--idle-recovery');
const cardControls = process.argv.includes('--card-controls');
const topicsUi = process.argv.includes('--topics-ui');
const twitchUi = process.argv.includes('--twitch-ui');
const twitchDiscovery = process.argv.includes('--twitch-discovery');
const savedReload = process.argv.includes('--saved-reload');
const landingUi = process.argv.includes('--landing-ui');
const guideUi = process.argv.includes('--guide-ui');
const youtubeCleanupUi = process.argv.includes('--youtube-cleanup-ui');
const recoveryLinksUi = process.argv.includes('--recovery-links-ui');
if (topicsUi && !searchStats) throw new Error('--topics-ui requires --search-stats for saved topic fixtures');
if (twitchUi && (!searchStats || !denseSaved)) throw new Error('--twitch-ui requires --search-stats --dense-saved');
if (twitchDiscovery && !twitchUi) throw new Error('--twitch-discovery requires --twitch-ui');
if (savedReload && (!searchStats || !denseSaved)) throw new Error('--saved-reload requires --search-stats --dense-saved');
if (landingUi && (!searchStats || !denseSaved)) throw new Error('--landing-ui requires --search-stats --dense-saved');
if (guideUi && (!searchStats || !denseSaved)) throw new Error('--guide-ui requires --search-stats --dense-saved');
if (youtubeCleanupUi && (!searchStats || !denseSaved)) throw new Error('--youtube-cleanup-ui requires --search-stats --dense-saved');
if (recoveryLinksUi && !denseSaved) throw new Error('--recovery-links-ui requires --dense-saved');
mkdirSync(dirname(output), { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
const results = [];
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    // A new context cannot read or write the person's active browser library.
    const context = await browser.newContext({ viewport, acceptDownloads: true });
    // Synthetic IDs cannot play real media. Keep their artwork/player and the
    // optional offline Companion deterministic without suppressing app errors.
    await context.route('http://127.0.0.1:43123/**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false}' }));
    await context.route('https://www.youtube.com/embed/qa-*', route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Synthetic preview</p>' }));
    await context.route('https://i.ytimg.com/vi/qa-*/**', route => route.fulfill({ status: 200, contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" />' }));
    await context.addInitScript(() => {
      localStorage.setItem('reelcase.pulls-paused.v1', 'true');
      localStorage.setItem('reelcase.artwork-mode', 'text');
      localStorage.setItem('reelcase.debug-panel', 'true');
      window.__performanceGate = { inputs: [], inputEvents: [], slowEvents: [], worstInputMs: 0, worstInput: null, peakCards: 0, homeReadyMs: null };
      window.__featureWorkers = [];
      window.__gateClicks = [];
      for (const kind of ['pointerdown', 'pointerup', 'click']) document.addEventListener(kind, event => {
        const button = event.target?.closest('button');
        if (!button) return;
        window.__gateClicks.push({ kind, action: button.getAttribute('aria-label') || button.textContent?.trim(),
          x: event.clientX, y: event.clientY, at: performance.now() });
        if (window.__gateClicks.length > 48) window.__gateClicks.shift();
      }, true);
      const NativeWorker = window.Worker;
      window.Worker = class extends NativeWorker {
        constructor(url, options) { super(url, options); this.record = { url: String(url), rows: 0, batches: 0, maximumBatch: 0, dead: false }; window.__featureWorkers.push(this.record); }
        postMessage(packet, ...args) {
          this.record.rows += packet.batch?.length ?? (packet.field === 'videos' ? packet.rows?.length ?? 0 : 0);
          if (packet.type === 'batch') { this.record.batches++; this.record.maximumBatch = Math.max(this.record.maximumBatch, packet.batch.length); }
          return super.postMessage(packet,...args);
        }
        terminate() { this.record.dead = true; return super.terminate(); }
      };
      let pending = false;
      const measureInput = event => {
        if (pending) return;
        pending = true; const at = performance.now();
        const button = event.target?.closest('button');
        const action = (button?.getAttribute('aria-label') || button?.textContent?.trim() || event.type).slice(0, 80);
        requestAnimationFrame(() => requestAnimationFrame(() => {
          const samples = window.__performanceGate.inputs;
          const ms = performance.now() - at;
          if (ms > window.__performanceGate.worstInputMs) {
            window.__performanceGate.worstInputMs = ms;
            window.__performanceGate.worstInput = { action, ms };
          }
          if (ms > 100) {
            const slow = window.__performanceGate.slowEvents;
            slow.push({ action, ms }); if (slow.length > 64) slow.shift();
          }
          samples.push(ms); if (samples.length > 32) samples.shift();
          const events = window.__performanceGate.inputEvents; events.push({ action, ms }); if (events.length > 32) events.shift(); pending = false;
        }));
      };
      document.addEventListener('pointerdown', measureInput, true);
      document.addEventListener('input', measureInput, true);
      let observer;
      document.addEventListener('DOMContentLoaded', () => {
        const sample = () => {
          const state = window.__performanceGate;
          state.peakCards = Math.max(state.peakCards, document.querySelectorAll('[data-video-card]').length);
          if (state.homeReadyMs === null && document.querySelector('[data-home-ready="true"]')) state.homeReadyMs = performance.now();
        };
        observer = new MutationObserver(sample);
        observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-home-ready'] });
        // Cached production hydration can finish before DOMContentLoaded. Read
        // the current DOM as well as future mutations so that readiness is not
        // silently missed on the fastest load.
        sample();
      }, { once: true });
    });
    const page = await context.newPage();
    const documentNavigations = [], devMessages = [];
    page.on('framenavigated', frame => {
      if (frame === page.mainFrame()) { documentNavigations.push({ url: frame.url(), at: Date.now() }); if (documentNavigations.length > 16) documentNavigations.shift(); }
    });
    page.on('console', message => {
      if (/\[vite\]|reload|outdated/i.test(message.text())) { devMessages.push(message.text().slice(0, 200)); if (devMessages.length > 32) devMessages.shift(); }
    });
    page.setDefaultTimeout(20_000);
    const progress = stage => console.log(JSON.stringify({ viewport: viewport.name, stage }));
    const errors = [];
    const record = text => { if (errors.length < 30) errors.push(text); };
    page.on('pageerror', error => record(error.message));
    page.on('console', message => { if (message.type() === 'error') record(message.text()); });
    const result = { viewport: viewport.name, errors };
    try {
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.locator('[data-home-ready="true"]').waitFor();
      progress('seed');
      // Wait for the first hydration to create IndexedDB, then seed compact rows
      // in small transactions. The seed is preparation, outside measured load.
      await page.waitForFunction(async () => (await indexedDB.databases()).some(db => db.name === 'reelcase'));
      await Promise.race([page.evaluate(async ({ denseActivity, searchStats, denseSaved, recoveryUi, topicsUi, twitchDiscovery, recoveryLinksUi }) => {
        const follows = ['youtube', 'twitch'].flatMap(kind => Array.from({ length: 180 }, (_, index) => ({ id: `${kind === 'youtube' ? 'yt' : 'tw'}:qa-${index}`, kind, handle: `qa-${index}`, title: `Gate creator ${index}` })));
        localStorage.setItem('reelcase.follows.v1', JSON.stringify({ channels: follows, savedAt: Date.now() }));
        const db = await new Promise((resolve, reject) => { const req = indexedDB.open('reelcase'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
        try {
          for (let offset = 0; offset < 80_000; offset += 512) {
            await new Promise((resolve, reject) => {
              const tx = db.transaction(searchStats ? ['remote-cache', 'activity'] : 'remote-cache', 'readwrite'), store = tx.objectStore('remote-cache');
              if (offset === 0) store.put({ folders: [], checkedAt: Date.now() }, 'meta');
              for (let index = offset; index < Math.min(80_000, offset + 512); index++) {
                const kind = index < 50_000 ? 'youtube' : 'twitch', prefix = kind === 'youtube' ? 'yt' : 'tw', id = `${prefix}:v:qa-${index}`;
                const providerId = `qa-${String(index).padStart(8, '0')}`;
                const youtubeType = index < 4 ? 'live' : index < 6 ? 'upcoming' : index < 106 ? 'short' : index < 206 ? 'replay' : 'upload';
                const publishedSource = index < 106 || index >= 40_000 && index < 45_000 ? 'unknown' : index < 206 ? 'provider' : 'rss';
                const twitchClip = twitchDiscovery && kind === 'twitch' && index >= 77_000 && index % 3 === 0;
                if (searchStats) tx.objectStore('activity').put({ id, tags: topicsUi && index % 10 === 0 ? ['science', 'technology'] : ['science'], provenance: { tags: { science: 'manual' }, lockedFields: ['tags'], updatedAt: Date.now() } }, `metadata-enrichment:${id}`);
                store.put({ id, folderId: `${prefix}:qa-${index % 180}`, name: `Gate archive ${index}`, path: `${prefix}/Gate archive ${index}`, extension: twitchClip ? 'clip' : prefix, mime: `video/${kind}`, size: 0, duration: twitchClip ? 60 : 420, addedAt: kind === 'youtube' && publishedSource === 'unknown' ? 0 : Date.now() - index * 60_000,
                  ...(topicsUi ? { genre: `Gate category ${index % 1000}` } : {}),
                  remote: { kind, channelName: searchStats && kind === 'twitch' && index < 77_000 ? 'Dominant Twitch creator' : `Gate creator ${index % 180}`, videoId: providerId, watchUrl: `https://www.youtube.com/watch?v=${providerId}`, embedUrl: `https://www.youtube.com/embed/${providerId}`,
                    ...(kind === 'youtube' ? { youtubeType, publishedSource, ...(index < 4 ? { live: true, observedAt: Date.now() - (index < 2 ? 0 : 86_400_000) } : {}) }
                      : twitchDiscovery && index === 79_999 ? { live: true, viewers: 20, observedAt: Date.now() } : {}) } }, `video:${id}`);
              }
              tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); tx.onabort = () => reject(tx.error);
            });
          }
          if (denseActivity || denseSaved) await new Promise((resolve, reject) => {
            const tx = db.transaction('activity', 'readwrite');
            const progress = {}, resumeProgress = {}, viewCounts = {}, cameCounts = {}, history = [], favorites = [], likes = [];
            const at = Date.now() - 60_000;
            for (let index = 0; index < 60_000; index++) {
              const id = `${index < 50_000 ? 'yt' : 'tw'}:v:qa-${index}`;
              const mark = { t: 25, d: 420, at };
              progress[id] = mark; resumeProgress[`id:${id}`] = mark;
              // Playback bounds its in-memory event history to 2,000 rows.
              // Durable URL aliases must still cover the complete watched set.
              if (recoveryLinksUi) resumeProgress[`https://www.youtube.com/watch?v=qa-${String(index).padStart(8,'0')}`] = mark;
              viewCounts[id] = 3; cameCounts[id] = 1;
              if (denseSaved) {
                (index % 2 ? favorites : likes).push(id);
                history.push({ id, at: at - index, source: "open", title: `Gate archive ${index}`, position: 25, duration: 420,
                  ...(recoveryLinksUi ? { url: `https://www.youtube.com/watch?v=qa-${String(index).padStart(8,'0')}` } : {}) });
              }
            }
            if (denseSaved && recoveryUi) history.unshift({ id: 'yt:evicted-history', title: 'Recovered history link', url: 'https://www.youtube.com/watch?v=qa-99999999', at: at + 1, source: 'open' });
            tx.objectStore('activity').put({ history, progress, resumeProgress, viewCounts, cameCounts, savedAt: at }, 'primary');
            if (denseSaved) tx.objectStore('activity').put({ favorites, likes, savedAt: at }, 'shelves');
            tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
          });
        } finally { db.close(); }
      }, { denseActivity, searchStats, denseSaved, recoveryUi, topicsUi, twitchDiscovery, recoveryLinksUi }), new Promise((_, reject) => { const timer = setTimeout(() => reject(new Error('Fixture preparation exceeded 120 seconds')), 120_000); timer.unref(); })]);
      progress('reload');
      errors.length = 0;
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.locator('[data-home-ready="true"]').waitFor({ timeout: 15_000 });
      result.startupMs = await page.evaluate(() => window.__performanceGate.homeReadyMs);
      await page.getByText(/80,000 indexed/).first().waitFor({ timeout: 30_000 });
      result.catalogEntries = 80_000;
      progress('browse');
      const navigate = async name => {
        if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
        if (name === 'Settings' || name === 'Stats' || name === 'AI guide') {
          const tools = page.getByRole('button', { name: 'Tools', exact: true });
          if (await tools.getAttribute('aria-expanded') === 'false') await tools.click();
        }
        await page.getByRole('button', { name: new RegExp(`^${name}(?:$|\\s)`) }).first().click();
      };
      await page.evaluate(() => { window.__performanceGate.navigationAt = performance.now(); });
      await navigate('YouTube');
      await page.locator('[data-video-card-open]').first().waitFor({ timeout: 30_000 });
      result.navigationMs = await page.evaluate(() => performance.now() - window.__performanceGate.navigationAt);
      progress('preview and search');
      result.scrollSettleMs = await page.evaluate(async () => {
        const main = document.querySelector('main');
        const target = [main, document.scrollingElement].find(node => node && node.scrollHeight > node.clientHeight + 200);
        if (!target) return null;
        const before = target.scrollTop, at = performance.now(); target.scrollTop = Math.min(target.scrollHeight - target.clientHeight, before + 600);
        let last = -1, stable = 0;
        while (performance.now() - at < 2000) {
          await new Promise(requestAnimationFrame);
          const next = target.scrollTop;
          stable = next === last ? stable + 1 : 0; last = next;
          if (next !== before && stable >= 2) return performance.now() - at;
        }
        return null;
      });
      await page.locator('[data-video-card-open]').first().click();
      await page.getByRole('button', { name: 'Close preview', exact: true }).waitFor();
      if (denseActivity) {
        progress('dense watch activity and player');
        const at = Date.now();
        // Real provider-preview heartbeats update resume after eight seconds.
        // Observe its bounded emergency mirror, not a repeated 60k IDB read.
        await page.waitForFunction(at => {
          const saved = JSON.parse(localStorage.getItem('reelcase.resume.v1') ?? '{}');
          return Object.values(saved.resumeProgress ?? {}).some(mark => mark.at >= at && mark.t >= 8);
        }, at, { polling: 250, timeout: 25000 });
        const playerAt = Date.now();
        await page.getByRole('button', { name: 'Watch now', exact: true }).click();
        await page.getByRole('button', { name: 'Close', exact: true }).waitFor();
        result.playerReadyMs = Date.now() - playerAt;
        assertPlayerBudget(result.playerReadyMs);
        await page.getByRole('dialog').locator('iframe').first().waitFor();
        await page.screenshot({ path: output.replace(/\.json$/, `-player-${viewport.name}.png`) });
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        result.denseActivityVerified = true;
      } else {
      await page.getByRole('button', { name: 'Close preview', exact: true }).click();
      }
      const search = page.getByPlaceholder('Search your entire media desk…');
      await page.getByRole('button', { name: 'Open search', exact: true }).click();
      const coldSearchAt = Date.now();
      await search.fill('Gate archive 49999');
      await page.getByText('1 ranked results', { exact: true }).waitFor({ timeout: 45_000 });
      if (searchStats) {
        result.coldSearchMs = Date.now() - coldSearchAt;
        await search.press('Enter');
        const workerRows = await page.evaluate(() => window.__featureWorkers.filter(row => row.url.includes('search.worker')).reduce((sum,row) => sum + row.rows,0));
        await page.getByRole('button', { name: 'Clear search', exact: true }).click();
        await page.getByRole('button', { name: 'Open search', exact: true }).click();
        const warmAt = Date.now(); await search.fill('Gate archive 49998');
        await page.getByText('1 ranked results', { exact: true }).waitFor();
        result.warmSearchMs = Date.now()-warmAt;
        await search.press('Enter');
        await page.getByText('Gate archive 49998', { exact: true }).first().waitFor();
        result.reusedSearchIndex = workerRows > 0 && workerRows === await page.evaluate(() => window.__featureWorkers.filter(row => row.url.includes('search.worker')).reduce((sum,row) => sum + row.rows,0));
        result.searchTransfer = await page.evaluate(() => window.__featureWorkers.filter(row => row.url.includes('search.worker')).reduce((sum,row) => ({ rows: sum.rows + row.rows, batches: sum.batches + row.batches, maximumBatch: Math.max(sum.maximumBatch,row.maximumBatch) }), { rows: 0, batches: 0, maximumBatch: 0 }));
        if (result.searchTransfer.rows !== 80_000 || result.searchTransfer.maximumBatch > 512 || result.searchTransfer.batches >= Math.ceil(80_000 / 128)) throw Error('Search transfer completeness, batching or backpressure budget failed');
        if (!result.reusedSearchIndex || result.warmSearchMs > 1500 || result.coldSearchMs > 8000) throw Error('Search index reuse or latency budget failed');
        result.searchScreenshot = output.replace(/\.json$/, `-search-${viewport.name}.png`); await page.screenshot({ path: result.searchScreenshot });
      }
      await page.getByRole('button', { name: 'Clear search', exact: true }).click();
      await page.locator('[data-video-card]').first().waitFor();
      result.artworkIdleVerified = await page.locator('[data-video-card] img').count() === 0 && await page.locator('[data-video-card] .animate-spin').count() === 0 && !/Pulling YouTube/.test(await page.locator('body').innerText());
      progress('YouTube formats');
      const formats = page.getByRole('region', { name: 'YouTube video formats', exact: true });
      const selectFormat = async label => {
        await formats.getByRole('button', { name: label, exact: true }).click();
        await page.waitForFunction(() => document.querySelector('[aria-label="YouTube video formats"]')?.getAttribute('aria-busy') === 'false');
        if (await formats.getByRole('button', { name: label, exact: true }).getAttribute('aria-pressed') !== 'true') throw new Error('Format selection did not settle');
      };
      await formats.scrollIntoViewIfNeeded();
      await formats.getByRole('button', { name: 'All saved videos · 49,994', exact: true }).waitFor();
      const liveRail = page.getByRole('list', { name: 'Live now · 2 titles', exact: true });
      await liveRail.scrollIntoViewIfNeeded();
      await liveRail.getByText('Gate archive 0', { exact: true }).waitFor();
      await liveRail.getByText('Gate archive 1', { exact: true }).waitFor();
      if (await liveRail.getByText(/Gate archive [23]$/).count()) throw new Error('Stale live state entered the confirmed live rail');
      const upcoming = page.getByRole('list', { name: 'Upcoming YouTube events · 2 titles', exact: true });
      await upcoming.scrollIntoViewIfNeeded();
      await upcoming.getByText('Gate archive 4', { exact: true }).waitFor();
      await upcoming.getByText('Gate archive 5', { exact: true }).waitFor();
      const mix = page.getByRole('list', { name: /^Mixed from your creators/ });
      const verifyMix = async (low, high) => {
        await mix.scrollIntoViewIfNeeded();
        await mix.locator('[data-video-card-open]').first().waitFor();
        const names = await mix.locator('[data-video-card-open]').evaluateAll(nodes => nodes.map(node => node.getAttribute('data-video-card-id')));
        if (!names.length || names.some(name => { const id = Number(name?.match(/qa-(\d+)$/)?.[1]); return !Number.isFinite(id) || id < low || id >= high; })) throw new Error('A format shelf includes a different format');
      };
      await selectFormat('Shorts · 100');
      await verifyMix(6, 106);
      await mix.getByText(/Publication date unknown/).first().waitFor();
      const previewId = await mix.locator('[data-video-card-open]').first().getAttribute('data-video-card-id');
      if (cardControls) {
        progress('live card field updates');
        const card = mix.locator('[data-video-card]').filter({ has: page.locator(`[data-video-card-id="${previewId}"]`) }).first();
        for (const [off, on] of [['Add to favorites', 'Remove from favorites'], ['Like', 'Remove like']]) {
          const initial = await card.getByRole('button', { name: on, exact: true }).count() ? on : off;
          const changed = initial === on ? off : on;
          await card.getByRole('button', { name: initial, exact: true }).first().click();
          await card.getByRole('button', { name: changed, exact: true }).first().waitFor();
          await card.getByRole('button', { name: changed, exact: true }).first().click();
          await card.getByRole('button', { name: initial, exact: true }).first().waitFor();
        }
        const rate = card.getByRole('button', { name: /^Rate .* 4 stars$/ });
        await rate.hover();
        const clearMetadata = await card.evaluate(row => {
          const artwork = row.querySelector('[data-video-card-artwork]').getBoundingClientRect();
          const details = row.querySelector('[data-video-card-details]').getBoundingClientRect();
          const actions = row.querySelector('[data-video-card-quick-actions]').getBoundingClientRect();
          return actions.bottom <= artwork.bottom + 1 && actions.bottom < details.top;
        });
        if (!clearMetadata) throw Error('Card quick actions overlap its title metadata');
        result.cardActionsLayoutVerified = true;
        await rate.click();
        await page.waitForFunction(id => {
          const rows = [...document.querySelectorAll('[data-video-card]')].filter(row => row.querySelector('[data-video-card-open]')?.getAttribute('data-video-card-id') === id);
          return rows.length > 0 && rows.every(row => row.querySelector('[aria-label$=" 4 stars"]')?.getAttribute('aria-pressed') === 'true');
        }, previewId);
        await rate.click();
        await page.waitForFunction(id => {
          const rows = [...document.querySelectorAll('[data-video-card]')].filter(row => row.querySelector('[data-video-card-open]')?.getAttribute('data-video-card-id') === id);
          return rows.length > 0 && rows.every(row => row.querySelector('[aria-label$=" 4 stars"]')?.getAttribute('aria-pressed') === 'false');
        }, previewId);
        result.cardControlsVerified = true;
      }
      await mix.locator('[data-video-card-open]').first().click();
      if (denseActivity) {
        await page.getByRole('button', { name: 'Watch now', exact: true }).click();
        await page.getByRole('button', { name: 'Close', exact: true }).waitFor();
        // Flush a fresh deferred play before its background timer, then resume
        // the page. The append-only journal must survive the lifecycle change.
        await page.evaluate(() => { window.dispatchEvent(new Event('pagehide')); window.dispatchEvent(new Event('pageshow')); });
        await page.waitForFunction(async id => {
          const db = await new Promise((resolve, reject) => { const req = indexedDB.open('reelcase'); req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); });
          try { return await new Promise((resolve, reject) => {
            const req = db.transaction('activity-journal').objectStore('activity-journal').getAll();
            req.onsuccess = () => resolve(req.result.some(row => row.entry?.id === id)); req.onerror = () => reject(req.error);
          }); } finally { db.close(); }
        }, previewId, { polling: 250 });
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        result.deferredPlayFlushVerified = true;
      } else {
      await page.getByRole('button', { name: 'Close preview', exact: true }).click();
      }
      await page.waitForFunction(id => document.activeElement?.getAttribute('data-video-card-id') === id, previewId);
      if (await formats.getByRole('button', { name: 'Shorts · 100', exact: true }).getAttribute('aria-pressed') !== 'true') throw new Error('Preview reset the selected format');
      await verifyMix(6, 106);
      await selectFormat('Completed streams · 100');
      await verifyMix(106, 206);
      if (!await mix.locator('[title="YouTube replay · Publication source: provider"]').count()) throw new Error('Completed stream publication provenance was lost');
      result.formatsScreenshot = output.replace(/\.json$/, `-formats-${viewport.name}.png`);
      await formats.scrollIntoViewIfNeeded();
      await page.screenshot({ path: result.formatsScreenshot });
      result.formatShelfScreenshot = output.replace(/\.json$/, `-format-shelf-${viewport.name}.png`);
      await mix.scrollIntoViewIfNeeded();
      await page.screenshot({ path: result.formatShelfScreenshot });
      await selectFormat('Uploads · 49,794');
      await verifyMix(206, 50_000);
      // Replacing work quickly must publish only the newest selection.
      await formats.getByRole('button', { name: 'Shorts · 100', exact: true }).click();
      await selectFormat('Completed streams · 100');
      await verifyMix(106, 206);
      await selectFormat('All saved videos · 49,994');
      result.youtubeFormatsVerified = true;
      if (idleRecovery) {
        progress('idle cleanup and wake');
        result.idleCleanupMs = [];
        result.idleWakeMs = [];
        for (let cycle = 0; cycle < 3; cycle++) {
          const ms = await page.evaluate(() => {
            Object.defineProperty(document, 'hidden', { configurable: true, value: true });
            Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
            const at = performance.now(); document.dispatchEvent(new Event('visibilitychange')); return performance.now() - at;
          });
          result.idleCleanupMs.push(ms);
          await page.waitForTimeout(80);
          const at = Date.now();
          await page.evaluate(() => { delete document.hidden; delete document.visibilityState; document.dispatchEvent(new Event('visibilitychange')); });
          await mix.locator('[data-video-card-open]').first().waitFor({ timeout: 5000 });
          result.idleWakeMs.push(Date.now() - at);
        }
        result.idleRecoveryVerified = Math.max(...result.idleCleanupMs) < 200 && Math.max(...result.idleWakeMs) < 3000;
        if (!result.idleRecoveryVerified) throw Error('Visibility cleanup or wake recovery exceeded its budget');
      }
      if (searchStats) {
        progress('balanced Twitch and background Stats');
        await navigate('Twitch');
        const mix = page.getByRole('list', { name: /^Your Twitch mix/ });
        await page.getByRole('heading', { name: 'Your Twitch mix', exact: true }).scrollIntoViewIfNeeded();
        await mix.scrollIntoViewIfNeeded(); await mix.locator('[data-video-card-open]').first().waitFor();
        const initial = await mix.locator('[data-video-card-open]').evaluateAll(rows => rows.map(row => row.dataset.videoCardId));
        const checkCreators = ids => {
          const creators = ids.map(id => { const index=Number(id.match(/qa-(\d+)$/)?.[1]); return index < 77_000 ? 'dominant' : String(index % 180); });
          if (ids.length < 3 || new Set(creators).size !== ids.length) throw Error('Twitch first rotation repeats a creator');
        };
        checkCreators(initial);
        await page.getByRole('button', { name: 'Mix Twitch creators', exact: true }).click();
        await mix.locator('[data-video-card-open]').first().waitFor();
        await page.waitForFunction(ids => { const rows=[...document.querySelector('[aria-label^="Your Twitch mix"]')?.querySelectorAll('[data-video-card-open]') ?? []].map(row=>row.dataset.videoCardId); return rows.length>0 && JSON.stringify(rows)!==JSON.stringify(ids); },initial);
        checkCreators(await mix.locator('[data-video-card-open]').evaluateAll(rows => rows.map(row => row.dataset.videoCardId)));
        result.balancedTwitchVerified = true;
        result.twitchScreenshot = output.replace(/\.json$/, `-twitch-${viewport.name}.png`); await mix.scrollIntoViewIfNeeded(); await page.screenshot({ path: result.twitchScreenshot });
        const catalog = page.getByRole('region',{name:'Full Twitch catalog',exact:true});
        await page.waitForFunction(()=>document.querySelector('[aria-label="Full Twitch catalog"]')?.getAttribute('aria-busy')==='false');
        if (await catalog.getAttribute('data-twitch-order')!=='mix') throw Error('Complete Twitch grid did not default to creator mix');
        await catalog.scrollIntoViewIfNeeded();
        await catalog.locator('[data-video-card-open]').first().waitFor();
        checkCreators(await catalog.locator('[data-video-card-open]').evaluateAll(rows=>rows.map(row=>row.dataset.videoCardId)));
        await catalog.getByRole('list',{name:'Media catalog · 30,000 titles',exact:true}).waitFor();
        result.fullTwitchMixVerified=true;
        result.twitchGridScreenshot=output.replace(/\.json$/,`-twitch-grid-${viewport.name}.png`); await page.screenshot({path:result.twitchGridScreenshot});
        if (twitchUi) {
          progress('complete Twitch saved/topic filters');
          const favoriteFilter = page.getByRole('button', { name: 'Favorites · 5,000', exact: true });
          const likedFilter = page.getByRole('button', { name: 'Liked · 5,000', exact: true });
          const allFilter = page.getByRole('button', { name: 'All Twitch', exact: true });
          await favoriteFilter.waitFor(); await likedFilter.waitFor();
          const checkSaved = async (kind) => {
            await catalog.getByRole('list', { name: 'Media catalog · 5,000 titles', exact: true }).waitFor();
            await catalog.scrollIntoViewIfNeeded();
            await catalog.locator('[data-video-card-open]').first().waitFor();
            const ids = await catalog.locator('[data-video-card-open]').evaluateAll(rows => rows.map(row => row.dataset.videoCardId));
            if (!ids.length || ids.some(id => {
              const index = Number(id.match(/qa-(\d+)$/)?.[1]);
              return index < 50000 || index >= 60000 || index % 2 !== (kind === 'favorites' ? 1 : 0);
            })) throw Error('Twitch saved filter returned incorrect membership');
          };
          await favoriteFilter.click(); await checkSaved('favorites');
          await likedFilter.click(); await checkSaved('likes');
          await page.getByRole('button', { name: '#science · 30,000', exact: true }).click(); await checkSaved('likes');
          if (topicsUi) {
            await page.getByRole('button', { name: '#technology · 3,000', exact: true }).click();
            await catalog.getByRole('list', { name: 'Media catalog · 1,000 titles', exact: true }).waitFor();
            await favoriteFilter.click();
            await catalog.getByText('Preparing Twitch catalog…', { exact: true }).waitFor();
            await page.waitForFunction(() => document.querySelector('[aria-label="Full Twitch catalog"]')?.getAttribute('aria-busy') === 'false');
            if (await catalog.locator('[data-video-card-open]').count()) throw Error('Empty Twitch saved/topic combination showed stale rows');
          }
          await page.getByRole('button', { name: 'All tags', exact: true }).click();
          // The latest filter wins even when an older scan is still running.
          await favoriteFilter.click(); await likedFilter.click(); await allFilter.click();
          await catalog.getByRole('list', { name: 'Media catalog · 30,000 titles', exact: true }).waitFor();
          const creators = page.getByRole('region', { name: 'Twitch creator shelves', exact: true });
          await page.waitForFunction(() => document.querySelector('[aria-label="Twitch creator shelves"]')?.getAttribute('aria-busy') === 'false');
          const creatorHeading = await creators.getByRole('heading', { name: 'Browse VODs by creator.', exact: true }).elementHandle();
          await catalog.scrollIntoViewIfNeeded();
          await catalog.getByRole('button', { name: /^(?:Next page ·|Show more ·)/ }).click();
          const grid = catalog.locator('[data-virtual-video-grid]');
          await page.waitForFunction(() => document.querySelector('[aria-label="Full Twitch catalog"] [data-virtual-video-grid]')?.dataset.gridPending === 'false');
          result.twitchFilteredMountedCards = await grid.locator('[data-video-card-open]').count();
          if (result.twitchFilteredMountedCards > 96) throw Error('Twitch filtered grid mounted an unbounded card list');
          const mountedGrid = await grid.elementHandle(), loaded = await grid.getAttribute('data-grid-loaded');
          const favoriteHeading = await page.getByRole('heading', { name: 'Favorite Twitch videos', exact: true }).elementHandle();
          const unsaved = grid.locator('[data-video-card]').filter({ has: page.getByRole('button', { name: 'Add to favorites', exact: true }) }).first();
          const unsavedId = await unsaved.locator('[data-video-card-open]').getAttribute('data-video-card-id');
          const unsavedCard = grid.locator('[data-video-card]').filter({ has: page.locator(`[data-video-card-id="${unsavedId}"]`) });
          await unsavedCard.hover(); await unsavedCard.getByRole('button', { name: 'Add to favorites', exact: true }).click();
          await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
          if (!await favoriteHeading.evaluate(element => element.isConnected)) throw Error('Twitch saved shelf disappeared during an activity refresh');
          if (!await creatorHeading.evaluate(element => element.isConnected)) throw Error('Twitch creator shelves disappeared during a taste refresh');
          await page.getByRole('button', { name: 'Favorites · 5,001', exact: true }).waitFor();
          await unsavedCard.hover(); await unsavedCard.getByRole('button', { name: 'Remove from favorites', exact: true }).click();
          await favoriteFilter.waitFor();
          const unliked = grid.locator('[data-video-card]').filter({ has: page.getByRole('button', { name: 'Like', exact: true }) }).first();
          const unlikedId = await unliked.locator('[data-video-card-open]').getAttribute('data-video-card-id');
          const unlikedCard = grid.locator('[data-video-card]').filter({ has: page.locator(`[data-video-card-id="${unlikedId}"]`) });
          await unlikedCard.hover(); await unlikedCard.getByRole('button', { name: 'Like', exact: true }).click();
          await page.getByRole('button', { name: 'Liked · 5,001', exact: true }).waitFor();
          await unlikedCard.hover(); await unlikedCard.getByRole('button', { name: 'Remove like', exact: true }).click();
          await likedFilter.waitFor();
          if (!await mountedGrid.evaluate(element => element.isConnected) || await grid.getAttribute('data-grid-loaded') !== loaded)
            throw Error('Twitch activity updates replaced or reset the unfiltered grid');
          result.twitchActivityUpdatesVerified = true;
          result.twitchShelfContinuityVerified = true;
          result.twitchSavedFiltersVerified = true;
          result.twitchFiltersScreenshot = output.replace(/\.json$/, `-twitch-filters-${viewport.name}.png`);
          await page.screenshot({ path: result.twitchFiltersScreenshot });
          if (twitchDiscovery) {
            progress('indexed clips, creator shelves and independent coverage');
            const coverage = page.locator('[data-twitch-coverage]');
            await page.waitForFunction(() => document.querySelector('[data-twitch-coverage]')?.getAttribute('aria-busy') === 'false');
            await coverage.locator('summary').getByText('28,999 cached VODs across 180 channels · expand to review and queue deep pulls.', { exact: true }).waitFor();
            const clips = page.getByRole('region', { name: 'Twitch clip discovery', exact: true });
            const waitClips = async () => {
              await clips.scrollIntoViewIfNeeded();
              await page.waitForFunction(() => document.querySelector('[aria-label="Twitch clip discovery"]')?.getAttribute('aria-busy') === 'false');
            };
            const clipIds = () => clips.locator('[data-video-card-open]').evaluateAll(rows => rows.map(row => row.dataset.videoCardId));
            const checkClips = async creator => {
              await waitClips();
              await clips.locator('[data-video-card-open]').first().waitFor();
              const ids = await clipIds();
              if (!ids.length || ids.some(id => {
                const i = Number(id.match(/qa-(\d+)$/)?.[1]);
                return i < 77000 || i % 3 !== 0 || creator !== 'all' && `Gate creator ${i % 180}` !== creator;
              })) throw Error('Clip discovery showed wrong creator or non-clip entries');
              return ids;
            };
            await checkClips('all');
            const initialClips = await clipIds();
            await page.getByRole('button', { name: 'Shuffle clips', exact: true }).click();
            await waitClips();
            if (JSON.stringify(await clipIds()) === JSON.stringify(initialClips)) throw Error('Clip reshuffle did not rotate');
            const select = page.getByRole('combobox', { name: 'Clip creator', exact: true });
            await select.selectOption('Gate creator 60'); await checkClips('Gate creator 60');
            await select.selectOption('Gate creator 61'); await waitClips();
            if ((await clipIds()).length) throw Error('Empty clip creator retained the previous creator cards');
            await select.selectOption('Gate creator 60'); await select.selectOption('all'); await select.selectOption('Gate creator 60');
            await checkClips('Gate creator 60');
            await select.selectOption('all'); await checkClips('all');
            await page.getByRole('button', { name: 'Mix Twitch creators', exact: true }).click();
            await page.waitForFunction(() => document.querySelector('[aria-label="Twitch creator shelves"]')?.getAttribute('aria-busy') === 'false');
            await creators.getByRole('heading', { name: 'Gate creator 79 · recent VODs', exact: true }).waitFor();
            await coverage.locator('summary').click();
            await coverage.getByText(/cached VODs · \d+ confirmed clips?/).first().waitFor();
            result.twitchDiscoveryScreenshot = output.replace(/\.json$/, `-twitch-discovery-${viewport.name}.png`);
            await clips.scrollIntoViewIfNeeded(); await page.screenshot({ path: result.twitchDiscoveryScreenshot });
            result.twitchClipShuffleVerified = true;
            result.twitchCreatorShelfContinuityVerified = true;
            result.twitchCoverageVerified = true;
            // Leave with all three completed snapshots; returning must rebuild
            // from the current catalog instead of retaining hidden card trees.
            await navigate('Home'); await navigate('Twitch');
            await waitClips(); await checkClips('all');
            result.twitchDiscoveryReturnVerified = true;
          }
        }
        const statsProfiler = process.argv.includes('--profile-stats') ? await context.newCDPSession(page) : null;
        if (statsProfiler) { await statsProfiler.send('Profiler.enable'); await statsProfiler.send('Profiler.start'); }
        const statsAt = Date.now(); await navigate('Stats');
        await page.getByRole('heading', { name: 'Know what your library needs next.', exact: true }).waitFor();
        result.statsShellMs=Date.now()-statsAt;
        await page.getByRole('button', { name: 'Download insight CSV', exact: true }).waitFor({ timeout: 30_000 });
        result.statsCompleteMs=Date.now()-statsAt;
        const charts = page.locator('[data-viewport-chart]');
        if (await charts.count() !== 6) throw Error('Stats lost a chart');
        await page.waitForFunction(() => [...document.querySelectorAll('[data-viewport-chart]')].every(chart => chart.dataset.chartMounted === 'false'));
        await charts.nth(4).scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelectorAll('[data-viewport-chart]')[4]?.dataset.chartMounted === 'true');
        await charts.nth(4).locator('.recharts-surface').waitFor();
        if (await charts.first().getAttribute('data-chart-mounted') !== 'false') throw Error('Offscreen chart stayed mounted');
        result.statsChartScreenshot=output.replace(/\.json$/, `-stats-chart-${viewport.name}.png`);
        await page.screenshot({ path: result.statsChartScreenshot });
        await page.evaluate(() => {
          const hidden = Object.getOwnPropertyDescriptor(document, 'hidden'), visibility = Object.getOwnPropertyDescriptor(document, 'visibilityState');
          window.__restoreChartVisibility = () => {
            if (hidden) Object.defineProperty(document, 'hidden', hidden); else delete document.hidden;
            if (visibility) Object.defineProperty(document, 'visibilityState', visibility); else delete document.visibilityState;
            document.dispatchEvent(new Event('visibilitychange'));
          };
          Object.defineProperty(document, 'hidden', { configurable: true, value: true });
          Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
          document.dispatchEvent(new Event('visibilitychange'));
        });
        try { await page.waitForFunction(() => [...document.querySelectorAll('[data-viewport-chart]')].every(chart => chart.dataset.chartMounted === 'false')); }
        finally { await page.evaluate(() => { window.__restoreChartVisibility(); delete window.__restoreChartVisibility; }); }
        await page.waitForFunction(() => document.querySelectorAll('[data-viewport-chart]')[4]?.dataset.chartMounted === 'true');
        result.statsHiddenChartsVerified=true;
        await page.getByRole('heading', { name: 'Know what your library needs next.', exact: true }).scrollIntoViewIfNeeded();
        await page.waitForFunction(() => [...document.querySelectorAll('[data-viewport-chart]')].every(chart => chart.dataset.chartMounted === 'false'));
        result.statsChartVisibilityVerified=true;
        const downloadPromise=page.waitForEvent('download'); await page.getByRole('button', { name: 'Download insight CSV', exact: true }).click();
        const download=await downloadPromise, stream=await download.createReadStream(); let csv=''; for await (const chunk of stream) csv+=chunk.toString();
        for (const [key,count] of [['catalog_titles',80000],['youtube_titles',50000],['twitch_titles',30000]]) if (!csv.split(/\r?\n/).some(row=>row.replaceAll('"','')===`${key},${count}`)) throw Error(`Statistics export lost ${key}`);
        result.statsWorkerFreed=await page.evaluate(() => { const rows=window.__featureWorkers.filter(row=>row.url.includes('library-stats.worker')); return rows.length>0 && rows.every(row=>row.dead); });
        if (!result.statsWorkerFreed || result.statsShellMs>2000 || result.statsCompleteMs>15000) throw Error('Stats latency or worker release budget failed');
        result.statsExportVerified=true;
        result.statsScreenshot=output.replace(/\.json$/,`-stats-${viewport.name}.png`); await page.screenshot({path:result.statsScreenshot});
        const statsWorkers=await page.evaluate(()=>window.__featureWorkers.filter(row=>row.url.includes('library-stats.worker')).length);
        await navigate('Home');
        const returnAt=Date.now(); await navigate('Stats');
        await page.getByRole('button',{name:'Download insight CSV',exact:true}).waitFor();
        result.warmStatsMs=Date.now()-returnAt;
        const newStatsWorkers=await page.evaluate(()=>window.__featureWorkers.filter(row=>row.url.includes('library-stats.worker')).length);
        result.reusedStatsSnapshot=statsWorkers===newStatsWorkers;
        if (!result.reusedStatsSnapshot || result.warmStatsMs>1000) throw Error('Unchanged Stats snapshot was rebuilt on return');
        if (statsProfiler) { const { profile } = await statsProfiler.send('Profiler.stop'); writeFileSync(output.replace(/\.json$/, `-stats-profile-${viewport.name}.json`), JSON.stringify(profile)); await statsProfiler.detach(); }
      }
      if (landingUi) {
        progress('cooperative Landing and complete expanded shelves');
        const at = Date.now(); await navigate('Landing page');
        await page.getByRole('heading', { name: 'Something worth finding.', exact: true }).waitFor();
        result.landingShellMs=Date.now()-at;
        const overview=page.locator('[data-landing-overview]');
        const waitOverview=()=>page.waitForFunction(()=>document.querySelector('[data-landing-overview]')?.dataset.landingPending==='false',null,{timeout:30000});
        await waitOverview(); result.landingReadyMs=Date.now()-at;
        if (result.landingShellMs>2000 || result.landingReadyMs>15000) throw Error('Landing shell/preparation budget failed');
        const checkRail=async (name,count) => {
          const shelf=overview.locator('.media-shelf').filter({has: page.getByRole('heading',{name,exact:true})});
          await shelf.scrollIntoViewIfNeeded();
          await shelf.getByRole('list',{name:`${name} · ${count.toLocaleString()} titles`,exact:true}).waitFor();
          const clipped=await shelf.evaluate(section=>{
            const header=section.firstElementChild, bounds=section.getBoundingClientRect();
            return [...header.querySelectorAll('button')].some(button=>{
              const rect=button.getBoundingClientRect();
              return rect.left<bounds.left-1 || rect.right>bounds.right+1;
            });
          });
          if (clipped) throw Error(`Landing ${name} has clipped shelf controls`);
          return shelf;
        };
        await checkRail('Unseen & ready to discover',48);
        await checkRail('Latest from your channels',48);
        const mix=page.getByRole('button',{name:'Mix local picks',exact:true});
        await mix.click(); await waitOverview();
        const more=page.getByRole('button',{name:'Show more home shelves',exact:true});
        await more.click();
        await page.waitForFunction(()=>document.querySelector('[data-landing-expanded]')?.dataset.landingPending==='false',null,{timeout:30000});
        await checkRail('From YouTube',49994); await checkRail('Twitch',30000);
        await checkRail('Favorites',60000); await checkRail('Continue watching',60000); await checkRail('History',60000);
        await checkRail('Short films & quick watches',18);
        if (topicsUi) await checkRail('Browse by genre',24);
        result.landingScreenshot=output.replace(/\.json$/, `-landing-${viewport.name}.png`);
        await overview.locator('.media-shelf').filter({has:page.getByRole('heading',{name:'From YouTube',exact:true})}).scrollIntoViewIfNeeded();
        await page.screenshot({path:result.landingScreenshot});
        // A page change must cancel preparation and discard expanded page state.
        await page.getByRole('button',{name:'Show fewer home shelves',exact:true}).click();
        await more.click(); await page.getByRole('button',{name:'Show fewer home shelves',exact:true}).click();
        if (await page.locator('[data-landing-expanded]').count()) throw Error('Closed Landing kept its expanded shelves');
        await more.click(); await navigate('Home'); await navigate('Landing page');
        await waitOverview();
        if (await page.locator('[data-landing-expanded]').count()) throw Error('Landing return retained obsolete expansion');
        result.landingUiVerified=true;
        result.landingShelfControlsVerified=true;
        result.landingInputMs=await page.evaluate(()=>Math.max(0,...window.__performanceGate.inputEvents.filter(row=>/Mix local picks|Show (?:more|fewer) home shelves/.test(row.action)).map(row=>row.ms)));
        await navigate('Home');
      }
      if (topicsUi) {
        progress('cooperative Topics and bounded cards');
        const at = Date.now(); await navigate('Topics');
        await page.getByRole('heading', { name: 'Explore ideas across sources.', exact: true }).waitFor();
        result.topicsShellMs = Date.now() - at;
        const topics = page.locator('[data-topic-catalog]');
        const waitTopics = async count => {
          await page.waitForFunction(count => document.querySelector('[data-topic-catalog]')?.dataset.topicPending === 'false'
            && document.querySelector('[data-topic-matches]')?.dataset.topicMatches === String(count), count, { timeout: 30_000 });
        };
        await waitTopics(80000); result.topicsReadyMs = Date.now() - at;
        if (result.topicsShellMs > 2000 || result.topicsReadyMs > 15000) throw Error('Topics shell/preparation budget failed');
        const topicDownload = page.waitForEvent('download');
        await topics.getByRole('button', { name: 'Export topic connections', exact: true }).click();
        const file = await topicDownload, stream = await file.createReadStream(); let csv = '';
        for await (const chunk of stream) csv += chunk.toString();
        if (!/"science","80000",[^\n]+,"80000","0"/.test(csv) || !/"technology","8000",[^\n]+,"8000","0"/.test(csv)) throw Error('Topic CSV lost saved/inferred counts');
        await topics.getByRole('button', { name: /^#science ·/ }).click();
        await waitTopics(80000);
        await topics.getByRole('button', { name: 'youtube', exact: true }).click(); await waitTopics(50000);
        await topics.getByRole('button', { name: 'twitch', exact: true }).click(); await waitTopics(30000);
        await topics.getByRole('button', { name: 'All sources', exact: true }).click(); await waitTopics(80000);
        const catalog = topics.getByRole('list', { name: 'Media catalog · 80,000 titles', exact: true });
        await catalog.scrollIntoViewIfNeeded();
        await topics.getByText('Saved tag: science', { exact: true }).first().waitFor();
        await topics.locator('[data-virtual-video-grid]').evaluate(grid => {
          let previous = Number(grid.dataset.gridLoaded);
          window.__gridPagingTrace = { maximumStep: 0, changes: 0 };
          window.__gridPagingObserver = new MutationObserver(() => {
            const loaded = Number(grid.dataset.gridLoaded);
            window.__gridPagingTrace.maximumStep = Math.max(window.__gridPagingTrace.maximumStep, loaded - previous);
            window.__gridPagingTrace.changes++; previous = loaded;
          });
          window.__gridPagingObserver.observe(grid, { attributes: true, attributeFilter: ['data-grid-loaded'] });
        });
        const topicsProfiler = process.argv.includes('--profile-topics') ? await context.newCDPSession(page) : null;
        if (topicsProfiler) { await topicsProfiler.send('Profiler.enable'); await topicsProfiler.send('Profiler.start'); }
        for (let pageNumber = 0; pageNumber < 6; pageNumber++) {
          await topics.getByRole('button', { name: 'Next page · 48', exact: true }).click();
        }
        await page.waitForFunction(() => document.querySelector('[data-topic-catalog] [data-virtual-video-grid]')?.dataset.gridPending === 'false'
          && document.querySelector('[data-topic-catalog] [data-virtual-video-grid]')?.dataset.gridLoaded === '336');
        result.gridAdmission = await page.evaluate(() => { window.__gridPagingObserver.disconnect(); delete window.__gridPagingObserver; return window.__gridPagingTrace; });
        if (result.gridAdmission.maximumStep > 8 || result.gridAdmission.changes < 36) throw Error('Paging mounted a full page in one synchronous update');
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
        result.topicsPagingInputMs = await page.evaluate(() => Math.max(0, ...window.__performanceGate.inputEvents
          .filter(event => event.action === 'Next page · 48').map(event => event.ms)));
        if (topicsProfiler) { const { profile } = await topicsProfiler.send('Profiler.stop');
          writeFileSync(output.replace(/\.json$/, `-topics-profile-${viewport.name}.json`), JSON.stringify(profile)); await topicsProfiler.detach(); }
        const heldAt = await topics.locator('[data-virtual-video-grid]').evaluate(grid => {
          const hidden = Object.getOwnPropertyDescriptor(document, 'hidden'), visibility = Object.getOwnPropertyDescriptor(document, 'visibilityState');
          window.__restoreGridVisibility = () => {
            if (hidden) Object.defineProperty(document, 'hidden', hidden); else delete document.hidden;
            if (visibility) Object.defineProperty(document, 'visibilityState', visibility); else delete document.visibilityState;
            document.dispatchEvent(new Event('visibilitychange'));
          };
          [...grid.querySelectorAll('button')].find(button => button.textContent.trim() === 'Next page · 48').click();
          Object.defineProperty(document, 'hidden', { configurable: true, value: true });
          Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
          document.dispatchEvent(new Event('visibilitychange'));
          return Number(grid.dataset.gridLoaded);
        });
        try {
          await page.waitForTimeout(100);
          if (await topics.locator('[data-virtual-video-grid]').getAttribute('data-grid-loaded') !== String(heldAt)) throw Error('A hidden grid continued admitting cards');
        } finally { await page.evaluate(() => { window.__restoreGridVisibility(); delete window.__restoreGridVisibility; }); }
        await page.waitForFunction(() => document.querySelector('[data-topic-catalog] [data-virtual-video-grid]')?.dataset.gridPending === 'false'
          && document.querySelector('[data-topic-catalog] [data-virtual-video-grid]')?.dataset.gridLoaded === '384');
        result.gridHiddenAdmissionVerified = true;
        const topicGrid = topics.locator('[data-virtual-video-grid]');
        const firstIndex = await topicGrid.locator('[data-video-card-open]').first().evaluate(button => {
          button.focus(); return Number(button.closest('[data-video-grid-index]').dataset.videoGridIndex);
        });
        await page.locator('[data-video-card-open]:focus').press('ArrowRight');
        const waitFocus = index => page.waitForFunction(index => Number(document.activeElement?.closest('[data-video-grid-index]')?.dataset.videoGridIndex) === index, index);
        await waitFocus(firstIndex + 1);
        await page.locator('[data-video-card-open]:focus').press('End'); await waitFocus(383);
        await page.locator('[data-video-card-open]:focus').press('Home'); await waitFocus(0);
        result.gridKeyboardVerified = true;
        await catalog.scrollIntoViewIfNeeded();
        const cards = await topics.locator('[data-video-card]').count();
        if (cards < 1 || cards > 96) throw Error(`Topics mounted ${cards} cards after paging`);
        result.topicsMountedCards = cards;
        result.topicsScreenshot = output.replace(/\.json$/, `-topics-${viewport.name}.png`); await page.screenshot({ path: result.topicsScreenshot });
        // Explicit topic hearts rerank in background while the current grid remains usable.
        await topics.getByRole('button', { name: '☆ Favorite topic', exact: true }).click();
        await topics.getByRole('button', { name: '★ Favorite topic', exact: true }).waitFor(); await waitTopics(80000);
        await topics.getByRole('button', { name: '★ Favorite topic', exact: true }).click(); await waitTopics(80000);
        await topics.locator('summary').click();
        await topics.getByRole('button', { name: 'Gate category 0', exact: true }).waitFor();
        if (await topics.getByRole('button', { name: /^Gate category / }).count() !== 48) throw Error('Categories were mounted before paging');
        await topics.getByRole('button', { name: 'Next 48 categories', exact: true }).click();
        if (await topics.getByRole('button', { name: /^Gate category / }).count() !== 48
          || await topics.getByRole('button', { name: 'Gate category 0', exact: true }).count()) throw Error('Category paging did not release the previous page');
        await topics.getByRole('button', { name: 'Previous categories', exact: true }).click();
        await topics.getByRole('button', { name: 'Gate category 0', exact: true }).click(); await waitTopics(80);
        await topics.getByRole('button', { name: 'All topics', exact: true }).click(); await waitTopics(80000);
        await topics.getByRole('button', { name: 'local', exact: true }).click();
        await topics.getByRole('button', { name: 'twitch', exact: true }).click();
        await topics.getByRole('button', { name: 'youtube', exact: true }).click(); await waitTopics(50000);
        await navigate('Home'); await navigate('Topics');
        await navigate('Home'); await page.locator('[data-home-ready="true"]').waitFor();
        await navigate('Stats'); await page.getByRole('button', { name: 'Explore connected topics', exact: true }).click();
        await page.locator('[data-topic-catalog][data-topic-pending="false"]').waitFor({ timeout: 30_000 });
        if (await page.locator('[data-topic-catalog] [data-video-card]').count()) throw Error('Stats topic summary retained a card catalog');
        await page.getByRole('button', { name: 'Close connected topics', exact: true }).click();
        result.topicsUiVerified = true;
      }
      await navigate('Settings');
      if (denseSaved) {
        progress('dense saved shelves and shared controls');
        const favoriteAt = Date.now();
        await navigate('Favorites');
        await page.getByRole('heading', { name: 'Favorites', exact: true }).waitFor({ timeout: 30_000 });
        result.favoriteReadyMs = Date.now() - favoriteAt;
        await page.getByRole('button', { name: 'All saved · 60,000', exact: true }).waitFor();
        await page.getByRole('heading', { name: 'Favorite YouTube', exact: true }).scrollIntoViewIfNeeded();
        await page.getByRole('list', { name: 'Favorite YouTube · 48 titles', exact: true }).waitFor();
        const savedCatalog = page.getByRole('list', { name: 'Media catalog · 60,000 titles', exact: true });
        await savedCatalog.scrollIntoViewIfNeeded();
        if (cardControls) {
          const poster = savedCatalog;
          await poster.scrollIntoViewIfNeeded();
          await poster.locator('[data-video-card-open]').first().waitFor();
          await poster.locator('[data-video-card]').first().hover();
          const shape = await poster.locator('[data-video-card]').first().evaluate(row => {
            const image = row.querySelector('[data-video-card-artwork]').getBoundingClientRect();
            const actions = row.querySelector('[data-video-card-quick-actions]').getBoundingClientRect();
            const details = row.querySelector('[data-video-card-details]').getBoundingClientRect();
            const together = row.querySelector('[aria-label$=" together"]').getBoundingClientRect();
            const ratings = row.querySelector('[aria-label$=" 4 stars"]').parentElement.getBoundingClientRect();
            const separate = together.right <= ratings.left || ratings.right <= together.left || together.bottom <= ratings.top || ratings.bottom <= together.top;
            return image.width > 0 && Math.abs(image.height / image.width - 1.5) < 0.02 && actions.bottom <= image.bottom + 1 && actions.bottom < details.top && separate;
          });
          if (!shape) throw Error('Poster card lost its portrait artwork geometry or action bounds');
          result.posterActionsLayoutVerified = true;
          await savedCatalog.scrollIntoViewIfNeeded();
        }
        const savedProfiler = process.argv.includes('--profile-saved') ? await context.newCDPSession(page) : null;
        if (savedProfiler) { await savedProfiler.send('Profiler.enable'); await savedProfiler.send('Profiler.start'); }
        const checkSavedMembership = async parity => {
          const grid = page.getByRole('region', { name: 'Saved title catalog', exact: true });
          await page.waitForFunction(() => document.querySelector('[aria-label="Saved title catalog"]')?.getAttribute('aria-busy') === 'false');
          await grid.getByRole('list', { name: 'Media catalog · 30,000 titles', exact: true }).scrollIntoViewIfNeeded();
          await grid.locator('[data-video-card-open]').first().waitFor();
          const ids = await grid.locator('[data-video-card-open]').evaluateAll(rows => rows.map(row => row.dataset.videoCardId));
          if (!ids.length || ids.some(id => {
            const i = Number(id.match(/qa-(\d+)$/)?.[1]); return i >= 60000 || i % 2 !== parity;
          })) throw Error('Shared Favorites filter showed stale or incorrect saved membership');
        };
        await page.getByRole('button', { name: 'Hearts · 30,000', exact: true }).click();
        await page.getByRole('list', { name: 'Media catalog · 30,000 titles', exact: true }).waitFor();
        await checkSavedMembership(1);
        await page.getByRole('button', { name: 'Likes · 30,000', exact: true }).click();
        await page.getByRole('list', { name: 'Media catalog · 30,000 titles', exact: true }).waitFor();
        await checkSavedMembership(0);
        await page.getByRole('button', { name: 'Hearts · 30,000', exact: true }).click();
        await page.getByRole('button', { name: 'Likes · 30,000', exact: true }).click();
        await page.getByRole('button', { name: 'Hearts · 30,000', exact: true }).click();
        await checkSavedMembership(1);
        result.sharedSavedFilterCancellationVerified = true;
        await page.getByRole('button', { name: 'All saved · 60,000', exact: true }).click();
        await savedCatalog.waitFor();
        if (savedProfiler) { const { profile } = await savedProfiler.send('Profiler.stop'); writeFileSync(output.replace(/\.json$/, `-saved-profile-${viewport.name}.json`), JSON.stringify(profile)); await savedProfiler.detach(); }
        result.savedCatalogVerified = true;
        if (recoveryUi) {
          progress('cooperative Continue and History');
          await navigate('Continue');
          await page.getByRole('list', { name: 'Media catalog · 60,000 titles', exact: true }).waitFor({ timeout: 30_000 });
          await page.getByLabel('Continue recovery details').getByText('60000', { exact: true }).waitFor();
          const continueGrid = page.locator('[data-virtual-video-grid]');
          const loaded = Number(await continueGrid.getAttribute('data-grid-loaded'));
          await continueGrid.scrollIntoViewIfNeeded();
          await page.getByRole('button', { name: /^(?:Next page ·|Show more ·)/ }).click();
          await page.waitForFunction(loaded => Number(document.querySelector('[data-virtual-video-grid]')?.getAttribute('data-grid-loaded')) > loaded, loaded);
          await page.getByRole('button', { name: 'List view', exact: true }).click();
          await page.getByRole('button', { name: 'Grid view', exact: true }).click();
          result.continueScreenshot = output.replace(/\.json$/, `-continue-${viewport.name}.png`);
          await page.getByRole('heading', { name: 'Continue watching', exact: true }).scrollIntoViewIfNeeded();
          await page.screenshot({ path: result.continueScreenshot });
          await navigate('History');
          await page.getByLabel('Recent history activity').waitFor();
          if (await page.getByLabel('Recent history activity').locator('button:disabled').count()) throw Error('Restored cached history entries should be actionable');
          await page.getByRole('button', { name: 'Watch Room', exact: true }).click();
          await page.getByText('No activity matches this time and source filter.', { exact: false }).waitFor();
          await page.getByRole('button', { name: 'Everything', exact: true }).click();
          result.historyScreenshot = output.replace(/\.json$/, `-history-${viewport.name}.png`);
          await page.screenshot({ path: result.historyScreenshot });
          if (!denseActivity) {
            await page.getByLabel('Recent history activity').getByRole('button', { name: /Recovered history link/ }).click();
            await page.getByRole('dialog').getByText('Recovered history link', { exact: true }).first().waitFor();
            await page.getByRole('dialog').locator('iframe').first().waitFor();
            await page.getByRole('button', { name: 'Close', exact: true }).click();
            result.recoveredHistoryPlaybackVerified = true;
          }
          await navigate('Home');
          await page.locator('[data-home-ready="true"]').waitFor();
          await navigate('Continue');
          await navigate('History');
          await navigate('Settings');
          await page.getByRole('heading', { name: 'Settings & local export', exact: true }).waitFor();
          result.recoveryUiVerified = true;
          await navigate('Favorites');
          await page.getByRole('button', { name: 'All saved · 60,000', exact: true }).waitFor();
        }
        result.favoriteScreenshot = output.replace(/\.json$/, `-favorites-${viewport.name}.png`);
        await page.getByRole('heading', { name: 'Favorites', exact: true }).scrollIntoViewIfNeeded();
        await page.screenshot({ path: result.favoriteScreenshot });
        if (viewport.name === 'desktop') {
          for (let cycle = 0; cycle < 3; cycle++) {
            await page.getByRole('button', { name: 'Collapse sidebar', exact: true }).first().click();
            await page.getByRole('button', { name: 'Expand sidebar', exact: true }).first().click();
          }
        } else {
          for (let cycle = 0; cycle < 3; cycle++) {
            await page.getByRole('button', { name: 'Open menu', exact: true }).click();
            await page.getByRole('dialog').getByRole('button', { name: 'Close', exact: true }).click();
          }
        }
        await navigate('Home');
        await page.locator('[data-home-ready="true"]').waitFor();
        await page.getByRole('button', { name: 'Open search', exact: true }).click();
        await page.getByRole('searchbox', { name: 'Global media search', exact: true }).fill('Gate archive 49997');
        await page.getByRole('searchbox', { name: 'Global media search', exact: true }).press('Escape');
        result.sharedControlsVerified = !(await page.getByRole('searchbox', { name: 'Global media search', exact: true }).isVisible());
      }
      progress('scorecard');
      if (denseSaved) await navigate('Settings');
      const scorecard = page.getByRole('region', { name: 'Performance scorecard', exact: true });
      await scorecard.waitFor();
      await page.getByRole('button', { name: 'Disable diagnostics', exact: true }).click();
      await scorecard.waitFor({ state: 'detached' });
      await page.getByRole('button', { name: 'Enable diagnostics', exact: true }).click();
      await scorecard.waitFor();
      await page.getByRole('button', { name: 'Refresh scorecard', exact: true }).click();
      await scorecard.getByText('Cache health', { exact: true }).waitFor();
      const safeguards = scorecard.locator('details[aria-label="Provider metadata safeguards"]');
      await safeguards.locator('summary').click();
      const safeguardText = await safeguards.innerText();
      result.providerBudgetsVerified = /8(?:\.00)? MiB/.test(safeguardText) && /250 rows/.test(safeguardText) && /80 waiting/.test(safeguardText);
      result.scorecardVerified = true;
      const downloadPromise = page.waitForEvent('download');
      await page.getByRole('button', { name: 'Export measurements', exact: true }).click();
      const download = await downloadPromise, stream = await download.createReadStream();
      let content = ''; for await (const chunk of stream) content += chunk.toString();
      const exported = JSON.parse(content);
      result.exportVerified = exported.catalogEntries === 80_000 && exported.version === 1 && !/Gate archive|Gate creator|https?:|watchUrl|channelId|videoId/.test(content);
      result.providerBudgetsVerified = result.providerBudgetsVerified && exported.providerBudgets?.responseBytes === 8 * 1024 * 1024
        && exported.providerBudgets?.warmCacheRows === 250 && exported.providerBudgets?.queuedRequests === 80;
      result.safeguardsScreenshot = output.replace(/\.json$/, `-safeguards-${viewport.name}.png`);
      await safeguards.screenshot({ path: result.safeguardsScreenshot });
      await safeguards.locator('summary').click();
      result.providerBudgetsVerified = result.providerBudgetsVerified && !(await safeguards.getByText('YouTube transfers', { exact: true }).isVisible());
      await scorecard.scrollIntoViewIfNeeded();
      result.screenshot = output.replace(/\.json$/, `-${viewport.name}.png`);
      await page.screenshot({ path: result.screenshot });
      if (youtubeCleanupUi) {
        progress('large protected YouTube cleanup');
        const cleanup=page.locator('[data-youtube-cleanup]');
        const button=cleanup.getByRole('button',{name:'Free up to 100 YouTube slots now',exact:true});
        await button.scrollIntoViewIfNeeded();const at=Date.now();await button.click();
        await cleanup.getByText('No eligible old YouTube entries can be replaced. Protected videos stay saved.',{exact:true}).waitFor({timeout:30000});
        await page.waitForFunction(()=>document.querySelector('[data-youtube-cleanup] button')?.disabled===false);
        result.youtubeCleanupCompleteMs=Date.now()-at;
        if(result.youtubeCleanupCompleteMs>15000)throw Error('Protected cleanup exceeded its preparation budget');
        const limits=page.getByRole('heading',{name:'Saved entry limits',exact:true}).locator('..');
        await limits.getByText(/^50,000 stored \/ 100,000 max/).waitFor();
        if(!await cleanup.getByText(/^0 entries removed(?: · across all cleanup sources)?$/).count())throw Error('Large cleanup reported protected removals');
        const stored=await page.evaluate(async()=>{
          const db=await new Promise((resolve,reject)=>{const request=indexedDB.open('reelcase');request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);});
          try{return await new Promise((resolve,reject)=>{const tx=db.transaction('remote-cache','readonly'),store=tx.objectStore('remote-cache'),keys=store.getAllKeys(),journal=store.get('youtube-cleanup');tx.oncomplete=()=>resolve({youtube:keys.result.filter(key=>String(key).startsWith('video:yt:')).length,removed:journal.result?.removedCount??0});tx.onerror=()=>reject(tx.error);});}finally{db.close();}
        });
        if(stored.youtube!==50000||stored.removed!==0)throw Error('Large cleanup deleted protected persisted entries');
        result.youtubeCleanupProtectionVerified=true;
        result.youtubeCleanupScreenshot=output.replace(/\.json$/,`-cleanup-${viewport.name}.png`);
        await cleanup.scrollIntoViewIfNeeded();await page.screenshot({path:result.youtubeCleanupScreenshot});
      }
      if (savedReload) {
        progress('saved actions survive reload');
        const findSearchCard = async index => {
          const clear = page.getByRole('button', { name: 'Clear search', exact: true });
          if (await clear.isVisible()) await clear.click();
          await page.getByRole('button', { name: 'Open search', exact: true }).click();
          const editor = page.getByPlaceholder('Search your entire media desk…');
          await editor.fill(`Gate archive ${index}`);
          await editor.press('Enter');
          await page.getByText('1 ranked results', { exact: true }).waitFor({ timeout: 30000 });
          const id = `${index < 50000 ? 'yt' : 'tw'}:v:qa-${index}`;
          const row = page.locator('[data-video-card]').filter({ has: page.locator(`[data-video-card-id="${id}"]`) }).first();
          await row.waitFor(); await row.hover(); return row;
        };
        const removed = await findSearchCard(49999);
        await removed.getByRole('button', { name: 'Remove from favorites', exact: true }).click();
        await page.getByRole('button', { name: 'Clear search', exact: true }).click();
        await navigate('Twitch');
        const catalog = page.getByRole('region', { name: 'Full Twitch catalog', exact: true });
        await catalog.getByRole('list', { name: 'Media catalog · 30,000 titles', exact: true }).waitFor();
        if (twitchDiscovery) await page.waitForFunction(() => document.querySelector('[aria-label="Twitch creator shelves"]')?.getAttribute('aria-busy') === 'false'
          && document.querySelector('[aria-label="Twitch clip discovery"]')?.getAttribute('aria-busy') === 'false');
        await catalog.scrollIntoViewIfNeeded(); await catalog.locator('[data-video-card-open]').first().waitFor();
        const addedIndex = await catalog.locator('[data-video-card-open]').evaluateAll(rows => rows.map(row => Number(row.dataset.videoCardId.match(/qa-(\d+)$/)?.[1])).find(index => index >= 60000));
        if (!addedIndex) throw Error('No new Twitch save candidate was mounted');
        const added = catalog.locator('[data-video-card]').filter({ has: page.locator(`[data-video-card-id="tw:v:qa-${addedIndex}"]`) });
        await added.hover(); await added.getByRole('button', { name: 'Add to favorites', exact: true }).click();
        await added.hover(); await added.getByRole('button', { name: 'Like', exact: true }).click();
        result.savedEditMirrorBytes = await page.evaluate(() => (localStorage.getItem('reelcase.saved-edits.v1') ?? '').length);
        if (result.savedEditMirrorBytes > 2000) throw Error('Saved action wrote a full catalog into its emergency mirror');
        const beforeReload = await page.evaluate(() => ({ inputMs: window.__performanceGate.worstInputMs, mountedCards: window.__performanceGate.peakCards, worstInput: window.__performanceGate.worstInput }));
        result.preReloadInputMs = beforeReload.inputMs; result.preReloadMountedCards = beforeReload.mountedCards; result.preReloadWorstInput = beforeReload.worstInput;
        await page.reload({ waitUntil: 'domcontentloaded' });
        await page.locator('[data-home-ready="true"]').waitFor();
        await page.getByText(/80,000 indexed/).first().waitFor({ timeout: 30000 });
        await navigate('Favorites');
        await page.getByRole('button', { name: 'Likes · 30,001', exact: true }).waitFor({ timeout: 30000 });
        await page.getByRole('button', { name: 'Hearts · 30,000', exact: true }).waitFor();
        await page.getByRole('button', { name: 'All saved · 60,000', exact: true }).waitFor();
        const old = await findSearchCard(49999);
        await old.getByRole('button', { name: 'Add to favorites', exact: true }).waitFor();
        const restored = await findSearchCard(addedIndex);
        await restored.getByRole('button', { name: 'Remove from favorites', exact: true }).waitFor();
        await restored.getByRole('button', { name: 'Remove like', exact: true }).waitFor();
        // Return the fixture to its original saved lists and check a second reload.
        const actionsProfiler = process.argv.includes('--profile-saved-actions') ? await context.newCDPSession(page) : null;
        if (actionsProfiler) { await actionsProfiler.send('Profiler.enable'); await actionsProfiler.send('Profiler.start'); }
        await restored.getByRole('button', { name: 'Remove like', exact: true }).click();
        await restored.getByRole('button', { name: 'Remove from favorites', exact: true }).click();
        const original = await findSearchCard(49999); await original.getByRole('button', { name: 'Add to favorites', exact: true }).click();
        if (actionsProfiler) { const { profile } = await actionsProfiler.send('Profiler.stop'); writeFileSync(output.replace(/\.json$/, `-actions-profile-${viewport.name}.json`), JSON.stringify(profile)); await actionsProfiler.detach(); }
        const middleMetrics = await page.evaluate(() => ({ inputMs: window.__performanceGate.worstInputMs, mountedCards: window.__performanceGate.peakCards, worstInput: window.__performanceGate.worstInput }));
        if (middleMetrics.inputMs > result.preReloadInputMs) { result.preReloadInputMs = middleMetrics.inputMs; result.preReloadWorstInput = middleMetrics.worstInput; }
        result.preReloadMountedCards = Math.max(result.preReloadMountedCards, middleMetrics.mountedCards);
        await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('[data-home-ready="true"]').waitFor();
        await page.getByText(/80,000 indexed/).first().waitFor({ timeout: 30000 }); await navigate('Favorites');
        await page.getByRole('button', { name: 'Hearts · 30,000', exact: true }).waitFor();
        await page.getByRole('button', { name: 'Likes · 30,000', exact: true }).waitFor();
        await page.getByRole('button', { name: 'All saved · 60,000', exact: true }).waitFor();
        result.savedReloadVerified = true;
        result.savedReloadScreenshot = output.replace(/\.json$/, `-saved-reload-${viewport.name}.png`); await page.screenshot({ path: result.savedReloadScreenshot });
      }
      if (guideUi) {
        progress('cooperative guide, typing, answers and complete live paging');
        // Add sixty synthetic live cards only after other provider expectations.
        // This context owns an isolated IDB; the person's library is untouched.
        const before = await page.evaluate(() => ({ input: window.__performanceGate.worstInputMs, worst: window.__performanceGate.worstInput, cards: window.__performanceGate.peakCards }));
        if (before.input > (result.preReloadInputMs ?? 0)) { result.preReloadInputMs=before.input; result.preReloadWorstInput=before.worst; }
        result.preReloadMountedCards=Math.max(before.cards,result.preReloadMountedCards ?? 0);
        await navigate('Home');
        await page.evaluate(async () => {
          const db=await new Promise((resolve,reject)=>{const req=indexedDB.open('reelcase');req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
          try { await new Promise((resolve,reject)=>{
            const tx=db.transaction('remote-cache','readwrite'),store=tx.objectStore('remote-cache');
            for(let i=79940;i<80000;i++) {
              const key=`video:tw:v:qa-${i}`,req=store.get(key);
              req.onsuccess=()=>{const row=req.result;if(!row){tx.abort();return;}
                store.put({...row,remote:{...row.remote,live:true,viewers:i-79939,observedAt:Date.now()}},key);};
            }
            tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(Error('Guide live fixture failed'));
          }); } finally {db.close();}
        });
        await page.reload({waitUntil:'domcontentloaded'});
        await page.locator('[data-home-ready="true"]').waitFor();
        await page.getByText(/80,000 indexed/).first().waitFor({timeout:30000});
        const at=Date.now(); await navigate('AI guide');
        const guide=page.locator('[data-guide-catalog]');
        await guide.getByRole('heading',{name:'Useful answers from local signals.',exact:true}).waitFor();
        result.guideShellMs=Date.now()-at;
        const waitGuide=()=>page.waitForFunction(()=>document.querySelector('[data-guide-catalog]')?.dataset.guidePending==='false',null,{timeout:30000});
        const question=guide.getByRole('textbox',{name:'Library guide question',exact:true});
        await question.fill('Something funny from my favorites');
        await waitGuide(); result.guideReadyMs=Date.now()-at;
        if(result.guideShellMs>2000 || result.guideReadyMs>15000) throw Error('Guide shell/preparation budget failed');
        const picks=guide.locator('[data-guide-picks] button');
        if(await picks.count()!==12) throw Error('Guide lost bounded recommendations');
        const selected=await picks.evaluateAll(rows=>rows.map(row=>row.textContent));
        for(const prompt of ['A tech video','Favorite science videos','Something funny']) {
          await question.fill('');await question.pressSequentially(prompt,{delay:20});await question.press('Enter');
          await guide.locator('[data-guide-answer]').getByText(`Local recommendations for “${prompt}”:`,{exact:false}).waitFor();
        }
        if(JSON.stringify(selected)!==JSON.stringify(await picks.evaluateAll(rows=>rows.map(row=>row.textContent)))) throw Error('Typing rebuilt the guide picks');
        const signals=await guide.locator('[data-guide-signals]').textContent();
        if(!/60000 history signals · 30000 favorites · (?:80000|88000) tags/.test(signals)) throw Error(`Guide signal counts were incomplete: ${signals}`);
        const live=guide.locator('[data-guide-live]');
        if(await live.locator('button').count()!==24) throw Error('Guide live buttons were unbounded');
        const liveSeen=new Set(await live.locator('button').allTextContents());
        await guide.getByRole('button',{name:'Next live channels',exact:true}).click();
        for(const name of await live.locator('button').allTextContents()) liveSeen.add(name);
        await guide.getByRole('button',{name:'Next live channels',exact:true}).click();
        for(const name of await live.locator('button').allTextContents()) liveSeen.add(name);
        if(liveSeen.size!==60 || await live.locator('button').count()!==12 || !await guide.getByRole('button',{name:'Next live channels',exact:true}).isDisabled()) throw Error('Guide live paging lost or repeated entries');
        await guide.getByRole('button',{name:'Previous live channels',exact:true}).click();
        await guide.getByRole('button',{name:'Previous live channels',exact:true}).click();
        await guide.getByRole('button',{name:'Who is live on Twitch?',exact:true}).click();
        await question.press('Enter');
        await guide.locator('[data-guide-answer]').getByText('Live on your followed Twitch channels:',{exact:false}).waitFor();
        const answer=await guide.locator('[data-guide-answer]').innerText();
        if(!/Gate creator 79 · 60 viewers/.test(answer)) throw Error('Guide answer ignored current live ranking');
        result.guideAnswerScreenshot=output.replace(/\.json$/,`-guide-answer-${viewport.name}.png`);
        await guide.locator('[data-guide-answer]').scrollIntoViewIfNeeded();
        await page.screenshot({path:result.guideAnswerScreenshot});
        if(viewport.name==='mobile') {
          const short=await guide.locator('button').evaluateAll(rows=>rows.filter(row=>row.getBoundingClientRect().height<43).map(row=>row.textContent));
          if(short.length) throw Error(`Guide has short mobile touch targets: ${short.join(', ')}`);
        }
        await question.fill('');
        if(!await guide.getByRole('button',{name:'Ask guide',exact:true}).isDisabled()) throw Error('Guide allows an empty question');
        const first=picks.first();await first.click();
        await page.getByRole('button',{name:'Close preview',exact:true}).click();
        await waitGuide();
        // A hidden tab holds a newly requested mix. Existing content survives.
        await page.evaluate(()=>{
          Object.defineProperty(document,'hidden',{configurable:true,value:true});
          Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});
          document.dispatchEvent(new Event('visibilitychange'));
        });
        await guide.getByRole('button',{name:'New recommendations',exact:true}).click();
        await page.waitForTimeout(350);
        if(await guide.getAttribute('data-guide-pending')!=='true' || await picks.count()!==12) throw Error('Hidden guide prepared work or erased painted picks');
        await page.evaluate(()=>{delete document.hidden;delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'));});
        await waitGuide();
        // Repeated mixes publish only the final job; departure drops its state.
        await guide.getByRole('button',{name:'New recommendations',exact:true}).click();
        await guide.getByRole('button',{name:'New recommendations',exact:true}).click();
        await waitGuide();
        result.guideScreenshot=output.replace(/\.json$/,`-guide-${viewport.name}.png`);
        await guide.getByRole('heading',{name:'Useful answers from local signals.',exact:true}).scrollIntoViewIfNeeded();
        await page.screenshot({path:result.guideScreenshot});
        await guide.getByRole('button',{name:'New recommendations',exact:true}).click();
        await navigate('Home');await navigate('AI guide');await waitGuide();
        if(await guide.locator('[data-guide-answer]').count()) throw Error('Guide return retained an obsolete answer');
        result.guideUiVerified=true;
        result.guideInputMs=await page.evaluate(()=>window.__performanceGate.worstInputMs);
        await navigate('Home');
      }
      if (recoveryLinksUi) {
        progress('complete recovery-link checkpoint and bounded emergency mirror');
        // Hearts/ratings have their own tiny journals and never request a full
        // activity checkpoint. Start actual playback to exercise that owner.
        await navigate('YouTube');
        await page.locator('[data-video-card-open]').first().click();
        await page.getByRole('button', { name: 'Watch now', exact: true }).click();
        await page.getByRole('button', { name: 'Close', exact: true }).waitFor();
        await page.waitForFunction(() => { try { return JSON.parse(localStorage.getItem('reelcase.links.v1') ?? '{}').links?.length === 200; } catch { return false; } }, null, { timeout: 30_000 });
        await page.waitForFunction(async () => {
          const req=indexedDB.open('reelcase'),db=await new Promise(resolve=>{req.onsuccess=()=>resolve(req.result);});
          try { return await new Promise((resolve,reject)=>{const r=db.transaction('activity').objectStore('activity').get('links');r.onsuccess=()=>resolve(r.result?.links?.length>=60_000);r.onerror=()=>reject(r.error);}); }
          finally {db.close();}
        }, null, { timeout: 30_000, polling: 500 });
        const links = await page.evaluate(async () => {
          const req = indexedDB.open('reelcase');
          const db = await new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});
          try {
            const rows = await new Promise((resolve,reject)=>{const r=db.transaction('activity').objectStore('activity').get('links');r.onsuccess=()=>resolve(r.result?.links??[]);r.onerror=()=>reject(r.error);});
            const urls = new Set(rows.map(row=>row.url));
            return { count: rows.length, unique: urls.size, first: urls.has('https://www.youtube.com/watch?v=qa-00000000'), last: urls.has('https://www.youtube.com/watch?v=qa-00059999'), mirror: JSON.parse(localStorage.getItem('reelcase.links.v1')).links.length };
          } finally { db.close(); }
        });
        if (links.count < 60_000 || links.count !== links.unique || !links.first || !links.last || links.mirror !== 200) throw Error(`Incomplete recovery checkpoint: ${JSON.stringify(links)}`);
        result.recoveryLinksVerified = true; result.recoveryLinkCount = links.count; result.recoveryLinkMirrorCount = links.mirror;
        await page.getByRole('button', { name: 'Close', exact: true }).click();
        await page.reload({ waitUntil: 'domcontentloaded' }); await page.locator('[data-home-ready="true"]').waitFor();
        await page.getByText(/80,000 indexed/).first().waitFor({timeout:30_000});
        result.recoveryLinksReloadVerified = await page.evaluate(async () => {
          const req=indexedDB.open('reelcase'),db=await new Promise(resolve=>{req.onsuccess=()=>resolve(req.result);});
          try { return await new Promise((resolve,reject)=>{const r=db.transaction('activity').objectStore('activity').get('links');r.onsuccess=()=>resolve(r.result?.links?.length>=60_000);r.onerror=()=>reject(r.error);}); }
          finally {db.close();}
        });
        if (!result.recoveryLinksReloadVerified) throw Error('Full recovery checkpoint did not survive reload');
      }
      const measurements = await page.evaluate(() => ({ inputMs: window.__performanceGate.worstInputMs, mountedCards: window.__performanceGate.peakCards,
        overflowPixels: Math.max(0, document.documentElement.scrollWidth - innerWidth), worstInput: window.__performanceGate.worstInput, slowInputs: window.__performanceGate.slowEvents }));
      Object.assign(result, measurements);
      if ((result.preReloadInputMs ?? 0) > result.inputMs) { result.inputMs = result.preReloadInputMs; result.worstInput = result.preReloadWorstInput; }
      result.mountedCards = Math.max(result.mountedCards, result.preReloadMountedCards ?? 0);
    } catch (error) { record(error.message); console.error(JSON.stringify({ viewport: viewport.name, error: error.message,
      clicks: await page.evaluate(() => window.__gateClicks).catch(() => []), documentNavigations, devMessages,
      body: (await page.locator('body').innerText().catch(() => '')).slice(0, 800) })); }
    Object.assign(result, performanceReleaseVerdict(result)); results.push(result);
    await context.close();
  }
} finally { await browser.close(); }
const report = { ok: results.length === 2 && results.every(row => row.ok && (!denseActivity || row.denseActivityVerified && row.deferredPlayFlushVerified) && (!searchStats || row.reusedSearchIndex && row.balancedTwitchVerified && row.fullTwitchMixVerified && row.statsExportVerified && row.statsWorkerFreed && row.reusedStatsSnapshot) && (!denseSaved || row.savedCatalogVerified && row.sharedControlsVerified)), url, fixture: `80,000 compact entries${denseActivity ? ', 60,000 saved progress/resume/play-count/interaction-count records' : ''}${searchStats ? ', stable saved tags and 90% of Twitch archive from one creator' : ''}${denseSaved ? ', 60,000 saved titles and history entries' : ''}, pulling paused, text-first artwork, isolated Chromium contexts; fake media and offline Companion responses stubbed`,
  limitation: 'Synthetic browser check; does not establish real-provider throughput, long-session memory stability, or physical-device performance.', budgets: PERFORMANCE_BUDGETS, results };
if (recoveryUi) report.ok &&= results.every(row => row.recoveryUiVerified);
if (idleRecovery) report.ok &&= results.every(row => row.idleRecoveryVerified);
if (cardControls) report.ok &&= results.every(row => row.cardControlsVerified && row.cardActionsLayoutVerified && (!denseSaved || row.posterActionsLayoutVerified));
if (topicsUi) report.ok &&= results.every(row => row.topicsUiVerified);
if (twitchUi) report.ok &&= results.every(row => row.twitchSavedFiltersVerified && row.twitchActivityUpdatesVerified && row.twitchShelfContinuityVerified);
if (savedReload) report.ok &&= results.every(row => row.savedReloadVerified);
if (landingUi) report.ok &&= results.every(row => row.landingUiVerified && row.landingShelfControlsVerified);
if (guideUi) report.ok &&= results.every(row => row.guideUiVerified);
if (youtubeCleanupUi) report.ok &&= results.every(row => row.youtubeCleanupProtectionVerified);
if (recoveryLinksUi) report.ok &&= results.every(row => row.recoveryLinksVerified && row.recoveryLinksReloadVerified);
writeFileSync(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
process.exitCode = report.ok ? 0 : 1;

function assertPlayerBudget(ms) { if (ms > 2000) throw Error(`Player controls took ${ms}ms to become ready`); }
