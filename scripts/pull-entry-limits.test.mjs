import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { registerHooks } from 'node:module';

// Exercise the real store actions with deterministic provider and disk boundaries.
const fixture = { writes: [], requests: 0, response: null, beforeResponse: null, inputs: [], responseForRequest: null };
globalThis.__entryLimitFixture = fixture;
const persistence = readFileSync(new URL('../src/lib/videos/persist.ts', import.meta.url), 'utf8');
const names = [...persistence.matchAll(/export (?:async )?function (\w+)/g)].map(match => match[1]);
const mockPersist = names.map(name => {
  if (name === 'loadPrefs') return 'export function loadPrefs() { return null; }';
  if (name === 'loadFollows') return 'export function loadFollows() { return []; }';
  if (name === 'saveRemoteSnapshot') return 'export async function saveRemoteSnapshot(value) { globalThis.__entryLimitFixture.writes.push(...value.videos); }';
  if (name === 'appendCatalogVideos') return 'export async function appendCatalogVideos(rows) { globalThis.__entryLimitFixture.writes.push(...rows); }';
  return `export async function ${name}() { return []; }`;
}).join('\n') + '\nexport const PHOTO_META_LS_KEY = "test-photos";';
const mockRemote = ['followRemote', 'importChannels', 'refreshRemotes', 'searchAdultVideos'].map(name => `export async function ${name}(...args) {
  const fixture = globalThis.__entryLimitFixture; fixture.requests++;
  fixture.inputs.push(args[0]?.data); fixture.beforeResponse?.();
  return structuredClone(fixture.responseForRequest ? fixture.responseForRequest(args[0]?.data) : fixture.response);
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
  fixture.writes = []; fixture.requests = 0; fixture.beforeResponse = null; fixture.inputs = []; fixture.responseForRequest = null;
  updatePullSettings({ ...DEFAULT_PULL_SETTINGS, youtubeMaxEntries: 2 });
  useLibrary.setState({ videos, tags: {}, metadataProvenance: {}, folders: [], follows: [channel], remoteBusy: false, refreshing: false, remoteRefreshStatus: null, youtubeRefreshStatus: null, activeId: null, previewId: null, favorites: {}, likes: {}, history: [] });
}
const flush = () => new Promise(resolve => setTimeout(resolve, 80));

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
