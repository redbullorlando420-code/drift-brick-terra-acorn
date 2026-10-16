import type { LibraryState } from './store';
import type { WatchTime } from '../media-feedback';
import type { LibraryVideo, ResumeMark } from './types';
import { ratingPreference, topicPreferenceScore } from './ranking-core';
import { isTopicTag, topicsForVideo } from './topics';
import { youtubeSourceIndex, youtubeSourceCounts } from '../remote/youtube-sources';
import { buildAdultStatsSnapshot } from './adult-stats';
import { rankAdultTags } from './adult-rank';
import { countAdultBySource, countAdultBooruHosts } from './adult-filter';
import { isAdultImageKind, isAdultPullKind } from './adult-sites';
export type StatsInput = Pick<LibraryState, 'videos' | 'folders' | 'tags' | 'favorites' | 'likes' | 'unavailable' | 'history' | 'cameCounts' | 'progress' | 'resumeProgress' | 'viewCounts' | 'pullHistory'> & { ratings: Record<string, number>; tagLikes: Record<string, true>; watchTime: Record<string, WatchTime> };
function watchTimeScore(time: WatchTime) { return Math.min(12, Math.floor(time.preview / 30) + Math.floor(time.fullscreen / 90) * 2 + Math.floor((time.previewEstimated ?? 0) / 90) + Math.floor((time.fullscreenEstimated ?? 0) / 180)); }
function resumeForVideo(state: Pick<StatsInput, 'progress' | 'resumeProgress'>, video: LibraryVideo): ResumeMark | undefined {
  let best: ResumeMark | undefined;
  for (const mark of [state.progress[video.id], ...[`id:${video.id}`, video.remote?.watchUrl, video.remote?.embedUrl, video.src, video.path].map(key => key ? state.resumeProgress[key] : undefined)]) {
    if (mark && Number.isFinite(mark.t) && Number.isFinite(mark.d) && Number.isFinite(mark.at) && mark.d > 0.25 && mark.d <= 30 * 24 * 60 * 60 && mark.t >= 0 && mark.t <= mark.d * 1.015 && (!best || mark.at! > best.at)) best = { t: Math.min(mark.t, mark.d), d: mark.d, at: mark.at! };
  }
  return best;
}
/** All complete-catalog aggregates run in a disposable worker, never in render. */
export function calculateLibraryStats(input: StatsInput) {
  const { videos, folders, tags, favorites, likes, history, cameCounts, progress, resumeProgress, viewCounts, pullHistory } = input;
  const getRating = (id: string) => input.ratings[id] ?? 0;
  const tagIsLiked = (tag: string) => Boolean(input.tagLikes[tag.trim().toLowerCase()]);
  const watchScores = (() => {
    const ledger = input.watchTime;
    const byId = new Map(videos.map((video) => [video.id, video]));
    const rows = Object.entries(ledger).flatMap(([id, time]) => {
      const video = byId.get(id);
      return video && (time.preview || time.fullscreen || time.previewEstimated || time.fullscreenEstimated) ? [{ video, ...time, score: watchTimeScore(time) }] : [];
    }).sort((a, b) => b.score - a.score || b.fullscreen - a.fullscreen);
    const tagTotals = new Map<string, { preview: number; fullscreen: number; previewEstimated: number; fullscreenEstimated: number }>();
    for (const row of rows) for (const tag of (tags[row.video.id] ?? []).slice(0, 20)) {
      const current = tagTotals.get(tag) ?? { preview: 0, fullscreen: 0, previewEstimated: 0, fullscreenEstimated: 0 };
      current.preview += row.preview; current.fullscreen += row.fullscreen; current.previewEstimated += row.previewEstimated ?? 0; current.fullscreenEstimated += row.fullscreenEstimated ?? 0; tagTotals.set(tag, current);
    }
    return { videos: rows.slice(0, 8), tags: [...tagTotals].map(([tag, time]) => ({ tag, ...time, score: watchTimeScore(time) })).sort((a, b) => b.score - a.score).slice(0, 8) };
  })();
  const summary = (() => {
    const byFolder = new Map<string, { videos: number; bytes: number }>();
    const byGenre = new Map<string, number>();
    const byTag = new Map<string, number>();
    const topicRatings = new Map<string, { total: number; rated: number; newest: number }>();
    let totalBytes = 0;
    let localTitles = 0;
    let remoteTitles = 0;
    let untaggedTitles = 0;
    let publicTopicTitles = 0;
    let savedTopicTitles = 0;
    let freshRemoteTitles = 0;
    let thumbReady = 0;
    let youtubeTitles = 0;
    let twitchTitles = 0;
    let liveTitles = 0;
    let knownDuration = 0;
    let durationTitles = 0;
    let resumedTitles = 0;
    let totalViews = 0;
    let metadataTaggedTitles = 0;
    let creatorTaggedTitles = 0;
    let descriptionTaggedTitles = 0;
    let multiTopicTitles = 0;
    let operationalTagAssignments = 0;
    const topicSources = new Map<string, Set<string>>();
    const adultFolders = new Set(folders.filter(folder => folder.adult).map(folder => folder.id));
    for (const video of videos) {
      totalBytes += video.size;
      if (video.remote) remoteTitles += 1; else localTitles += 1;
      if (video.poster) thumbReady += 1;
      if (video.remote?.kind === "youtube") youtubeTitles += 1;
      if (video.remote?.kind === "twitch") twitchTitles += 1;
      if (video.remote?.live) liveTitles += 1;
      if ((video.duration ?? 0) > 0) { knownDuration += video.duration ?? 0; durationTitles += 1; }
      if (resumeForVideo({ progress, resumeProgress }, video)?.t) resumedTitles += 1;
      totalViews += viewCounts[video.id] ?? 0;
      const videoTags = tags[video.id] ?? [];
      // Adult tags have their own scored taxonomy above. Do not let generic
      // provider keywords (for example "music") displace library topics.
      const adultRemote = adultFolders.has(video.folderId) || ["eporner", "redtube", "chaturbate", "myfreecams", "reddit", "booru", "redgifs"].includes(video.remote?.kind ?? "");
      const usefulTopics = adultRemote ? new Set<string>() : new Set(topicsForVideo(video, videoTags));
      if (!adultRemote) {
        publicTopicTitles++;
        if (videoTags.some(isTopicTag)) savedTopicTitles++;
      }
      if (videoTags.length) metadataTaggedTitles += 1;
      if (video.remote?.channelName?.trim()) creatorTaggedTitles += 1;
      if (video.description?.trim()) descriptionTaggedTitles += 1;
      if (!adultRemote && !usefulTopics.size) untaggedTitles += 1;
      for (const topic of usefulTopics) {
        byTag.set(topic, (byTag.get(topic) ?? 0) + 1);
        const rating = topicRatings.get(topic) ?? { total: 0, rated: 0, newest: 0 };
        const stars = getRating(video.id);
        const feedback = stars === 1 ? -3 : Math.max(ratingPreference(stars), favorites[video.id] ? 3 : likes[video.id] ? 1 : 0);
        rating.total += feedback; if (stars > 0 || feedback !== 0) rating.rated++; rating.newest = Math.max(rating.newest, video.addedAt);
        topicRatings.set(topic, rating);
        const sources = topicSources.get(topic) ?? new Set<string>();
        sources.add(video.remote?.kind ?? 'local');
        topicSources.set(topic, sources);
      }
      if (usefulTopics.size >= 2) multiTopicTitles += 1;
      if (video.remote && Date.now() - video.addedAt < 7 * 24 * 60 * 60_000) freshRemoteTitles += 1;
      const folder = byFolder.get(video.folderId) ?? { videos: 0, bytes: 0 };
      folder.videos += 1;
      folder.bytes += video.size;
      byFolder.set(video.folderId, folder);
      if (video.genre?.trim()) byGenre.set(video.genre, (byGenre.get(video.genre) ?? 0) + 1);
      for (const tag of videoTags) {
        const clean = tag.trim().toLowerCase();
        if (/^(?:year-|month-|day-|type-|provider-|format-|source-|keyword-|creator-|https?$)/.test(clean)) operationalTagAssignments += 1;

      }
    }
    const tagAssignments = [...byTag.values()].reduce((sum, count) => sum + count, 0);
    const bridgeTopics = [...topicSources.values()].filter((sources) => sources.size >= 2).length;
    const topicRows = [...byTag.entries()].filter(([, count]) => count >= 2).sort((a, b) => {
      const aRating = topicPreferenceScore(topicRatings.get(a[0])?.total ?? 0, topicRatings.get(a[0])?.rated ?? 0, tagIsLiked(a[0]));
      const bRating = topicPreferenceScore(topicRatings.get(b[0])?.total ?? 0, topicRatings.get(b[0])?.rated ?? 0, tagIsLiked(b[0]));
      return bRating - aRating || (topicRatings.get(b[0])?.newest ?? 0) - (topicRatings.get(a[0])?.newest ?? 0) || b[1] - a[1] || a[0].localeCompare(b[0]);
    });
    // “Most useful” is driven by saved reactions. An unrated topic may still
    // be useful for browsing, but it must not displace a topic with evidence.
    const ratedTopicRows = topicRows.filter(([topic]) => tagIsLiked(topic) || (topicRatings.get(topic)?.total ?? 0) > 0);
    return { publicTopicTitles, savedTopicTitles, totalBytes, byFolder, localTitles, remoteTitles, untaggedTitles, metadataTaggedTitles, creatorTaggedTitles, descriptionTaggedTitles, multiTopicTitles, operationalTagAssignments, bridgeTopics, freshRemoteTitles, thumbReady, youtubeTitles, twitchTitles, liveTitles, knownDuration, durationTitles, resumedTitles, totalViews, genreRows: [...byGenre.entries()].filter(([, count]) => count >= 2).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])), topicRows, topicRatings, topTags: ratedTopicRows.slice(0, 24), tagAssignments, tagDensity: tagAssignments / Math.max(publicTopicTitles, 1), remoteShare: remoteTitles / Math.max(videos.length, 1) };
  })();
  const { distinctVideos, duplicateRows, duplicateGroups } = youtubeSourceIndex(videos);
  const youtubeHealth = { distinctVideos, duplicateRows, duplicateGroups };
  const youtubeMappedCounts = youtubeSourceCounts(videos, folders.filter(folder => folder.kind === "youtube"));
  const folderRows = (() => folders.filter((folder) => folder.kind !== "demo").map((folder) => {
    const primary = summary.byFolder.get(folder.id) ?? { videos: 0, bytes: 0 };
    return {folder,...primary,videos:folder.kind === "youtube" ? youtubeMappedCounts.get(folder.id) ?? primary.videos : primary.videos};
  }).sort((a, b) => b.bytes - a.bytes || b.videos - a.videos || a.folder.name.localeCompare(b.folder.name)))();
  const topicReviewQueue = (() => {
    const adultIds = new Set(folders.filter(folder => folder.adult).map(folder => folder.id));
    const queue: LibraryVideo[] = [];
    for (const video of videos) {
      if (!adultIds.has(video.folderId) && !isAdultPullKind(video.remote?.kind) && !topicsForVideo(video, tags[video.id]).length) queue.push(video);
      if (queue.length >= 500) break;
    }
    return queue;
  })();
  let adultSnapshot: ReturnType<typeof buildAdultStatsSnapshot>;
  const adultTagStats = (() => {
    const adultFolderIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
    const adultVideos = videos.filter((video) => adultFolderIds.has(video.folderId) || Boolean(video.remote && ["eporner", "redtube", "chaturbate", "myfreecams", "reddit", "booru", "redgifs"].includes(video.remote.kind)));
    const ranked = rankAdultTags(adultVideos, { tags, favorites, likes, cameCounts, viewCounts, ratingOf: getRating }, 80);
    const fetish = ranked.filter((row) => !row.tag.startsWith("source-") && !row.tag.startsWith("provider-") && !row.tag.startsWith("format-"));
    const sources = ranked.filter((row) => row.tag.startsWith("source-") || row.tag.startsWith("provider-") || row.tag.startsWith("sub-"));
    const bySource = countAdultBySource(adultVideos);
    const snapshot = adultSnapshot = buildAdultStatsSnapshot(videos, folders, tags, { favorites, likes, cameCounts, viewCounts, ratingOf: getRating });
    const kindCounts = { videos: 0, live: 0, photos: 0 };
    let adultViews = 0;
    let adultWatchSeconds = 0;
    let adultRated = 0;
    for (const video of adultVideos) {
      if (video.remote?.live || video.remote?.kind === "chaturbate" || video.remote?.kind === "myfreecams") kindCounts.live += 1;
      else if (isAdultImageKind(video.remote?.kind, video.mime, video.extension)) kindCounts.photos += 1;
      else kindCounts.videos += 1;
      adultViews += viewCounts[video.id] ?? 0;
      adultWatchSeconds += progress[video.id]?.t ?? resumeProgress[video.id]?.t ?? 0;
      if (getRating(video.id) > 0) adultRated += 1;
    }
    const booruHosts = countAdultBooruHosts(adultVideos);
    const adultVideoIds = new Set(adultVideos.map(video => video.id));
    const historyAdult = history.filter((entry) => adultVideoIds.has(entry.id)).length;
    return {
      adultTitles: adultVideos.length,
      sourceMix: Object.entries(bySource).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])),
      topFetish: fetish.slice(0, 24).map((row) => [row.tag, row.count] as const),
      topSources: sources.slice(0, 16).map((row) => [row.tag, row.count] as const),
      rankedPreview: ranked.slice(0, 12),
      providerMix: snapshot.providerMix,
      genres: snapshot.genres.slice(0, 12),
      metaTags: snapshot.metaTags.slice(0, 12),
      adultTagCoverage: snapshot.adultTagCoverage,
      previewCoverage: snapshot.previewCoverage,
      creatorCoverage: snapshot.creatorCoverage,
      tagQuality: snapshot.tagQuality,
      dedupe: snapshot.dedupe,
      redditTags: snapshot.redditTags.slice(0, 12),
      tagConnections: snapshot.tagConnections.slice(0, 12),
      noisyTagAssignments: snapshot.noisyTagAssignments,
      kindCounts,
      booruHosts,
      adultViews,
      adultWatchHours: adultWatchSeconds / 3600,
      adultRated,
      historyAdult,
      sparseTags: ranked.filter((row) => row.count === 1).length,
    };
  })();
    const favoriteHealth = (() => {
    const videoIds = new Set(videos.map((video) => video.id));
    const saved = Object.keys(favorites);
    return { saved: saved.length, resolved: saved.filter((id) => videoIds.has(id)).length, missing: saved.filter((id) => !videoIds.has(id)).length };
  })();
  const sourceHealth = (() => {
    const names = new Map<string, number>();
    for (const { folder } of folderRows) names.set(folder.name.trim().toLowerCase(), (names.get(folder.name.trim().toLowerCase()) ?? 0) + 1);
    const duplicateNames = [...names.entries()].filter(([, count]) => count > 1).map(([name, count]) => ({ name, count }));
    const largest = folderRows[0];
    return { duplicateNames, largest, concentration: largest ? Math.round(largest.bytes / Math.max(summary.totalBytes, 1) * 100) : 0 };
  })();
  const pullTotals = ({
    runs: pullHistory.length,
    successful: pullHistory.filter((run) => run.status === "success").length,
    partial: pullHistory.filter((run) => run.status === "partial").length,
    failed: pullHistory.filter((run) => run.status === "failed").length,
    checked: pullHistory.reduce((sum, run) => sum + run.done, 0),
    returned: pullHistory.reduce((sum, run) => sum + run.received, 0),
    added: pullHistory.reduce((sum, run) => sum + run.added, 0),
  });

  const markedRows = Object.entries(cameCounts).filter(([, n]) => n > 0).sort((a,b) => b[1]-a[1]);
  const byId = new Map(videos.map(video => [video.id, video]));
  return { watchScores, summary, youtubeHealth, youtubeMappedCounts, folderRows, topicReviewQueue, adultTagStats, favoriteHealth, sourceHealth, pullTotals, unavailableCount: Object.keys(input.unavailable ?? {}).length, adultSnapshot: adultSnapshot!, markedTitles: markedRows.length, totalMarks: markedRows.reduce((sum, row) => sum + row[1], 0), markedRows: markedRows.slice(0,6).map(([id,n]) => ({ id,n,name: byId.get(id)?.name ?? id })) };
}
export type LibraryStats = ReturnType<typeof calculateLibraryStats>;
