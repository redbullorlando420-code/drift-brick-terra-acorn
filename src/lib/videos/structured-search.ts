import { parseSearchQuery } from "./search-query.ts";
import { searchCatalog } from "./search-index.ts";
import { matchesSearchConstraints } from "./search-constraints.ts";
import { forEachCatalogSlice, yieldCatalogTask } from "../catalog-work.ts";
import type { LibraryVideo } from "./types";
type Match = { ids: string[]; positions?: Uint32Array; videos: LibraryVideo[] };
/** Use the existing worker for words, then constrain only its matched ordinals.
 * Filter-only queries and worker fallback yield cooperatively and retain no extra index. */
export async function structuredSearch(
  videos: LibraryVideo[],
  tags: Record<string, string[]>,
  categories: Record<string, string>,
  raw: string,
  signal: AbortSignal,
  reviewed: boolean,
  worker: (text: string, signal: AbortSignal, reviewed: boolean) => Promise<Match | null>,
  turn = yieldCatalogTask,
): Promise<Match> {
  const parsed = parseSearchQuery(raw),
    q = parsed.query;
  if (parsed.error || (!q.text && !parsed.filtered)) return { ids: [], positions: new Uint32Array(), videos };
  const checkpoint = async () => {
    signal.throwIfAborted();
    await turn();
    signal.throwIfAborted();
  };
  const indexed = q.text ? await worker(q.text.toLowerCase(), signal, reviewed) : null;
  signal.throwIfAborted();
  const current = indexed?.videos === videos ? indexed : null;
  if (current && !parsed.filtered) return current;
  const matches =
    q.text && !current
      ? await searchCatalog(videos, tags, categories, q.text, signal, reviewed)
      : null;
  const ids: string[] = [],
    positions: number[] = [],
    candidateIds = current ? new Set(current.ids) : matches;
  const visit = (index: number) => {
    const v = videos[index];
    if (!v || (candidateIds && !candidateIds.has(v.id))) return;
    if (!matchesSearchConstraints(v, tags, categories, q, reviewed)) return;
    ids.push(v.id);
    positions.push(index);
  };
  if (current?.positions) await forEachCatalogSlice(current.positions, visit, checkpoint);
  else {
    // Slice ordinal ranges without allocating a second catalog-sized list.
    for (let from = 0; from < videos.length; from += 256) {
      await checkpoint();
      for (let i = from; i < Math.min(videos.length, from + 256); i++) visit(i);
    }
  }
  signal.throwIfAborted();
  return { ids, positions: Uint32Array.from(positions), videos };
}
