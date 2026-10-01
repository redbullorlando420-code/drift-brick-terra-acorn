import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
registerHooks({ resolve(specifier, context, next) {
  if (specifier.endsWith('media-feedback')) return { shortCircuit: true, url: 'data:text/javascript,export function ratingPreference(r){return r===1?-3:r>=3?Math.min(3,r-2):0}' };
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context);
    throw error;
  }
} });
const { buildAdultBrowseModel } = await import('../src/lib/videos/adult-browse-model.ts');
const signals = { favorites: {}, likes: {}, cameCounts: {}, viewCounts: {}, ratings: {}, heartedTags: [], historicTags: [], continueIds: [], favoriteIds: [] };
const make = (id, photo) => ({ id, folderId: photo ? 'booru' : 'eporner', name: id, path: '', size: 0, addedAt: 0, extension: photo ? 'jpg' : 'mp4', mime: photo ? 'image/jpeg' : 'video/mp4', poster: 'available', remote: { kind: photo ? 'booru' : 'eporner', channelName: id } });
test('small photo catalogs retain recommendations across filters and rotations', () => {
  const videos = [...Array.from({length:1000},(_,i)=>make(`video-${i}`,false)), ...Array.from({length:4},(_,i)=>make(`photo-${i}`,true))];
  const tags = Object.fromEntries(videos.map(v => [v.id, ['genre-solo']]));
  for (const source of ['all', 'booru']) for (const seed of [1, 9, 123]) {
    const result = buildAdultBrowseModel({ videos, personalVideos: [], deepVideos: [], tags, signals }, {source, tag:'genre-solo', view:'photos', limit:24, seed});
    assert.ok(result.shelves.recommended.length > 0);
    assert.ok(result.shelves.recommended.every(id => id.startsWith('photo-')));
  }
});
test('a single matching photo still has a recommendation shelf', () => {
  const photo=make('only-photo',true);
  const result=buildAdultBrowseModel({videos:[photo],personalVideos:[],deepVideos:[],tags:{},signals},{source:'all',tag:'All',view:'photos',limit:24,seed:4});
  assert.deepEqual(result.shelves.recommended,['only-photo']);
});
