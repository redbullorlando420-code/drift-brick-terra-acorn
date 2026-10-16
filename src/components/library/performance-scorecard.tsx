import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { cacheMetrics } from '@/lib/cache-metrics';
import { aggregateProviderCache } from '@/lib/provider-cache-metrics';
import { PROVIDER_BUDGETS } from '@/lib/provider-budgets';
import { buildPerformanceScorecard, type Health } from '@/lib/performance-scorecard';
import { getRenderBudgetSnapshot } from '@/lib/render-budget';
import { getInteractionBudgetSnapshot } from '@/lib/interaction-budget';
import { getFirstShelfTrace } from '@/lib/first-shelf-trace';
import { getPerformanceProfile } from '@/lib/performance-profile';
import { getThumbDiagnostics } from '@/lib/videos/thumbs';
import { viewerDetails } from '@/lib/videos/viewer-details';
import { useLibrary } from '@/lib/videos/store';
import { getPersistenceMemorySnapshot } from '@/lib/videos/persist';
import { getPeriodicWorkSnapshot } from '@/lib/periodic-work';
import { getSourceMemorySnapshot } from '@/lib/videos/sources';
import { getFeedbackDiagnostics } from '@/lib/media-feedback';
import { getCompanionMemorySnapshot } from '@/lib/companion';
import { pullsPaused } from '@/lib/pull-control';
import { StartupStatus } from './startup-status';

const labels: Record<Health, string> = { healthy: 'Within budget', watch: 'Worth checking', attention: 'Needs attention', unmeasured: 'More samples needed' };
const bytes = (n: number) => `${(n / 1048576).toFixed(2)} MiB`;
const age = (n: number | undefined) => n === undefined ? 'No sample' : n < 60_000 ? `${Math.floor(n / 1000)}s` : n < 3_600_000 ? `${Math.floor(n / 60_000)}m` : `${Math.floor(n / 3_600_000)}h`;
const rate = (hits: number, misses: number) => hits + misses ? `${Math.round(hits / (hits + misses) * 100)}% hit · ${hits.toLocaleString()} hits / ${misses.toLocaleString()} misses` : 'No requests observed';
function capture() {
  const now = Date.now(), catalog = useLibrary.getState(), counters = cacheMetrics.snapshot();
  const snapshot = { version: 1, capturedAt: now, catalogEntries: catalog.videos.length, sourceCount: catalog.folders.length,
    lowMemory: getPerformanceProfile().lowMemory, pullsPaused: pullsPaused(), frames: getRenderBudgetSnapshot(), interactions: getInteractionBudgetSnapshot(),
    startup: getFirstShelfTrace(), artwork: getThumbDiagnostics(), viewer: viewerDetails.diagnostics(), counters,
    providers: aggregateProviderCache(catalog.follows, now), providerBudgets: PROVIDER_BUDGETS, writes: getPersistenceMemorySnapshot(), recurring: getPeriodicWorkSnapshot(),
    sources: getSourceMemorySnapshot(), feedback: getFeedbackDiagnostics(), companion: getCompanionMemorySnapshot() };
  return { ...snapshot, scorecard: buildPerformanceScorecard({ ...snapshot, now, homeReadyMs: snapshot.startup.homeReadyMs, diskErrors: counters['thumbnail-disk'].errors }) };
}
export function PerformanceScorecard() {
  const [snapshot, setSnapshot] = useState(capture);
  const { scorecard, artwork, viewer, frames, counters, recurring, writes } = snapshot;
  const exportSnapshot = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'reelcase-performance-scorecard.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return <section className="mt-5 min-w-0 border-t border-white/10 pt-5" aria-label="Performance scorecard" data-performance-scorecard data-health={scorecard.health}>
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="text-lg font-semibold text-fg">Performance scorecard</h3><p className="mt-1 text-sm text-accent" role="status">{labels[scorecard.health]}</p></div>
      <div className="flex flex-wrap gap-2"><Button variant="secondary" className="min-h-11" onClick={() => setSnapshot(capture())}>Refresh scorecard</Button><Button variant="outline" className="min-h-11" onClick={exportSnapshot}>Export measurements</Button></div>
    </div>
    <p className="mt-3 text-xs leading-5 text-muted">Captured {new Date(snapshot.capturedAt).toLocaleTimeString()} · {snapshot.catalogEntries.toLocaleString()} entries · {snapshot.lowMemory ? 'Low-memory' : 'Adaptive'} mode · pulling {snapshot.pullsPaused ? 'paused' : 'enabled'}. Refresh on demand; no catalog scan or automatic Settings refresh. Samples stay on this device.</p>
    <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{scorecard.checks.map(check => <div key={check.id} className="min-w-0 rounded-md bg-bg/45 p-3"><div className="flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-medium text-fg">{check.label}</h4><span className={`text-xs ${check.health === 'attention' || check.health === 'watch' ? 'text-accent' : 'text-muted'}`}>{labels[check.health]}</span></div><p className="mt-2 text-xs leading-5 text-muted">{check.detail}</p></div>)}</div>
    <p className="mt-4 rounded-md border border-accent/20 p-3 text-sm leading-6 text-fg"><strong>Next step: </strong>{scorecard.next}</p>
    <h3 className="mt-6 font-semibold text-fg">Cache health</h3>
    <dl className="mt-3 grid gap-3 md:grid-cols-2">
      <CacheRow title="Catalog selectors" detail={rate(counters['catalog-selectors'].hits, counters['catalog-selectors'].misses)} note={`Immutable-input reuse since page load · last lookup ${age(counters['catalog-selectors'].lastAccessAt === undefined ? undefined : snapshot.capturedAt - counters['catalog-selectors'].lastAccessAt)} ago. Results share catalog references; heap size is not measured.`} />
      <CacheRow title="Artwork memory" detail={rate(artwork.hits, artwork.misses)} note={`${artwork.entries} / ${artwork.entryLimit} entries · ${bytes(artwork.bytes)} / ${bytes(artwork.byteLimit)} · ${artwork.evictions} evictions · ${artwork.active} decoding / ${artwork.queued} queued. Session reuse includes disk recall.`} />
      <CacheRow title="Thumbnail disk recall" detail={rate(counters['thumbnail-disk'].hits, counters['thumbnail-disk'].misses)} note={`${counters['thumbnail-disk'].errors} errors · last recalled item ${counters['thumbnail-disk'].lastEntryBytes === undefined ? 'unmeasured' : bytes(counters['thumbnail-disk'].lastEntryBytes)} · oldest observed item ${age(counters['thumbnail-disk'].oldestObservedEntryAt === undefined ? undefined : snapshot.capturedAt - counters['thumbnail-disk'].oldestObservedEntryAt)}. Observed reads only; no full disk inventory.`} />
      <CacheRow title="Viewer details" detail={`${viewer.entries} / ${viewer.maxEntries} entries · ${bytes(viewer.estimatedBytes)} / ${bytes(viewer.maxBytes)} estimated`} note={`${viewer.pending} disk reads · ${viewer.activeTranscripts} active transcript. Details leave memory when their bounded cache evicts them.`} />
      {snapshot.providers.map(provider => <CacheRow key={provider.kind} title={`${provider.kind === 'youtube' ? 'YouTube' : 'Twitch'} provider snapshots`} detail={rate(provider.hits, provider.misses)} note={`${provider.samples} saved creator samples · ${provider.uncached} unretained responses · ${provider.entries.toLocaleString()} retained entries in snapshots · ${provider.sizedSamples ? `${bytes(provider.estimatedBytes)} estimated across ${provider.sizedSamples} sized samples` : 'size unavailable until the next provider response'} · oldest sample ${age(provider.oldestAgeMs)}.`} />)}
    </dl>
    <p className="mt-3 text-xs leading-5 text-subtle">Provider rows are the latest saved observations per creator, which may be stale or evicted. Counters reset with the server cache; totals are not the current server inventory. Payload estimates exclude object overhead. Exports contain counts and timings, without media, titles, channel names, or URLs.</p>
    <details className="mt-4 rounded-md border border-border p-3" aria-label="Provider metadata safeguards">
      <summary className="min-h-11 cursor-pointer py-3 text-sm font-medium text-fg">Provider metadata safeguards</summary>
      <p className="mt-2 text-xs leading-5 text-muted">Each upstream metadata page has an {bytes(PROVIDER_BUDGETS.responseBytes)} response ceiling and a {PROVIDER_BUDGETS.bodyTimeoutMs / 1000}s body-read deadline. Oversized or interrupted pages hold their saved position; accepted pages stay available. Archive totals can keep growing through complete pages. Your pulling rates and entry limits remain in Pull settings.</p>
      <dl className="mt-3 grid gap-3 md:grid-cols-3">
        <CacheRow title="YouTube transfers" detail={`${PROVIDER_BUDGETS.youtubeTransfers} active · ${PROVIDER_BUDGETS.queuedRequests} waiting maximum`} note={`User-selected pacing and explicit retry apply. Warm cache: ${bytes(PROVIDER_BUDGETS.youtubeCacheBytes)} estimated total; up to ${PROVIDER_BUDGETS.warmCacheRows} rows per entry.`} />
        <CacheRow title="Twitch transfers" detail={`${PROVIDER_BUDGETS.twitchTransfers} active · ${PROVIDER_BUDGETS.queuedRequests} waiting maximum`} note={`Whole transfers share the lane across jobs. Warm cache: ${bytes(PROVIDER_BUDGETS.twitchCacheBytes)} estimated total; deep results above ${PROVIDER_BUDGETS.warmCacheRows} rows go to the durable library without a second server graph.`} />
        <CacheRow title="Adult transfers" detail={`${PROVIDER_BUDGETS.adultTransfers} active · ${PROVIDER_BUDGETS.queuedRequests} waiting maximum`} note={`Readable response cache: ${bytes(PROVIDER_BUDGETS.adultCacheBytes)} estimated total. Response bytes are checked before decoding and caching.`} />
      </dl>
      <p className="mt-3 text-xs leading-5 text-subtle">Recent refresh jobs use up to {PROVIDER_BUDGETS.refreshWorkers} workers; live checks use {PROVIDER_BUDGETS.liveWorkers}; YouTube archive batches use {PROVIDER_BUDGETS.archiveWorkers}. Imports use {PROVIDER_BUDGETS.importWorkers} workers and at most {PROVIDER_BUDGETS.importAttempts} attempts per source, with no immediate repeat of an oversized response. These are metadata safeguards; playback and media downloads keep their own paths. Cache sizes estimate retained payload, excluding JavaScript object overhead.</p>
    </details>
    <p className="mt-4 text-xs leading-5 text-muted" aria-label="Recurring work">Recurring work · {recurring.tasks} tasks · {recurring.timerCount} shared timer · {recurring.running} running · {recurring.paused} paused. Storage · {writes.artwork.pending} artwork writes ({bytes(writes.artwork.pendingWeight)}) · {writes.activity.pending} activity snapshots · {snapshot.sources.objectUrls} temporary media URLs. Frame sampling {frames.monitoring ? 'enabled' : 'disabled'}; retains at most 240 durations while visible shelves are mounted.</p>
    <StartupStatus />
  </section>;
}
function CacheRow({ title, detail, note }: { title: string; detail: string; note: string }) {
  return <div className="min-w-0 rounded-md bg-bg/45 p-3"><dt className="text-sm font-medium text-fg">{title}</dt><dd className="mt-1 text-xs leading-5 text-accent">{detail}</dd><dd className="mt-1 text-xs leading-5 text-muted">{note}</dd></div>;
}
