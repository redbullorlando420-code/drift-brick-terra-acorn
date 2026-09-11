import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import fs from 'node:fs';
import ts from 'typescript';

const js = ts.transpileModule(fs.readFileSync('src/lib/videos/topics.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { topicsForVideo, topicEvidence } = await import(`data:text/javascript;base64,${Buffer.from(js).toString('base64')}`);
const base = { folderId: 'local', path: '', extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: 0 };
assert.deepEqual(topicsForVideo({ ...base, name: 'Untitled', genre: 'Documentary' }), ['documentary']);
assert.deepEqual(topicsForVideo({ ...base, name: 'Untitled', description: 'Buy our gaming software and music!' }), []);
assert.deepEqual(topicsForVideo({ ...base, name: 'Untitled' }, ['Tech', 'technology', 'year-2026', 'socials']), ['technology']);
assert(topicsForVideo({ ...base, name: 'COD ZOMBIES MARATHON' }).includes('gaming'));
assert(topicsForVideo({ ...base, name: 'Police Chase Network Replays' }).includes('legal'));
assert(topicsForVideo({ ...base, name: 'CAKE DECORATING TARA YUMMYS BDAY CAKE' }).includes('food'));
assert(topicsForVideo({ ...base, name: 'FIRST LOOK: NBA 2K27!! LETS GOOOO!' }).includes('gaming'));
assert(topicsForVideo({ ...base, name: 'TRYING ACUPUNCTURE FOR THE FIRST TIME' }).includes('wellbeing'));
const unchanged = ['personal-label'];
assert.equal(topicEvidence({ ...base, name: 'Minecraft tutorial' }, unchanged)[0].saved, false);
assert.deepEqual(unchanged, ['personal-label']);
const large = Array.from({ length: 23660 }, (_, i) => ({ ...base, id: String(i), name: i % 2 ? 'Minecraft tutorial' : 'Camera 0001' }));
let started = performance.now();
large.forEach((v) => topicsForVideo(v));
const cold = performance.now() - started;
started = performance.now();
large.forEach((v) => topicsForVideo(v));
console.log(`23,660-title resolver: cold ${cold.toFixed(0)}ms; cached ${(performance.now() - started).toFixed(0)}ms`);

// Isolated browser fixture; never uses the user's browser profile or saved data.
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'chrome' : undefined });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:8080/');
  await page.getByRole('button', { name: 'Stats', exact: true }).click();
  await page.getByText('Connected topics', { exact: true }).waitFor();
  await page.evaluate(async () => {
    const moduleSource = await (await fetch('/src/components/library/topic-links.tsx')).text();
    const storeUrl = moduleSource.match(/from "([^"]+videos\/store[^"]*)"/)[1];
    const { useLibrary } = await import(storeUrl);
    const base = { path: '', extension: 'mp4', mime: 'video/mp4', size: 100, addedAt: Date.now() };
    useLibrary.setState({ restoring: false, folders: [{ id: 'local', name: 'Local test', kind: 'directory' }, { id: 'private', name: 'Private test', kind: 'directory', adult: true }], videos: [
      { ...base, id: 'one', folderId: 'local', name: 'Minecraft tutorial' },
      { ...base, id: 'two', folderId: 'yt', name: 'Minecraft gameplay', remote: { kind: 'youtube' } },
      { ...base, id: 'three', folderId: 'tw', name: 'COD zombies', remote: { kind: 'twitch' } },
      { ...base, id: 'four', folderId: 'local', name: 'Untitled documentary', genre: 'Documentary' },
      { ...base, id: 'secret', folderId: 'private', name: 'Private Minecraft' },
    ], tags: { two: ['gaming', 'Gaming', 'provider-youtube'] }, query: '', sourceId: 'stats' });
  });
  await page.getByText('4 of 4 public titles linked', { exact: false }).waitFor();
  await page.screenshot({ path: 'screenshots/topic-stats-fixture.png' });
  await page.getByRole('button', { name: /#gaming · 3 · ★ 0\.00\/5 · ↔/, exact: true }).click();
  await page.getByRole('heading', { name: 'Explore gaming', exact: true }).waitFor();
  await page.getByText('3 matching titles', { exact: true }).waitFor();
  assert.equal(await page.getByText('Private Minecraft', { exact: true }).count(), 0);
  await page.getByRole('button', { name: 'twitch', exact: true }).click();
  await page.getByText('1 matching title', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'All sources', exact: true }).click();
  await page.getByRole('button', { name: /#learning · 1 shared · ★ 0\.00\/5/, exact: true }).click();
  await page.getByRole('heading', { name: 'Explore learning', exact: true }).waitFor();
  await page.getByText('Title/category: tutorial', { exact: true }).waitFor();
  await page.waitForTimeout(500); await page.screenshot({ path: 'screenshots/topic-explorer-fixture.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'screenshots/topic-explorer-fixture-mobile.png' });
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  assert.deepEqual(errors, []);
  console.log('PASS: canonical aliases, deduplication, noise rejection, saved-tag preservation, Stats → topic navigation, provider filters, related links, evidence, private-source exclusion, mobile overflow.');
} finally { await browser.close(); }




