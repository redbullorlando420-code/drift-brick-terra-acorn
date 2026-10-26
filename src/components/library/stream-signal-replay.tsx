import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { readWorkspaceDocument, saveWorkspaceDocuments } from '@/lib/videos/persist';
import { signalOwnerPrefix } from '@/lib/stream-signal';
import { advanceLabPlayback, createLabPlayback, exportLabTrace, parseLabTrace, readLabTrace, stopLabPlayback, LAB_EVENT_LIMIT, LAB_REPLAY_BYTES, type LabRun, type LabPlayback } from '@/lib/stream-signal-replay';

export function StreamSignalReplay({ owner, run, stopToken }: { owner: string; run: LabRun; stopToken: number }) {
  const [source, setSource] = useState(''), [playback, setPlayback] = useState<LabPlayback | null>(null);
  const [notice, setNotice] = useState(''), [busy, setBusy] = useState(false);
  const alive = useRef(true), request = useRef(0), key = signalOwnerPrefix(owner) + 'lab-replay';
  useEffect(() => { alive.current = true; return () => { alive.current = false; request.current++; }; }, []);
  useEffect(() => { if (stopToken) { request.current++; setPlayback(current => current ? stopLabPlayback(current) : null); } }, [stopToken]);
  const saved = async (write: boolean) => {
    const ticket = ++request.current; setBusy(true); setNotice('');
    try {
      if (write) { const trace = readLabTrace(run.trace); await saveWorkspaceDocuments([{ key, value: trace }]); if (alive.current) setNotice('Replay saved for the current app user. It replaces only this user’s previous saved lab replay.'); }
      else { const raw = await readWorkspaceDocument(key); if (!raw) throw Error('No replay is saved for this user yet.'); const text = exportLabTrace(readLabTrace(raw)); if (alive.current && ticket === request.current) { setSource(text); setPlayback(createLabPlayback(parseLabTrace(text))); setNotice('Saved replay loaded for review. The current battle is unchanged.'); } }
    } catch (e) { if (alive.current) setNotice(e instanceof Error ? e.message : 'Replay storage failed. Export the recording or retry.'); }
    finally { if (alive.current) setBusy(false); }
  };
  const download = () => { try { const url = URL.createObjectURL(new Blob([exportLabTrace(run.trace)], { type: 'application/json' })), link = document.createElement('a'); link.href = url; link.download = 'stream-signal-battle-replay.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice('Replay exported. It contains only simulated names, messages and checkpoints; review it before sharing.'); } catch (e) { setNotice(String(e)); } };
  const load = (text: string) => { request.current++; try { const trace = parseLabTrace(text); setSource(text); setPlayback(createLabPlayback(trace)); setNotice('Replay validated. Step through it or verify all checkpoints; the current battle is unchanged.'); } catch (e) { setNotice(e instanceof Error ? e.message : 'Invalid replay.'); } };
  return <section className="signal-panel space-y-4" aria-label="Deterministic simulator replay">
    <div><h3 className="text-xl font-semibold text-fg">Record it. Replay the same decisions.</h3><p className="mt-2 text-sm leading-6 text-muted">Seed {run.trace.config.seed} · {run.trace.events.length}/{LAB_EVENT_LIMIT} events. Relative event times and a checkpoint after every action reproduce ballots, ties, queue order and resource checks. Checkpoints detect regression differences; they are not security signatures.</p></div>
    <div className="flex flex-wrap gap-2"><Button variant="secondary" onClick={download}>Export current replay</Button><Button variant="secondary" disabled={busy} onClick={() => void saved(true)}>Save current replay</Button><Button variant="secondary" disabled={busy} onClick={() => void saved(false)}>Load saved replay</Button><Button variant="ghost" onClick={() => load(exportLabTrace(run.trace))}>Review current recording</Button></div>
    <label className="block"><span className="signal-label">Replay JSON</span><textarea aria-label="Replay JSON" rows={5} maxLength={LAB_REPLAY_BYTES} value={source} onChange={e => { request.current++; setSource(e.target.value); }} className="w-full rounded-md border border-border bg-bg p-3 font-mono text-xs text-fg" /></label>
    <div className="flex flex-wrap items-center gap-3"><Button onClick={() => load(source)}>Validate replay</Button><label className="text-sm text-muted">Import replay file<input aria-label="Import replay file" type="file" accept="application/json,.json" className="mt-2 block max-w-full text-xs" onChange={e => { const file = e.target.files?.[0]; e.target.value = ''; if (!file) return; if (file.size > LAB_REPLAY_BYTES) { setNotice('Replay file exceeds 1 MiB.'); return; } const ticket = ++request.current; void file.text().then(text => { if (alive.current && ticket === request.current) load(text); }).catch(() => { if (alive.current) setNotice('Could not read this replay file.'); }); }} /></label></div>
    {notice && <p role="status" className="rounded-md bg-bg/60 p-3 text-sm text-fg">{notice}</p>}
    {playback && <div className="space-y-3 rounded-md border border-border bg-bg/60 p-4" data-lab-playback={playback.status}>
      <p className="text-sm font-medium text-fg" role="status">Replay {playback.status} · {playback.index}/{playback.trace.events.length} checkpoints verified</p>
      {playback.divergence && <p role="alert" className="break-all text-sm text-danger">Divergence at event {playback.divergence.index}: expected {playback.divergence.expected}, got {playback.divergence.actual}. Verification stopped here.</p>}
      <p className="text-sm text-muted">Replay resources: health {playback.state.health}, energy {playback.state.energy}, opponent {playback.state.enemy}. Votes {Object.keys(playback.state.ballots).length} · pending moves {playback.state.queue.length}.</p>
      <div className="flex flex-wrap gap-2"><Button variant="secondary" disabled={playback.status !== 'ready'} onClick={() => setPlayback(current => current ? advanceLabPlayback(current) : null)}>Replay next event</Button><Button variant="secondary" disabled={playback.status !== 'ready'} onClick={() => setPlayback(current => current ? advanceLabPlayback(current, LAB_EVENT_LIMIT) : null)}>Verify remaining events</Button><Button variant="danger" onClick={() => { request.current++; setPlayback(current => current ? stopLabPlayback(current) : null); }}>Emergency stop replay</Button><Button variant="ghost" onClick={() => setPlayback(createLabPlayback(playback.trace))}>Restart replay review</Button></div>
      <ol aria-label="Replay controller log" className="max-h-52 space-y-1 overflow-auto font-mono text-xs leading-5 text-muted">{playback.state.log.map((line, index) => <li key={index}>{line}</li>)}</ol>
    </div>}
    <p className="text-xs leading-5 text-muted">At most 512 events and one saved replay per app user; one event slot is reserved for emergency stop. Recording fills visibly instead of dropping its beginning. Leaving the lab resets the current battle; only an explicit Save keeps a replay. Simulated input is never connected chat or installed-game control.</p>
  </section>;
}
