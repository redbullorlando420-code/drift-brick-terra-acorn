import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

// App imports omit extensions; resolve local TypeScript for Node's strip-types runner.
registerHooks({ resolve(specifier, context, nextResolve) {
  try { return nextResolve(specifier, context); }
  catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return nextResolve(`${specifier}.ts`, context);
    throw error;
  }
} });
const { memoizeSelector } = await import('../src/lib/videos/selector-cache.ts');
const { expandedAdultTags } = await import('../src/lib/videos/adult-taxonomy.ts');
const { sortAdultVideos, scoreAdultVideo } = await import('../src/lib/videos/adult-rank.ts');

test('catalog cache ignores UI changes, isolates scopes, and invalidates changed slices', () => {
  let calls = 0;
  const select = memoizeSelector((s, adult) => { calls++; return s.videos.filter(v => v.adult === adult); }, ['videos']);
  const state = { videos: [{ adult: true }, { adult: false }], playing: false };
  const adult = select(state, true);
  const publicItems = select(state);
  assert.equal(select({ ...state, playing: true }, true), adult);
  assert.equal(select({ ...state, playing: true }), publicItems);
  assert.equal(calls, 2);
  assert.equal(select({ ...state, videos: [...state.videos, { adult: true }] }, true).length, 2);
  assert.equal(calls, 3);
});

test('expanded metadata is reused until a title receives an edited tag array', () => {
  const tags = ['amateur', 'pov'];
  const expanded = expandedAdultTags(tags);
  assert.equal(expandedAdultTags(tags), expanded);
  assert.ok(expanded.has('genre-pov'));
  assert.ok(expanded.has('amateur'));
  assert.equal(expandedAdultTags(['amateur']).has('genre-pov'), false);
});

test('linear provider interleave preserves the prior ranking and does not drop titles', () => {
  const now = Date.now();
  const videos = Array.from({ length: 5000 }, (_, i) => ({ id: `v${i}`, addedAt: now - i * 1000, folderId: 'adult', remote: { kind: i % 5 ? 'eporner' : 'reddit' } }));
  const ctx = { tags: {}, favorites: {}, likes: {}, cameCounts: {}, ratingOf: () => 0 };
  const scored = videos.map(video => ({ video, score: scoreAdultVideo(video, ctx) })).sort((a, b) => b.score - a.score || b.video.addedAt - a.video.addedAt);
  const groups = new Map();
  for (const item of scored) { const key = item.video.remote.kind; if (!groups.has(key)) groups.set(key, []); groups.get(key).push(item); }
  const providers = [...groups].sort(([, a], [, b]) => b[0].score - a[0].score).map(([key]) => key);
  const expected = [];
  while (providers.length) for (let i = providers.length - 1; i >= 0; i--) {
    const bucket = groups.get(providers[i]);
    expected.push(bucket.shift().video.id);
    if (!bucket.length) providers.splice(i, 1);
  }
  assert.deepEqual(sortAdultVideos(videos, ctx).map(v => v.id), expected);
  assert.equal(videos[0].id, 'v0');
});

const { buildAdultBrowseModel } = await import('../src/lib/videos/adult-browse-model.ts');
const fixture = () => {
  const videos = Array.from({length: 360}, (_, i) => ({ id: 'item-' + i, folderId: i % 2 ? 'booru:discover' : 'eporner:discover', name: 'Title ' + i, addedAt: 1700000000000 + i, extension: i % 2 ? 'jpg' : 'mp4', mime: i % 2 ? 'image/jpeg' : 'video/mp4', poster: 'available', remote: { kind: i % 2 ? 'booru' : 'eporner', channelName: 'Creator ' + i % 12 } }));
  const tags = Object.fromEntries(videos.map(v => [v.id, ['adult', 'amateur', 'pov']]));
  return { videos, personalVideos: [], deepVideos: [], tags, signals: {favorites:{},likes:{},cameCounts:{},viewCounts:{},ratings:{},heartedTags:[],historicTags:[],continueIds:[],favoriteIds:[]} };
};
const params = {source:'all',tag:'All',view:'all',limit:16,seed:123};

test('worker model respects type/source/tag filters and keeps the full catalog', () => {
 const data=fixture();
 const all=buildAdultBrowseModel(data,params);
 assert.equal(all.rankedIds.length,360);
 assert.equal(new Set(all.rankedIds).size,360);
 const filtered=buildAdultBrowseModel(data,{...params,source:'booru',view:'photos',tag:'genre-pov'});
 assert.equal(filtered.rankedIds.length,180);
 const byId=new Map(data.videos.map(v=>[v.id,v]));
 for(const id of [...filtered.overview.photos,...Object.values(filtered.shelves).flat()]) assert.equal(byId.get(id).remote.kind,'booru');
 assert.equal(filtered.overview.videos.length,0);
 assert.equal(buildAdultBrowseModel(data,{...params,tag:'missing-tag'}).rankedIds.length,0);
});

test('worker keeps recovered personal shelves and ranks private local videos', () => {
 const data=fixture();
 const recovered={...data.videos[0],id:'recovered'};
 data.personalVideos=[recovered];
 data.signals.continueIds=['recovered'];
 data.deepVideos=[{...recovered,id:'private',remote:undefined}];
 const result=buildAdultBrowseModel(data,params);
 assert.ok(result.shelves.continueRail.includes('recovered'));
 assert.deepEqual(result.deepRankedIds,['private']);
});

test('worker recommendations respond to feedback without changing catalog identity', () => {
 const data=fixture();
 const before=buildAdultBrowseModel(data,params);
 data.signals.ratings['item-0']=5;
 data.signals.favorites['item-0']=true;
 const after=buildAdultBrowseModel(data,params);
 assert.ok(after.rankedIds.indexOf('item-0')<before.rankedIds.indexOf('item-0'));
 const visible=[...after.overview.videos,...after.overview.photos,...after.overview.picks,...after.shelves.recommended,...after.shelves.related];
 assert.equal(new Set(visible).size,visible.length);
});

test('Adult rails rotate through a broad preview-ready catalog instead of a fixed top slice', () => {
 const data=fixture();
 const visible=new Set();
 for(let seed=1; seed<=24; seed+=1) {
   const result=buildAdultBrowseModel(data,{...params,seed});
   for(const id of result.overview.videos) visible.add(id);
 }
 // The historical 44-card window could never expose enough of this fixture.
 assert.ok(visible.size>64, `expected broad rotation, received ${visible.size} distinct cards`);
});


test('navigation persists only display settings and preserves full library metadata', async () => {
 const {saveViewPrefs,loadPrefs}=await import('../src/lib/videos/persist.ts');
 const storage=new Map([['reelcase.prefs.v4',JSON.stringify({tags:{saved:['keep-me']},favorites:['saved'],view:'grid',sort:'added',sourceId:'home'})]]);
 const original=storage.get('reelcase.prefs.v4');
 const oldWindow=globalThis.window, oldStorage=globalThis.localStorage;
 const writes=[];
 try {
  globalThis.window={};
  globalThis.localStorage={getItem:key=>storage.get(key)??null,setItem:(key,value)=>{writes.push([key,value]);storage.set(key,value);}};
  saveViewPrefs({view:'list',sort:'path',sourceId:'adults'});
  assert.equal(writes.length,1);
  assert.ok(writes[0][1].length<100);
  assert.equal(storage.get('reelcase.prefs.v4'),original);
  const restored=loadPrefs();
  assert.deepEqual(restored.tags.saved,['keep-me']);
  assert.deepEqual(restored.favorites,['saved']);
  assert.equal(restored.sort,'path');
  assert.equal(restored.view,'list');
  assert.equal(restored.sourceId,'home');
 } finally {
  if(oldWindow===undefined) delete globalThis.window; else globalThis.window=oldWindow;
  if(oldStorage===undefined) delete globalThis.localStorage; else globalThis.localStorage=oldStorage;
 }
});
