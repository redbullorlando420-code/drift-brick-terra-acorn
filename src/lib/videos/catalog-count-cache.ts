import type { LibraryVideo } from './types.ts';
import { forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import { applyCatalogFlags, catalogCountFlags, emptyCatalogCounts, type CatalogCounts } from './catalog-counts.ts';

type Policy = { adultIds: ReadonlySet<string>; hidden: Record<string, true>; hideDemo: boolean };
type Inputs = Policy & { videos: LibraryVideo[] };
const samePolicy = (a: Policy, b: Policy) => a.adultIds === b.adultIds && a.hidden === b.hidden && a.hideDemo === b.hideDemo;
/** Seven counters need no metadata packets, worker copies, or card index.
 * Reuse semantic privacy inputs and count only changed cards in later saves. */
export function createCatalogCounter() {
  const completed = new WeakMap<LibraryVideo[], Array<Policy & { counts: CatalogCounts }>>();
  let previous: (Policy & { videos: WeakRef<LibraryVideo[]>; counts: CatalogCounts }) | undefined;
  let running: { inputs: Inputs; cancelled: boolean; result: Promise<CatalogCounts> } | undefined;
  const cancel = () => { if (running) { running.cancelled = true; running = undefined; } };
  return {
    cancel,
    count(inputs: Inputs, turn = yieldCatalogTask): Promise<CatalogCounts> {
      const cached = completed.get(inputs.videos)?.find(row => samePolicy(row, inputs));
      if (cached) { cancel(); return Promise.resolve(cached.counts); }
      if (running && running.inputs.videos === inputs.videos && samePolicy(running.inputs, inputs)) return running.result;
      cancel();
      const oldVideos = previous && samePolicy(previous, inputs) ? previous.videos.deref() : undefined;
      const counts = oldVideos ? { ...previous!.counts } : emptyCatalogCounts();
      const job = { inputs, cancelled: false, result: undefined as unknown as Promise<CatalogCounts> };
      running = job;
      const nextTurn = async () => {
        if (job.cancelled) throw new Error('Catalog count replaced');
        await turn();
        if (job.cancelled) throw new Error('Catalog count replaced');
      };
      const rows = oldVideos && oldVideos.length > inputs.videos.length ? oldVideos : inputs.videos;
      job.result = forEachCatalogSlice(rows, (_, position) => {
        const before = oldVideos?.[position], after = inputs.videos[position];
        if (oldVideos && before === after) return;
        const beforeFlags = before ? catalogCountFlags(before, inputs.adultIds, inputs.hidden, inputs.hideDemo) : 0;
        const afterFlags = after ? catalogCountFlags(after, inputs.adultIds, inputs.hidden, inputs.hideDemo) : 0;
        if (beforeFlags === afterFlags) return;
        applyCatalogFlags(counts, beforeFlags, -1); applyCatalogFlags(counts, afterFlags);
      }, nextTurn).then(() => {
        if (job.cancelled) throw new Error('Catalog count replaced');
        const entries = completed.get(inputs.videos) ?? [];
        entries.unshift({ adultIds: inputs.adultIds, hidden: inputs.hidden, hideDemo: inputs.hideDemo, counts });
        completed.set(inputs.videos, entries.slice(0, 2));
        previous = { adultIds: inputs.adultIds, hidden: inputs.hidden, hideDemo: inputs.hideDemo, videos: new WeakRef(inputs.videos), counts };
        return counts;
      }).finally(() => { if (running === job) running = undefined; });
      return job.result;
    },
  };
}
