import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) { try { return next(specifier, context); } catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; } } });
const { planYoutubeCleanup, recordYoutubeCleanup, emptyYoutubeCleanup, normalizeYoutubeCleanup, retiredYoutubeKeys, youtubeRotationAvailable, YOUTUBE_RETIRED_KEY_LIMIT } = await import('../src/lib/videos/youtube-cleanup.ts');
const { DEFAULT_PULL_SETTINGS, normalizePullSettings } = await import('../src/lib/pull-settings.ts');
const now = Date.now(), day = 86400000;
const card = (i, extra = {}) => ({ id: `yt:${i}`, name: `Video ${i}`, folderId: 'source', path: `${i}`, size: 0, extension: 'yt', mime: 'video/youtube', addedAt: now - (500 - i) * day, remote: { kind: 'youtube', videoId: `${i}`, publishedSource: 'provider' }, ...extra });
const signals = overrides => ({ favorites: {}, likes: {}, activeId: null, previewId: null, rating: () => 0, ...overrides });

test('cleanup removes a bounded oldest unrated batch and preserves every positive signal and the source representative', async () => {
  const videos = Array.from({ length: 30 }, (_, i) => card(i));
  const stars = { 'yt:2': 3, 'yt:3': 4, 'yt:4': 5, 'yt:7': 1, 'yt:8': 2 };
  const result = await planYoutubeCleanup(videos, signals({ favorites: { 'yt:0': true }, likes: { 'yt:1': true }, activeId: 'yt:5', previewId: 'yt:6', rating: id => stars[id] ?? 0 }), { limit: 5, minAgeDays: 30, now }, async () => {});
  assert.deepEqual(result.removed.map(v => v.id), ['yt:9', 'yt:10', 'yt:11', 'yt:12', 'yt:13']);
  assert.equal(result.videos.length, 25); assert.ok(result.videos.includes(videos[29]));
  assert.equal(videos.length, 30);
  const fallback = await planYoutubeCleanup(videos.slice(7, 9), signals({ rating: id => stars[id] ?? 0 }), { limit: 10, minAgeDays: 30, now }, async () => {});
  assert.deepEqual(fallback.removed.map(v => v.id), ['yt:7']);
});

test('age, unknown dates, live/upcoming, incoming rows, custom metadata and other providers cannot be cleaned', async () => {
  const videos = [card(0, { remote: { kind: 'twitch' } }), card(1, { remote: { kind: 'youtube', videoId: '1', publishedSource: 'unknown' } }),
    card(2, { addedAt: now - day }), card(3, { remote: { kind: 'youtube', videoId: '3', live: true } }), card(4, { remote: { kind: 'youtube', videoId: '4', youtubeType: 'upcoming' } }),
    card(5), card(6), card(7), card(8, { isSample: true })];
  const result = await planYoutubeCleanup(videos, signals({ managed: id => id === 'yt:6' }), { limit: 20, minAgeDays: 30, now, exclude: new Set(['yt:5']) }, async () => {});
  assert.deepEqual(result.removed.map(v => v.id), ['yt:7']);
});

test('shared playlists keep representatives and a liked or rated alias protects every duplicate identity', async () => {
  const videos = [card(0, { remote: { kind: 'youtube', videoId: 'shared', sourceIds: ['playlist'] } }), card(1), card(2, { id: 'alias', remote: { kind: 'youtube', videoId: 'shared' } }),
    card(3, { folderId: 'playlist' }), card(4)];
  const result = await planYoutubeCleanup(videos, signals({ likes: { alias: true } }), { limit: 10, minAgeDays: 30, now }, async () => {});
  assert.deepEqual(result.removed.map(v => v.id), ['yt:1']);
  assert.ok(result.videos.includes(videos[0])); assert.ok(result.videos.includes(videos[3])); assert.ok(result.videos.includes(videos[4]));
});

test('100k cleanup yields, uses bounded sorting and cancels before reading the rest', async () => {
  let reads = 0;
  const videos = Array.from({ length: 100000 }, (_, i) => ({ ...card(i % 400), id: `yt:large-${i}`, get remote() { reads++; return { kind: 'youtube', videoId: `large-${i}`, publishedSource: 'provider' }; } }));
  let turns = 0;
  const cancelled = planYoutubeCleanup(videos, signals(), { limit: 100, minAgeDays: 30, now }, async () => { if (++turns === 3) throw Error('cancelled'); });
  assert.equal(reads, 0); await assert.rejects(cancelled, /cancelled/); assert.ok(reads < 10000);
  const sort = Array.prototype.sort;
  Array.prototype.sort = function(compare) { assert.ok(this.length <= 232, 'only the bounded candidate reserve can be sorted'); return sort.call(this, compare); };
  try {
    const result = await planYoutubeCleanup(videos, signals(), { limit: 100, minAgeDays: 30, now }, async () => {});
    assert.equal(result.removed.length, 100); assert.equal(result.videos.length, 99900);
  } finally { Array.prototype.sort = sort; }
});

test('rotation honors disabled and zero caps, combined pressure and a per-pull replacement budget', () => {
  const counts = { total: 100, youtube: 80, twitch: 20, adult: 0, other: 0 };
  const settings = { ...DEFAULT_PULL_SETTINGS, youtubeMaxEntries: 80, remoteMaxEntries: 100, youtubeCleanupBatch: 3 };
  assert.equal(youtubeRotationAvailable(counts, settings), true);
  assert.equal(youtubeRotationAvailable(counts, settings, 0), false);
  assert.equal(youtubeRotationAvailable(counts, { ...settings, youtubeAutoCleanup: false }), false);
  assert.equal(youtubeRotationAvailable(counts, { ...settings, youtubeMaxEntries: 0 }), false);
  assert.equal(youtubeRotationAvailable(counts, { ...settings, remoteMaxEntries: 0 }), false);
  assert.equal(youtubeRotationAvailable(counts, { ...settings, remoteMaxEntries: 97 }), true, 'successful fresh responses may recover a lowered cap in small batches');
  const normalized = normalizePullSettings({ youtubeCleanupBatch: 999999, youtubeCleanupMinAgeDays: 0, youtubeAutoCleanup: false });
  assert.equal(normalized.youtubeCleanupBatch, 1000); assert.equal(normalized.youtubeCleanupMinAgeDays, 0); assert.equal(normalized.youtubeAutoCleanup, false);
  assert.equal(normalizePullSettings({}).youtubeCleanupBatch, 100);
});

test('retirement memory is bounded, survives serialization and retains cumulative cleanup counts', () => {
  let state = emptyYoutubeCleanup();
  for (let i = 0; i < 12; i++) state = recordYoutubeCleanup(state, Array.from({ length: 1000 }, (_, n) => card(i * 1000 + n)), now + i);
  assert.equal(state.recentKeys.length, YOUTUBE_RETIRED_KEY_LIMIT); assert.equal(state.removedCount, 12000); assert.equal(state.lastRemoved, 1000);
  const restored = normalizeYoutubeCleanup(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(restored, state); assert.equal(retiredYoutubeKeys(state), retiredYoutubeKeys(state));
  assert.equal(retiredYoutubeKeys(restored).has('yt:11999'), true); assert.equal(retiredYoutubeKeys(restored).has('yt:0'), false);
});

test('Twitch and Adult plans preserve ratings, source representatives, local files, live and unknown ages', async () => {
  for(const group of ['twitch','adult']) {
    const kind=group==='adult'?'eporner':'twitch';
    const videos=Array.from({length:12},(_,i)=>({...card(i),id:`${kind}:${i}`,folderId:`${kind}:catalog`,remote:{kind,videoId:String(i),channelId:i<6?'one':'two',...(i===3?{live:true}:{})},...(i===4?{addedAt:0}:{})}));
    const local={...card(50),remote:undefined};videos.push(local);
    const result=await planYoutubeCleanup(videos,signals({likes:{[videos[0].id]:true},favorites:{[videos[1].id]:true},rating:id=>id===videos[2].id?5:0}),{limit:4,minAgeDays:30,now,group},async()=>{});
    assert.deepEqual(result.removed.map(v=>v.id),[`${kind}:5`,`${kind}:6`,`${kind}:7`,`${kind}:8`]);
    for(const i of [0,1,2,3,4,11])assert.ok(result.videos.includes(videos[i]));assert.ok(result.videos.includes(local));
  }
  const normalized=normalizePullSettings({twitchAutoCleanup:false,adultAutoCleanup:false,twitchCleanupBatch:100000,adultCleanupMinAgeDays:0});
  assert.equal(normalized.twitchAutoCleanup,false);assert.equal(normalized.adultAutoCleanup,false);assert.equal(normalized.twitchCleanupBatch,1000);assert.equal(normalized.adultCleanupMinAgeDays,0);
});

test('canonical aliases retire atomically without exceeding the actual row budget', async () => {
  const first=card(0),alias={...first,id:'legacy-alias'},other=card(1),keeper=card(2);
  const small=await planYoutubeCleanup([first,alias,other,keeper],signals(),{limit:1,minAgeDays:30,now},async()=>{});
  assert.deepEqual(small.removed.map(v=>v.id),[other.id], 'skip an oversized duplicate identity and use a fitting reserved candidate');
  const both=await planYoutubeCleanup([first,alias,other,keeper],signals(),{limit:2,minAgeDays:30,now},async()=>{});
  assert.deepEqual(both.removed.map(v=>v.id),[first.id,alias.id]);
});

test('retirement buckets keep other sources history bounded during heavy pulls and preserve legacy counters', () => {
  const tw={...card(0),id:'tw:bucket-old',remote:{kind:'twitch',videoId:'old'}};
  const adult={...card(1),id:'eporner:bucket-old',remote:{kind:'eporner',videoId:'old'}};
  let state=recordYoutubeCleanup({...emptyYoutubeCleanup(),removedCount:40},[tw,adult],now);
  for(let i=0;i<12;i++)state=recordYoutubeCleanup(state,Array.from({length:1000},(_,n)=>card(i*1000+n)),now+i);
  assert.equal(state.recentKeys.length,YOUTUBE_RETIRED_KEY_LIMIT+2);assert.ok(retiredYoutubeKeys(state).has(tw.id));assert.ok(retiredYoutubeKeys(state).has(adult.id));
  assert.equal(state.groups.youtube.removedCount,12000);assert.equal(state.groups.twitch.removedCount,1);assert.equal(state.groups.adult.removedCount,1);assert.equal(state.removedCount,12042);
  assert.deepEqual(normalizeYoutubeCleanup(JSON.parse(JSON.stringify(state))),state);
});

test('zero minimum age can rotate recent known entries while ratings, unknown dates and source representatives stay', async()=>{
  const rows=[card(0,{addedAt:now-1000}),card(1,{addedAt:now-500}),card(2,{addedAt:now}),card(3,{remote:{kind:'youtube',videoId:'unknown',publishedSource:'unknown'}})];
  const plan=await planYoutubeCleanup(rows,signals({rating:id=>id===rows[1].id?5:0}),{limit:2,minAgeDays:0,now},async()=>{});
  assert.deepEqual(plan.removed.map(row=>row.id),[rows[0].id,rows[2].id]);assert.ok(plan.videos.includes(rows[1]));assert.ok(plan.videos.includes(rows[3]));
});
