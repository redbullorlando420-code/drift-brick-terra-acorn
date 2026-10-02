import { bestRanked } from './bounded-ranking';
import { rankingTags, ratingPreference, confidenceAdjustedPreference } from './ranking-core';
import type { LibraryVideo } from "./types";
import { isAdultImageKind } from "./adult-sites";
import { videoMatchesAdultSource, videoMatchesAdultTag } from "./adult-filter";
import { ADULT_TOP_TAG_RAIL_MIN_COUNT, rankAdultMetaTags, rankAdultTags, scoreAdultVideo, sortAdultVideos, type AdultRankContext } from "./adult-rank";

export type AdultBrowseParams = { source: string; tag: string; view: "all" | "videos" | "photos" | "live"; limit: number; seed: number };
export type AdultBrowseSignals = {
  favorites: Record<string, boolean | number>; likes: Record<string, boolean | number>;
  cameCounts: Record<string, number>; viewCounts: Record<string, number>;
  ratings: Record<string, number>; heartedTags: string[]; historicTags: string[];
  continueIds: string[]; favoriteIds: string[];
  creatorLikes?: Record<string, true>; creatorFavorites?: Record<string, true>; creatorRatings?: Record<string, number>; watchScores?: Record<string, number>;
};
export type AdultBrowseData = { videos: LibraryVideo[]; personalVideos: LibraryVideo[]; deepVideos: LibraryVideo[]; tags: Record<string, string[]>; signals: AdultBrowseSignals };

/** Worker-owned bounded caches. Catalog arrays are stable between refreshes;
 * signal updates clear only ranked results, while catalog chunks clear all. */
export type AdultBrowseCache = {
  sourceMatched: Map<string, LibraryVideo[]>;
  ranked: Map<string, LibraryVideo[]>;
  tagRanks: Map<string, ReturnType<typeof rankAdultTags>>;
  metaTagRanks: Map<string, ReturnType<typeof rankAdultMetaTags>>;
  deepRankedIds?: string[];
  scores?: Map<string, number>;
  topicAffinity?: Record<string, number>;
  signalIdentity?: AdultBrowseSignals;
};

export function createAdultBrowseCache(): AdultBrowseCache {
  return { sourceMatched: new Map(), ranked: new Map(), tagRanks: new Map(), metaTagRanks: new Map() };
}

function shuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
  return value >>> 0;
}
/**
 * Adult catalog quality still leads, but each rail gets a time-stamped shuffle
 * inside a bounded rank window. That rotates fresh cards into view without
 * letting low-signal results displace the useful part of the catalog.
 */
function rotateAdultRail<T extends { id: string; poster?: string; remote?: { previewUrl?: string; channelName?: string } }>(items: T[], rail: string, seed: number, limit = items.length): T[] {
  // Keep a deliberately wide, bounded candidate window. The former 28-card
  // window made every Adult shelf converge on the same highly-ranked titles.
  // Provider posters and preview URLs are cheap, already-known artwork, so a
  // modest bonus makes the opening screen useful while the rest of a large
  // catalog remains lazy.
  const windowSize = Math.min(items.length, Math.max(96, limit * 8));
  const rankStride = Math.max(18, limit * 1.5);
  return diversifyCreators(items.slice(0, windowSize)
    .map((video, index) => ({
      video,
      rank: index / rankStride
        + (shuffleRank(`${rail}:${video.id}`, seed) / 0xffffffff) * 8
        - (video.poster || video.remote?.previewUrl ? 2.25 : 0),
    }))
    .sort((a, b) => a.rank - b.rank)
    .slice(0, limit)
    .map(({ video }) => video), limit);
}
function diversifyCreators<T extends { id: string; remote?: { channelName?: string } }>(items: T[], limit = 48): T[] {
  const groups = new Map<string, T[]>();
  const seenIds = new Set<string>();
  for (const item of items) {
    // Provider retries can retain a card while a refreshed duplicate arrives.
    // Deduplicate before round-robin so one tag shelf never renders a title twice.
    if (seenIds.has(item.id)) continue;
    seenIds.add(item.id);
    const key = item.remote?.channelName?.trim().toLowerCase() || "local";
    const group = groups.get(key) ?? [];
    group.push(item);
    groups.set(key, group);
  }
  const rows = [...groups.values()];
  const result: T[] = [];
  // Round-robin keeps a high-view creator represented without allowing one
  // channel to occupy an entire discovery/topic rail.
  for (let index = 0; result.length < limit; index += 1) {
    let added = false;
    for (const group of rows) {
      const item = group[index];
      if (!item) continue;
      result.push(item);
      added = true;
      if (result.length >= limit) break;
    }
    if (!added) break;
  }
  return result;
}

/**
 * A personal rail should not become a single-provider rail just because that
 * provider had the freshest batch. Keep the ranking within every provider,
 * then take one candidate per provider on each pass. Creator diversity runs
 * first, so this is a second guardrail rather than a blunt shuffle.
 */
function diversifyAdultSources<T extends { remote?: { kind?: string } }>(items: T[], limit = 48): T[] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const source = item.remote?.kind?.trim().toLowerCase() || "local";
    const group = groups.get(source) ?? [];
    group.push(item);
    groups.set(source, group);
  }
  const rows = [...groups.values()];
  const result: T[] = [];
  for (let index = 0; result.length < limit; index += 1) {
    let added = false;
    for (const row of rows) {
      const item = row[index];
      if (!item) continue;
      result.push(item);
      added = true;
      if (result.length >= limit) break;
    }
    if (!added) break;
  }
  return result;
}


export function buildAdultBrowseModel(data: AdultBrowseData, params: AdultBrowseParams, cache?: AdultBrowseCache) {
  const { videos: adultRemoteVideos, tags, signals } = data;
  const { favorites, likes, cameCounts, viewCounts } = signals;
  const { source: adultSource, tag: adultTag, view: adultView, limit: adultRailLimit, seed: adultRailSeed } = params;
  if (cache && cache.signalIdentity !== signals) {
    cache.signalIdentity = signals; cache.scores?.clear(); cache.topicAffinity = undefined;
    cache.ranked.clear(); cache.tagRanks.clear(); cache.metaTagRanks.clear(); cache.deepRankedIds = undefined;
  }
  let topicAffinity = cache?.topicAffinity;
  if (!topicAffinity) {
    const evidence = new Map<string, { total: number; count: number }>();
    for (const video of adultRemoteVideos) {
      const rating = signals.ratings[video.id] ?? 0;
      const signal = rating === 1 ? -3 : Math.max(ratingPreference(rating), favorites[video.id] ? 3 : 0, likes[video.id] ? 2 : 0)
        + Math.min(2, Math.log2(1 + Math.max(0, cameCounts[video.id] ?? 0))) + Math.min(2, (signals.watchScores?.[video.id] ?? 0) / 6);
      if (!signal && !rating) continue;
      for (const tag of rankingTags(tags[video.id] ?? [])) {
        const row = evidence.get(tag) ?? { total: 0, count: 0 }; row.total += signal; row.count++; evidence.set(tag, row);
      }
    }
    topicAffinity = Object.create(null) as Record<string, number>;
    for (const [tag, row] of evidence) topicAffinity[tag] = Math.max(-12, Math.min(12, confidenceAdjustedPreference(row.total, row.count) * 4));
    if (cache) cache.topicAffinity = topicAffinity;
  }
  const getRating = (id: string) => signals.ratings[id] ?? 0;
  const hearts = new Set(signals.heartedTags), historic = new Set(signals.historicTags);
  const adultRankCtx: AdultRankContext = { tags, favorites, likes, cameCounts, viewCounts, ratingOf: getRating, tagIsHearted: tag => hearts.has(tag), tagHasHeartHistory: tag => historic.has(tag), now: Date.now(),
    watchScore: id => signals.watchScores?.[id] ?? 0,
    creatorIsLiked: name => Boolean(signals.creatorLikes?.[name.trim().toLowerCase()]),
    creatorIsFavorited: name => Boolean(signals.creatorFavorites?.[name.trim().toLowerCase()]),
    creatorRating: name => signals.creatorRatings?.[name.trim().toLowerCase()] ?? 0,
    topicAffinity, scores: cache ? (cache.scores ??= new Map()) : new Map() };
  const byId = new Map([...adultRemoteVideos, ...data.personalVideos].map(video => [video.id, video]));
  const adultContinue = signals.continueIds.map(id => byId.get(id)).filter((v): v is LibraryVideo => Boolean(v));
  const adultFavorites = signals.favoriteIds.map(id => byId.get(id)).filter((v): v is LibraryVideo => Boolean(v));
  const markedAdult = adultRemoteVideos.filter(v => (cameCounts[v.id] ?? 0) > 0).sort((a,b) => cameCounts[b.id] - cameCounts[a.id]);
  let sourceMatchedAdult = cache?.sourceMatched.get(adultSource);
  if (!sourceMatchedAdult) {
    sourceMatchedAdult = adultRemoteVideos.filter(video => videoMatchesAdultSource(video, adultSource));
    if (cache) {
      if (cache.sourceMatched.size >= 12) cache.sourceMatched.delete(cache.sourceMatched.keys().next().value!);
      cache.sourceMatched.set(adultSource, sourceMatchedAdult);
    }
  }
  const adultKind = (video: LibraryVideo) => video.remote?.live || ["chaturbate", "myfreecams"].includes(video.remote?.kind ?? "") ? "live" : isAdultImageKind(video.remote?.kind, video.mime, video.extension) ? "photos" : "videos";
  const filteredEporner = sourceMatchedAdult.filter(video => (adultView === "all" || adultKind(video) === adultView) && videoMatchesAdultTag(video, adultTag, tags));
  const rankKey = `${adultSource}\u0000${adultView}\u0000${adultTag}`;
  let rankedAdultCatalog = cache?.ranked.get(rankKey);
  if (!rankedAdultCatalog) {
    rankedAdultCatalog = sortAdultVideos(filteredEporner, adultRankCtx);
    if (cache) {
      if (cache.ranked.size >= 8) cache.ranked.delete(cache.ranked.keys().next().value!);
      cache.ranked.set(rankKey, rankedAdultCatalog);
    }
  }
  let adultTagRank = cache?.tagRanks.get(adultSource);
  if (!adultTagRank) {
    adultTagRank = rankAdultTags(sourceMatchedAdult, adultRankCtx, 48);
    if (cache) cache.tagRanks.set(adultSource, adultTagRank);
  }
  const adultOverviewRails = (() => {
    const videos = rotateAdultRail(rankedAdultCatalog.filter((video) => adultKind(video) === "videos"), "overview-videos", adultRailSeed, adultRailLimit);
    const photos = rotateAdultRail(rankedAdultCatalog.filter((video) => adultKind(video) === "photos"), "overview-photos", adultRailSeed, adultRailLimit);
    const alreadyShown = new Set([...videos, ...photos].map((video) => video.id));
    const picks = rotateAdultRail(rankedAdultCatalog.filter((video) => adultKind(video) !== "live" && !alreadyShown.has(video.id)), "overview-picks", adultRailSeed, adultRailLimit);
    return { videos, photos, picks };
  })();
  const adultTopTagRails = (() => {
    if (adultTag !== "All") return [] as Array<{ tag: string; score: number; count: number; videos: LibraryVideo[] }>;
    // Tag shelves should lead a viewer into different parts of the catalog,
    // rather than restating the cards from the overview and the preceding tag.
    const claimed = new Set([
      ...adultOverviewRails.videos,
      ...adultOverviewRails.photos,
      ...adultOverviewRails.picks,
    ].map((video) => video.id));
    return adultTagRank
      .filter((row) => row.count >= ADULT_TOP_TAG_RAIL_MIN_COUNT)
      .slice(0, 5)
      .map((row) => {
        const matching = rankedAdultCatalog.filter((video) => videoMatchesAdultTag(video, row.tag, tags));
        const fresh = matching.filter((video) => !claimed.has(video.id));
        const videos = rotateAdultRail(fresh.length >= Math.min(8, adultRailLimit) ? fresh : matching, `tag:${row.tag}`, adultRailSeed, adultRailLimit);
        videos.forEach((video) => claimed.add(video.id));
        return { ...row, videos };
      })
      .filter((row) => row.videos.length > 0);
  })();
  let adultMetaTagRank = cache?.metaTagRanks.get(adultSource);
  if (!adultMetaTagRank) {
    adultMetaTagRank = rankAdultMetaTags(sourceMatchedAdult, adultRankCtx, 24);
    if (cache) cache.metaTagRanks.set(adultSource, adultMetaTagRank);
  }
  const adultRecommended = (() => {
    const preferred = new Set([...adultTagRank.slice(0, 16), ...adultMetaTagRank.slice(0, 12)].map((row) => row.tag));
    const likedTags = new Set(sourceMatchedAdult.filter((video) => getRating(video.id) !== 1 && (favorites[video.id] || likes[video.id] || getRating(video.id) >= 4 || (cameCounts[video.id] ?? 0) > 0)).flatMap((video) => tags[video.id] ?? []));
    // Reuse already-ranked catalog when filters align; otherwise rank the source set once.
    const rankedBase = rankedAdultCatalog;
    const overviewIds = new Set([...adultOverviewRails.videos, ...adultOverviewRails.photos, ...adultOverviewRails.picks].map((video) => video.id));
    const freshBase = rankedBase.filter((video) => !overviewIds.has(video.id));
    const recommendationBase = freshBase.length >= Math.min(16, adultRailLimit) ? freshBase : rankedBase;
    function* candidates() {
      for (const video of recommendationBase) {
        if (getRating(video.id) === 1) continue;
        const itemTags = rankingTags(tags[video.id] ?? []);
        let overlap = 0, likedOverlap = 0;
        for (const tag of itemTags) { if (preferred.has(tag)) overlap++; if (likedTags.has(tag)) likedOverlap++; }
        const bonus = Math.min(12, overlap * 4) + Math.min(10, likedOverlap * 3) + Number(Boolean(video.poster || video.remote?.previewUrl)) * 3;
        yield { video, score: scoreAdultVideo(video, adultRankCtx) + bonus, shuffle: shuffleRank(`adult-recommended:${video.id}`, adultRailSeed) };
      }
    }
    const ranked = bestRanked(candidates(), 96, (a, b) => b.score - a.score || a.shuffle - b.shuffle).map(row => row.video);
    return diversifyAdultSources(diversifyCreators(ranked, 96), 48);
  })();
  const adultRelatedRecommended = (() => {
    const seedTags = new Set(
      (adultTag !== "All" ? [adultTag] : [...adultTagRank.slice(0, 8), ...adultMetaTagRank.slice(0, 6)].map((row) => row.tag))
        .concat(
          adultContinue[0] ? tags[adultContinue[0].id] ?? [] : [],
          adultFavorites[0] ? tags[adultFavorites[0].id] ?? [] : [],
        ),
    );
    const recommendedIds = new Set(adultRecommended.map((video) => video.id));
    function* candidates() {
      for (const video of filteredEporner) {
        if (getRating(video.id) === 1 || recommendedIds.has(video.id)) continue;
        let overlap = 0; for (const tag of rankingTags(tags[video.id] ?? [])) if (seedTags.has(tag)) overlap++;
        const score = scoreAdultVideo(video, adultRankCtx) + Math.min(16, overlap * 4) + Number(Boolean(video.poster || video.remote?.previewUrl)) * 3;
        if (score > 0) yield { video, score, shuffle: shuffleRank(`adult-rel:${video.id}:${adultRailSeed}`, adultRailSeed) };
      }
    }
    const ranked = bestRanked(candidates(), 96, (a, b) => b.score - a.score || a.shuffle - b.shuffle).map(row => row.video);
    return diversifyAdultSources(diversifyCreators(ranked, 96), 48);
  })();
  const adultShelfRails = (() => {
    // Claim ids top-down so the Adult landing rails begin as distinct shelves.
    // The full poster grid intentionally remains exhaustive further below.
    const used = new Set<string>([...adultOverviewRails.videos, ...adultOverviewRails.photos, ...adultOverviewRails.picks].map((video) => video.id));
    const take = (list: typeof adultRemoteVideos, limit: number, claim = true) => {
      const out: typeof adultRemoteVideos = [];
      for (const video of list) {
        if (used.has(video.id)) continue;
        out.push(video);
        if (claim) used.add(video.id);
        if (out.length >= limit) break;
      }
      return out;
    };
    const scoped = (list: typeof adultRemoteVideos) => list.filter((video) =>
      videoMatchesAdultSource(video, adultSource)
      && videoMatchesAdultTag(video, adultTag, tags)
      && (adultView === "all" || adultKind(video) === adultView),
    );
    // Personal shelves claim first so resume/marks never disappear behind recs.
    const continueRail = take(scoped(adultContinue), Math.min(24, adultRailLimit));
    const marked = take(scoped(markedAdult), Math.min(24, adultRailLimit));
    // A small photo/tag catalog can already be fully represented in overview.
    // Keep recommendations useful there; prefer fresh titles when available.
    const candidates = scoped(adultRecommended);
    const recommended = take(candidates, adultRailLimit);
    if (!recommended.length) recommended.push(...candidates.slice(0, adultRailLimit));
    const related = take(
      scoped(adultRelatedRecommended), adultRailLimit,
    );
    const reddit = take(
      scoped(rotateAdultRail(rankedAdultCatalog.filter((video) => video.remote?.kind === "reddit"), "reddit", adultRailSeed)), adultRailLimit,
    );
    const rotatedCatalog = scoped(rotateAdultRail(rankedAdultCatalog, "latest", adultRailSeed));
    const latest = take(rotatedCatalog, adultRailLimit);
    const catalog = take(rotateAdultRail(rotatedCatalog, "catalog", adultRailSeed), Math.max(32, adultRailLimit * 2));
    // Poster grid prefers titles not already on a rail, then fills from ranked catalog.
    const posterFresh = take(rotateAdultRail(rotatedCatalog, "poster", adultRailSeed), Math.max(64, adultRailLimit * 4), true);
    const seenPoster = new Set(posterFresh.map((video) => video.id));
    const poster = posterFresh.length >= 48
      ? posterFresh
      : [...posterFresh, ...scoped(rankedAdultCatalog).filter((video) => !seenPoster.has(video.id))].slice(0, Math.max(64, adultRailLimit * 4));
    return { recommended, related, continueRail, marked, reddit, latest, catalog, poster };
  })();
  const ids = (videos: LibraryVideo[]) => videos.map(video => video.id);
  if (cache && !cache.deepRankedIds) cache.deepRankedIds = ids(sortAdultVideos(data.deepVideos, adultRankCtx));
  return {
    rankedIds: ids(rankedAdultCatalog), deepRankedIds: cache?.deepRankedIds ?? ids(sortAdultVideos(data.deepVideos, adultRankCtx)), tagRank: adultTagRank, metaTagRank: adultMetaTagRank,
    overview: { videos: ids(adultOverviewRails.videos), photos: ids(adultOverviewRails.photos), picks: ids(adultOverviewRails.picks) },
    tagRails: adultTopTagRails.map(row => ({ ...row, videos: ids(row.videos) })),
    shelves: Object.fromEntries(Object.entries(adultShelfRails).map(([key, videos]) => [key, ids(videos)])) as Record<keyof typeof adultShelfRails, string[]>,
    live: ids(rotateAdultRail(rankedAdultCatalog.filter(v => adultKind(v) === "live"), "live", adultRailSeed, Math.max(adultRailLimit, 24))),
  };
}
export type AdultBrowseResult = ReturnType<typeof buildAdultBrowseModel>;
