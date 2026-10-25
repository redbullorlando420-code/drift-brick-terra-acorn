import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { checkedUrl } from './browser-guard.mjs';
const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
// This check deliberately uses Vite's active module to exercise both selectors
// against the same immutable fixtures. It never changes a user's library.
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
try {
  const page = await browser.newPage();
  await page.addInitScript(() => localStorage.setItem('reelcase.pulls-paused.v1', 'true'));
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120_000 });
  await page.locator('[data-home-ready="true"]').waitFor();
  const result = await page.evaluate(async () => {
    const source = await (await fetch('/src/components/library/settings-section.tsx')).text();
    const path = source.match(/from "(\/src\/lib\/videos\/store\.ts(?:\?t=\d+)?)"/)?.[1];
    if (!path) throw Error('Cannot resolve active development store');
    const { useLibrary, selectVisible, preparePrivateSelection, clearCatalogSelectorCaches } = await import(/* @vite-ignore */ path);
    const video = (id, patch = {}) => ({ id, folderId: 'private', name: `Title ${id}`, path: id, extension: 'mp4', mime: 'video/mp4', size: id.length, addedAt: id.length, ...patch });
    const remote = (kind, extra = {}) => ({ kind, videoId: 'same', ...extra });
    const videos = [video('public', { folderId: 'public' }), video('orphan', { folderId: 'orphan' }),
      video('private'), video('global-hidden'), video('tag-hidden'), video('unavailable'),
      video('legacy-provider', { folderId: 'redtube:discover', remote: remote('redtube') }),
      video('retired', { remote: remote('camsoda') }),
      video('removed', { name: '[removed]', remote: remote('reddit') }),
      video('direct', { remote: remote('redgifs', { watchUrl: 'https://www.redgifs.com/watch/ParityExample' }) }),
      video('reddit-copy', { poster: 'https://example.invalid/poster.jpg', description: 'richer card', remote: remote('reddit', { watchUrl: 'https://www.redgifs.com/watch/ParityExample' }) }),
      video('sample', { isSample: true })];
    const base = { ...useLibrary.getState(), videos,
      folders: [{ id: 'private', adult: true }, { id: 'public' }], sourceId: 'adults', query: '', hideDemo: true,
      tags: { 'tag-hidden': ['hidden'] }, hiddenVideos: { 'global-hidden': true }, unavailable: { unavailable: true }, progress: { private: { t: 10, d: 100, at: 1234 } } };
    let cases = 0, yields = 0;
    for (const showHiddenAdult of [false, true]) for (const sort of ['added', 'name', 'size', 'duration', 'recent']) {
      const state = { ...base, showHiddenAdult, sort };
      clearCatalogSelectorCaches(); const expected = selectVisible(state);
      clearCatalogSelectorCaches(); const actual = await preparePrivateSelection(state, new AbortController().signal, async () => { yields++; });
      if (JSON.stringify(actual) !== JSON.stringify(expected)) throw Error(`Selector parity failed for ${sort}/${showHiddenAdult}`);
      if (actual.some(v => ['public', 'orphan', 'global-hidden', 'unavailable', 'removed', 'retired'].includes(v.id))) throw Error('Visibility rule changed');
      if (actual.filter(v => ['direct', 'reddit-copy'].includes(v.id)).length !== 1) throw Error('Provider identity merge changed');
      cases++;
    }
    clearCatalogSelectorCaches();
    const controller = new AbortController(); controller.abort();
    let cancelled = false;
    try { await preparePrivateSelection({ ...base, sort: 'name' }, controller.signal); } catch { cancelled = true; }
    if (!cancelled) throw Error('Cancelled private selection ran');
    return { cases, yields, visibilityAndMergeParity: true, cancellation: cancelled };
  });
  assert.equal(result.cases, 10); assert.ok(result.yields > 0);
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
