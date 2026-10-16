import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  try { return next(specifier, context); } catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; }
} });
const { prepareLandingOverview, prepareLandingExpanded, landingShuffleRank } = await import('../src/lib/videos/landing-shelves.ts');
const { takeBestMapped } = await import('../src/lib/videos/bounded-picks.ts');
const { personalRankScore } = await import('../src/lib/videos/ranking-core.ts');
const { isOfflineTwitchCatalogCard } = await import('../src/lib/videos/twitch-catalog-order.ts');
const card = (i, kind) => ({ id: `video:${i}`, folderId: `folder:${i % 17}`, name: `Title ${i}`, path: `path/${i}`, extension: 'mp4', mime: 'video/mp4', size: 0, addedAt: 2_000_000_000 - i * 50000, duration: i % 5 ? 500 : 2400, genre: `Genre ${i % 7}`, ...(kind ? { remote: { kind, videoId: String(i), live: i % 113 === 0 } } : {}), isSample: i % 101 === 0 });

test('incremental Landing shelves preserve existing priorities, seeded ties, and three-per-folder ranking', async () => {
  const videos = Array.from({ length: 1700 }, (_, i) => card(i, i % 3 === 0 ? 'youtube' : i % 3 === 1 ? 'twitch' : undefined));
  const youtube = videos.filter(v => v.remote?.kind === 'youtube'), twitch = videos.filter(v => v.remote?.kind === 'twitch');
  twitch[9] = { ...twitch[9], extension: 'live', remote: { ...twitch[9].remote, live: false } };
  const rating = id => Number(id.split(':')[1]) % 6, watchScore = id => Number(id.split(':')[1]) % 13;
  const favorites = { 'video:11': true, 'video:17': true }, likes = { 'video:23': true }, viewCounts = { 'video:13': 5, 'video:19': 8 };
  const seed = 1234, now = 2_100_000_000, hour = Math.floor(now / 3_600_000);
  let turns = 0;
  const actual = await prepareLandingOverview({ videos, youtube, twitch, rating, watchScore, favorites, likes, viewCounts, seed, now }, async () => { turns++; });
  const recent = takeBestMapped(videos, 48, video => !video.remote && !video.isSample ? { video, age: Math.floor(Math.max(0, now - video.addedAt) / (7 * 86_400_000)), rank: landingShuffleRank(`${video.id}:recent`, seed) } : null, (a, b) => a.age - b.age || a.rank - b.rank).map(r => r.video);
  const fresh = takeBestMapped(videos, 48, video => !video.isSample && !video.remote?.live ? { video, views: viewCounts[video.id] ?? 0, rank: landingShuffleRank(`${video.id}:${hour}`, hour) } : null, (a,b) => a.views - b.views || a.rank - b.rank).map(r => r.video);
  const perFolder = new Map();
  const rated = videos.filter(v => !v.remote && !v.isSample && rating(v.id) >= 3).map(video => ({ video, score: personalRankScore({ rating: rating(video.id), watch: watchScore(video.id), favorite: Boolean(favorites[video.id]), liked: Boolean(likes[video.id]) }) }))
    .sort((a,b) => rating(b.video.id) - rating(a.video.id) || b.score - a.score || landingShuffleRank(a.video.id, seed) - landingShuffleRank(b.video.id, seed))
    .filter(({ video }) => { const n = perFolder.get(video.folderId) ?? 0; perFolder.set(video.folderId,n+1); return n<3; }).map(r => r.video);
  const provider = [...youtube, ...twitch], offline = v => v.remote?.kind === 'twitch' && isOfflineTwitchCatalogCard(v);
  const latest = takeBestMapped(provider, 48, v => !v.remote?.live && !v.isSample && !offline(v) ? v : null, (a,b) => b.addedAt-a.addedAt || a.id.localeCompare(b.id));
  const week = takeBestMapped(provider, 160, v => v.remote && !offline(v) && now-v.addedAt>=-300000 && now-v.addedAt<7*86_400_000 ? v : null, (a,b) => b.addedAt-a.addedAt || a.id.localeCompare(b.id));
  assert.deepEqual(actual, { recent, fresh, rated, latest, week }); assert.ok(turns >= 10);
});

test('expanded shelves retain complete provider arrays, bounded local previews and stable genre ordering', async () => {
  const videos = Array.from({ length: 4000 }, (_, i) => card(i)), youtube = videos.slice(1000,2000).map(v => ({ ...v, isSample: false, remote: { kind: 'youtube' } })), twitch = videos.slice(2000,3000).map(v => ({ ...v, isSample: false, remote: { kind: 'twitch' } }));
  const folders = Array.from({ length: 17 }, (_, i) => ({ id: `folder:${i}`, name: `Folder ${i}`, kind: 'directory', videoCount: 200 }));
  let turns = 0;
  const output = await prepareLandingExpanded(videos, youtube, twitch, folders, async () => { turns++; });
  assert.equal(output.youtube, youtube); assert.equal(output.twitch, twitch);
  assert.equal(output.youtube.length,1000); assert.equal(output.twitch.length,1000);
  assert.deepEqual(output.shorts, videos.filter(v => !v.isSample && (v.collection === 'shorts' || v.duration>0 && v.duration<1800)).slice(0,18));
  assert.deepEqual(output.genres, videos.filter(v => v.genre).sort((a,b) => a.genre.localeCompare(b.genre)).filter(v => !v.isSample).slice(0,24));
  assert.equal(output.folders.size,12);
  for (const folder of folders.slice(0,12)) assert.deepEqual(output.folders.get(folder.id), videos.filter(v=>v.folderId===folder.id).slice(0,24));
  assert.ok(turns>=12);
});

test('Landing preparation yields before reading and cancellation stops every large phase', async () => {
  let reads = 0, turns = 0;
  const videos = Array.from({ length: 100000 }, (_, i) => ({ ...card(i), get isSample() { reads++; return false; } }));
  const input = { videos, youtube: [], twitch: [], favorites: {}, likes: {}, viewCounts: {}, seed: 1, now: 2_100_000_000, rating: () => 5, watchScore: () => 0 };
  const work = prepareLandingOverview(input, async () => { if (++turns===3) throw Error('replaced'); });
  assert.equal(reads,0);
  await assert.rejects(work,/replaced/); assert.ok(reads>0 && reads<=1024);
  reads=0;
  await assert.rejects(prepareLandingExpanded(videos, [], [], [], async () => { throw Error('hidden'); }),/hidden/);
  assert.equal(reads,0);
});
