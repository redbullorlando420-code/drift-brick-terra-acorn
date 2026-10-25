import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';

const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? resolve('screenshots/private-shelves.json'), [resolve('screenshots')], 'private shelf report');
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
      window.__privatePerf = { recording: false, frames: [], inputs: [] };
      let last = performance.now();
      requestAnimationFrame(function frame(now) { if (window.__privatePerf.recording) window.__privatePerf.frames.push(now - last); last = now; requestAnimationFrame(frame); });
      document.addEventListener('pointerdown', event => {
        const action = event.target.closest('button')?.textContent?.trim(), at = performance.now();
        requestAnimationFrame(() => requestAnimationFrame(() => window.__privatePerf.inputs.push({ action, ms: performance.now() - at })));
      }, true);
    });
    const page = await context.newPage(), errors = [], result = { viewport: viewport.name, errors };
    results.push(result); page.setDefaultTimeout(20_000);
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    try {
      console.log(`${viewport.name}: seeding isolated private catalog`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
      await page.locator('[data-home-ready="true"]').waitFor();
      await page.waitForFunction(async () => (await indexedDB.databases()).some(db => db.name === 'reelcase'));
      await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => { const r = indexedDB.open('reelcase'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
        const tags = {}, favorites = [], privateFolderIds = Array.from({ length: 24 }, (_, i) => `files:QA private ${String(i).padStart(2, '0')}`);
        for (let start = 0; start < 80_000; start += 512) await new Promise((resolve, reject) => {
          const tx = db.transaction('videos', 'readwrite'), store = tx.objectStore('videos');
          for (let i = start; i < Math.min(80_000, start + 512); i++) {
            const id = `local:private-${String(i).padStart(8, '0')}`;
            store.put({ id, folderId: privateFolderIds[i % 24], name: `Private QA ${String((i * 7919) % 80_000).padStart(8, '0')}`, path: `QA/${i}.mp4`, extension: 'mp4', mime: 'video/mp4', size: i, addedAt: 1_750_000_000_000 + i });
            if (i % 4 === 0) tags[id] = ['organization', ...(i % 8 === 0 ? ['collection'] : [])];
            if (i % 10 === 0) favorites.push(id);
          }
          tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
        });
        await new Promise((resolve, reject) => {
          const tx = db.transaction('activity', 'readwrite');
          tx.objectStore('activity').put({ favorites, likes: [], tags, categories: {}, progress: {}, history: [], view: 'grid', sort: 'added', sortDir: 'desc', hideDemo: true, sourceId: 'home', hardwareAccel: true, privateFolderIds, adultPinHash: null, extFilter: '', sizeFilter: 'all', playableOnly: false, groupBy: 'none', follows: [], notices: [], notifyPush: false }, 'preferences');
          tx.oncomplete = resolve; tx.onerror = () => reject(tx.error);
        }); db.close();
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByText(/80,000 indexed/).first().waitFor();
      const navigate = async name => {
        if (viewport.name === 'mobile' && !await page.getByRole('dialog').count()) await page.getByRole('button', { name: 'Open menu', exact: true }).click();
        await page.getByRole('button', { name: new RegExp(`^${name}(?:$|\\s)`) }).first().click();
      };
      // Private rows must never leak into public Home or Movies.
      if (await page.locator('[data-video-card-id^="local:private-"]').count()) throw Error('Private cards leaked into Home');
      await navigate('Adults');
      await page.getByRole('button', { name: 'Load milestones and private shelves', exact: true }).waitFor();
      const shelf = title => page.getByRole('list', { name: new RegExp(`^${title} · `) });
      const ready = async (title = 'All private titles') => {
        if (refined) await page.locator('[data-private-shelves][aria-busy="false"]').waitFor();
        await page.getByRole('heading', { name: title, exact: true }).scrollIntoViewIfNeeded();
        await shelf(title).waitFor({ state: 'attached' });
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
      };
      const measure = async (name, action) => {
        console.log(`${viewport.name}: ${name}`);
        await page.evaluate(() => Object.assign(window.__privatePerf, { recording: true, frames: [], inputs: [] }));
        const started = Date.now(); await action(); await ready();
        result[name] = await page.evaluate(elapsedMs => { const p = window.__privatePerf; p.recording = false; return { elapsedMs, maxFrameMs: Math.max(0, ...p.frames), inputs: p.inputs }; }, Date.now() - started);
      };
      console.log(`${viewport.name}: measuring shelves and sorting`);
      const profiler = process.argv.includes('--profile') ? await context.newCDPSession(page) : null;
      if (profiler) { await profiler.send('Profiler.enable'); await profiler.send('Profiler.start'); }
      await measure('openShelves', () => page.getByRole('button', { name: 'Load milestones and private shelves', exact: true }).click());
      if (profiler) { const { profile } = await profiler.send('Profiler.stop'); writeFileSync(output.replace(/\.json$/, `-${viewport.name}.cpuprofile`), JSON.stringify(profile)); await profiler.detach(); }
      const controls = page.getByRole('heading', { name: 'Your shelves, your tags.', exact: true }).locator('..').locator('..').locator('..');
      for (const name of ['name', 'recent', 'Most tagged', 'Last played', 'favorites']) {
        await measure(name, () => controls.getByRole('button', { name, exact: true }).click());
      }
      for (const [title, count] of [['All private titles', 80000], ['Most organized', 20000], ['Needs a tag', 60000], ['Recently added', 24], ['QA private 00', 3334], ['Favorites', 8000]]) {
        await page.getByRole('heading', { name: title, exact: true }).scrollIntoViewIfNeeded();
        const list = page.getByRole('list', { name: `${title} · ${count.toLocaleString()} titles`, exact: true });
        await list.waitFor({ state: 'attached' });
      }
      result.membershipVerified = true;
      if (refined) {
        for (const key of ['hub', 'sources', 'coverage', 'links']) {
          const section = page.locator(`[data-milestone-section="${key}"]`);
          if (await section.locator('summary + div').count()) throw Error(`Closed ${key} directory mounted its content`);
          await section.locator('summary').click(); await section.locator('summary + div').waitFor();
          await section.locator('summary').click(); await section.locator('summary + div').waitFor({ state: 'detached' });
        }
        result.deferredDirectoriesVerified = true;
        const all = shelf('All private titles'); await all.scrollIntoViewIfNeeded();
        await all.locator('[data-video-card-open]').first().focus();
        await page.locator(':focus').press('End');
        await page.waitForFunction(() => document.activeElement?.closest('[data-rail-index]')?.getAttribute('data-rail-index') === '79999');
        await page.locator(':focus').press('Home');
        result.fullCatalogKeyboardVerified = true;
        await controls.getByRole('button', { name: 'name', exact: true }).click();
        await controls.getByRole('button', { name: 'recent', exact: true }).click();
        await controls.getByRole('button', { name: 'name', exact: true }).click();
        await ready(); await all.scrollIntoViewIfNeeded();
        await page.waitForFunction(() => document.querySelector('[aria-label="All private titles · 80,000 titles"] [data-video-card-open]')?.getAttribute('data-video-card-id') === 'local:private-00000000');
        result.latestSortVerified = true;
        console.log(`${viewport.name}: tag filtering`);
        await all.getByRole('button', { name: '#organization', exact: true }).first().click();
        await ready('Tagged · organization');
        await page.getByRole('list', { name: 'Tagged · organization · 20,000 titles', exact: true }).waitFor();
        result.tagFilterVerified = true;
        await controls.getByRole('button', { name: 'All titles', exact: true }).click(); await ready();
        // Cancelling a sort by leaving the desk must not publish its rows on Home.
        await controls.getByRole('button', { name: 'Most tagged', exact: true }).click();
        await navigate('Home'); await page.locator('[data-home-ready="true"]').waitFor();
        if (await page.locator('[data-video-card-id^="local:private-"]').count()) throw Error('Private cards leaked after cancelled navigation');
        await navigate('Adults');
        await page.getByRole('button', { name: 'Load milestones and private shelves', exact: true }).click();
        await ready(); result.navigationCancellationVerified = true;
      }
      await page.getByRole('heading', { name: 'Your shelves, your tags.', exact: true }).scrollIntoViewIfNeeded();
      result.screenshot = output.replace(/\.json$/, `-${viewport.name}.png`); await page.screenshot({ path: result.screenshot });
      result.overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
      result.cards = await page.locator('[data-video-card]').count();
      if (errors.length || result.overflow) throw Error('Browser errors or horizontal overflow');
      if (refined && ['openShelves', 'name', 'recent', 'Most tagged', 'Last played', 'favorites'].some(key => result[key].maxFrameMs > 200)) throw Error('Private shelf work exceeded the 200ms frame budget');
      let hiddenId;
      if (refined) {
        const all = shelf('All private titles'); await all.scrollIntoViewIfNeeded();
        const candidate = all.locator('[data-video-card-open]').first(); hiddenId = await candidate.getAttribute('data-video-card-id');
        await candidate.locator('..').getByRole('button', { name: /^Hide .+ from your library$/ }).click();
        await ready(); await page.getByRole('list', { name: 'All private titles · 79,999 titles', exact: true }).waitFor();
        if (await all.locator(`[data-video-card-id="${hiddenId}"]`).count()) throw Error('Hidden private title remained visible');
        result.hiddenTitleVerified = true;
        await page.waitForFunction(async id => {
          const db = await new Promise(resolve => { const request = indexedDB.open('reelcase'); request.onsuccess = () => resolve(request.result); });
          const saved = await new Promise(resolve => { const request = db.transaction('activity').objectStore('activity').get('preferences'); request.onsuccess = () => resolve(request.result); });
          db.close(); return saved?.privateFolderIds?.length === 24 && saved.hiddenVideoIds?.includes(id);
        }, hiddenId);
      }
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.getByText(/80,000 indexed/).first().waitFor();
      // The startup counter reports disk rows before folder reconstruction.
      // Wait for reconstructed privacy groups before opening this desk again.
      if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      await page.waitForFunction(() => [...document.querySelectorAll('button')].some(button => button.textContent?.includes('Private sources') && button.textContent.includes('24')));
      await navigate('Adults');
      await page.getByRole('button', { name: 'Load milestones and private shelves', exact: true }).click(); await ready();
      await shelf('All private titles').waitFor({ state: 'attached' }); result.persistenceVerified = true;
      if (hiddenId) {
        await page.getByRole('list', { name: 'All private titles · 79,999 titles', exact: true }).waitFor();
        if (await shelf('All private titles').locator(`[data-video-card-id="${hiddenId}"]`).count()) throw Error('Hidden private title returned after reload');
        result.hiddenTitlePersisted = true;
      }
    } catch (error) {
      result.failure = error.message;
      result.shelfState = await page.evaluate(() => ({ busy: document.querySelector('[data-private-shelves]')?.getAttribute('aria-busy'), headings: [...document.querySelectorAll('h1,h2')].map(el => el.textContent) })).catch(() => null);
      result.failureText = await page.locator('body').innerText({ timeout: 5000 }).then(t => t.slice(-2500)).catch(() => 'unavailable');
      await page.screenshot({ path: output.replace(/\.json$/, `-failure-${viewport.name}.png`), timeout: 5000 }).catch(() => {});
    }
    console.log(JSON.stringify(result)); await context.close();
  }
} finally { await browser.close(); }
writeFileSync(output, JSON.stringify(results, null, 2));
if (results.some(row => row.failure)) process.exitCode = 1;
