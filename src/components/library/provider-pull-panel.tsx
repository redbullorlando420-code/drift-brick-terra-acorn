import { youtubeRecovery, type YoutubeLane } from '@/lib/videos/youtube-recovery';
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLibrary } from "@/lib/videos/store";
import { selectRecentPullChannels } from "@/lib/videos/recent-pull";
import { selectYoutubeSweepChannels } from "@/lib/remote/youtube-sweep";
import { selectTwitchRefreshBatch } from "@/lib/videos/twitch-refresh-selection";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
export function ProviderPullPanel({ kind }: {
    kind: "youtube" | "twitch";
}) {
    const follows = useLibrary((state) => state.follows), refresh = useLibrary((state) => state.refreshFollows), refreshing = useLibrary((state) => state.refreshing), remoteBusy = useLibrary((state) => state.remoteBusy), active = useLibrary((state) => state.pullActivity);
    const channels = useMemo(() => follows.filter((row) => row.kind === kind && !row.importNeedsReview), [follows, kind]);
    const [creator, setCreator] = useState("all"), [busy, setBusy] = useState(false), [notice, setNotice] = useState(""), [recentBatch, setRecentBatch] = useState(24);
    const mounted = useRef(true);
    useEffect(() => {
        mounted.current = true;
        return () => {
            mounted.current = false;
        };
    }, []);
    const name = kind === "youtube" ? "YouTube" : "Twitch";
    const checked = channels.filter((row) => row.recentPull?.checkedAt).length, failed = channels.filter((row) => row.recentPull?.failure);
    const archives = channels.filter((row) => kind === "youtube" ? row.catalogCursor : row.twitchArchiveCursor).length;
    const start = async (archive: boolean) => {
        if (busy || refreshing || remoteBusy)
            return;
        const current = useLibrary.getState().follows, now = Date.now();
        const selected = creator !== "all"
            ? current.filter((row) => row.id === creator && row.kind === kind)
            : !archive
                ? selectRecentPullChannels(current, kind, now, recentBatch)
                : kind === "youtube"
                    ? selectYoutubeSweepChannels(current, now, 12, LIBRARY_LIMITS.youtubeCatalogRecheckExhaustedMs, { includePlaylists: true })
                    : selectTwitchRefreshBatch(current.filter((row) => row.kind === kind && !row.twitchArchiveExhaustedAt), 12, 0, "archive", now).channels;
        if (!selected.length) {
            setNotice("No eligible creators in this lane. Retry waits apply to the affected creator; completed archives keep their saved end position.");
            return;
        }
        setBusy(true);
        setNotice(archive
            ? "Continuing saved older-video positions…"
            : "Checking recent uploads in small batches…");
        try {
            const result = await refresh(kind, {
                channelIds: selected.map((row) => row.id),
                ...(archive
                    ? kind === "youtube"
                        ? { catalog: true }
                        : { twitchContinueArchive: true }
                    : kind === "twitch"
                        ? { twitchRoutine: true }
                        : {}),
            });
            if (!mounted.current)
                return;
            setNotice(result.pull
                ? result.pull.done +
                    " / " +
                    result.pull.total +
                    " creators checked · " +
                    result.pull.received.toLocaleString() +
                    " returned · " +
                    result.pull.added.toLocaleString() +
                    " newly saved · " +
                    result.pull.failed +
                    " need attention" +
                    (result.pull.errors?.[0] ? ". " + result.pull.errors[0] : ".")
                : result.skipped === "cooldown"
                    ? "This lane is waiting for the provider retry time. Saved results and archive positions are kept."
                    : result.skipped === "busy"
                        ? "Another pull owns this lane. Try again after it finishes."
                        : "No eligible creators; check retry waits or add a verified channel.");
        }
        catch (error) {
            if (mounted.current)
                setNotice(error instanceof Error
                    ? error.message
                    : "The pull could not finish. Saved results are kept.");
        }
        finally {
            if (mounted.current)
                setBusy(false);
        }
    };
    const recovery = kind === 'youtube' ? youtubeRecovery(channels) : [];
    const gaps = channels.filter(row => row.recentPull?.gap && row.recentPull.gap.status !== 'resolved');
    const scoped = async (id: string, lane: YoutubeLane | 'repair') => {
        if (busy || refreshing || remoteBusy)
            return;
        setBusy(true);
        setNotice(lane === 'repair' ? 'Repairing up to two complete upload pages (target 100), independently of your older archive position…' : 'Checking the selected ' + lane + ' lane…');
        try {
            const result = await refresh('youtube', { channelIds: [id], ...(lane === 'repair' ? { youtubeFeedRepair: true } : lane === 'catalog' ? { catalog: true } : lane === 'live' ? { youtubeLiveOnly: true } : {}) });
            if (mounted.current) {
                const gap = useLibrary.getState().follows.find(c => c.id === id)?.recentPull?.gap;
                setNotice(lane === 'repair' && gap ? gap.status === 'resolved' ? 'Feed gap repaired: the saved upload watermark was found.' : gap.status === 'unresolved' ? 'The public archive ended without finding the old watermark. Saved videos remain available; this does not prove deletion.' : gap.error ?? 'This repair batch was saved. Continue the separate repair position when ready.' : result.pull ? result.pull.done + ' checked · ' + result.pull.received + ' returned · ' + result.pull.failed + ' need attention.' : 'This lane is waiting or another pull is active.');
            }
        }
        catch (e) {
            if (mounted.current)
                setNotice(e instanceof Error ? e.message : 'The selected lane could not finish. Saved results are kept.');
        }
        finally {
            if (mounted.current)
                setBusy(false);
        }
    };
    return (<section aria-label={name + " pull control"} className="mb-5 rounded-lg border border-border bg-surface p-4">
      <h2 className="font-display text-xl text-fg">Fresh uploads. Saved archive progress.</h2>
      <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
        Recent uploads and older videos keep separate check times and retry state. Live checks use
        their own lane. A failed creator does not erase saved videos or reset an older-video
        position.
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-muted">
        {[
            ["Recent checks", checked + " / " + channels.length],
            ["Archive positions", archives],
            ["Recent checks need attention", failed.length],
        ].map(([label, value]) => (<div key={label} className="min-w-0 rounded-md bg-bg/45 p-3">
            <p>{label}</p>
            <p className="mt-1 text-lg text-fg">{value}</p>
          </div>))}
      </div>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="min-w-0 basis-full flex-1 text-xs text-muted sm:basis-auto">
          Creators
          <select aria-label={name + " pull creators"} className="mt-1 block min-h-11 w-full min-w-0 rounded-md border border-border bg-bg px-3 text-sm text-fg" disabled={busy || refreshing || remoteBusy} value={creator} onChange={(event) => setCreator(event.target.value)}>
            <option value="all">Next eligible creators · oldest attempt first</option>
            {channels.map((row) => (<option key={row.id} value={row.id}>
                {row.title}
              </option>))}
          </select>
        </label>
        <label className="text-xs text-muted">Recent creator batch<select aria-label={name + ' recent creator batch'} className="mt-1 block min-h-11 rounded-md border border-border bg-bg px-3 text-sm text-fg" disabled={busy || refreshing || remoteBusy || creator !== 'all'} value={recentBatch} onChange={e => setRecentBatch(Number(e.target.value))}>{[12, 24, 50, 100].map(n => <option key={n} value={n}>{n} creators</option>)}</select></label>
        <Button className="min-h-11" disabled={busy || refreshing || remoteBusy || !channels.length} onClick={() => void start(false)}>
          Check recent uploads
        </Button>
        <Button variant="secondary" className="min-h-11" disabled={busy || refreshing || remoteBusy || !channels.length} onClick={() => void start(true)}>
          Continue older videos
        </Button>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">
        Recent checks send up to four creators per response, with at most two responses in preparation and existing provider request limits. Completed healthy responses share one catalog merge when ready. Creators rotate across the full follow list and save their own progress. Older pulls
        use the existing archive budgets and saved continuations. Pause or cancel using the app’s
        Pull controls.
      </p>
      {active?.provider === kind && refreshing && (<p role="status" className="mt-3 text-sm text-accent">
          {active.done} / {active.total} creators · {active.received.toLocaleString()} returned
        </p>)}
      {notice && (<p role="status" className="mt-3 text-sm text-accent">
          {notice}
        </p>)}
      {kind === 'youtube' && gaps.length > 0 && <section data-feed-gap-repair className="mt-4 rounded-lg border border-border p-3"><h3 className="font-medium text-fg">Possible feed gaps · {gaps.length}</h3><p className="mt-1 text-xs leading-5 text-muted">The saved watermark fell outside YouTube’s short RSS window. This can miss uploads; it does not mean a video was deleted. Repair reads up to two complete upload pages per action (target 100 uploads) and keeps your normal archive position intact.</p><ul className="mt-3 space-y-3">{gaps.slice(0, 8).map(row => { const gap = row.recentPull!.gap!, state = recovery.find(r => r.channel.id === row.id); return <li key={row.id} className="flex flex-wrap items-center justify-between gap-3"><div className="min-w-0"><p className="break-words text-sm text-fg">{row.title}</p><p className="text-xs text-muted">{gap.status === 'detected' ? 'Gap detected' : gap.status === 'unresolved' ? 'Watermark unresolved' : 'Repair partially saved'} · {gap.recovered} upload observations recovered{busy && active?.targets.includes(row.title) ? ' · repairing…' : ''}</p>{gap.error && <p className="mt-1 text-xs text-muted">{gap.error}</p>}</div><Button className="min-h-11" variant="secondary" disabled={busy || refreshing || remoteBusy || state?.lanes.catalog.waiting} onClick={() => void scoped(row.id, 'repair')}>{gap.cursor ? 'Continue feed repair' : 'Repair feed gap'}</Button></li>; })}</ul>{gaps.length > 8 && <p className="mt-2 text-xs text-muted">{gaps.length - 8} more creators have saved gaps. Repair these first to reveal the next group.</p>}</section>}
      {kind === 'youtube' && recovery.some(row => row.hasFailure) && <details data-youtube-endpoint-recovery className="mt-4 rounded-lg border border-border p-3"><summary className="min-h-11 cursor-pointer text-sm text-fg">YouTube endpoint recovery</summary><p className="mt-1 text-xs leading-5 text-muted">Feed, archive and live checks have separate retry waits. A provider-wide block holds every affected lane. Trying a healthy lane does not clear another lane’s cooldown.</p><Button className="mt-2 min-h-11" variant="secondary" onClick={() => setNotice('Retry status refreshed at ' + new Date().toLocaleTimeString())}>Refresh retry status</Button><ul className="mt-3 space-y-4">{recovery.filter(row => row.hasFailure).slice(0, 8).map(({ channel, lanes, globalUntil }) => <li key={channel.id}><p className="break-words font-medium text-fg">{channel.title}</p>{[channel.recentPull?.failure, channel.lastProviderFailure, channel.lastLiveFailure].filter(f => f && (f.cooldownScope === 'page' || f.cooldownScope === 'details')).map((f, i) => <p key={i} className="mt-1 text-xs text-muted">{f!.cooldownScope === 'page' ? 'Public HTML page' : 'Video details'}: {f!.message}{f!.retryAt ? ' · Retry after ' + new Date(f!.retryAt).toLocaleTimeString() : ''}. Verified creator feed, archive and live lanes remain separate.</p>)}{globalUntil > Date.now() && <p className="text-xs text-accent">Provider-wide wait until {new Date(globalUntil).toLocaleTimeString()}</p>}<div className="mt-2 grid gap-2 lg:grid-cols-3">{(['feed', 'catalog', 'live'] as const).map(lane => { const item = lanes[lane], observed = lane === 'feed' ? channel.recentPull?.checkedAt : lane === 'live' ? channel.liveCheckedAt : channel.cache?.scope === 'catalog' ? channel.cache.at : undefined; return <div key={lane} className="rounded-md bg-bg p-3 text-xs text-muted"><p className="font-medium capitalize text-fg">{lane === 'catalog' ? 'Archive' : lane}</p><p className="mt-1">Last successful observation: {observed ? new Date(observed).toLocaleString() : 'Not recorded'}</p>{lane === 'feed' && channel.recentPull?.attemptedAt && <p>Last attempt: {new Date(channel.recentPull.attemptedAt).toLocaleString()}</p>}{item.failure && <p className="mt-1">{item.failure.message}</p>}<p className="mt-1">{item.waiting ? 'Retry after ' + new Date(item.retryAt).toLocaleTimeString() : 'Ready for an explicit check'}</p><Button variant="secondary" className="mt-2 min-h-11" disabled={busy || refreshing || remoteBusy || item.waiting} onClick={() => void scoped(channel.id, lane)}>{lane === 'feed' ? 'Retry recent feed' : lane === 'catalog' ? 'Continue healthy archive' : 'Check live lane'}</Button></div>; })}</div></li>)}</ul></details>}
      {failed.length > 0 && (<details className="mt-3 text-xs text-muted">
          <summary className="min-h-11 cursor-pointer">
            Recent upload checks needing attention · {failed.length}
          </summary>
          <ul className="space-y-3">
            {failed.slice(0, 8).map((row) => (<li key={row.id}>
                <p className="font-medium text-fg">{row.title}</p>
                <p>{row.recentPull?.failure?.message}</p>
                {row.recentPull?.retryAt && (<p>
                    Retry after {new Date(row.recentPull.retryAt).toLocaleTimeString()} · saved
                    results kept
                  </p>)}
              </li>))}
          </ul>
          {failed.length > 8 && (<p className="mt-2">{failed.length - 8} more creators have a saved retry wait.</p>)}
        </details>)}
    </section>);
}
