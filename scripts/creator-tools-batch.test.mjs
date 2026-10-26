import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_SIGNAL_PROFILE, generateSignalPack } from '../src/lib/stream-signal.ts';
import { layoutSignalStory, signalStoryCaption, STORY_SIZE } from '../src/lib/stream-signal-card.ts';
import { createLabRun, recordLabEvent, stopLabRecording, createLabPlayback, advanceLabPlayback, stopLabPlayback, exportLabTrace, parseLabTrace, readLabTrace, sampleLabBallots, LAB_EVENT_LIMIT } from '../src/lib/stream-signal-replay.ts';
import { createRacingContract, acceptRacingMessage, dispatchRacingStep, emergencyStopRacing, maintainRacingContract, offlineRacingExample } from '../src/lib/racing-adapter-contract.ts';

const pack = values => generateSignalPack({ ...DEFAULT_SIGNAL_PROFILE, ...values }, 'pack:1792368000000:fixture', 1792368000000);
const measure = (text, size) => Array.from(text).length * size * .6;
test('Story layout keeps default full text in fixed safe regions and every text pairing exceeds 4.5:1', () => {
  const layout = layoutSignalStory(pack(), measure);
  assert.deepEqual(STORY_SIZE, { width: 1080, height: 1920 }); assert.equal(layout.fields.length, 6); assert.deepEqual(layout.warnings, []);
  for (const f of layout.fields) { assert(f.x >= 112); assert(f.y + (f.lines.length - 1) * f.lineHeight < 1780); assert(f.size >= 25); for (const row of f.lines) assert(measure(row, f.size) <= (['title', 'game'].includes(f.key) ? 770 : 850)); }
  for (const row of layout.contrast) assert(row.ratio >= 4.5, row.label);
});
test('long Unicode fits or emits exact field warnings; full caption retains all content and validated destinations', () => {
  const p = pack({ creator: '界'.repeat(60), title: '🚀'.repeat(70), message: '界'.repeat(600) }), before = structuredClone(p), layout = layoutSignalStory(p, measure), caption = signalStoryCaption(p);
  assert(layout.warnings.some(row => row.startsWith('Community message'))); assert.equal(layout.fields.find(f => f.key === 'message').lines.length, 4);
  for (const f of layout.fields) { if (f.shortened) assert(layout.warnings.some(row => row.startsWith(f.label))); for (const row of f.lines) assert(!/[\uD800-\uDBFF]$/.test(row)); }
  for (const value of Object.values(p.profile)) assert(caption.includes(value)); assert.match(caption, /Link sticker|Stickers → Link/); assert.deepEqual(p, before); assert.deepEqual(p.shared, {});
  assert.throws(() => layoutSignalStory({ ...p, profile: { ...p.profile, twitch: 'https://evil.test/channel' } }, measure)); assert.throws(() => signalStoryCaption({ ...p, profile: { ...p.profile, youtube: 'javascript:alert(1)' } }));
});
const event = (run, type, at, more = {}) => recordLabEvent(run, { type, at, ...more });
function recording() {
  let r = event(createLabRun(42, 2), 'start', 0, { seconds: 2 });
  for (const [at, viewer, id, text] of [[1,' A ','a','heal'],[2,'a','b','defend then attack then heal'],[3,'a','c','invalid'],[4,'b','b','attack'],[2000,'late','d','attack']]) r = event(r, 'ballot', at, { viewer, id, text });
  for (let i = 0; i < 3; i++) r = event(r, 'step', 2001 + i);
  return r;
}
test('recording replays normalized ballots, duplicate/invalid/late rejection, whole sequences and fresh resource checks identically', () => {
  const r = recording(), trace = parseLabTrace(exportLabTrace(r.trace)), replay = advanceLabPlayback(createLabPlayback(trace), 512);
  assert.equal(replay.status, 'complete'); assert.deepEqual(replay.state, r.state); assert.deepEqual(advanceLabPlayback(createLabPlayback(trace), 512), replay);
  assert.equal(r.trace.events[1].event.viewer, 'a'); assert.equal(r.state.health, 96); assert.equal(r.state.energy, 5); assert.deepEqual(r.state.queue, []);
  assert(r.state.log.some(line => /Duplicate/.test(line))); assert(r.state.log.some(line => /Late/.test(line)));
});
test('replay detects the first divergent checkpoint, stops verification and exposes expected/actual values', () => {
  const trace = structuredClone(recording().trace); trace.events[2].event.text = 'attack';
  const replay = advanceLabPlayback(createLabPlayback(trace), 512); assert.equal(replay.status, 'diverged'); assert.equal(replay.divergence.index, 3); assert.notEqual(replay.divergence.expected, replay.divergence.actual); assert.equal(advanceLabPlayback(replay), replay);
});
test('malformed and out-of-order replay events are rejected before replacing a recording', () => {
  const r = recording(), before = structuredClone(r);
  for (const value of [{ type:'shell',at:2004 }, { type:'step',at:1 }, { type:'start',at:2004,seconds:121 }, { type:'ballot',at:2004,viewer:'bad name!',id:'x',text:'heal' }, { type:'step',at:2004,token:'secret' }]) assert.throws(() => recordLabEvent(r, value));
  assert.throws(() => parseLabTrace('{')); assert.throws(() => readLabTrace({ ...r.trace, version:2 })); assert.throws(() => parseLabTrace(' '.repeat(1048577))); assert.deepEqual(r, before);
});
test('seeded sample ballots are reproducible and recordings reserve emergency-stop capacity without eviction', () => {
  assert.deepEqual(sampleLabBallots(42,1), sampleLabBallots(42,1)); assert.notDeepEqual(sampleLabBallots(42,1), sampleLabBallots(43,1));
  let r = createLabRun(); for (let i = 0; i < LAB_EVENT_LIMIT - 1; i++) r = event(r, 'step', i);
  assert.throws(() => event(r, 'step', 512), /full/); r = event(r, 'stop', 512); assert.equal(r.trace.events.length, 512); assert.equal(r.trace.events[0].event.at, 0); assert.equal(r.state.status, 'stopped'); assert.equal(advanceLabPlayback(createLabPlayback(r.trace), 512).status, 'complete');
});
test('emergency stop clears votes and pending moves in live recording and partially advanced replay', () => {
  let r = event(createLabRun(), 'start', 0, {seconds:15}); r = event(r,'ballot',1,{viewer:'a',id:'1',text:'defend then attack'});
  const partial = advanceLabPlayback(createLabPlayback(r.trace), 2), stopped = stopLabPlayback(partial); assert.equal(stopped.status,'stopped'); assert.deepEqual(stopped.state.ballots,{}); assert.deepEqual(stopped.state.queue,[]); assert.equal(advanceLabPlayback(stopped),stopped);
  assert.equal(stopLabRecording(r, 999999999).state.status,'stopped'); assert.equal(stopLabRecording(r, NaN).state.status,'stopped');
  r = event(r,'close',2); r = event(r,'stop',3); assert.deepEqual(r.state.queue,[]); assert.equal(advanceLabPlayback(createLabPlayback(r.trace),512).state.status,'stopped');
});
const fixture = () => { const e = offlineRacingExample(); return { ...e, state: acceptRacingMessage(createRacingContract(), e.observation, e.trust, e.now).state }; };
test('offline contract queues only strategic work; dispatch and acknowledgement are separate and each next step requires a new observation', () => {
  const f = fixture(); let r = acceptRacingMessage(f.state, f.intent, f.trust, f.now); assert(r.accepted); assert.equal(r.state.active,null); assert.equal(r.state.queue.length,1);
  let d = dispatchRacingStep(r.state,f.trust,f.now); assert.equal(d.dispatch.strategy,'overtake-clear'); assert.equal(d.state.queue.length,0);
  r = acceptRacingMessage(d.state,{version:1,session:f.trust.session,type:'ack',intentId:f.intent.id,step:0,observationSeq:1,outcome:'completed'},f.trust,f.now); assert(r.accepted); assert.equal(r.state.queue[0].index,1);
  assert.equal(dispatchRacingStep(r.state,f.trust,f.now).dispatch,null);
  r = acceptRacingMessage(r.state,{...f.observation,seq:2},f.trust,f.now); d = dispatchRacingStep(r.state,f.trust,f.now); assert.equal(d.dispatch.strategy,'hold-line');
  r = acceptRacingMessage(d.state,{version:1,session:f.trust.session,type:'ack',intentId:f.intent.id,step:1,observationSeq:2,outcome:'completed'},f.trust,f.now); assert.equal(r.state.active,null); assert.deepEqual(r.state.queue,[]);
});
test('unauthenticated, unpaired, expired, mismatched and unapproved transport contexts never enqueue an intent', () => {
  const f = fixture(); for (const patch of [{authenticated:false},{paired:false},{expiresAt:f.now},{session:'other'},{origin:'https://evil.test'},{origin:'https://user:pass@evil.test',approvedOrigin:'https://user:pass@evil.test'}]) { const r = acceptRacingMessage(f.state,f.intent,{...f.trust,...patch},f.now); assert.equal(r.accepted,false); assert.deepEqual(r.state.queue,[]); }
});
test('message JSON cannot grant authentication; unknown versions, fields, commands and duplicate identities fail closed', () => {
  const f = fixture(); for (const patch of [{version:2},{session:'other'},{authenticated:true},{steps:[{strategy:'steer-left',timeoutMs:500,requires:[]}]},{steps:[{strategy:'push',timeoutMs:6000,requires:[]}]},{expiresAt:f.now+5001}]) { const r = acceptRacingMessage(f.state,{...f.intent,...patch},f.trust,f.now); assert.equal(r.accepted,false); assert.deepEqual(r.state.queue,[]); }
  const first = acceptRacingMessage(f.state,f.intent,f.trust,f.now); assert.equal(acceptRacingMessage(first.state,f.intent,f.trust,f.now).accepted,false);
});
test('stale/future observations and intents are rejected; every dispatch rechecks freshness, grip and clearance', () => {
  const f = fixture(); for (const at of [f.now-1001,f.now+1]) assert.equal(acceptRacingMessage(createRacingContract(),{...f.observation,at},f.trust,f.now).accepted,false);
  for (const patch of [{sentAt:f.now+1},{sentAt:f.now-1001},{observationSeq:0}]) assert.equal(acceptRacingMessage(f.state,{...f.intent,...patch},f.trust,f.now).accepted,false);
  const queued = acceptRacingMessage(f.state,f.intent,f.trust,f.now).state;
  assert.equal(dispatchRacingStep(queued,f.trust,f.now+1001).dispatch,null);
  for (const patch of [{clear:false},{grip:'low'}]) { const next = acceptRacingMessage(queued,{...f.observation,seq:2,...patch},f.trust,f.now).state; assert.equal(dispatchRacingStep(next,f.trust,f.now).dispatch,null); }
});
test('queue, sequence lengths, receipts and logs stay bounded; queue pressure never partially admits a sequence', () => {
  const f = fixture(); let state=f.state;
  for(let i=1;i<=4;i++) {const r=acceptRacingMessage(state,{...f.intent,id:'intent_'+i,seq:i},f.trust,f.now);assert(r.accepted);state=r.state;}
  const rejected=acceptRacingMessage(state,{...f.intent,id:'overflow',seq:5},f.trust,f.now);assert.equal(rejected.accepted,false);assert.equal(rejected.state.queue.length,4);
  assert.equal(acceptRacingMessage(f.state,{...f.intent,steps:Array(5).fill(f.intent.steps[0])},f.trust,f.now).accepted,false);
  for(let i=0;i<100;i++)state=acceptRacingMessage(state,{},f.trust,f.now).state;assert.equal(state.log.length,40);
});
test('timeout, disconnect, unsafe telemetry, backwards clock and local emergency stop clear active and queued work', () => {
  const f=fixture(),queued=acceptRacingMessage(f.state,f.intent,f.trust,f.now).state,active=dispatchRacingStep(queued,f.trust,f.now).state;
  for(const state of [maintainRacingContract(active,f.trust,f.now+1000),maintainRacingContract(active,{...f.trust,authenticated:false},f.now),maintainRacingContract(active,f.trust,f.now-1),acceptRacingMessage(active,{...f.observation,seq:2,danger:true},f.trust,f.now).state,emergencyStopRacing(active)]) {assert(state.stopped);assert.deepEqual(state.queue,[]);assert.equal(state.active,null);assert.equal(dispatchRacingStep(state,f.trust,f.now).dispatch,null);}
  const badAck=acceptRacingMessage(active,{version:1,session:f.trust.session,type:'ack',intentId:'other',step:0,observationSeq:1,outcome:'completed'},f.trust,f.now);assert.equal(badAck.accepted,false);assert(badAck.state.active);
});
