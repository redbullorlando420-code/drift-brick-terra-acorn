import { useEffect, useMemo, useState } from "react";
import { rankTwitchVods } from "@/lib/videos/twitch-vod-ranking";
import { useLibrary } from "@/lib/videos/store";
import { getRating, ratingPreference, getWatchTime, watchTimeScore } from "@/lib/media-feedback";
import { topicEvidenceForScan } from "@/lib/videos/topics";
import { hasFreshViewerCount, type LibraryVideo } from "@/lib/videos/types";
import { useSessionPhase } from "@/lib/use-session-phase";
const EMPTY: LibraryVideo[] = [];
export function useTwitchVodRanking(
  active: boolean,
  videos: readonly LibraryVideo[],
  tags: Record<string, string[]>,
  favorites: Record<string, true>,
  likes: Record<string, true>,
  viewCounts: Record<string, number>,
  highlyRatedTags: ReadonlySet<string>,
  revision: number,
  ready = true,
) {
  const scope = useMemo(
    () => ({ videos, tags, favorites, likes, viewCounts, highlyRatedTags, revision }),
    [videos, tags, favorites, likes, viewCounts, highlyRatedTags, revision],
  );
  const viewer = useLibrary((state) => Boolean(state.activeId || state.previewId));
  const phase = useSessionPhase();
  const [packet, setPacket] = useState<{ scope: typeof scope; rows: LibraryVideo[] }>();
  useEffect(() => {
    if (!active) {
      setPacket(undefined);
      return;
    }
    if (viewer || phase !== "active" || !ready || packet?.scope === scope) return;
    const controller = new AbortController(),
      now = Date.now();
    const score = (video: LibraryVideo) => {
      const rating = getRating(video.id);
      return (
        (hasFreshViewerCount(video.remote, now) ? (video.remote?.viewers ?? 0) : 0) +
        ratingPreference(rating) * 40 +
        (rating === 1 ? 0 : watchTimeScore(getWatchTime(video.id))) +
        (favorites[video.id] ? 28 : 0) +
        (likes[video.id] ? 16 : 0) +
        (viewCounts[video.id] ?? 0) * 5 +
        topicEvidenceForScan(video, tags[video.id]).reduce((count, link) => count + Number(highlyRatedTags.has(link.topic)), 0) * 8
      );
    };
    void rankTwitchVods(videos, score, controller.signal)
      .then((rows) => {
        if (!controller.signal.aborted) setPacket({ scope, rows });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [active, scope, viewer, phase, ready]);
  // Activity changes can refresh ordering without removing an entire painted
  // shelf. Catalog changes (including hidden titles) never reuse old rows.
  return { rows: active && packet?.scope.videos === videos ? packet.rows : EMPTY,
    pending: active && packet?.scope !== scope };
}
