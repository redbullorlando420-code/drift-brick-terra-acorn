import { collectCatalogRows, forEachCatalogSlice, sortCatalogRows } from '../catalog-work.ts';
import type { LibraryVideo } from "./types";

export function isTwitchClip(video: LibraryVideo): boolean {
  return video.remote?.kind === "twitch" && !video.remote.live && (video.extension === "clip" || video.id.startsWith("tw:c:") || ((video.duration ?? 0) > 0 && (video.duration ?? 0) <= 120));
}

function rank(id: string, seed: number): number {
  let hash = seed ^ 2166136261;
  for (let i = 0; i < id.length; i++) hash = Math.imul(hash ^ id.charCodeAt(i), 16777619);
  return hash >>> 0;
}

/** O(catalog size) scan, bounded candidates, and round-robin creator exposure. */
export function sampleTwitchClips(videos: LibraryVideo[], seed: number, creator = "all", limit = 48): LibraryVideo[] {
  const perCreator = new Map<string, Array<{ video: LibraryVideo; rank: number }>>();
  const cap = creator === "all" ? Math.min(limit, 12) : limit;
  for (const video of videos) {
    if (!isTwitchClip(video)) continue;
    const name = video.remote?.channelName?.trim() || "Unknown creator";
    if (creator !== "all" && creator !== name) continue;
    const rows = perCreator.get(name) ?? [];
    const score = rank(video.id, seed);
    if (rows.length < cap) rows.push({ video, rank: score });
    else {
      let largest = 0;
      for (let i = 1; i < rows.length; i++) if (rows[i].rank > rows[largest].rank) largest = i;
      if (score < rows[largest].rank) rows[largest] = { video, rank: score };
    }
    perCreator.set(name, rows);
  }
  const groups = [...perCreator.entries()]
    .sort(([a], [b]) => rank(a, seed) - rank(b, seed))
    .map(([, rows]) => rows.sort((a, b) => a.rank - b.rank).map((row) => row.video));
  const out: LibraryVideo[] = [];
  for (let depth = 0; out.length < limit && groups.some((group) => depth < group.length); depth++) {
    for (const group of groups) {
      if (group[depth]) out.push(group[depth]);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Indexed sampling skips VODs entirely and yields during both scanning and
 * creator sorting. Offsets refer to the exact catalog snapshot that owns them. */
export async function sampleTwitchClipsAsync(videos: readonly LibraryVideo[], offsets: Uint32Array, seed: number,
  creator: string, turn: () => Promise<void>, limit = 48): Promise<LibraryVideo[]> {
  await turn();
  if (limit <= 0) return [];
  const groups = new Map<string, Array<{ video: LibraryVideo; rank: number }>>();
  const cap = creator === 'all' ? Math.min(limit, 12) : limit;
  // Round-robin emits at most `limit` creators. A creator ranked beyond that
  // window can never contribute, even if it has millions of clips. The window
  // only narrows, so a rejected creator never needs earlier rows recovered.
  const creatorRanks = new Map<string, number>();
  let worstCreator = '', worstRank = -1;
  const updateWorst = () => {
    worstRank = -1;
    for (const [name, score] of creatorRanks) if (score >= worstRank) { worstRank = score; worstCreator = name; }
  };
  await forEachCatalogSlice(offsets, offset => {
    const video = videos[offset]!;
    const name = video.remote?.channelName?.trim() || 'Unknown creator';
    if (creator !== 'all' && creator !== name) return;
    let rows = groups.get(name);
    if (!rows) {
      const creatorRank = rank(name, seed);
      if (groups.size >= limit) {
        if (creatorRank >= worstRank) return;
        groups.delete(worstCreator); creatorRanks.delete(worstCreator);
      }
      rows = [];
      groups.set(name, rows); creatorRanks.set(name, creatorRank); updateWorst();
    }
    const score = rank(video.id, seed);
    if (rows.length < cap) rows.push({ video, rank: score });
    else {
      let largest = 0;
      for (let i = 1; i < rows.length; i++) if (rows[i]!.rank > rows[largest]!.rank) largest = i;
      if (score < rows[largest]!.rank) rows[largest] = { video, rank: score };
    }
    groups.set(name, rows);
  }, turn);
  const sorted = await sortCatalogRows(await collectCatalogRows(groups.entries(), turn),
    ([a], [b]) => rank(a, seed) - rank(b, seed), turn);
  await forEachCatalogSlice(sorted, ([, rows]) => { rows.sort((a, b) => a.rank - b.rank); }, turn, 64);
  const result: LibraryVideo[] = [];
  for (let depth = 0; depth < cap && result.length < limit; depth++) {
    await forEachCatalogSlice(sorted, ([, rows]) => {
      if (result.length < limit && rows[depth]) result.push(rows[depth]!.video);
    }, turn);
  }
  await turn();
  return result;
}
