import { useEffect, useRef, useState } from 'react';
import { OctagonX, Play, RotateCcw, Send, Shield, Swords, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createLocalId } from '@/lib/local-id';
import { LAB_QUEUE_LIMIT } from '@/lib/stream-signal-lab';
import { createLabRun, recordLabEvent, stopLabRecording, sampleLabBallots, type LabEvent } from '@/lib/stream-signal-replay';
import { StreamSignalReplay } from './stream-signal-replay';

export function StreamSignalLab({ owner }: { owner: string }) {
  const [recording, setRecording] = useState(() => ({ run: createLabRun(), error: '' })), [seconds, setSeconds] = useState('15'), [seed, setSeed] = useState('1'), [stopToken, setStopToken] = useState(0);
  const epoch = useRef(performance.now()), state = recording.run.state;
  const at = () => Math.max(recording.run.trace.events.at(-1)?.event.at ?? 0, Math.round(performance.now() - epoch.current));
  const act = (event: LabEvent) => setRecording(current => { try { return { run: recordLabEvent(current.run, event), error: '' }; } catch (e) { return { ...current, error: e instanceof Error ? e.message : 'Event rejected.' }; } });
  const reset = () => { try { const run = createLabRun(Number(seed), Number(seconds)); epoch.current = performance.now(); setRecording({ run, error: '' }); } catch (e) { setRecording(current => ({ ...current, error: String(e) })); } };
  const [viewer, setViewer] = useState('viewer_1'), [messageId, setMessageId] = useState(() => createLocalId('msg-'));
  const [command, setCommand] = useState('defend then attack then heal');
  useEffect(() => {
    if (state.status !== 'voting' || !state.deadline) return;
    const timer = setTimeout(() => act({ type: 'close', at: Math.max(state.deadline!, Math.round(performance.now() - epoch.current)) }), Math.max(0, state.deadline - at()));
    return () => clearTimeout(timer);
  }, [state.status, state.deadline]);
  const ballots = Object.entries(state.ballots);
  return <div className="space-y-5" data-signal-lab>
    <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-border bg-bg/45 p-5">
      <div><p className="signal-badge">Simulator · local messages only</p><h2 className="mt-3 text-2xl font-semibold text-fg">Test the crowd. Keep the controls.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">A turn-based battle test for batched chat. This is not connected to Twitch, YouTube, iRacing Arcade, or a game controller. Nothing executes automatically.</p></div>
      <Button variant="danger" onClick={() => { const time = at(); setRecording(current => ({ run: stopLabRecording(current.run, time), error: '' })); setStopToken(n => n + 1); }}><OctagonX className="size-4" />Emergency stop</Button>
    </div>
    {recording.error && <p role="alert" className="rounded-md bg-elevated p-3 text-sm text-danger">{recording.error}</p>}
    <div className="flex flex-wrap items-end gap-3"><label><span className="signal-label">Sample seed (used after reset)</span><Input aria-label="Simulator sample seed" type="number" min={0} max={4294967295} value={seed} onChange={e => setSeed(e.target.value)} className="w-44" /></label><Button variant="secondary" disabled={state.status !== 'voting'} onClick={() => { const time = at(); for (const sample of sampleLabBallots(recording.run.trace.config.seed, state.window)) act({ type: 'ballot', at: time, ...sample }); }}>Add seeded sample votes</Button></div>
    <div className="grid gap-5 xl:grid-cols-2">
      <section className="signal-panel space-y-4"><h3 className="text-lg font-semibold text-fg">01 · Voting window</h3>
        <div className="flex flex-wrap items-end gap-3"><label className="block"><span className="signal-label">Window length (seconds)</span><Input aria-label="Voting window seconds" type="number" min={2} max={120} step={1} value={seconds} onChange={e => setSeconds(e.target.value)} className="w-32" /></label><Button className="signal-primary" disabled={state.status !== 'idle' || !Number.isInteger(Number(seconds)) || +seconds < 2 || +seconds > 120} onClick={() => act({ type: 'start', seconds: Number(seconds), at: at() })}><Play className="size-4" />Start voting window</Button><Button variant="secondary" disabled={state.status !== 'voting'} onClick={() => act({ type: 'close', at: at() })}>Close window now</Button></div>
        <p className="text-xs leading-5 text-muted">Choose 2–120 seconds. Windows close automatically; moves wait for your execution click. Leaving the lab resets this simulation.</p>
        <p className="text-sm text-muted" role="status">{state.status === 'voting' ? `Window ${state.window} accepting votes. It closes automatically at its recorded deadline.` : state.status === 'stopped' ? 'Emergency stop is active. Reset to start again.' : 'Ready for a new voting window.'}</p>
        <form className="space-y-3 border-t border-border pt-4" onSubmit={e => { e.preventDefault(); act({ type: 'ballot', viewer, id: messageId, text: command, at: at() }); }}>
          <div className="grid gap-3 sm:grid-cols-2"><label><span className="signal-label">Simulated viewer</span><Input aria-label="Simulated viewer" value={viewer} maxLength={64} onChange={e => setViewer(e.target.value)} /></label><label><span className="signal-label">Message ID</span><Input aria-label="Simulated message ID" value={messageId} maxLength={128} onChange={e => setMessageId(e.target.value)} /></label></div>
          <label className="block"><span className="signal-label">Whole command sequence</span><Input aria-label="Simulated command sequence" value={command} maxLength={160} onChange={e => setCommand(e.target.value)} /></label>
          <div className="flex flex-wrap gap-2"><Button type="submit" disabled={state.status !== 'voting'}><Send className="size-4" />Submit simulated ballot</Button><Button type="button" variant="secondary" onClick={() => setMessageId(createLocalId('msg-'))}>New message ID</Button></div>
          <p className="text-xs leading-5 text-muted">Reuse an ID to test duplicate detection. Use a new ID to change a viewer’s ballot. Commands: attack, defend, heal; up to four moves joined by “then”. Invalid messages leave the previous valid ballot intact.</p>
        </form>
        <div className="rounded-md bg-elevated/60 p-3"><p className="text-sm text-fg">{ballots.length} active ballot{ballots.length === 1 ? '' : 's'}</p><ul className="mt-2 space-y-1 text-xs text-muted" aria-label="Current simulator ballots">{ballots.slice(0, 8).map(([name, moves]) => <li key={name} className="break-words">{name}: {moves.join(' → ')}</li>)}</ul>{ballots.length > 8 && <p className="mt-2 text-xs text-muted">+{ballots.length - 8} other voters</p>}</div>
      </section>
      <section className="signal-panel space-y-4"><h3 className="text-lg font-semibold text-fg">02 · Local controller</h3>
        <div className="grid grid-cols-3 gap-2" aria-label="Simulator resources">{[[HeartPulse, 'Health', state.health], [Shield, 'Energy', state.energy], [Swords, 'Opponent', state.enemy]].map(([Icon, label, value]) => { const Glyph = Icon as typeof Shield; return <div key={String(label)} className="rounded-md bg-elevated p-3"><Glyph className="mb-2 size-4 text-accent" /><p className="text-xs text-muted">{String(label)}</p><strong className="text-2xl font-semibold text-fg">{String(value)}</strong></div>; })}</div>
        <p className="text-sm text-muted">Defense: {state.guarded ? 'guard raised' : 'not guarded'} · Queue {state.queue.length}/{LAB_QUEUE_LIMIT}</p>
        <ol className="flex min-h-16 flex-wrap content-start gap-2 rounded-md bg-bg/60 p-3" aria-label="Pending simulator moves">{state.queue.map((row, index) => <li key={`${row.sequence}:${index}`} className="signal-badge">{index + 1}. {row.move}</li>)}{!state.queue.length && <li className="text-sm text-muted">No moves queued.</li>}</ol>
        <div className="flex flex-wrap gap-2"><Button className="signal-primary" disabled={!state.queue.length || state.status === 'stopped'} onClick={() => act({ type: 'step', at: at() })}><Play className="size-4" />Execute next move</Button><Button variant="secondary" onClick={reset}><RotateCcw className="size-4" />Reset simulator</Button></div>
        <p className="text-xs leading-5 text-muted">Attack costs 20 energy; defend 10; heal 25. Every move checks current health, energy and opponent state. A failed condition interrupts the rest of that sequence. Reset restores resources.</p>
        <div className="border-t border-border pt-4"><h4 className="text-sm font-semibold text-fg">Deterministic rules</h4><p className="mt-2 text-xs leading-5 text-muted">One latest valid ballot per normalized viewer, per window. Vote on whole sequences; moves are never mixed from separate ballots. Ties use alphabetical whole-sequence order. A full queue rejects the entire winning sequence. Limits: 200 voters, 512 recent message IDs, 12 pending moves, 100 log entries. Closing a window only queues moves.</p></div>
      </section>
    </div>
    <section className="signal-panel"><h3 className="mb-3 text-lg font-semibold text-fg">Controller log</h3><ol className="max-h-72 space-y-2 overflow-y-auto rounded-md bg-bg/70 p-4 font-mono text-xs leading-5 text-muted" aria-label="Simulator controller log" aria-live="polite" aria-relevant="additions">{state.log.map((entry, index) => <li key={`${index}:${entry}`}>{entry}</li>)}</ol></section>
    <StreamSignalReplay owner={owner} run={recording.run} stopToken={stopToken} />
  </div>;
}
