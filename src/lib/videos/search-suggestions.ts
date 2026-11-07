import { searchText } from "./search-text.ts";
import { visitSearchCandidates } from './search-candidates.ts';
import { forEachCatalogSlice } from '../catalog-work.ts';
import {videoIsPrivate} from './public-visibility.ts';
import { adultFolderIds } from './adult-providers.ts';
import type { Folder, LibraryVideo, SourceId } from './types';
import { parseSearchQuery } from './search-query.ts';

type Input = {
  videos: readonly LibraryVideo[]; folders: readonly Folder[];
  tags: Record<string, string[]>; categories: Record<string, string>;
  sourceId: SourceId; adultsUnlocked: boolean; hidden: Record<string, true>; unavailable?: Record<string, true>; hideDemo: boolean;
  query: string; positions?: Uint32Array; ids: readonly string[] | null;
};

/** Resolve six newest suggestions without a catalog-sized map or match sort.
 * Worker failures use the same bounded scan, yielding between small slices. */
export async function collectSearchSuggestions(input: Input, turn: () => Promise<void>) {
  const needle = searchText(input.query.trim()).replace(/^#/, '');
  const parsed = parseSearchQuery(input.query);
  if (!needle || parsed.error) return [];
  const matched = input.ids === null ? null : new Set<string>();
  if (matched && input.ids) await forEachCatalogSlice(input.ids, id => { matched.add(id); }, turn);
  const privateFolders = adultFolderIds(input.folders);
  const canSeePrivate = input.adultsUnlocked && (input.sourceId === 'adults' || input.sourceId === 'adult-fetishes');
  const best: LibraryVideo[] = [];
  const visit = (video: LibraryVideo) => {
    if (matched && !matched.has(video.id)) return;
    if (input.hidden[video.id] || input.unavailable?.[video.id] || input.hideDemo && video.isSample) return;
    if ((videoIsPrivate(privateFolders,video)) && !canSeePrivate) return;
    if (parsed.query.source === 'all') {
      if (input.sourceId === 'youtube' && video.remote?.kind !== 'youtube') return;
      if (input.sourceId === 'twitch' && video.remote?.kind !== 'twitch') return;
    } else if (parsed.query.source === 'local' ? Boolean(video.remote) : video.remote?.kind !== parsed.query.source) return;
    if (!matched && ![video.name, video.path, video.description, video.remote?.channelName,
      input.categories[video.id], ...(input.tags[video.id] ?? [])].filter(Boolean).join(' ').normalize('NFC').toLowerCase().normalize('NFC').includes(needle)) return;
    if (best.length === 6 && video.addedAt <= best[5]!.addedAt) return;
    let index = 0;
    while (index < best.length && best[index]!.addedAt >= video.addedAt) index++;
    best.splice(index, 0, video);
    if (best.length > 6) best.pop();
  };
  if (matched) await visitSearchCandidates(input.videos, matched, input.positions, visit, turn);
  else await forEachCatalogSlice(input.videos, visit, turn);
  return best;
}
