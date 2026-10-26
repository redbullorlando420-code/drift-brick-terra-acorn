/** Offline contract only. A future adapter must supply verified transport trust;
 * message JSON can never establish authentication or operate an installed game. */
export const RACING_CONTRACT_VERSION = 1, RACING_QUEUE_LIMIT = 4, RACING_OBSERVATION_MAX_AGE = 1000;
export const RACING_STRATEGIES = ['push', 'conserve', 'hold-line', 'overtake-clear'] as const;
export type RacingStrategy = typeof RACING_STRATEGIES[number];
export type RacingTrust = { authenticated: boolean; paired: boolean; session: string; origin: string; approvedOrigin: string; expiresAt: number };
export type RacingObservation = { seq: number; at: number; ready: boolean; clear: boolean; grip: 'good' | 'low'; danger: boolean };
export type RacingStep = { strategy: RacingStrategy; timeoutMs: number; requires: Array<'ready' | 'clear' | 'grip'> };
export type RacingWork = { id: string; seq: number; expiresAt: number; steps: RacingStep[]; index: number; lastObservationSeq: number };
export type RacingContractState = { session: string; observation: RacingObservation | null; lastIntentSeq: number; ids: string[]; queue: RacingWork[]; active: { work: RacingWork; deadline: number; observationSeq: number } | null; lastNow: number; stopped: boolean; log: string[] };
export type RacingResult = { state: RacingContractState; accepted: boolean; reason: string };
const num = (v: unknown, min = 0, max = Number.MAX_SAFE_INTEGER): v is number => Number.isSafeInteger(v) && (v as number) >= min && (v as number) <= max;
const id = (v: unknown): v is string => typeof v === 'string' && /^[a-zA-Z0-9_-]{1,64}$/.test(v);
const obj = (v: unknown): Record<string, unknown> => { if (!v || typeof v !== 'object' || Array.isArray(v)) throw Error('Expected a message object.'); return v as Record<string, unknown>; };
function keys(v: Record<string, unknown>, allowed: string[]) { if (Object.keys(v).some(key => !allowed.includes(key))) throw Error('Unknown contract fields are rejected.'); }
const log = (state: RacingContractState, message: string) => ({ ...state, log: [...state.log.slice(-39), message] });
export function createRacingContract(session = 'offline_demo'): RacingContractState {
  if (!id(session)) throw Error('Invalid session identity.');
  return { session, observation: null, lastIntentSeq: 0, ids: [], queue: [], active: null, lastNow: 0, stopped: false, log: ['OFFLINE SIMULATOR: no authenticated transport or game connection.'] };
}
function trustFailure(state: RacingContractState, trust: RacingTrust, now: number) {
  if (!num(now) || !trust || trust.authenticated !== true || trust.paired !== true) return 'Transport is unauthenticated or unpaired.';
  if (!id(trust.session) || trust.session !== state.session) return 'Pairing session does not match.';
  if (!num(trust.expiresAt) || now >= trust.expiresAt) return 'Pairing has expired.';
  try { const origin = new URL(trust.origin), approved = new URL(trust.approvedOrigin); if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== trust.origin || approved.origin !== trust.approvedOrigin || origin.origin !== approved.origin || origin.username || origin.password) return 'Origin is not explicitly approved.'; } catch { return 'Origin is not explicitly approved.'; }
  return '';
}
export function emergencyStopRacing(state: RacingContractState, reason = 'Local emergency stop') {
  return log({ ...state, queue: [], active: null, observation: null, stopped: true }, reason + ': all strategies cleared; a fresh supervised session is required.');
}
export function maintainRacingContract(state: RacingContractState, trust: RacingTrust, now: number) {
  if (state.stopped) return state;
  if (!num(now) || now < state.lastNow) return emergencyStopRacing(state, 'Clock moved backwards or became invalid');
  state = { ...state, lastNow: now };
  const denied = trustFailure(state, trust, now);
  const expired = state.active && now >= state.active.deadline || state.queue.some(work => now >= work.expiresAt);
  return denied || expired ? emergencyStopRacing(state, denied || 'Intent or acknowledgement timeout') : state;
}
function conditionFailure(observation: RacingObservation | null, step: RacingStep, now: number) {
  if (!observation || observation.at > now || now - observation.at > RACING_OBSERVATION_MAX_AGE) return 'A fresh observation is required.';
  if (!observation.ready || observation.danger) return 'Controller is not ready or danger is present.';
  if ((step.strategy === 'push' || step.strategy === 'overtake-clear' || step.requires.includes('grip')) && observation.grip !== 'good') return 'Current grip is insufficient.';
  if ((step.strategy === 'overtake-clear' || step.requires.includes('clear')) && !observation.clear) return 'Current clearance is not verified.';
  return '';
}
function readStep(raw: unknown): RacingStep {
  const s = obj(raw); keys(s, ['strategy', 'timeoutMs', 'requires']);
  if (!(RACING_STRATEGIES as readonly unknown[]).includes(s.strategy) || !num(s.timeoutMs, 100, 5000) || !Array.isArray(s.requires) || s.requires.length > 3 || s.requires.some(v => !['ready', 'clear', 'grip'].includes(v)) || new Set(s.requires).size !== s.requires.length) throw Error('Unsupported strategy, condition or step timeout.');
  return { strategy: s.strategy as RacingStrategy, timeoutMs: s.timeoutMs, requires: [...s.requires] as RacingStep['requires'] };
}
export function acceptRacingMessage(previous: RacingContractState, raw: unknown, trust: RacingTrust, now: number): RacingResult {
  let state = maintainRacingContract(previous, trust, now);
  const rejected = (reason: string): RacingResult => ({ state: log(state, 'Rejected: ' + reason), accepted: false, reason });
  const denied = trustFailure(state, trust, now); if (denied) return rejected(denied);
  if (state.stopped) return rejected('Emergency stop is latched. Start a fresh supervised session.');
  try {
    const m = obj(raw); if (JSON.stringify(m).length > 8192) throw Error('Message exceeds the 8 KiB contract limit.');
    if (m.version !== 1 || m.session !== state.session) throw Error('Unsupported version or session.');
    if (m.type === 'observation') {
      keys(m, ['version', 'session', 'type', 'seq', 'at', 'ready', 'clear', 'grip', 'danger']);
      if (!num(m.seq, 1) || m.seq <= (state.observation?.seq ?? 0) || !num(m.at) || m.at > now || now - m.at > RACING_OBSERVATION_MAX_AGE || (state.observation && m.at < state.observation.at) || typeof m.ready !== 'boolean' || typeof m.clear !== 'boolean' || !['good', 'low'].includes(m.grip as string) || typeof m.danger !== 'boolean') throw Error('Observation is invalid, stale or out of order.');
      const observation: RacingObservation = { seq: m.seq, at: m.at, ready: m.ready, clear: m.clear, grip: m.grip as 'good' | 'low', danger: m.danger };
      state = observation.danger || !observation.ready ? emergencyStopRacing(state, 'Unsafe observation') : log({ ...state, observation }, 'Fresh observation ' + observation.seq + ' accepted.');
    } else if (m.type === 'intent') {
      keys(m, ['version', 'session', 'type', 'id', 'seq', 'sentAt', 'expiresAt', 'observationSeq', 'steps']);
      if (!id(m.id) || !num(m.seq, 1) || m.seq <= state.lastIntentSeq || state.ids.includes(m.id) || !num(m.sentAt) || m.sentAt > now || now - m.sentAt > 1000 || !num(m.expiresAt) || m.expiresAt <= now || m.expiresAt > m.sentAt + 5000 || !state.observation || m.observationSeq !== state.observation.seq || !Array.isArray(m.steps) || m.steps.length < 1 || m.steps.length > 4) throw Error('Intent identity, lifetime, observation or sequence is invalid.');
      if (state.queue.length + (state.active ? 1 : 0) >= RACING_QUEUE_LIMIT) throw Error('Bounded strategy queue is full.');
      const steps = m.steps.map(readStep), failure = conditionFailure(state.observation, steps[0]!, now); if (failure) throw Error(failure);
      const work: RacingWork = { id: m.id, seq: m.seq, expiresAt: m.expiresAt, steps, index: 0, lastObservationSeq: 0 };
      state = log({ ...state, queue: [...state.queue, work], ids: [...state.ids.slice(-127), work.id], lastIntentSeq: work.seq }, 'Strategic sequence queued; no game input executed.');
    } else if (m.type === 'ack') {
      keys(m, ['version', 'session', 'type', 'intentId', 'step', 'observationSeq', 'outcome']);
      const active = state.active;
      if (!active || m.intentId !== active.work.id || m.step !== active.work.index || m.observationSeq !== state.observation?.seq || !['completed', 'interrupted'].includes(m.outcome as string)) throw Error('Acknowledgement does not match the active step and fresh observation.');
      const failure = conditionFailure(state.observation, active.work.steps[active.work.index]!, now);
      if (failure || m.outcome === 'interrupted') state = emergencyStopRacing(state, failure || 'Controller interrupted the sequence');
      else { const work = { ...active.work, index: active.work.index + 1, lastObservationSeq: active.observationSeq }; state = log({ ...state, active: null, queue: work.index < work.steps.length ? [work, ...state.queue] : state.queue }, 'Step acknowledged; remaining strategy waits for a new local dispatch check.'); }
    } else if (m.type === 'stop') {
      keys(m, ['version', 'session', 'type']); state = emergencyStopRacing(state);
    } else throw Error('Unknown contract message type.');
    return { state, accepted: true, reason: 'Accepted by the offline contract validator.' };
  } catch (e) { return rejected(e instanceof Error ? e.message : 'Malformed message.'); }
}
export function dispatchRacingStep(previous: RacingContractState, trust: RacingTrust, now: number) {
  let state = maintainRacingContract(previous, trust, now);
  if (state.stopped || state.active || !state.queue.length) return { state, dispatch: null };
  const [work, ...remaining] = state.queue, step = work!.steps[work!.index]!, failure = conditionFailure(state.observation, step, now);
  if (failure || work!.index > 0 && state.observation!.seq <= work!.lastObservationSeq) return { state: emergencyStopRacing(state, failure || 'A new observation is required before the next sequence step'), dispatch: null };
  const deadline = Math.min(now + step.timeoutMs, work!.expiresAt, trust.expiresAt);
  state = log({ ...state, queue: remaining, active: { work: work!, deadline, observationSeq: state.observation!.seq } }, 'OFFLINE dispatch: ' + step.strategy + '; waiting for acknowledgement.');
  return { state, dispatch: { intentId: work!.id, step: work!.index, strategy: step.strategy, observationSeq: state.observation!.seq, expiresAt: deadline } };
}
export function offlineRacingExample() {
  const now = 10000, session = 'offline_demo';
  const trust: RacingTrust = { authenticated: true, paired: true, session, origin: 'http://127.0.0.1:8080', approvedOrigin: 'http://127.0.0.1:8080', expiresAt: now + 60000 };
  const observation = { version: 1, session, type: 'observation', seq: 1, at: now, ready: true, clear: true, grip: 'good', danger: false };
  const intent = { version: 1, session, type: 'intent', id: 'strategy_1', seq: 1, sentAt: now, expiresAt: now + 5000, observationSeq: 1, steps: [{ strategy: 'overtake-clear', timeoutMs: 1000, requires: ['ready', 'clear', 'grip'] }, { strategy: 'hold-line', timeoutMs: 1000, requires: ['ready'] }] };
  return { label: 'OFFLINE EXAMPLE — trust flags are fixtures, not authentication', now, trust, observation, intent };
}
