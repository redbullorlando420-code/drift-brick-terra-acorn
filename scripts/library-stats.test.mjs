import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  try { return next(specifier, context); } catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; }
} });
const { calculateLibraryStats } = await import('../src/lib/videos/library-stats.ts');
const { statsVideo } = await import('../src/lib/videos/stats-video.ts');
const video = (id, kind) => ({ id, folderId: kind || 'local', name: id, path: id, extension: 'mp4', mime: 'video/mp4', addedAt: 1, size: kind ? 0 : 1024, duration: 100, ...(kind ? { remote: { kind, videoId: id, channelName: 'Creator' } } : {}) });
const input = videos => ({ videos, folders: [], tags: {}, favorites: {}, likes: {}, unavailable: {}, history: [], cameCounts: {}, progress: {}, resumeProgress: {}, viewCounts: {}, pullHistory: [], ratings: {}, tagLikes: {}, watchTime: {} });
test('worker statistics retain complete counts, rating signals, missing favorites and resume aliases', () => {
  const videos = [video('local'), video('youtube','youtube'),video('twitch','twitch'),video('adult','eporner')];
  const result = calculateLibraryStats({ ...input(videos), tags: { local: ['science'],youtube: ['science'],adult: ['genre-solo'] }, ratings: { youtube: 5 }, favorites: { youtube: true,missing: true }, likes: { local: true }, unavailable: { twitch: { reason: 'missing' }, gone: { reason: 'removed' } }, cameCounts: { adult: 4 },viewCounts: { adult: 3,youtube: 2 },resumeProgress: { 'id:youtube': { t: 12,d: 100,at: 2 } }, watchTime: { youtube: { preview: 90,fullscreen: 180 } } });
  assert.equal(result.summary.localTitles,1); assert.equal(result.summary.remoteTitles,3); assert.equal(result.summary.publicTopicTitles,3);
  assert.equal(result.summary.resumedTitles,1); assert.equal(result.summary.totalViews,5); assert.equal(result.summary.totalBytes,1024);
  assert.equal(result.summary.topTags[0][0],'science'); assert.equal(result.summary.topTags[0][1],2);
  assert.deepEqual(result.favoriteHealth,{ saved: 2,resolved: 1,missing: 1 });
  assert.equal(result.unavailableCount, 2);
  assert.equal(result.adultTagStats.adultTitles,1); assert.equal(result.adultSnapshot.titles,1);
  assert.equal(result.markedTitles,1); assert.equal(result.totalMarks,4); assert.equal(result.watchScores.videos[0].video.id,'youtube');
  assert.equal(result.youtubeHealth.distinctVideos,1); assert.ok(!('byChannel' in result.youtubeHealth));
});
test('invalid resume marks are not reported as usable resume positions', () => {
  const result = calculateLibraryStats({ ...input([video('one'),video('two')]), progress: { one: {t: -1,d: 100,at: 2},two: {t: 50,d: 0,at: 2} } });
  assert.equal(result.summary.resumedTitles,0);
});

test('the worker projection preserves statistics and drops playback-only payloads', () => {
  const videos = [
    { ...video('youtube', 'youtube'), name: 'Space science', description: 'Learn about astronomy', tagline: 'hardware', remote: { kind: 'youtube', videoId: 'abcdefghijk', channelId: 'UC-test', channelName: 'Creator', sourceIds: ['youtube', 'playlist'], comments: [{ id: 'huge', body: 'chat '.repeat(200_000) }], viewers: 45, observedAt: 1, views: 999 } },
    { ...video('adult', 'reddit'), poster: 'https://example.com/a.jpg', remote: { kind: 'reddit', sourceKinds: ['redgifs'], videoId: 'a', channelName: 'Artist', watchUrl: 'https://example.com/a', embedUrl: 'https://example.com/embed/a', previewUrl: 'https://example.com/a.jpg', thumbFallbacks: ['https://example.com/b.jpg'] } },
    { ...video('local'), src: 'file:///movies/one.mp4', genre: 'Documentary' },
  ];
  const projected = videos.map(statsVideo);
  const state = { ...input(videos), tags: { youtube: ['science'], adult: ['genre-solo'] }, folders: [{ id: 'youtube', name: 'Creator', kind: 'youtube', videoCount: 1 }, { id: 'playlist', name: 'Playlist', kind: 'youtube', videoCount: 1 }], favorites: { youtube: true, gone: true }, likes: { adult: true }, ratings: { youtube: 5 }, resumeProgress: { 'file:///movies/one.mp4': { t: 15, d: 100, at: 3 } }, viewCounts: { adult: 2 }, cameCounts: { adult: 3 }, watchTime: { youtube: { preview: 90, fullscreen: 180 } } };
  const now = Date.now;
  let full, compact;
  try { Date.now = () => 1791833847000; full = calculateLibraryStats(state); compact = calculateLibraryStats({ ...state, videos: projected }); }
  finally { Date.now = now; }
  // Bounded review/watch rows intentionally contain the projected cards.
  const metrics = ({ watchScores, topicReviewQueue, ...result }) => ({ ...result, watchScores: { ...watchScores, videos: watchScores.videos.map(({ video, ...row }) => ({ ...row, id: video.id })) }, topicReviewQueue: topicReviewQueue.map(video => video.id) });
  assert.deepEqual(metrics(compact), metrics(full));
  assert.ok(JSON.stringify(projected).length < 3000);
  assert.ok(videos[0].remote.comments[0].body.length > 900_000);
  assert.ok(!('comments' in projected[0].remote));
  assert.ok(!('poster' in projected[0]));
  assert.ok(!('remote' in projected[2]));
});
test('large libraries keep complete source totals but return bounded review and watch rows', () => {
  const videos = Array.from({ length: 100_000 }, (_, i) => video(String(i),'youtube'));
  const result = calculateLibraryStats(input(videos));
  assert.equal(result.summary.youtubeTitles,100_000); assert.equal(result.youtubeHealth.distinctVideos,100_000);
  assert.ok(result.topicReviewQueue.length <= 500); assert.ok(result.watchScores.videos.length <= 8);
  assert.ok(JSON.stringify(result).length < 500_000, 'worker does not clone complete per-channel catalogs back into UI memory');
});
