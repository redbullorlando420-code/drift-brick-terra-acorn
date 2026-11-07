import { searchText } from "./search-text.ts";
import { topicsForVideo } from "./topics.ts";
import type { SearchQuery } from "./search-query.ts";
import type { LibraryVideo } from "./types";
import { matchesSearchDates } from './search-dates.ts';
/** Shared by actual results and the visible-scope correction vocabulary. */
export function matchesSearchConstraints(
  v: LibraryVideo,
  tags: Record<string, string[]>,
  categories: Record<string, string>,
  q: SearchQuery,
  reviewed: boolean,
): boolean {
  if(q.date&&!matchesSearchDates(v,q.date))return false;
  if (q.source === "local" ? Boolean(v.remote) : q.source !== "all" && v.remote?.kind !== q.source)
    return false;
  if (q.category && searchText(categories[v.id] ?? v.genre ?? "") !== searchText(q.category))
    return false;
  if (
    (q.minSeconds !== null || q.maxSeconds !== null) &&
    (!Number.isFinite(v.duration) ||
      (v.duration ?? -1) < 0 ||
      (q.minSeconds !== null && v.duration! < q.minSeconds) ||
      (q.maxSeconds !== null && v.duration! > q.maxSeconds))
  )
    return false;
  if (q.tags.length) {
    const labels = new Set(
      [...(tags[v.id] ?? []), ...topicsForVideo(v, tags[v.id], reviewed)].map(searchText),
    );
    if (!q.tags.every((tag) => labels.has(searchText(tag)))) return false;
  }
  return true;
}
