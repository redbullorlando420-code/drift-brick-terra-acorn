import { useEffect, useState, useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLibrary } from '@/lib/videos/store';
import { DEFAULT_PULL_SETTINGS, getPullSettings, subscribePullSettings, updatePullSettings, type PullSettings } from '@/lib/pull-settings';
import { cancelQueuedPulls, getPullQueueSnapshot, pullsPaused, setPullsPaused, subscribePullControl, subscribePullQueue } from '@/lib/pull-control';
import { remoteEntryCounts, type EntryCounts } from '@/lib/videos/entry-limits';
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
    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Stop adding new entries when a source or the combined library reaches its cap. Lowering a limit preserves your library. Existing entries can still refresh; raising the limit lets pulls resume. Zero holds all new entries for that source.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entryFields.map(([key, label, group]) => <label key={key} htmlFor={`pull-${key}`} className="min-w-0 text-xs leading-5 text-muted">
        {label}<Input id={`pull-${key}`} className="mt-2 min-h-11" type="number" min={0} max={1000000} step={1000} defaultValue={settings[key]} key={`${key}:${settings[key]}`} onBlur={event => {
          if (!event.target.value.trim() || !Number.isFinite(Number(event.target.value))) return;
          updatePullSettings({ [key]: Number(event.target.value) }); setSaved(`${label} limit saved.`);
        }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} />
        <span className="mt-1 block">{counts ? `${counts[group].toLocaleString()} stored / ${settings[key].toLocaleString()} max${counts[group] >= settings[key] ? ' · new entries held' : ''}` : 'Counting stored entries...'}</span>
      </label>)}
    </div>
    <p className="mt-3 text-xs leading-5 text-muted">Includes saved, hidden, and live remote entries. Local files are excluded. Limits control catalog growth, rather than a fixed number of memory bytes.</p>
    <p className="mt-1 min-h-5 text-xs text-accent" role="status">{saved}</p>
  </div>;
}
