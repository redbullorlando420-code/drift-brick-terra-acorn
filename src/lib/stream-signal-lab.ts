import {readLabPlan,labRuleFailure,type LabPlan,type LabRule} from './lab-conditional.ts';
export const LAB_QUEUE_LIMIT = 12, LAB_VIEWER_LIMIT = 200, LAB_SEEN_LIMIT = 512;
export type LabMove = 'attack' | 'defend' | 'heal';
export type LabState = {plans?:Record<string,LabPlan>;observedAt?:number; status: 'idle' | 'voting' | 'stopped'; window: number; deadline: number | null;
  ballots: Record<string, LabMove[]>; seen: string[]; queue: Array<{ move: LabMove; sequence: number;rule?:LabRule }>;
  health: number; energy: number; enemy: number; guarded: boolean; log: string[] };
export function createLabState(): LabState { return { status: 'idle', window: 0, deadline: null, ballots: {}, seen: [], queue: [], health: 70, energy: 60, enemy: 100, guarded: false, log: ['SIMULATOR: no Twitch, YouTube, or game connection.'] }; }
const note = (state: LabState, message: string): LabState => ({ ...state, log: [...state.log.slice(-99), message] });
export function parseLabSequence(text: string): LabMove[] | null {
  const parts = text.trim().toLowerCase().replace(/^!/, '').split(/\s+then\s+|\s*->\s*|\s*→\s*/);
  return parts.length >= 1 && parts.length <= 4 && parts.every(part => ['attack', 'defend', 'heal'].includes(part)) ? parts as LabMove[] : null;
}
export function startLabWindow(state: LabState, seconds: number, now: number): LabState {
  if (state.status === 'stopped') return note(state, 'Stopped: reset the simulator to resume.');
  if (state.status === 'voting') return state;
  if (!Number.isInteger(seconds) || seconds < 2 || seconds > 120) return note(state, 'Choose a voting window from 2 to 120 seconds.');
  return note({ ...state, status: 'voting', window: state.window + 1, deadline: now + seconds * 1000, ballots: {},...(state.plans?{plans:{}}:{}) }, `Window ${state.window + 1} opened for ${seconds}s.`);
}
export function closeLabWindow(state: LabState,now=0): LabState {
  if (state.status !== 'voting') return state;
  const counts = new Map<string, number>();
  const winningPlans=new Map<string,LabPlan>();for (const [viewer,ballot] of Object.entries(state.ballots)) { const plan=state.plans?.[viewer],key=plan?'conditional '+JSON.stringify(plan):ballot.join(' then ');if(plan)winningPlans.set(key,plan);counts.set(key,(counts.get(key)??0)+1); }
  const ordered = [...counts].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const next = { ...state, status: 'idle' as const, deadline: null, ballots: {},...(state.plans?{plans:{}}:{}) };
  if (!ordered.length) return note(next, `Window ${state.window}: no valid ballots; no moves queued.`);
  const [winner,votes]=ordered[0]!,plan=winningPlans.get(winner),sequence=plan?plan.steps.map(s=>s.move):parseLabSequence(winner)!;
  if (next.queue.length + sequence.length > LAB_QUEUE_LIMIT) return note(next, `Window ${state.window}: ${winner} won (${votes}); entire sequence rejected because queue capacity is ${LAB_QUEUE_LIMIT}.`);
  return note({ ...next, queue: [...next.queue, ...sequence.map((move,index) => ({ move, sequence: state.window,...(plan?{rule:{when:plan.steps[index]!.when,maxAgeMs:plan.maxAgeMs,timeoutMs:plan.timeoutMs,onFalse:plan.onFalse,queuedAt:now}}:{}) }))] }, `Window ${state.window}: ${winner} won (${votes} vote${votes === 1 ? '' : 's'}). Ties use alphabetical whole-sequence order.`);
}
export function receiveLabBallot(state: LabState, viewerInput: string, messageId: string, text: string, now: number): LabState {
  if (state.status !== 'voting') return note(state, 'No voting window is open. Message ignored.');
  if (now >= state.deadline!) return note(closeLabWindow(state,now), 'Late message ignored after the window deadline.');
  const viewer = viewerInput.normalize('NFKC').trim().toLowerCase();
  if (!/^[\p{L}\p{N}_-]{1,64}$/u.test(viewer) || !messageId.trim() || messageId.length > 128) return note(state, 'Use a viewer name (letters, digits, _ or -) and a message ID.');
  if (state.seen.includes(messageId)) return note(state, `Duplicate message ${messageId} ignored.`);
  const seen = [...state.seen.slice(-(LAB_SEEN_LIMIT - 1)), messageId], sequence = parseLabSequence(text);
  if (!sequence) return note({ ...state, seen }, 'Invalid command: use attack, defend or heal, with up to four moves joined by “then”. Previous valid ballot kept.');
  if (!Object.hasOwn(state.ballots, viewer) && Object.keys(state.ballots).length >= LAB_VIEWER_LIMIT) return note({ ...state, seen }, 'Viewer capacity reached; new viewer ignored.');
  const replaced = Object.hasOwn(state.ballots, viewer);const plans=state.plans?{...state.plans}:undefined;if(plans)delete plans[viewer];
  return note({ ...state, seen, ballots: { ...state.ballots, [viewer]: sequence },...(plans?{plans}:{}) }, `${viewer}: ${sequence.join(' then ')}${replaced ? ' (replaced earlier ballot)' : ''}.`);
}
export function stepLabController(state: LabState,now=0): LabState {
  if (state.status === 'stopped' || !state.queue.length) return state;
  const [item, ...remaining] = state.queue;if(item!.rule){const failure=labRuleFailure(state,item!.rule,now);if(failure)return note({...state,queue:failure.stop?remaining.filter(r=>r.sequence!==item!.sequence):remaining},`Conditional ${failure.stop?'interrupted':'skipped'} ${item!.move}: ${failure.reason}.`);}
  const cost = { attack: 20, defend: 10, heal: 25 }[item!.move];
  const invalid = state.health <= 0 ? 'player is down' : state.enemy <= 0 ? 'opponent already defeated' : state.energy < cost ? 'insufficient energy' : item!.move === 'heal' && state.health >= 100 ? 'health already full' : '';
  if (invalid) return note({ ...state, queue: remaining.filter(row => row.sequence !== item!.sequence) }, `Interrupted ${item!.move}: ${invalid}. Remaining moves in that sequence cleared.`);
  const next = { ...state, queue: remaining, energy: state.energy - cost };
  if (item!.move === 'defend') next.guarded = true;
  if (item!.move === 'heal') next.health = Math.min(100, state.health + 30);
  if (item!.move === 'attack') { next.enemy = Math.max(0, state.enemy - 25); next.health = Math.max(0, state.health - (state.guarded ? 4 : 14)); next.guarded = false; }
  if(state.observedAt!==undefined)next.observedAt=now;return note(next, `Executed ${item!.move}; checked fresh health, energy and opponent state. Energy ${next.energy}, health ${next.health}, opponent ${next.enemy}.`);
}
export function stopLab(state: LabState): LabState { if(state.plans&& (state.queue.length||Object.keys(state.ballots).length))state=note(state,'Emergency cancellation: '+state.queue.map(r=>r.move+' (sequence '+r.sequence+')').join(', ')+'; '+Object.keys(state.ballots).length+' active simulated ballots.');return note({ ...state, status: 'stopped', deadline: null, ballots: {}, queue: [],...(state.plans?{plans:{}}:{}) }, 'EMERGENCY STOP: votes and all pending moves cleared. Reset required.'); }

export function observeLabState(state:LabState,now:number):LabState{return state.status==='stopped'?state:note({...state,observedAt:now},'Observed local simulator resources. No external chat or game connection.');}
export function receiveConditionalBallot(state:LabState,viewer:string,id:string,raw:unknown,now:number):LabState{
 const plan=readLabPlan(raw),eligible=state.status==='voting'&&now<state.deadline!&&!state.seen.includes(id),normalized=viewer.normalize('NFKC').trim().toLowerCase();
 const admitted=receiveLabBallot(state,viewer,id,plan.steps.map(s=>s.move).join(' then '),now);
 if(!eligible||!admitted.seen.includes(id)||!admitted.ballots[normalized]||admitted.ballots===state.ballots)return admitted;
 return note({...admitted,plans:{...admitted.plans,[normalized]:plan}},normalized+': accepted a reviewed conditional whole-sequence ballot.');
}
export function previewLabPlan(state:LabState,plan:LabPlan,now:number){const p=readLabPlan(plan);let draft:LabState={...state,status:'idle',queue:p.steps.map(s=>({move:s.move,sequence:-1,rule:{when:s.when,maxAgeMs:p.maxAgeMs,timeoutMs:p.timeoutMs,onFalse:p.onFalse,queuedAt:now}}))};const transitions=[];for(let i=0;i<p.steps.length&&draft.queue.length;i++){const before=draft;draft=stepLabController(draft,now);transitions.push({move:before.queue[0]!.move,health:draft.health,energy:draft.energy,opponent:draft.enemy,note:draft.log.at(-1)!});}return transitions;}
