import { forEachCatalogSlice } from '../catalog-work.ts';
import { adultFolderIds, ADULT_PULL_PROVIDERS } from './adult-providers.ts';
import type { Folder, LibraryVideo, SourceId } from './types';

type Input = {
  videos: readonly LibraryVideo[]; folders: readonly Folder[];
  tags: Record<string, string[]>; categories: Record<string, string>;
  sourceId: SourceId; adultsUnlocked: boolean; hidden: Record<string, true>; hideDemo: boolean;
  query: string; ids: readonly string[] | null;
};
const privateKinds = new Set<string>(ADULT_PULL_PROVIDERS);

/** Resolve six newest suggestions without a catalog-sized map or match sort.
 * Worker failures use the same bounded scan, yielding between small slices. */
export async function collectSearchSuggestions(input: Input, turn: () => Promise<void>) {
  const needle = input.query.trim().toLowerCase().replace(/^#/, '');
  if (!needle) return [];
  const matched = input.ids === null ? null : new Set<string>();
  if (matched && input.ids) await forEachCatalogSlice(input.ids, id => { matched.add(id); }, turn);
  const privateFolders = adultFolderIds(input.folders);
  const canSeePrivate = input.adultsUnlocked && (input.sourceId === 'adults' || input.sourceId === 'adult-fetishes');
  const best: LibraryVideo[] = [];
  await forEachCatalogSlice(input.videos, video => {
    if (matched && !matched.has(video.id)) return;
    if (input.hidden[video.id] || input.hideDemo && video.isSample) return;
    if ((privateFolders.has(video.folderId) || privateKinds.has(video.remote?.kind ?? '')) && !canSeePrivate) return;
    if (input.sourceId === 'youtube' && video.remote?.kind !== 'youtube') return;
    if (input.sourceId === 'twitch' && video.remote?.kind !== 'twitch') return;
    if (!matched && ![video.name, video.path, video.description, video.remote?.channelName,
      input.categories[video.id], ...(input.tags[video.id] ?? [])].filter(Boolean).join(' ').toLowerCase().includes(needle)) return;
    if (best.length === 6 && video.addedAt <= best[5]!.addedAt) return;
    let index = 0;
    while (index < best.length && best[index]!.addedAt >= video.addedAt) index++;
    best.splice(index, 0, video);
    if (best.length > 6) best.pop();
  }, turn);
  return best;
}
