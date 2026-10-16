import { forEachCatalogEntry, forEachCatalogSlice, yieldCatalogTask } from '../catalog-work.ts';
import { catalogCard } from './catalog-card.ts';
import { shouldRestoreRemoteVideo } from './follow-removal.ts';
import { mergeRemoteCatalogAsync } from './remote-merge.ts';
import type { FollowedChannel, LibraryVideo, ProgressMark, ResumeMark } from './types';
import { sparseRecordScan, sparseRecordBuilder } from '../sparse-record.ts';

export type CatalogRestoreState = {
  videos: LibraryVideo[];
  follows: FollowedChannel[];
  favorites: Record<string, true>;
  likes: Record<string, true>;
  progress: Record<string, ProgressMark>;
  resumeProgress: Record<string, ResumeMark>;
};

/** Disk reads are paged; filtering, indexing, merging and resume linking must
 * also yield. Nothing here publishes a partial catalog or changes saved data. */
export async function prepareCatalogRestore(base: CatalogRestoreState, rows: LibraryVideo[], options: {
  remoteOnly?: boolean;
  turn?: () => Promise<void>;
  newestResume: (...marks: Array<ProgressMark | undefined>) => ProgressMark | undefined;
}) {
  const turn = options.turn ?? yieldCatalogTask;
  const followIds = new Set(base.follows.map(channel => channel.id));
  const youtubeChannels = new Set(base.follows.filter(channel => channel.kind === 'youtube'
    && !channel.id.startsWith('ytpl:') && channel.channelId).map(channel => channel.channelId!));
  const incoming: LibraryVideo[] = [], counts = new Map<string, number>();
  await forEachCatalogSlice(rows, row => {
    if (options.remoteOnly && !shouldRestoreRemoteVideo(row, followIds, base.favorites, base.likes, youtubeChannels)) return;
    const video = catalogCard(row);
    incoming.push(video);
  }, turn);
  const videos = await mergeRemoteCatalogAsync(base.videos, incoming, { preferExisting: true, turn });
  await forEachCatalogSlice(videos, video => { if (!video.isSample) counts.set(video.folderId, (counts.get(video.folderId) ?? 0) + 1); }, turn);
  const progress = await reconcileRestoredResume(videos, base.progress, base.resumeProgress, options.newestResume, turn);
  return { videos, progress, counts, followIds };
}

export async function reconcileRestoredResume(videos: LibraryVideo[], progress: Record<string, ProgressMark>,
  resume: Record<string, ResumeMark>, newestResume: (...marks: Array<ProgressMark | undefined>) => ProgressMark | undefined,
  turn = yieldCatalogTask) {
  const hasRecords = async (record: Record<string, unknown>) => {
    let visited = 0, started = performance.now();
    await turn();
    for (const row of sparseRecordScan(record, false)) {
      if (row) return true;
      if (++visited >= 512 || performance.now() - started >= 4) {
        await turn(); visited = 0; started = performance.now();
      }
    }
    return false;
  };
  if (!await hasRecords(progress) && !await hasRecords(resume)) return progress;
  const recovered = new Map<string, ProgressMark>();
  await forEachCatalogSlice(videos, video => {
    const previous = progress[video.id];
    const mark = newestResume(previous, resume[`id:${video.id}`],
      video.remote?.watchUrl ? resume[video.remote.watchUrl] : undefined,
      video.remote?.embedUrl ? resume[video.remote.embedUrl] : undefined,
      video.src ? resume[video.src] : undefined, video.path ? resume[video.path] : undefined);
    if (mark && (!previous || previous.t !== mark.t || previous.d !== mark.d || previous.at !== mark.at)) {
      recovered.set(video.id, mark);
    }
  }, turn);
  if (!recovered.size) return progress;
  const next = sparseRecordBuilder(progress);
  await forEachCatalogEntry(recovered, ([id, mark]) => {
    next.set(id, mark);
  }, turn);
  return next.finish();
}

/** Rebase if a pull, resume update, favorite or unfollow changed any inputs
 * during preparation. Navigation and unrelated preferences never restart it. */
export function sameRestoreInputs(left: CatalogRestoreState, right: CatalogRestoreState) {
  return left.videos === right.videos && left.progress === right.progress && left.resumeProgress === right.resumeProgress
    && left.follows === right.follows && left.favorites === right.favorites && left.likes === right.likes;
}
