import type { FollowedChannel, HistoryEntry, LibraryVideo, ProgressMark } from "./types";

export type FollowRemovalState = {
  follows: FollowedChannel[];
  videos: LibraryVideo[];
  favorites: Record<string, true>;
  likes: Record<string, true>;
  progress: Record<string, ProgressMark>;
  resumeProgress: Record<string, ProgressMark>;
  history: HistoryEntry[];
};

export type FollowRemovalPlan = {
  followIds: Set<string>;
  channels: Array<{ follow: FollowedChannel; catalogRows: number; keptRows: number; removedRows: number }>;
  retainedVideoIds: Set<string>;
  replacementSources: Map<string, string>;
  keptRows: number;
  removedRows: number;
};

/** The review and the store mutation share this calculation so counts match the result. */
export function planFollowRemoval(
  state: FollowRemovalState,
  requestedIds: Iterable<string>,
  feedback: { ratings?: Record<string, number>; notes?: Record<string, string> } = {},
): FollowRemovalPlan {
  const requested = new Set(requestedIds);
  const channels = state.follows.filter((follow) => requested.has(follow.id)).map((follow) => ({ follow, catalogRows: 0, keptRows: 0, removedRows: 0 }));
  const byId = new Map(channels.map((row) => [row.follow.id, row]));
  const historyIds = new Set(state.history.map((entry) => entry.id));
  const legacySavedIds = new Set<string>();
  if (typeof localStorage !== "undefined") {
    try {
      for (let index = 0; index < localStorage.length; index += 1) {
        const key = localStorage.key(index);
        if (key?.startsWith("reelcase.rating.") && Number(localStorage.getItem(key)) > 0) legacySavedIds.add(key.slice("reelcase.rating.".length));
        if (key?.startsWith("reelcase.note.") && localStorage.getItem(key)?.trim()) legacySavedIds.add(key.slice("reelcase.note.".length));
      }
    } catch { /* Current feedback and other save signals remain available. */ }
  }
  const retainedVideoIds = new Set<string>();
  const replacementSources = new Map<string, string>();
  const remainingIds = new Set(state.follows.filter(follow => !requested.has(follow.id)).map(follow => follow.id));
  const remainingYoutubeChannels = new Map(state.follows.filter(follow => follow.kind === "youtube" && !follow.id.startsWith("ytpl:") && follow.channelId && remainingIds.has(follow.id)).map(follow => [follow.channelId!, follow.id]));
  let keptRows = 0;
  let removedRows = 0;
  for (const video of state.videos) {
    const channel = byId.get(video.folderId);
    if (!channel) continue;
    channel.catalogRows += 1;
    const replacement = video.remote?.kind === "youtube"
      ? video.remote.sourceIds?.find(id => remainingIds.has(id)) ?? remainingYoutubeChannels.get(video.remote.channelId ?? "") : undefined;
    if (replacement) replacementSources.set(video.id, replacement);
    const keep = Boolean(replacement || state.favorites[video.id] || state.likes[video.id] || historyIds.has(video.id)
      || (state.progress[video.id]?.t ?? 0) > 0 || (state.resumeProgress[video.id]?.t ?? 0) > 0
      || (feedback.ratings?.[video.id] ?? 0) > 0 || Boolean(feedback.notes?.[video.id]?.trim()) || legacySavedIds.has(video.id));
    if (keep) { retainedVideoIds.add(video.id); channel.keptRows += 1; keptRows += 1; }
    else { channel.removedRows += 1; removedRows += 1; }
  }
  return { followIds: new Set(channels.map((row) => row.follow.id)), channels, retainedVideoIds, replacementSources, keptRows, removedRows };
}

export function retainVideosAfterUnfollow(videos: LibraryVideo[], plan: FollowRemovalPlan): LibraryVideo[] {
  return videos.flatMap((video) => {
    const sourceIds = video.remote?.sourceIds?.filter(id => !plan.followIds.has(id));
    const cleaned = sourceIds && sourceIds.length !== video.remote?.sourceIds?.length ? {...video,remote:{...video.remote!,sourceIds}} : video;
    if (!plan.followIds.has(video.folderId)) return [cleaned];
    const replacement = plan.replacementSources.get(video.id);
    if (replacement) return [{...cleaned,folderId:replacement}];
    return plan.retainedVideoIds.has(video.id) ? [{...cleaned,retainedAfterUnfollow:true}] : [];
  });
}

/** Durable marker protects locally kept cards before activity stores finish restoring. */
export function shouldRestoreRemoteVideo(video: LibraryVideo, activeFollowIds: Set<string>, favorites: Record<string, true>, likes: Record<string, true>, activeYoutubeChannelIds?: Set<string>): boolean {
  return activeFollowIds.has(video.folderId)
    || Boolean(video.remote?.kind === "youtube" && (video.remote.sourceIds?.some(id => activeFollowIds.has(id)) || activeYoutubeChannelIds?.has(video.remote.channelId ?? "")))
    || Boolean(favorites[video.id] || likes[video.id] || video.retainedAfterUnfollow);
}
