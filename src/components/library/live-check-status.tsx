import { BatchStatusAnnouncement } from './batch-status-announcement';
import { YoutubeLiveCoveragePanel } from './youtube-live-coverage-panel';
import { youtubeEvidenceExplanation } from '@/lib/remote/youtube-live-evidence';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/lib/videos/store';
import { registerPeriodicTask } from '@/lib/periodic-work';
import { getPullSettings, subscribePullSettings, updatePullSettings } from '@/lib/pull-settings';
import { pullsPaused, subscribePullControl } from '@/lib/pull-control';
import { selectTwitchQuickLiveChannels } from '@/lib/videos/twitch-quick-live';
import { youtubeLiveCoverage, youtubeLiveCooldown, type YoutubeLiveQueueRow } from '@/lib/videos/youtube-live-health';

export function LiveCheckStatus({ kind, action = true }: { kind: 'youtube' | 'twitch'; action?: boolean }) {
  const label = kind === 'youtube' ? 'YouTube' : 'Twitch';
  const follows = useLibrary(s => s.follows), scan = useLibrary(s => kind === 'youtube' ? s.youtubeLiveProgress : s.twitchLiveProgress);
  const refresh = useLibrary(s => s.refreshFollows);
  const source = useLibrary(s => s.sourceId), viewerOpen = useLibrary(s => Boolean(s.activeId || s.previewId));
  const settings = useSyncExternalStore(subscribePullSettings, getPullSettings, getPullSettings);
  const paused = useSyncExternalStore(subscribePullControl, pullsPaused, () => false);
  const [clock, setClock] = useState(Date.now);
  const [actionError, setActionError] = useState('');
  useEffect(() => registerPeriodicTask({ name: label + ' coverage age', everyMs: 15_000, mode: 'visible', work: () => setClock(Date.now()) }).cancel, [label]);
  const demand = source === 'live' || source === kind;
  const coverage = useMemo(() => {
    if (kind === 'youtube') return youtubeLiveCoverage(follows, Math.max(clock, Date.now()));
    const now = Math.max(clock, Date.now()); let total = 0, recent = 0, failed = 0, unchecked = 0;
    for (const channel of follows) if (channel.kind === 'twitch') {
      total++;
      if (!channel.liveCheckedAt) unchecked++;
      if (channel.lastLiveFailure && channel.lastLiveFailure.at >= (channel.liveCheckedAt ?? 0)) failed++;
      else if (channel.liveCheckedAt && now - channel.liveCheckedAt < 5 * 60_000) recent++;
    }
    const due = selectTwitchQuickLiveChannels(follows, follows.length, true, now).length;
    return { total, recent, failed, unchecked, due, dueIds: [] as string[], queue:[] as YoutubeLiveQueueRow[], cooling: 0, nextRetryAt: undefined as number | undefined, failures: follows.filter(c=>c.kind==='twitch'&&c.lastLiveFailure&&c.lastLiveFailure.at>=(c.liveCheckedAt??0)).slice(0,12) };
  }, [follows, kind, clock]);
  const provisional = useMemo(() => kind === 'youtube' ? follows.filter(c=>c.kind==='youtube' && c.live && (c.liveOfflineSince || c.lastLiveFailure || c.youtubeLiveEvidence && !c.youtubeLiveEvidence.complete)) : [],[follows,kind]);
  const busy = scan?.status === 'running';
  const retryAt = Math.max(scan?.retryAt ?? 0, kind === 'youtube' ? youtubeLiveCooldown(follows, Math.max(clock, Date.now()))?.retryAt ?? 0 : 0);
  const cooling = retryAt > Math.max(clock, Date.now());
  const checkAll = async () => {
    setActionError('');
    try { await refresh(kind, { youtubeLiveOnly: kind === 'youtube', twitchLiveOnly: kind === 'twitch', liveSweep: true }); }
    catch(error) { setActionError(error instanceof Error ? error.message : 'The live check could not start.'); }
  };
  const checkDue = async () => {
    setActionError('');
    try {
      // Read current timestamps at the click, not an old render's due list.
      const ids = youtubeLiveCoverage(useLibrary.getState().follows).dueIds;
      if (!ids.length) return;
      const result = await refresh('youtube', { youtubeLiveOnly: true, liveSweep: true, channelIds: ids });
      if (!result.pull) setActionError(result.skipped === 'cooldown' ? 'YouTube is cooling down. Due creators remain queued for the next check.' : result.skipped === 'busy' ? 'A live check is already running. Its observations will update this list.' : 'No creators are currently due for a live check.');
    } catch (error) { setActionError(error instanceof Error ? error.message : 'The due live check could not start.'); }
  };
  const recheck = async (id: string) => {
    setActionError('');
    try {
      const result = await refresh('youtube',{youtubeLiveOnly:true,liveSweep:true,channelIds:[id]});
      if (!result.pull) setActionError(result.skipped === 'cooldown' ? 'This creator is waiting for its retry deadline.' : result.skipped === 'busy' ? 'A live check is already running.' : 'This creator could not be checked yet.');
    } catch(error) { setActionError(error instanceof Error ? error.message : 'Recheck could not start.'); }
  };
  return <section data-status-scope className="mb-5 rounded-lg border border-border bg-elevated p-4" aria-label={label + ' quick live checks'}>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0"><p className="text-sm font-medium text-fg">{label} quick live checks</p>
        <p className="mt-1 text-xs leading-5 text-muted">{coverage.recent.toLocaleString()} / {coverage.total.toLocaleString()} creators checked successfully in the last 5 minutes{coverage.failed ? ` · ${coverage.failed.toLocaleString()} latest attempts failed` : ''}. Known-live checks share each batch with oldest-first discovery; a large backlog reserves more discovery slots. {coverage.unchecked.toLocaleString()} not checked yet · {coverage.due.toLocaleString()} due for a check{coverage.cooling ? ` · ${coverage.cooling.toLocaleString()} waiting to retry` : ''}.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {kind === 'youtube' && <Button variant="secondary" disabled={busy || cooling || !coverage.due} onClick={() => void checkDue()}><RefreshCw className={busy ? 'size-4 animate-spin motion-reduce:animate-none' : 'size-4'} />Check due YouTube creators{coverage.due ? ` (${coverage.due.toLocaleString()})` : ''}</Button>}
        {action && <Button variant="secondary" disabled={busy || cooling || !coverage.total} onClick={() => void checkAll()}><RefreshCw className={busy ? 'size-4 animate-spin' : 'size-4'} />{busy ? 'Checking ' + label + ' live…' : 'Check all ' + label + ' live channels'}</Button>}
      </div>
    </div>
    {!settings.automaticPulls ? <p className="mt-2 text-sm text-accent">Automatic live checks are off. <Button variant="secondary" onClick={() => updatePullSettings({ automaticPulls: true })}>Enable automatic checks</Button></p>
      : settings.pauseWhileWatching && viewerOpen ? <p className="mt-2 text-xs text-muted">Live checks wait while a player or preview is open.</p>
      : paused ? <p className="mt-2 text-xs text-muted">{demand ? 'Bulk archive pulls are paused; live checks on this page remain enabled.' : 'Automatic live checks are paused with bulk pulls. Open Live to continue checking status.'}</p> : null}
    <BatchStatusAnnouncement id={String(scan?.startedAt ?? 0)} label={label+' live check'} phase={!scan?'idle':cooling?'waiting':busy?'running':'complete'} total={scan?.total} outcome={cooling?label+' is waiting for a provider cooldown. Saved results are retained. Use the live check controls after the wait.':scan?label+' live check '+(scan.status==='partial'?'partially complete':'complete')+'. '+scan.checked+' of '+scan.total+' creators checked; '+scan.broadcasts+' broadcasts; '+(scan.failed??0)+' need attention. Review check details or use Check all to retry.':''}/>
    {scan && <div className="mt-3">
      <p className="text-sm text-accent">{busy ? 'Checking' : scan.status === 'partial' ? 'Partial check' : scan.automatic ? 'Batch complete' : 'Check complete'} · {scan.checked.toLocaleString()} / {scan.total.toLocaleString()} creators · {scan.broadcasts.toLocaleString()} {scan.broadcasts === 1 ? 'broadcast' : 'broadcasts'}{scan.failed ? ` · ${scan.failed.toLocaleString()} unavailable` : ''}</p>
      <progress className="mt-2 h-2 w-full accent-accent" aria-label={label + ' live check progress'} max={Math.max(1, scan.total)} value={scan.checked} />
    </div>}
    {kind==='youtube' && <YoutubeLiveCoveragePanel coverage={coverage} scan={scan} now={Math.max(clock,Date.now())} retryAt={retryAt} onCheck={recheck} />}
    {actionError && <p role="alert" className="mt-2 text-xs leading-5 text-accent">{actionError}</p>}
    {coverage.failed > 0 && <details className="mt-3 border-t border-border pt-3">
      <summary className="min-h-11 cursor-pointer text-sm text-fg">{coverage.failed.toLocaleString()} latest {label} checks need attention</summary>
      <p className="mb-2 text-xs leading-5 text-muted">A failed attempt keeps the last successful observation. It does not confirm that a stream ended. Retry waits apply only to the affected creator unless the provider reports a cooldown.</p>
      <ul className="space-y-3">{coverage.failures.map(channel => <li key={channel.id} className="rounded-md border border-border p-3 text-xs leading-5">
        <a className="inline-flex min-h-11 items-center font-medium text-accent hover:underline" href={kind==='youtube'?`https://www.youtube.com/channel/${encodeURIComponent(channel.channelId ?? channel.id.slice(3))}`:`https://www.twitch.tv/${encodeURIComponent(channel.id.startsWith('tw:')?channel.id.slice(3):channel.handle)}`} target="_blank" rel="noopener noreferrer">{channel.title || channel.handle}</a>
        <p className="break-words text-muted">{channel.lastLiveFailure?.message}</p>
        <p className="text-muted">{channel.lastLiveFailure?.retryAt && channel.lastLiveFailure.retryAt > Date.now() ? `Retry after ${new Date(channel.lastLiveFailure.retryAt).toLocaleTimeString()}` : 'Ready to retry in the next due check.'}</p>
      </li>)}</ul>
      {coverage.failed > coverage.failures.length && <p className="mt-2 text-xs text-muted">Showing {coverage.failures.length} recent failures. Other creators continue in the rotation.</p>}
    </details>}
    {provisional.length > 0 && <details className="mt-3 border-t border-border pt-3">
      <summary className="min-h-11 cursor-pointer text-sm text-fg">{provisional.length.toLocaleString()} YouTube {provisional.length === 1 ? 'creator remains' : 'creators remain'} provisionally live</summary>
      <p className="mb-3 text-xs leading-5 text-muted">Incomplete listings and failed checks cannot confirm an ending. Viewer counts describe the last live observation. A complete negative observation starts the existing ten-minute hold.</p>
      <ul className="space-y-3">{provisional.slice(0,12).map(c=><li key={c.id} className="rounded-md border border-border p-3 text-xs leading-5">
        <p className="font-medium text-fg">{c.title || c.handle}</p>
        <p className="mt-1 text-muted">{c.youtubeLiveEvidence ? youtubeEvidenceExplanation(c.youtubeLiveEvidence) : 'The latest check did not establish a complete current broadcast listing.'}</p>
        {c.youtubeLiveEvidence && <p className="mt-1 text-muted">Evidence: {c.youtubeLiveEvidence.source} · {new Date(c.youtubeLiveEvidence.at).toLocaleTimeString()}</p>}
        {c.liveOfflineSince && <p className="mt-1 text-muted">Offline hold started {new Date(c.liveOfflineSince).toLocaleTimeString()}. Another complete check is required to move this stream out of Live.</p>}
        <Button className="mt-2" variant="secondary" disabled={busy || cooling || (c.lastLiveFailure?.retryAt ?? 0) > Math.max(clock,Date.now())} onClick={()=>void recheck(c.id)}>Recheck {c.title || c.handle}</Button>
        {(c.lastLiveFailure?.retryAt ?? 0) > Math.max(clock,Date.now()) && <p className="mt-1 text-muted">Retry after {new Date(c.lastLiveFailure!.retryAt!).toLocaleTimeString()}</p>}
      </li>)}</ul>
      {provisional.length > 12 && <p className="mt-2 text-xs text-muted">Showing 12 creators. The remaining creators keep their place in the normal live-check rotation.</p>}
    </details>}
    {kind==='twitch' && follows.some(c=>c.kind==='twitch'&&c.lastLiveWarning&&c.lastLiveWarning.at>=(c.lastLiveFailure?.at??0)) && <details className="mt-3 border-t border-border pt-3"><summary className="min-h-11 cursor-pointer text-sm text-fg">Twitch optional metadata warnings</summary><p className="text-xs leading-5 text-muted">These checks verified stream state and viewer counts. Optional titles, game labels or artwork may be missing.</p><ul className="mt-2 space-y-2 text-xs text-muted">{follows.filter(c=>c.kind==='twitch'&&c.lastLiveWarning&&c.lastLiveWarning.at>=(c.lastLiveFailure?.at??0)).slice(0,12).map(c=><li key={c.id}><span className="font-medium text-fg">{c.title||c.handle}: </span>{c.lastLiveWarning?.message}</li>)}</ul></details>}
    {cooling && <p className="mt-2 text-xs leading-5 text-accent">{label} asked to wait until {new Date(retryAt).toLocaleTimeString()}. Saved broadcasts and unchecked creators are retained.</p>}
    {source === 'live' && <p className="mt-2 text-xs font-medium text-accent">Live page priority · automatic archive pulls wait while this page is open. Live status and room pages continue updating.</p>}
    <p className="mt-2 text-xs leading-5 text-muted">{kind === 'youtube' ? 'YouTube checks three small batches of up to 8 creators independently, with at most 8 public reads running across them. Healthy batches can finish while another is slow. Live reads start at least 80ms apart, independently of the archive delay.' : 'Twitch rotates through the full follow list in bounded turns, returning up to 12 creators per response with two requests in flight. Healthy responses publish while another is slow.'} This page continues checking while visible, including when idle. Viewer counts on unconfirmed cards describe the last observation. Failed and unchecked channels keep their previous status. Provider cooldowns still apply.</p>
  </section>;
}
