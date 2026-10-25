import test from 'node:test';
import assert from 'node:assert/strict';
import { youtubeCatalogSelection } from './youtube-catalog-selection.ts';
import { prepareYoutubeBrowse, youtubeBrowseVideos } from './youtube-browse.ts';
import { mixYoutubeCreators } from '../remote/youtube-mix.ts';
import type { LibraryVideo } from './types';

const video = (id: number, patch: Partial<LibraryVideo> = {}): LibraryVideo => ({ id: String(id), name: `Upload ${id}`,
  folderId: 'public', path: String(id), size: 0, addedAt: Date.UTC(2026, 9, 1) + id % 9, extension: 'yt', mime: 'video/youtube',
  remote: { kind: 'youtube', channelId: `channel:${id % 50}`, channelName: `Creator ${id % 50}`, publishedSource: 'provider' }, ...patch });

test('cooperative YouTube selection preserves full visibility boundaries and stable date ordering', async () => {
  const videos = Array.from({ length: 5000 }, (_, i) => video(i));
  videos.push(video(5001, { folderId: 'private' }), video(5002, { isSample: true }), video(5003, { remote: { kind: 'twitch' } }));
  const input = { videos, privateFolders: new Set(['private']), unavailable: { '3': true } as Record<string, true>,
    hiddenVideos: { '5': true } as Record<string, true>, hideDemo: true };
  let turns = 0;
  const selected = await youtubeCatalogSelection(input, undefined, async () => { turns++; });
  const expected = videos.filter(v => v.remote?.kind === 'youtube' && !input.unavailable[v.id] && !input.hiddenVideos[v.id]
    && !input.privateFolders.has(v.folderId) && !v.isSample).sort((a, b) => b.addedAt - a.addedAt);
  assert.deepEqual(selected, expected); assert.ok(turns >= 3, 'filtering and ordering both cross task boundaries'); assert.equal(selected.length, 4998);
  assert.equal(videos[0].id, '0', 'input catalog order stays unchanged');
});

test('navigation preparation is cancellable during filtering and sorting', async () => {
  for (const phase of ['filter', 'sort']) {
    let reads = 0, dateReads = 0;
    const videos = Array.from({ length: 32_768 }, (_, i) => { const row = video(i), remote = row.remote; return { ...row,
      get remote() { reads++; return remote; }, get addedAt() { dateReads++; return row.addedAt; } }; });
    const controller = new AbortController();
    await assert.rejects(youtubeCatalogSelection({ videos, privateFolders: new Set(), unavailable: {}, hiddenVideos: {}, hideDemo: false }, controller.signal,
      async () => { if (phase === 'filter' ? reads >= 4096 : dateReads > videos.length * 3 + 256) controller.abort(); }), { name: 'AbortError' });
    assert.ok(phase === 'filter' ? reads < videos.length : dateReads > videos.length * 3, 'cancels during the requested phase');
  }
});

test('prepared browse catalogs and creator indexes preserve fair mixed/latest/trending shelves without a cold rescan', async () => {
  let reads = 0;
  const videos: LibraryVideo[] = Array.from({ length: 5000 }, (_, i) => {
    const v = video(i), remote = v.remote;
    return { ...v, get remote() { reads++; return remote; } };
  });
  videos.push(video(6000, { name: 'Blender demonstration' }), video(6001, { isSample: true }));
  const expected = new Map(['mix', 'latest', 'trending'].map(mode => [mode, mixYoutubeCreators(videos.filter(v => !v.isSample && !v.name.includes('Blender')), 7, 48, mode as 'mix')]));
  let turns = 0;
  const prepared = await prepareYoutubeBrowse(videos, undefined, async () => { turns++; });
  assert.equal(prepared, youtubeBrowseVideos(videos)); assert.equal(prepared.length, 5000); assert.ok(turns >= 4);
  reads = 0;
  for (const mode of ['mix', 'latest', 'trending'] as const) {
    assert.deepEqual(mixYoutubeCreators(prepared, 7, 48, mode).map(v => v.id), expected.get(mode)!.map(v => v.id));
    if (mode !== 'trending') assert.equal(reads, 0, 'mixed/latest shelves reuse the prepared index without reading remote metadata');
  }
  assert.ok(reads < 15_000, `trending comparisons should not rebuild the full index (${reads})`);
  turns = 0; await prepareYoutubeBrowse(videos, undefined, async () => { turns++; }); assert.equal(turns, 0);
});

test('cancelled browse preparation never exposes a partial catalog', async () => {
  const videos = Array.from({ length: 5000 }, (_, i) => video(i)), controller = new AbortController();
  let turns = 0;
  await assert.rejects(prepareYoutubeBrowse(videos, controller.signal, async () => { if (++turns === 2) controller.abort(); }), { name: 'AbortError' });
  assert.equal(youtubeBrowseVideos(videos).length, 5000);
});
