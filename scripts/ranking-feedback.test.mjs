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
  if (specifier === './videos/persist' && context.parentURL?.endsWith('/media-feedback.ts')) return { url: 'data:text/javascript,' + encodeURIComponent('export async function restoreDurableFeedback(){return null;} export function saveDurableFeedback(value){globalThis.__rankingFeedbackWrites.push(structuredClone(value)); return globalThis.__rankingFeedbackSaveResult;}'), shortCircuit: true };
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

test('scoped rejections round-trip through exported feedback; old packs preserve choices and an empty backup restores Undo', async () => {
  const original=structuredClone(feedback.exportFeedback());
  const entry={scope:'title',target:'youtube:private-test-id',label:'Private fixture',at:Date.now()};
  feedback.setRecommendationRejection(entry);
  const backup=structuredClone(feedback.exportFeedback());assert.equal(backup.version,5);assert.equal(backup.recommendationRejections.entries.length,1);
  feedback.importFeedback({ratings:{unrelated:4}});assert.equal(feedback.getRecommendationRejections().entries.length,1);
  feedback.setRecommendationRejection(entry,true);assert.equal(feedback.getRecommendationRejections().entries.length,0);
  feedback.importFeedback(backup);assert.deepEqual(feedback.getRecommendationRejections().entries,backup.recommendationRejections.entries);
  assert.deepEqual((await feedback.rankingFeedbackSnapshot()).recommendationRejections.entries,backup.recommendationRejections.entries);
  feedback.importFeedback({...original,recommendationRejections:{version:1,updatedAt:0,entries:[]}});
  assert.deepEqual(feedback.getRecommendationRejections().entries,[]);assert.deepEqual(writes.at(-1).recommendationRejections.entries,[]);
});
test('feedback save failure remains visible and retry saves current choices without changing rank inputs', async () => {
  globalThis.__rankingFeedbackSaveResult=false;
  feedback.setRecommendationRejection({scope:'topic',target:'technology',label:'Technology',at:Date.now()});
  window.dispatchEvent(new Event('pagehide'));await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(feedback.getFeedbackSaveState(),'failed');const before=structuredClone(feedback.getRecommendationRejections());
  globalThis.__rankingFeedbackSaveResult=true;feedback.retryFeedbackSave();await new Promise(resolve=>setTimeout(resolve,0));
  assert.equal(feedback.getFeedbackSaveState(),'saved');assert.deepEqual(feedback.getRecommendationRejections(),before);
});
test('topic hearts normalize aliases for protection without changing legacy raw tag heart semantics',()=>{
  feedback.toggleTagLike('tech');assert.equal(feedback.recommendationTopicIsLiked('technology'),true);
  assert.equal(feedback.tagIsLiked('tech'),true);feedback.toggleTagLike('tech');
  // Technology was hearted in an earlier independent snapshot check.
  assert.equal(feedback.recommendationTopicIsLiked('technology'),feedback.tagIsLiked('technology'));
});

test('unsupported or malformed rejection imports cannot clear the current choices',()=>{
 const before=structuredClone(feedback.getRecommendationRejections());
 for(const invalid of [{version:2,updatedAt:Date.now(),entries:[]},{version:1,updatedAt:NaN,entries:[]},{version:1,updatedAt:1,entries:'invalid'}]) {
  feedback.importFeedback({recommendationRejections:invalid});assert.deepEqual(feedback.getRecommendationRejections(),before);
 }
});
