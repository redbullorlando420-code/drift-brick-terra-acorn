import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

// Exercise the real store actions with deterministic provider and disk boundaries.
const fixture = { followsWrites: [], writes: [], removed: [], cleanupWrites: [], failCleanup: false, requests: 0, response: null, beforeResponse: null, inputs: [], responseForRequest: null };
globalThis.__entryLimitFixture = fixture;
const persistence = readFileSync(new URL('../src/lib/videos/persist.ts', import.meta.url), 'utf8');
const names = [...persistence.matchAll(/export (?:async )?function (\w+)/g)].map(match => match[1]);
const mockPersist = names.map(name => {
  if (name === 'saveFollows') return 'export function saveFollows(channels) { globalThis.__entryLimitFixture.followsWrites.push(structuredClone(channels)); }';
  if (name === 'loadPrefs') return 'export function loadPrefs() { return null; }';
  if (name === 'loadFollows') return 'export function loadFollows() { return []; }';
  if (name === 'saveRemoteSnapshot') return 'export async function saveRemoteSnapshot(value) { globalThis.__entryLimitFixture.writes.push(...value.videos); }';
  if (name === 'appendCatalogVideos') return 'export async function appendCatalogVideos(rows) { globalThis.__entryLimitFixture.writes.push(...rows); }';
  if (name === 'removeRemoteSnapshotVideos') return 'export async function removeRemoteSnapshotVideos(ids) { globalThis.__entryLimitFixture.removed.push(...ids); }';
  if (name === 'saveYoutubeCleanup') return 'export async function saveYoutubeCleanup(rows, journal) { const f=globalThis.__entryLimitFixture; if(f.failCleanup) throw Error("Synthetic storage failure"); f.removed.push(...rows.map(row=>row.id)); f.cleanupWrites.push(structuredClone(journal)); }';
  return `export async function ${name}() { return []; }`;
}).join('\n') + '\nexport const PHOTO_META_LS_KEY = "test-photos";';
const mockRemote = ['followRemote', 'importChannels', 'refreshRemotes', 'searchAdultVideos'].map(name => `export async function ${name}(...args) {
  const fixture = globalThis.__entryLimitFixture; fixture.requests++;
  fixture.inputs.push(args[0]?.data); fixture.beforeResponse?.();
  return structuredClone(await (fixture.responseForRequest ? fixture.responseForRequest(args[0]?.data, args[0]?.signal) : fixture.response));
}`).join('\n');
const asModule = source => `data:text/javascript,${encodeURIComponent(source)}`;
registerHooks({ resolve(specifier, context, next) {
  if (specifier === '@/lib/remote/functions') return { url: asModule(mockRemote), shortCircuit: true };
  if (specifier === './persist' && context.parentURL?.endsWith('/videos/store.ts')) return { url: asModule(mockPersist), shortCircuit: true };
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); }
  catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; }
} });
const { useLibrary } = await import('../src/lib/videos/store.ts');
const { updatePullSettings, DEFAULT_PULL_SETTINGS } = await import('../src/lib/pull-settings.ts');
const channel = { id: 'yt:test', kind: 'youtube', handle: 'Test', title: 'Test', catalogCursor: 'before' };
const card = (id, kind = 'youtube', folderId = channel.id) => ({ id, folderId, name: 'Space documentary', path: id, extension: 'yt', mime: 'video/youtube', size: 0, addedAt: 1, remote: { kind, videoId: id, channelId: 'test' } });
function reset(videos = []) {
  fixture.followsWrites = []; fixture.writes = []; fixture.removed = []; fixture.cleanupWrites=[]; fixture.failCleanup=false; fixture.requests = 0; fixture.beforeResponse = null; fixture.inputs = []; fixture.responseForRequest = null;
  // Existing admission fixtures exercise hard caps independently of rotation.
  updatePullSettings({ ...DEFAULT_PULL_SETTINGS, youtubeMaxEntries: 2, youtubeAutoCleanup: false, twitchAutoCleanup: false, adultAutoCleanup: false });
  useLibrary.setState({ videos, tags: {}, metadataProvenance: {}, categories: {}, progress: {}, resumeProgress: {}, folders: [], follows: [channel], remoteBusy: false, refreshing: false, remoteRefreshStatus: null, youtubeRefreshStatus: null, youtubeLiveProgress: null, twitchLiveProgress: null, adultsUnlocked: true, activeId: null, previewId: null, favorites: {}, likes: {}, history: [], youtubeCleanup: { recentKeys: [], removedCount: 0, lastRemoved: 0, lastAt: 0 }, youtubeCleanupNote: '', cleanupNotes: {} });
}
const flush = () => new Promise(resolve => setTimeout(resolve, 80));

test('1,588-creator automatic rotation updates existing broadcasts across a 215,452-entry catalog without rewriting tags',async()=>{
 reset([]);const realNow=Date.now;let now=1_000_000;Date.now=()=>now;
 try{
  updatePullSettings({youtubeMaxEntries:300000,remoteMaxEntries:300000,youtubeRequestGapMs:1500});
  const follows=Array.from({length:1588},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'creator'+i,title:'Creator '+i,live:i<52,liveCheckedAt:1}));
  const liveRows=follows.slice(0,52).map((c,i)=>({...card('yt:v:l'+String(i).padStart(10,'0'),'youtube',c.id),name:c.title+' live',remote:{kind:'youtube',sourceIds:[c.id],channelId:c.channelId,videoId:'l'+String(i).padStart(10,'0'),channelName:c.title,live:true,observedAt:1,viewers:10,comments:[{id:'saved',text:'Saved on-demand comment'}]}}));
  const unrelated=Array.from({length:215452-liveRows.length},(_,i)=>card('old'+i));
  const tags=Object.fromEntries(liveRows.map(v=>[v.id,['user-saved-tag']])),metadataProvenance={};
  useLibrary.setState({videos:[...liveRows,...unrelated],follows,tags,metadataProvenance});
  fixture.responseForRequest=data=>{if(fixture.requests%3===1)now+=3000;return {channels:data.channels.map(c=>({...c,liveCheckedAt:now})),videos:data.channels.filter(c=>c.live).map(c=>{const i=Number(c.handle.slice(7)),old=liveRows[i];return {...old,description:c.title+' is live on YouTube.',remote:{...old.remote,sourceIds:undefined,comments:undefined,viewers:1234,observedAt:now}};}),refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:data.channels.map(c=>c.id),retryAt:{}};};
  for(let turn=0;turn<100&&useLibrary.getState().follows.some(c=>c.liveCheckedAt===1);turn++)await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true,scheduled:true,liveDemand:true});
  const state=useLibrary.getState();assert(state.follows.every(c=>c.liveCheckedAt>1));assert.equal(state.tags,tags);assert.equal(state.metadataProvenance,metadataProvenance);assert.equal(state.videos.length,215452);assert.equal(state.videos.at(-1),unrelated.at(-1));
  for(const row of state.videos.slice(0,52)){assert.equal(row.remote.viewers,1234);assert.equal(row.remote.comments[0].id,'saved');}
  assert(now-1_000_000<5*60000,'controlled three-second responses cover all creators within five minutes');
  assert.equal(new Set(fixture.inputs.flatMap(input=>input.channels.map(c=>c.id))).size,1588);
 }finally{Date.now=realNow;}
});

test('YouTube live cooldown survives reload through the follow ledger and leaves unrelated creators untouched',async()=>{
 reset([]);const now=Date.now(),id='UCabcdefghijklmnopqrstuv';
 const follows=Array.from({length:32},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',title:'Creator '+i,handle:'creator'+i}));
 follows[0]={...follows[0],live:true,liveCheckedAt:now-90000,lastLiveFailure:{kind:'rate-limited',at:now,attempts:1,message:'Wait',recovery:'Wait',retryAt:now+300000,cooldownScope:'live'}};
 useLibrary.setState({follows,youtubeLiveProgress:null});
 const result=await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true});
 assert.equal(result.skipped,'cooldown');assert.equal(fixture.requests,0);assert.equal(useLibrary.getState().follows[0].liveCheckedAt,follows[0].liveCheckedAt);assert.equal(useLibrary.getState().follows[31].lastLiveFailure,undefined);
});

test('a late archive response cannot erase a newer failed live attempt with the same successful timestamp',async()=>{
 reset([]);const id='UCabcdefghijklmnopqrstuv',now=Date.now(),follow={id:'yt:'+id,channelId:id,kind:'youtube',title:'Creator',handle:'creator',live:true,liveCheckedAt:now-60000};useLibrary.setState({follows:[follow]});
 fixture.beforeResponse=()=>useLibrary.setState({follows:[{...follow,lastLiveFailure:{kind:'network-offline',at:now,retryAt:now+30000,attempts:1,message:'Latest live check failed',recovery:'Retry'}}]});
 fixture.response={channels:[follow],videos:[],refreshedIds:[follow.id],retryAt:{}};
 await useLibrary.getState().refreshFollows('youtube');assert.equal(useLibrary.getState().follows[0].lastLiveFailure.message,'Latest live check failed');
});

test('focused partial Twitch pulls preserve saved VODs, local feedback and unrequested clip checkpoints', async () => {
  const { setRating, getRating } = await import('../src/lib/media-feedback.ts');
  const tw = { id: 'tw:test', kind: 'twitch', handle: 'test', title: 'Test', twitchArchiveCursor: 'before', twitchClipCursor: 'clip-before', twitchArchiveLastVideoId: 'old-id' };
  const old = { ...card('tw:v:old', 'twitch', tw.id), extension: 'vod', duration: 3600, genre: 'Local category', poster: 'saved-poster', tagline: 'Saved note', year: 2024, remote: { kind: 'twitch', videoId: 'old', channelName: 'Test' } };
  reset([old]); const favorites = { [old.id]: true }, likes = { [old.id]: true }, history = [{ id: old.id, at: 1, source: 'open' }], progress = { [old.id]: { t: 120, d: 3600, at: 1 } };
  useLibrary.setState({ follows: [tw], favorites, likes, history, progress }); setRating(old.id, 5);
  fixture.response = { channel: { ...tw, twitchClipCursor: undefined, twitchArchiveCursor: 'after', twitchArchiveDiagnostics: { at: 1000, pages: 1, received: 1, accepted: 1, duplicates: 0, resumed: true, stopReason: 'challenge', error: 'integrity challenge' }, lastProviderFailure: { message: 'integrity challenge' } }, videos: [{ ...old, addedAt: 0, duration: undefined, genre: undefined, poster: undefined, tagline: undefined, year: undefined }] };
  delete fixture.response.channel.twitchClipCursor;
  await useLibrary.getState().followRemoteQuery('test', 'twitch'); await flush();
  const state = useLibrary.getState();
  assert.equal(state.videos.length, 1); assert.equal(state.videos[0].duration, 3600); assert.equal(state.videos[0].poster, 'saved-poster'); assert.equal(state.videos[0].genre, 'Local category'); assert.equal(state.videos[0].tagline, 'Saved note'); assert.equal(state.videos[0].year, 2024); assert.equal(state.videos[0].addedAt, old.addedAt);
  assert.equal(state.favorites, favorites); assert.equal(state.likes, likes); assert.equal(state.history, history); assert.equal(state.progress, progress); assert.equal(getRating(old.id), 5);
  assert.equal(state.follows[0].twitchArchiveCursor, 'after'); assert.equal(state.follows[0].twitchClipCursor, 'clip-before'); assert.equal(state.follows[0].twitchArchiveLastVideoId, 'old-id'); assert.equal(state.pullHistory[0].status, 'partial');
  assert.equal(state.follows[0].twitchArchiveRetry.attempts, 1);
  assert(state.follows[0].twitchArchiveRetry.retryAt > Date.now());
  await useLibrary.getState().followRemoteQuery('test', 'twitch', { clipLimit: 0, twitchVodLimit: 500 });
  assert.equal(useLibrary.getState().follows[0].twitchArchiveRetry.attempts, 2);
  assert.equal(fixture.inputs.at(-1).clipLimit, 0); assert.equal(fixture.inputs.at(-1).twitchVodLimit, 500);
  fixture.response = { channel: { ...tw, twitchArchiveCursor: undefined, twitchArchiveExhaustedAt: 2000 }, videos: [] };
  await useLibrary.getState().followRemoteQuery('test', 'twitch'); await flush();
  assert.equal(useLibrary.getState().videos.length, 1); assert.equal(useLibrary.getState().follows[0].twitchArchiveCursor, undefined); assert.equal(getRating(old.id), 5);
  assert.equal(useLibrary.getState().follows[0].twitchArchiveRetry, undefined); assert.equal(useLibrary.getState().follows[0].lastProviderFailure, undefined);
});

test('empty Twitch routine and live checks preserve VOD history, feedback and focused checkpoints', async () => {
  const tw = { id: 'tw:empty', kind: 'twitch', handle: 'empty', title: 'Empty', twitchArchiveCursor: 'saved', twitchClipCursor: 'clip-saved' };
  const old = { ...card('tw:v:saved', 'twitch', tw.id), extension: 'vod', duration: 500 };
  reset([old]); const favorites = { [old.id]: true }, history = [{ id: old.id, at: 1, source: 'open' }]; useLibrary.setState({ follows: [tw], favorites, history });
  fixture.response = { channels: [{ ...tw, live: false }], videos: [], refreshedIds: [tw.id], retryAt: {} };
  await useLibrary.getState().refreshFollows('twitch'); await useLibrary.getState().refreshFollows('twitch', { twitchLiveOnly: true });
  const state = useLibrary.getState(); assert.equal(state.videos[0].id, old.id); assert.equal(state.videos[0].duration, 500); assert.equal(state.favorites, favorites); assert.equal(state.history, history); assert.equal(state.follows[0].twitchArchiveCursor, 'saved'); assert.equal(state.follows[0].twitchClipCursor, 'clip-saved');
});

test('Twitch entry caps and first-page failures hold checkpoints and explain the stop', async () => {
  reset([]); updatePullSettings({ twitchMaxEntries: 1 });
  const tw = { id: 'tw:cap', kind: 'twitch', handle: 'cap', title: 'Cap', twitchArchiveCursor: 'old', twitchClipCursor: 'clip-old', twitchArchiveLastVideoId: 'last-old' };
  useLibrary.setState({ follows: [tw] });
  fixture.response = { channel: { ...tw, twitchArchiveCursor: 'next', twitchArchiveLastVideoId: 'new', twitchArchiveDiagnostics: { at: 1000, pages: 1, received: 2, accepted: 2, duplicates: 0, resumed: true, stopReason: 'entry-budget' } }, videos: [card('one', 'twitch', tw.id), card('two', 'twitch', tw.id)] };
  await useLibrary.getState().followRemoteQuery('cap','twitch');
  assert.equal(useLibrary.getState().follows[0].twitchArchiveCursor,'old'); assert.equal(useLibrary.getState().follows[0].twitchArchiveLastVideoId,'last-old'); assert.equal(useLibrary.getState().follows[0].twitchArchiveDiagnostics.stopReason,'entry-limit');
  updatePullSettings({ twitchMaxEntries: 100 }); fixture.responseForRequest = () => { throw Error('failed integrity check'); };
  await assert.rejects(useLibrary.getState().followRemoteQuery('cap','twitch'), /integrity/);
  assert.equal(useLibrary.getState().videos.length, 1); assert.equal(useLibrary.getState().follows[0].twitchArchiveCursor,'old'); assert.equal(useLibrary.getState().follows[0].twitchArchiveDiagnostics.pages,0); assert.equal(useLibrary.getState().follows[0].twitchArchiveDiagnostics.stopReason,'challenge');
  assert.equal(useLibrary.getState().follows[0].lastProviderFailure.kind, 'integrity-challenge'); assert.equal(useLibrary.getState().follows[0].twitchArchiveRetry.attempts, 1);
  const beforeCancel = useLibrary.getState().follows[0];
  fixture.responseForRequest = () => { throw Error('Pull cancelled; accepted catalog entries remain saved.'); };
  await assert.rejects(useLibrary.getState().followRemoteQuery('cap', 'twitch'), /cancelled/);
  assert.equal(useLibrary.getState().follows[0], beforeCancel, 'intentional cancellation cannot increment backoff or replace provider diagnostics');
  assert.equal(useLibrary.getState().pullHistory[0].status, 'partial'); assert.equal(useLibrary.getState().pullHistory[0].failed, 0);
  await flush();
});

test('YouTube pull commits use sparse tag updates without enumerating the existing ledgers', async () => {
  reset([]);fixture.response={channel,videos:[card('new-sparse')],cache:{hits:0,misses:1,scope:'catalog'}};
  const guarded = value => new Proxy(value,{ownKeys(){throw Error('provider copied the entire tag ledger');}});
  useLibrary.setState({tags:guarded({unrelated:['keep']}),metadataProvenance:guarded({})});
  await useLibrary.getState().followRemoteQuery('test','youtube');
  await flush();
  assert.deepEqual(useLibrary.getState().tags.unrelated,['keep']);assert.ok(useLibrary.getState().tags['new-sparse'].length);
  assert.equal(fixture.writes.length,1);
});

test('viewer comments persist one current card without copying or notifying the 100k browse catalog', async () => {
  const { viewerDetails } = await import('../src/lib/videos/viewer-details.ts');
  const { lookupVideo } = await import('../src/lib/videos/video-lookup.ts');
  let reads = 0;
  const rows = Array.from({ length: 100_000 }, (_, i) => {
    const row = card(`comments:${i}`), remote = row.remote;
    Object.defineProperty(row, 'remote', { get() { reads++; return remote; } }); return row;
  });
  reset(rows); const selected = rows.at(-1);
  useLibrary.setState({ previewId: selected.id }); lookupVideo(rows, selected.id); reads = 0;
  let notifications = 0; const unsubscribe = useLibrary.subscribe(() => notifications++);
  const comments = [{ id: 'one', body: 'Durable comment' }];
  useLibrary.getState().setVideoComments(selected.id, comments); await flush();
  assert.equal(useLibrary.getState().videos, rows);
  assert.equal(notifications, 0, 'comments do not invalidate catalog subscribers');
  assert.equal(viewerDetails.commentsFor(selected.id), comments);
  assert.equal(fixture.writes.length, 1); assert.deepEqual(fixture.writes[0].remote.comments, comments);
  assert.ok(reads < 10, 'saving selected comments does not build a full catalog metadata index');
  useLibrary.getState().setVideoComments(selected.id, []); await flush();
  assert.deepEqual(viewerDetails.commentsFor(selected.id), [], 'an accepted empty response clears the previous transcript');
  assert.deepEqual(fixture.writes.at(-1).remote.comments, []);
  const beforeRelease = reads; useLibrary.getState().releaseVideoComments();
  assert.equal(reads, beforeRelease, 'closing comments does not scan any card');
  assert.equal(viewerDetails.diagnostics().activeTranscripts, 0);
  assert.equal(notifications, 0); unsubscribe();
});
test('a delayed comment response after closing or switching a viewer cannot retain or write a transcript', async () => {
  const { viewerDetails } = await import('../src/lib/videos/viewer-details.ts');
  reset([card('closed'), card('current')]);
  useLibrary.setState({ previewId: 'current' });
  useLibrary.getState().setVideoComments('closed', [{ id: 'late', body: 'Stale' }]); await flush();
  assert.equal(fixture.writes.length, 0); assert.equal(viewerDetails.diagnostics().activeTranscripts, 0);
});

test('focused pulls cap memory, metadata and disk together, preserving the rejected page resume point', async () => {
  reset([card('old')]);
  fixture.response = { channel: { ...channel, catalogCursor: 'after' }, videos: [card('new'), card('blocked')] };
  await useLibrary.getState().followRemoteQuery('Test', 'youtube'); await flush();
  const state = useLibrary.getState();
  assert.deepEqual(state.videos.map(video => video.id), ['old', 'new']);
  assert.equal(state.tags.blocked, undefined);
  assert.equal(state.metadataProvenance.blocked, undefined);
  assert.deepEqual(fixture.writes.map(video => video.id), ['new']);
  assert.equal(state.follows[0].catalogCursor, 'before');
  assert.equal(state.folders[0].videoCount, 2);
  await assert.rejects(state.followRemoteQuery('Test', 'youtube'), /limit reached/);
  assert.equal(fixture.requests, 1, 'full source does not start another archive request');
});

test('bulk imports use one cap across creators and persist only admitted entries', async () => {
  reset();
  fixture.response = { ok: [
    { channel: { ...channel, id: 'yt:a', handle: 'Alpha' }, videos: [card('a', 'youtube', 'yt:a'), card('b', 'youtube', 'yt:a')] },
    { channel: { ...channel, id: 'yt:b', handle: 'Beta' }, videos: [card('c', 'youtube', 'yt:b')] },
  ], failed: 0 };
  await useLibrary.getState().importBatch([{ query: 'Alpha', kind: 'youtube' }, { query: 'Beta', kind: 'youtube' }]); await flush();
  assert.equal(useLibrary.getState().videos.length, 2);
  assert.equal(useLibrary.getState().tags.c, undefined);
  assert.deepEqual(fixture.writes.map(video => video.id), ['a', 'b']);
  assert.equal(useLibrary.getState().folders.find(folder => folder.id === 'yt:b').videoCount, 0);
});

test('routine checks refresh stored titles at a zero cap while excluding new rows from disk and metadata', async () => {
  reset([card('old')]); updatePullSettings({ youtubeMaxEntries: 0 });
  useLibrary.setState({ follows: [{ ...channel, channelId: 'UCFixture12345678901234' }] });
  fixture.response = { channels: [{ ...channel, newestVideoId: 'new', catalogCursor: 'after' }], refreshedIds: [channel.id], videos: [{ ...card('old'), name: 'Updated title' }, card('new')] };
  await useLibrary.getState().refreshFollows('youtube'); await flush();
  assert.equal(useLibrary.getState().videos.length, 1);
  assert.equal(useLibrary.getState().videos[0].name, 'Updated title');
  assert.equal(useLibrary.getState().tags.new, undefined);
  assert.deepEqual(fixture.writes.map(video => video.id), ['old']);
  assert.equal(useLibrary.getState().follows[0].newestVideoId, undefined);
});

test('settings changed while a provider is in flight apply before admission', async () => {
  reset(); fixture.beforeResponse = () => updatePullSettings({ youtubeMaxEntries: 0 });
  fixture.response = { channel, videos: [card('blocked')] };
  await useLibrary.getState().followRemoteQuery('Test', 'youtube'); await flush();
  assert.equal(useLibrary.getState().videos.length, 0);
  assert.equal(Object.keys(useLibrary.getState().tags).length, 0);
  assert.equal(fixture.writes.length, 0);
});

test('Adult pulls apply a lowered in-flight cap before tags and append transactions', async () => {
  reset(); updatePullSettings({ adultMaxEntries: 2 });
  fixture.beforeResponse = () => updatePullSettings({ adultMaxEntries: 1 });
  fixture.response = { videos: [card('adult-a', 'eporner', 'eporner:discover'), card('adult-b', 'eporner', 'eporner:discover')], providerNextPages: { eporner: 2 }, providerNextOffsets: { eporner: 0 }, providerDiagnostics: [{ provider: 'eporner', status: 'ok', titles: 2, detail: 'fixture' }] };
  await useLibrary.getState().searchAdultFeed('all', 'top-weekly', { providers: ['eporner'], maxVideos: 2 });
  assert.equal(useLibrary.getState().videos.length, 1);
  assert.equal(useLibrary.getState().tags['adult-b'], undefined);
  assert.deepEqual(fixture.writes.map(video => video.id), ['adult-a']);
});

test('removed cached Reddit images and confirmed unavailable photos leave Adult shelves without deleting saves', async () => {
  reset([{ ...card('removed', 'reddit', 'reddit:discover'), name: '[ Removed by Reddit ]' }, card('valid', 'reddit', 'reddit:discover')]);
  useLibrary.setState({ unavailable: {}, hiddenVideos: {}, showHiddenAdult: true, favorites: { removed: true, valid: true } });
  const { selectAdultRemote } = await import('../src/lib/videos/store.ts');
  assert.deepEqual(selectAdultRemote(useLibrary.getState()).map(video => video.id), ['valid']);
  useLibrary.getState().markUnavailable('valid', 'Removed by Reddit');
  assert.deepEqual(selectAdultRemote(useLibrary.getState()), []);
  assert.equal(useLibrary.getState().videos.length, 2);
  assert.deepEqual(useLibrary.getState().favorites, { removed: true, valid: true });
});
test('a provider-wide cooldown stops the archive queue without marking unattempted creators failed', async () => {
  reset(); updatePullSettings({ youtubeMaxEntries: 1000, youtubeSourcesPerSweep: 100 });
  const follows = [channel, {...channel,id:'yt:two',handle:'Two'}, {...channel,id:'yt:three',handle:'Three'}];
  useLibrary.setState({follows});
  const retryAt = Date.now()+300_000;
  fixture.response = {videos:[],channels:[{...channel,lastProviderFailure:{at:Date.now(),kind:'rate-limited',message:'YouTube HTTP 429',recovery:'wait',retryAt}}],refreshedIds:[],retryAt:{[channel.id]:retryAt},providerRetryAt:retryAt};
  await useLibrary.getState().refreshFollows('youtube',{catalog:true});
  assert.equal(fixture.requests,1);
  const state = useLibrary.getState();
  assert.equal(state.remoteRefreshStatus.checked,1);
  assert.equal(state.remoteRefreshStatus.failed,1);
  assert.equal(state.remoteRefreshStatus.retryAt,retryAt);
  assert.equal(state.pullHistory[0].done,1);
  assert.equal(state.pullHistory[0].total,3);
  assert.equal(state.pullHistory[0].failed,1);
  assert(state.follows.find(row=>row.id==='yt:two').catalogCursor==='before');
  await state.refreshFollows('youtube',{catalog:true});
  assert.equal(fixture.requests,1,'cooldown suppresses further manual sweeps');
});

test('unresolved saved stubs do not prevent a real import from resolving them', async () => {
  reset();updatePullSettings({youtubeMaxEntries:1000});
  useLibrary.setState({follows:[{id:'yt:displayname',kind:'youtube',handle:'Display Name',title:'Display Name'}]});
  fixture.response = {ok:[{channel:{id:'yt:UCResolved1234567890123456',kind:'youtube',handle:'@DisplayName',title:'Display Name',channelId:'UCResolved1234567890123456'},videos:[card('resolved')]}],failed:0};
  const result=await useLibrary.getState().importBatch([{query:'Display Name',kind:'youtube'}]);
  assert.equal(fixture.requests,1);assert.equal(result.ok,1);assert.equal(useLibrary.getState().follows.length,1);
  assert.equal(useLibrary.getState().follows[0].channelId,'UCResolved1234567890123456');
});
test('Twitch status cannot replace the YouTube cooldown or archive result', async () => {
  reset();
  const youtube = {at:Date.now(),checked:1,refreshed:0,failed:1,youtube:0,twitch:0,retryAt:Date.now()+300_000};
  const twitch={id:'tw:test',kind:'twitch',handle:'Test',title:'Test'};
  useLibrary.setState({youtubeRefreshStatus:youtube,follows:[twitch]});
  fixture.response={videos:[],channels:[twitch],refreshedIds:[twitch.id],retryAt:{}};
  await useLibrary.getState().refreshFollows('twitch');
  assert.deepEqual(useLibrary.getState().youtubeRefreshStatus,youtube);
  assert.equal(useLibrary.getState().remoteRefreshStatus.refreshed,1);
  const skipped = await useLibrary.getState().refreshFollows('youtube',{catalog:true});
  assert.equal(skipped.skipped, 'cooldown');
  assert.equal(skipped.retryAt, youtube.retryAt);
  assert.equal(skipped.pull, undefined, 'a cooldown click never reports an old pull as a new result');
  assert.equal(fixture.requests,1,'YouTube remains cooling down independently of Twitch');
});

test('manual completion returns its own counts even when another provider changes pull history', async () => {
  reset();
  fixture.response = { channels: [channel], videos: [card('first')], refreshedIds: [channel.id], retryAt: {} };
  const result = await useLibrary.getState().refreshFollows('youtube', { catalog: true });
  useLibrary.setState({ pullHistory: [{ provider: 'twitch', added: 999, received: 999 }] });
  assert.equal(result.pull.provider, 'youtube');
  assert.equal(result.pull.added, 1);
  assert.equal(result.pull.received, 1);
  assert.equal(result.pull.done, 1);
});

test('cooldown stops focused, import and live work while mixed checks still service Twitch', async () => {
  reset();
  const retryAt = Date.now() + 300_000;
  const twitch = { id: 'tw:test', kind: 'twitch', handle: 'Test', title: 'Test' };
  useLibrary.setState({ youtubeRefreshStatus: { at: Date.now(), checked: 1, refreshed: 0, failed: 1, youtube: 0, twitch: 0, retryAt }, follows: [channel, twitch] });
  await assert.rejects(useLibrary.getState().followRemoteQuery('Test', 'youtube'), /HTTP 429/);
  await assert.rejects(useLibrary.getState().importBatch([{ query: 'Another', kind: 'youtube' }]), /HTTP 429/);
  const live = await useLibrary.getState().refreshFollows('youtube', { youtubeLiveOnly: true });
  assert.equal(live.skipped, 'cooldown');
  assert.equal(fixture.requests, 0);
  fixture.response = { channels: [twitch], videos: [], refreshedIds: [twitch.id], retryAt: {} };
  const mixed = await useLibrary.getState().refreshFollows();
  assert.equal(fixture.requests, 1);
  assert.equal(mixed.pull.provider, 'twitch');
  assert.equal(mixed.pull.total, 1);
});

test('an import provider limit checkpoints the cooldown and leaves later batches unattempted', async () => {
  reset();
  const retryAt = Date.now() + 300_000;
  const queries = Array.from({ length: 60 }, (_, i) => `Creator ${i}`);
  fixture.response = { ok: [], failed: 8, failedQueries: queries.slice(0, 8), failedReasons: Object.fromEntries(queries.slice(0, 8).map(query => [query, 'YouTube HTTP 429'])), providerRetryAt: retryAt, providerCooldownScope: 'catalog' };
  const result = await useLibrary.getState().importBatch(queries.map(query => ({ query, kind: 'youtube' })));
  assert.equal(fixture.requests, 1);
  assert.equal(result.failed, 8, 'unattempted sources are not marked as failures');
  assert.equal(result.failedReasons[queries[0]], 'YouTube HTTP 429');
  assert.equal(useLibrary.getState().youtubeRefreshStatus.retryAt, retryAt);
  assert.equal(useLibrary.getState().pullHistory[0].done, 8);
  assert.equal(useLibrary.getState().pullHistory[0].total, 60);
  assert.equal(useLibrary.getState().pullHistory[0].status, 'partial');
});

test('automatic provider detection still permits a focused Twitch URL during a YouTube cooldown', async () => {
  reset();
  const twitch = { id: 'tw:another', kind: 'twitch', handle: 'another', title: 'Another' };
  useLibrary.setState({ youtubeRefreshStatus: { at: Date.now(), checked: 0, refreshed: 0, failed: 0, youtube: 0, twitch: 0, retryAt: Date.now() + 300_000 } });
  fixture.response = { channel: twitch, videos: [] };
  await useLibrary.getState().followRemoteQuery('https://twitch.tv/another');
  assert.equal(fixture.requests, 1);
  assert.equal(useLibrary.getState().pullHistory[0].provider, 'twitch');
});

test('a catalog-only cooldown allows live discovery on confirmed channel IDs', async () => {
  reset();
  const confirmed = { ...channel, channelId: 'UC1234567890123456789012' };
  useLibrary.setState({ follows: [confirmed], youtubeRefreshStatus: { at: Date.now(), checked: 0, refreshed: 0, failed: 0, youtube: 0, twitch: 0, retryAt: Date.now() + 300_000, cooldownScope: 'catalog' } });
  fixture.response = { channels: [confirmed], videos: [], refreshedIds: [confirmed.id], retryAt: {} };
  const result = await useLibrary.getState().refreshFollows('youtube', { youtubeLiveOnly: true });
  assert.equal(fixture.requests, 1);
  assert.equal(result.skipped, undefined);
});

test('scheduled archive growth checks four creators in small responses and persists new entries and cursors', async () => {
  reset(); updatePullSettings({ youtubeMaxEntries: 10 });
  const follows = Array.from({ length: 6 }, (_, i) => ({ ...channel, id: `yt:creator${i}`, channelId: `UC123456789012345678901${i}`, handle: `Creator${i}`, catalogCheckedAt: 0 }));
  useLibrary.setState({ follows });
  fixture.responseForRequest = data => ({
    channels: data.channels.map(source => ({ ...source, catalogCursor: 'next-page', catalogCheckedAt: Date.now() })),
    videos: data.channels.map(source => card(`new-${source.id}`, 'youtube', source.id)),
    refreshedIds: data.channels.map(source => source.id), retryAt: {},
  });
  const result = await useLibrary.getState().refreshFollows('youtube', { catalog: true, scheduled: true });
  assert.equal(fixture.requests, 4);
  assert(fixture.inputs.every(data => data.channels.length === 1 && data.youtubeCatalog && data.youtubeBackground));
  assert.equal(result.pull.added, 4);
  assert.equal(result.pull.done, 4);
  assert.equal(useLibrary.getState().videos.length, 4);
  assert.equal(new Set(fixture.writes.map(video => video.id)).size, 4);
  assert.equal(useLibrary.getState().follows.filter(source => source.catalogCursor === 'next-page').length, 4);
});

test('manual force ignores the old timer, stops on a new rejection, and leaves automatic work waiting', async () => {
  reset(); updatePullSettings({ youtubeMaxEntries: 1000, youtubeSourcesPerSweep: 100 });
  const retryAt = Date.now() + 300_000;
  useLibrary.setState({ follows: [channel, { ...channel, id: 'yt:two', handle: 'Two' }], youtubeRefreshStatus: { retryAt, cooldownScope: 'all' } });
  fixture.response = { videos: [], channels: [{ ...channel, lastProviderFailure: { at: Date.now(), kind: 'rate-limited', message: 'YouTube HTTP 429', retryAt: retryAt + 1000, cooldownScope: 'all' } }], refreshedIds: [], retryAt: {}, providerRetryAt: retryAt + 1000, providerCooldownScope: 'all' };
  const result = await useLibrary.getState().refreshFollows('youtube', { catalog: true, force: true });
  assert.equal(fixture.requests, 1);
  assert.equal(fixture.inputs[0].forceYoutube, true);
  assert.equal(result.pull.done, 1);
  assert.equal(result.pull.added, 0);
  assert.equal(result.retryAt, retryAt + 1000);
  const automatic = await useLibrary.getState().refreshFollows('youtube', { catalog: true, scheduled: true, force: true });
  assert.equal(automatic.skipped, 'cooldown');
  assert.equal(fixture.requests, 1);
});

test('healthy forced pulls resume the batch, keep entry caps, and clear obsolete restored deadlines', async () => {
  reset(); updatePullSettings({ youtubeSourcesPerSweep: 100, youtubeMaxEntries: 3 });
  const follows = [channel, { ...channel, id: 'yt:two', handle: 'Two', lastProviderFailure: { kind: 'rate-limited', at: 1, retryAt: Date.now() + 300_000, cooldownScope: 'all', message: 'old HTTP 429' } }];
  useLibrary.setState({ follows, youtubeRefreshStatus: { retryAt: Date.now() + 300_000, cooldownScope: 'all' } });
  fixture.responseForRequest = data => ({ channels: data.channels.map(source => ({ ...source, lastProviderFailure: undefined, catalogCursor: 'next' })), videos: data.channels.flatMap(source => [card(`new-${source.id}`, 'youtube', source.id), card(`more-${source.id}`, 'youtube', source.id)]), refreshedIds: data.channels.map(source => source.id), retryAt: {} });
  const result = await useLibrary.getState().refreshFollows('youtube', { catalog: true, force: true });
  assert.equal(fixture.requests, 2);
  assert.deepEqual(fixture.inputs.map(data => data.forceYoutube), [true, false], 'only the initial request overrides the previous cooldown');
  assert.equal(result.pull.added, 3);
  assert.equal(result.retryAt, undefined);
  assert.equal(useLibrary.getState().videos.length, 3, 'manual force still honors the configured entry cap');
  assert.equal(useLibrary.getState().follows.find(source => source.id === channel.id).catalogCursor, 'next');
  assert.equal(useLibrary.getState().follows.find(source => source.id === 'yt:two').catalogCursor, 'before', 'rejected entries retain their page cursor');
});

test('a recovered manual pull prevents untouched old creator failures restoring a global cooldown', async () => {
  reset();
  const untouched = { ...channel, id: 'yt:untouched', handle: 'Untouched', lastProviderFailure: { kind: 'rate-limited', at: 1, retryAt: Date.now() + 300_000, cooldownScope: 'all', message: 'old HTTP 429' } };
  useLibrary.setState({ follows: [channel, untouched], youtubeRefreshStatus: { retryAt: untouched.lastProviderFailure.retryAt, cooldownScope: 'all' } });
  fixture.response = { channels: [channel], videos: [card('recovered')], refreshedIds: [channel.id], retryAt: {} };
  await useLibrary.getState().refreshFollows('youtube', { catalog: true, force: true, channelIds: [channel.id] });
  const failure = useLibrary.getState().follows.find(source => source.id === untouched.id).lastProviderFailure;
  assert.equal(failure.message, 'old HTTP 429', 'the historical provider diagnosis stays available');
  assert.equal(failure.retryAt, undefined);
  const { restoreYoutubeCooldown } = await import('../src/lib/remote/youtube-pull-feedback.ts');
  assert.equal(restoreYoutubeCooldown(useLibrary.getState().follows), null, 'reload cannot reapply the recovered deadline');
});

test('YouTube feed success preserves live cards and actual offline checks persist completed streams without deleting saved media', async () => {
  const date=Date.UTC(2026,8,1),old={...card('yt:stream'),addedAt:date,remote:{kind:'youtube',videoId:'stream',channelId:'test',live:true,liveOfflineSince:Date.now()-600_001,youtubeType:'live',publishedSource:'rss',observedAt:Date.now()-600_001}};
  const liveChannel={...channel,live:false,liveCheckedAt:Date.now(),channelId:'UC1234567890123456789012'};
  reset([old]);useLibrary.setState({ follows:[liveChannel],favorites: { [old.id]: true }, likes: { [old.id]: true }, progress: { [old.id]: {t:42,d:420,at:1} } });
  fixture.response = { channels: [liveChannel], videos: [], refreshedIds: [channel.id], liveCheckedIds: [], retryAt: {} };
  await useLibrary.getState().refreshFollows('youtube');
  assert.equal(useLibrary.getState().videos[0],old);assert.equal(fixture.removed.length,0);
  fixture.response = { ...fixture.response, liveCheckedIds: [channel.id], channels:[{...liveChannel,liveCheckedAt:Date.now()}] };
  await useLibrary.getState().refreshFollows('youtube', { youtubeLiveOnly: true });
  const state=useLibrary.getState();assert.equal(state.videos[0].remote.live,false);assert.equal(state.videos[0].remote.youtubeType,'replay');
  assert.equal(state.videos[0].addedAt,date);assert.equal(state.videos[0].remote.publishedSource,'rss');
  assert.equal(state.favorites[old.id],true);assert.equal(state.likes[old.id],true);assert.equal(state.progress[old.id].t,42);
  assert.equal(fixture.writes.length,1);assert.equal(fixture.writes[0].remote.youtubeType,'replay');assert.deepEqual(fixture.removed,[]);
});

test('a 70000-entry library admits 3000 new YouTube entries in six bounded creator commits', async t => {
  reset(Array.from({ length: 70000 }, (_, i) => card(`existing-${i}`)));
  updatePullSettings({ youtubeMaxEntries: 80000, youtubeBatchVideos: 500, youtubeSourcesPerSweep: 6 });
  const follows = Array.from({ length: 6 }, (_, i) => ({ ...channel, id: `yt:scale${i}`, channelId: `UCScale1234567890123456${i}`, handle: `Scale${i}` }));
  useLibrary.setState({ follows });
  fixture.responseForRequest = data => ({
    channels: data.channels.map(source => ({ ...source, catalogCursor: 'next-page' })),
    videos: data.channels.flatMap(source => Array.from({ length: 500 }, (_, i) => card(`${source.id}-new-${i}`, 'youtube', source.id))),
    refreshedIds: data.channels.map(source => source.id), retryAt: {},
  });
  const started = performance.now();
  const result = await useLibrary.getState().refreshFollows('youtube', { catalog: true, force: true });
  assert.equal(fixture.requests, 6);
  assert(fixture.inputs.every(data => data.channels.length === 1));
  assert.equal(result.pull.added, 3000);
  assert.equal(useLibrary.getState().videos.length, 73000);
  assert.equal(new Set(fixture.writes.map(video => video.id)).size, 3000);
  assert.equal(useLibrary.getState().follows.filter(source => source.catalogCursor === 'next-page').length, 6);
  t.diagnostic(`70000 existing + 3000 added in six commits: ${Math.round(performance.now() - started)}ms with mocked network/disk; no full catalog persistence.`);
});

const cleanupCard = (id, index) => ({ ...card(id), addedAt: Date.now() - (500 - index) * 86400000, remote: { ...card(id).remote, publishedSource: 'provider' } });

test('full YouTube archive replaces at most its cleanup budget and holds partially admitted page cursors', async () => {
  const old = Array.from({ length: 8 }, (_, i) => cleanupCard(`cleanup-archive-${i}`, i));
  reset(old); updatePullSettings({ youtubeAutoCleanup: true, youtubeMaxEntries: 8, youtubeCleanupBatch: 2 });
  const history = [{ id: old[0].id, at: 1, source: 'open', title: old[0].name, url: 'https://www.youtube.com/watch?v=cleanup-archive-0' }];
  useLibrary.setState({ history, likes: { [old[0].id]: true }, favorites: { [old[1].id]: true } });
  const { setRating } = await import('../src/lib/media-feedback.ts'); setRating(old[2].id, 4);
  fixture.response = { channels: [{ ...channel, catalogCursor: 'after' }], videos: Array.from({ length: 3 }, (_, i) => cleanupCard(`cleanup-archive-new-${i}`, 450+i)), refreshedIds: [channel.id], retryAt: {} };
  const first = await useLibrary.getState().refreshFollows('youtube', { catalog: true });
  assert.equal(first.pull.added, 2); assert.equal(useLibrary.getState().videos.length, 8);
  assert.deepEqual(fixture.removed, [old[3].id, old[4].id]); assert.equal(useLibrary.getState().history, history);
  for(const v of old.slice(0,3)) assert.ok(useLibrary.getState().videos.some(row=>row.id===v.id));
  assert.equal(useLibrary.getState().follows[0].catalogCursor, 'before');
  const second = await useLibrary.getState().refreshFollows('youtube', { catalog: true });
  assert.equal(second.pull.added, 1); assert.equal(useLibrary.getState().videos.length, 8);
  assert.equal(useLibrary.getState().follows[0].catalogCursor, 'after');
  assert.equal(useLibrary.getState().youtubeCleanup.removedCount, 3);
});

test('failed and duplicate-only YouTube requests never remove cached videos', async () => {
  const old = Array.from({ length: 5 }, (_, i) => cleanupCard(`cleanup-noop-${i}`, i));
  reset(old); updatePullSettings({ youtubeAutoCleanup: true, youtubeMaxEntries: 5 });
  fixture.responseForRequest = () => { throw Error('Synthetic provider failure'); };
  await useLibrary.getState().refreshFollows('youtube', { catalog: true });
  assert.equal(useLibrary.getState().videos, old); assert.deepEqual(fixture.removed, []);
  fixture.responseForRequest = null;
  fixture.response = { channels: [channel], videos: old, refreshedIds: [channel.id], retryAt: {} };
  await useLibrary.getState().refreshFollows('youtube', { catalog: true });
  assert.deepEqual(fixture.removed, []); assert.equal(useLibrary.getState().youtubeCleanup.removedCount, 0);
});

test('focused pulls and subscription imports can make room at the cap without exceeding the per-import budget', async () => {
  const old = Array.from({ length: 6 }, (_, i) => cleanupCard(`cleanup-focused-${i}`, i));
  reset(old); updatePullSettings({ youtubeAutoCleanup: true, youtubeMaxEntries: 6, youtubeCleanupBatch: 1 });
  fixture.response = { channel, videos: [cleanupCard('cleanup-focused-new', 490)] };
  await useLibrary.getState().followRemoteQuery('Test','youtube'); await flush();
  assert.equal(useLibrary.getState().videos.length,6); assert.equal(fixture.removed.length,1);
  reset(old); updatePullSettings({ youtubeAutoCleanup: true, youtubeMaxEntries: 6, youtubeCleanupBatch: 1 });
  fixture.responseForRequest = data => ({ ok: data.items.map(item => ({ channel: { ...channel, id: `yt:${item.query}`, handle: item.query }, videos: [cleanupCard(`cleanup-import-${item.query}`,490)] })), failed: [] });
  await useLibrary.getState().importBatch([{query:'First',kind:'youtube'},{query:'Second',kind:'youtube'}]);
  assert.equal(fixture.removed.length,1); assert.equal(useLibrary.getState().videos.length,6); assert.equal(fixture.requests,1);
});

test('manual cleanup rolls back failed disk commits without changing saved signals or clearing rating/history', async () => {
  const old = Array.from({ length: 6 }, (_, i) => cleanupCard(`cleanup-rollback-${i}`,i));
  reset(old);updatePullSettings({youtubeCleanupBatch:2});fixture.failCleanup=true;
  const history=[{id:old[0].id,at:1,source:'open'}],progress={[old[0].id]:{t:20,d:300,at:1}},tags={[old[0].id]:['science']};
  useLibrary.setState({history,progress,tags});
  await assert.rejects(useLibrary.getState().cleanupYoutubeCache(),/Synthetic storage failure/);
  assert.deepEqual(new Set(useLibrary.getState().videos.map(v=>v.id)),new Set(old.map(v=>v.id)));
  assert.equal(useLibrary.getState().history,history);assert.equal(useLibrary.getState().progress,progress);assert.equal(useLibrary.getState().tags,tags);
  assert.equal(useLibrary.getState().youtubeCleanup.removedCount,0);assert.equal(useLibrary.getState().remoteBusy,false);
});

test('retired identities stay suppressed and can be restored when later liked or positively rated', async () => {
  const old=Array.from({length:6},(_,i)=>cleanupCard(`cleanup-retired-${i}`,i));
  reset(old);updatePullSettings({youtubeAutoCleanup:true,youtubeMaxEntries:6,youtubeCleanupBatch:1});
  await useLibrary.getState().cleanupYoutubeCache();
  assert.deepEqual(fixture.removed,[old[0].id]);
  fixture.response={channels:[channel],videos:[old[0]],refreshedIds:[channel.id],retryAt:{}};
  const suppressed=await useLibrary.getState().refreshFollows('youtube',{catalog:true});
  assert.equal(suppressed.pull.added,0);assert.equal(useLibrary.getState().videos.length,5);
  useLibrary.setState({likes:{[old[0].id]:true}});
  const revived=await useLibrary.getState().refreshFollows('youtube',{catalog:true});
  assert.equal(revived.pull.added,1);assert.ok(useLibrary.getState().videos.some(v=>v.id===old[0].id));
  assert.equal(useLibrary.getState().youtubeCleanup.recentKeys.includes(`yt:${old[0].id}`),false);
});

test('a rating or like received while cleanup planning yields is protected by the final commit check', async () => {
  const old=Array.from({length:12000},(_,i)=>cleanupCard(`cleanup-race-${i}`,i%400));
  reset(old);updatePullSettings({youtubeCleanupBatch:2});
  const work=useLibrary.getState().cleanupYoutubeCache();
  setTimeout(()=>useLibrary.setState({likes:{[old[0].id]:true}}),0);
  await work;
  assert.ok(useLibrary.getState().videos.some(v=>v.id===old[0].id));assert.equal(fixture.removed.includes(old[0].id),false);
});

test('focused Twitch rotation respects combined caps, protects saves and holds partial clip/VOD checkpoints', async () => {
  const tw = {id:'tw:rotation',kind:'twitch',handle:'rotation',title:'Rotation',twitchArchiveCursor:'before',twitchClipCursor:'clip-before'};
  const old = Array.from({length:8},(_,i)=>({...card(`tw:rotation:${i}`,'twitch',tw.id),extension:i%2?'clip':'vod',addedAt:Date.now()-(500-i)*86400000}));
  const youtube = cleanupCard('unrelated-youtube',1);
  reset([...old,youtube]); useLibrary.setState({follows:[tw],likes:{[old[0].id]:true},favorites:{[old[1].id]:true}});
  updatePullSettings({twitchAutoCleanup:true,twitchMaxEntries:8,remoteMaxEntries:9,twitchCleanupBatch:2});
  fixture.response={channel:{...tw,twitchArchiveCursor:'after',twitchClipCursor:'clip-after'},videos:[0,1,2].map(i=>({...card(`tw:new-rotation:${i}`,'twitch',tw.id),extension:'vod',addedAt:Date.now()}))};
  await useLibrary.getState().followRemoteQuery('rotation','twitch');
  assert.deepEqual(fixture.removed,[old[2].id,old[3].id]); assert.equal(useLibrary.getState().videos.length,9);
  assert.ok(useLibrary.getState().videos.includes(youtube)); assert.equal(useLibrary.getState().follows[0].twitchArchiveCursor,'before'); assert.equal(useLibrary.getState().follows[0].twitchClipCursor,'clip-before');
  const removed=fixture.removed.length;
  fixture.response={channel:tw,videos:[old[2],old[3]]}; await useLibrary.getState().followRemoteQuery('rotation','twitch');
  assert.equal(fixture.removed.length,removed); assert.equal(useLibrary.getState().videos.length,9,'retired-only responses do not replace or reimport entries');
  fixture.responseForRequest=()=>{throw Error('Synthetic provider failure');};
  await assert.rejects(useLibrary.getState().followRemoteQuery('rotation','twitch'),/Synthetic/); assert.equal(fixture.removed.length,removed);
});

test('routine Twitch and mixed refreshes share per-source budgets and do not clean on live-only checks', async () => {
  const tw={id:'tw:routine-rotation',kind:'twitch',handle:'routine',title:'Routine'};
  const old=Array.from({length:6},(_,i)=>({...card(`tw:routine:${i}`,'twitch',tw.id),extension:'vod',addedAt:Date.now()-(500-i)*86400000}));
  reset(old);useLibrary.setState({follows:[tw]});updatePullSettings({twitchMaxEntries:6,remoteMaxEntries:6,twitchAutoCleanup:true,twitchCleanupBatch:2});
  fixture.response={channels:[tw],videos:[0,1,2].map(i=>({...card(`tw:routine-new:${i}`,'twitch',tw.id),extension:'vod',addedAt:Date.now()})),refreshedIds:[tw.id],retryAt:{}};
  await useLibrary.getState().refreshFollows(undefined);
  assert.equal(fixture.removed.length,2);assert.equal(useLibrary.getState().videos.length,6);
  await useLibrary.getState().refreshFollows('twitch',{twitchLiveOnly:true});assert.equal(fixture.removed.length,2);
});

test('Adult pulls rotate at full capacity across providers, retain protected entries and stop at the whole-pull budget', async () => {
  const make=(provider,i)=>({...card(`${provider}:rotation:${i}`,provider,`${provider}:discover`),extension:'mp4',mime:'video/mp4',addedAt:Date.now()-(500-i)*86400000,remote:{kind:provider,videoId:String(i)}});
  const old=[...Array.from({length:5},(_,i)=>make('eporner',i)),...Array.from({length:5},(_,i)=>make('redtube',i))];
  reset(old);useLibrary.setState({likes:{[old[0].id]:true},favorites:{[old[1].id]:true}});
  updatePullSettings({adultAutoCleanup:true,adultMaxEntries:10,remoteMaxEntries:10,adultCleanupBatch:2});
  fixture.responseForRequest=data=>{const provider=data.providers[0];return {videos:[{...make(provider,100+fixture.requests),addedAt:Date.now()}],providerNextPages:{[provider]:null},providerNextOffsets:{[provider]:0},providerDiagnostics:[{provider,status:'ok',titles:1,detail:'fixture'}]};};
  await useLibrary.getState().searchAdultFeed('all','top-weekly',{providers:['eporner','redtube'],maxVideos:10});
  assert.equal(fixture.requests,2);assert.equal(fixture.removed.length,2);assert.equal(useLibrary.getState().videos.length,10);
  assert.ok(useLibrary.getState().videos.some(v=>v.id===old[0].id));assert.ok(useLibrary.getState().videos.some(v=>v.id===old[1].id));assert.equal(fixture.writes.length,2);
  fixture.responseForRequest=()=>({videos:[old[2]],providerNextPages:{eporner:null},providerNextOffsets:{eporner:0},providerDiagnostics:[]});
  await useLibrary.getState().searchAdultFeed('retired-test','top-weekly',{providers:['eporner'],maxVideos:1});
  assert.equal(fixture.removed.length,2);assert.equal(useLibrary.getState().videos.length,10);
});

test('Twitch imports use one replacement budget and zero caps hold all providers even with cleanup enabled', async () => {
  const tw={id:'tw:import-rotation',kind:'twitch',handle:'importrotation',title:'Import'};
  const old=Array.from({length:6},(_,i)=>({...card(`tw:import-rotation:${i}`,'twitch',tw.id),addedAt:Date.now()-(500-i)*86400000}));
  reset(old);useLibrary.setState({follows:[tw]});updatePullSettings({twitchAutoCleanup:true,twitchMaxEntries:6,twitchCleanupBatch:2});
  fixture.response={ok:[{channel:tw,videos:[0,1,2].map(i=>({...card(`tw:new-import:${i}`,'twitch',tw.id),addedAt:Date.now()}))}],failed:0,failedQueries:[],failedReasons:{}};
  await useLibrary.getState().importBatch([{query:'importrotation',kind:'twitch'}]);assert.equal(fixture.removed.length,2);assert.equal(useLibrary.getState().videos.length,6);
  updatePullSettings({twitchMaxEntries:0,adultMaxEntries:0,adultAutoCleanup:true});
  const before=fixture.requests;
  await assert.rejects(useLibrary.getState().followRemoteQuery('importrotation','twitch'),/entry limit/);
  await assert.rejects(useLibrary.getState().searchAdultFeed('all','top-weekly',{providers:['eporner']}),/entry limit/);
  assert.equal(fixture.requests,before);assert.equal(fixture.removed.length,2);
});

test('an empty Twitch cache borrows combined-cap slots from enabled YouTube cleanup without touching protected videos', async () => {
  const {setRating}=await import('../src/lib/media-feedback.ts');
  const old=Array.from({length:8},(_,i)=>cleanupCard(`shared-donor-${i}`,i));
  const tw={id:'tw:shared-room',kind:'twitch',handle:'sharedroom',title:'Shared room',twitchArchiveCursor:'before'};
  reset(old);useLibrary.setState({follows:[channel,tw],likes:{[old[0].id]:true},favorites:{[old[1].id]:true}});setRating(old[2].id,5);
  updatePullSettings({youtubeMaxEntries:8,twitchMaxEntries:8,remoteMaxEntries:8,youtubeAutoCleanup:true,twitchAutoCleanup:true,youtubeCleanupBatch:2,twitchCleanupBatch:2,sharedCapCleanup:true});
  fixture.response={channel:{...tw,twitchArchiveCursor:'after'},videos:[0,1,2].map(i=>({...card(`tw:shared-new:${i}`,'twitch',tw.id),extension:'vod',addedAt:Date.now()}))};
  await useLibrary.getState().followRemoteQuery('sharedroom','twitch');
  await flush();
  const state=useLibrary.getState();assert.equal(state.videos.length,8);assert.equal(state.videos.filter(v=>v.remote.kind==='twitch').length,2);
  assert.deepEqual(fixture.removed,[old[3].id,old[4].id]);assert.equal(state.follows.find(c=>c.id===tw.id).twitchArchiveCursor,'before');
  assert.equal(state.youtubeCleanup.groups.youtube.removedCount,2);assert.equal(state.youtubeCleanup.groups.twitch,undefined);assert.match(state.cleanupNotes.twitch,/other enabled caches/);
  for(const row of old.slice(0,3))assert.ok(state.videos.some(v=>v.id===row.id));
});

test('shared replacement respects opt-out, disabled donors, incoming source caps and duplicate-only responses', async () => {
  const old=Array.from({length:6},(_,i)=>cleanupCard(`shared-off-${i}`,i)),tw={id:'tw:shared-off',kind:'twitch',handle:'sharedoff',title:'Off'};
  for(const patch of [{sharedCapCleanup:false},{youtubeAutoCleanup:false}]) {
    reset(old);useLibrary.setState({follows:[tw]});updatePullSettings({youtubeMaxEntries:6,twitchMaxEntries:6,remoteMaxEntries:6,youtubeAutoCleanup:true,twitchAutoCleanup:true,...patch});
    fixture.response={channel:tw,videos:[{...card('tw:off-new','twitch',tw.id),addedAt:Date.now()}]};
    await useLibrary.getState().followRemoteQuery('sharedoff','twitch');await flush();assert.equal(fixture.removed.length,0);assert.equal(useLibrary.getState().videos.length,6);
  }
  reset(old);updatePullSettings({youtubeAutoCleanup:true,twitchAutoCleanup:true,youtubeMaxEntries:6,twitchMaxEntries:0,remoteMaxEntries:6});
  await assert.rejects(useLibrary.getState().followRemoteQuery('sharedoff','twitch'),/entry limit/);assert.equal(fixture.requests,0);assert.equal(fixture.removed.length,0);
  const existing=[0,1].map(i=>({...card(`tw:shared-existing:${i}`,'twitch',tw.id),addedAt:Date.now()-500*86400000}));
  reset([...old,...existing]);useLibrary.setState({follows:[tw]});updatePullSettings({youtubeAutoCleanup:true,twitchAutoCleanup:true,youtubeMaxEntries:6,twitchMaxEntries:6,remoteMaxEntries:8});
  fixture.response={channel:tw,videos:existing};await useLibrary.getState().followRemoteQuery('sharedoff','twitch');await flush();assert.equal(fixture.removed.length,0);assert.equal(useLibrary.getState().videos.length,8);
});

test('mixed pulls reserve donated slots for the emptier source instead of spending them twice on the dense provider', async () => {
  const old=Array.from({length:6},(_,i)=>cleanupCard(`mixed-reserved-${i}`,i));
  const tw={id:'tw:mixed-reserved',kind:'twitch',handle:'reserved',title:'Reserved',twitchArchiveCursor:'before'};
  reset(old);useLibrary.setState({follows:[channel,tw]});updatePullSettings({youtubeAutoCleanup:true,twitchAutoCleanup:true,youtubeMaxEntries:6,twitchMaxEntries:6,remoteMaxEntries:6,youtubeCleanupBatch:2,twitchCleanupBatch:2});
  fixture.response={channels:[{...channel,catalogCursor:'after'},{...tw,twitchArchiveCursor:'after'}],videos:[...Array.from({length:2},(_,i)=>cleanupCard(`mixed-yt-new-${i}`,400)),...Array.from({length:2},(_,i)=>({...card(`tw:mixed-new-${i}`,'twitch',tw.id),extension:'vod',addedAt:Date.now()}))],refreshedIds:[channel.id,tw.id],liveCheckedIds:[],retryAt:{}};
  await useLibrary.getState().refreshFollows(undefined);
  const state=useLibrary.getState();assert.equal(fixture.removed.length,2);assert.equal(state.videos.length,6);assert.equal(state.videos.filter(v=>v.remote.kind==='twitch').length,2);
  assert.equal(state.follows.find(c=>c.id===channel.id).catalogCursor,'before');assert.equal(state.follows.find(c=>c.id===tw.id).twitchArchiveCursor,'before');
  assert.equal(fixture.writes.filter(v=>v.id.startsWith('mixed-yt-new')).length,0);
});

test('lowered caps recover through bounded successful pulls and retain the rejected page until room exists', async () => {
  const old=Array.from({length:10},(_,i)=>cleanupCard(`lowered-recovery-${i}`,i));
  reset(old);updatePullSettings({youtubeAutoCleanup:true,youtubeMaxEntries:6,remoteMaxEntries:20,youtubeCleanupBatch:2,sharedCapCleanup:false});
  fixture.response={channel:{...channel,catalogCursor:'after'},videos:Array.from({length:3},(_,i)=>cleanupCard(`lowered-new-${i}`,400))};
  for(const expected of [8,6,6]) {await useLibrary.getState().followRemoteQuery('test','youtube');await flush();assert.equal(useLibrary.getState().videos.length,expected);assert.equal(useLibrary.getState().follows[0].catalogCursor,'before');}
  assert.equal(fixture.removed.length,6);assert.equal(fixture.writes.length,2);
  await useLibrary.getState().followRemoteQuery('test','youtube');await flush();assert.equal(fixture.removed.length,7);assert.equal(useLibrary.getState().videos.length,6);assert.equal(useLibrary.getState().follows[0].catalogCursor,'after');
});

test('automatic Adult replacement stays at its catalog target while manual pulls can use the larger source cap', async () => {
  const old=Array.from({length:1000},(_,i)=>({...card(`eporner:auto-target:${i}`,'eporner','eporner:discover'),addedAt:Date.now()-(2000-i)*86400000}));
  reset(old);updatePullSettings({adultAutoCleanup:true,adultCatalogTarget:1000,adultMaxEntries:2000,remoteMaxEntries:3000,adultCleanupBatch:2});
  fixture.response={videos:[0,1,2].map(i=>({...card(`eporner:auto-new:${i}`,'eporner','eporner:discover'),addedAt:Date.now()})),providerNextPages:{eporner:null},providerNextOffsets:{eporner:0},providerDiagnostics:[]};
  await useLibrary.getState().searchAdultFeed('all','top-weekly',{automatic:true,providers:['eporner'],maxVideos:5});
  assert.equal(useLibrary.getState().videos.length,1000);assert.equal(fixture.removed.length,2);assert.equal(fixture.writes.length,2);
  await useLibrary.getState().searchAdultFeed('all','top-weekly',{providers:['eporner'],maxVideos:5});
  assert.equal(useLibrary.getState().videos.length,1001);assert.equal(fixture.removed.length,2);
});

test('lowering a cleanup batch during a sweep respects already spent replacements rather than resetting per page', async () => {
  const old=Array.from({length:6},(_,i)=>cleanupCard(`budget-change-${i}`,i));
  reset(old);useLibrary.setState({follows:[channel,{...channel,id:'yt:budget-second',handle:'Second'}]});
  updatePullSettings({youtubeAutoCleanup:true,youtubeMaxEntries:6,youtubeSourcesPerSweep:100,youtubeCleanupBatch:2,sharedCapCleanup:false});
  fixture.beforeResponse=()=>updatePullSettings({youtubeCleanupBatch:1});
  fixture.responseForRequest=data=>({channels:data.channels.map(source=>({...source,catalogCursor:'after'})),videos:data.channels.map(source=>({...cleanupCard(`budget-change-new-${source.id}`,400),folderId:source.id})),refreshedIds:data.channels.map(source=>source.id),retryAt:{}});
  await useLibrary.getState().refreshFollows('youtube',{catalog:true});
  assert.equal(fixture.requests,1);assert.equal(fixture.removed.length,1);assert.equal(useLibrary.getState().videos.length,6);
  assert.equal(useLibrary.getState().follows.find(source=>source.id==='yt:budget-second').catalogCursor,'before');
});

test('unlocked manually authored tags and category provenance protect cached videos during cleanup', async()=>{
  const old=Array.from({length:6},(_,i)=>cleanupCard(`manual-unlocked-${i}`,i));reset(old);updatePullSettings({youtubeCleanupBatch:2});
  const tags={[old[0].id]:['my-topic']},metadataProvenance={[old[0].id]:{tags:{'my-topic':'manual'}},[old[1].id]:{tags:{},category:'manual'}};
  useLibrary.setState({tags,metadataProvenance});await useLibrary.getState().cleanupRemoteCache('youtube');
  assert.deepEqual(fixture.removed,[old[2].id,old[3].id]);assert.ok(useLibrary.getState().videos.includes(old[0]));assert.ok(useLibrary.getState().videos.includes(old[1]));
  assert.equal(useLibrary.getState().tags[old[0].id],tags[old[0].id]);assert.equal(useLibrary.getState().metadataProvenance[old[0].id],metadataProvenance[old[0].id]);
});

test('an unallocated disabled source cannot take the slots freed for an enabled source in a mixed response', async()=>{
  const old=Array.from({length:6},(_,i)=>cleanupCard(`disabled-reservation-${i}`,i)),tw={id:'tw:disabled-reservation',kind:'twitch',handle:'disabled',title:'Disabled',twitchArchiveCursor:'before'};
  reset(old);useLibrary.setState({follows:[channel,tw]});updatePullSettings({youtubeAutoCleanup:true,twitchAutoCleanup:false,youtubeMaxEntries:6,twitchMaxEntries:6,remoteMaxEntries:6,youtubeCleanupBatch:2});
  fixture.response={channels:[{...channel,catalogCursor:'after'},{...tw,twitchArchiveCursor:'after'}],videos:[...Array.from({length:2},(_,i)=>card(`tw:disabled-new-${i}`,'twitch',tw.id)),...Array.from({length:2},(_,i)=>cleanupCard(`enabled-new-${i}`,400))],refreshedIds:[channel.id,tw.id],liveCheckedIds:[],retryAt:{}};
  await useLibrary.getState().refreshFollows(undefined);const state=useLibrary.getState();
  assert.equal(fixture.removed.length,2);assert.equal(state.videos.length,6);assert.equal(state.videos.filter(v=>v.remote.kind==='twitch').length,0);
  assert.equal(state.follows.find(c=>c.id===channel.id).catalogCursor,'before');assert.equal(state.follows.find(c=>c.id===tw.id).twitchArchiveCursor,'before');
});

test('offline Twitch transitions preserve the cached record on disk as well as memory instead of silently deleting saved data', async()=>{
  const tw={id:'tw:live-capacity',kind:'twitch',handle:'capacity',title:'Capacity'};
  const old={...card('tw:capacity-live','twitch',tw.id),extension:'live',remote:{kind:'twitch',videoId:'capacity-live',live:true,observedAt:Date.now()}};
  reset([old]);useLibrary.setState({follows:[tw]});updatePullSettings({twitchMaxEntries:1,remoteMaxEntries:1});
  fixture.response={channels:[{...tw,live:false}],videos:[],refreshedIds:[tw.id],liveCheckedIds:[tw.id],retryAt:{}};
  await useLibrary.getState().refreshFollows('twitch',{twitchLiveOnly:true});assert.equal(useLibrary.getState().videos.length,1);assert.equal(useLibrary.getState().videos[0].remote.live,false);
  assert.ok(fixture.writes.some(row=>row.id===old.id&&row.remote.live===false));assert.equal(fixture.removed.includes(old.id),false);assert.equal(useLibrary.getState().youtubeCleanup.removedCount,0);
});

test('a one-entry channel cache can replace its unrated representative with a new video from the same source', async()=>{
  const old=cleanupCard('sole-representative',0);reset([old]);updatePullSettings({youtubeAutoCleanup:true,youtubeMaxEntries:1,remoteMaxEntries:1,youtubeCleanupBatch:1,sharedCapCleanup:false});
  fixture.response={channel:{...channel,catalogCursor:'after'},videos:[cleanupCard('sole-replacement',400)]};
  await useLibrary.getState().followRemoteQuery('test','youtube');await flush();
  assert.deepEqual(fixture.removed,[old.id]);assert.deepEqual(useLibrary.getState().videos.map(row=>row.id),['sole-replacement']);assert.equal(useLibrary.getState().follows[0].catalogCursor,'after');
});

test('sole representatives remain when a partial mixed-creator page cannot guarantee replacement of every source membership', async()=>{
  const old={...cleanupCard('sole-playlist',0),remote:{kind:'youtube',videoId:'sole-playlist',publishedSource:'provider',sourceIds:['playlist:keep']}};
  reset([old]);updatePullSettings({youtubeAutoCleanup:true,youtubeMaxEntries:1,remoteMaxEntries:1,youtubeCleanupBatch:1});
  fixture.response={channel:{...channel,catalogCursor:'after'},videos:[cleanupCard('without-playlist',400)]};
  await useLibrary.getState().followRemoteQuery('test','youtube');await flush();assert.equal(fixture.removed.length,0);assert.equal(useLibrary.getState().videos[0].id,old.id);assert.equal(useLibrary.getState().follows[0].catalogCursor,'before');
});

test('archive publication patches only incoming resume marks without enumerating or copying dense saved progress', async()=>{
  const old=card('resume-page');reset([old]);updatePullSettings({youtubeMaxEntries:100});
  const progress=new Proxy({kept:{t:10,d:100,at:1},'resume-page':{t:20,d:100,at:1}},{ownKeys(){throw Error('Entire playback ledger exported');}});
  const resumeProgress=new Proxy({'id:resume-page':{t:40,d:100,at:2}},{ownKeys(){throw Error('Entire resume ledger exported');}});
  useLibrary.setState({progress,resumeProgress});
  fixture.response={channels:[{...channel,catalogCursor:'after'}],videos:[old],refreshedIds:[channel.id],retryAt:{}};
  await useLibrary.getState().refreshFollows('youtube',{catalog:true});
  const first=useLibrary.getState().progress;
  assert.equal(first['resume-page'].t,40);assert.equal(first.kept,progress.kept);assert.equal(progress['resume-page'].t,20);
  const {recentActivityRecord}=await import('../src/lib/videos/activity-records.ts');
  assert.deepEqual(Object.keys(recentActivityRecord(first)),['resume-page'],'pull-derived patches keep a bounded emergency mirror without exporting the old ledger');
  await useLibrary.getState().refreshFollows('youtube',{catalog:true});
  assert.equal(useLibrary.getState().progress,first,'unchanged pages do not create a new progress snapshot');
  useLibrary.setState({progress:{},resumeProgress:{}});
});

test('refresh preparation rebases onto a foreground catalog edit without requesting the provider page again', async()=>{
  const old=Array.from({length:2000},(_,i)=>card(`rebase-${i}`));reset(old);updatePullSettings({youtubeMaxEntries:3000});
  fixture.response={channels:[{...channel,catalogCursor:'after'}],videos:[card('page-new')],refreshedIds:[channel.id],retryAt:{}};
  let response=false,turns=0,edited=false;fixture.beforeResponse=()=>{response=true;};
  const originalScheduler=globalThis.scheduler;
  globalThis.scheduler={postTask:async work=>{
    await new Promise(resolve=>setImmediate(resolve));
    if(response&&++turns===2){edited=true;useLibrary.setState(s=>({videos:[...s.videos,card('foreground-new')],likes:{'page-new':true}}));}
    return work();
  }};
  try{
    await useLibrary.getState().refreshFollows('youtube',{catalog:true});
    assert.equal(edited,true);assert.equal(fixture.requests,1);assert.equal(useLibrary.getState().videos.length,2002);
    assert.equal(useLibrary.getState().videos.filter(v=>v.id==='page-new').length,1);
    assert.equal(useLibrary.getState().videos.filter(v=>v.id==='foreground-new').length,1);
    assert.equal(useLibrary.getState().likes['page-new'],true);assert.equal(useLibrary.getState().follows[0].catalogCursor,'after');
  }finally{globalThis.scheduler=originalScheduler;}
});

test('explicit Twitch live reconciliation still completes while archive pulling is paused',async()=>{
  const {setPullsPaused}=await import('../src/lib/pull-control.ts');
  const tw={id:'tw:paused-check',kind:'twitch',handle:'paused-check',title:'Paused live check'};
  const live={...card('tw:paused-live','twitch',tw.id),remote:{kind:'twitch',videoId:'paused-live',live:true,observedAt:Date.now()}};
  reset([live]);useLibrary.setState({follows:[tw]});fixture.response={channels:[tw],videos:[],refreshedIds:[tw.id],liveCheckedIds:[tw.id],retryAt:{}};
  setPullsPaused(true);
  try{await useLibrary.getState().refreshFollows('twitch',{twitchLiveOnly:true});assert.equal(useLibrary.getState().videos[0].remote.live,false);assert.equal(fixture.requests,1);}
  finally{setPullsPaused(false);}
});

test('Adult multi-window pulls save accepted rows before a later failure and retain the latest resume page',async()=>{
 reset([]);updatePullSettings({adultBatchVideos:1200,adultMaxEntries:5000,remoteMaxEntries:10000});
 const pages=[];fixture.responseForRequest=data=>{const page=data.providerPages.eporner;pages.push(page);if(page===2){assert.equal(fixture.writes.length,400,'first window is durable before the next provider request');throw Error('Synthetic later failure');}return {videos:Array.from({length:data.maxVideos},(_,i)=>({...card('eporner:'+i,'eporner','eporner:discover'),mime:'video/mp4',extension:'mp4'})),providerNextPages:{eporner:2},providerNextOffsets:{eporner:0},providerDiagnostics:[{provider:'eporner',status:'loaded',titles:data.maxVideos,detail:'accepted'}]};};
 await useLibrary.getState().searchAdultFeed('checkpoint','latest',{providers:['eporner'],maxVideos:1200});
 assert.deepEqual(pages,[1,2]);assert.equal(useLibrary.getState().videos.length,400);assert.equal(useLibrary.getState().pullHistory[0].status,'partial');assert.equal(fixture.writes.length,400);
});
test('a live check during an Adult pull preserves that pull owner and newer state wins a delayed reply',async()=>{
 const tw={id:'tw:concurrent',kind:'twitch',handle:'concurrent',title:'Concurrent',channelId:'provider',live:true,liveCheckedAt:5000};
 const live={...card('tw:concurrent:live','twitch',tw.id),extension:'live',remote:{kind:'twitch',live:true,videoId:'concurrent',observedAt:5000}};
 reset([live]);const owner={id:'adult-owner',provider:'adult',action:'Catalog pull',status:'running',total:1,done:0};useLibrary.setState({remoteBusy:true,pullActivity:owner,follows:[tw]});
 fixture.response={channels:[{...tw,live:false,liveCheckedAt:4000}],videos:[],refreshedIds:[tw.id],liveCheckedIds:[tw.id],retryAt:{}};
 const result=await useLibrary.getState().refreshFollows('twitch',{twitchLiveOnly:true,channelIds:[tw.id]});
 assert.ok(result.pull);assert.equal(useLibrary.getState().remoteBusy,true);assert.equal(useLibrary.getState().pullActivity,owner);assert.equal(useLibrary.getState().follows[0].live,true);assert.equal(useLibrary.getState().videos[0].remote.live,true);
 useLibrary.setState({remoteBusy:false,pullActivity:null});
});


test('2,000 offline YouTube checks preserve an 80k catalog identity and archive ownership with bounded progress commits',async()=>{
 const catalog=Array.from({length:80000},(_,i)=>card('quick-live-old-'+i));reset(catalog);
 const follows=Array.from({length:2000},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'creator'+i,title:'Creator '+i}));
 const archiveStatus={action:'Archive owner',at:1,checked:1,refreshed:1,failed:0,youtube:1,twitch:0},tags={saved:['science']};
 useLibrary.setState({follows,remoteBusy:true,refreshing:true,remoteRefreshStatus:archiveStatus,tags});
 fixture.responseForRequest=data=>({channels:data.channels.map(channel=>({...channel,live:false,liveCheckedAt:Date.now()})),videos:[],refreshedIds:data.channels.map(channel=>channel.id),liveCheckedIds:data.channels.map(channel=>channel.id),retryAt:{}});
 const started=performance.now(),result=await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true});
 const state=useLibrary.getState();assert.equal(result.pull.done,2000);assert.equal(result.pull.failed,0);assert.equal(fixture.requests,250);assert(fixture.inputs.every(data=>data.channels.length<=8));
 assert.equal(state.videos,catalog);assert.equal(state.tags,tags);assert.equal(fixture.writes.length,0);assert.equal(state.remoteRefreshStatus,archiveStatus);assert.equal(state.refreshing,true);assert.equal(state.remoteBusy,true);assert.equal(state.youtubeLiveProgress.status,'complete');assert.equal(state.youtubeLiveProgress.checked,2000);assert(state.follows.every(channel=>channel.liveCheckedAt));
 console.log('2,000 checks with 80,000 saved titles: '+Math.round(performance.now()-started)+'ms mocked provider/disk, catalog identity retained');
});

test('a quick live provider hold stops after the attempted batch without failing untouched creators or freezing archives',async()=>{
 reset([]);const follows=Array.from({length:2000},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'creator'+i,title:'Creator '+i}));useLibrary.setState({follows});
 const retryAt=Date.now()+300000;fixture.responseForRequest=data=>({channels:data.channels.map(channel=>({...channel,liveCheckedAt:Date.now(),lastLiveFailure:{at:Date.now(),kind:'rate-limited',message:'Live HTTP 429',retryAt,cooldownScope:'live'}})),videos:[],refreshedIds:[],liveCheckedIds:[],retryAt:{},providerRetryAt:retryAt,providerCooldownScope:'live'});
 const result=await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true});const state=useLibrary.getState();assert.equal(fixture.requests,3);assert.equal(result.pull.done,24);assert.equal(result.pull.total,2000);assert.equal(state.follows.filter(channel=>channel.lastLiveFailure).length,24);assert.equal(state.follows.filter(channel=>!channel.liveCheckedAt).length,1976);assert.equal(state.youtubeRefreshStatus,null);assert.equal(state.youtubeLiveProgress.status,'partial');
});


test('lightweight Twitch checks retain an 80k catalog identity across 2,000 follows and use only bounded live batches',async()=>{
 const catalog=Array.from({length:80000},(_,i)=>card('twitch-live-old-'+i));reset(catalog);const follows=Array.from({length:2000},(_,i)=>({id:'tw:creator'+i,kind:'twitch',handle:'creator'+i,title:'Creator '+i}));
 useLibrary.setState({follows,remoteBusy:true,refreshing:true});fixture.responseForRequest=data=>({channels:data.channels.map(c=>({...c,live:false,liveCheckedAt:Date.now()})),videos:[],refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:data.channels.map(c=>c.id),retryAt:{}});
 const result=await useLibrary.getState().refreshFollows('twitch',{twitchLiveOnly:true,liveSweep:true});assert.equal(result.pull.done,2000);assert.equal(result.pull.failed,0);assert.equal(fixture.requests,Math.ceil(2000/12));assert.equal(fixture.inputs[0].channels.length,12);assert(fixture.inputs.every(data=>data.twitchLiveOnly&&!data.youtubeCatalog&&data.channels.length<=12));assert.equal(useLibrary.getState().videos,catalog);assert.equal(fixture.writes.length,0);assert.equal(useLibrary.getState().twitchLiveProgress.checked,2000);assert.equal(useLibrary.getState().twitchLiveProgress.broadcasts,0);
});

test('mixed live checks report provider-specific progress and first-result YouTube batches retain all targets',async()=>{
 reset([]);const channels=[{id:'tw:mixed-live',kind:'twitch',handle:'mixed_live',title:'Twitch'},...Array.from({length:3},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'creator'+i,title:'Creator '+i}))];useLibrary.setState({follows:channels});fixture.responseForRequest=data=>({channels:data.channels.map(c=>({...c,live:false,liveCheckedAt:Date.now()})),videos:[],refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:data.channels.map(c=>c.id),retryAt:{}});
 await useLibrary.getState().refreshFollows(undefined,{youtubeLiveOnly:true,twitchLiveOnly:true,liveSweep:true});assert.equal(useLibrary.getState().youtubeLiveProgress.total,3);assert.equal(useLibrary.getState().youtubeLiveProgress.checked,3);assert.equal(useLibrary.getState().twitchLiveProgress.total,1);assert.equal(useLibrary.getState().twitchLiveProgress.checked,1);
});

test('explicitly saved live rooms persist one descriptor with Adult isolation, without copying unrelated saved records',async()=>{
 reset([]);const room={...card('chaturbate:retained_room','chaturbate','chaturbate:discover'),name:'Public room',remote:{kind:'chaturbate',videoId:'retained_room',channelName:'retained_room',live:true,observedAt:Date.now(),watchUrl:'https://chaturbate.com/retained_room/'}};useLibrary.getState().toggleFavorite(room.id);assert.equal(await useLibrary.getState().retainLiveRoom(room),true);assert.equal(useLibrary.getState().videos.length,1);assert(useLibrary.getState().tags[room.id].includes('adult'));assert(useLibrary.getState().folders.some(folder=>folder.id===room.folderId&&folder.adult));assert.equal(fixture.writes.length,1);assert.equal(await useLibrary.getState().retainLiveRoom(room),true);assert.equal(fixture.writes.length,1);useLibrary.setState({adultsUnlocked:false});assert.equal(await useLibrary.getState().retainLiveRoom({...room,id:'chaturbate:locked'}),false);
});


test('automatic live batches re-evaluate creators becoming due during responses and yield without false partial failures',async()=>{
 reset([]);let now=1_000_000;const realNow=Date.now;Date.now=()=>now;
 const {setPullsPaused}=await import('../src/lib/pull-control.ts');setPullsPaused(true);
 try {
  const follows=Array.from({length:2000},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'creator'+i,title:'Creator '+i,live:i<52,liveCheckedAt:i<52?now-55_000:undefined}));
  useLibrary.setState({follows});
  fixture.responseForRequest=data=>{if(fixture.requests%3===1)now+=6_000;return {channels:data.channels.map(c=>({...c,liveCheckedAt:now})),videos:[],refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:data.channels.map(c=>c.id),retryAt:{}};};
  const result=await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true,scheduled:true,liveDemand:true});
  assert(fixture.inputs[0].channels.every(c=>!c.live),'initially only discovery is due');
  assert(fixture.inputs.slice(3).some(data=>data.channels.some(c=>c.live)),'a live creator becoming due must enter a refill outside the original selected sweep');
  assert(fixture.inputs.every(data=>data.channels.length<=24 && data.liveDemand));
  assert(fixture.requests>=6&&fixture.requests<=12);assert.equal(result.pull.status,'success');assert.equal(fixture.inputs[0].channels.length,8);assert.equal(result.pull.total,fixture.requests*8);assert.equal(useLibrary.getState().youtubeLiveProgress.status,'complete');
  assert(useLibrary.getState().follows.some(c=>!c.liveCheckedAt),'untouched creators remain eligible for the next turn');
 } finally {Date.now=realNow;setPullsPaused(false);}
});

test('failed live transport batches retain observations and back off without pinning the discovery prefix',async()=>{
 reset([]);const now=Date.now();const follows=Array.from({length:24},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'creator'+i,title:'Creator '+i,live:i===0,liveCheckedAt:i===0?now-65_000:undefined}));useLibrary.setState({follows});
 fixture.responseForRequest=()=>{throw Error('Synthetic live transport timeout');};
 await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true,scheduled:true});
 const failed=useLibrary.getState().follows[0];assert(failed.lastLiveFailure.retryAt>Date.now());assert.equal(failed.live,true);assert.equal(failed.liveCheckedAt,follows[0].liveCheckedAt);
 const before=fixture.requests;await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true,scheduled:true});assert.equal(fixture.requests,before,'retry backoff must apply to transport failures too');
});


test('pausing during an automatic live response saves that observation, releases ownership, and allows the Live page to continue',async()=>{
 reset([]);const {setPullsPaused}=await import('../src/lib/pull-control.ts');const follows=Array.from({length:100},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'creator'+i,title:'Creator '+i}));useLibrary.setState({follows});
 fixture.responseForRequest=data=>{setPullsPaused(true);return {channels:data.channels.map(c=>({...c,live:false,liveCheckedAt:Date.now()})),videos:[],refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:data.channels.map(c=>c.id),retryAt:{}};};
 try {
  const first=await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true,scheduled:true});assert.equal(fixture.requests,3);assert.equal(first.pull.status,'success');assert.equal(useLibrary.getState().refreshing,false);assert.equal(useLibrary.getState().youtubeLiveProgress.checked,24);
  const paused=await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true,scheduled:true});assert.equal(paused.skipped,'paused');
  await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true,scheduled:true,liveDemand:true});assert.equal(useLibrary.getState().follows.filter(c=>c.liveCheckedAt).length,100);
 }finally{setPullsPaused(false);}
});


test('explicit Twitch content pulls queue 100 creators in small archive responses; scheduled turns stay bounded',async()=>{
 reset([]);const follows=Array.from({length:600},(_,i)=>({id:'tw:queue'+i,kind:'twitch',handle:'queue'+i,title:'Queue '+i}));useLibrary.setState({follows});fixture.responseForRequest=data=>({channels:data.channels,videos:[],refreshedIds:data.channels.map(c=>c.id),retryAt:{}});
 const manual=await useLibrary.getState().refreshFollows('twitch',{twitchRoutine:true});assert.equal(manual.pull.total,100);assert.equal(manual.pull.done,100);assert.equal(fixture.requests,50);assert(fixture.inputs.every(d=>d.channels.length<=2));
 const scheduled=await useLibrary.getState().refreshFollows('twitch',{twitchRoutine:true,scheduled:true});assert.equal(scheduled.pull.total,12);assert.equal(scheduled.pull.done,12);
});

test('YouTube negative checks persist a ten-minute hold through reload and positive recovery clears it',async()=>{
 reset([]);const actual=Date.now;let now=1_000_000;Date.now=()=>now;
 const follow={id:'yt:UC1234567890123456789012',channelId:'UC1234567890123456789012',kind:'youtube',handle:'creator',title:'Creator',live:true,liveCheckedAt:now};
 const video={...card('yt:v:abcdefghijk','youtube',follow.id),remote:{kind:'youtube',videoId:'abcdefghijk',channelId:follow.channelId,live:true,observedAt:now,viewers:123}};useLibrary.setState({videos:[video],follows:[follow]});
 fixture.responseForRequest=data=>({channels:data.channels.map(c=>({...c,live:false,liveCheckedAt:now})),videos:[],refreshedIds:[follow.id],liveCheckedIds:[follow.id],retryAt:{}});
 try{await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true});let state=useLibrary.getState();assert.equal(state.follows[0].live,true);assert.equal(state.videos[0].remote.liveOfflineSince,now);assert(fixture.writes.some(v=>v.remote.liveOfflineSince===now));
 useLibrary.setState({videos:JSON.parse(JSON.stringify(state.videos)),follows:JSON.parse(JSON.stringify(state.follows))});now+=599999;await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true});assert.equal(useLibrary.getState().videos[0].remote.live,true);
 now++;await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true});assert.equal(useLibrary.getState().videos[0].remote.live,false);assert.equal(useLibrary.getState().follows[0].live,false);
 fixture.responseForRequest=data=>({channels:data.channels.map(c=>({...c,live:true,liveCheckedAt:++now})),videos:[{...video,remote:{...video.remote,observedAt:now,liveOfflineSince:undefined}}],refreshedIds:[follow.id],liveCheckedIds:[follow.id],retryAt:{}});await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true});state=useLibrary.getState();assert.equal(state.videos[0].remote.live,true);assert.equal(state.videos[0].remote.liveOfflineSince,undefined);assert.equal(state.follows[0].liveOfflineSince,undefined);
 }finally{Date.now=actual;}
});


test('live observations and failure health publish before a 215k-entry catalog finishes reconciliation',async()=>{
 reset([]);updatePullSettings({youtubeMaxEntries:300000,remoteMaxEntries:300000,youtubeRequestGapMs:1500});
 const now=Date.now(),follows=Array.from({length:2},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'early'+i,title:'Early '+i,live:true,liveCheckedAt:now-60000}));
 const videos=Array.from({length:215452},(_,i)=>card('early-old'+i));useLibrary.setState({videos,follows});
 fixture.response={channels:[{...follows[0],liveCheckedAt:now,lastLiveFailure:undefined},{...follows[1],lastLiveFailure:{kind:'unavailable',at:now,message:'Unreadable live catalog',retryAt:now+30000,recovery:''}}],videos:[{...card('yt:v:early000001','youtube',follows[0].id),remote:{kind:'youtube',channelId:follows[0].channelId,videoId:'early000001',live:true,observedAt:now,viewers:17}}],refreshedIds:[follows[0].id],liveCheckedIds:[follows[0].id],retryAt:{}};
 let observedBeforeMerge=false;const stop=useLibrary.subscribe(state=>{if(state.youtubeLiveProgress?.checked===2&&state.videos===videos){observedBeforeMerge=true;assert.equal(state.follows.find(c=>c.id===follows[0].id).liveCheckedAt,now);assert.equal(state.follows.find(c=>c.id===follows[1].id).liveCheckedAt,now-60000);assert.equal(state.youtubeLiveProgress.failed,1);assert.equal(state.youtubeLiveProgress.broadcasts,1);}});
 try{await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true});assert(observedBeforeMerge,'completed network observations must appear before full catalog preparation');assert.equal(useLibrary.getState().youtubeLiveProgress.broadcasts,1,'broadcast counters do not double after reconciliation');assert(useLibrary.getState().videos.some(v=>v.id==='yt:v:early000001'));}finally{stop();}
});


test('YouTube pipeline commits healthy creators and reaches the tail while its first batch is stalled',async()=>{
 reset([]);const now=Date.now(),follows=Array.from({length:48},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'pipeline'+i,title:'Pipeline '+i,live:i===0,liveCheckedAt:i===0?now-90000:undefined}));useLibrary.setState({follows});
 let release;const gate=new Promise(resolve=>release=resolve);let active=0,peak=0;
 fixture.responseForRequest=async data=>{peak=Math.max(peak,++active);try{if(data.channels.some(c=>c.handle==='pipeline0')){await gate;throw Error('Synthetic slow creator timeout');}return{channels:data.channels.map(c=>({...c,liveCheckedAt:Date.now()})),videos:[],refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:data.channels.map(c=>c.id),retryAt:{}};}finally{active--;}};
 const job=useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true});
 try{for(let i=0;i<500&&!useLibrary.getState().follows.find(c=>c.handle==='pipeline47').liveCheckedAt;i++)await new Promise(resolve=>setTimeout(resolve,5));const partial=useLibrary.getState();assert(partial.follows.find(c=>c.handle==='pipeline47').liveCheckedAt,'tail discovery must not wait for the first slow batch');assert.equal(partial.youtubeLiveProgress.checked,40);assert.equal(partial.follows.find(c=>c.handle==='pipeline0').liveCheckedAt,now-90000);assert(peak<=3);assert(fixture.inputs.every(input=>input.channels.length<=8));}finally{release();await job;}
 const state=useLibrary.getState();assert.equal(state.youtubeLiveProgress.checked,48);assert.equal(state.youtubeLiveProgress.failed,8);assert.equal(state.follows.find(c=>c.handle==='pipeline0').live,true);assert.equal(state.follows.filter(c=>!c.lastLiveFailure).length,40);assert.equal(state.refreshing,false);
});


test('movie runtime repair persists one local row while preserving source records and manual feedback',async()=>{
 const film={...card('local-movie'),remote:undefined,path:'Movies/Classic.1954.mkv',extension:'mkv',name:'Classic.1954.mkv'},other=card('other');reset([film,other]);const tags={['local-movie']:['movie','saved-choice']};useLibrary.setState({tags});await useLibrary.getState().setLocalVideoDuration(film.id,6700);const state=useLibrary.getState();assert.equal(state.videos[0].duration,6700);assert.equal(state.videos[1],other);assert.equal(state.tags,tags);assert.equal(fixture.writes.length,1);assert.equal(fixture.writes[0].id,film.id);await assert.rejects(state.setLocalVideoDuration(film.id,Infinity),/valid runtime/);
});
test('older Twitch pulls skip exhausted and cooled creators and pass each saved continuation without clipping the follow list',async()=>{
 reset([]);const follows=Array.from({length:110},(_,i)=>({id:'tw:older'+i,kind:'twitch',handle:'older'+i,title:'Older '+i,channelId:String(i),twitchArchiveCursor:'saved-'+i,...(i<5?{twitchArchiveExhaustedAt:1}:i<10?{twitchArchiveRetry:{attempts:1,retryAt:Date.now()+60000}}:{})}));useLibrary.setState({follows});fixture.responseForRequest=data=>({channels:data.channels.map(c=>({...c,twitchArchiveCursor:c.twitchArchiveCursor+'-next',twitchArchiveCheckedAt:Date.now()})),videos:[],refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:[],retryAt:{}});const result=await useLibrary.getState().refreshFollows('twitch',{twitchRoutine:true,twitchContinueArchive:true});assert.equal(result.pull.done,100);assert(fixture.inputs.every(input=>input.twitchContinueArchive&&input.channels.length<=4));assert.equal(new Set(fixture.inputs.flatMap(input=>input.channels.map(c=>c.id))).size,100);assert(fixture.inputs.every(input=>input.channels.every(c=>Number(c.handle.slice(5))>=10)));assert.equal(useLibrary.getState().follows.length,110);
});


test('cooperative YouTube preparation reuses 80k saved rows and prepared browse groups through unrelated Twitch refreshes',async()=>{
 const {prepareYoutubeSelection}=await import('../src/lib/videos/store.ts');const {prepareYoutubeBrowse}=await import('../src/lib/videos/youtube-browse.ts');
 let reads=0;const base=Date.UTC(2026,9,1),youtube=Array.from({length:80000},(_,i)=>{const remote={kind:'youtube',channelId:'owner'+i%180,publishedSource:'provider'};return {...card('saved'+i),addedAt:base-i*1000,get remote(){reads++;return remote;}};});
 const twitch=Array.from({length:20000},(_,i)=>card('twitch'+i,'twitch'));reset([...youtube,...twitch]);
 const initial=await prepareYoutubeSelection(useLibrary.getState(),new AbortController().signal,async()=>{});const browse=await prepareYoutubeBrowse(initial,undefined,async()=>{});
 const next=[...useLibrary.getState().videos];for(let i=80000;i<80100;i++)next[i]={...next[i],name:'Updated Twitch VOD'};
 useLibrary.setState({videos:next});reads=0;const selected=await prepareYoutubeSelection(useLibrary.getState(),new AbortController().signal,async()=>{});assert.equal(selected,initial);assert.equal(reads,0);
 let turns=0;assert.equal(await prepareYoutubeBrowse(selected,undefined,async()=>{turns++;}),browse);assert.equal(turns,0,'unchanged selection reuses format and creator indexes too');
});
test('real cooperative YouTube preparation updates live cards while date corrections and privacy edits keep stable full ordering',async()=>{
 const {prepareYoutubeSelection}=await import('../src/lib/videos/store.ts');const {youtubePublicationTime}=await import('../src/lib/videos/youtube-metadata.ts');
 const base=Date.UTC(2026,9,1),rows=Array.from({length:10000},(_,i)=>({...card('stable'+i),addedAt:base-(i%127)*1000,remote:{kind:'youtube',channelId:'owner',publishedSource:i%3?'provider':'unknown'}}));reset(rows);
 const initial=await prepareYoutubeSelection(useLibrary.getState(),new AbortController().signal,async()=>{}),next=[...rows];next[0]={...rows[0],name:'Updated live title',remote:{...rows[0].remote,live:true,viewers:123}};useLibrary.setState({videos:next});
 const updated=await prepareYoutubeSelection(useLibrary.getState(),new AbortController().signal,async()=>{});assert.notEqual(updated,initial);assert.equal(updated.find(v=>v.id==='stable0'),next[0]);assert.equal(updated.find(v=>v.id==='stable1'),rows[1]);
 const corrected=[...next];corrected[0]={...next[0],addedAt:base+1000,remote:{...next[0].remote,publishedSource:'watch'}};useLibrary.setState({videos:corrected});
 assert.deepEqual(await prepareYoutubeSelection(useLibrary.getState(),new AbortController().signal,async()=>{}),[...corrected].sort((a,b)=>youtubePublicationTime(b)-youtubePublicationTime(a)||(a.id<b.id?-1:a.id>b.id?1:0)));
 useLibrary.setState({hiddenVideos:{stable0:true}});assert(!(await prepareYoutubeSelection(useLibrary.getState(),new AbortController().signal,async()=>{})).some(v=>v.id==='stable0'));
 useLibrary.setState({folders:[{id:channel.id,name:'Private source',adult:true,kind:'youtube'}]});assert.equal((await prepareYoutubeSelection(useLibrary.getState(),new AbortController().signal,async()=>{})).length,0);
});


test('clip-only recent updates preserve live and VOD observations, older clip positions, feedback and known creation dates',async()=>{
 const follow={id:'tw:cliptest',kind:'twitch',handle:'cliptest',title:'Clip creator',live:true,liveCheckedAt:500,twitchArchiveCheckedAt:400,twitchArchiveCursor:'archive-before',twitchClipCursor:JSON.stringify({v:1,after:'older-before'}),lastProviderFailure:{kind:'integrity-challenge',message:'Archive challenge',at:300,recovery:'Retry archive'}};
 const live={...card('tw:cliptest:live','twitch',follow.id),remote:{kind:'twitch',live:true,viewers:42,observedAt:500}},vod={...card('tw:v:kept','twitch',follow.id),duration:5400,extension:'vod'},clip={...card('tw:c:kept','twitch',follow.id),extension:'clip',duration:30,addedAt:1000,remote:{kind:'twitch',videoId:'kept',views:5}};
 reset([live,vod,clip]);updatePullSettings({twitchMaxEntries:100,remoteMaxEntries:100});const favorites={[clip.id]:true},progress={[clip.id]:{t:10,d:30,at:100}};useLibrary.setState({follows:[follow],favorites,progress});
 fixture.response={channel:{id:follow.id,kind:'twitch',handle:follow.handle,title:follow.title,twitchClipRecentCheckedAt:600,twitchClipCheckedAt:600,lastResponseCount:1,lastClipFailure:undefined},videos:[{...clip,addedAt:0,remote:{...clip.remote,views:99}}]};
 await useLibrary.getState().followRemoteQuery('cliptest','twitch',{twitchClipMode:'recent',clipLimit:50});const state=useLibrary.getState(),saved=state.follows[0];assert.equal(fixture.inputs[0].twitchClipMode,'recent');assert.equal(saved.live,true);assert.equal(saved.liveCheckedAt,500);assert.equal(saved.twitchArchiveCursor,'archive-before');assert.equal(saved.twitchArchiveCheckedAt,400);assert.equal(saved.twitchClipCursor,follow.twitchClipCursor);assert.equal(saved.lastProviderFailure.message,'Archive challenge');assert.equal(state.videos.find(v=>v.id===clip.id).remote.views,99);assert.equal(state.videos.find(v=>v.id===clip.id).addedAt,1000);assert.equal(state.videos.find(v=>v.id===live.id),live);assert.equal(state.videos.find(v=>v.id===vod.id),vod);assert.equal(state.favorites,favorites);assert.equal(state.progress,progress);
});
test('clip-only transport failures set their own durable retry without resetting archive diagnostics or live state',async()=>{
 const follow={id:'tw:clipfail',kind:'twitch',handle:'clipfail',title:'Clip creator',live:true,liveCheckedAt:500,twitchArchiveCheckedAt:400,twitchArchiveCursor:'archive-before',twitchArchiveDiagnostics:{at:400,pages:1,received:2,accepted:2,duplicates:0,resumed:false,stopReason:'page-budget'},twitchClipCursor:JSON.stringify({v:1,after:'older-before'})};reset([]);useLibrary.setState({follows:[follow]});fixture.responseForRequest=()=>{throw Error('HTTP 503 clip provider');};
 await assert.rejects(useLibrary.getState().followRemoteQuery('clipfail','twitch',{twitchClipMode:'recent',clipLimit:50}),/503/);const saved=useLibrary.getState().follows[0];assert(saved.twitchClipRecentRetry);assert.equal(saved.twitchClipRetry,undefined);assert(saved.twitchClipRecentAttemptedAt>0);assert(saved.lastClipFailure);assert.equal(saved.twitchArchiveCheckedAt,400);assert.equal(saved.twitchArchiveCursor,'archive-before');assert.equal(saved.twitchArchiveDiagnostics,follow.twitchArchiveDiagnostics);assert.equal(saved.live,true);assert.equal(saved.lastProviderFailure,undefined);
});

test('recent upload batches publish fast creators before a held batch, keep two requests in flight and retain archive checkpoints',async()=>{
 reset([]);updatePullSettings({youtubeMaxEntries:100,remoteMaxEntries:100});
 const follows=Array.from({length:8},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',title:'Recent '+i,handle:'recent'+i,catalogCursor:'keep-'+i,catalogCheckedAt:1,lastProviderFailure:{kind:'unavailable',at:1,message:'Archive failed',recovery:''}}));
 useLibrary.setState({follows});let release,active=0,peak=0;const held=new Promise(r=>release=r);let fastSeen;const fast=new Promise(r=>fastSeen=r);
 fixture.responseForRequest=async data=>{peak=Math.max(peak,++active);try{if(data.channels[0].id===follows[0].id)await held;return{channels:data.channels.map(c=>({...c,catalogCursor:'incorrect',catalogCheckedAt:Date.now(),lastProviderFailure:undefined,lastCheckedAt:Date.now()})),videos:[],refreshedIds:data.channels.map(c=>c.id),retryAt:{}};}finally{active--;}};
 const stop=useLibrary.subscribe(s=>{if(s.follows.find(c=>c.id===follows[2].id)?.recentPull?.checkedAt)fastSeen();});
 const job=useLibrary.getState().refreshFollows('youtube',{channelIds:follows.map(c=>c.id)});
 try{await Promise.race([fast,new Promise((_,reject)=>setTimeout(()=>reject(Error('Fast batch blocked behind held creator')),5000))]);assert.equal(useLibrary.getState().follows.find(c=>c.id===follows[0].id).recentPull,undefined);assert.equal(peak,2);}
 finally{release();stop();await job;}
 const state=useLibrary.getState();assert.equal(fixture.requests,4);assert(fixture.inputs.every(x=>x.channels.length<=2));assert.equal(new Set(fixture.inputs.flatMap(x=>x.channels.map(c=>c.id))).size,8);
 for(let i=0;i<8;i++){const c=state.follows.find(c=>c.id===follows[i].id);assert(c.recentPull.checkedAt);assert.equal(c.catalogCursor,'keep-'+i);assert.equal(c.catalogCheckedAt,1);assert.equal(c.lastProviderFailure.message,'Archive failed');}
});

test('empty recent checks preserve a 80k-entry catalog and tag references without catalog writes',async()=>{
 await flush();const videos=Array.from({length:80000},(_,i)=>card('recent-old'+i));reset(videos);
 const tags={saved:['personal']},metadataProvenance={},follow={...channel,channelId:'UCabcdefghijklmnopqrstuv'};
 useLibrary.setState({follows:[follow],tags,metadataProvenance});fixture.response={channels:[{...follow,lastCheckedAt:Date.now()}],videos:[],refreshedIds:[follow.id],retryAt:{}};
 await useLibrary.getState().refreshFollows('youtube');await flush();const state=useLibrary.getState();
 assert.equal(state.videos,videos);assert.equal(state.tags,tags);assert.equal(state.metadataProvenance,metadataProvenance);assert.equal(fixture.writes.length,0);assert(state.follows[0].recentPull.checkedAt);
});

test('recent transport failure retains saved archive progress and consumes only affected creators turn',async()=>{
 reset([]);const follow={...channel,channelId:'UCabcdefghijklmnopqrstuv',lastProviderFailure:{kind:'unavailable',at:1,message:'Archive issue',recovery:''}};useLibrary.setState({follows:[follow]});
 fixture.responseForRequest=()=>{throw Error('network offline');};await useLibrary.getState().refreshFollows('youtube');
 const next=useLibrary.getState().follows[0];assert.equal(next.catalogCursor,'before');assert.equal(next.lastProviderFailure.message,'Archive issue');assert(next.recentPull.retryAt>Date.now());assert.equal(next.recentPull.failures,1);
});

test('late live response cannot erase newer recent health or archive checkpoint',async()=>{
 reset([]);const old={...channel,channelId:'UCabcdefghijklmnopqrstuv',recentPull:{attemptedAt:1,checkedAt:1,failures:0}},recentPull={attemptedAt:100,checkedAt:100,failures:0,newestVideoId:'latest'};
 useLibrary.setState({follows:[old]});fixture.beforeResponse=()=>useLibrary.setState({follows:[{...old,recentPull,catalogCursor:'newer-archive'}]});
 fixture.response={channels:[{...old,live:false,liveCheckedAt:Date.now()}],videos:[],refreshedIds:[old.id],liveCheckedIds:[old.id],retryAt:{}};
 await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true});
 const next=useLibrary.getState().follows[0];assert.equal(next.recentPull,recentPull);assert.equal(next.catalogCursor,'newer-archive');
});
test('unfollowing during a recent response cannot resurrect the creator or its videos',async()=>{
 reset([]);const follow={...channel,channelId:'UCabcdefghijklmnopqrstuv'};useLibrary.setState({follows:[follow]});fixture.beforeResponse=()=>useLibrary.setState({follows:[]});
 fixture.response={channels:[follow],videos:[card('unfollow-late')],refreshedIds:[follow.id],retryAt:{}};
 await useLibrary.getState().refreshFollows('youtube');assert.equal(useLibrary.getState().follows.length,0);assert.equal(useLibrary.getState().videos.length,0);
});

test('empty clip-only updates preserve 80k video and metadata references and avoid catalog writes',async()=>{
 await flush();const videos=Array.from({length:80000},(_,i)=>card('clip-empty-old'+i));reset(videos);
 const follow={id:'tw:empty-clips',kind:'twitch',handle:'empty-clips',title:'Empty clips',twitchClipCursor:JSON.stringify({v:1,after:'safe'}),twitchArchiveCursor:'keep-vods'},tags={saved:['personal']},metadataProvenance={};
 useLibrary.setState({follows:[follow],tags,metadataProvenance});fixture.response={channel:{...follow,twitchClipRecentCheckedAt:Date.now(),lastResponseCount:0},videos:[]};
 await useLibrary.getState().followRemoteQuery('empty-clips','twitch',{twitchClipMode:'recent'});await flush();
 const state=useLibrary.getState();assert.equal(state.videos,videos);assert.equal(state.tags,tags);assert.equal(state.metadataProvenance,metadataProvenance);assert.equal(fixture.writes.length,0);assert.equal(state.remoteBusy,false);assert(state.follows[0].twitchClipRecentAttemptedAt);assert.equal(state.follows[0].twitchClipCursor,follow.twitchClipCursor);
});
test('clip-only partial errors persist safe positions and leave the other clip retry lane intact',async()=>{
 reset([]);const follow={id:'tw:partial-clips',kind:'twitch',handle:'partial-clips',title:'Partial clips',twitchClipCursor:JSON.stringify({v:1,after:'old'}),twitchClipRecentRetry:{attempts:1,retryAt:Date.now()+60000}};
 useLibrary.setState({follows:[follow]});fixture.response={channel:{id:follow.id,kind:'twitch',handle:follow.handle,title:follow.title,twitchClipCursor:JSON.stringify({v:1,after:'safe'}),lastClipFailure:{kind:'network-offline',at:Date.now(),message:'Page failed',recovery:''},lastResponseCount:1},videos:[{...card('tw:c:partial','twitch',follow.id),extension:'clip'}]};
 await useLibrary.getState().followRemoteQuery('partial-clips','twitch',{twitchClipMode:'archive'});
 const c=useLibrary.getState().follows[0];assert(c.twitchClipRetry);assert.equal(c.twitchClipRecentRetry,follow.twitchClipRecentRetry);assert.equal(JSON.parse(c.twitchClipCursor).after,'safe');assert(c.twitchClipArchiveAttemptedAt);assert.equal(useLibrary.getState().videos.length,1);
});

test('Twitch live completion pipeline publishes healthy viewer counts while the first 12 creators are stalled',async()=>{
 reset([]);const now=Date.now(),follows=Array.from({length:48},(_,i)=>({id:'tw:early'+i,kind:'twitch',handle:'early'+i,title:'Early '+i,live:true,liveCheckedAt:1}));
 const videos=follows.map(c=>({...card(c.id+':live','twitch',c.id),name:c.title,extension:'live',remote:{kind:'twitch',channelId:c.handle,channelName:c.title,live:true,viewers:15,observedAt:1}}));useLibrary.setState({follows,videos});
 let release,active=0,peak=0,seen;const held=new Promise(r=>release=r),published=new Promise(r=>seen=r);
 fixture.responseForRequest=async data=>{peak=Math.max(peak,++active);try{if(data.channels[0].id==='tw:early0')await held;return{channels:data.channels.map(c=>({...c,liveCheckedAt:now,lastLiveFailure:undefined})),videos:data.channels.map(c=>{const old=videos.find(v=>v.folderId===c.id);return{...old,remote:{...old.remote,viewers:888,observedAt:now}};}),refreshedIds:data.channels.map(c=>c.id),liveCheckedIds:data.channels.map(c=>c.id),retryAt:{}};}finally{active--;}};
 const stop=useLibrary.subscribe(s=>{if(s.videos.find(v=>v.folderId==='tw:early12')?.remote.viewers===888)seen();});
 const job=useLibrary.getState().refreshFollows('twitch',{twitchLiveOnly:true,channelIds:follows.map(c=>c.id)});
 try{await Promise.race([published,new Promise((_,reject)=>setTimeout(()=>reject(Error('Healthy Twitch viewer counts waited for stalled first chunk')),5000))]);assert.equal(useLibrary.getState().follows.find(c=>c.id==='tw:early0').liveCheckedAt,1);assert.equal(peak,2);}
 finally{release();stop();await job;}
 assert.equal(fixture.requests,4);assert(fixture.inputs.every(d=>d.channels.length<=12&&d.twitchLiveOnly));assert.equal(useLibrary.getState().twitchLiveProgress.checked,48);assert.equal(useLibrary.getState().twitchLiveProgress.broadcasts,48);assert(useLibrary.getState().videos.every(v=>v.remote.viewers===888));
});


test('legacy live cards outside a watch-only proof stay live and join the follow ledger before the next bounded check',async()=>{
 reset([]);const now=Date.now(),source={id:'yt:UC0000000000000000000000',channelId:'UC0000000000000000000000',kind:'youtube',handle:'legacy',title:'Legacy',live:true,liveCheckedAt:now-60000,youtubeLiveVideoIds:['video000001']};
 const rows=['video000001','video000002'].map((id,i)=>({...card('yt:v:'+id,'youtube','yt:other-folder'),remote:{kind:'youtube',videoId:id,channelId:source.channelId,live:true,observedAt:now-60000}}));useLibrary.setState({videos:rows,follows:[source]});
 fixture.responseForRequest=data=>({channels:data.channels.map(c=>({...c,live:false,liveCheckedAt:Date.now(),youtubeLiveVideoIds:[],lastLiveFailure:undefined,youtubeLiveEvidence:{at:Date.now(),state:'absent',source:'watch',complete:true,reason:'known-broadcasts'}})),videos:[],refreshedIds:[source.id],liveCheckedIds:[source.id],retryAt:{}});
 await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true});let state=useLibrary.getState();assert(state.follows[0].live);assert.equal(state.follows[0].youtubeLiveEvidence.state,'unknown');assert.equal(state.follows[0].liveOfflineSince,undefined);assert.deepEqual(new Set(state.follows[0].youtubeLiveVideoIds),new Set(['video000001','video000002']));assert(state.videos.every(v=>v.remote.live&&!v.remote.liveOfflineSince));
 useLibrary.setState({follows:state.follows.map(c=>({...c,lastLiveFailure:{...c.lastLiveFailure,retryAt:Date.now()-1}}))});
 await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true});state=useLibrary.getState();assert.equal(fixture.inputs.at(-1).channels[0].youtubeLiveVideoIds.length,2);assert(state.follows[0].liveOfflineSince);assert(state.videos.every(v=>v.remote.live&&v.remote.liveOfflineSince));
});


test('YouTube throughput records only distinct successful observations and never persists a second catalog or telemetry on follows',async()=>{
 reset([]);const realNow=Date.now;let now=1000000;Date.now=()=>now;
 try{const follows=Array.from({length:24},(_,i)=>({id:'yt:UC'+String(i).padStart(22,'0'),channelId:'UC'+String(i).padStart(22,'0'),kind:'youtube',handle:'telemetry'+i,title:'Telemetry '+i,live:false,liveCheckedAt:1}));useLibrary.setState({follows});
 fixture.responseForRequest=data=>{now+=1500;const good=data.channels.filter(c=>Number(c.handle.slice(9))<16),ok=new Set(good.map(c=>c.id));return {channels:data.channels.map(c=>ok.has(c.id)?{...c,liveCheckedAt:now,lastLiveFailure:undefined}:{...c,lastLiveFailure:{at:now,retryAt:now+30000,kind:'unavailable',message:'Fixture failed',recovery:''}}),videos:[],refreshedIds:good.map(c=>c.id),liveCheckedIds:good.map(c=>c.id),retryAt:{}};};
 const original=useLibrary.getState().videos;await useLibrary.getState().refreshFollows('youtube',{youtubeLiveOnly:true,liveSweep:true});const state=useLibrary.getState(),sample=state.youtubeLiveProgress.throughput.samples.at(-1);assert.equal(sample.attempted,24);assert.equal(sample.successful,16);assert.equal(state.youtubeLiveProgress.refreshed,16);assert.equal(state.youtubeLiveProgress.failed,8);assert(state.youtubeLiveProgress.throughput.samples.length<=33);assert.equal(state.videos,original);assert.equal(fixture.writes.length,0);assert(state.follows.every(c=>!('throughput' in c)));
 }finally{Date.now=realNow;}
});


test('clip freshness warm retries advance attempts without rewriting cached cards; fresh actions respect waits',async()=>{
 reset([]);const realNow=Date.now;let now=3000;Date.now=()=>now;
 try{
  const c={id:'tw:fresh_store',kind:'twitch',handle:'fresh_store',title:'Fresh creator',twitchClipRecentCheckedAt:1000,twitchClipRecentAttemptedAt:1000};
  const v={...card('tw:c:fresh','twitch',c.id),extension:'clip',detailsOnDisk:true,addedAt:100,duration:30,remote:{kind:'twitch',videoId:'fresh',views:50,observedAt:1000}};
  const videos=[v];useLibrary.setState({follows:[c],videos});
  fixture.response={channel:{...c,twitchClipDiagnostics:{at:1000,servedAt:3000,cacheHit:true,mode:'recent',pages:1,received:1,accepted:1,duplicates:0,windows:[]}},videos:[v]};
  await useLibrary.getState().followRemoteQuery(c.handle,'twitch',{twitchClipMode:'recent',clipLimit:50});await flush();let s=useLibrary.getState();assert.equal(s.follows[0].twitchClipRecentAttemptedAt,3000);assert.equal(s.follows[0].twitchClipRecentCheckedAt,1000);assert.equal(s.videos,videos);assert.equal(fixture.writes.length,0);
  const retry={attempts:1,retryAt:9000};useLibrary.setState({follows:[{...s.follows[0],twitchClipRecentRetry:retry}]});const reads=fixture.requests;
  await assert.rejects(useLibrary.getState().followRemoteQuery(c.handle,'twitch',{twitchClipMode:'recent',freshTwitchClips:true}),/retry available/);assert.equal(fixture.requests,reads);assert.equal(useLibrary.getState().follows[0].twitchClipRecentRetry,retry);
  now=10000;fixture.response={channel:{...c,twitchClipRecentCheckedAt:10000,twitchClipDiagnostics:{at:10000,cacheHit:false,mode:'recent',pages:1,received:1,accepted:1,duplicates:0,windows:[]}},videos:[{...v,remote:{...v.remote,observedAt:10000,views:60}}]};
  await useLibrary.getState().followRemoteQuery(c.handle,'twitch',{twitchClipMode:'recent',freshTwitchClips:true});await flush();s=useLibrary.getState();assert.equal(fixture.inputs.at(-1).freshTwitchClips,true);assert.equal(s.follows[0].twitchClipRecentCheckedAt,10000);assert.equal(s.follows[0].twitchClipRecentRetry,undefined);assert.equal(s.videos[0].remote.views,60);assert.equal(fixture.writes.at(-1).remote.views,60);
 }finally{Date.now=realNow;}
});
test('a held older clip response cannot rewind newer cards or clear a newer scoped retry at the real store boundary',async()=>{
 reset([]);const realNow=Date.now;let now=3000;Date.now=()=>now;
 try{
  const c={id:'tw:held_clip',kind:'twitch',handle:'held_clip',title:'Held creator',twitchClipRecentCheckedAt:1000,twitchClipRecentAttemptedAt:1000};
  const v={...card('tw:c:held','twitch',c.id),extension:'clip',detailsOnDisk:true,name:'Newest title',addedAt:200,duration:30,poster:'new.jpg',remote:{kind:'twitch',videoId:'held',views:500,observedAt:4000}};
  const latest={...c,twitchClipRecentAttemptedAt:4500,twitchClipRecentCheckedAt:4000,twitchClipRecentRetry:{attempts:2,retryAt:9000},lastClipFailure:{at:4500,kind:'network-offline',message:'Newer failure',recovery:'Wait'}};
  useLibrary.setState({follows:[c],videos:[v],favorites:{[v.id]:true},history:[{id:v.id,at:1,source:'open'}]});const videos=useLibrary.getState().videos;
  fixture.beforeResponse=()=>{now=5000;useLibrary.setState({follows:[latest]});};
  fixture.response={channel:{...c,twitchClipDiagnostics:{at:1000,cacheHit:true,mode:'recent',pages:1,received:1,accepted:1,duplicates:0,windows:[]}},videos:[{...v,name:'Old title',addedAt:1,poster:'old.jpg',remote:{...v.remote,views:1,observedAt:1000}}]};
  await useLibrary.getState().followRemoteQuery(c.handle,'twitch',{twitchClipMode:'recent'});await flush();const s=useLibrary.getState();assert.equal(s.videos,videos);assert.equal(s.videos[0],v);assert.equal(s.follows[0].twitchClipRecentRetry,latest.twitchClipRecentRetry);assert.equal(s.follows[0].twitchClipRecentCheckedAt,4000);assert.equal(s.follows[0].twitchClipRecentAttemptedAt,4500);assert.equal(s.follows[0].lastClipFailure,latest.lastClipFailure);assert.equal(fixture.writes.length,0);assert.equal(s.favorites[v.id],true);assert.equal(s.history[0].id,v.id);
 }finally{Date.now=realNow;}
});


test('Twitch type provenance upgrades exact legacy videos and persists through sparse pulls without losing personal signals',async()=>{
 reset([]);const {twitchContentEvidence,twitchContentKind}=await import('../src/lib/videos/twitch-content.ts');
 const c={id:'tw:typed_store',kind:'twitch',handle:'typed_store',title:'Typed creator'};
 const old={...card('tw:v:typed','twitch',c.id),extension:'vod',detailsOnDisk:true,duration:10,remote:{kind:'twitch',videoId:'typed'}};
 const favorites={[old.id]:true},likes={[old.id]:true},history=[{id:old.id,at:1,source:'open'}],tags={[old.id]:['my-tag']},metadataProvenance={[old.id]:{tags:{'my-tag':'manual'},lockedFields:['tags'],updatedAt:1}};
 useLibrary.setState({follows:[c],videos:[old],favorites,likes,history,tags,metadataProvenance});
 const typed={...old,remote:{...old.remote,observedAt:2000,twitchContent:twitchContentEvidence('HIGHLIGHT','typed',2000)}};fixture.response={channel:c,videos:[typed]};
 await useLibrary.getState().followRemoteQuery(c.handle,'twitch',{clipLimit:0});await flush();assert.equal(twitchContentKind(useLibrary.getState().videos[0]),'highlight');assert.equal(fixture.writes.at(-1).remote.twitchContent.source,'HIGHLIGHT');
 fixture.response={channel:c,videos:[{...old,remote:{...old.remote,observedAt:3000}}]};await useLibrary.getState().followRemoteQuery(c.handle,'twitch',{clipLimit:0});await flush();
 const s=useLibrary.getState();assert.equal(twitchContentKind(s.videos[0]),'highlight');assert.equal(fixture.writes.at(-1).remote.twitchContent.videoId,'typed');assert.equal(s.favorites,favorites);assert.equal(s.likes,likes);assert.equal(s.history,history);assert.deepEqual(s.tags[old.id],['my-tag']);assert.equal(s.metadataProvenance[old.id],metadataProvenance[old.id]);
});


test('Twitch automatic policies persist only effective edits, skip content without deleting history, and cannot suppress explicit or live actions',async()=>{
 reset([]);const policy=(clips=true,vods=true,priority='normal')=>({version:1,clips,vods,priority});
 const a={id:'tw:policy_a',kind:'twitch',handle:'policy_a',title:'Policy A',channelId:'a'},b={id:'tw:policy_b',kind:'twitch',handle:'policy_b',title:'Policy B',channelId:'b'};
 const old={...card('tw:v:policy_saved','twitch',a.id),extension:'vod'},favorites={[old.id]:true},history=[{id:old.id,at:1}];useLibrary.setState({follows:[a,b],videos:[old],favorites,history});
 const store=useLibrary.getState();store.setTwitchPullPolicy(a.id,policy(false,false,'low'));assert.equal(fixture.followsWrites.length,1);const snapshot=useLibrary.getState().follows;
 store.setTwitchPullPolicy(a.id,policy(false,false,'low'));assert.equal(useLibrary.getState().follows,snapshot);assert.equal(fixture.followsWrites.length,1);assert.deepEqual(fixture.followsWrites[0][0].twitchPullPolicy,policy(false,false,'low'));
 fixture.responseForRequest=data=>({channels:data.channels.map(c=>({...c,recentPull:{attemptedAt:Date.now(),checkedAt:Date.now(),failures:0}})),videos:[],refreshedIds:data.channels.map(c=>c.id),retryAt:{}});
 await store.refreshFollows('twitch',{scheduled:true,twitchRoutine:true});assert(fixture.inputs.every(i=>i.twitchApplyPolicy===true));assert.deepEqual(fixture.inputs.flatMap(i=>i.channels.map(c=>c.id)),[b.id]);assert.equal(useLibrary.getState().videos[0],old);assert.equal(useLibrary.getState().favorites,favorites);assert.equal(useLibrary.getState().history,history);assert.equal(useLibrary.getState().follows.find(c=>c.id===a.id).recentPull,undefined);
 fixture.inputs=[];await store.refreshFollows('twitch',{twitchLiveOnly:true,liveSweep:true});assert(fixture.inputs.flatMap(i=>i.channels).some(c=>c.id===a.id));assert(fixture.inputs.every(i=>!i.twitchApplyPolicy));
 fixture.inputs=[];await store.refreshFollows('twitch',{channelIds:[a.id],twitchRoutine:true});assert.deepEqual(fixture.inputs.flatMap(i=>i.channels.map(c=>c.id)),[a.id]);assert(fixture.inputs.every(i=>i.twitchApplyPolicy===false));
 fixture.beforeResponse=()=>store.setTwitchPullPolicy(a.id,policy(false,true,'high'));await store.refreshFollows('twitch',{channelIds:[a.id],twitchRoutine:true});assert.deepEqual(useLibrary.getState().follows.find(c=>c.id===a.id).twitchPullPolicy,policy(false,true,'high'));
 fixture.beforeResponse=null;fixture.response={channel:{...a,twitchPullPolicy:policy()},videos:[]};fixture.responseForRequest=null;await store.followRemoteQuery(a.handle,'twitch',{clipLimit:0});assert.deepEqual(useLibrary.getState().follows.find(c=>c.id===a.id).twitchPullPolicy,policy(false,true,'high'));
});


test('YouTube publication repairs require matching identity and preserve precision, personal signals and locks on disk',async()=>{
 reset([]);const id='pubdate0001',old={...card('yt:'+id,'youtube','yt:publication'),addedAt:0,name:'Publication fixture',remote:{kind:'youtube',videoId:id,publishedSource:'unknown',publishedPrecision:'relative',publishedLabel:'2 days ago',publishedLabelAt:1000,watchUrl:'https://www.youtube.com/watch?v='+id}},tags={[old.id]:['my-manual-tag']},metadataProvenance={[old.id]:{tags:{'my-manual-tag':'manual'},lockedFields:['tags','category']}},favorites={[old.id]:true},history=[{id:old.id,at:1}];
 useLibrary.setState({videos:[old],tags,metadataProvenance,favorites,history});const store=useLibrary.getState();
 await assert.rejects(store.setYoutubePublication(old.id,'2026-10-01','another0001'),/does not match/);await assert.rejects(store.setYoutubePublication(old.id,'2026-02-30',id),/does not match/);assert.equal(fixture.writes.length,0);
 assert.equal(await store.setYoutubePublication(old.id,'2026-10-01',id),true);let current=useLibrary.getState().videos[0];assert.equal(current.addedAt,Date.parse('2026-10-01'));assert.equal(current.remote.publishedPrecision,'day');assert.equal(current.remote.publishedLabel,undefined);assert.equal(fixture.writes.at(-1).remote.publishedPrecision,'day');
 assert.equal(await store.setYoutubePublication(old.id,'2026-10-01T13:14:15Z',id),true);const written=fixture.writes.length;assert.equal(await store.setYoutubePublication(old.id,'2026-10-02',id),false);assert.equal(fixture.writes.length,written);assert.equal(useLibrary.getState().videos[0].addedAt,Date.parse('2026-10-01T13:14:15Z'));
 await store.setYoutubeMetadata(old.id,{id,date:'2026-10-02',keywords:['provider-tag']});current=useLibrary.getState().videos[0];assert.equal(current.remote.publishedPrecision,'instant');assert.equal(current.addedAt,Date.parse('2026-10-01T13:14:15Z'));assert.deepEqual(useLibrary.getState().tags[old.id],['my-manual-tag']);assert.deepEqual(useLibrary.getState().metadataProvenance[old.id].lockedFields,['tags','category']);assert.equal(useLibrary.getState().favorites,favorites);assert.equal(useLibrary.getState().history,history);
 const n=fixture.writes.length;useLibrary.setState({videos:[{...current,remote:{...current.remote,youtubeType:'upcoming'}}]});await assert.rejects(store.setYoutubePublication(old.id,'2026-10-25',id),/after this stream/);assert.equal(fixture.writes.length,n);
});
