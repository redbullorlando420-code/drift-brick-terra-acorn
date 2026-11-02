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
  '@/lib/videos/adult-archive-cursors': 'export {loadAdultArchiveCursors} from '+JSON.stringify(new URL('../src/lib/videos/adult-archive-cursors.ts',import.meta.url).href)+';export const hydrateAdultArchiveCursors=async()=>{};',
  react: 'export function useEffect(fn) { f.cleanup = fn(); }',
  '@/lib/videos/store': 'export const useLibrary = selector => selector(f.state); useLibrary.getState = () => f.state;',
  '@/lib/pull-settings': 'export const getPullSettings = () => f.policy; export const subscribePullSettings = fn => { f.settings.add(fn); return () => f.settings.delete(fn); };',
  '@/lib/pull-control': 'export const catalogPullAvailable = () => !f.paused; export const subscribePullAvailability = fn => { f.controls.add(fn); return () => f.controls.delete(fn); };',
  '@/lib/session-activity': 'export const allowAutomaticRefresh = () => f.phase === "active";',
  '@/lib/periodic-work': 'export const registerPeriodicTask = task => f.scheduler.register(task);',
  '@/lib/videos/entry-limits': 'export async function remoteEntryCounts() { f.countCalls++; if (f.countFailure) { f.countFailure = false; throw new Error("count unavailable"); } if (f.countGate) await f.countGate; return f.counts ?? { total:0,youtube:0,twitch:0,adult:0,other:0 }; } export const remainingEntrySlots = () => 500;',
  '@/lib/videos/adult-growth': 'export async function adultGrowthCounts(){return f.growth ?? {archivedVideos:0,photos:0,liveRooms:0,unknown:0};} export const adultVideoGoalRemaining=(counts,target)=>Math.max(0,target-counts.archivedVideos);',
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
  const savedStorage=Object.getOwnPropertyDescriptor(globalThis,'localStorage'),cursorValues=new Map();
  Object.defineProperty(globalThis,'localStorage',{configurable:true,value:{getItem:key=>cursorValues.get(key)??null,setItem:(key,value)=>cursorValues.set(key,value),removeItem:key=>cursorValues.delete(key)}});
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
    assert.equal(fixture.pulls[0][1],'latest');
    const {saveAdultArchiveCursors}=await import('../src/lib/videos/adult-archive-cursors.ts');
    saveAdultArchiveCursors('all','latest',{eporner:11,redtube:22});
    fixture.paused = true; fixture.controls.forEach(wake => wake());
    assert.equal(timers.size, 0); await advance(1_000_000); assert.equal(fixture.pulls.length, 1);
    fixture.paused = false; fixture.controls.forEach(wake => wake()); await advance(0);
    assert.equal(fixture.pulls.length, 2, 'resume schedules one current turn, not a backlog');
    assert.equal(fixture.pulls[1][1],'top-weekly');assert.deepEqual(fixture.pulls[1][2].providers,['chaturbate','myfreecams'],'Advancing video lanes makes other providers due first');
    let releaseCount;
    fixture.countGate = new Promise(resolve => { releaseCount = resolve; });
    await advance(15_000); fixture.phase = 'idle'; fixture.scheduler.wake();
    releaseCount(); await drain(); fixture.countGate = null;
    assert.equal(fixture.pulls.length, 2, 'an idle transition during counting prevents a new pull');
    assert.equal(timers.size, 0);
    fixture.phase = 'active'; fixture.scheduler.wake(); await advance(15_000);
    assert.equal(fixture.pulls.length, 3);
    fixture.policy = { ...fixture.policy, adultAutoCleanup:true,adultCatalogTarget:1000,adultMaxEntries:2000,adultCleanupBatch:2,adultCleanupMinAgeDays:30,youtubeAutoCleanup:false,twitchAutoCleanup:false,youtubeMaxEntries:100000,twitchMaxEntries:10000,youtubeCleanupBatch:2,twitchCleanupBatch:2,sharedCapCleanup:true };
    fixture.counts = { total:1000,adult:1000,youtube:0,twitch:0,other:0 };
    fixture.state.folders = [{id:'eporner:discover',kind:'eporner',videoCount:1000}];
    await advance(15_000);assert.equal(fixture.pulls.length,4,'photos and rooms cannot fill the archived-video goal');
    assert.equal(fixture.pulls.at(-1)[2].automatic,true);assert.equal(fixture.pulls.at(-1)[2].maxVideos,500);
    fixture.growth={archivedVideos:1000,photos:0,liveRooms:0,unknown:0};
    await advance(15_000);assert.equal(fixture.pulls.length,4,'the real video goal stops new automatic work');
    fixture.countGate=new Promise(resolve=>{releaseCount=resolve;});await advance(15_000);
    fixture.policy={...fixture.policy,automaticPulls:false};releaseCount();await drain();fixture.countGate=null;
    assert.equal(fixture.pulls.length,4,'disabling automatic pulls during counting stops the pending request');
    fixture.cleanup(); assert.equal(timers.size, 0); assert.equal(fixture.controls.size, 0); assert.equal(fixture.settings.size, 0);
    assert.equal(fixture.scheduler.snapshot().tasks, 0);
  } finally {
    fixture.cleanup?.(); Date.now = savedNow;
    if(savedStorage)Object.defineProperty(globalThis,'localStorage',savedStorage);else delete globalThis.localStorage;
    if (savedNavigator) Object.defineProperty(globalThis, 'navigator', savedNavigator); else Reflect.deleteProperty(globalThis, 'navigator');
    delete globalThis.__automaticAdultPullFixture;
  }
});
