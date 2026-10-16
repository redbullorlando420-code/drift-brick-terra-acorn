import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLibrary } from '@/lib/videos/store';
import { DEFAULT_PULL_SETTINGS, getPullSettings, subscribePullSettings, updatePullSettings, type PullSettings } from '@/lib/pull-settings';
import { cancelQueuedPulls, getPullQueueSnapshot, pullsPaused, setPullsPaused, subscribePullControl, subscribePullQueue } from '@/lib/pull-control';
import { remoteEntryCounts, type EntryCounts } from '@/lib/videos/entry-limits';
import { CLEANUP_GROUPS, cleanupLabel, cleanupPolicy, type CleanupGroup } from '@/lib/videos/youtube-cleanup';
const entryFields = [['remoteMaxEntries', 'All remote entries', 'total'], ['youtubeMaxEntries', 'YouTube', 'youtube'], ['twitchMaxEntries', 'Twitch', 'twitch'], ['adultMaxEntries', 'Adults (including booru and live)', 'adult'], ['otherMaxEntries', 'Other remote providers', 'other']] as const;
const fields: Array<[keyof PullSettings, string, number, number, number]> = [
  ['requestGapMs', 'Minimum gap between pull jobs (ms)', 250, 60000, 250],
  ['youtubeRequestGapMs', 'YouTube gap between archive requests (ms)', 0, 60000, 10],
  ['concurrentRequests', 'Concurrent catalog requests', 1, 3, 1],
  ['youtubeBatchVideos', 'YouTube entries per creator batch (target)', 30, 500, 10],
  ['youtubeSourcesPerSweep', 'YouTube sources per archive sweep', 1, 1024, 1],
  ['youtubeIntervalSeconds', 'YouTube automatic sweep interval (seconds)', 60, 3600, 30],
  ['adultBatchVideos', 'Adult entries per pull, across selected providers', 20, 10000, 100],
  ['adultIntervalSeconds', 'Adult automatic pull interval (seconds)', 30, 3600, 30],
  ['adultCatalogTarget', 'Adult automatic catalog target', 1000, 1000000, 1000],
];
export function PullSettingsPanel() {
  const settings = useSyncExternalStore(subscribePullSettings, getPullSettings, () => DEFAULT_PULL_SETTINGS);
  const queue = useSyncExternalStore(subscribePullQueue, getPullQueueSnapshot, getPullQueueSnapshot);
  const paused = useSyncExternalStore(subscribePullControl, pullsPaused, () => false);
  const processing = useLibrary(state => state.remoteBusy || state.refreshing);
  useEffect(() => {
    try {
      if (sessionStorage.getItem('reelcase.settings-section') !== 'youtube-cleanup') return;
      sessionStorage.removeItem('reelcase.settings-section');
      const frame = requestAnimationFrame(() => document.querySelector('[data-youtube-cleanup]')?.scrollIntoView({ block: 'start' }));
      return () => cancelAnimationFrame(frame);
    } catch { /* The settings page remains usable without a jump hint. */ }
  }, []);
  return <section className="mt-6 rounded-xl border border-border bg-elevated p-5 shadow-border" aria-labelledby="pull-settings-title">
    <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Pull management</p>
    <h2 id="pull-settings-title" className="mt-2 font-display text-2xl text-fg">Control the pace of your catalog.</h2>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Larger pulls walk saved archive pages through small requests. YouTube page pacing is separate from the gap between pull jobs and defaults to 80ms. Set it to zero for no added wait between completed requests, or raise it when you want slower pulling. Adult pulls default to 2,000 entries and can target up to 10,000. Provider availability and duplicate results can reduce the number of new entries.</p>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Button onClick={() => setPullsPaused(!paused)}>{paused ? 'Resume pulling' : 'Pause pulling'}</Button>
      <Button variant="secondary" disabled={!processing && !queue.active && !queue.waiting} onClick={cancelQueuedPulls}>Cancel current pull queue</Button>
      <span className="text-xs text-muted" role="status">{queue.active} active · {queue.waiting} queued{queue.held ? ' · waiting for browsing to settle' : processing && !queue.active && !queue.waiting ? ' · preparing catalog batch' : ''}</span>
    </div>
    <EntryLimitSettings settings={settings} />
    {CLEANUP_GROUPS.map(group => <YoutubeCleanupSettings key={group} settings={settings} group={group} />)}
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {fields.map(([key, label, min, max, step]) => <label key={key} className="text-xs leading-5 text-muted" htmlFor={`pull-${key}`}>{label}<Input id={`pull-${key}`} className="mt-2 min-h-11" type="number" min={min} max={max} step={step} defaultValue={String(settings[key])} key={`${key}:${settings[key]}`} onBlur={event => { if (event.target.value.trim()) updatePullSettings({ [key]: Number(event.target.value) }); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} /></label>)}
    </div>
    <div className="mt-5 flex flex-wrap gap-3">
      <Button variant="secondary" onClick={() => updatePullSettings({ adultBatchVideos: 2000 })}>Adult pulls: 2,000</Button>
      <Button variant="secondary" onClick={() => updatePullSettings({ adultBatchVideos: 10000 })}>Adult pulls: 10,000</Button>
      <label className="flex min-h-11 items-center gap-2 text-sm text-fg"><input type="checkbox" checked={settings.automaticPulls} onChange={event => updatePullSettings({ automaticPulls: event.target.checked })} />Automatic catalog pulls</label>
      <label className="flex min-h-11 items-center gap-2 text-sm text-fg"><input type="checkbox" checked={settings.pauseWhileWatching} onChange={event => updatePullSettings({ pauseWhileWatching: event.target.checked })} />Hold catalog pulls while a preview or player is open</label>
    </div>
    <p className="mt-3 text-xs leading-5 text-muted">YouTube finishes a provider page before saving its next cursor, so a batch may round up by one page. Adult limits cover all selected providers. Hidden tabs hold catalog work. Cancel stops later batches and discards outstanding responses; a provider request already sent may finish. Preview recommendations use at most 4,096 entries, with descriptions and comments loaded for the selected video.</p>
  </section>;
}

function EntryLimitSettings({ settings }: { settings: Readonly<PullSettings> }) {
  const videos = useLibrary(state => state.videos);
  const [usage, setUsage] = useState<{ videos: typeof videos; counts: EntryCounts } | null>(null);
  const [saved, setSaved] = useState('');
  useEffect(() => { let active = true; void remoteEntryCounts(videos).then(counts => { if (active) setUsage({ videos, counts }); }); return () => { active = false; }; }, [videos]);
  const counts = usage?.videos === videos ? usage.counts : null;
  return <div className="mt-6 border-y border-border py-5" aria-labelledby="entry-limits-title">
    <h3 id="entry-limits-title" className="text-lg font-medium text-fg">Saved entry limits</h3>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">New entries stay within the source and combined caps. YouTube, Twitch and Adults replace small batches of eligible old entries. Successful pulls recover lowered caps gradually and keep rejected pages queued. Zero holds new entries for that source. Protected videos and local files stay.</p>
    <label className="mt-3 flex min-h-11 items-center gap-2 text-sm text-fg"><input type="checkbox" checked={settings.sharedCapCleanup} onChange={event => updatePullSettings({ sharedCapCleanup: event.target.checked })} />Allow shared-cap replacement across enabled sources</label>
    <p className="mt-1 max-w-3xl text-xs leading-5 text-muted">When the combined cap blocks a pull, another enabled cache can donate eligible slots using its own remaining replacement budget. This never bypasses the incoming source's cap or deletes entries from a source with cleanup switched off.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entryFields.map(([key, label, group]) => <label key={key} htmlFor={`pull-${key}`} className="min-w-0 text-xs leading-5 text-muted">
        {label}<Input id={`pull-${key}`} className="mt-2 min-h-11" type="number" min={0} max={1000000} step={1000} defaultValue={settings[key]} key={`${key}:${settings[key]}`} onBlur={event => {
          if (!event.target.value.trim() || !Number.isFinite(Number(event.target.value))) return;
          updatePullSettings({ [key]: Number(event.target.value) }); setSaved(`${label} limit saved.`);
        }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
        <span className="mt-1 block">{counts ? `${counts[group].toLocaleString()} stored / ${settings[key].toLocaleString()} max${counts[group] >= settings[key] ? settings.remoteMaxEntries > 0 && CLEANUP_GROUPS.some(source => (group === source || group === 'total') && settings[`${source}MaxEntries`] > 0 && cleanupPolicy(settings, source).enabled) ? ' · eligible old entries can be replaced' : ' · new entries held' : ''}` : 'Counting stored entries...'}</span>
      </label>)}
    </div>
    <p className="mt-3 text-xs leading-5 text-muted">Includes saved, hidden, and live remote entries. Local files are excluded. Limits control catalog growth, rather than a fixed number of memory bytes.</p>
    <p className="mt-1 min-h-5 text-xs text-accent" role="status">{saved}</p>
  </div>;
}

function YoutubeCleanupSettings({ settings, group }: { settings: Readonly<PullSettings>; group: CleanupGroup }) {
  const cleanup = useLibrary(s => s.cleanupRemoteCache), journal = useLibrary(s => s.youtubeCleanup);
  const note = useLibrary(s => s.cleanupNotes[group] ?? ''), processing = useLibrary(s => s.remoteBusy || s.refreshing);
  const [error, setError] = useState('');
  const label = cleanupLabel(group), policy = cleanupPolicy(settings, group);
  const stats = journal.groups?.[group];
  const earlierCount = Math.max(0, journal.removedCount - CLEANUP_GROUPS.reduce((sum, source) => sum + (journal.groups?.[source]?.removedCount ?? 0), 0));
  const batchKey = `${group}CleanupBatch` as const, ageKey = `${group}CleanupMinAgeDays` as const;
  const run = async () => { setError(''); try { await cleanup(group); } catch (cause) { setError(cause instanceof Error ? cause.message : 'Cleanup could not be completed.'); } };
  return <div {...{ [`data-${group}-cleanup`]: '' }} className="mt-5 scroll-mt-6 rounded-lg border border-border bg-bg/40 p-4" aria-labelledby={`${group}-cleanup-title`}>
    <h3 id={`${group}-cleanup-title`} className="text-lg font-medium text-fg">{label} cache cleanup</h3>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">At the cap, replace unrated and 1–2-star videos, oldest first within each group. Likes, favorites, 3–5-star ratings, live/upcoming and open videos stay. Keeps watch history, saved links, archive positions, custom metadata and a video from each source.</p>
    <label className="mt-3 flex min-h-11 items-center gap-2 text-sm text-fg"><input type="checkbox" checked={policy.enabled} onChange={event => updatePullSettings({ [`${group}AutoCleanup`]: event.target.checked })} />Automatically make room for new {label} pulls</label>
    <div className="mt-3 grid gap-4 sm:grid-cols-2">
      <label className="text-xs leading-5 text-muted" htmlFor={`pull-${batchKey}`}>Maximum entries replaced per pull<Input id={`pull-${batchKey}`} className="mt-2" type="number" min={1} max={1000} defaultValue={policy.batch} key={policy.batch} onBlur={event => { if (event.target.value.trim()) updatePullSettings({ [batchKey]: Number(event.target.value) }); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} /></label>
      <label className="text-xs leading-5 text-muted" htmlFor={`pull-${ageKey}`}>Minimum {group === 'youtube' ? 'publication' : 'entry'} age (days)<Input id={`pull-${ageKey}`} className="mt-2" type="number" min={0} max={3650} defaultValue={policy.minAgeDays} key={policy.minAgeDays} onBlur={event => { if (event.target.value.trim()) updatePullSettings({ [ageKey]: Number(event.target.value) }); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} /></label>
    </div>
    <p className="mt-3 text-xs leading-5 text-muted">Automatic cleanup runs only after new entries arrive. Failed or duplicate-only pulls remove nothing. Unknown dates stay. This source's budget covers the entire pull, including any slots donated to another enabled source. Partially accepted pages keep their resume position. If too few entries qualify, pulls hold at the cap. An age of 0 allows recent unrated and low-rated entries to rotate; saved-video protections still apply.</p>
    {group === 'adult' && <p className="mt-2 text-xs leading-5 text-muted">Automatic Adult discovery also rotates at its catalog target, even when the source entry limit is higher. Manual pulls use the full source limit.</p>}
    {group !== 'youtube' && <p className="mt-2 text-xs leading-5 text-muted">Entry age uses the provider's publication date when available, otherwise the date the entry was cached.</p>}
    <div className="mt-3 flex flex-wrap items-center gap-3"><Button variant="secondary" className="h-auto min-h-11 max-w-full whitespace-normal py-2" disabled={processing} onClick={() => void run()}>Free up to {policy.batch.toLocaleString()} {label} slots now</Button><span className="text-xs text-muted">{(stats?.removedCount ?? 0).toLocaleString()} entries removed{stats?.lastAt ? ` · last cleanup: ${new Date(stats.lastAt).toLocaleString()}` : ''}</span></div>
    {earlierCount > 0 && <p className="mt-2 text-xs text-muted">Earlier shared cleanup history: {earlierCount.toLocaleString()} removals. New cleanups are counted separately for each source.</p>}
    {(error || note) && <p role={error ? 'alert' : 'status'} className="mt-3 text-sm leading-6 text-muted">{error || note}</p>}
  </div>;
}
