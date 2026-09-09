import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { toast, Toaster } from "sonner";
import { useShallow } from "zustand/react/shallow";
import { Lock, Shuffle } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DiscoveryDesk, LiveDesk } from "./discovery-desk";
import { SidebarNav } from "./sidebar";
import { TopBar } from "./top-bar";
import { InviteStrip } from "./invite";
import { VideoGrid } from "./video-grid";
import { VideoCard } from "./video-card";
import { Billboard, PosterGrid, TitleRail } from "./browse";
import { PinGate } from "./pin-gate";
import { Player } from "./player";
import { PreVideo } from "./pre-video";
import { AiGuide } from "./ai-guide";
import { ConnectPanel } from "./connect-panel";
import {
  GamesSection,
  FindPhoneSection,
  GenreSection,
  LanConnectionSection,
  MissionPlanSection,
  PhotosSection,
  PrivateWebShortcuts,
  PrintsSection,
  SettingsSection,
  StatsSection,
  ShopSection,
  SocialSection,
  SpotifySection,
  StreamingSection,
  WatchRoomSection,
} from "./hub-sections";
import {
  selectClassics,
  selectContinue,
  selectFavorites,
  selectFeatured,
  selectHistory,
  selectLive,
  selectTwitch,
  selectVisible,
  selectYoutube,
  useLibrary,
  userFolderCount,
} from "@/lib/videos/store";
import { DEMO_FOLDER_ID } from "@/lib/videos/samples";
import type { WellKnownStart } from "@/lib/videos/types";
import { isClassicVideo } from "@/lib/videos/types";
import { useThumbs } from "@/lib/videos/thumbs";
import { librarySearchIndex } from "@/lib/videos/search-index";
import { creatorIsLiked, getCreatorRating, getRating, tagIsLiked } from "@/lib/media-feedback";

function shuffleRank(id: string, seed: number) {
  let value = seed >>> 0;
  for (let index = 0; index < id.length; index += 1) value = Math.imul(value ^ id.charCodeAt(index), 0x45d9f3b);
  return value >>> 0;
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

// Bundled demonstration media stays out of personal discovery and provider
// shelves. Real local and followed media must always take precedence.
function isExcludedDemoVideo(video: { isSample?: boolean; name: string; remote?: { channelName?: string }; tagline?: string }) {
  return Boolean(video.isSample) || /\bblender\b/i.test(`${video.name} ${video.remote?.channelName ?? ""} ${video.tagline ?? ""}`);
}
function isOfflineChannelCard(video: { id?: string; path?: string; extension?: string; remote?: { kind?: string; live?: boolean }; tagline?: string }) {
  if (video.remote?.kind !== "twitch" || video.remote.live) return false;
  // Old cache versions did not all use the same display copy. The durable
  // record shape is the reliable signal: a non-live Twitch channel/live card
  // is an offline placeholder, while VODs and clips have a video id/path.
  return /^offline\b/i.test(video.tagline ?? "")
    || video.extension === "live"
    || /\/(?:live|channel)$/i.test(video.path ?? "")
    || /:(?:live|channel)$/i.test(video.id ?? "");
}

function isFreshRemoteUpload(video: { addedAt: number }) {
  // A channel can be imported for the first time with years of feed history.
  // Alert only for a genuinely recent provider-published item, not every item
  // that happened to enter our cache during this refresh.
  const age = Date.now() - video.addedAt;
  return age >= -5 * 60_000 && age <= 14 * 24 * 60 * 60_000;
}
function isTasteTag(tag: string) {
  // Keep operational labels searchable and exportable, but never allow them to
  // masquerade as taste signals in recommendations.
  return !/^(?:year-|month-|day-|type-|provider-|format-|source-|keyword-|creator-|https?$|youtube$|twitch$|vod$|live$)/i.test(tag.trim());
}

export function LibraryApp() {
  const dirInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingAdult = useRef(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [movieShuffle, setMovieShuffle] = useState(() => Date.now());
  const [homePickShuffle, setHomePickShuffle] = useState(() => Date.now());
  const [ratingRevision, setRatingRevision] = useState(0);
  const [adultTag, setAdultTag] = useState("All");
  const [adultSort, setAdultSort] = useState<"recent" | "name" | "favorites" | "tagged" | "played">("recent");
  const [twitchSort, setTwitchSort] = useState<"live" | "viewers" | "name">("live");
  const [twitchFilter, setTwitchFilter] = useState("all");
  const [youtubeTagFilter, setYoutubeTagFilter] = useState("all");
  const [twitchTagFilter, setTwitchTagFilter] = useState("all");
  const [historyWindow, setHistoryWindow] = useState<"all" | "day" | "week">("all");
  const [homeExpanded, setHomeExpanded] = useState(false);
  const [remoteRefreshMs, setRemoteRefreshMs] = useState(() => {
    try { const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "60"); return [15, 30, 60, 120, 300].includes(seconds) ? seconds * 1_000 : 60_000; }
    catch { return 60_000; }
  });

  const restoreFolders = useLibrary((s) => s.restoreFolders);
  const openVideo = useLibrary((s) => s.openVideo);
  const addFolder = useLibrary((s) => s.addFolder);
  const ingestFromInput = useLibrary((s) => s.ingestFromInput);
  const ingestDrop = useLibrary((s) => s.ingestDrop);
  const clearHistory = useLibrary((s) => s.clearHistory);
  const folders = useLibrary((s) => s.folders);
  const sourceId = useLibrary((s) => s.sourceId);
  const setSource = useLibrary((s) => s.setSource);
  const hydrated = useLibrary((s) => s.hydrated);
  const query = useLibrary((s) => s.query);
  const scanning = useLibrary((s) => s.scanning);
  const activeId = useLibrary((s) => s.activeId);
  const previewId = useLibrary((s) => s.previewId);
  const history = useLibrary((s) => s.history);
  const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
  const videos = useLibrary(useShallow(selectVisible));
  const continueVideos = useLibrary(useShallow((s) => selectContinue(s, false)));
  const favoriteVideos = useLibrary(useShallow((s) => selectFavorites(s, false)));
  const historyVideos = useLibrary(useShallow((s) => selectHistory(s, false)));
  const historyLastDay = useMemo(() => history.filter((entry) => entry.at > Date.now() - 86_400_000).length, [history]);
  const classics = useLibrary(useShallow(selectClassics));
  const featured = useLibrary((s) => selectFeatured(s, s.sourceId === "adults"));
  const youtubeCatalog = useLibrary(useShallow(selectYoutube));
  const youtubeVideos = useMemo(() => youtubeCatalog.filter((video) => !isExcludedDemoVideo(video)), [youtubeCatalog]);
  const newestYoutube = useMemo(() => [...youtubeVideos].sort((a, b) => b.addedAt - a.addedAt || a.name.localeCompare(b.name)), [youtubeVideos]);
  const twitchVideos = useLibrary(useShallow(selectTwitch));
  const newThisWeek = useMemo(() => [...youtubeVideos, ...twitchVideos].filter((video) => video.remote && Date.now() - video.addedAt >= -5 * 60_000 && Date.now() - video.addedAt < 7 * 24 * 60 * 60_000).sort((a, b) => b.addedAt - a.addedAt), [twitchVideos, youtubeVideos]);
  const liveVideos = useLibrary(useShallow(selectLive));
  const adultContinue = useLibrary(useShallow((s) => selectContinue(s, true)));
  const adultFavorites = useLibrary(useShallow((s) => selectFavorites(s, true)));
  const adultHistory = useLibrary(useShallow((s) => selectHistory(s, true)));
  const hasUserFolders = userFolderCount(folders) > 0;
  const publicFolders = folders.filter(
    (f) => f.kind !== "demo" && f.kind !== "youtube" && f.kind !== "twitch" && !f.adult,
  );
  const adultFolders = folders.filter((f) => f.adult);
  const tags = useLibrary((s) => s.tags);
  const historyTopTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const entry of history) {
      for (const tag of tags[entry.id] ?? []) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
    return [...counts.entries()]
      .filter(([tag]) => !/^year-|^month-|^type-|^format-|^https$|^youtube$|^twitch$/.test(tag))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, 12);
  }, [history, tags]);
  const historyRecovery = useMemo(() => {
    const sources = { open: 0, progress: 0, watchRoom: 0 };
    let resumable = 0;
    for (const entry of history) {
      if (entry.source === "watch-room") sources.watchRoom += 1;
      else if (entry.source === "progress") sources.progress += 1;
      else sources.open += 1;
      if ((entry.position ?? 0) > 1 && (entry.duration ?? 0) > 0 && (entry.position ?? 0) < (entry.duration ?? 0) * 0.985) resumable += 1;
    }
    return { sources, resumable };
  }, [history]);
  const filteredYoutube = useMemo(() => youtubeTagFilter === "all" ? newestYoutube : newestYoutube.filter((video) => (tags[video.id] ?? []).includes(youtubeTagFilter)), [newestYoutube, tags, youtubeTagFilter]);
  const trendingYoutube = useMemo(
    () => diversifyCreators([...filteredYoutube].sort((a, b) => (b.remote?.views ?? 0) - (a.remote?.views ?? 0) || b.addedAt - a.addedAt)),
    [filteredYoutube],
  );
  const categories = useLibrary((s) => s.categories);
  const catalogVideos = useLibrary((s) => s.videos);
  const favorites = useLibrary((s) => s.favorites);
  const progress = useLibrary((s) => s.progress);
  const likes = useLibrary((s) => s.likes);
  const viewCounts = useLibrary((s) => s.viewCounts);
  const unavailable = useLibrary((s) => s.unavailable);
  const follows = useLibrary((s) => s.follows);
  const remoteCheckedAt = useLibrary((s) => s.remoteCheckedAt);
  const adultTagNames = useMemo(() => [...new Set(videos.flatMap((video) => tags[video.id] ?? []))].sort(), [tags, videos]);
  const moviesByGenre = useMemo(() => [...videos].filter((video) => Boolean(video.genre)).sort((a, b) => a.genre!.localeCompare(b.genre!)), [videos]);
  const movieCatalog = useMemo(() => {
    const adultIds = new Set(folders.filter((folder) => folder.adult).map((folder) => folder.id));
    return catalogVideos.filter((video) => !video.remote && !video.isSample && !adultIds.has(video.folderId) && !unavailable[video.id]);
  }, [catalogVideos, folders, unavailable]);
  const randomSourceMovies = useMemo(() => movieCatalog.map((video) => ({ video, rank: shuffleRank(video.id, movieShuffle) })).sort((a, b) => a.rank - b.rank).map((entry) => entry.video), [movieCatalog, movieShuffle]);
  const priorityMovieGenres = useMemo(() => ["Comedy", "Action", "Horror", "Drama", "Documentary", "Science Fiction"].map((genre) => ({ genre, videos: movieCatalog.filter((video) => video.genre?.toLowerCase() === genre.toLowerCase()) })).filter((shelf) => shelf.videos.length > 0), [movieCatalog]);
  const movieTypeShelves = useMemo(() => {
    const groups = new Map<string, typeof movieCatalog>();
    for (const video of movieCatalog) {
      const type = (video.extension || "file").replace(/^\./, "").toUpperCase();
      const rows = groups.get(type) ?? [];
      rows.push(video);
      groups.set(type, rows);
    }
    return [...groups.entries()].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0])).slice(0, 10).map(([type, videos]) => ({ type, videos }));
  }, [movieCatalog]);
  const adultSorted = useMemo(() => [...videos].sort((a, b) => adultSort === "name" ? a.name.localeCompare(b.name) : adultSort === "favorites" ? Number(Boolean(favorites[b.id])) - Number(Boolean(favorites[a.id])) || b.addedAt - a.addedAt : adultSort === "tagged" ? (tags[b.id] ?? []).length - (tags[a.id] ?? []).length || b.addedAt - a.addedAt : adultSort === "played" ? (progress[b.id]?.at ?? 0) - (progress[a.id]?.at ?? 0) || b.addedAt - a.addedAt : b.addedAt - a.addedAt), [adultSort, favorites, progress, tags, videos]);
  const adultTagged = useMemo(() => videos.filter((video) => (tags[video.id] ?? []).length > 0).sort((a, b) => (tags[b.id] ?? []).length - (tags[a.id] ?? []).length), [tags, videos]);
  const adultNeedsTags = useMemo(() => videos.filter((video) => !(tags[video.id] ?? []).length), [tags, videos]);
  const highlyRatedTags = useMemo(() => {
    const preferred = new Set<string>();
    for (const video of videos) {
      const rating = getRating(video.id);
      for (const tag of tags[video.id] ?? []) if (rating >= 4 || tagIsLiked(tag)) preferred.add(tag);
    }
    return preferred;
  }, [ratingRevision, tags, videos]);
  const tasteAverages = useMemo(() => {
    const tagsByScore = new Map<string, { total: number; count: number }>();
    const creatorsByScore = new Map<string, { total: number; count: number }>();
    for (const video of videos) {
      const rating = getRating(video.id);
      const signal = rating || (favorites[video.id] ? 4 : 0) || (likes[video.id] ? 3 : 0);
      if (!signal) continue;
      for (const tag of (tags[video.id] ?? []).filter(isTasteTag)) {
        const row = tagsByScore.get(tag) ?? { total: 0, count: 0 };
        row.total += signal;
        row.count += 1;
        tagsByScore.set(tag, row);
      }
      const creator = video.remote?.channelName?.trim().toLowerCase();
      if (creator) {
        const row = creatorsByScore.get(creator) ?? { total: 0, count: 0 };
        row.total += signal;
        row.count += 1;
        creatorsByScore.set(creator, row);
      }
    }
    return {
      tag: new Map([...tagsByScore].map(([key, row]) => [key, row.total / row.count])),
      creator: new Map([...creatorsByScore].map(([key, row]) => [key, row.total / row.count])),
    };
  }, [favorites, likes, ratingRevision, tags, videos]);
  const personalizedPicks = useMemo(() => {
    const watched = new Set(history.map((entry) => entry.id));
    const preferredTags = new Set(videos.filter((video) => favorites[video.id] || likes[video.id] || getRating(video.id) >= 4).flatMap((video) => (tags[video.id] ?? []).filter(isTasteTag)));
    return [...videos].filter((video) => !video.isSample && !watched.has(video.id)).sort((a, b) => {
      const score = (video: typeof a) => {
      const creatorAverage = tasteAverages.creator.get(video.remote?.channelName?.trim().toLowerCase() ?? "") ?? 0;
      const tagAverage = (tags[video.id] ?? []).filter(isTasteTag).reduce((total, tag) => total + (tasteAverages.tag.get(tag) ?? 0), 0);
      return getRating(video.id) * 18 + getCreatorRating(video.remote?.channelName ?? "") * 10 + creatorAverage * 5 + tagAverage * 2 + (creatorIsLiked(video.remote?.channelName ?? "") ? 9 : 0) + (favorites[video.id] ? 6 : 0) + (likes[video.id] ? 4 : 0) + (tags[video.id] ?? []).filter((tag) => isTasteTag(tag) && preferredTags.has(tag)).length * 2 + (video.remote?.live ? 1 : 0);
      };
      // A recommendation shelf should have a bias, not a fixed handful of
      // winners. Blend preference signals with a fresh shuffle so lower-score
      // local titles still get a real chance to reach the first cards.
      const rank = (video: typeof a) => score(video) * 0.45 + shuffleRank(`${video.id}:${homePickShuffle}`, homePickShuffle) / 0xffffffff;
      return rank(b) - rank(a);
    });
  }, [favorites, history, homePickShuffle, likes, ratingRevision, tags, tasteAverages, videos]);
  const topRatedLocalPicks = useMemo(() => {
    // The previous shelf inherited the global score wholesale, which let a
    // handful of old five-star files occupy every visit. Keep the taste bias,
    // but shuffle within rating bands and prevent one folder from taking over.
    const perFolder = new Map<string, number>();
    return personalizedPicks
      .filter((video) => !video.remote && !video.isSample)
      .map((video) => ({
        video,
        score: getRating(video.id) * 5 + (favorites[video.id] ? 2 : 0) + (likes[video.id] ? 1 : 0) + shuffleRank(`local-rated:${video.id}:${homePickShuffle}`, homePickShuffle) / 0xffffffff * 5,
      }))
      .sort((a, b) => b.score - a.score)
      .filter(({ video }) => {
        const seen = perFolder.get(video.folderId) ?? 0;
        if (seen >= 3) return false;
        perFolder.set(video.folderId, seen + 1);
        return true;
      })
      .map(({ video }) => video);
  }, [favorites, homePickShuffle, likes, personalizedPicks]);
  const freshPicks = useMemo(() => {
    const seed = Math.floor(Date.now() / 3_600_000);
    return videos
      .filter((video) => !video.isSample && !video.remote?.live)
      .map((video) => ({ video, views: viewCounts[video.id] ?? 0, rank: shuffleRank(`${video.id}:${seed}`, seed) }))
      .sort((a, b) => a.views - b.views || a.rank - b.rank)
      .slice(0, 48)
      .map(({ video }) => video);
  }, [videos, viewCounts]);
  const homeLocalRecent = useMemo(() => videos
    .filter((video) => !video.remote && !video.isSample)
    .map((video) => ({ video, ageBucket: Math.floor(Math.max(0, Date.now() - video.addedAt) / (7 * 86_400_000)), rank: shuffleRank(`${video.id}:recent`, homePickShuffle) }))
    .sort((a, b) => a.ageBucket - b.ageBucket || a.rank - b.rank)
    .slice(0, 48)
    .map(({ video }) => video), [homePickShuffle, videos]);
  const homeLatestChannels = useMemo(() => [...youtubeVideos, ...twitchVideos].filter((video) => !video.remote?.live && !video.isSample && !isOfflineChannelCard(video)).sort((a, b) => b.addedAt - a.addedAt).slice(0, 48), [twitchVideos, youtubeVideos]);
  const sortedTwitch = useMemo(() => {
    // Sorting thousands of remote cards is only useful while the Twitch desk is
    // visible. Keeping this work off Home and the local views prevents a refresh
    // from blocking their next paint.
    if (sourceId !== "twitch") return [];
    return [...twitchVideos].filter((video) => !isOfflineChannelCard(video)).sort((a, b) => {
    if (twitchSort === "viewers") return (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || a.name.localeCompare(b.name);
    if (twitchSort === "name") return a.name.localeCompare(b.name);
    return Number(Boolean(b.remote?.live)) - Number(Boolean(a.remote?.live)) || (b.remote?.viewers ?? 0) - (a.remote?.viewers ?? 0) || b.addedAt - a.addedAt;
    });
  }, [sourceId, twitchSort, twitchVideos]);
  const twitchVodPicks = useMemo(() => {
    if (sourceId !== "twitch") return [];
    const popularity = (video: typeof sortedTwitch[number]) => (video.remote?.viewers ?? 0) + getRating(video.id) * 40 + (favorites[video.id] ? 28 : 0) + (likes[video.id] ? 16 : 0) + (viewCounts[video.id] ?? 0) * 5 + (tags[video.id] ?? []).filter((tag) => highlyRatedTags.has(tag)).length * 8;
    return sortedTwitch.filter((video) => !video.remote?.live).sort((a, b) => popularity(b) - popularity(a) || b.addedAt - a.addedAt);
  }, [favorites, highlyRatedTags, likes, ratingRevision, sortedTwitch, sourceId, tags, viewCounts]);
  const twitchClips = useMemo(() => twitchVodPicks.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) <= 1200).slice(0, 24), [twitchVodPicks]);
  const favoriteTwitchPicks = useMemo(() => sortedTwitch.filter((video) => favorites[video.id]).sort((a, b) => (viewCounts[b.id] ?? 0) - (viewCounts[a.id] ?? 0) || b.addedAt - a.addedAt), [favorites, sortedTwitch, viewCounts]);
  const likedTwitchPicks = useMemo(() => sortedTwitch.filter((video) => likes[video.id] && !favorites[video.id]).sort((a, b) => getRating(b.id) - getRating(a.id) || (viewCounts[a.id] ?? 0) - (viewCounts[b.id] ?? 0) || b.addedAt - a.addedAt), [favorites, likes, ratingRevision, sortedTwitch, viewCounts]);
  const twitchVodChannels = useMemo(() => {
    const groups = new Map<string, typeof twitchVodPicks>();
    for (const video of twitchVodPicks) {
      const creator = video.remote?.channelName?.trim() || "Unknown creator";
      const group = groups.get(creator) ?? [];
      group.push(video);
      groups.set(creator, group);
    }
    return [...groups.entries()]
      .map(([creator, vods]) => ({ creator, vods, score: vods.reduce((total, video) => total + getRating(video.id) * 10 + (favorites[video.id] ? 8 : 0) + (likes[video.id] ? 4 : 0) + (viewCounts[video.id] ?? 0), 0) }))
      .sort((a, b) => b.score - a.score || b.vods.length - a.vods.length || a.creator.localeCompare(b.creator))
      .slice(0, 12);
  }, [favorites, likes, ratingRevision, twitchVodPicks, viewCounts]);
  const liveChannelVods = useMemo(() => {
    const liveByCreator = new Map<string, typeof sortedTwitch[number]>();
    for (const video of sortedTwitch) {
      const creator = video.remote?.channelName?.trim();
      if (video.remote?.live && creator && !liveByCreator.has(creator.toLowerCase())) liveByCreator.set(creator.toLowerCase(), video);
    }
    return [...liveByCreator.values()]
      .map((live) => {
        const creator = live.remote?.channelName?.trim() ?? "";
        const vods = twitchVodPicks.filter((video) => video.remote?.channelName?.trim().toLowerCase() === creator.toLowerCase()).slice(0, 24);
        return { creator, live, vods };
      })
      .filter((group) => group.vods.length > 0)
      .slice(0, 8);
  }, [sortedTwitch, twitchVodPicks]);
  const relatedYoutube = useMemo(() => {
    if (sourceId !== "youtube") return [];
    const likedChannels = new Set(youtubeVideos.filter((video) => favorites[video.id] || likes[video.id]).map((video) => video.remote?.channelName).filter(Boolean));
    const favoriteTags = new Set(youtubeVideos.filter((video) => getRating(video.id) >= 3).flatMap((video) => (tags[video.id] ?? []).filter(isTasteTag)));
    return [...youtubeVideos].sort((a, b) => {
      const score = (video: typeof a) => {
      const creatorAverage = tasteAverages.creator.get(video.remote?.channelName?.trim().toLowerCase() ?? "") ?? 0;
      const tagAverage = (tags[video.id] ?? []).filter(isTasteTag).reduce((total, tag) => total + (tasteAverages.tag.get(tag) ?? 0), 0);
      const sharedFavoriteTopics = (tags[video.id] ?? []).filter((tag) => isTasteTag(tag) && favoriteTags.has(tag)).length;
      return getRating(video.id) * 14 + getCreatorRating(video.remote?.channelName ?? "") * 15 + creatorAverage * 9 + tagAverage * 6 + (creatorIsLiked(video.remote?.channelName ?? "") ? 16 : 0) + (likedChannels.has(video.remote?.channelName) ? 12 : 0) + sharedFavoriteTopics * 18;
      };
      return score(b) - score(a) || b.addedAt - a.addedAt || shuffleRank(`${a.id}:${homePickShuffle}`, homePickShuffle) - shuffleRank(`${b.id}:${homePickShuffle}`, homePickShuffle);
    });
  }, [favorites, homePickShuffle, likes, ratingRevision, sourceId, tags, tasteAverages, youtubeVideos]);
  const youtubeDiscovery = useMemo(() => {
    const known = new Set(follows.filter((channel) => channel.kind === "youtube").map((channel) => channel.title.toLowerCase()));
    return youtubeVideos.filter((video) => !known.has((video.remote?.channelName ?? "").toLowerCase()) || Boolean(video.isSample));
  }, [follows, youtubeVideos]);
  const channelTagShelves = useMemo(() => {
    if (sourceId !== "youtube" && sourceId !== "twitch") return { youtube: [], twitch: [] };
    const build = (items: typeof videos, kind: "youtube" | "twitch") => {
      const groups = new Map<string, typeof videos>();
      for (const video of items) {
        if (video.remote?.kind !== kind) continue;
        for (const tag of tags[video.id] ?? []) {
          const clean = tag.toLowerCase();
          if ([kind, "vod", "live"].includes(clean) || clean.length < 4) continue;
          const list = groups.get(clean) ?? [];
          list.push(video);
          groups.set(clean, list);
        }
      }
      return [...groups.entries()].filter(([, items]) => items.length >= 2).sort((a, b) => {
        const taste = (list: typeof a[1]) => list.reduce((score, video) => score + getRating(video.id) * 2, 0);
        return taste(b[1]) - taste(a[1]) || b[1].length - a[1].length || a[0].localeCompare(b[0]);
      }).slice(0, 40).map(([tag, videos]) => ({ tag, videos: diversifyCreators(videos) }));
    };
    return { youtube: build(youtubeVideos, "youtube"), twitch: build(twitchVideos, "twitch") };
  }, [ratingRevision, sourceId, tags, twitchVideos, youtubeVideos]);

  useEffect(() => {
    void restoreFolders();
  }, [restoreFolders]);
  useEffect(() => {
    // A return to Home is a new discovery session. Rotate the local ranking
    // even if the app itself stayed mounted in the background.
    if (sourceId === "home") setHomePickShuffle(Date.now());
  }, [sourceId]);
  useEffect(() => {
    // Keep the star/like response immediate.  Ranking every large shelf is
    // useful work, but it belongs in a transition rather than on the button's
    // input frame.
    const refreshRatedShelves = () => startTransition(() => setRatingRevision((value) => value + 1));
    window.addEventListener("reelcase:rating-change", refreshRatedShelves);
    return () => window.removeEventListener("reelcase:rating-change", refreshRatedShelves);
  }, []);
  useEffect(() => { void useThumbs.getState().hydrate(); }, []);
  useEffect(() => {
    const update = () => { try { const seconds = Number(localStorage.getItem("reelcase.twitch-refresh-seconds") ?? "60"); setRemoteRefreshMs(([15, 30, 60, 120, 300].includes(seconds) ? seconds : 60) * 1_000); } catch { setRemoteRefreshMs(60_000); } };
    window.addEventListener("reelcase:refresh-settings", update);
    return () => window.removeEventListener("reelcase:refresh-settings", update);
  }, []);
  useEffect(() => {
    if (!hydrated) return;
    // Build the disk-wide search index after the first screen paints. The old
    // path built it on the first typed character, which was especially visible
    // with several thousand remote cards.
    const build = () => librarySearchIndex.sync(catalogVideos, tags, categories);
    const scheduleIdle = window.requestIdleCallback;
    if (typeof scheduleIdle === "function") {
      const id = scheduleIdle(build, { timeout: 2_000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(build, 350);
    return () => window.clearTimeout(id);
  }, [catalogVideos, categories, hydrated, tags]);
  useEffect(() => {
    // Theater invitations are regular shareable links. Route them to the room
    // after saved preferences hydrate so a remembered last page cannot win.
    if (!hydrated) return;
    const room = new URLSearchParams(window.location.search).get("room")?.trim().toUpperCase() ?? "";
    if (/^RC[A-Z0-9]{4,12}$/.test(room)) setSource("watch-room");
  }, [hydrated, setSource]);

  const refreshFollows = useLibrary((s) => s.refreshFollows);
  const followRemoteQuery = useLibrary((s) => s.followRemoteQuery);
  const pushNotice = useLibrary((s) => s.pushNotice);
  const [channelRefreshing, setChannelRefreshing] = useState("");

  useEffect(() => {
    if (!hydrated || !follows.length) return;
    let cancelled = false;
    const tick = async () => {
      if (document.hidden || !navigator.onLine) return;
      // Live status ages quickly. Keep the provider cache bounded without
      // reloading the whole app or refreshing while the tab is backgrounded.
      if (Date.now() - useLibrary.getState().remoteCheckedAt < Math.max(5_000, remoteRefreshMs - 5_000)) return;
      const { wentLive, newVideos } = await refreshFollows();
      if (cancelled) return;
      const preferences = (() => { try { return JSON.parse(localStorage.getItem("reelcase.settings.v1") ?? "{}") as Record<string, boolean>; } catch { return {}; } })();
      if (preferences["alerts-go-live-alerts"] !== false) for (const ch of wentLive) {
        pushNotice({
          title: `${ch.title} is live`,
          body: "Tap to watch in Reelcase.",
          kind: "twitch",
          videoId: `tw:${ch.handle}:live`,
        });
      }
      for (const v of newVideos.filter((video) => video.remote?.kind === "youtube" && isFreshRemoteUpload(video) && preferences["alerts-new-youtube-upload-alerts"] !== false).slice(0, 3)) {
        pushNotice({
          title: v.name,
          body: `${v.remote?.channelName ?? "YouTube"} · published ${new Date(v.addedAt).toLocaleDateString()}`,
          kind: "youtube",
          videoId: v.id,
        });
      }
      for (const v of newVideos.filter((video) => video.remote?.kind === "twitch" && preferences["alerts-new-twitch-vod-alerts"] !== false).slice(0, 3)) pushNotice({ title: v.name, body: v.remote?.channelName ?? "New Twitch video", kind: "twitch", videoId: v.id });
    };
    const id = window.setInterval(() => void tick(), remoteRefreshMs);
    const first = window.setTimeout(() => void tick(), 1500);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      window.clearTimeout(first);
    };
  }, [hydrated, follows.length, refreshFollows, pushNotice, remoteRefreshMs]);

  const prevScanning = useRef<typeof scanning>(null);
  useEffect(() => {
    const was = prevScanning.current;
    prevScanning.current = scanning;
    if (was && !scanning) {
      const folder = useLibrary.getState().folders.find((f) => f.name === was.folderName);
      const n = folder?.videoCount ?? 0;
      // Empty folders remain in the durable index for later rescans, but do not
      // interrupt every launch with a misleading "no photos" notification.
      if (n === 0 && folder?.photoCount) toast.success(`Found ${folder.photoCount} photo${folder.photoCount === 1 ? "" : "s"} in ${was.folderName}`);
      else if (n > 0) toast.success(`Found ${n} video${n === 1 ? "" : "s"} in ${was.folderName}`);
    }
  }, [scanning]);

  useEffect(() => {
    let depth = 0;
    const prevent = (e: DragEvent) => e.preventDefault();
    const enter = (e: DragEvent) => {
      e.preventDefault();
      depth += 1;
      setDragging(true);
    };
    const leave = (e: DragEvent) => {
      e.preventDefault();
      depth -= 1;
      if (depth <= 0) {
        depth = 0;
        setDragging(false);
      }
    };
    const drop = (e: DragEvent) => {
      e.preventDefault();
      depth = 0;
      setDragging(false);
      if (!e.dataTransfer) return;
      void ingestDrop(e.dataTransfer).catch((err: unknown) => {
        toast.error(err instanceof Error ? err.message : "Could not read files");
      });
    };
    window.addEventListener("dragenter", enter);
    window.addEventListener("dragleave", leave);
    window.addEventListener("dragover", prevent);
    window.addEventListener("drop", drop);
    return () => {
      window.removeEventListener("dragenter", enter);
      window.removeEventListener("dragleave", leave);
      window.removeEventListener("dragover", prevent);
      window.removeEventListener("drop", drop);
    };
  }, [ingestDrop]);

  const heading = useMemo(() => {
    if (sourceId === "continue") return "Continue watching";
    if (sourceId === "favorites") return "Favorites";
    if (sourceId === "history") return "History";
    if (sourceId === "movies") return "Movies";
    if (sourceId === "home") return "Home";
    if (sourceId === "adults") return "Adults";
    if (sourceId === "youtube") return "YouTube";
    if (sourceId === "twitch") return "Twitch";
    if (sourceId === "live") return "Live";
    return folders.find((f) => f.id === sourceId)?.name ?? "Library";
  }, [sourceId, folders]);

  const onAddFolder = (startIn?: WellKnownStart, adult?: boolean) => {
    pendingAdult.current = Boolean(adult);
    void addFolder(dirInputRef.current, startIn, { adult }).catch((err: unknown) => {
      const message = err instanceof Error ? err.message : "Could not open folder";
      toast.error(/system files|system folder|not allowed/i.test(message) ? "Choose a media subfolder instead. Windows system folders cannot be cataloged; use Folder to pick Videos, Downloads, or a dedicated library folder." : message);
    });
  };

  const playlist = videos.map((v) => v.id);
  const playedAt = useMemo(() => {
    const map: Record<string, number> = {};
    // History is newest-first. Preserve the first timestamp so repeated plays
    // show their latest visit, not the oldest one in the timeline.
    for (const h of history) if (map[h.id] == null) map[h.id] = h.at;
    return map;
  }, [history]);
  const historyFilteredVideos = useMemo(() => {
    const cutoff = historyWindow === "day" ? Date.now() - 86_400_000 : historyWindow === "week" ? Date.now() - 604_800_000 : 0;
    return historyWindow === "all" ? historyVideos : historyVideos.filter((video) => (playedAt[video.id] ?? 0) >= cutoff);
  }, [historyVideos, historyWindow, playedAt]);

  const browsing =
    !query &&
    (sourceId === "home" ||
      sourceId === "movies" ||
      sourceId === "adults" ||
      sourceId === "youtube" ||
      sourceId === "twitch" ||
      sourceId === "live");
  const lockedAdults = sourceId === "adults" && !adultsUnlocked;
  const invitedToTheater = typeof window !== "undefined" && /^RC[A-Z0-9]{4,12}$/.test(
    (new URLSearchParams(window.location.search).get("room") ?? "").trim().toUpperCase(),
  );
  const isHubSection = [
    "photos",
    "spotify",
    "prints",
    "games",
    "shop",
    "streaming",
    "social",
    "watch-room",
    "settings",
    "stats",
    "genres",
    "assistant",
    "mission-plan",
    "connection",
    "find-phone",
  ].includes(sourceId) || invitedToTheater;

  return (
    <div className="flex min-h-dvh bg-bg text-fg">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 overflow-y-auto border-r border-border bg-surface/80 px-3 py-5 lg:block">
        <SidebarNav onAddFolder={(adult) => onAddFolder(undefined, adult)} />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="left" className="overflow-y-auto bg-surface p-4">
          <SheetTitle className="sr-only">Library menu</SheetTitle>
          <SidebarNav
            onAddFolder={(adult) => {
              setMenuOpen(false);
              onAddFolder(undefined, adult);
            }}
            onNavigate={() => setMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onMenu={() => setMenuOpen(true)} onAddFolder={() => onAddFolder()} />
        <main className="w-full max-w-none flex-1 px-4 py-6 sm:px-6 xl:px-8 2xl:px-10">
          {lockedAdults ? (
            <PinGate />
          ) : isHubSection ? (
            <>
              {sourceId === "prints" && <PrintsSection />}
              {sourceId === "photos" && <PhotosSection />}
              {sourceId === "spotify" && <SpotifySection />}
              {sourceId === "games" && <GamesSection />}
              {sourceId === "shop" && <ShopSection />}
              {sourceId === "streaming" && <StreamingSection />}
              {sourceId === "social" && <SocialSection />}
              {(sourceId === "watch-room" || invitedToTheater) && <WatchRoomSection />}
              {sourceId === "settings" && <SettingsSection />}
              {sourceId === "stats" && <StatsSection />}
              {sourceId === "connection" && <LanConnectionSection />}
              {sourceId === "find-phone" && <FindPhoneSection />}
              {sourceId === "genres" && <GenreSection />}
              {sourceId === "assistant" && <AiGuide />}
              {sourceId === "mission-plan" && <MissionPlanSection />}
            </>
          ) : (
            <>
              {sourceId === "home" && !query && <DiscoveryDesk videos={videos} />}
              {!hasUserFolders && sourceId === "home" && (
                <InviteStrip
                  onAddFolder={() => onAddFolder()}
                  onAddFiles={() => fileInputRef.current?.click()}
                  onRecommended={(id) => onAddFolder(id)}
                />
              )}
              {sourceId === "home" && !query && !follows.length && (
                  <ConnectPanel key="home-imports" defaultKind="youtube" />
                )}


              {sourceId === "movies" && !query && (randomSourceMovies[0] || featured) && (
                <Billboard video={randomSourceMovies[0] ?? featured!} />
              )}
              {sourceId === "adults" && adultsUnlocked && featured && (
                <Billboard video={featured} />
              )}

              {sourceId === "home" && browsing && (
                <>
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border"><p className="text-sm text-muted">Local picks rotate inside your taste matches, so the same few titles do not take over Home.</p><Button size="sm" variant="secondary" onClick={() => setHomePickShuffle(Date.now())}><Shuffle className="size-4" /> Mix local picks</Button></div>
                  <TitleRail title="Recently added from your folders" videos={homeLocalRecent} variant="rail" />
                  <TitleRail title="Unseen & ready to discover" videos={freshPicks} variant="rail" />
                  <TitleRail title="Top-rated local picks" videos={topRatedLocalPicks} variant="rail" />
                  <TitleRail title="Live now" videos={liveVideos} variant="rail" />
                  <TitleRail title="New this week" videos={newThisWeek} variant="rail" />
                  <TitleRail
                    title={follows.length ? "Latest from your channels" : "Fresh from YouTube"}
                    videos={homeLatestChannels}
                    variant="rail"
                  />
                  <Button className="mb-8" variant="secondary" onClick={() => setHomeExpanded((value) => !value)}>{homeExpanded ? "Show fewer home shelves" : "Show more home shelves"}</Button>
                  {homeExpanded && <>
                    <TitleRail title="Continue watching" videos={continueVideos} variant="rail" />
                    <TitleRail title="From YouTube" videos={youtubeVideos.filter((video) => !video.isSample)} variant="rail" />
                    <TitleRail title="Twitch" videos={twitchVideos.filter((video) => !video.isSample && !isOfflineChannelCard(video))} variant="rail" />
                    <TitleRail title="Every local source" videos={homeLocalRecent} variant="rail" />
                    <TitleRail title="Favorites" videos={favoriteVideos} variant="rail" />
                    <TitleRail title="Short films & quick watches" videos={videos.filter((video) => !video.isSample && (video.collection === "shorts" || (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1800)).slice(0, 18)} variant="rail" />
                    <TitleRail title="Browse by genre" videos={moviesByGenre.filter((video) => !video.isSample).slice(0, 24)} variant="rail" />
                    <TitleRail title="History" videos={historyVideos} variant="rail" playedAt={playedAt} />
                    {publicFolders.slice(0, 12).map((folder) => <TitleRail key={folder.id} title={`${folder.name} · local source`} videos={videos.filter((v) => v.folderId === folder.id).slice(0, 24)} variant="rail" onTitleClick={() => setSource(folder.id)} />)}
                  </>}
                </>
              )}

              {sourceId === "youtube" && browsing && (
                <>
                  <section className="mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Discovery desk</p><h1 className="mt-2 font-display text-4xl text-fg">YouTube, tuned to you.</h1><p className="mt-2 max-w-2xl text-sm text-muted">Fresh uploads are ordered by YouTube’s published date, not title. Alerts only fire for uploads published within the last 14 days, so importing an older channel does not flood your notices. {follows.filter((channel) => channel.kind === "youtube").length} channel{follows.filter((channel) => channel.kind === "youtube").length === 1 ? "" : "s"} tracked locally · {youtubeVideos.length.toLocaleString()} cached videos.</p><p className="mt-2 text-xs text-accent">{remoteCheckedAt ? `Automatic refresh last checked ${new Date(remoteCheckedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Automatic refresh will begin after the first channel check."}</p><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant="secondary" disabled={channelRefreshing === "youtube-refresh"} onClick={() => void (async () => { setChannelRefreshing("youtube-refresh"); try { const result = await refreshFollows(); pushNotice({ title: "YouTube refresh complete", body: `${result.newVideos.filter((video) => video.remote?.kind === "youtube").length} new YouTube video${result.newVideos.filter((video) => video.remote?.kind === "youtube").length === 1 ? "" : "s"} found.`, kind: "youtube" }); } finally { setChannelRefreshing(""); } })()}>{channelRefreshing === "youtube-refresh" ? "Refreshing YouTube…" : "Refresh now"}</Button><span className="self-center text-xs text-muted">Saved channels retry in rotating background batches; each result adds to this cached count.</span></div></section>
                  <TitleRail title="Latest uploads" videos={filteredYoutube} variant="rail" />
                  <TitleRail title="Trending in your tracked channels" videos={trendingYoutube} variant="rail" />
                  <TitleRail title="New to you on YouTube" videos={freshPicks.filter((video) => video.remote?.kind === "youtube" && (youtubeTagFilter === "all" || (tags[video.id] ?? []).includes(youtubeTagFilter)))} variant="rail" />
                  <TitleRail title="More from your rated YouTube" videos={relatedYoutube.filter((video) => youtubeTagFilter === "all" || (tags[video.id] ?? []).includes(youtubeTagFilter))} variant="rail" />
                  <TitleRail title="Quick picks" videos={filteredYoutube.filter((video) => (video.duration ?? 0) > 0 && (video.duration ?? 0) < 1200)} variant="rail" />
                  <div className="mb-5 flex flex-wrap gap-2"><Button size="sm" variant={youtubeTagFilter === "all" ? "default" : "secondary"} onClick={() => setYoutubeTagFilter("all")}>All tags</Button>{channelTagShelves.youtube.map((shelf) => <Button key={shelf.tag} size="sm" variant={youtubeTagFilter === shelf.tag ? "default" : "secondary"} onClick={() => setYoutubeTagFilter(shelf.tag)}>#{shelf.tag} · {shelf.videos.length}</Button>)}</div>
                  {youtubeTagFilter !== "all" && <p className="-mt-2 mb-5 text-xs text-accent">Filtering every YouTube shelf and the full catalog by #{youtubeTagFilter} · {filteredYoutube.length.toLocaleString()} matching videos.</p>}
                  <section className="mb-6 rounded-xl border border-border bg-surface p-5"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Creator discovery</p><h2 className="mt-2 font-display text-2xl text-fg">Outside your known follows.</h2><p className="mt-1 text-sm text-muted">Discovery stays in its own shelf so saved channels never get mixed with suggestions. Follow adds a channel to your saved refresh list.</p><div className="mt-4"><TitleRail title="Explore new YouTube" videos={youtubeDiscovery} variant="rail" /></div><div className="mt-4 flex flex-wrap gap-2">{[["Kurzgesagt", "kurzgesagt"], ["Veritasium", "veritasium"], ["PBS Space Time", "pbsspacetime"]].filter(([, handle]) => !follows.some((channel) => channel.kind === "youtube" && channel.handle.toLowerCase() === handle)).map(([label, handle]) => <Button key={handle} size="sm" variant="secondary" disabled={channelRefreshing === handle} onClick={() => void (async () => { setChannelRefreshing(handle); try { await followRemoteQuery(handle, "youtube"); } finally { setChannelRefreshing(""); } })()}>{channelRefreshing === handle ? "Checking…" : `Follow ${label}`}</Button>)}</div></section>
                  {[...new Set(newestYoutube.map((video) => video.remote?.channelName).filter(Boolean))].slice(0, 8).map((channel) => <TitleRail key={channel} title={`From ${channel}`} videos={newestYoutube.filter((video) => video.remote?.channelName === channel)} variant="rail" />)}
                  {channelTagShelves.youtube.map((shelf) => <TitleRail key={`youtube-tag-${shelf.tag}`} title={`YouTube · ${shelf.tag}`} videos={shelf.videos} variant="rail" />)}
                  <PosterGrid videos={filteredYoutube} />
                  <ConnectPanel key="youtube-imports" defaultKind="youtube" lockedKind="youtube" />
                </>
              )}

              {sourceId === "twitch" && browsing && (
                <>
                  <section className="mb-7 rounded-xl bg-elevated p-5 shadow-border sm:p-6"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Live desk</p><h1 className="mt-2 font-display text-4xl text-fg">Twitch, live first.</h1><p className="mt-2 max-w-2xl text-sm text-muted">Sort live streams and VODs by what matters right now. {follows.filter((channel) => channel.kind === "twitch").length} channel{follows.filter((channel) => channel.kind === "twitch").length === 1 ? "" : "s"} tracked locally. A different rotating batch checks every minute; a successful check removes stale live cards.</p><p className="mt-2 text-xs text-accent">{remoteCheckedAt ? `Live state checked ${new Date(remoteCheckedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}` : "Live state has not been checked yet."} · {sortedTwitch.filter((video) => video.remote?.live).length} live · {twitchVodPicks.length} VODs · {twitchClips.length} clips</p><div className="mt-4 flex flex-wrap gap-2">{(["live", "viewers", "name"] as const).map((sort) => <Button key={sort} size="sm" variant={twitchSort === sort ? "default" : "secondary"} onClick={() => setTwitchSort(sort)}>{sort === "live" ? "Live first" : sort === "viewers" ? "Most viewers" : "A–Z"}</Button>)}<Button size="sm" variant="secondary" onClick={() => void refreshFollows()}>Refresh next live batch</Button>{follows.filter((channel) => channel.kind === "twitch").slice(0, 12).map((channel) => <Button key={channel.id} size="sm" variant="ghost" disabled={channelRefreshing === channel.id} onClick={() => void (async () => { setChannelRefreshing(channel.id); try { await followRemoteQuery(channel.handle, "twitch"); } finally { setChannelRefreshing(""); } })()}>{channelRefreshing === channel.id ? "Checking…" : `Refresh ${channel.title}`}</Button>)}</div></section>
                  <div className="mb-5 flex flex-wrap gap-2">{[["all", "All Twitch"], ["favorites", "Favorites"], ["likes", "Liked"]].map(([value, label]) => <Button key={value} variant={twitchFilter === value ? "default" : "secondary"} onClick={() => setTwitchFilter(value)}>{label}{value === "all" ? "" : " · " + twitchVideos.filter((video) => value === "favorites" ? favorites[video.id] : likes[video.id]).length}</Button>)}</div>
                  <div className="mb-5 flex flex-wrap gap-2"><Button size="sm" variant={twitchTagFilter === "all" ? "default" : "secondary"} onClick={() => setTwitchTagFilter("all")}>All tags</Button>{channelTagShelves.twitch.map((shelf) => <Button key={shelf.tag} size="sm" variant={twitchTagFilter === shelf.tag ? "default" : "secondary"} onClick={() => setTwitchTagFilter(shelf.tag)}>#{shelf.tag} · {shelf.videos.length}</Button>)}</div>
                  {twitchFilter === "all" ? <><TitleRail title="Favorite Twitch videos" videos={favoriteTwitchPicks} variant="rail"/><TitleRail title="Liked on Twitch · discovery" videos={likedTwitchPicks} variant="rail"/></> : null}
                  {twitchFilter !== "all" && !sortedTwitch.some((video) => twitchFilter === "favorites" ? favorites[video.id] : likes[video.id]) && <p className="mb-6 rounded-lg border border-border p-6 text-muted">Nothing saved here yet. Use the heart or like action on a Twitch video to keep it here between visits.</p>}
                  <TitleRail title={twitchFilter === "all" ? "Your Twitch mix" : twitchFilter === "favorites" ? "Your favorites" : "Your liked videos"} videos={sortedTwitch.filter((video) => twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id]))} variant="rail" />
                  {twitchFilter === "all" && <TitleRail title="New to you on Twitch" videos={freshPicks.filter((video) => video.remote?.kind === "twitch")} variant="rail" />}
                  {twitchFilter === "all" && <>
                  <TitleRail title="Live" videos={sortedTwitch.filter((video) => video.remote?.live)} variant="rail" />
                  {liveChannelVods.map(({ creator, vods }) => (
                    <TitleRail key={creator} title={`${creator} · recent VODs`} videos={vods} variant="rail" />
                  ))}
                  <TitleRail title="Popular VODs" videos={twitchVodPicks} variant="rail" />
                  {twitchVodChannels.length > 0 && <section className="mb-8 rounded-xl border border-border bg-surface p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">VOD explorer</p><h2 className="mt-2 font-display text-2xl text-fg">Browse VODs by creator.</h2><p className="mt-1 text-sm text-muted">Channels rise through your plays, saves, likes, high ratings, and the tags those highly rated videos share.</p><div className="mt-5 space-y-6">{twitchVodChannels.map(({ creator, vods }) => <TitleRail key={`vod-explorer-${creator}`} title={`${creator} · ${vods.length} VOD${vods.length === 1 ? "" : "s"}`} videos={vods} variant="rail" />)}</div></section>}
                  <TitleRail title="Clips & quick watches" videos={twitchClips} variant="rail" />
                  {channelTagShelves.twitch.map((shelf) => <TitleRail key={`twitch-tag-${shelf.tag}`} title={`Twitch · ${shelf.tag}`} videos={shelf.videos} variant="rail" />)}
                  </>}
                  <PosterGrid videos={sortedTwitch.filter((video) => (twitchFilter === "all" || (twitchFilter === "favorites" ? favorites[video.id] : likes[video.id])) && (twitchTagFilter === "all" || (tags[video.id] ?? []).includes(twitchTagFilter)))} />
                  {!twitchVideos.length && (
                    <p className="text-sm text-muted">Add a channel from the follow manager below to fill this shelf.</p>
                  )}
                  <ConnectPanel key="twitch-imports" defaultKind="twitch" lockedKind="twitch" />
                </>
              )}

              {sourceId === "live" && browsing && <LiveDesk videos={liveVideos} />}

              {sourceId === "movies" && browsing && (
                <>
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                    <h1 className="font-display text-4xl text-fg">Movies <span className="text-xl text-muted">{movieCatalog.length}</span></h1>
                      <p className="mt-1 text-sm text-muted">
                        Liked titles stay at the front. Change the order when you want a surprise.
                      </p>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setMovieShuffle(Date.now())}
                    >
                      <Shuffle className="size-4" /> Random pick
                    </Button>
                    <Button variant="secondary" size="sm" onClick={() => void restoreFolders()}>
                      Reload local files
                    </Button>
                  </div>
                  <TitleRail title="From your source folders" videos={randomSourceMovies} variant="poster" />
                  <TitleRail title="Random from your library" videos={randomSourceMovies} variant="poster" />
                  {movieTypeShelves.map((shelf) => <TitleRail key={shelf.type} title={`${shelf.type} files · ${shelf.videos.length}`} videos={shelf.videos} variant="poster" />)}
                  {priorityMovieGenres.map((shelf) => <TitleRail key={shelf.genre} title={`${shelf.genre} first`} videos={shelf.videos} variant="poster" />)}
                  <TitleRail
                    title="All movies"
                    videos={randomSourceMovies.filter((video) => !isClassicVideo(video))}
                    variant="poster"
                  />
                  <TitleRail title="Classic movies" videos={classics} variant="poster" />
                  {!movieCatalog.length && <div className="rounded-xl bg-surface px-6 py-14 text-center shadow-border"><p className="font-display text-2xl text-fg">Your movie cache is warming up</p><p className="mx-auto mt-2 max-w-md text-sm text-muted">Local titles return here from the durable catalog even while a folder needs reconnection. Use Reload local files only if the source is missing from the sidebar.</p></div>}
                  {classics.length === 0 && videos.length === 0 ? null : null}
                </>
              )}

              {sourceId === "adults" && adultsUnlocked && browsing && (
                <>
                  <section className="mb-6 rounded-xl bg-elevated p-5 shadow-border"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Private library</p><h1 className="mt-2 font-display text-4xl text-fg">Your shelves, your tags.</h1><p className="mt-2 text-sm text-muted">Tags, history, and organization remain private to this browser. Edit a title’s tags from its preview or player.</p></div><Button disabled={!videos.length} onClick={() => { const choices = adultTag === "All" ? adultSorted : adultSorted.filter((video) => (tags[video.id] ?? []).includes(adultTag)); const pick = choices[Math.floor(Math.random() * choices.length)]; if (pick) openVideo(pick.id); }}><Shuffle className="size-4" /> Random private pick</Button></div><div className="mt-4 flex flex-wrap gap-2"><Button size="sm" variant={adultTag === "All" ? "default" : "secondary"} onClick={() => setAdultTag("All")}>All titles</Button>{adultTagNames.map((tag) => <Button key={tag} size="sm" variant={adultTag === tag ? "default" : "secondary"} onClick={() => setAdultTag(tag)}>{tag}</Button>)}</div><div className="mt-3 flex flex-wrap gap-2"><span className="self-center text-xs text-muted">Sort</span>{(["recent", "name", "favorites", "tagged", "played"] as const).map((sort) => <Button key={sort} size="sm" variant={adultSort === sort ? "default" : "secondary"} onClick={() => setAdultSort(sort)}>{sort === "tagged" ? "Most tagged" : sort === "played" ? "Last played" : sort}</Button>)}</div></section>
                  <div className="mb-6 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-surface p-4 shadow-border"><p className="text-sm font-medium text-fg">Private favorite links</p><p className="mt-1 text-xs leading-5 text-muted">Reserved for your personally saved, consented links. Nothing is added or shared automatically.</p></div><div className="rounded-lg bg-surface p-4 shadow-border"><p className="text-sm font-medium text-fg">Recommended sites</p><p className="mt-1 text-xs leading-5 text-muted">Reserved for future opt-in recommendations. Link sorting will stay separate from your private video catalog.</p></div></div>
                  <PrivateWebShortcuts />
                  <TitleRail title="Continue watching" videos={adultContinue} variant="rail" />
                  <TitleRail title="Favorites" videos={adultFavorites} variant="poster" />
                  <TitleRail title="Most organized" videos={adultTagged} variant="rail" />
                  <TitleRail title="Needs a tag" videos={adultNeedsTags} variant="rail" />
                  <TitleRail title="Recently added" videos={[...videos].sort((a, b) => b.addedAt - a.addedAt).slice(0, 24)} variant="rail" />
                  <TitleRail title={adultTag === "All" ? "All private titles" : `Tagged · ${adultTag}`} videos={adultTag === "All" ? adultSorted : adultSorted.filter((video) => (tags[video.id] ?? []).includes(adultTag))} variant="poster" />
                  <TitleRail
                    title="History"
                    videos={adultHistory}
                    variant="rail"
                    playedAt={playedAt}
                  />
                  {adultFolders.map((folder) => (
                    <TitleRail
                      key={folder.id}
                      title={folder.name}
                      videos={videos.filter((v) => v.folderId === folder.id)}
                      variant="rail"
                    />
                  ))}
                  {adultFolders.length === 0 && (
                    <div className="rounded-xl bg-surface px-6 py-14 text-center shadow-border">
                      <Lock className="mx-auto size-6 text-muted" />
                      <p className="mt-3 font-display text-2xl text-fg">No private folders yet</p>
                      <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                        Add a private folder, or lock an existing source. Those titles stay off
                        Home, Movies, and Favorites.
                      </p>
                      <Button className="mt-5" onClick={() => onAddFolder(undefined, true)}>
                        Add private folder
                      </Button>
                    </div>
                  )}
                </>
              )}

              {sourceId === "favorites" && !query && favoriteVideos.length > 0 && (
                <div className="mb-6">
                  <h1 className="font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl">
                    Favorites
                  </h1>
                  <p className="mt-2 text-sm text-muted">Your list, on this computer. Saved titles remain here even when a source is temporarily unavailable.</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rounded-md bg-elevated p-3 shadow-border"><p className="text-xs text-muted">Saved titles</p><p className="mt-1 font-display text-2xl text-fg">{favoriteVideos.length}</p></div><div className="rounded-md bg-elevated p-3 shadow-border"><p className="text-xs text-muted">Local favorites</p><p className="mt-1 font-display text-2xl text-fg">{favoriteVideos.filter((video) => !video.remote).length}</p></div><div className="rounded-md bg-elevated p-3 shadow-border"><p className="text-xs text-muted">Provider favorites</p><p className="mt-1 font-display text-2xl text-fg">{favoriteVideos.filter((video) => video.remote).length}</p></div><button type="button" onClick={() => setSource("stats")} className="rounded-md bg-elevated p-3 text-left shadow-border hover:bg-surface"><p className="text-xs text-muted">Recovery & export</p><p className="mt-1 text-sm font-medium text-accent">Open favorite diagnostics →</p></button></div>
                </div>
              )}
              {sourceId === "favorites" && !query && <div className="mb-6 rounded-lg bg-elevated p-4 shadow-border"><p className="text-sm font-medium text-fg">Photo favorites stay with the photo library</p><p className="mt-1 text-xs text-muted">Open your saved photos in their optimized viewer without mixing large image assets into this video grid.</p><Button size="sm" variant="secondary" className="mt-3" onClick={() => { localStorage.setItem("reelcase.photos.favorites-only", "true"); setSource("photos"); }}>Open photo favorites</Button></div>}

              {sourceId === "favorites" && !query && favoriteVideos.length > 0 && (
                <>
                  <TitleRail title="Continue your favorites" videos={favoriteVideos.filter((video) => { const mark = progress[video.id]; return mark && mark.t > 0 && mark.t < mark.d; })} variant="rail" />
                  <TitleRail title="Favorite movies" videos={favoriteVideos.filter((video) => !video.remote && !video.isSample)} variant="poster" />
                  <TitleRail title="Favorite YouTube" videos={favoriteVideos.filter((video) => video.remote?.kind === "youtube")} variant="rail" />
                  <TitleRail title="Favorite Twitch" videos={favoriteVideos.filter((video) => video.remote?.kind === "twitch")} variant="rail" />
                  <TitleRail title="Most recently saved" videos={[...favoriteVideos].sort((a, b) => (progress[b.id]?.at ?? b.addedAt) - (progress[a.id]?.at ?? a.addedAt))} variant="rail" />
                  <h2 className="mb-3 font-display text-xl text-fg sm:text-2xl">Everything in My List</h2>
                </>
              )}
              {sourceId === "favorites" && !query ? (
                favoriteVideos.length ? (
                  <div className="w-full min-w-0"><PosterGrid videos={favoriteVideos} /></div>
                ) : (
                  <div className="rounded-xl bg-surface px-6 py-16 text-center shadow-border">
                    <p className="font-display text-2xl text-fg">Nothing in Favorites</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                      Heart a title or use My List on the billboard.
                    </p>
                  </div>
                )
              ) : null}

              {(sourceId === "history" ||
                sourceId === "continue" ||
                query ||
                (!browsing &&
                  sourceId !== "favorites" &&
                  sourceId !== "home" &&
                  sourceId !== "movies" &&
                  sourceId !== "adults" &&
                  sourceId !== "genres" &&
                  sourceId !== "stats" &&
                  sourceId !== "connection" &&
                  sourceId !== "find-phone")) && (
                <>
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <h1 className="font-display text-3xl leading-none tracking-tight text-fg sm:text-4xl">
                        {query ? "Search" : heading}
                      </h1>
                      <p className="mt-2 text-sm text-muted">
                        {sourceId === "history"
                          ? `${history.length} saved watch event${history.length === 1 ? "" : "s"} · ${historyLastDay} in the last 24 hours · no maximum · newest first`
                          : scanning
                          ? `Scanning ${scanning.folderName} · ${scanning.found} found`
                          : `${videos.length} video${videos.length === 1 ? "" : "s"}`}
                      </p>
                    </div>
                    {sourceId === "history" && history.length > 0 && (
                      <div className="flex flex-wrap gap-2"><Button size="sm" variant={historyWindow === "all" ? "default" : "secondary"} onClick={() => setHistoryWindow("all")}>All time</Button><Button size="sm" variant={historyWindow === "day" ? "default" : "secondary"} onClick={() => setHistoryWindow("day")}>24 hours</Button><Button size="sm" variant={historyWindow === "week" ? "default" : "secondary"} onClick={() => setHistoryWindow("week")}>7 days</Button><Button variant="ghost" size="sm" onClick={clearHistory}>Clear history</Button></div>
                    )}
                  </div>
                  {sourceId === "history" && historyTopTags.length > 0 && (
                    <div className="mb-5 rounded-lg bg-elevated px-4 py-3 shadow-border">
                      <p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Historical interests</p>
                      <div className="mt-2 flex flex-wrap gap-2">{historyTopTags.map(([tag, count]) => <span key={tag} className="rounded-full border border-border px-2.5 py-1 text-xs text-muted">#{tag} · {count}</span>)}</div>
                    </div>
                  )}
                  {sourceId === "history" && history.length > 0 && (
                    <div className="mb-5 flex flex-wrap gap-2 rounded-lg border border-border bg-surface px-4 py-3 text-xs text-muted shadow-border">
                      <span><strong className="text-fg">Viewing record</strong> · {historyRecovery.resumable} resumable activity mark{historyRecovery.resumable === 1 ? "" : "s"}</span>
                      <span>· {historyRecovery.sources.progress} playback</span>
                      <span>· {historyRecovery.sources.watchRoom} Watch Room</span>
                      <span>· {historyRecovery.sources.open} direct opens</span>
                    </div>
                  )}
                  {folders.find((folder) => folder.id === sourceId)?.photoCount ? <div className="mb-4 flex items-center justify-between gap-3 rounded-lg bg-elevated px-4 py-3 shadow-border"><p className="text-sm text-fg">This source also has {folders.find((folder) => folder.id === sourceId)?.photoCount} discovered photos.</p><Button size="sm" variant="secondary" onClick={() => { const folder = folders.find((item) => item.id === sourceId); if (folder) localStorage.setItem("reelcase.photos.source-filter", folder.name); setSource("photos"); }}>Browse this source’s photos</Button></div> : null}
                  {sourceId === "history" || sourceId === "continue" || query ? (
                    <VideoGrid
                      videos={sourceId === "history" ? historyFilteredVideos : videos}
                      playedAt={sourceId === "history" ? playedAt : undefined}
                    />
                  ) : (
                    <PosterGrid videos={videos} />
                  )}
                </>
              )}

              {sourceId === DEMO_FOLDER_ID && (
                <p className="mt-8 text-center text-xs text-subtle">
                  Original shorts styled as classics. Add a folder to scan this computer.
                </p>
              )}
            </>
          )}
        </main>
      </div>

      {activeId && <Player playlist={playlist} />}
      {previewId && <PreVideo />}

      {dragging && (
        <div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-bg/80">
          <div className="rounded-xl bg-surface px-8 py-6 text-center shadow-border shadow-lift">
            <p className="font-display text-2xl text-fg">Drop to add</p>
            <p className="mt-1 text-sm text-muted">Folders or video files</p>
          </div>
        </div>
      )}

      <input
        ref={dirInputRef}
        type="file"
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        {...({ webkitdirectory: "", directory: "" } as Record<string, string>)}
        onChange={(e) => {
          const files = e.target.files;
          const adult = pendingAdult.current;
          pendingAdult.current = false;
          if (files?.length) {
            void ingestFromInput(files, true, { adult }).catch((err: unknown) => {
              toast.error(err instanceof Error ? err.message : "Could not read folder");
            });
          }
          e.target.value = "";
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="video/*"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => {
          const files = e.target.files;
          if (files?.length) {
            void ingestFromInput(files, false).catch((err: unknown) => {
              toast.error(err instanceof Error ? err.message : "Could not read files");
            });
          }
          e.target.value = "";
        }}
      />

      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          classNames: {
            toast: "bg-elevated text-fg shadow-border border-0",
            title: "text-fg",
            description: "text-muted",
          },
        }}
      />
    </div>
  );
}

