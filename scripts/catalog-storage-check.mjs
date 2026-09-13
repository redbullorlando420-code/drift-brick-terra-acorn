import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { chromium } from 'playwright';

// Fresh browser context: never read or modify the user's saved library.
const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHANNEL ? { channel: process.env.PLAYWRIGHT_CHANNEL } : {}) });
try {
  const page = await browser.newPage();
  await page.route('http://catalog.test/**', route => route.fulfill({ body: '<html></html>', contentType: 'text/html' }));
  await page.goto('http://catalog.test/');
  const code = ts.transpileModule(readFileSync(new URL('../src/lib/videos/persist.ts', import.meta.url), 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
  }).outputText;
  const result = await page.evaluate(async code => {
    const storage = await import(URL.createObjectURL(new Blob([code], { type: 'text/javascript' })));
    const video = (id, folderId = 'test') => ({ id, folderId, name: id, size: 0 });
    await storage.appendCatalogVideos([video('original'), video('other', 'other')]);
    let failed = false;
    try {
      await storage.saveFolderVideos('test', [video('replacement'), { ...video('bad'), uncloneable: () => {} }]);
    } catch { failed = true; }
    const afterFailure = (await storage.loadCatalogVideos()).map(v => v.id).sort();
    await storage.saveFolderVideos('test', Array.from({ length: 1200 }, (_, i) => video(`item-${i}`)));
    await storage.appendCatalogVideos([video('item-1'), video('new')]);
    const count = (await storage.loadCatalogVideos()).length;
    await storage.saveFolderVideos('test', []);
    const afterClear = (await storage.loadCatalogVideos()).map(v => v.id);
    return { failed, afterFailure, count, afterClear };
  }, code);
  assert.equal(result.failed, true);
  assert.deepEqual(result.afterFailure, ['original', 'other']);
  assert.equal(result.count, 1202);
  assert.deepEqual(result.afterClear, ['other']);
  console.log('PASS: atomic rollback, 1,200-row replacement, unique upserts, and folder isolation');
} finally { await browser.close(); }
