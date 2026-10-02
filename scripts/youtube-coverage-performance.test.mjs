import { registerHooks } from 'node:module';
import test from 'node:test';
import assert from 'node:assert/strict';
registerHooks({ resolve(s, c, n) { try { return n(s, c); } catch (e) { if (s.startsWith('.') && !/\.[a-z]+$/i.test(s)) return n(s + '.ts', c); throw e; } } });
const { youtubeCoverageIndex, youtubeCoverageIndexAsync, youtubeCoverageCounts, youtubeCatalogCoverage } = await import('../src/lib/remote/youtube-coverage.ts');
const { youtubeSourceIndex, youtubeVideosForSource, peekYoutubeSourceIndex, peekYoutubeOwner } = await import('../src/lib/remote/youtube-sources.ts');
const { adultFolderIds } = await import('../src/lib/videos/adult-providers.ts');
const { memoizeSelectorInputs } = await import('../src/lib/videos/selector-cache.ts');
const { updateYoutubeShelf } = await import('../src/lib/videos/youtube-shelf.ts');
const { mergeResolvedFollow } = await import('../src/lib/videos/follow-identity.ts');
const channel = 'UC1234567890123456789012';
const video = (i, folderId = 'legacy') => ({ id: `yt:${String(i).padStart(11, '0')}`, name: 'Upload', path: 'youtube', folderId, addedAt: i, mime: 'video/youtube', extension: 'yt', size: 0, remote: { kind: 'youtube', videoId: String(i).padStart(11, '0'), channelId: channel } });
const follow = (id, extra = {}) => ({ id, kind: 'youtube', title: id, handle: id, ...extra });
test('resolving a saved query removes its stub and preserves distinct channels sharing its name', () => {
  const resolved = follow('resolved', { channelId: channel, handle: '@Creator', importQuery: 'Display Name' });
  const pending = follow('pending', { handle: 'Display Name' });
  const distinct = follow('distinct', { channelId: 'UCAnother12345678901234', handle: '@Creator' });
  assert.deepEqual(mergeResolvedFollow([pending, distinct], resolved), [resolved, distinct]);
});

test('saved coverage separates verified empty channels from unresolved names and held fragments', () => {
  const rows = [video(1, 'hidden-source')];
  const follows = [follow('renamed-source', { channelId: channel }), follow('empty-source', { channelId: 'UCEmpty1234567890123456' }), follow('yt:pending:name'), follow('fragment', { channelId: channel, importNeedsReview: true })];
  const health = youtubeCatalogCoverage(youtubeCoverageIndex(rows), follows);
  assert.deepEqual(health, { total: 2, verified: 2, ready: 1, missing: ['empty-source'], pending: 1, review: 1 });
  const filled = youtubeCatalogCoverage(youtubeCoverageIndex([...rows, { ...video(2, 'empty-source'), remote: { ...video(2).remote, channelId: follows[1].channelId } }]), follows);
  assert.equal(filled.ready, 2); assert.deepEqual(filled.missing, []);
});
test('compact exact union counts match creator and playlist rows without retaining card indexes', () => {
  const rows = [video(1, 'owner'), video(2, 'playlist-only'), { ...video(3, 'owner'), remote: { ...video(3).remote, channelId: 'other', sourceIds: ['owner', 'list', 'list'] } }, { ...video(4, 'owner'), remote: { ...video(4).remote, live: true } }];
  rows.push({ ...rows[0], id: 'legacy-duplicate' });
  const sources = [follow('owner', { channelId: channel }), follow('renamed', { channelId: channel }), follow('ytpl:missing', { channelId: channel }), follow('list')];
  const compact = youtubeCoverageIndex(rows), counts = youtubeCoverageCounts(compact, sources);
  assert.equal(peekYoutubeSourceIndex(rows), undefined, 'counting does not construct the graph of video references');
  const full = youtubeSourceIndex(rows);
  for (const source of sources) assert.equal(counts.get(source.id), youtubeVideosForSource(full, source).length);
  assert.equal(compact.distinctVideos, 4); assert.equal(compact.duplicateRows, 1); assert.equal(compact.duplicateGroups, 1);
});
test('100k saved rows yield to input and simultaneous readers share the same compact index', async () => {
  const rows = Array.from({ length: 100_000 }, (_, i) => video(i, 'owner'));
  let turns = 0; const timer = setInterval(() => turns++, 1);
  try {
    const first = youtubeCoverageIndexAsync(rows), second = youtubeCoverageIndexAsync(rows);
    assert.equal(first, second);
    const result = await first;
    assert(turns > 0); assert.equal(result.bySource.get('owner'), 100_000);
    assert.equal(result.overlap.size, 1); assert.equal(result.overlap.get('owner').size, 1);
    assert.equal(peekYoutubeSourceIndex(rows), undefined);
    const owner = peekYoutubeOwner(rows, rows[50_000]);
    assert.equal(owner.length, 64); assert(owner.every(row => row.remote.channelId === channel));
    assert.equal(result.ownerSamples.get(channel).length, 64);
    assert.equal(await youtubeCoverageIndexAsync(rows), result);
    for (let i = 0; i < 100; i++) assert.equal(youtubeCoverageCounts(result, [follow('owner', { channelId: channel })]).get('owner'), 100_000);
  } finally { clearInterval(timer); }
});
test('live health and folder counts do not invalidate a provider shelf; privacy edits do', () => {
  const videos = Array.from({ length: 100_000 }, (_, i) => video(i));
  let calls = 0;
  const select = memoizeSelectorInputs(state => { calls++; return state.videos.filter(v => !adultFolderIds(state.folders).has(v.folderId)); }, state => [state.videos, adultFolderIds(state.folders)]);
  const state = { videos, folders: [{ id: 'legacy', adult: false, videoCount: 0 }] };
  const initial = select(state);
  for (let i = 1; i <= 100; i++) assert.equal(select({ ...state, folders: [{ ...state.folders[0], videoCount: i, lastCheckedAt: i }] }), initial);
  assert.equal(calls, 1);
  assert.equal(select({ ...state, folders: [{ id: 'legacy', adult: true }] }).length, 0);
  assert.equal(calls, 2);
});
test('small refreshes update dates, preserve equal-date metadata order and reuse shelves for Twitch-only changes', () => {
  const rows = Array.from({ length: 100_000 }, (_, i) => video(i));
  const ordered = [...rows].reverse(), next = [...rows];
  next[30] = { ...next[30], addedAt: 100_001 }; next[50] = { ...next[50], name: 'Updated title' }; next.push(video(100_002));
  const expected = [...next].sort((a, b) => b.addedAt - a.addedAt);
  assert.deepEqual(updateYoutubeShelf(rows, next, ordered, () => true), expected);
  assert.equal(updateYoutubeShelf(rows, [...rows, { ...video(100_003), remote: { kind: 'twitch' } }], ordered, () => true), ordered);
  const twitch = Array.from({ length: 5000 }, (_, i) => ({ ...video(i + 100_003), remote: { kind: 'twitch' } }));
  assert.equal(updateYoutubeShelf(rows, [...rows, ...twitch], ordered, () => true), ordered);
  const ties = [video(1), { ...video(2), addedAt: 1 }], tiedNext = [{ ...ties[0], name: 'New metadata' }, ties[1]];
  assert.deepEqual(updateYoutubeShelf(ties, tiedNext, ties, () => true), tiedNext);
  assert.equal(updateYoutubeShelf(rows, [...rows].reverse(), ordered, () => true), undefined);
});
