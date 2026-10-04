import type { IdleStep } from '../idle-queue';
import { prepareEnrichmentBatch, type EnrichmentLedgers, type EnrichmentRow } from './enrichment-batch.ts';
import type { CachedTagPatch } from './tag-patches';
import type { Folder, LibraryVideo } from './types';

export type MetadataTailResult = { processed: number; changed: number; remaining: number;
  sources: Array<{ source: string; processed: number; changed: number }> };
type Catalog = EnrichmentLedgers & { videos: LibraryVideo[]; folders: Folder[] };
export type EnrichmentCursor = { catalog?: WeakRef<LibraryVideo[]>; offset: number };
export function enrichmentCursor(): EnrichmentCursor { return { offset: 0 }; }

/** Never builds a library-sized candidate list. A scan checks at most 2048
 * rows per batch, with 512-row / four-millisecond background task boundaries. */
export function metadataEnrichmentStep(options: {
  get(): Catalog;
  publish(next: EnrichmentLedgers): void;
  save(rows: readonly EnrichmentRow[], turn: () => Promise<void>): Promise<void>;
  patch(video: LibraryVideo, state: Catalog): CachedTagPatch | undefined;
  cursor?: EnrichmentCursor;
  maxChanges?: number;
}) {
  const cursor = options.cursor ?? enrichmentCursor(), maxChanges = options.maxChanges ?? Infinity;
  let processed = 0, changed = 0, batches = 0;
  const sources = new Map<string, { processed: number; changed: number }>();
  return async (signal: AbortSignal, turn: () => Promise<void>): Promise<IdleStep<MetadataTailResult>> => {
    const state = options.get();
    if (cursor.catalog?.deref() !== state.videos) { cursor.catalog = new WeakRef(state.videos); cursor.offset = 0; }
    const patches = new Map<string, CachedTagPatch>(), sourceById = new Map<string, string>();
    let index = cursor.offset, visited = 0, started = performance.now();
    const end = Math.min(state.videos.length, index + 2048);
    while (index < end && patches.size < Math.min(2048, maxChanges - processed)) {
      const video = state.videos[index++]!, patch = options.patch(video, state);
      if (patch) { patches.set(video.id, patch); sourceById.set(video.id, video.remote?.kind ?? 'local'); }
      if (++visited >= 512 || performance.now() - started >= 4) { await turn(); visited = 0; started = performance.now(); }
    }
    // A slow/contended scan may yield before preparation captures its base.
    // Do not bless patches derived from older tags as work against that newer
    // base; retry from the unchanged checkpoint after a foreground edit.
    signal.throwIfAborted();
    const afterScan = options.get();
    if (afterScan.videos !== state.videos || afterScan.folders !== state.folders
      || afterScan.tags !== state.tags || afterScan.metadataProvenance !== state.metadataProvenance) {
      return { done: false, progress: { scanned: cursor.offset, total: state.videos.length, changed, batches } };
    }
    let prepared: Awaited<ReturnType<typeof prepareEnrichmentBatch>>;
    try { prepared = await prepareEnrichmentBatch(options.get, patches, turn); }
    catch (error) {
      signal.throwIfAborted();
      if (!(error instanceof DOMException && error.name === 'AbortError')) throw error;
      return { done: false, progress: { scanned: cursor.offset, total: state.videos.length, changed, batches } };
    }
    const unchanged = () => {
      const current = options.get();
      return current.videos === state.videos && current.folders === state.folders
        && current.tags === prepared.base.tags && current.metadataProvenance === prepared.base.metadataProvenance;
    };
    signal.throwIfAborted();
    if (!unchanged()) return { done: false, progress: { scanned: cursor.offset, total: state.videos.length, changed, batches } };
    if (prepared.rows.length) {
      // No cursor or UI success advances before the sparse records are durable.
      // If input interrupts the write, the transaction still finishes; retrying
      // this batch is idempotent and drops its discarded scratch ledgers.
      try {
        await options.save(prepared.rows, async () => {
          await turn();
          if (!unchanged()) throw new DOMException('Metadata changed while saving', 'AbortError');
        });
      } catch (error) {
        signal.throwIfAborted();
        if (!(error instanceof DOMException && error.name === 'AbortError')) throw error;
        return { done: false, progress: { scanned: cursor.offset, total: state.videos.length, changed, batches } };
      }
      signal.throwIfAborted();
      if (!unchanged()) return { done: false, progress: { scanned: cursor.offset, total: state.videos.length, changed, batches } };
      options.publish(prepared.next); batches++;
      for (const row of prepared.rows) {
        const tagChanged = row.tags !== prepared.base.tags[row.id], source = sourceById.get(row.id)!;
        const counts = sources.get(source) ?? { processed: 0, changed: 0 };
        counts.processed++; if (tagChanged) { counts.changed++; changed++; }
        sources.set(source, counts); processed++;
      }
    }
    cursor.offset = index;
    const progress = { scanned: index, total: state.videos.length, changed, batches };
    if (index < state.videos.length && processed < maxChanges) return { done: false, progress };
    return { done: true, progress, result: { processed, changed, remaining: Math.max(0, state.videos.length - index),
      sources: [...sources].map(([source, counts]) => ({ source, ...counts })) } };
  };
}
