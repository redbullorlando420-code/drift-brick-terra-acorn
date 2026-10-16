import { memo, useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { scheduleNavigationWork } from '@/lib/navigation-work';
import { useLibrary } from '@/lib/videos/store';
import type { FollowedChannel } from '@/lib/videos/types';
import { TwitchArchiveDiagnostics } from './twitch-archive-diagnostics';
import { createTwitchPullQueue, TWITCH_FOCUSED_QUEUE_LIMIT } from '@/lib/twitch-pull-queue';
import { getPullCancellationRevision, pullsPaused, subscribePullControl, waitForCatalogCommit } from '@/lib/pull-control';

async function waitForQueueTurn(signal: AbortSignal, revision: number) {
  await waitForCatalogCommit(revision, signal);
  await new Promise<void>((resolve, reject) => {
    let unsubscribe = () => {};
    const cleanup = () => { unsubscribe(); signal.removeEventListener('abort', check); };
    const check = () => {
      if (signal.aborted) { cleanup(); reject(new Error('Queue cancelled')); return; }
      const state = useLibrary.getState();
      if (!state.remoteBusy && !state.refreshing) { cleanup(); resolve(); }
    };
    unsubscribe = useLibrary.subscribe(check); signal.addEventListener('abort', check, { once: true }); check();
  });
  await waitForCatalogCommit(revision, signal);
}

export type TwitchArchiveCreator = Pick<FollowedChannel, 'id' | 'handle' | 'lastCheckedAt' | 'lastResponseCount' | 'lastProviderFailure' | 'lastLiveFailure' | 'twitchLiveRetry' | 'twitchArchiveRetry' | 'twitchArchiveCursor' | 'twitchClipCursor' | 'twitchClipExhaustedAt' | 'twitchArchiveExhaustedAt' | 'twitchArchiveLastVideoId' | 'twitchArchiveDiagnostics'> & {
  name: string; count: number; clips: number; oldest: number; newest: number; retryAt?: number;
};
const Creator = memo(function Creator({ channel, refreshing, queued, full, stopping, onQueue, onRemove }: {
  channel: TwitchArchiveCreator; refreshing: boolean; queued: boolean; full: boolean; stopping: boolean; onQueue: (channel: TwitchArchiveCreator) => void; onRemove: (id: string) => void;
}) {
  return <div className="rounded-sm bg-bg/45 p-3" style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 320px' }}>
    <div className="flex flex-col items-start gap-3"><div className="min-w-0 w-full">
      <p className="truncate text-sm font-medium text-fg">{channel.name}</p>
      <p className="mt-1 text-xs text-muted">{channel.count.toLocaleString()} cached VODs · {channel.clips} confirmed clip{channel.clips === 1 ? '' : 's'} · last result {channel.lastResponseCount ?? 0} rows</p>
      <p className="mt-1 text-xs text-muted">{channel.oldest > 0 && channel.oldest <= channel.newest && Number.isFinite(new Date(channel.newest).getTime()) ? `${new Date(channel.oldest).toLocaleDateString()} – ${new Date(channel.newest).toLocaleDateString()}` : 'No archive dates yet'} · public depth may be limited</p>
      <p className="mt-1 text-xs text-muted">{channel.twitchArchiveCursor ? 'Archive continuation saved' : channel.twitchArchiveExhaustedAt ? 'Available shelves exhausted' : 'Deep archive not started'} · {channel.lastProviderFailure ? `${channel.lastProviderFailure.message} · ${channel.lastProviderFailure.recovery}` : channel.lastCheckedAt ? `Checked ${new Date(channel.lastCheckedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}` : 'Not checked yet'}</p>
      {channel.retryAt && channel.retryAt > Date.now() && <p className="mt-1 text-xs text-accent">Cooldown until {new Date(channel.retryAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</p>}
      {channel.twitchArchiveRetry && <p className="mt-1 text-xs text-muted">Archive retry {channel.twitchArchiveRetry.attempts} · explicit retry is available below.</p>}
      <p className="mt-1 text-xs text-muted">{channel.twitchClipCursor ? 'Clip continuation saved' : channel.twitchClipExhaustedAt ? 'Available clip shelf exhausted' : 'Focused clip shelf not started'}</p>
      {channel.lastLiveFailure && <p className="mt-1 text-xs text-muted">Live check: {channel.lastLiveFailure.message} · {channel.lastLiveFailure.recovery}</p>}
      {channel.twitchLiveRetry && channel.twitchLiveRetry.retryAt > Date.now() && <p className="mt-1 text-xs text-muted">Live retry recommended after {new Date(channel.twitchLiveRetry.retryAt).toLocaleTimeString()}</p>}
      <TwitchArchiveDiagnostics channel={channel} />
    </div><div className="flex flex-wrap gap-2"><Button className="min-h-11" size="sm" variant="secondary" disabled={refreshing || queued || full || stopping} onClick={() => onQueue(channel)}>{refreshing ? 'Pulling…' : queued ? 'Queued' : channel.lastProviderFailure ? 'Retry this creator' : channel.twitchArchiveExhaustedAt ? 'Pull again' : 'Queue deep pull'}</Button><a className="inline-flex min-h-11 items-center px-2 text-xs text-accent hover:underline" href={`https://www.twitch.tv/${encodeURIComponent(channel.handle)}`} target="_blank" rel="noreferrer">Open creator</a>{queued && <Button className="min-h-11" size="sm" variant="ghost" onClick={() => onRemove(channel.id)}>Remove from queue</Button>}</div></div>
  </div>;
});

/** Keep creator paging outside the library root. Incremental batches cross a
 * paint boundary, and collapsing releases both the work and mounted cards. */
export function TwitchArchiveCreators({ channels }: {
  channels: TwitchArchiveCreator[];
}) {
  const root = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [visible, setVisible] = useState(30);
  const [target, setTarget] = useState(30);
  const [vodLimit, setVodLimit] = useState(2000);
  const [clipLimit, setClipLimit] = useState(0);
  const [queue] = useState(() => createTwitchPullQueue({
    revision: getPullCancellationRevision,
    wait: waitForQueueTurn,
    live: async () => { await useLibrary.getState().refreshFollows('twitch', { twitchLiveOnly: true }); },
    pull: async job => {
      await useLibrary.getState().followRemoteQuery(job.handle, 'twitch', { twitchVodLimit: job.vodLimit, clipLimit: job.clipLimit });
      const saved = useLibrary.getState().follows.find(channel => channel.id === job.id);
      return `${job.name}: ${saved?.lastResponseCount ?? 0} rows returned${saved?.lastProviderFailure ? ` · ${saved.lastProviderFailure.message}` : ' · batch saved'}.`;
    },
  }));
  const state = useSyncExternalStore(queue.subscribe, queue.snapshot, queue.snapshot);
  const paused = useSyncExternalStore(subscribePullControl, pullsPaused, () => false);
  const full = state.waiting.length + Number(Boolean(state.active)) >= TWITCH_FOCUSED_QUEUE_LIMIT;
  const enqueue = (channel: TwitchArchiveCreator) => queue.enqueue({ id: channel.id, handle: channel.handle, name: channel.name, vodLimit, clipLimit });
  useEffect(() => () => queue.stop(), [queue]);
  const viewerOpen = useLibrary(state => Boolean(state.activeId || state.previewId));
  useEffect(() => {
    const details = root.current?.closest('details');
    if (!details) return;
    const sync = () => { setExpanded(details.open); if (!details.open) { setVisible(30); setTarget(30); } };
    details.addEventListener('toggle', sync); sync();
    return () => details.removeEventListener('toggle', sync);
  }, []);
  const end = Math.min(target, channels.length);
  useEffect(() => {
    if (!expanded || viewerOpen || visible >= end) return;
    return scheduleNavigationWork(() => setVisible(value => Math.min(end, value + 10)));
  }, [expanded, viewerOpen, visible, end]);
  return <div ref={root}>{expanded && <>
    <div data-twitch-pull-controls className="mt-4 rounded-sm bg-bg/45 p-3">
      <p className="text-sm font-medium text-fg">Focused archive queue</p>
      <p className="mt-1 text-xs text-muted">One batch per creator, up to eight creators. Live checks run before each batch. Saved positions resume on the next pull; pause and viewer controls hold waiting work.</p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-xs text-muted">VODs per creator<select aria-label="Twitch focused VOD budget" className="mt-1 block min-h-11 rounded-sm border border-border bg-bg px-3 text-fg" value={vodLimit} onChange={event => setVodLimit(Number(event.target.value))}><option value={500}>Up to 500 VODs</option><option value={2000}>Up to 2,000 VODs</option></select></label>
        <label className="text-xs text-muted">Clips per creator<select aria-label="Twitch focused clip budget" className="mt-1 block min-h-11 rounded-sm border border-border bg-bg px-3 text-fg" value={clipLimit} onChange={event => setClipLimit(Number(event.target.value))}><option value={0}>Skip clips</option>{[50, 250, 500].map(count => <option key={count} value={count}>Up to {count} clips</option>)}</select></label>
        <Button className="min-h-11" size="sm" variant="secondary" disabled={full || state.stopping} onClick={() => { for (const channel of channels) { if ((!channel.twitchArchiveExhaustedAt || clipLimit > 0 && !channel.twitchClipExhaustedAt) && !(channel.retryAt && channel.retryAt > Date.now())) enqueue(channel); if (queue.snapshot().waiting.length + Number(Boolean(queue.snapshot().active)) >= TWITCH_FOCUSED_QUEUE_LIMIT) break; } }}>Queue next 8 creators</Button>
        {(state.active || state.waiting.length > 0 || state.stopping) && <Button className="min-h-11" size="sm" variant="ghost" disabled={state.stopping} onClick={queue.stop}>{state.active ? 'Stop after this batch' : 'Clear queue'}</Button>}
      </div>
      <p className="mt-3 text-xs text-accent" role="status" data-twitch-queue-status>{state.stopping ? 'Stopping…' : paused ? 'Paused' : state.active ? `Pulling ${state.active.name}` : 'Ready'} · {state.waiting.length} waiting · {state.active ? `${state.active.vodLimit.toLocaleString()} VOD / ${state.active.clipLimit} clip budget` : `${vodLimit.toLocaleString()} VOD / ${clipLimit} clip budget for new jobs`}</p>
      {state.waiting.length > 0 && <ul className="mt-2 space-y-1" aria-label="Waiting Twitch creators">{state.waiting.map(job => <li key={job.id} className="flex items-center justify-between gap-2 text-xs text-muted"><div className="min-w-0"><span className="block truncate">{job.name}</span><span className="mt-1 block text-subtle">{job.vodLimit.toLocaleString()} VODs / {job.clipLimit} clips</span></div><Button className="min-h-11 shrink-0" size="sm" variant="ghost" aria-label={`Remove ${job.name} from queue`} onClick={() => queue.remove(job.id)}>Remove</Button></li>)}</ul>}
      {state.message && <p className="mt-2 text-xs text-muted" role="status">{state.message}</p>}
    </div>
    <div data-twitch-archive-creators className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">{channels.slice(0, visible).map(channel => <Creator key={channel.id} channel={channel} refreshing={state.active?.id === channel.id} queued={state.waiting.some(job => job.id === channel.id)} full={full} stopping={state.stopping} onQueue={enqueue} onRemove={queue.remove} />)}</div>
    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted">
      <span role="status">Showing {Math.min(visible, channels.length)} of {channels.length} creators{visible < end ? ' · loading more…' : ''}</span>
      {target < channels.length && <Button size="sm" variant="secondary" disabled={visible < end} onClick={() => setTarget(value => Math.min(channels.length, value + 100))}>Show 100 more creators</Button>}
      {target > 30 && <Button size="sm" variant="ghost" onClick={() => { setVisible(30); setTarget(30); }}>Show fewer creators</Button>}
    </div>
  </>}</div>;
}
