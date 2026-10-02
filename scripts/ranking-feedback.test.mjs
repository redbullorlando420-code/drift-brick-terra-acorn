import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
const saved = new Map([['reelcase.media-feedback.v1', JSON.stringify({ creatorLikes: { legacy: true } })]]);
globalThis.localStorage = { getItem: key => saved.get(key) ?? null, setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key), key: index => [...saved.keys()][index], get length() { return saved.size; } };
globalThis.window = Object.assign(new EventTarget(), { setTimeout, clearTimeout, setInterval, clearInterval });
globalThis.document = Object.assign(new EventTarget(), { visibilityState: 'visible' });
const writes = [];
globalThis.__rankingFeedbackWrites = writes;
registerHooks({ resolve(specifier, context, next) {
  if (specifier === './videos/persist' && context.parentURL?.endsWith('/media-feedback.ts')) return { url: 'data:text/javascript,' + encodeURIComponent('export async function restoreDurableFeedback(){return null;} export function saveDurableFeedback(value){globalThis.__rankingFeedbackWrites.push(structuredClone(value));}'), shortCircuit: true };
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context);
    throw error;
  }
} });
const feedback = await import('../src/lib/media-feedback.ts');
test('legacy creator favorites survive migration, and separate likes and favorites can be toggled independently', async () => {
  assert.equal(feedback.creatorIsFavorited(' Legacy '), true);
  feedback.toggleCreatorLike('legacy');
  assert.equal(feedback.creatorIsLiked('legacy'), false);
  assert.equal(feedback.creatorIsFavorited('legacy'), true);
  feedback.toggleCreatorFavorite('legacy'); assert.equal(feedback.creatorIsFavorited('legacy'), false);
  feedback.toggleCreatorFavorite('New channel'); feedback.toggleCreatorLike('New channel');
  const snapshot = await feedback.rankingFeedbackSnapshot();
  assert.equal(snapshot.creatorFavorites['new channel'], true); assert.equal(snapshot.creatorLikes['new channel'], true);
});
test('concurrent ranking snapshots coalesce, then feedback changes invalidate the cached snapshot', async () => {
  const [a, b] = await Promise.all([feedback.rankingFeedbackSnapshot(), feedback.rankingFeedbackSnapshot()]);
  assert.equal(a, b);
  feedback.toggleTagLike('Technology');
  const changed = await feedback.rankingFeedbackSnapshot();
  assert.notEqual(changed, a); assert.ok(changed.heartedTags.includes('technology'));
  assert.equal(changed, await feedback.rankingFeedbackSnapshot());
});
test('watch-time evidence is bounded and included in worker snapshots without per-tick reranking events', async () => {
  for (let tick = 0; tick < 6; tick++) feedback.recordWatchTime('watched', 'preview', 5);
  assert.equal((await feedback.rankingFeedbackSnapshot()).watchScores.watched, 1);
  feedback.recordWatchTime('watched', 'preview', Infinity);
  assert.equal(feedback.getWatchTime('watched').preview, 30);
  feedback.importFeedback({ creatorFavorites: { imported: true }, watchTime: { old: { preview: 500000, fullscreen: 500000 } } });
  assert.equal((await feedback.rankingFeedbackSnapshot()).watchScores.old, 12);
  assert.equal(feedback.exportFeedback().creatorFavorites.imported, true);
  assert.equal(writes.at(-1).creatorFavorites.imported, true);
});
test('feedback updates during a yielded snapshot never publish stale mixed evidence', async () => {
  feedback.importFeedback({ ratings: Object.fromEntries(Array.from({ length: 1500 }, (_, i) => [`rated-${i}`, 3])) });
  const pending = feedback.rankingFeedbackSnapshot();
  feedback.toggleCreatorFavorite('During copy');
  const result = await pending;
  assert.equal(result.creatorFavorites['during copy'], true);
  assert.equal(result.ratings['rated-1499'], 3);
});
