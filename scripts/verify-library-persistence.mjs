import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// A fresh browser context exercises real IndexedDB without touching user data.
const browser = await chromium.launch({ channel: process.platform === 'win32' ? 'chrome' : undefined });
try {
  const page = await browser.newPage();
  await page.route('**/persistence-test', route => route.fulfill({ contentType: 'text/html', body: '<title>Persistence test</title>' }));
  await page.goto('http://127.0.0.1:8080/persistence-test');
  await page.evaluate(async () => {
    const p = await import('/src/lib/videos/persist.ts');
    const prefs = { favorites: [], likes: [], tags: { big: Array.from({ length: 80000 }, (_, i) => `topic-${i}-${'x'.repeat(80)}`) }, categories: {}, progress: {}, history: [], view: 'grid', sort: 'added', sortDir: 'desc', hideDemo: true, sourceId: 'youtube', hardwareAccel: true, privateFolderIds: [], adultPinHash: null, extFilter: 'all', sizeFilter: 'any', playableOnly: false, groupBy: 'none', follows: [], notices: [], notifyPush: false };
    localStorage.setItem('reelcase.prefs.v4', JSON.stringify({ ...prefs, tags: { legacy: ['keep'] } }));
    await p.restoreDurablePrefs();
    if (p.loadPrefs().tags.legacy[0] !== 'keep') throw Error('Legacy migration lost tags');
    p.savePrefs(prefs);
    await p.waitForPrefsWrites();
    p.saveTagEdit('edited', ['manual-tag']);
    await p.appendActivityJournal({ eventId: 'verification-event', id: 'edited', at: Date.now(), source: 'open' });
  });
  await page.reload();
  const restored = await page.evaluate(async () => {
    const p = await import('/src/lib/videos/persist.ts');
    await p.restoreDurablePrefs();
    return { count: p.loadPrefs().tags.big.length, edit: p.restoreTagEdits(p.loadPrefs().tags).edited, history: (await p.loadActivityJournal()).some(e => e.eventId === 'verification-event') };
  });
  assert.equal(restored.count, 80000);
  assert.deepEqual(restored.edit, ['manual-tag']);
  assert.equal(restored.history, true);
  console.log('PASS: legacy migration, oversized metadata, manual tags and History survive reload in real browser storage.');
} finally { await browser.close(); }
