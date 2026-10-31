import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/');
const output = checkedOutputPath(process.argv[3] ?? resolve(root, 'screenshots/stream-signal-dev.json'), [resolve(root, 'screenshots')]);
mkdirSync(dirname(output), { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.platform === 'win32' ? { channel: 'chrome' } : {}) });
const results = [];
try {
  for (const viewport of [{ name: 'desktop', width: 1280, height: 800 }, { name: 'mobile', width: 390, height: 844 }]) {
    const context = await browser.newContext({ viewport, acceptDownloads: true, permissions: ['clipboard-read', 'clipboard-write'] });
    await context.addInitScript(() => { localStorage.setItem('reelcase.pulls-paused.v1', 'true'); localStorage.setItem('reelcase.sidebar.groups.v1', JSON.stringify({ library: true, workspace: true, tools: true })); });
    await context.route('http://127.0.0.1:43123/**', route => route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false}' }));
    for (const host of ['x.com', 'www.facebook.com', 'www.instagram.com', 'www.tiktok.com']) await context.route(`https://${host}/**`, route => route.fulfill({ status: 200, contentType: 'text/html', body: '<p>Test-only platform handoff. No post was sent.</p>' }));
    const page = await context.newPage(), errors = [], result = { viewport: viewport.name, errors };
    page.setDefaultTimeout(15000); page.on('pageerror', e => errors.push(e.message)); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    const step = label => console.log(JSON.stringify({ viewport: viewport.name, stage: label }));
    const nav = async name => {
      if (viewport.name === 'mobile') await page.getByRole('button', { name: 'Open menu', exact: true }).click();
      const nav = page.getByRole('navigation', { name: 'Library navigation' });
      await nav.getByRole('button', { name, exact: true }).click();
    };
    const tab = name => page.getByRole('tab', { name, exact: true });
    const saved = () => page.locator('[data-signal-save-status]').filter({ hasText: 'Saved in this browser' }).waitFor();
    try {
      step('navigation and setup');
      await page.goto(url); await page.locator('[data-home-ready="true"]').waitFor(); await nav('Stream Signal');
      await tab('Announcements').waitFor(); await saved();
      await tab('Channel Setup').click();
      assert.equal(await page.getByLabel('Creator name', { exact: true }).inputValue(), 'notyoda');
      await page.getByLabel('Creator name', { exact: true }).fill('notyoda QA');
      await page.getByLabel('Twitch channel URL', { exact: true }).fill('https://twitch.tv.evil.test/notyoda');
      await page.getByRole('button', { name: 'Save channel setup', exact: true }).click();
      await page.getByText('Use an HTTPS Twitch channel URL, such as https://www.twitch.tv/notyoda.', { exact: true }).waitFor();
      await page.getByLabel('Twitch channel URL', { exact: true }).fill('https://www.twitch.tv/notyoda');
      await page.getByRole('button', { name: 'Save channel setup', exact: true }).click(); await saved();
      await tab('Announcements').click(); await page.getByLabel('Stream title', { exact: true }).fill('Signal QA first stream');
      await page.getByLabel('Community message', { exact: true }).fill('Testing the grid — come hang out!');
      await page.getByRole('button', { name: 'Generate announcement pack', exact: true }).click();
      const drafts = page.locator('[data-signal-draft]'); await drafts.last().waitFor(); assert.equal(await drafts.count(), 4);
      const x = page.getByLabel('X announcement draft', { exact: true });
      const original = await x.inputValue(); assert.ok(original.length <= 280);
      for (const name of ['X', 'Facebook', 'Instagram', 'TikTok']) { const text = await page.getByLabel(`${name} announcement draft`, { exact: true }).inputValue(); assert.ok(text.includes('https://www.twitch.tv/notyoda')); assert.ok(text.includes('https://www.youtube.com/@astronauta2706')); }
      const edited = 'Live & on the grid! #iRacing\nhttps://www.twitch.tv/notyoda\nhttps://www.youtube.com/@astronauta2706';
      await x.fill(edited); await page.getByRole('button', { name: 'Save X', exact: true }).click(); await saved();
      await page.getByRole('button', { name: 'Copy X', exact: true }).click();
      assert.equal((await page.evaluate(() => navigator.clipboard.readText())).replace(/\r\n/g, '\n'), edited);
      assert.equal(await page.getByRole('button', { name: 'Mark X shared', exact: true }).count(), 1);
      await page.getByRole('button',{name:'Allow draft composers',exact:true}).click(); const popupPromise = page.waitForEvent('popup'); await page.getByRole('link', { name: 'Compose on X', exact: true }).click();
      const popup = await popupPromise; await popup.waitForLoadState('domcontentloaded');
      assert.equal(new URL(popup.url()).searchParams.get('text'), edited); await popup.close();
      assert.equal(await page.getByRole('button', { name: 'Mark X shared', exact: true }).count(), 1);
      const fbPopup = page.waitForEvent('popup'); await page.getByRole('link', { name: 'Open Facebook', exact: true }).click(); await (await fbPopup).close();
      assert.equal(await page.getByRole('button', { name: 'Mark Facebook shared', exact: true }).count(), 1);
      await page.getByRole('button', { name: 'Mark X shared', exact: true }).click(); await page.getByRole('button', { name: 'Undo X shared mark', exact: true }).click(); await saved();
      step('exports and history');
      const txtDownload = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export plain text', exact: true }).click();
      const txt = await txtDownload, txtPath = output.replace(/\.json$/, `-${viewport.name}.txt`); await txt.saveAs(txtPath);
      const exported = readFileSync(txtPath, 'utf8'); assert.ok(exported.includes(edited));
      for (const site of ['https://x.com/', 'https://www.facebook.com/', 'https://www.instagram.com/', 'https://www.tiktok.com/']) assert.ok(exported.includes(site));
      await page.getByRole('button', { name: 'Review Story export', exact: true }).click();
       const pngDownload = page.waitForEvent('download'); await page.getByRole('link', { name: 'Download Story PNG', exact: true }).click();
      const png = await pngDownload, pngPath = output.replace(/\.json$/, `-story-${viewport.name}.png`); await png.saveAs(pngPath);
      const bytes = readFileSync(pngPath); assert.equal(bytes.readUInt32BE(16), 1080); assert.equal(bytes.readUInt32BE(20), 1920); result.png = pngPath;
      await page.getByLabel('Stream title', { exact: true }).fill('Signal QA second stream');
      await page.getByRole('button', { name: 'Generate announcement pack', exact: true }).click(); await saved();
      const archive = page.locator('[aria-label="Saved announcement packs"]'); await archive.getByRole('button', { name: /^Signal QA first stream/ }).click();
      assert.equal(await x.inputValue(), edited);
      // Stage an edit and immediately leave the desk; the cleanup flush/mirror
      // must retain it through navigation and a full reload.
      await page.getByLabel('Facebook announcement draft', { exact: true }).fill('Durable Facebook edit');
      await nav('Home'); await page.locator('[data-home-ready="true"]').waitFor(); await nav('Stream Signal'); await saved();
      await archive.getByRole('button', { name: /^Signal QA first stream/ }).click();
      assert.equal(await page.getByLabel('Facebook announcement draft', { exact: true }).inputValue(), 'Durable Facebook edit');
      await page.getByLabel('Facebook announcement draft', { exact: true }).fill('Immediate reload recovery');
      await page.reload(); await page.locator('[data-home-ready="true"]').waitFor(); await nav('Stream Signal'); await saved();
      await archive.getByRole('button', { name: /^Signal QA first stream/ }).click(); assert.equal(await x.inputValue(), edited);
      assert.equal(await page.getByLabel('Facebook announcement draft', { exact: true }).inputValue(), 'Immediate reload recovery');
      // Same database, different owner: its documents must not render here.
      await page.evaluate(async () => {
        const db = await new Promise((resolve, reject) => { const r = indexedDB.open('reelcase'); r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); });
        try { await new Promise((resolve, reject) => { const tx = db.transaction('activity', 'readwrite'); tx.objectStore('activity').put({ creator: 'Other owner secret' }, 'stream-signal:v1:other-user:profile'); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); }); } finally { db.close(); }
      });
      await page.reload(); await page.locator('[data-home-ready="true"]').waitFor(); await nav('Stream Signal'); await saved();
      await tab('Channel Setup').click(); assert.equal(await page.getByLabel('Creator name', { exact: true }).inputValue(), 'notyoda QA');
      result.setupScreenshot = output.replace(/\.json$/, `-setup-${viewport.name}.png`); await page.getByRole('heading', { name: 'Make it yours.', exact: true }).scrollIntoViewIfNeeded(); await page.screenshot({ path: result.setupScreenshot });
      await tab('AI Blueprint').click(); await page.getByText('Chat sets the strategy.', { exact: false }).waitFor();
      result.blueprintScreenshot = output.replace(/\.json$/, `-blueprint-${viewport.name}.png`); await page.getByRole('tabpanel').scrollIntoViewIfNeeded(); await page.screenshot({ path: result.blueprintScreenshot });
      await tab('Announcements').click();
      await archive.getByRole('button', { name: /^Signal QA first stream/ }).click();
      // Inject a write failure only for this tool, then retry the exact edit.
      await page.evaluate(() => { const put = IDBObjectStore.prototype.put; window.__signalPut = put; IDBObjectStore.prototype.put = function(value, key) { if (typeof key === 'string' && key.startsWith('stream-signal:')) throw Error('Simulated Stream Signal disk failure'); return put.call(this, value, key); }; });
      await x.fill(edited + '\nRetry saved'); await page.getByRole('button', { name: 'Save X', exact: true }).click();
      await page.getByRole('alert').filter({ hasText: 'Could not save Stream Signal' }).waitFor();
      await page.evaluate(() => { IDBObjectStore.prototype.put = window.__signalPut; });
      await page.getByRole('button', { name: 'Retry Save', exact: true }).click(); await saved();
      assert.equal(await x.inputValue(), edited + '\nRetry saved');
      // Archive paging must keep older packs and their edits, with eight
      // archive buttons mounted per page rather than an ever-growing list.
      for (let i = 0; i < 8; i++) {
        await page.getByLabel('Stream title', { exact: true }).fill(`Signal QA archive ${i}`);
        await page.getByRole('button', { name: 'Generate announcement pack', exact: true }).click(); await saved();
      }
      assert.equal(await archive.getByRole('button').count(), 8);
      await page.getByRole('button', { name: 'Older packs', exact: true }).click();
      await archive.getByRole('button', { name: /^Signal QA first stream/ }).click(); assert.equal(await x.inputValue(), edited + '\nRetry saved');
      await page.getByRole('button', { name: 'Newer packs', exact: true }).click();
      result.announcementScreenshot = output.replace(/\.json$/, `-announcements-${viewport.name}.png`);
      await page.getByRole('heading', { name: 'Stream Signal', exact: true }).scrollIntoViewIfNeeded(); await page.screenshot({ path: result.announcementScreenshot });
      result.draftsScreenshot = output.replace(/\.json$/, `-drafts-${viewport.name}.png`); await drafts.first().scrollIntoViewIfNeeded(); await page.screenshot({ path: result.draftsScreenshot });
      step('simulator controls');
      await tab('Chat Plays Lab').click(); await page.getByLabel('Voting window seconds').fill('120');
      await page.getByRole('button', { name: 'Start voting window', exact: true }).click();
      await page.getByRole('button', { name: 'Submit simulated ballot', exact: true }).click();
      await page.getByRole('button', { name: 'Submit simulated ballot', exact: true }).click();
      await page.getByRole('list', { name: 'Simulator controller log', exact: true }).getByText(/Duplicate message/).waitFor();
      await page.getByRole('button', { name: 'New message ID', exact: true }).click();
      await page.getByLabel('Simulated command sequence').fill('heal');
      await page.getByRole('button', { name: 'Submit simulated ballot', exact: true }).click();
      await page.getByRole('list', { name: 'Current simulator ballots', exact: true }).getByText('viewer_1: heal', { exact: true }).waitFor();
      await page.getByRole('button', { name: 'Close window now', exact: true }).click();
      await page.getByRole('button', { name: 'Execute next move', exact: true }).click();
      await page.getByRole('list', { name: 'Simulator controller log', exact: true }).getByText(/Executed heal/).waitFor();
      await page.getByRole('button', { name: 'Start voting window', exact: true }).click();
      await page.getByRole('button', { name: 'New message ID', exact: true }).click(); await page.getByRole('button', { name: 'Submit simulated ballot', exact: true }).click();
      await page.getByRole('button', { name: 'Emergency stop', exact: true }).click();
      assert.ok(await page.getByRole('button', { name: 'Execute next move', exact: true }).isDisabled());
      assert.equal(await page.getByRole('list', { name: 'Current simulator ballots', exact: true }).locator('li').count(), 0);
      await page.getByRole('button', { name: 'Reset simulator', exact: true }).click();
      await page.getByLabel('Voting window seconds').fill('2'); await page.getByRole('button', { name: 'Start voting window', exact: true }).click();
      await page.getByRole('button', { name: 'Submit simulated ballot', exact: true }).click();
      await page.getByRole('list', { name: 'Simulator controller log', exact: true }).getByText(/Window 1:.*won/).waitFor();
      result.labScreenshot = output.replace(/\.json$/, `-lab-${viewport.name}.png`); await page.locator('[data-signal-lab]').scrollIntoViewIfNeeded(); await page.screenshot({ path: result.labScreenshot });
      await page.getByRole('button', { name: 'Emergency stop', exact: true }).click();
      assert.equal(await page.getByRole('list', { name: 'Pending simulator moves', exact: true }).innerText(), 'No moves queued.');
      result.overflow = await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth)); assert.equal(result.overflow, 0);
      assert.deepEqual(errors, []); result.ok = true;
    } catch (e) { result.ok = false; result.failure = e.message; console.error(JSON.stringify({ viewport: viewport.name, failure: e.message })); await page.screenshot({ path: output.replace(/\.json$/, `-failure-${viewport.name}.png`) }); }
    results.push(result); await context.close();
  }
} finally { await browser.close(); }
const report = { ok: results.every(row => row.ok), url, note: 'Isolated browser profiles; platform handoffs intercepted, no social posts sent. Local disk failure simulated. Live chat, live detection and game adapter remain unconnected.', results };
writeFileSync(output, JSON.stringify(report, null, 2)); console.log(JSON.stringify(report, null, 2)); process.exitCode = report.ok ? 0 : 1;
