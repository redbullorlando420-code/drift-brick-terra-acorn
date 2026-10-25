import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fromCrossJSON } from 'seroval';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? resolve('screenshots/youtube-tags-dev.json'), [resolve('screenshots')]);
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
const results = [];
const ids = ['BaW_jenozKc', 'abcdefghijk', '12345678901', 'ABCDEFGHIJK', 'abcdefghij2', 'abcdefghij3', 'jNQXAC9IVRw'];
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport }), page = await context.newPage();
    const errors = [], failedUrls = [], result = { viewport: viewport.name, errors, failedUrls }; let calls = [], mode = 'fixture', release, received, functionRequest;
    page.setDefaultTimeout(20000); page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error' && !/favicon|net::ERR_|Failed to load resource.*503/.test(message.text())) errors.push(message.text()); });
    page.on('response', response => { if (response.status() === 404) failedUrls.push(response.url()); });
    await context.addInitScript(() => { localStorage.setItem('reelcase.pulls-paused.v1', 'true'); localStorage.setItem('reelcase.sidebar.groups.v1', JSON.stringify({ library: true, workspace: true, tools: true })); });
    for (const host of ['www.youtube.com', 'www.youtube-nocookie.com', 'i.ytimg.com']) await context.route(`https://${host}/**`, route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Provider fixture</p>' }));
    await context.route('http://127.0.0.1:43123/**', route => route.fulfill(new URL(route.request().url()).pathname.startsWith('/thumbs/')
      ? { status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jD5sAAAAASUVORK5CYII=', 'base64') }
      : { status: 200, headers: { 'access-control-allow-origin': '*' }, contentType: 'application/json', body: JSON.stringify({ ok: true, service: 'reelcase-companion', version: 11, capabilities: [] }) }));
    await page.route('**/_serverFn/**', async route => {
      const body = route.request().postData() ?? '', id = ids.find(id => body.includes(id));
      if (!id || !body.includes('id')) return route.fallback();
      functionRequest = { url: route.request().url(), body, id };
      calls.push(id);
      if (mode === 'hold') { await new Promise(resolve => { release = resolve; received?.(); }); }
      if (mode === 'error') return route.fulfill({ status: 503, contentType: 'text/plain', body: 'YouTube public metadata is temporarily unavailable; saved tags were kept.' });
      const metadata = { id, description: 'Machine learning with Python. #NeuralNetworks\n00:00 Introduction\n01:20 Training neural networks\n03:45 Model evaluation\nSponsored by a travel music brand #travel\nFollow me for anime', keywords: ['Machine Learning', 'Quantum Circuits', 'C++', 'Python', 'best', 'viral'], date: '2024-05-12' };
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ result: metadata, context: {} }) });
    });
    const nav = async name => {
      if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      await page.getByRole('navigation', { name: 'Library navigation' }).getByRole('button', { name: new RegExp(`^${name}(?:\\s+\\d+)?$`) }).click();
      const explore = page.getByRole('button', { name: 'Explore recommendations and full catalog', exact: true });
      if (await explore.isVisible()) await explore.click();
    };
    const read = async id => page.evaluate(async id => {
      const db = await new Promise((resolve, reject) => { const r = indexedDB.open('reelcase'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
      const get = (store, key) => new Promise((resolve, reject) => { const r = db.transaction(store).objectStore(store).get(key); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
      const video = await get('remote-cache', `video:yt:v:${id}`), enrichment = await get('activity', `metadata-enrichment:yt:v:${id}`); db.close();
      return { video, enrichment, manual: JSON.parse(localStorage.getItem('reelcase.tag-edits.v1') ?? '{}')[`yt:v:${id}`] };
    }, id);
    const open = async name => {
      await page.getByRole('heading', { name: 'Latest saved videos', exact: true }).scrollIntoViewIfNeeded();
      await page.locator('[data-video-card]').filter({ has: page.getByRole('heading', { name, exact: true }) }).first().locator('[data-video-card-open]').click();
      const dialog = page.getByRole('dialog', { name: `Preview: ${name}`, exact: true }); await dialog.waitFor(); return dialog;
    };
    try {
      console.log(`${viewport.name}: seed and pull`);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 }); await page.locator('[data-home-ready="true"]').waitFor();
      await page.evaluate(async ids => {
        const follows = [{ id: 'yt:tags-qa', kind: 'youtube', handle: 'tags-qa', title: 'Tag QA creator' }];
        localStorage.setItem('reelcase.follows.v1', JSON.stringify({ channels: follows, savedAt: Date.now() }));
        const lockedId = `yt:v:${ids[1]}`;
        localStorage.setItem('reelcase.tag-edits.v1', JSON.stringify({ [lockedId]: ['my-manual-topic'] }));
        localStorage.setItem('reelcase.tag-provenance-edits.v1', JSON.stringify({ [lockedId]: { tags: { 'my-manual-topic': 'manual' }, lockedFields: ['tags'], updatedAt: Date.now() } }));
        const db = await new Promise((resolve, reject) => { const r = indexedDB.open('reelcase'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
        await new Promise((resolve, reject) => { const tx = db.transaction('remote-cache', 'readwrite'), store = tx.objectStore('remote-cache'); store.put({ folders: [], checkedAt: Date.now() }, 'meta');
          ids.forEach((id, index) => store.put({ id: `yt:v:${id}`, folderId: 'yt:tags-qa', name: `Tag QA ${index}`, path: `youtube/${id}`, extension: 'youtube', mime: 'video/youtube', size: 0, addedAt: Date.now() - index * 1000,
            remote: { kind: 'youtube', videoId: id, channelName: 'Tag QA creator', publishedSource: 'rss', youtubeType: index === 2 ? 'live' : 'upload', ...(index === 2 ? { live: true, observedAt: Date.now() } : {}), watchUrl: `https://www.youtube.com/watch?v=${id}`, embedUrl: `https://www.youtube.com/embed/${id}` } }, `video:yt:v:${id}`));
          tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); db.close();
      }, ids);
      await page.reload(); await page.locator('[data-home-ready="true"]').waitFor(); await nav('YouTube');
      let preview = await open('Tag QA 0'); assert.equal(calls.length, 0, 'opening cards never fetches watch metadata');
      await preview.getByRole('button', { name: 'Pull video tags & description', exact: true }).click();
      await preview.getByRole('status').filter({ hasText: '1 video saved.' }).waitFor(); assert.equal(calls.length, 1);
      await preview.getByText(/^Recommended tags ·/).click();
      const suggestions = preview.getByRole('list', { name: 'Recommended YouTube tags', exact: true });
      for (const tag of ['quantum-circuits', 'training-neural-networks', 'neuralnetworks', 'cplusplus']) await suggestions.getByText(tag, { exact: true }).waitFor();
      assert.equal(await suggestions.getByText('viral', { exact: true }).count(), 0);
      assert.equal(await suggestions.getByText('travel', { exact: true }).count(), 0);
      assert.ok(await suggestions.getByText('Creator video tag', { exact: true }).count() > 0);
      await suggestions.scrollIntoViewIfNeeded(); result.suggestions = output.replace(/\.json$/, `-suggestions-${viewport.name}.png`); await page.screenshot({ path: result.suggestions });
      let saved = await read(ids[0]); assert.ok(saved.video.description.includes('Machine learning')); assert.equal(saved.video.remote.youtubeKeywords.length, 6); assert.ok(saved.enrichment.tags.includes('quantum-circuits'));
      await preview.getByRole('button', { name: 'Edit tags', exact: true }).click(); await preview.getByLabel('IPTC/XMP-style keywords').fill('my-private-choice'); await preview.getByRole('button', { name: 'Save metadata', exact: true }).click();
      await preview.getByRole('button', { name: 'Pull video tags & description', exact: true }).click(); await preview.getByRole('status').filter({ hasText: '1 video saved.' }).waitFor();
      saved = await read(ids[0]); assert.deepEqual(saved.manual, ['my-private-choice']);
      assert.ok(await preview.getByText('Manual tags are locked; provider refreshes cannot replace them.', { exact: true }).isVisible());
      const before = saved.video.remote.youtubeTagsCheckedAt;
      mode = 'hold'; const held = new Promise(resolve => { received = resolve; });
      await preview.getByRole('button', { name: 'Pull video tags & description', exact: true }).click(); await held;
      await preview.getByRole('button', { name: 'Close preview', exact: true }).click(); release(); mode = 'fixture'; await page.waitForTimeout(200);
      assert.equal((await read(ids[0])).video.remote.youtubeTagsCheckedAt, before, 'closing preview ignores late metadata');
      console.log(`${viewport.name}: stop and bounded batch`);
      await nav('Settings'); const panel = page.getByRole('region', { name: 'YouTube tag enrichment', exact: true }); await panel.scrollIntoViewIfNeeded();
      mode = 'hold'; const batchHeld = new Promise(resolve => { received = resolve; }); const beforeStop = calls.length;
      await panel.getByRole('button', { name: 'Pull tags for next 5 videos', exact: true }).click(); await batchHeld;
      await panel.getByRole('button', { name: 'Stop tag pull', exact: true }).click(); release(); mode = 'fixture'; await page.waitForTimeout(200);
      assert.equal(calls.length, beforeStop + 1); assert.equal((await read(ids[1])).video.remote.youtubeTagsCheckedAt, undefined);
      const beforeBatch = calls.length;
      await panel.getByRole('button', { name: 'Pull tags for next 5 videos', exact: true }).click(); await panel.getByRole('status').filter({ hasText: '5 videos saved.' }).waitFor();
      assert.equal(calls.length - beforeBatch, 5); assert.ok(!calls.includes(ids[2]), 'live videos are skipped');
      assert.deepEqual((await read(ids[1])).manual, ['my-manual-topic']);
      assert.equal((await read(ids[1])).video.remote.youtubeKeywords.length, 6);
      await panel.scrollIntoViewIfNeeded(); result.batch = output.replace(/\.json$/, `-batch-${viewport.name}.png`); await page.screenshot({ path: result.batch });
      const afterBatch = calls.length; await panel.getByRole('button', { name: 'Pull tags for next 5 videos', exact: true }).click(); await panel.getByRole('status').filter({ hasText: 'Every eligible saved video has been checked.' }).waitFor(); assert.equal(calls.length, afterBatch);
      await page.reload(); await page.locator('[data-home-ready="true"]').waitFor(); await nav('YouTube'); preview = await open('Tag QA 3');
      await preview.getByText(/^Recommended tags ·/).click(); await preview.getByRole('list', { name: 'Recommended YouTube tags' }).getByText('quantum-circuits', { exact: true }).waitFor();
      mode = 'error'; const existing = (await read(ids[3])).video.remote.youtubeTagsCheckedAt;
      await preview.getByRole('button', { name: 'Pull video tags & description', exact: true }).click(); await preview.getByRole('alert').filter({ hasText: 'temporarily unavailable' }).waitFor();
      assert.equal((await read(ids[3])).video.remote.youtubeTagsCheckedAt, existing);
      mode = 'fixture'; await preview.getByRole('button', { name: 'Pull video tags & description', exact: true }).click(); await preview.getByRole('status').filter({ hasText: '1 video saved.' }).waitFor();
      await preview.getByRole('button', { name: 'Close preview', exact: true }).click(); preview = await open('Tag QA 0');
      await preview.getByText('Manual tags are locked; provider refreshes cannot replace them.', { exact: true }).waitFor();
      const endCalls = calls.length; await page.waitForTimeout(300); assert.equal(calls.length, endCalls, 'no metadata polling');
      if (process.argv.includes('--public-check') && viewport.name === 'desktop') {
        // One actual server function / public watch-page round trip, without
        // account cookies. All mutation/UI assertions above use fixtures.
        const response = await context.request.post(functionRequest.url, { data: functionRequest.body.replaceAll(functionRequest.id, 'jNQXAC9IVRw'),
          headers: { 'content-type': 'application/json', accept: 'application/json', 'x-tsr-serverFn': 'true' }, timeout: 30000 });
        const data = response.headers()['x-tss-serialized'] ? fromCrossJSON(await response.json(), {}) : await response.json();
        assert.ok(response.ok(), `public server function returned ${response.status()}`); assert.equal(data.error, undefined);
        assert.equal(data.result.id, 'jNQXAC9IVRw'); assert.ok(data.result.description); assert.ok(Array.isArray(data.result.keywords));
        result.publicServerFunction = { status: response.status(), id: data.result.id, descriptionCharacters: data.result.description.length, creatorTags: data.result.keywords.length, date: data.result.date, accountCookiesUsed: false };
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false); assert.deepEqual(errors, []);
      Object.assign(result, { ok: true, metadataPull: true, sourceLabels: true, manualEditsProtected: true, lateResponsesIgnored: true, stopPreventsNextRequest: true, fiveVideoBatch: true, liveSkipped: true, persistence: true, providerErrorAndRetry: true, noPolling: true, providerResponses: 'fixtures', requests: calls.length });
    } catch (error) { result.ok = false; result.error = error.stack; await page.screenshot({ path: output.replace(/\.json$/, `-failure-${viewport.name}.png`) }).catch(() => {}); }
    results.push(result); await context.close();
  }
} finally { await browser.close(); }
writeFileSync(output, JSON.stringify(results, null, 2)); console.log(JSON.stringify(results, null, 2));
if (results.some(result => !result.ok)) process.exitCode = 1;
