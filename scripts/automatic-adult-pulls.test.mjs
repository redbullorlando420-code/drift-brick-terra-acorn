import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { createPeriodicScheduler } from '../src/lib/periodic-scheduler.ts';

const fixture = { now: 1_000_000, phase: 'active', paused: false, countFailure: true, countGate: null,
  countCalls: 0, pulls: [], cleanup: null, controls: new Set(), settings: new Set() };
const timers = new Map(); let serial = 0;
fixture.scheduler = createPeriodicScheduler({ now: () => fixture.now, phase: () => fixture.phase, inputDelay: () => 0,
  setTimer: (work, delay) => { const id = ++serial; timers.set(id, { work, at: fixture.now + delay }); return id; }, clearTimer: id => timers.delete(id) });
fixture.policy = { automaticPulls: true, adultIntervalSeconds: 0, adultCatalogTarget: 100_000, adultMaxEntries: 100_000, remoteMaxEntries: 100_000, adultBatchVideos: 500 };
fixture.state = { hydrated: true, sourceId: 'adults', adultsUnlocked: true, remoteBusy: false, refreshing: false, folders: [], videos: [],
  searchAdultFeed: async (...args) => { fixture.pulls.push(args); } };
globalThis.__automaticAdultPullFixture = fixture;
const moduleUrl = source => `data:text/javascript,${encodeURIComponent('const f = globalThis.__automaticAdultPullFixture;\n' + source)}`;
const mocks = {
  react: 'export function useEffect(fn) { f.cleanup = fn(); }',
  '@/lib/videos/store': 'export const useLibrary = selector => selector(f.state); useLibrary.getState = () => f.state;',
  '@/lib/pull-settings': 'export const getPullSettings = () => f.policy; export const subscribePullSettings = fn => { f.settings.add(fn); return () => f.settings.delete(fn); };',
  '@/lib/pull-control': 'export const catalogPullAvailable = () => !f.paused; export const subscribePullAvailability = fn => { f.controls.add(fn); return () => f.controls.delete(fn); };',
  '@/lib/session-activity': 'export const allowAutomaticRefresh = () => f.phase === "active";',
  '@/lib/periodic-work': 'export const registerPeriodicTask = task => f.scheduler.register(task);',
  '@/lib/videos/entry-limits': 'export async function remoteEntryCounts() { f.countCalls++; if (f.countFailure) { f.countFailure = false; throw new Error("count unavailable"); } if (f.countGate) await f.countGate; return {}; } export const remainingEntrySlots = () => 500;',
};
registerHooks({ resolve(specifier, context, next) {
  if (specifier in mocks) return { url: moduleUrl(mocks[specifier]), shortCircuit: true };
  if (specifier.startsWith('@/')) return next(new URL(`../src/${specifier.slice(2)}.ts`, import.meta.url).href, context);
  try { return next(specifier, context); }
  catch (error) { if (specifier.startsWith('.') && !/\.[a-z]+$/i.test(specifier)) return next(`${specifier}.ts`, context); throw error; }
} });

const drain = async () => { for (let i = 0; i < 10; i++) await Promise.resolve(); };
async function advance(ms) {
  fixture.now += ms;
  for (let turns = 0; turns < 100; turns++) {
    const due = [...timers].find(([, timer]) => timer.at <= fixture.now);
    if (!due) break;
    timers.delete(due[0]); due[1].work(); await drain();
  }
}

test('actual Adult automatic owner recovers a failed count, holds idle/pause gates and releases its schedule', async () => {
  const savedNow = Date.now;
  const savedNavigator = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  Date.now = () => fixture.now;
  Object.defineProperty(globalThis, 'navigator', { configurable: true, value: { onLine: true } });
  try {
    const { useAdultPulls } = await import('../src/components/library/use-adult-pulls.ts');
    useAdultPulls(); await advance(8_000);
    assert.equal(fixture.countCalls, 1); assert.equal(fixture.pulls.length, 0);
    await advance(15_000);
    assert.equal(fixture.pulls.length, 1, 'a rejected entry count must release busy and retry');
    assert.equal(fixture.pulls[0][2].maxVideos, 500);
    assert.equal(fixture.pulls[0][2].providers.length, 2, 'real fair-provider planner remains in use');
    fixture.paused = true; fixture.controls.forEach(wake => wake());
    assert.equal(timers.size, 0); await advance(1_000_000); assert.equal(fixture.pulls.length, 1);
    fixture.paused = false; fixture.controls.forEach(wake => wake()); await advance(0);
    assert.equal(fixture.pulls.length, 2, 'resume schedules one current turn, not a backlog');
    let releaseCount;
    fixture.countGate = new Promise(resolve => { releaseCount = resolve; });
    await advance(15_000); fixture.phase = 'idle'; fixture.scheduler.wake();
    releaseCount(); await drain(); fixture.countGate = null;
    assert.equal(fixture.pulls.length, 2, 'an idle transition during counting prevents a new pull');
    assert.equal(timers.size, 0);
    fixture.phase = 'active'; fixture.scheduler.wake(); await advance(15_000);
    assert.equal(fixture.pulls.length, 3);
    fixture.cleanup(); assert.equal(timers.size, 0); assert.equal(fixture.controls.size, 0); assert.equal(fixture.settings.size, 0);
    assert.equal(fixture.scheduler.snapshot().tasks, 0);
  } finally {
    fixture.cleanup?.(); Date.now = savedNow;
    if (savedNavigator) Object.defineProperty(globalThis, 'navigator', savedNavigator); else Reflect.deleteProperty(globalThis, 'navigator');
    delete globalThis.__automaticAdultPullFixture;
  }
});
