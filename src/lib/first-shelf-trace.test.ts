import test from 'node:test';
import assert from 'node:assert/strict';
import { createFirstShelfTrace, markHomeReady, markFirstShelf, getFirstShelfTrace } from './first-shelf-trace.ts';

test('startup uses navigation origin and records bounded independent stages and the latest destination', () => {
  let at = 120, notifications = 0;
  const trace = createFirstShelfTrace(() => at);
  const stop = trace.subscribe(() => notifications++);
  at = 180; trace.homeReady(); trace.startPhase('remoteRead');
  at = 230; trace.beginRoute('landing');
  at = 240; trace.beginRoute('youtube');
  at = 310; trace.finishPhase('remoteRead', 100_000); trace.startPhase('remotePrepare');
  at = 400; trace.finishPhase('remotePrepare', 99_999); trace.catalogReady();
  trace.shelfReady(0); assert.equal(trace.get().elapsedMs, undefined);
  at = 480; trace.shelfReady(6);
  assert.equal(trace.get().moduleReadyMs, 120); assert.equal(trace.get().homeReadyMs, 180);
  assert.equal(trace.get().elapsedMs, 480); assert.equal(trace.get().routeElapsedMs, 240);
  assert.equal(trace.get().cards, 6); assert.equal(trace.get().route, 'youtube');
  assert.deepEqual(trace.get().phases.remoteRead, { startedAt: 180, elapsedMs: 130, rows: 100_000 });
  const snapshot = trace.get(), count = notifications;
  trace.homeReady(); trace.catalogReady(); trace.startPhase('remoteRead'); trace.finishPhase('remoteRead', 5); trace.shelfReady(100);
  assert.equal(trace.get(), snapshot); assert.equal(notifications, count);
  at = 485; trace.artworkReady(true); assert.equal(trace.get().artworkWaitMs, 5);
  const artwork = trace.get(); trace.artworkReady(false); assert.equal(trace.get(), artwork);
  const published = notifications;
  stop(); at = 490; trace.startPhase('localRead'); trace.finishPhase('localRead', undefined, true);
  assert.equal(notifications, published); assert.equal(trace.get().phases.localRead?.failed, true);
});

test('server rendering never publishes readiness shared with another visitor', () => {
  const before = getFirstShelfTrace(); markHomeReady(); markFirstShelf('Private title', 5);
  assert.equal(getFirstShelfTrace(), before);
});
