import { registerHooks } from "node:module";
registerHooks({
  resolve(specifier, context, next) {
    if (specifier.startsWith("@/"))
      return next(
        new URL("../../src/" + specifier.slice(2) + ".ts", import.meta.url).href,
        context,
      );
    try {
      return next(specifier, context);
    } catch (error) {
      if (specifier.startsWith(".") && !/\.[a-z]+$/i.test(specifier))
        return next(specifier + ".ts", context);
      throw error;
    }
  },
});
const [
  { prepareGuide, answerGuideQuery },
  { rankYoutubeRecommendations },
  { prepareTwitchRecommendationScore },
  { rankTwitchVods },
  { ratingPreference },
] = await Promise.all([
  import("../../src/lib/videos/guide-picks.ts"),
  import("../../src/lib/remote/youtube-recommendations.ts"),
  import("../../src/lib/videos/twitch-recommendations.ts"),
  import("../../src/lib/videos/twitch-vod-ranking.ts"),
  import("../../src/lib/videos/ranking-core.ts"),
]);
const day = 86400000,
  turn = async () => {};
const flags = (ids) => Object.fromEntries((ids ?? []).map((id) => [id, true]));
export async function productionRecommendationRanking(corpus, entry) {
  const byId = new Map(corpus.items.map((item) => [item.id, item])),
    ids = [...new Set([...(entry.signalIds ?? []), ...entry.candidateIds])],
    feedback = entry.feedback ?? {};
  const videos = ids.map((id) => {
    const row = byId.get(id),
      published = row.publishedDaysAgo === null ? 0 : corpus.now - row.publishedDaysAgo * day,
      added = row.addedDaysAgo === undefined ? published : corpus.now - row.addedDaysAgo * day;
    return {
      id: row.id,
      name: row.title,
      path: "",
      extension: "mp4",
      mime: "video/mp4",
      size: 0,
      duration: 1200,
      folderId: row.private
        ? "private:" + row.creator
        : (row.source === "twitch" ? "tw:" : row.source === "youtube" ? "yt:" : "local:") +
          row.creator,
      genre: row.topics[0],
      addedAt: row.source === "youtube" ? published : added,
      ...(row.source === "local"
        ? {}
        : {
            remote: {
              kind: row.source,
              videoId: row.canonicalId ?? row.id,
              channelId: row.creator,
              channelName: row.creator,
              live: false,
              ...(row.source === "youtube"
                ? {
                    youtubeType: "upload",
                    publishedSource: published ? "provider" : "unknown",
                    publishedPrecision: published ? "instant" : "unknown",
                  }
                : {}),
            },
          }),
    };
  });
  const tags = Object.fromEntries(ids.map((id) => [id, [...byId.get(id).tags]])),
    favorites = flags(feedback.favorites),
    likes = flags(feedback.likes),
    history = (feedback.history ?? []).map((id) => ({ id, at: corpus.now - day })),
    rating = (id) => feedback.ratings?.[id] ?? 0,
    watchScore = (id) => feedback.watchScores?.[id] ?? 0,
    candidates = videos.filter((video) => entry.candidateIds.includes(video.id));
  const shuffle = (id) => {
    let value = corpus.seed;
    for (const char of id) value = Math.imul(value ^ char.charCodeAt(0), 0x45d9f3b);
    return value >>> 0;
  };
  if (entry.ranker === "youtube")
    return rankYoutubeRecommendations(
      videos,
      {
        tags,
        favorites,
        likes,
        history,
        viewCounts: feedback.viewCounts ?? {},
        ratingOf: rating,
        watchScore,
        ratingPreference,
        tagIsLiked: (tag) => (feedback.likedTags ?? []).includes(tag),
        tagHasHeartHistory: () => false,
        creatorIsLiked: (creator) => (feedback.likedCreators ?? []).includes(creator),
        creatorRating: () => 0,
        now: corpus.now,
        limit: entry.k,
        shuffle,
      },
      candidates,
    ).map((video) => video.id);
  if (entry.ranker === "twitch") {
    const score = await prepareTwitchRecommendationScore(
      videos,
      {
        tags,
        favorites,
        likes,
        viewCounts: feedback.viewCounts ?? {},
        rating,
        watchScore,
        now: corpus.now,
      },
      undefined,
      turn,
    );
    return (await rankTwitchVods(candidates, score, undefined, turn))
      .slice(0, entry.k)
      .map((video) => video.id);
  }
  const input = {
    videos,
    tags,
    favorites,
    likes,
    history,
    hidden: flags(feedback.hidden),
    unavailable: flags(feedback.unavailable),
    folders: videos.map((video) => ({
      id: video.folderId,
      adult: video.folderId.startsWith("private:"),
    })),
  };
  const output =
    entry.ranker === "guide-query"
      ? (await answerGuideQuery(input, entry.prompt, corpus.seed, corpus.now, turn)).picks
      : (await prepareGuide(input, corpus.seed, corpus.now, turn)).picks;
  return output.slice(0, entry.k).map((video) => video.id);
}
