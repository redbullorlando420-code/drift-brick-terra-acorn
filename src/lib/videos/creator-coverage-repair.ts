import { forEachCatalogSlice } from '../catalog-work.ts';
import { sparseRecordBuilder } from '../sparse-record.ts';
import { prepareCreatorCoverageResolver } from './creator-coverage.ts';
import type { IdleStep } from '../idle-queue';
import type { CachedTagPatch } from './tag-patches';
import type { FollowedChannel, LibraryVideo, VideoMetadataProvenance } from './types';
import type { EnrichmentRow } from './enrichment-batch';

export type CreatorCoverageRepairResult = { processed: number; repaired: number; tagged: number; remaining: number };
export type CreatorCoverageRow = { video: LibraryVideo; enrichment?: EnrichmentRow };
type State = { videos: LibraryVideo[]; follows: FollowedChannel[]; tags: Record<string, string[]>;
  metadataProvenance: Record<string, VideoMetadataProvenance> };

/** Retain only the next repair batch and an exact remaining count. Scan
 * checkpoints survive interaction holds; changed catalogs/follows restart the
 * scan. Publication copies references in tasks and patches only touched keys. */
export function creatorCoverageRepairStep(options: {
  get(): State; publish(next: Pick<State, 'videos' | 'tags' | 'metadataProvenance'>): void;
  tags(video: LibraryVideo, state: State): CachedTagPatch | undefined;
  save(rows: readonly CreatorCoverageRow[], turn: () => Promise<void>, valid: () => boolean): Promise<void>;
  limit: number;
}) {
  type Scan = { videos: LibraryVideo[]; follows: FollowedChannel[]; offset: number; total: number;
    candidates: Array<{ id: string; channelName: string }>; resolve?: Awaited<ReturnType<typeof prepareCreatorCoverageResolver>> };
  let scan: Scan | undefined;
  return async (signal: AbortSignal, turn: () => Promise<void>): Promise<IdleStep<CreatorCoverageRepairResult>> => {
    const state = options.get();
    if (!scan || scan.videos !== state.videos || scan.follows !== state.follows)
      scan = { videos: state.videos, follows: state.follows, offset: 0, total: 0, candidates: [] };
    const current = scan;
    const progress = () => ({ scanned: current.offset, total: current.videos.length, changed: 0, batches: 0 });
    const pending = (): IdleStep<CreatorCoverageRepairResult> => ({ done: false, progress: progress() });
    const scanValid = () => options.get().videos === current.videos && options.get().follows === current.follows;
    current.resolve ??= await prepareCreatorCoverageResolver(current.follows, turn);
    signal.throwIfAborted();
    if (!scanValid()) return pending();
    const candidates = current.candidates.slice();
    let total = current.total;
    const end = Math.min(current.videos.length, current.offset + 2048);
    await forEachCatalogSlice(current.videos.slice(current.offset, end), video => {
      const resolution = current.resolve!(video);
      if (resolution.status !== 'resolved') return;
      total++;
      if (candidates.length < options.limit) candidates.push({ id: video.id, channelName: resolution.channelName });
    }, turn);
    signal.throwIfAborted();
    if (!scanValid()) return pending();
    current.offset = end; current.total = total; current.candidates = candidates;
    if (end < current.videos.length) return pending();
    if (!candidates.length) return { done: true, progress: progress(), result: { processed: 0, repaired: 0, tagged: 0, remaining: 0 } };

    const base = options.get();
    const valid = () => { const latest = options.get(); return latest.videos === base.videos && latest.follows === base.follows
      && latest.tags === base.tags && latest.metadataProvenance === base.metadataProvenance; };
    const checkedTurn = async () => {
      await turn();
      if (!valid()) throw new DOMException('Creator repair inputs changed', 'AbortError');
    };
    try {
      const repairs = new Map(candidates.map(candidate => [candidate.id, candidate.channelName]));
      const changed = new Map<string, LibraryVideo>(), videos = new Array<LibraryVideo>(base.videos.length);
      await forEachCatalogSlice(base.videos, (video, offset) => {
        const channelName = repairs.get(video.id);
        const repaired = channelName && video.remote ? { ...video, remote: { ...video.remote, channelName } } : video;
        videos[offset] = repaired;
        if (repaired !== video) changed.set(video.id, repaired);
      }, checkedTurn);
      const tags = sparseRecordBuilder(base.tags), provenance = sparseRecordBuilder(base.metadataProvenance);
      const rows: CreatorCoverageRow[] = [];
      let tagged = 0;
      for (const video of changed.values()) {
        const patch = options.tags(video, base);
        const row: CreatorCoverageRow = { video };
        if (patch) {
          if (patch.tags !== base.tags[video.id]) tagged++;
          tags.set(video.id, patch.tags); provenance.set(video.id, patch.provenance);
          row.enrichment = { id: video.id, tags: patch.tags, provenance: patch.provenance };
        }
        rows.push(row);
      }
      const next = { videos, tags: tags.finish(), metadataProvenance: provenance.finish() };
      await checkedTurn();
      await options.save(rows, checkedTurn, valid);
      signal.throwIfAborted();
      if (!valid()) return pending();
      options.publish(next);
      return { done: true, progress: { ...progress(), changed: candidates.length, batches: 1 },
        result: { processed: candidates.length, repaired: candidates.length, tagged, remaining: Math.max(0, total - candidates.length) } };
    } catch (error) {
      signal.throwIfAborted();
      if (error instanceof DOMException && error.name === 'AbortError') return pending();
      throw error;
    }
  };
}
