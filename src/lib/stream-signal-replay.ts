import { createLabState, startLabWindow, closeLabWindow, receiveLabBallot, stepLabController, stopLab, type LabState } from './stream-signal-lab.ts';

export const LAB_EVENT_LIMIT = 512, LAB_REPLAY_BYTES = 1048576;
export type LabEvent = { type: 'start'; at: number; seconds: number } | { type: 'ballot'; at: number; viewer: string; id: string; text: string } | { type: 'close' | 'step' | 'stop'; at: number };
export type LabTrace = { version: 1; simulator: 'battle-v1'; config: { seed: number; seconds: number }; events: Array<{ event: LabEvent; checksum: string }> };
export type LabRun = { trace: LabTrace; state: LabState };
export type LabPlayback = { trace: LabTrace; state: LabState; index: number; status: 'ready' | 'complete' | 'diverged' | 'stopped'; divergence?: { index: number; expected: string; actual: string } };
const integer = (v: unknown, min: number, max: number): v is number => Number.isSafeInteger(v) && (v as number) >= min && (v as number) <= max;
const record = (v: unknown): Record<string, unknown> => { if (!v || typeof v !== 'object' || Array.isArray(v)) throw Error('Replay requires a JSON object.'); return v as Record<string, unknown>; };
function fields(v: Record<string, unknown>, keys: string[]) { if (Object.keys(v).some(key => !keys.includes(key))) throw Error('Unknown replay fields are not supported.'); }
export function normalizeLabEvent(value: unknown): LabEvent {
  const e = record(value); if (!integer(e.at, 0, 86400000)) throw Error('Event time must be an integer offset within one day.');
  if (e.type === 'start') { fields(e, ['type', 'at', 'seconds']); if (!integer(e.seconds, 2, 120)) throw Error('Voting windows must be 2–120 seconds.'); return { type: 'start', at: e.at, seconds: e.seconds }; }
  if (e.type === 'ballot') {
    fields(e, ['type', 'at', 'viewer', 'id', 'text']);
    if (typeof e.viewer !== 'string' || e.viewer.length > 64 || !/^[\p{L}\p{N}_-]{1,64}$/u.test(e.viewer.normalize('NFKC').trim().toLowerCase()) || typeof e.id !== 'string' || !e.id.trim() || e.id.length > 128 || typeof e.text !== 'string' || e.text.length > 160) throw Error('Invalid simulated viewer, message ID or command size.');
    return { type: 'ballot', at: e.at, viewer: e.viewer.normalize('NFKC').trim().toLowerCase(), id: e.id.trim(), text: e.text.trim().toLowerCase() };
  }
  if (e.type === 'close' || e.type === 'step' || e.type === 'stop') { fields(e, ['type', 'at']); return { type: e.type, at: e.at }; }
  throw Error('Unknown simulator event type.');
}
/** A non-security regression checksum, never an authentication signature. */
export function labChecksum(state: LabState) {
  const text = JSON.stringify({ ...state, ballots: Object.fromEntries(Object.entries(state.ballots).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)) });
  let a = 2166136261, b = 2246822519;
  for (let i = 0; i < text.length; i++) { a = Math.imul(a ^ text.charCodeAt(i), 16777619); b = Math.imul(b ^ text.charCodeAt(i), 3266489917); }
  return (a >>> 0).toString(16).padStart(8, '0') + (b >>> 0).toString(16).padStart(8, '0');
}
function reduce(state: LabState, event: LabEvent): LabState {
  switch (event.type) {
    case 'start': return startLabWindow(state, event.seconds, event.at);
    case 'ballot': return receiveLabBallot(state, event.viewer, event.id, event.text, event.at);
    case 'close': return closeLabWindow(state);
    case 'step': return stepLabController(state);
    case 'stop': return stopLab(state);
  }
}
export function createLabRun(seed = 1, seconds = 15): LabRun {
  if (!integer(seed, 0, 0xffffffff) || !integer(seconds, 2, 120)) throw Error('Use an integer seed from 0–4294967295 and a 2–120 second window.');
  return { trace: { version: 1, simulator: 'battle-v1', config: { seed, seconds }, events: [] }, state: createLabState() };
}
export function recordLabEvent(run: LabRun, raw: unknown): LabRun {
  const event = normalizeLabEvent(raw), last = run.trace.events.at(-1)?.event.at ?? 0;
  if (event.at < last) throw Error('Out-of-order events are rejected.');
  if (event.type === 'stop' && run.state.status === 'stopped') return run;
  if (run.trace.events.length >= (event.type === 'stop' ? LAB_EVENT_LIMIT : LAB_EVENT_LIMIT - 1)) throw Error('Recording is full. Export or save it, then reset. One final emergency-stop slot is reserved.');
  const state = reduce(run.state, event);
  return { state, trace: { ...run.trace, events: [...run.trace.events, { event, checksum: labChecksum(state) }] } };
}
/** Stop remains usable after the bounded recording clock expires. It never
 * depends on an input message or on the browser's wall clock remaining valid. */
export function stopLabRecording(run: LabRun, at: number): LabRun {
  const last = run.trace.events.at(-1)?.event.at ?? 0;
  return recordLabEvent(run, { type: 'stop', at: Math.max(last, Math.min(86400000, Number.isFinite(at) ? Math.max(0, Math.round(at)) : last)) });
}
export function readLabTrace(raw: unknown): LabTrace {
  const trace = record(raw); fields(trace, ['version', 'simulator', 'config', 'events']);
  if (trace.version !== 1 || trace.simulator !== 'battle-v1' || !Array.isArray(trace.events) || trace.events.length > LAB_EVENT_LIMIT) throw Error('Unsupported replay version, simulator or event count.');
  const config = record(trace.config); fields(config, ['seed', 'seconds']); const run = createLabRun(config.seed as number, config.seconds as number);
  let at = 0;
  const events = trace.events.map(rawRow => { const row = record(rawRow); fields(row, ['event', 'checksum']); const event = normalizeLabEvent(row.event); if (event.at < at || typeof row.checksum !== 'string' || !/^[a-f0-9]{16}$/.test(row.checksum)) throw Error('Replay has out-of-order events or an invalid checkpoint.'); at = event.at; return { event, checksum: row.checksum }; });
  return { ...run.trace, events };
}
export function parseLabTrace(text: string) { if (text.length > LAB_REPLAY_BYTES || new TextEncoder().encode(text).length > LAB_REPLAY_BYTES) throw Error('Replay files are limited to 1 MiB.'); return readLabTrace(JSON.parse(text)); }
export function exportLabTrace(trace: LabTrace) { const text = JSON.stringify(readLabTrace(trace), null, 2); if (new TextEncoder().encode(text).length > LAB_REPLAY_BYTES) throw Error('Replay is too large to export.'); return text; }
export function createLabPlayback(raw: unknown): LabPlayback { const trace = readLabTrace(raw); return { trace, state: createLabState(), index: 0, status: trace.events.length ? 'ready' : 'complete' }; }
export function advanceLabPlayback(playback: LabPlayback, count = 1): LabPlayback {
  if (playback.status !== 'ready') return playback;
  if (!integer(count, 1, LAB_EVENT_LIMIT)) throw Error('Invalid replay step count.');
  let next = playback;
  for (let i = 0; i < count && next.index < next.trace.events.length; i++) {
    const row = next.trace.events[next.index]!, state = reduce(next.state, row.event), actual = labChecksum(state);
    if (actual !== row.checksum) return { ...next, state, status: 'diverged', divergence: { index: next.index + 1, expected: row.checksum, actual } };
    next = { ...next, state, index: next.index + 1 };
  }
  return { ...next, status: next.index === next.trace.events.length ? 'complete' : 'ready' };
}
export function stopLabPlayback(playback: LabPlayback): LabPlayback { return { ...playback, state: stopLab(playback.state), status: 'stopped' }; }
export function sampleLabBallots(seed: number, window: number) {
  let n = (seed ^ Math.imul(window, 2654435761)) >>> 0;
  const commands = ['attack then heal', 'defend then attack then heal', 'defend', 'heal'];
  return Array.from({ length: 4 }, (_, i) => { n = (Math.imul(n, 1664525) + 1013904223) >>> 0; return { viewer: 'sample_' + (i + 1), id: 'sample-' + window + '-' + i, text: commands[(n >>> 16) % commands.length]! }; });
}
