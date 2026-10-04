import { useSyncExternalStore } from 'react';
import { idleEnrichment } from '@/lib/idle-work';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/lib/videos/store';

/** A small queue readout subscribes independently of catalog diagnostics. */
export function EnrichmentStatus() {
  const queue = useSyncExternalStore(idleEnrichment.subscribe, idleEnrichment.getSnapshot, idleEnrichment.getSnapshot);
  return <section aria-label="Background metadata work" className="mt-4 rounded-lg border border-border bg-elevated p-5 shadow-border">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Background metadata work</p>
        <h2 className="mt-2 font-display text-2xl text-fg">Enrichment yields to you.</h2></div>
      <div className="flex flex-wrap gap-2"><Button size="sm" variant="secondary" onClick={() => idleEnrichment.setPaused(!queue.paused)}>
        {queue.paused ? 'Resume enrichment' : 'Pause enrichment'}
      </Button><Button size="sm" variant="secondary" disabled={queue.jobs.some(job => job.id === 'cached-tags')}
        onClick={() => useLibrary.getState().repairCachedMetadata()}>Recheck cached tags</Button></div>
    </div>
    <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Cached tag repair and smart tags share one queue. Each completed batch saves locally. Input, scrolling, a hidden tab, an active search, and an open preview or player interrupt unfinished work. Clear search or close the viewer to resume.</p>
    <div className="mt-3 text-xs leading-5 text-accent" role="status">
      {queue.error ? `Save failed · ${queue.error} Retry the metadata action to continue.` : queue.paused ? 'Enrichment paused. Completed batches are saved.'
        : !queue.jobs.length ? 'No metadata work queued.' : queue.state === 'waiting' ? 'Waiting for the library to be available.' : 'Working in short idle slices.'}
    </div>
    {queue.jobs.length > 0 && <ul className="mt-3 space-y-2 text-xs text-muted">{queue.jobs.map(job => <li key={job.id} className="flex flex-wrap justify-between gap-2">
      <span className="font-medium text-fg">{job.label}</span>
      <span>{job.progress.total ? `${job.progress.scanned.toLocaleString()} / ${job.progress.total.toLocaleString()} checked · ${job.progress.changed.toLocaleString()} changed · ${job.progress.batches.toLocaleString()} saved batches` : 'Queued · awaiting first slice'}</span>
    </li>)}</ul>}
    {queue.completed && <p className="mt-3 text-xs text-muted">Last completed · {queue.completed.label} · {queue.completed.progress.scanned.toLocaleString()} checked · {queue.completed.progress.changed.toLocaleString()} changed · {queue.completed.progress.batches.toLocaleString()} saved batches</p>}
  </section>;
}
