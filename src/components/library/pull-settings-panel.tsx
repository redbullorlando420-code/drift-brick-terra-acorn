import { useSyncExternalStore } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DEFAULT_PULL_SETTINGS, getPullSettings, subscribePullSettings, updatePullSettings, type PullSettings } from '@/lib/pull-settings';
import { cancelQueuedPulls, getPullQueueSnapshot, pullsPaused, setPullsPaused, subscribePullControl, subscribePullQueue } from '@/lib/pull-control';
const fields: Array<[keyof PullSettings, string, number, number, number]> = [
  ['requestGapMs', 'Minimum gap between catalog requests (ms)', 250, 60000, 250],
  ['concurrentRequests', 'Concurrent catalog requests', 1, 3, 1],
  ['youtubeBatchVideos', 'YouTube entries per creator batch (target)', 30, 500, 10],
  ['youtubeSourcesPerSweep', 'YouTube sources per archive sweep', 1, 1024, 1],
  ['youtubeIntervalSeconds', 'YouTube automatic sweep interval (seconds)', 60, 3600, 30],
  ['adultBatchVideos', 'Adult entries per pull, across selected providers', 20, 1000, 20],
  ['adultIntervalSeconds', 'Adult automatic pull interval (seconds)', 30, 3600, 30],
  ['adultCatalogTarget', 'Adult automatic catalog target', 1000, 1000000, 1000],
];
export function PullSettingsPanel() {
  const settings = useSyncExternalStore(subscribePullSettings, getPullSettings, () => DEFAULT_PULL_SETTINGS);
  const queue = useSyncExternalStore(subscribePullQueue, getPullQueueSnapshot, getPullQueueSnapshot);
  const paused = useSyncExternalStore(subscribePullControl, pullsPaused, () => false);
  return <section className="mt-6 rounded-xl border border-border bg-elevated p-5 shadow-border" aria-labelledby="pull-settings-title">
    <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Pull management</p>
    <h2 id="pull-settings-title" className="mt-2 font-display text-2xl text-fg">Control the pace of your catalog.</h2>
    <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">Small resumable batches keep browsing responsive as your library grows. Limits apply to new pulls; changing the target preserves saved entries.</p>
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <Button onClick={() => setPullsPaused(!paused)}>{paused ? 'Resume pulling' : 'Pause pulling'}</Button>
      <Button variant="secondary" disabled={!queue.active && !queue.waiting} onClick={cancelQueuedPulls}>Cancel current pull queue</Button>
      <span className="text-xs text-muted" role="status">{queue.active} active · {queue.waiting} queued{queue.held ? ' · waiting for browsing to settle' : ''}</span>
    </div>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {fields.map(([key, label, min, max, step]) => <label key={key} className="text-xs leading-5 text-muted" htmlFor={`pull-${key}`}>{label}<Input id={`pull-${key}`} className="mt-2 min-h-11" type="number" min={min} max={max} step={step} defaultValue={String(settings[key])} key={`${key}:${settings[key]}`} onBlur={event => { if (event.target.value.trim()) updatePullSettings({ [key]: Number(event.target.value) }); }} onKeyDown={event => { if (event.key === 'Enter') event.currentTarget.blur(); }} /></label>)}
    </div>
    <div className="mt-5 flex flex-wrap gap-3">
      <label className="flex min-h-11 items-center gap-2 text-sm text-fg"><input type="checkbox" checked={settings.automaticPulls} onChange={event => updatePullSettings({ automaticPulls: event.target.checked })} />Automatic catalog pulls</label>
      <label className="flex min-h-11 items-center gap-2 text-sm text-fg"><input type="checkbox" checked={settings.pauseWhileWatching} onChange={event => updatePullSettings({ pauseWhileWatching: event.target.checked })} />Hold catalog pulls while a preview or player is open</label>
    </div>
    <p className="mt-3 text-xs leading-5 text-muted">YouTube finishes a provider page before saving its next cursor, so a batch may round up by one page. Adult limits cover all selected providers. Hidden tabs hold catalog work. Cancel stops later batches and discards outstanding responses; a provider request already sent may finish. Preview recommendations use at most 4,096 entries, with descriptions and comments loaded for the selected video.</p>
  </section>;
}
