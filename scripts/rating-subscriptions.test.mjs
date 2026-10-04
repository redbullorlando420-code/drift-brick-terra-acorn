import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';

const fixture = { restore: null, saved: [], streaks: [] };
globalThis.__ratingSubscriptionFixture = fixture;
const moduleUrl = source => `data:text/javascript,${encodeURIComponent(source)}`;
registerHooks({ resolve(specifier, context, next) {
  if (context.parentURL?.endsWith('/media-feedback.ts') && specifier === './videos/persist') return { shortCircuit: true, url: moduleUrl(`const f=globalThis.__ratingSubscriptionFixture; export const restoreDurableFeedback=()=>f.restore; export const saveDurableFeedback=data=>f.saved.push(data);`) };
  if (context.parentURL?.endsWith('/media-feedback.ts') && specifier === './rating-streaks') return { shortCircuit: true, url: moduleUrl(`export const recordRatingForStreak=(id,rating)=>globalThis.__ratingSubscriptionFixture.streaks.push({id,rating});`) };
  try { return next(specifier, context); } catch (error) {
    if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(specifier + '.ts', context);
    throw error;
  }
} });
const feedback = await import('../src/lib/media-feedback.ts');

test('real feedback publishes only its rating key; durable hydration refreshes mounted snapshots and keeps newer session edits', async () => {
  const saved = Object.getOwnPropertyDescriptors(globalThis);
  let timer = 0; const timers = new Map(); const events = [];
  Object.defineProperty(globalThis, 'window', { configurable: true, value: {
    setTimeout(fn) { const id = ++timer; timers.set(id, fn); return id; }, clearTimeout(id) { timers.delete(id); },
    dispatchEvent(event) { events.push(event.type); },
  } });
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: { length: 0, getItem: () => null, key: () => null } });
  let finishRestore; fixture.restore = new Promise(resolve => { finishRestore = resolve; });
  const calls = [[], [], []];
  const stops = [feedback.subscribeRating('shared', () => calls[0].push(feedback.getRating('shared'))),
    feedback.subscribeRating('shared', () => calls[1].push(feedback.getRating('shared'))),
    feedback.subscribeRating('other', () => calls[2].push(feedback.getRating('other')))];
  try {
    const hydration = feedback.hydrateDurableFeedback();
    feedback.setRating('shared', 5);
    assert.deepEqual(calls, [[5], [5], []]);
    feedback.toggleCreatorLike('Ada'); feedback.toggleTagLike('science'); feedback.recordWatchTime('shared', 'preview', 3);
    assert.deepEqual(calls, [[5], [5], []], 'other taste changes never broadcast to video cards');
    finishRestore({ ratings: { shared: 1, other: 4 }, ratingHistory: {}, notes: {}, creatorRatings: {}, creatorLikes: {}, creatorFavorites: {}, tagLikes: {}, tagHeartHistory: {}, watchTime: {} });
    await hydration; assert.deepEqual(calls, [[5, 5], [5, 5], [4]]);
    stops[0](); feedback.setRating('shared', 2); assert.deepEqual(calls, [[5, 5], [5, 5, 2], [4]]);
    assert.deepEqual(feedback.getRatingLedger().shared.rating, 2);
    assert.equal(feedback.getFeedbackDiagnostics().pendingWrites, 1);
    assert.equal(events.length, 0, 'aggregate ranking event is deferred');
  } finally {
    stops.forEach(stop => stop());
    for (const key of ['window', 'localStorage']) { if (saved[key]) Object.defineProperty(globalThis, key, saved[key]); else Reflect.deleteProperty(globalThis, key); }
  }
});
