import { getRecommendationExposure } from '@/lib/recommendation-exposure-store';
import { useEffect, useMemo, useState } from "react";
import { rankTwitchVods } from "@/lib/videos/twitch-vod-ranking";
import { prepareTwitchRecommendationScore } from '@/lib/videos/twitch-recommendations';
import { useLibrary } from "@/lib/videos/store";
import { getRating, getWatchTime, watchTimeScore, getRecommendationRejections, creatorIsFavorited, recommendationTopicIsLiked } from "@/lib/media-feedback";
import { type LibraryVideo } from "@/lib/videos/types";
import { useSessionPhase } from "@/lib/use-session-phase";
const EMPTY: LibraryVideo[] = [];
export function useTwitchVodRanking(
  active: boolean,
  videos: readonly LibraryVideo[],
  tags: Record<string, string[]>,
  favorites: Record<string, true>,
  likes: Record<string, true>,
  viewCounts: Record<string, number>,
  revision: number,
) {
  const scope = useMemo(
    () => ({ videos, tags, favorites, likes, viewCounts, revision }),
    [videos, tags, favorites, likes, viewCounts, revision],
  );
  const viewer = useLibrary((state) => Boolean(state.activeId || state.previewId));
  const phase = useSessionPhase();
  const [packet, setPacket] = useState<{ scope: typeof scope; rows: LibraryVideo[] }>();
  useEffect(() => {
    if (!active) {
      setPacket(undefined);
      return;
    }
    if (viewer || phase !== "active" || packet?.scope === scope) return;
    const controller = new AbortController(),
      now = Date.now();
    void prepareTwitchRecommendationScore(videos, { tags, favorites, likes, viewCounts, rating: getRating,
      watchScore: id => watchTimeScore(getWatchTime(id)), now, recommendationExposure: getRecommendationExposure(), recommendationRejections: getRecommendationRejections(), creatorIsFavorited, tagIsLiked: recommendationTopicIsLiked }, controller.signal)
      .then(score => rankTwitchVods(videos, score, controller.signal))
      .then((rows) => {
        if (!controller.signal.aborted) setPacket({ scope, rows });
      })
      .catch(() => {});
    return () => controller.abort();
  }, [active, scope, viewer, phase]);
  // Activity changes can refresh ordering without removing an entire painted
  // shelf. Catalog changes (including hidden titles) never reuse old rows.
  return { rows: active && packet?.scope.videos === videos ? packet.rows : EMPTY,
    pending: active && packet?.scope !== scope };
}
