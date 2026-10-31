import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { fromJSON } from 'seroval';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { checkedUrl, checkedOutputPath } from './browser-guard.mjs';
const url = checkedUrl(process.argv[2] ?? 'http://127.0.0.1:8080/'), output = checkedOutputPath(process.argv[3] ?? 'screenshots/recent-discovery-dev.json', [resolve('screenshots')]), browser = await chromium.launch({ channel: 'chrome', headless: true }), reports = [];
const find = v => { if (!v || typeof v !== 'object')
    return; if (Array.isArray(v.channels))
    return v; for (const x of Object.values(v)) {
    const f = find(x);
    if (f)
        return f;
} };
try {
    for (const viewport of [{ name: 'desktop', width: 1440, height: 1000 }, { name: 'mobile', width: 390, height: 844 }]) {
        const context = await browser.newContext({ viewport }), page = await context.newPage(), errors = [], requests = [], checks = [];
        let globalBlock = false;
        const report = { viewport: viewport.name, errors, checks };
        reports.push(report);
        page.setDefaultTimeout(30000);
        page.on('pageerror', e => errors.push(e.message));
        page.on('console', m => { if (m.type() === 'error' && !/ERR_ABORTED/.test(m.text()))
            errors.push(m.text()); });
        await context.addInitScript(() => { localStorage.setItem('reelcase.pull-settings.v1', JSON.stringify({ automaticPulls: false, requestGapMs: 250 })); localStorage.setItem('reelcase.pulls-paused.v1', 'false'); });
        await context.route('http://127.0.0.1:43123/**', r => r.fulfill({ contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: '{"ok":false}' }));
        for (const host of ['i.ytimg.com', 'thumb.example.test'])
            await context.route('https://' + host + '/**', r => r.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><rect width="320" height="180" fill="#25405a"/><text x="20" y="95" font-size="25" fill="white">Recent release fixture</text></svg>' }));
        for (const host of ['www.youtube.com', 'player.twitch.tv'])
            await context.route('https://' + host + '/**', r => r.fulfill({ contentType: 'text/html', body: '<p>Controlled provider player</p>' }));
        await context.route('**/_serverFn/**', async (route) => { let data; try {
            data = find(fromJSON(JSON.parse(route.request().postData() ?? '{}')));
        }
        catch { } let result = { comments: [], note: 'Fixture' }; if (data) {
            requests.push(data);
            const now = Date.now();
            result = { videos: [], channels: data.channels.map(c => ({ ...c, ...(data.youtubeFeedRepair ? { recentPull: { ...c.recentPull, attemptedAt: now, gap: { ...c.recentPull.gap, status: 'resolved', cursor: undefined, checkedAt: now, recovered: 44 } } } : data.youtubeCatalog ? { catalogCursor: 'ARCHIVE-NEXT', catalogCheckedAt: now } : { recentPull: { ...c.recentPull, attemptedAt: now, checkedAt: now, failures: 0, failure: undefined, retryAt: undefined } }) })), refreshedIds: data.channels.map(c => c.id), liveCheckedIds: [], retryAt: {} };
            if (globalBlock && data.youtubeLiveOnly) {
                const failure = { kind: 'rate-limited', at: now, retryAt: now + 600000, cooldownScope: 'all', message: 'Provider-wide fixture wait', recovery: 'Wait for the provider' };
                result = { videos: [], channels: data.channels.map(c => ({ ...c, lastLiveFailure: failure })), refreshedIds: [], liveCheckedIds: [], retryAt: {}, providerRetryAt: failure.retryAt, providerCooldownScope: 'all' };
            }
        } await route.fulfill({ contentType: 'application/json', body: JSON.stringify({ result, context: {} }) }); });
        const nav = async (name) => { if (viewport.name === 'mobile')
            await page.getByRole('button', { name: 'Open menu', exact: true }).click(); await page.getByRole('navigation', { name: 'Library navigation' }).getByRole('button', { name: new RegExp('^' + name + '(?:\\s+\\d+)?$') }).click(); };
        try {
            await page.goto(url);
            await page.locator('[data-home-ready="true"]').waitFor();
            await page.evaluate(async () => { const now = Date.now(), cid = 'UC' + 'a'.repeat(22), vid = i => 'qa' + String(i).padStart(9, '0'), channels = [{ id: 'yt:' + cid, kind: 'youtube', channelId: cid, handle: 'https://www.youtube.com/channel/' + cid, title: 'YouTube recent fixture', catalogCursor: 'ARCHIVE-SAVED', catalogCheckedAt: 100, newestVideoId: vid(99), recentPull: { attemptedAt: now - 1000, checkedAt: now - 5000, failures: 1, newestVideoId: vid(99), retryAt: now + 600000, failure: { kind: 'rate-limited', cooldownScope: 'feed', at: now - 1000, retryAt: now + 600000, message: 'Feed-only fixture wait', recovery: 'Archive and live remain separate' }, gap: { anchor: vid(1), detectedAt: now - 1000, status: 'detected', recovered: 0 } } }, { id: 'tw:recent', kind: 'twitch', channelId: 'recent', handle: 'recent', title: 'Twitch recent fixture' }]; localStorage.setItem('reelcase.follows.v1', JSON.stringify({ channels, savedAt: now })); localStorage.setItem('reelcase.prefs.v4', JSON.stringify({ tags: { ['youtube:' + vid(5)]: ['racing'], ['twitch:' + vid(5)]: ['racing'] }, metadataProvenance:Object.fromEntries(['youtube','twitch'].map(kind=>[kind+':'+vid(5),{tags:{racing:'manual'},lockedFields:['tags'],updatedAt:now}])) })); localStorage.setItem('reelcase.media-feedback.v1', JSON.stringify({ ratings: {}, watchTime: {}, creatorFavorites: {}, tagLikes: { racing: true } })); const rows = ['youtube', 'twitch'].flatMap(kind => Array.from({ length: 48 }, (_, i) => { const videoId = vid(i); return { id: kind + ':' + videoId, folderId: kind === 'youtube' ? 'yt:' + cid : 'tw:recent', name: kind + ' release ' + i, path: 'fixture', extension: kind === 'youtube' ? 'yt' : 'vod', mime: 'video/' + kind, size: 0, duration: 1200, addedAt: i === 47 ? now + 86400000 : now - i * 60000, poster: 'https://thumb.example.test/poster.jpg', remote: { kind, videoId, channelId: kind === 'youtube' ? cid : 'recent', channelName: kind + ' creator', youtubeType: kind === 'youtube' ? 'upload' : undefined, publishedSource: i === 46 ? undefined : 'provider', publishedPrecision: i === 46 ? 'unknown' : i === 45 ? 'relative' : 'instant', embedUrl: kind === 'youtube' ? 'https://www.youtube.com/embed/' + videoId : 'https://player.twitch.tv/?video=v12345678' } }; })); const db = await new Promise((res, rej) => { const r = indexedDB.open('reelcase'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); try {
                await new Promise((res, rej) => { const tx = db.transaction(['remote-cache', 'videos', 'activity'], 'readwrite'), s = tx.objectStore('remote-cache'); tx.objectStore('activity').put({tags:{['youtube:'+vid(5)]:['racing'],['twitch:'+vid(5)]:['racing']},metadataProvenance:Object.fromEntries(['youtube','twitch'].map(kind=>[kind+':'+vid(5),{tags:{racing:'manual'},lockedFields:['tags'],updatedAt:now}]))},'preferences');tx.objectStore('activity').put({ratings:{},ratingHistory:{},notes:{},creatorRatings:{},creatorLikes:{},creatorFavorites:{},tagLikes:{racing:true},tagHeartHistory:{racing:now},watchTime:{},savedAt:now},'feedback');s.put({ folders: channels.map(c => ({ id: c.id, kind: c.kind, name: c.title, path: 'fixture', videoCount: 48 })), checkedAt: now }, 'meta'); for (const row of rows) {
                    s.put(row, 'video:' + row.id);
                    tx.objectStore('videos').put(row);
                } tx.oncomplete = res; tx.onerror = () => rej(tx.error); });
            }
            finally {
                db.close();
            } });
            await page.reload();
            await page.locator('[data-home-ready="true"]').waitFor();
            await page.getByText(/^96 indexed$/).first().waitFor();
            for (const kind of ['youtube', 'twitch']) {
                await nav(kind === 'youtube' ? 'YouTube' : 'Twitch');
                const recent = page.locator('[data-provider-recent="' + kind + '"]');
                await recent.waitFor();
                await recent.scrollIntoViewIfNeeded();
                await page.waitForFunction(kind => document.querySelector('[data-provider-recent="' + kind + '"]')?.getAttribute('aria-busy') === 'false', kind);
                await page.waitForFunction(kind=>document.querySelectorAll('[data-provider-recent="'+kind+'"] [data-recent-video]').length===8,kind);assert.equal(await recent.locator('[data-recent-video]').count(), 8);
                assert.equal(await recent.locator('[data-recent-video]').first().getAttribute('data-recent-video'), kind + ':qa000000000');
                assert.equal(await recent.getByText(/release (45|46|47)$/).count(), 0);
                await recent.getByRole('button', { name: 'Show 8 more recent videos', exact: true }).click();
                assert.equal(await recent.locator('[data-recent-video]').count(), 16);
                await recent.getByRole('button', { name: 'Recommended recent', exact: true }).click();
                await recent.getByText('Matches your liked tag #racing', { exact: true }).waitFor();
                assert.equal(await recent.locator('[data-recent-video]').first().getAttribute('data-recent-video'), kind + ':qa000000005');
                await recent.getByRole('button', { name: 'Newest published', exact: true }).click();
                await recent.scrollIntoViewIfNeeded();
                await page.screenshot({ path: output.replace('.json', '-' + viewport.name + '-' + kind + '.png') });
                await recent.locator('[data-video-card-open]').first().click();
                await page.locator('[data-media-viewer] iframe').waitFor();
                await page.getByRole('button', { name: 'Watch now', exact: true }).click();
                await page.locator('[data-player-keyboard="provider"] iframe').waitFor();
                await page.getByRole('button', { name: 'Back to library', exact: true }).click();
                await recent.getByRole('button', { name: 'Recently opened', exact: true }).click();
                await recent.getByText(/Opened /).first().waitFor();
                assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
                checks.push(kind + ' publication sorting excludes future/unknown/relative dates, grows 8→16, personalizes liked tags and opens the player; last open time is separate');
            }
            await nav('YouTube');
            const panel = page.getByRole('region', { name: 'YouTube pull control' }), recovery = panel.locator('[data-youtube-endpoint-recovery]');
            await recovery.locator('summary').click();
            assert.equal(await recovery.getByRole('button', { name: 'Retry recent feed', exact: true }).isEnabled(), false);
            assert(await recovery.getByRole('button', { name: 'Continue healthy archive', exact: true }).isEnabled());
            assert(await recovery.getByRole('button', { name: 'Check live lane', exact: true }).isEnabled());
            await panel.locator('[data-feed-gap-repair]').scrollIntoViewIfNeeded();
            await page.screenshot({ path: output.replace('.json', '-' + viewport.name + '-repair.png') });
            await panel.getByRole('button', { name: 'Repair feed gap', exact: true }).click();
            await panel.getByText('Feed gap repaired: the saved upload watermark was found.', { exact: true }).waitFor();
            assert.equal(requests.filter(r => r.youtubeFeedRepair).length, 1);
            await page.waitForFunction(() => JSON.parse(localStorage.getItem('reelcase.follows.v1')).channels.find(c => c.kind === 'youtube').recentPull.gap.status === 'resolved');
            let saved = await page.evaluate(() => JSON.parse(localStorage.getItem('reelcase.follows.v1')).channels.find(c => c.kind === 'youtube'));
            assert.equal(saved.catalogCursor, 'ARCHIVE-SAVED');
            assert.equal(saved.newestVideoId, 'qa000000099');
            assert.equal(saved.recentPull.failure.cooldownScope, 'feed');
            await recovery.getByRole('button', { name: 'Continue healthy archive', exact: true }).click();
            await panel.getByRole('status').filter({ hasText: /1 checked/ }).waitFor();
            assert.equal(requests.filter(r => r.youtubeCatalog).length, 1);
            await page.reload();
            await page.locator('[data-home-ready="true"]').waitFor();
            await nav('YouTube');
            await page.locator('[data-provider-recent="youtube"] [data-recent-video]').first().waitFor();
            saved = await page.evaluate(() => JSON.parse(localStorage.getItem('reelcase.follows.v1')).channels.find(c => c.kind === 'youtube'));
            assert.equal(saved.recentPull.gap.status, 'resolved');
            assert.equal(saved.catalogCursor, 'ARCHIVE-NEXT');
            assert.equal(saved.recentPull.failure.cooldownScope, 'feed');
            globalBlock = true;
            const finalRecovery = page.locator('[data-youtube-endpoint-recovery]');
            await finalRecovery.locator('summary').click();
            await finalRecovery.getByRole('button', { name: 'Check live lane', exact: true }).click();
            await finalRecovery.getByText(/Provider-wide wait until/).waitFor();
            for (const name of ['Retry recent feed', 'Continue healthy archive', 'Check live lane'])
                assert.equal(await finalRecovery.getByRole('button', { name, exact: true }).isEnabled(), false);
            checks.push('Provider-wide response disables every affected endpoint without clearing saved observations');
            checks.push('Feed-only hold leaves archive/live ready; explicit gap repair preserves feed watermark and normal archive cursor, healthy archive resumes independently and all checkpoints survive reload');
            assert.deepEqual(errors, []);
        }
        catch (e) {
            report.error = e.stack;report.fixture=await page.evaluate(()=>({prefs:JSON.parse(localStorage.getItem('reelcase.prefs.v4')??'{}'),feedback:JSON.parse(localStorage.getItem('reelcase.media-feedback.v1')??'{}')}));
            report.body = (await page.locator('body').innerText()).slice(-12000);
            await page.screenshot({ path: output.replace('.json', '-' + viewport.name + '-failure.png') }).catch(() => { });
            throw e;
        }
        finally {
            await context.close();
            await writeFile(output, JSON.stringify({ ok: reports.every(r => !r.error), reports, limitation: 'Isolated desktop/mobile Chrome with controlled metadata/player documents. No actual provider media, login, physical phone or upstream throughput claim.' }, null, 2));
        }
    }
}
finally {
    await browser.close();
}
console.log(JSON.stringify({ ok: true, reports }, null, 2));
