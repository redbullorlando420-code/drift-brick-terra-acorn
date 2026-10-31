import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(s, c, n) { if (s.startsWith('@/'))
        return n(new URL('../src/' + s.slice(2) + '.ts', import.meta.url).href, c); try {
        return n(s, c);
    }
    catch (e) {
        if (s.startsWith('.') && !/\.[a-z]+$/i.test(s))
            return n(s + '.ts', c);
        throw e;
    } } });
const { detectYoutubeFeedGap, advanceYoutubeFeedGap, normalizeYoutubeFeedGap } = await import('../src/lib/videos/youtube-feed-gap.ts');
const { normalizeRecentPull, recentPullSuccess, recentPullReady } = await import('../src/lib/videos/recent-pull.ts');
const { youtubeRecovery } = await import('../src/lib/videos/youtube-recovery.ts');
const { confirmedPublication, prepareProviderRecent, publicationLabel } = await import('../src/lib/videos/provider-recent.ts');
const { mergeRemoteRefresh } = await import('../src/lib/videos/remote-merge.ts');
const { runRefreshRemotes } = await import('../src/lib/remote/api.ts');
const id = i => 'qa' + String(i).padStart(9, '0'), channelId = 'UC' + 'a'.repeat(22);
const channel = { id: 'yt:' + channelId, kind: 'youtube', channelId, handle: 'https://www.youtube.com/channel/' + channelId, title: 'Gap fixture', catalogCursor: 'KEEP-OLD-ARCHIVE', catalogCheckedAt: 123, newestVideoId: id(1), recentPull: { attemptedAt: 100, checkedAt: 100, failures: 0, newestVideoId: id(1) } };
const failure = (scope, at = 100, retryAt = 1000) => ({ kind: 'rate-limited', at, retryAt, cooldownScope: scope, message: 'Fixture wait', recovery: '' });
test('full feed gap detection is uncertainty; partial/empty feeds and present watermark cannot claim a gap', () => { assert(!detectYoutubeFeedGap([], id(1))); assert(!detectYoutubeFeedGap([id(2)], id(1))); assert(!detectYoutubeFeedGap(Array.from({ length: 15 }, (_, i) => id(i)), id(1))); const g = detectYoutubeFeedGap(Array.from({ length: 15 }, (_, i) => id(i + 30)), id(1), 100); assert.equal(g.status, 'detected'); assert.equal(g.anchor, id(1)); assert(normalizeYoutubeFeedGap(JSON.parse(JSON.stringify(g)))); assert(!normalizeYoutubeFeedGap({ ...g, cursor: undefined, anchor: 'bad' })); });
test('repair has an independent durable cursor and unresolved does not mean deleted', () => { const g = detectYoutubeFeedGap(Array.from({ length: 15 }, (_, i) => id(i + 30)), id(1), 100), partial = advanceYoutubeFeedGap(g, [id(30), id(29)], 'repair-cursor', false, undefined, 200); assert.equal(partial.status, 'partial'); const saved = normalizeRecentPull({ attemptedAt: 200, failures: 0, gap: partial }); assert.equal(saved.gap.cursor, 'repair-cursor'); const fresh = recentPullSuccess({ recentPull: saved }, { newestVideoId: id(40), lastCheckedAt: 300 }, 300); assert.equal(fresh.gap.anchor, id(1)); assert.equal(fresh.gap.cursor, 'repair-cursor'); assert.equal(advanceYoutubeFeedGap(partial, [id(1)], null, true, undefined, 400).status, 'resolved'); const missing = advanceYoutubeFeedGap(partial, [], null, true, undefined, 400); assert.equal(missing.status, 'unresolved'); assert.equal(missing.cursor, undefined); });
test('endpoint waits isolate RSS, archive, HTML and live; provider-wide waits hold healthy creators too', () => { const c = { ...channel, recentPull: { attemptedAt: 100, checkedAt: 80, failures: 1, failure: failure('feed'), retryAt: 1000 } }; let r = youtubeRecovery([c], 200)[0]; assert(r.lanes.feed.waiting); assert(!r.lanes.catalog.waiting); assert(!r.lanes.live.waiting); assert.equal(r.channel.recentPull.checkedAt, 80); r = youtubeRecovery([{ ...c, recentPull: { ...c.recentPull, failure: failure('page') } }], 200)[0]; assert(!r.lanes.catalog.waiting); assert(!r.lanes.live.waiting); const rows = youtubeRecovery([{ ...c, lastProviderFailure: failure('all') }, { ...channel, id: 'yt:healthy', recentPull: undefined }], 200); assert(rows.every(r => Object.values(r.lanes).every(l => l.waiting))); assert(recentPullReady({ recentPull: { retryAt: 1000, failure: failure('catalog') } }, 200)); });
const now = Date.UTC(2026, 9, 28), video = (i, kind = 'youtube') => ({ id: kind + ':' + id(i), name: 'Video ' + i, folderId: 'public', path: 'fixture', extension: kind, size: 0, mime: 'video/' + kind, addedAt: now - i * 1000, remote: { kind, videoId: id(i), channelId: 'creator' + i % 8, publishedSource: 'provider', publishedPrecision: 'instant' } });
test('confirmed publication excludes pull clocks, upcoming, live, future, and relative evidence; date-only remains explicit', () => { for (const row of [{ ...video(1), remote: { kind: 'youtube' } }, { ...video(1), remote: { ...video(1).remote, publishedPrecision: 'relative' } }, { ...video(1), remote: { ...video(1).remote, live: true } }, { ...video(1), remote: { ...video(1).remote, youtubeType: 'upcoming' } }, { ...video(1, 'twitch'), remote: { kind: 'twitch' } }, { ...video(1), addedAt: now + 1 }])
    assert.equal(confirmedPublication(row, now), 0); assert(confirmedPublication(video(1, 'twitch'), now)); assert.match(publicationLabel({ ...video(1), remote: { ...video(1).remote, publishedPrecision: 'day', publishedDate: '2026-10-27' } }), /date only/); });
test('100k recent selection yields, keeps bounded results, excludes private/hidden rows and explains personal recommendations', async () => { const rows = Array.from({ length: 100000 }, (_, i) => video(i + 1)); rows[0] = { ...rows[0], folderId: 'private' }; let yields = 0; const result = await prepareProviderRecent({ kind: 'youtube', videos: rows, hidden: { [rows[1].id]: true }, unavailable: { [rows[2].id]: true }, privateFolders: new Set(['private']), tags: { [rows[9].id]: ['racing'] }, favorites: {}, likes: {}, history: [{ id: rows[5].id, at: now - 100, source: 'play' }, { id: rows[6].id, at: now - 50, source: 'open' }], rating: () => 0, tagLiked: t => t === 'racing', creatorLiked: () => false, now }, async () => { yields++; }); assert(yields > 100); assert.equal(result.newest.length, 48); assert.equal(result.newest[0].id, rows[3].id); assert.equal(result.recommended[0].id, rows[9].id); assert.match(result.reasons[rows[9].id], /liked tag/); assert.equal(result.played[0].id, rows[6].id); assert(result.played.some(v => v.id === rows[5].id)); assert(result.recommended.length <= 24); });
test('real RSS conversion detects 15+ intervening uploads; repair stops at anchor, deduplicates and preserves archive/feed clocks', async () => { const original = globalThis.fetch, calls = []; globalThis.fetch = async (input, init) => { const url = String(input); calls.push(url); if (url.includes('/feeds/'))
    return new Response('<feed><yt:channelId>' + channelId + '</yt:channelId><author><name>Gap fixture</name></author>' + Array.from({ length: 15 }, (_, i) => '<entry><yt:videoId>' + id(i + 30) + '</yt:videoId><title>New ' + i + '</title><published>2026-10-27T10:00:00Z</published></entry>').join('') + '</feed>'); return Response.json({ contents: { twoColumnBrowseResultsRenderer: { tabs: [{ tabRenderer: { selected: true, content: { richGridRenderer: { contents: [...Array.from({ length: 45 }, (_, i) => ({ videoRenderer: { videoId: id(45 - i), title: { simpleText: 'Recovered ' + i }, publishedAt: '2026-10-26T10:00:00Z' } })), { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: 'UNNEEDED-TAIL' } } } }] } } } }] } } }); }; try {
    const recent = await runRefreshRemotes({ channels: [channel] });
    assert.equal(recent.channels[0].recentPull.gap.anchor, id(1));
    assert.equal(recent.channels[0].catalogCursor, channel.catalogCursor);
    const before = recent.channels[0].recentPull.checkedAt;
    const repair = await runRefreshRemotes({ channels: recent.channels, youtubeFeedRepair: true });
    assert.equal(calls.length, 2);
    assert.equal(repair.channels[0].recentPull.gap.status, 'resolved');
    assert.equal(repair.channels[0].catalogCursor, 'KEEP-OLD-ARCHIVE');
    assert.equal(repair.channels[0].recentPull.checkedAt, before);
    assert.equal(repair.channels[0].recentPull.newestVideoId, id(30));
    assert.equal(new Set(repair.videos.map(v => v.id)).size, repair.videos.length);
    assert.deepEqual(repair.liveCheckedIds, []);
    const merged = mergeRemoteRefresh(recent.videos, repair.videos, [channel.id], new Set(), { liveCheckedIds: [] });
    assert.equal(merged.length, 45);
    assert.equal(new Set(merged.map(v => v.id)).size, 45);
}
finally {
    globalThis.fetch = original;
} });
test('real repair obeys a two-page limit and failed continuation retains all independent positions', async () => { const original = globalThis.fetch; let calls = 0, bad = false; const gap = { anchor: id(1), detectedAt: 100, status: 'partial', recovered: 0, cursor: 'REPAIR-START' }; globalThis.fetch = async () => { calls++; if (bad)
    return Response.json({ unsupported: true }); return Response.json({ onResponseReceivedActions: [{ appendContinuationItemsAction: { continuationItems: [...Array.from({ length: 30 }, (_, i) => ({ videoRenderer: { videoId: id(calls * 100 + i), title: { simpleText: 'Page' } } })), { continuationItemRenderer: { continuationEndpoint: { continuationCommand: { token: 'REPAIR-' + calls } } } }] } }] }); }; try {
    const c = { ...channel, recentPull: { ...channel.recentPull, gap } };
    const result = await runRefreshRemotes({ channels: [c], youtubeFeedRepair: true });
    assert.equal(calls, 2);
    assert.equal(result.channels[0].recentPull.gap.status, 'partial');
    assert.equal(result.channels[0].recentPull.gap.cursor, 'REPAIR-2');
    assert.equal(result.channels[0].catalogCursor, 'KEEP-OLD-ARCHIVE');
    bad = true;
    const failed = await runRefreshRemotes({ channels: result.channels, youtubeFeedRepair: true });
    assert.equal(failed.channels[0].recentPull.gap.cursor, 'REPAIR-2');
    assert.equal(failed.channels[0].recentPull.gap.anchor, id(1));
    assert.equal(failed.channels[0].catalogCursor, 'KEEP-OLD-ARCHIVE');
    assert.equal(failed.channels[0].recentPull.checkedAt, 100);
    assert.equal(failed.channels[0].recentPull.failure.cooldownScope, 'catalog');
}
finally {
    globalThis.fetch = original;
} });
