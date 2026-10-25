import { completeKnownYoutubeEvidence, YoutubeLiveEvidenceError, youtubeHtmlLiveEvidence, type YoutubeLiveRead } from './youtube-live-evidence';
import { validateYoutubeFeed } from './youtube-contract';
import { walkTwitchClips, type TwitchClipNode } from './twitch-clips';
import { recentPullSuccess, recentPullFailure, recentPullReady } from '../videos/recent-pull';
import { liveRoomRequest, type LiveRoomPage } from './live-rooms';
import { uniqueYoutubePage, youtubePublishedTime } from "./youtube-page";
import { youtubeRendererMetadata } from '../videos/youtube-metadata';
import { PROVIDER_BUDGETS, ProviderBudgetError } from '../provider-budgets';
import { fetchProviderMetadata } from './provider-body';
import { createProviderMetadataCache } from './provider-metadata-cache';
import { estimateProviderPayload, type ProviderCacheSample } from '../provider-cache-metrics';
import { archivePageWindow } from './archive-page';
import type { FollowedChannel, FollowKind, LibraryVideo, ProviderFailure } from "@/lib/videos/types";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import { cachedAdultFetch } from "@/lib/remote/adult-pull-cache";
import {
  adultDeepenQueriesForPage,
  ADULT_PULL_PROVIDERS,
  CHATURBATE_FOLDER_ID,
  EPORNER_FOLDER_ID,
  MYFREECAMS_FOLDER_ID,
  REDDIT_FOLDER_ID,
  BOORU_FOLDER_ID,
  REDGIFS_FOLDER_ID,
  REDTUBE_FOLDER_ID,
  ADULT_REDDIT_SUBS,
  ADULT_REDDIT_PRIORITY_SUBS,
  type AdultPullProvider,
} from "@/lib/videos/adult-sites";
import { extractRedditMedia, shouldKeepRedditEntry } from "@/lib/videos/adult-reddit-media";
import { extractRedditFlair } from "@/lib/videos/adult-reddit-tags";
import { expandAdultThumbFallbacks, isUsableAdultThumb, pickRedtubeThumb, redtubeStarNames } from "@/lib/videos/adult-thumbs";
import { newestYoutubeFeedVideoId, selectYoutubeFeedDelta } from "./youtube-feed-cursor";
import { booruPostImageUrls } from "./booru-image";
import { publicPlaylistEntries, publicPlaylistTitle, youtubePlaylistId } from "./youtube-playlist";
import { youtubeCatalogContinuation, youtubeCatalogHasTerminalPage, youtubeCatalogItems } from "./youtube-catalog";
import { youtubeInitialData, youtubePageChannelId, youtubeVideoRenderers, type YoutubeRenderer } from "./youtube-page-data";
import { assertYoutubeReady, fetchYoutubeResponse, youtubeRetryAt, youtubeCooldownScope, setYoutubeRequestGap, createYoutubeManualRetry, YoutubeRequestError, type YoutubeRequestScope, type YoutubeManualRetry } from './youtube-transport';
import { exactYoutubeChannel } from './youtube-channel-search';
import { youtubeUploadsArchive, youtubeBrowseArchive, youtubePlaylistBrowseId } from './youtube-browse';
import { resolveYoutubeCreator } from './youtube-resolve';
import { browseYoutubeLives, canRecoverYoutubeLiveLayout } from './youtube-live-browse';
import { youtubeLiveFailure } from '../videos/youtube-live-health';
import { readTwitchLiveBatch, validateTwitchLiveUser } from './twitch-live-batch';
import { walkTwitchArchive } from './twitch-archive-walk';
import { classifyTwitchFailure, twitchRetryPatch } from '../videos/twitch-retry';
import type { TwitchPullDiagnostics } from '@/lib/videos/types';
import { advanceTwitchClipCursor, decodeTwitchClipCursor, encodeTwitchClipCursor } from '@/lib/videos/twitch-clip-cursor';

import { twitchContentEvidence } from '../videos/twitch-content';

type FollowInput = { freshTwitchClips?: boolean; twitchClipMode?: "recent" | "archive"; query: string; kind: "auto" | FollowKind; clipLimit?: number; twitchVodLimit?: number; catalogCursor?: string; twitchArchiveCursor?: string; twitchClipCursor?: string };
type RefreshInput = { channels: FollowedChannel[]; youtubeCatalog: boolean; youtubeBackground: boolean; youtubeLiveOnly: boolean; twitchLiveOnly: boolean; twitchRoutine: boolean; twitchContinueArchive?: boolean; forceYoutube?: boolean; youtubeVideoLimit?: number };

export type FollowResult = {
  channel: FollowedChannel;
  videos: LibraryVideo[];
};

export type RefreshResult = {
  videos: LibraryVideo[];
  channels: FollowedChannel[];
  refreshedIds: string[];
  /** Only successful live observations can retire earlier broadcast cards. */
  liveCheckedIds?: string[];
  /** Exact next eligible time for a provider/channel cooling down after failures. */
  retryAt: Record<string, number>;
  providerRetryAt?: number;
  providerCooldownScope?: YoutubeRequestScope;
};

type ProviderName = "youtube" | "twitch";
const providerInflight = new Map<string, Promise<unknown>>();
const providerFailures = new Map<string, { attempts: number; retryAt: number }>();

function providerKey(provider: ProviderName, handle: string) {
  return `${provider}:${handle.trim().toLowerCase()}`;
}

function retryAtFor(provider: ProviderName, handle: string) {
  return providerFailures.get(providerKey(provider, handle))?.retryAt;
}

/** Turn public-provider failures into a small, actionable local diagnosis.
 * This never changes cached cards: the refresh merge is intentionally additive
 * when a channel does not reach a healthy response. */
export function classifyProviderFailure(provider: ProviderName, error: unknown): ProviderFailure {
  if (provider === 'twitch') return classifyTwitchFailure(error);
  const raw = error instanceof Error ? error.message : String(error || "Unknown provider failure");
  const message = raw.replace(/\s+/g, " ").trim().slice(0, 240) || "Unknown provider failure";
  const lower = message.toLowerCase();
  const common = { message, at: Date.now(), ...(error instanceof YoutubeRequestError && error.retryAt ? { retryAt: error.retryAt, cooldownScope: error.cooldownScope } : {}) };
  if (error instanceof ProviderBudgetError || /metadata.*(?:budget|queue)|response budget/.test(lower)) {
    return { ...common, kind: 'response-budget', recovery: 'This metadata response exceeded a memory or queue budget. Accepted pages and saved positions are preserved; retry later. This does not reduce your archive target.' };
  }
  if (/\b429\b|rate.?limit|too many requests|retrying after/.test(lower)) {
    return { ...common, kind: "rate-limited", recovery: `${provider === 'youtube' ? 'Automatic YouTube pulls wait for the recommended cooldown. You can force a fresh pull from the YouTube page.' : 'Twitch pulls wait for the provider cooldown before retrying.'} Cached cards and archive positions are preserved.` };
  }
  if (/integrity|challenge/.test(lower)) {
    return { ...common, kind: "integrity-challenge", recovery: "Twitch accepted the cached archive but requires its public integrity check for deeper pages. Try a focused pull later; no cached VODs were removed." };
  }
  if (/page.?limit|first.*100|public.*page/.test(lower)) {
    return { ...common, kind: "public-page-limit", recovery: "The public archive stopped advancing. Keep the accepted pages and try a later focused pull rather than increasing the routine budget." };
  }
  if (/json|parse|malformed|invalid response|unexpected token/.test(lower)) {
    return { ...common, kind: "malformed", recovery: "The provider returned an unreadable response. Cached cards remain available; retry this channel after the provider recovers." };
  }
  if (/\b404\b|\b410\b|could not (find|resolve)|not found|unavailable|does not exist/.test(lower)) {
    return { ...common, kind: "unavailable", recovery: "The public channel or item is unavailable right now. Keep its cached cards and confirm the creator link before removing anything." };
  }
  return { ...common, kind: "network-offline", recovery: "The provider could not be reached. Cached cards remain available and Realhub will retry after the shown cooldown." };
}

/** Share identical work across browser tabs and suppress only background retries. */
async function providerRequest<T>(provider: ProviderName, handle: string, focused: boolean, work: () => Promise<T>, failureHandle = handle): Promise<T> {
  const key = providerKey(provider, handle);
  const failureKey = providerKey(provider, failureHandle);
  const cooling = providerFailures.get(failureKey);
  if (provider === 'youtube' && !focused && cooling && cooling.retryAt > Date.now()) {
    throw new Error(`${provider} is retrying after ${new Date(cooling.retryAt).toLocaleTimeString()}`);
  }
  const existing = providerInflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const pending = work().then((result) => {
    if (provider === 'youtube') providerFailures.delete(failureKey);
    return result;
  }).catch((error) => {
    // Twitch retries are durable and scope-specific on FollowedChannel, so
    // reloads and a healthy live check cannot erase an archive cooldown.
    if (provider === 'twitch') throw error;
    const previous = providerFailures.get(failureKey);
    const attempts = Math.min(8, (previous?.attempts ?? 0) + 1);
    // 15s → 30s → … → 5m keeps a failing provider from pinning six workers.
    providerFailures.set(failureKey, { attempts, retryAt: Date.now() + Math.min(300_000, 15_000 * 2 ** (attempts - 1)) });
    if (providerFailures.size > 512) {
      const now = Date.now();
      for (const [entryKey, failure] of providerFailures) if (failure.retryAt < now) providerFailures.delete(entryKey);
      while (providerFailures.size > 512) providerFailures.delete(providerFailures.keys().next().value!);
    }
    throw error;
  }).finally(() => providerInflight.delete(key));
  providerInflight.set(key, pending);
  return pending;
}

function asString(v: unknown) {
  return typeof v === "string" ? v : "";
}

function parseFollow(data: unknown): FollowInput {
  if (typeof data !== "object" || data === null) throw new Error("Enter a channel or URL");
  const rec = data as Record<string, unknown>;
  const query = asString(rec.query).trim();
  if (!query) throw new Error("Enter a channel or URL");
  const kind = rec.kind === "youtube" || rec.kind === "twitch" ? rec.kind : "auto";
  if (rec.twitchClipMode !== undefined && !["recent", "archive"].includes(String(rec.twitchClipMode))) throw new Error("Choose recent or archive Twitch clips.");
  const twitchClipMode = rec.twitchClipMode as FollowInput["twitchClipMode"];
  if (rec.freshTwitchClips !== undefined && typeof rec.freshTwitchClips !== "boolean") throw new Error("Fresh clip read must be true or false.");
  if (rec.freshTwitchClips === true && !twitchClipMode) throw new Error("A fresh clip read requires a clip update mode.");
  const freshTwitchClips = rec.freshTwitchClips === true;
  const rawClips = typeof rec.clipLimit === "number" ? rec.clipLimit : Number(rec.clipLimit);
  const clipLimit = Number.isFinite(rawClips) && rawClips >= 0
    ? Math.min(LIBRARY_LIMITS.twitchFocusedClipsPerChannel, Math.floor(rawClips))
    : undefined;
  if (twitchClipMode && clipLimit === 0) throw new Error("Choose at least one clip for a clip update.");
  const catalogCursor = typeof rec.catalogCursor === "string" && rec.catalogCursor.length <= 16_384 ? rec.catalogCursor : undefined;
  const twitchArchiveCursor = typeof rec.twitchArchiveCursor === "string" && rec.twitchArchiveCursor.length <= 16_384 ? rec.twitchArchiveCursor : undefined;
  const twitchClipCursor = typeof rec.twitchClipCursor === "string" && rec.twitchClipCursor.length <= 8_192 ? rec.twitchClipCursor : undefined;
  const twitchVodLimit = typeof rec.twitchVodLimit === 'number' && Number.isFinite(rec.twitchVodLimit) ? Math.max(100, Math.min(TWITCH_FOCUSED_VOD_LIMIT, Math.floor(rec.twitchVodLimit))) : undefined;
  return { query, kind, ...(freshTwitchClips ? {freshTwitchClips:true} : {}), ...(twitchClipMode ? { twitchClipMode } : {}), ...(clipLimit !== undefined ? { clipLimit } : {}), ...(twitchVodLimit ? { twitchVodLimit } : {}), ...(catalogCursor ? { catalogCursor } : {}), ...(twitchArchiveCursor ? { twitchArchiveCursor } : {}), ...(twitchClipCursor ? { twitchClipCursor } : {}) };
}

function parseRefresh(data: unknown): RefreshInput {
  if (typeof data !== "object" || data === null) return { channels: [], youtubeCatalog: false, youtubeBackground: false, youtubeLiveOnly: false, twitchLiveOnly: false, twitchRoutine: false };
  const rec = data as Record<string, unknown>;
  const channels = Array.isArray(rec.channels) ? (rec.channels as FollowedChannel[]) : [];
  // Keep a sizeable saved list live after restore; the refresh worker remains
  // concurrency-limited below so this does not flood providers.
  const limit = Number(rec.youtubeVideoLimit);
  return { channels: channels.slice(0, rec.twitchLiveOnly === true && channels.every(channel => channel.kind === 'twitch') ? 100 : 80), youtubeCatalog: rec.youtubeCatalog === true, youtubeBackground: rec.youtubeBackground === true, youtubeLiveOnly: rec.youtubeLiveOnly === true, twitchLiveOnly: rec.twitchLiveOnly === true, twitchRoutine: rec.twitchRoutine === true, twitchContinueArchive: rec.twitchContinueArchive === true && rec.youtubeLiveOnly !== true && rec.twitchLiveOnly !== true, forceYoutube: rec.forceYoutube === true && rec.youtubeCatalog === true && rec.youtubeBackground !== true && rec.youtubeLiveOnly !== true && rec.twitchLiveOnly !== true && rec.twitchRoutine !== true, youtubeVideoLimit: Number.isFinite(limit) ? Math.max(30, Math.min(500, Math.floor(limit))) : 100 };
}

function guessKind(query: string): FollowKind {
  const q = query.toLowerCase();
  if (q.includes("twitch.tv") || q.startsWith("tw:")) return "twitch";
  if (q.includes("youtube") || q.includes("youtu.be") || q.startsWith("@")) return "youtube";
  return "youtube";
}

function ytVideoId(input: string): string | null {
  try {
    if (/^[A-Za-z0-9_-]{11}$/.test(input)) return input;
    const url = new URL(input.startsWith("http") ? input : `https://${input}`);
    if (url.hostname.includes("youtu.be")) {
      const id = url.pathname.split("/").filter(Boolean)[0];
      return id && id.length === 11 ? id : null;
    }
    if (url.searchParams.get("v")) return url.searchParams.get("v");
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "shorts" || parts[0] === "embed" || parts[0] === "live") {
      return parts[1] ?? null;
    }
  } catch {
    return null;
  }
  return null;
}

function ytHandle(input: string): string | null {
  const raw = input.trim();
  const at = raw.match(/^@([A-Za-z0-9._-]+)/);
  if (at) return at[1];
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://${raw}`);
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0]?.startsWith("@")) return parts[0].slice(1);
    if (parts[0] === "channel" && parts[1]?.startsWith("UC")) return null;
    if (parts[0] === "c" || parts[0] === "user") return parts[1] ?? null;
  } catch {
    return raw.replace(/^@/, "") || null;
  }
  return raw.replace(/^@/, "") || null;
}

function ytChannelIdFromText(text: string): string | null {
  return youtubePageChannelId(text);
}

function youtubeChannelAvatar(html: string): string | undefined {
  const meta = html.match(/<meta\s+(?:property|name)=["']og:image["']\s+content=["']([^"']+)["']/i)
    ?? html.match(/<meta\s+content=["']([^"']+)["']\s+(?:property|name)=["']og:image["']/i);
  const avatar = meta?.[1] ?? html.match(/"avatar"\s*:\s*\{[^}]*"url"\s*:\s*"([^"]+)"/i)?.[1];
  return avatar && /^https:\/\/[^\s]+$/i.test(avatar) ? decodeXml(avatar) : undefined;
}

/** Fill artwork for older saved follows without pulling every channel archive. */
export async function runYoutubeCreatorProfiles(dataRaw: unknown): Promise<Array<{ id: string; thumb?: string; description?: string }>> {
  const ids = Array.isArray(dataRaw) ? dataRaw.filter((id): id is string => typeof id === "string" && /^yt:UC[A-Za-z0-9_-]{20,}$/.test(id)).slice(0, 16) : [];
  const results: Array<{ id: string; thumb?: string; description?: string }> = [];
  for (let start = 0; start < ids.length; start += 4) {
    const batch = await Promise.all(ids.slice(start, start + 4).map(async (id) => {
      try {
        const html = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(id.slice(3))}`);
        const thumb = youtubeChannelAvatar(html);
        const description = decodeXml(html.match(/<meta\s+(?:name|property)=["']description["']\s+content=["']([^"']+)["']/i)?.[1] ?? "").slice(0, 400);
        return { id, ...(thumb ? { thumb } : {}), ...(description ? { description } : {}) };
      } catch { return { id }; }
    }));
    results.push(...batch);
  }
  return results;
}

function decodeXml(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function tag(xml: string, name: string): string {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decodeXml(m[1]).trim() : "";
}

async function fetchText(url: string, manualRetry?: YoutubeManualRetry, scope?: 'live'): Promise<string> {
  const youtube = new URL(url).hostname === 'www.youtube.com';
  const headers = {
    "user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai) AppleWebKit/537.36",
    accept: "text/html,application/xhtml+xml,application/xml,application/json",
  };
  const res = await (youtube ? fetchYoutubeResponse(url, { timeoutMs: 12000, headers, manualRetry, scope }) : fetchProviderMetadata(url, {
    signal: AbortSignal.timeout(12000),
    headers,
  }));
  if (!res.ok) throw new Error(`HTTP ${res.status}: Could not reach ${url}`);
  return res.text();
}

function applyYoutubePullPacing(data: unknown) {
  if (data && typeof data === 'object') setYoutubeRequestGap((data as { youtubeRequestGapMs?: unknown }).youtubeRequestGapMs);
}

function ytVideo(entry: {
  id: string;
  title: string;
  published: string;
  thumb: string;
  desc: string;
  channelId: string;
  channelName: string;
  live?: boolean;
  duration?: number;
  views?: number;
  metadata?: ReturnType<typeof youtubeRendererMetadata>;
}): LibraryVideo {
  const rssDate = youtubePublishedTime(entry.published);
  const published = rssDate || youtubePublishedTime(entry.metadata?.published ?? '');
  const live = entry.live ?? (entry.metadata?.youtubeType === 'live' ? true : entry.metadata?.youtubeType ? false : undefined);
  return {
    id: `yt:${entry.id}`,
    folderId: `yt:${entry.channelId}`,
    name: entry.title,
    path: `youtube/${entry.channelName}/${entry.title}`,
    extension: "yt",
    mime: "video/youtube",
    size: 0,
    duration: entry.duration ?? entry.metadata?.duration,
    addedAt: published,
    tagline: entry.desc.slice(0, 180),
    // A compact snippet still supports discovery and local topic matching.
    // Keeping multi-kilobyte descriptions for deep archives wastes browser
    // memory and durable storage without helping the card UI.
    description: entry.desc.slice(0, 800),
    poster: entry.thumb || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
    src: `https://www.youtube.com/embed/${entry.id}`,
    remote: {
      kind: "youtube",
      videoId: entry.id,
      channelId: entry.channelId,
      channelName: entry.channelName,
      live,
      publishedSource: published ? rssDate ? 'rss' : 'provider' : 'unknown',
      ...(/^\d{4}-\d{2}-\d{2}$/.test(entry.metadata?.published ?? '') ? { publishedDate: entry.metadata!.published } : {}),
      ...(entry.metadata?.youtubeType ? { youtubeType: entry.metadata.youtubeType } : live ? { youtubeType: 'live' } : {}),
      ...(live ? { observedAt: Date.now(), liveOfflineSince: undefined } : {}),
      views: entry.views,
      embedUrl: `https://www.youtube.com/embed/${entry.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${entry.id}`,
      previewUrl: `https://i.ytimg.com/an_webp/${entry.id}/mqdefault_6s.webp`,
    },
  };
}

// A deep channel fetch is expensive public metadata work. Keep a short bounded
// server cache so opening a creator, refreshing its shelf, and retrying an
// embed do not fan out into identical page reads.
const YOUTUBE_CHANNEL_CACHE_TTL_MS = 4 * 60_000;
const YOUTUBE_CHANNEL_CACHE_LIMIT = 12;
// Keep only shallow/provider-page results in server memory; durable history
// lives in the browser cache, not in a second 12-channel archive graph.
const YOUTUBE_DEEP_CACHE_MAX_VIDEOS = PROVIDER_BUDGETS.warmCacheRows;
type YoutubeCacheEntry = {
  at: number;
  result: FollowResult;
  feedVideos: LibraryVideo[];
  hits: number;
  misses: number;
  scope: "feed" | "catalog";
  estimatedBytes: number;
};
const youtubeChannelCache = createProviderMetadataCache<YoutubeCacheEntry>({ maxEntries: YOUTUBE_CHANNEL_CACHE_LIMIT, maxBytes: PROVIDER_BUDGETS.youtubeCacheBytes, maxEntryBytes: PROVIDER_BUDGETS.warmCacheEntryBytes, ttlMs: YOUTUBE_CHANNEL_CACHE_TTL_MS });

function rendererText(value: YoutubeRenderer["title"] | YoutubeRenderer["viewCountText"]) {
  return value?.simpleText ?? value?.runs?.map((run) => run.text ?? "").join("") ?? "";
}

function parsePublicViewCount(text: string) {
  const match = text.replace(/,/g, "").match(/([\d.]+)\s*([KMB])?\s+(?:views|watching)/i);
  if (!match) return undefined;
  const value = Number(match[1]);
  const multiplier = match[2]?.toUpperCase() === "B" ? 1_000_000_000 : match[2]?.toUpperCase() === "M" ? 1_000_000 : match[2]?.toUpperCase() === "K" ? 1_000 : 1;
  return Number.isFinite(value) ? Math.round(value * multiplier) : undefined;
}

function youtubeRenderers(root: unknown, maximum: number): YoutubeRenderer[] {
  // Unrecognized pages can contain recommendations belonging to other
  // creators. Never mistake those for the requested creator's archive.
  return youtubeVideoRenderers(youtubeCatalogItems(root), maximum);
}

function channelPageRenderers(html: string): YoutubeRenderer[] {
  const root = youtubeInitialData(html);
  return root ? youtubeRenderers(root, LIBRARY_LIMITS.youtubeFocusedVideosPerChannel) : [];
}

function youtubeContinuation(root: unknown): string | null {
  const stack: unknown[] = [root];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) { for (let index = current.length - 1; index >= 0; index -= 1) stack.push(current[index]); continue; }
    const record = current as Record<string, unknown>;
    const command = record.continuationCommand;
    if (command && typeof command === "object" && typeof (command as Record<string, unknown>).token === "string") return (command as Record<string, string>).token;
    // Initial channel shells normally expose nextContinuationData rather than
    // the continuationCommand used by later append responses. Accept both,
    // plus the reload form used by some YouTube client variants.
    for (const key of ["nextContinuationData", "reloadContinuationData", "continuationData"]) {
      const value = record[key];
      if (value && typeof value === "object" && typeof (value as Record<string, unknown>).continuation === "string") {
        return (value as Record<string, string>).continuation;
      }
    }
    const endpoint = record.continuationEndpoint;
    if (endpoint && typeof endpoint === "object") {
      const endpointRecord = endpoint as Record<string, unknown>;
      const endpointCommand = endpointRecord.continuationCommand;
      if (endpointCommand && typeof endpointCommand === "object" && typeof (endpointCommand as Record<string, unknown>).token === "string") {
        return (endpointCommand as Record<string, string>).token;
      }
      const endpointNext = endpointRecord.nextContinuationData;
      if (endpointNext && typeof endpointNext === "object" && typeof (endpointNext as Record<string, unknown>).continuation === "string") {
        return (endpointNext as Record<string, string>).continuation;
      }
    }
    for (const value of Object.values(record).reverse()) if (value && typeof value === "object") stack.push(value);
  }
  return null;
}

function youtubeBrowseConfig(html: string, root: unknown) {
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
  const continuation = youtubeCatalogContinuation(root);
  return apiKey ? { apiKey, clientVersion, continuation } : null;
}

type YoutubeBackfillResult = { videos: LibraryVideo[]; cursor: string | null; completed: boolean };

async function youtubeContinuationBackfill(html: string, knownIds: Set<string>, channelId: string, channelName: string, limit: number, resumeCursor?: string, manualRetry?: YoutubeManualRetry): Promise<YoutubeBackfillResult> {
  const root = youtubeInitialData(html);
  const config = root ? youtubeBrowseConfig(html, root) : null;
  if (!config) return { videos: [], cursor: resumeCursor ?? null, completed: false };
  // A full sweep batch still needs to persist its continuation. Dropping it
  // here makes the next sweep restart at the creator shell and appear stuck.
  if (limit <= 0) return { videos: [], cursor: resumeCursor ?? config.continuation, completed: false };
  const seen = new Set(knownIds);
  const videos: LibraryVideo[] = [];
  const addPageVideos = (pageData: unknown) => {
    const pageVideos = uniqueYoutubePage(youtubeRenderers(pageData, 500), seen);
    for (const renderer of pageVideos) {
      const id = renderer.videoId;
      if (!id) continue;
      const thumb = renderer.thumbnail?.thumbnails?.at(-1)?.url;
      videos.push(ytVideo({ id, title: rendererText(renderer.title) || `${channelName} video`, published: '', metadata: youtubeRendererMetadata(renderer), thumb: thumb || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, desc: rendererText(renderer.descriptionSnippet) || `${channelName} public channel catalog item.`, channelId, channelName, views: parsePublicViewCount(rendererText(renderer.viewCountText)) }));
    }
  };
  let continuation: string | null = resumeCursor ?? config.continuation;
  const initialCount = root ? youtubeRenderers(root, 31).length : 0;
  let completed = !continuation && youtubeCatalogHasTerminalPage(root) && initialCount > 0 && initialCount < 30;
  // The channel shell can omit a continuation entirely. Every channel also
  // has a public uploads playlist (UU + the channel id without UC), which is
  // a stable Innertube browse target and gives us the same paged archive.
  if (!continuation && /^UC[A-Za-z0-9_-]{20,}$/.test(channelId)) {
    try {
      const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(config.apiKey)}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-youtube-client-name": "1", "x-youtube-client-version": config.clientVersion },
        body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion: config.clientVersion } }, browseId: youtubePlaylistBrowseId(`UU${channelId.slice(2)}`) }),
        timeoutMs: 10_000, manualRetry,
      });
      if (response.ok) {
        const pageData = await response.json() as unknown;
        addPageVideos(pageData);
        continuation = youtubeCatalogContinuation(pageData);
        // A few channel layouts still expose renderer-shaped rows but not a
        // parseable Videos grid. Those rows are useful, but are not evidence
        // that the public archive has ended.
        completed = !continuation && youtubeCatalogHasTerminalPage(pageData) && videos.length > 0;
      }
    } catch { /* The channel shell remains a valid partial source. */ }
  }
  const archiveDeadline = Date.now() + (limit <= 100 ? 20_000 : 120_000);
  const visitedTokens = new Set<string>();
  const pageBudget = Math.min(LIBRARY_LIMITS.youtubeArchivePagesPerPull, Math.max(4, Math.ceil(limit / 30) + 2));
  for (let page = 0; continuation && page < pageBudget && videos.length < limit; page += 1) {
    if (visitedTokens.has(continuation) || Date.now() >= archiveDeadline) break;
    visitedTokens.add(continuation);
    try {
      const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(config.apiKey)}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-youtube-client-name": "1", "x-youtube-client-version": config.clientVersion },
        body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion: config.clientVersion } }, continuation }),
        timeoutMs: 10_000, manualRetry,
      });
      const pageData = await response.json() as unknown;
      addPageVideos(pageData);
      const next = youtubeCatalogContinuation(pageData);
      if (next && next !== continuation) continuation = next;
      else if (youtubeCatalogHasTerminalPage(pageData) && youtubeRenderers(pageData, 1).length) { continuation = null; completed = true; }
      else if (resumeCursor && continuation === resumeCursor) {
        // Saved tokens can expire. Recover the first page once rather than
        // returning the same RSS window forever with a stuck archive cursor.
        addPageVideos(root); continuation = config.continuation;
      } else break;
      // The transport owns page pacing. A second sleep here would silently
      // add delay even when the user selected no additional page wait.
    } catch (error) {
      if (resumeCursor && continuation === resumeCursor && error instanceof YoutubeRequestError && (error.status === 400 || error.status === 404)) {
        addPageVideos(root); continuation = config.continuation; continue;
      }
      break;
    }
  }
  return { videos, cursor: continuation, completed };
}

async function youtubeChannelBackfill(channelId: string, channelName: string, knownIds: Set<string>, limit: number, manualRetry?: YoutubeManualRetry): Promise<LibraryVideo[]> {
  try {
    const html = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`, manualRetry);
    const seen = new Set(knownIds);
    const videos: LibraryVideo[] = [];
    for (const renderer of channelPageRenderers(html)) {
      const id = renderer.videoId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      videos.push(ytVideo({
        id,
        title: rendererText(renderer.title) || `${channelName} video`,
        // RSS remains the authoritative published-date source. Backfilled
        // cards are deliberately old until a provider supplies an exact date.
        published: "1970-01-01T00:00:00.000Z",
        metadata: youtubeRendererMetadata(renderer),
        thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
        // Channel pages expose a short public description snippet for many
        // cards. Keep it so the local tagger can derive real topic words
        // instead of relying only on a title and provider label.
        desc: rendererText(renderer.descriptionSnippet) || `${channelName} public channel catalog item.`,
        channelId,
        channelName,
        views: parsePublicViewCount(rendererText(renderer.viewCountText)),
      }));
      if (videos.length >= limit) break;
    }
    return videos;
  } catch { return []; }
}

async function youtubeFromVideo(id: string, short = false): Promise<FollowResult> {
  const oembed = await fetchYoutubeResponse(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
    { timeoutMs: 12000 },
  );
  if (!oembed.ok) throw new Error("That YouTube video could not be found.");
  const meta = (await oembed.json()) as {
    title?: string;
    author_name?: string;
    author_url?: string;
    thumbnail_url?: string;
  };
  const channelName = meta.author_name ?? "YouTube";
  let channelId = "";
  if (meta.author_url) {
    try {
      const html = await fetchText(meta.author_url);
      channelId = ytChannelIdFromText(html) ?? "";
    } catch {
      channelId = "";
    }
  }
  const folderId = channelId ? `yt:${channelId}` : YT_INBOX;
  const video = ytVideo({
    id,
    title: meta.title ?? "YouTube video",
    published: '',
    metadata: short ? { youtubeType: 'short' } : undefined,
    thumb: meta.thumbnail_url ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
    desc: "",
    channelId: channelId || "inbox",
    channelName,
  });
  video.folderId = folderId;
  const channel: FollowedChannel = {
    id: folderId,
    kind: "youtube",
    handle: channelName,
    title: channelName,
    channelId: channelId || undefined,
    thumb: meta.thumbnail_url,
    lastCheckedAt: Date.now(),
    newestPublishedAt: video.addedAt,
    lastResponseCount: 1,
  };
  return { channel, videos: [video] };
}

const YT_INBOX = "youtube:inbox";

async function youtubeLiveForFollow(channel: FollowedChannel): Promise<{ channel: FollowedChannel; videos: LibraryVideo[]; complete: boolean }> {
  let channelId = channel.channelId ?? channel.id.match(/^yt:(UC[A-Za-z0-9_-]{20,})$/)?.[1] ?? '';
  if (!channelId) channelId = await resolveYoutubeCreator(channel.handle);
  let result: YoutubeLiveRead;
  try { result = await browseYoutubeLives.inspect(channelId); }
  catch (error) {
    if (!canRecoverYoutubeLiveLayout(error)) throw error;
    result = youtubeHtmlLiveEvidence(await fetchText('https://www.youtube.com/channel/' + encodeURIComponent(channelId) + '/streams'), channelId);
  }
  result = await completeKnownYoutubeEvidence(result, channel.youtubeLiveKnownOverflow ? [] : channel.youtubeLiveVideoIds ?? [], channelId,
    id => fetchText('https://www.youtube.com/watch?v=' + encodeURIComponent(id), undefined, 'live'));
  if (!result.observations.length && !result.evidence.complete) throw new YoutubeLiveEvidenceError(result.evidence);
  const checkedAt = result.evidence.at;
  const videos = result.observations.map(observed => {
    const video = ytVideo({id:observed.id,title:observed.title || channel.title + ' live',published:'',thumb:'https://i.ytimg.com/vi/' + observed.id + '/hqdefault.jpg',desc:channel.title + ' is live on YouTube.',channelId,channelName:channel.title,live:true});
    if (video.remote) { video.remote.viewers = observed.viewers; video.remote.observedAt = checkedAt; }
    video.tagline = channel.title + ' is live now'; return video;
  });
  const ids = result.observations.map(row => row.id);
  return {complete:result.evidence.complete, channel:{...channel,channelId,live:ids.length > 0,liveCheckedAt:checkedAt,lastLiveFailure:undefined,youtubeLiveEvidence:result.evidence,youtubeLiveKnownOverflow:result.evidence.complete ? undefined : channel.youtubeLiveKnownOverflow,
    youtubeLiveVideoIds:result.evidence.complete ? ids : [...new Set([...(channel.youtubeLiveVideoIds ?? []),...ids])].slice(0,64)}, videos};
}

function boundedFollowResult(result: FollowResult, limit: number): FollowResult {
  const live = result.videos.filter((video) => video.remote?.live);
  const catalog = result.videos.filter((video) => !video.remote?.live).slice(0, limit);
  const videos = [...live, ...catalog];
  return { ...result, channel: { ...result.channel, lastResponseCount: videos.length }, videos };
}

/** Return only feed entries ahead of a known upload, while keeping a short
 * provider window as the recovery path if YouTube has aged that upload out. */
function routineYoutubeFeedDelta(result: FollowResult, limit: number, newestKnownVideoId?: string): FollowResult {
  const live = result.videos.filter((video) => video.remote?.live);
  const catalog = result.videos.filter((video) => !video.remote?.live);
  const entries = catalog.map((video) => ({ videoId: video.remote?.videoId, video }));
  const delta = selectYoutubeFeedDelta(entries, newestKnownVideoId, limit).map((entry) => entry.video);
  const videos = [...live, ...delta];
  return { ...result, channel: { ...result.channel, lastResponseCount: videos.length }, videos };
}

function youtubeResultForRequest(result: FollowResult, limit: number, deepCatalog: boolean, newestKnownVideoId?: string) {
  return deepCatalog ? boundedFollowResult(result, limit) : routineYoutubeFeedDelta(result, limit, newestKnownVideoId);
}

function withYoutubeCacheTelemetry(result: FollowResult, entry: YoutubeCacheEntry | null) {
  return {
    ...result,
    channel: {
      ...result.channel,
      cache: entry
        ? { at: entry.at, hits: entry.hits, misses: entry.misses, scope: entry.scope, entries: entry.result.videos.length, estimatedBytes: entry.estimatedBytes }
        : { at: Date.now(), hits: 0, misses: 1, scope: "uncached" as const },
    },
  };
}

async function youtubeFromChannelUncoalesced(query: string, limit: number = LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, deepCatalog = true, newestKnownVideoId?: string, resumeCursor?: string, manualRetry?: YoutubeManualRetry, titleHint?: string): Promise<FollowResult> {
  if (deepCatalog) assertYoutubeReady(Date.now(), 'catalog', manualRetry);
  let channelId = "";
  const trimmed = query.trim();
  if (/^UC[\w-]{20,}$/.test(trimmed)) channelId = trimmed;
  const asUrl = query.startsWith("http") ? query : "";
  if (asUrl.includes("/channel/")) {
    channelId = asUrl.split("/channel/")[1]?.split(/[/?#]/)[0] ?? "";
  }
  if (!channelId) {
    channelId = await resolveYoutubeCreator(trimmed, manualRetry);
  }
  const boundedLimit = Math.max(24, Math.min(LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, Math.floor(limit)));
  const cached = youtubeChannelCache.get(channelId);
  // Explicit archive reads must be able to grow a channel beyond a cached
  // feed-only result, including when the user refreshes moments after an
  // automatic check.
  if (!deepCatalog && cached && Date.now() - cached.at < YOUTUBE_CHANNEL_CACHE_TTL_MS) {
    cached.hits += 1;
    const requestResult = { ...cached.result, videos: [...cached.result.videos.filter((video) => video.remote?.live), ...cached.feedVideos] };
    return youtubeResultForRequest(withYoutubeCacheTelemetry(requestResult, cached), boundedLimit, deepCatalog, newestKnownVideoId);
  }
  // An older-page continuation does not need the same recent RSS window
  // again. Keep feed reads for first pages and routine upload discovery.
  const resumingArchive = deepCatalog && Boolean(resumeCursor);
  const feedRead = resumingArchive
    ? [{ status: 'fulfilled' as const, value: '' }]
    : await Promise.allSettled([fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`, manualRetry).then(xml=>{validateYoutubeFeed(xml,channelId);return xml;})]);
  // Recent checks stay RSS-only. An unavailable feed does not justify another
  // HTML/Shorts/catalog scan that can block every otherwise healthy creator.
  // The independent archive queue supplies older uploads and feed recovery.
  if (!deepCatalog) {
    const recentRead = feedRead[0];
    if (recentRead.status === 'rejected') throw recentRead.reason;
    validateYoutubeFeed(recentRead.value,channelId);
  }
  if (deepCatalog) {
    const archive: Awaited<ReturnType<typeof youtubeUploadsArchive>> = await youtubeUploadsArchive(channelId, boundedLimit, resumeCursor, manualRetry).catch(error => {
      // A healthy recent feed remains useful when the first archive request
      // fails. Accept it with the real failure, retaining the archive cursor.
      if (feedRead[0].status === 'fulfilled' && feedRead[0].value.includes('<entry>')) return { rows: [], cursor: resumeCursor ?? null, completed: false, failure: error };
      throw error;
    });
    if (archive) {
      const xml = feedRead[0].status === 'fulfilled' ? feedRead[0].value : '';
      const author = tag(xml, 'name') || archive.author || titleHint || tag(xml, 'title') || query;
      const feedEntries = [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)];
      const feedById = new Map(feedEntries.map(match => [tag(match[1], 'yt:videoId'), match[1]]));
      const seen = new Set<string>();
      const videos = archive.rows.map(row => {
        const id = row.videoId!; seen.add(id);
        const entry = feedById.get(id) ?? '';
        return ytVideo({ id, title: rendererText(row.title) || tag(entry, 'title') || id,
          published: tag(entry, 'published'), metadata: youtubeRendererMetadata(row), thumb: row.thumbnail?.thumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          desc: tag(entry, 'media:description') || rendererText(row.descriptionSnippet) || `${author} public channel catalog item.`,
          channelId, channelName: author, views: Number(entry.match(/<media:statistics[^>]*views="(\d+)"/)?.[1]) || parsePublicViewCount(rendererText(row.viewCountText)), duration: Number(entry.match(/<yt:duration[^>]*seconds="(\d+)"/)?.[1]) || undefined });
      });
      // RSS includes very new uploads that may not have reached the playlist.
      for (const [id, entry] of feedById) if (id && !seen.has(id)) videos.push(ytVideo({ id, title: tag(entry, 'title') || id, published: tag(entry, 'published'), thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, desc: tag(entry, 'media:description'), channelId, channelName: author, views: Number(entry.match(/<media:statistics[^>]*views="(\d+)"/)?.[1]) || undefined, duration: Number(entry.match(/<yt:duration[^>]*seconds="(\d+)"/)?.[1]) || undefined }));
      return { channel: { id: `yt:${channelId}`, kind: 'youtube', channelId, handle: `https://www.youtube.com/channel/${channelId}`, title: author,
        lastCheckedAt: Date.now(), catalogCheckedAt: Date.now(), lastResponseCount: videos.length,
        catalogCursor: archive.cursor ?? undefined, catalogExhaustedAt: archive.completed ? Date.now() : undefined,
        ...(!resumingArchive ? { newestVideoId: newestYoutubeFeedVideoId(feedEntries.map(match => ({ videoId: tag(match[1], 'yt:videoId') }))), newestPublishedAt: Math.max(0, ...videos.map(video => video.addedAt)) } : {}),
        ...(archive.failure ? { lastProviderFailure: classifyProviderFailure('youtube', archive.failure) } : {}),
      }, videos };
    }
  }
  // Healthy routine feeds need one request, not a Videos page plus a live
  // scan for every creator. Empty/unavailable feeds retain page recovery.
  const needPage = deepCatalog;
  const pageRead = needPage ? await Promise.allSettled([fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`, manualRetry)]) : [{ status: 'fulfilled' as const, value: '' }];
  const sourceReads = [feedRead[0], pageRead[0]];
  const xml = sourceReads[0].status === 'fulfilled' ? sourceReads[0].value : '';
  const fetchedChannelPage = sourceReads[1].status === 'fulfilled' ? sourceReads[1].value : '';
  const sourceError = sourceReads.find(row => row.status === 'rejected' && row.reason instanceof YoutubeRequestError && row.reason.retryAt)
    ?? sourceReads.find(row => row.status === 'rejected');
  if (!xml && !fetchedChannelPage && sourceError?.status === 'rejected') throw sourceError.reason;
  let channelPage = fetchedChannelPage;
  // Shorts-only creators can have an empty Videos tab and no RSS uploads.
  // Read their public Shorts grid before treating the pull as empty.
  if (deepCatalog && !resumingArchive && !youtubeRetryAt() && !xml.includes("<entry>") && !channelPageRenderers(channelPage).length) {
    const shortsPage = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/shorts`, manualRetry).catch(() => "");
    if (channelPageRenderers(shortsPage).length) channelPage = shortsPage;
  }
  if (!xml && !channelPage) throw new Error("YouTube feed and channel page are unavailable. Retry this creator later.");
  const pageTitle = channelPage.match(/<title>([^<]+)<\/title>/i)?.[1]?.replace(/\s*-\s*YouTube\s*$/, "");
  const title = tag(xml, "title") || pageTitle || query;
  const author = tag(xml, "name") || title;
  const entries = [...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/g)].slice(0, boundedLimit);

  const feedVideos = entries.map((m) => {
    const block = m[1];
    const id = tag(block, "yt:videoId");
    const thumb = block.match(/url="([^"]+)"/)?.[1] ?? `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    return ytVideo({
      id,
      title: tag(block, "title") || id,
      published: tag(block, "published"),
      thumb,
      desc: tag(block, "media:description"),
      channelId,
      channelName: author,
      duration: Number(block.match(/<yt:duration[^>]*seconds="(\d+)"/)?.[1]) || undefined,
      views: Number(block.match(/<media:statistics[^>]*views="(\d+)"/)?.[1]) || undefined,
    });
  });
  const videos = [...feedVideos];
  const feedIds = new Set(videos.map((video) => video.remote?.videoId).filter((id): id is string => Boolean(id)));
  const backfill = (deepCatalog || !feedVideos.length) && channelPage ? await (async (): Promise<YoutubeBackfillResult> => {
    const seen = new Set(feedIds);
    const rows: LibraryVideo[] = [];
    for (const renderer of resumeCursor ? [] : channelPageRenderers(channelPage)) {
      const id = renderer.videoId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      rows.push(ytVideo({ id, title: rendererText(renderer.title) || `${author} video`, published: '', metadata: youtubeRendererMetadata(renderer), thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, desc: rendererText(renderer.descriptionSnippet) || `${author} public channel catalog item.`, channelId, channelName: author, views: parsePublicViewCount(rendererText(renderer.viewCountText)) }));
      // Finish the visible provider page before persisting its next token.
    }
    // RSS can fail independently of the public page. A routine refresh can
    // still recover a shallow upload window without starting an archive walk.
    if (!deepCatalog) return { videos: rows, cursor: null, completed: false };
    const remaining = Math.max(0, boundedLimit - videos.length - rows.length);
    const older = await youtubeContinuationBackfill(channelPage, new Set([...feedIds, ...rows.map((video) => video.remote?.videoId).filter((id): id is string => Boolean(id))]), channelId, author, remaining, resumeCursor, manualRetry);
    return { ...older, videos: [...rows, ...older.videos] };
  })() : deepCatalog
    ? { videos: await youtubeChannelBackfill(channelId, author, feedIds, Math.max(0, boundedLimit - videos.length), manualRetry), cursor: resumeCursor ?? null, completed: false }
    : { videos: [], cursor: null, completed: false };
  videos.push(...backfill.videos);
  // Live discovery has its own rotating queue. Archive/feed pulls must not
  // spend two extra requests checking streams or poison that observation.
  if (!videos.length && sourceError?.status === 'rejected') throw sourceError.reason;
  if (!videos.length && deepCatalog) throw new Error("YouTube returned no readable public uploads. The source may be empty or its public page is unavailable; retry from the first page later.");
  const channel: FollowedChannel = {
    id: `yt:${channelId}`,
    kind: "youtube",
    handle: (youtubeInitialData(channelPage) as { metadata?: { channelMetadataRenderer?: { vanityChannelUrl?: string } } } | null)?.metadata?.channelMetadataRenderer?.vanityChannelUrl || `https://www.youtube.com/channel/${channelId}`,
    title: author,
    channelId,
    thumb: youtubeChannelAvatar(channelPage),
    lastCheckedAt: Date.now(),
    ...(!resumingArchive ? {
      newestPublishedAt: Math.max(0, ...videos.filter((video) => !video.remote?.live).map((video) => video.addedAt)),
      newestVideoId: newestYoutubeFeedVideoId(feedVideos.map((video) => ({ videoId: video.remote?.videoId }))),
    } : {}),
    lastResponseCount: videos.length,
    ...(youtubeRetryAt() ? { lastProviderFailure: classifyProviderFailure('youtube', new YoutubeRequestError('YouTube HTTP 429: partial catalog accepted; archive resumes after cooldown.', 429, youtubeRetryAt(), youtubeCooldownScope())) } : {}),
    ...(deepCatalog ? {
      catalogCursor: backfill.cursor ?? undefined,
      catalogCheckedAt: Date.now(),
      catalogExhaustedAt: backfill.completed ? Date.now() : undefined,
    } : {}),
  };
  const result = { channel, videos };
  // Keep routine feed windows and modest focused catalogs only. A large
  // historical pull never creates a second giant server-side graph, while a
  // small explicit creator pull can still make its next shallow refresh cheap.
  const cacheable = !resumingArchive && videos.length <= YOUTUBE_DEEP_CACHE_MAX_VIDEOS;
  const cacheScope: YoutubeCacheEntry["scope"] = videos.length > feedVideos.length ? "catalog" : "feed";
  let cacheEntry: YoutubeCacheEntry | null = cacheable
    ? { at: Date.now(), result, feedVideos, hits: 0, misses: 1, scope: cacheScope, estimatedBytes: estimateProviderPayload(videos) }
    : null;
  if (cacheEntry) {
    if (!youtubeChannelCache.set(channelId, cacheEntry, cacheEntry.estimatedBytes)) cacheEntry = null;
  }
  return youtubeResultForRequest(withYoutubeCacheTelemetry(result, cacheEntry), deepCatalog ? videos.length : boundedLimit, deepCatalog, newestKnownVideoId);
}

function twitchLogin(input: string): string {
  const raw = input.trim().replaceAll("\\_", "_").replace(/^["'([{<]+|["')\]}>.;:]+$/g, "");
  try {
    const url = new URL(raw.startsWith("http") ? raw : `https://twitch.tv/${raw}`);
    const parts = url.pathname.split("/").filter(Boolean);
    return (parts[0] ?? raw).replace(/^@/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
  } catch {
    return raw.replace(/^@/, "").replace(/^tw:/, "").replace(/[^a-z0-9_]/gi, "").toLowerCase();
  }
}

function youtubeFromChannel(query: string, limit: number = LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, focused = true, deepCatalog = focused, newestKnownVideoId?: string, resumeCursor?: string, manualRetry?: YoutubeManualRetry, titleHint?: string): Promise<FollowResult> {
  return providerRequest("youtube", `${query}:${deepCatalog ? "catalog" : "feed"}:${limit}:${resumeCursor ?? "start"}:${newestKnownVideoId ?? "none"}:${manualRetry ? `manual-${manualRetry.revision}` : 'normal'}`, focused, () => youtubeFromChannelUncoalesced(query, limit, deepCatalog, newestKnownVideoId, resumeCursor, manualRetry, titleHint));
}

async function youtubeFromPlaylist(input: string, focused = true, resumeCursor?: string, requestedLimit?: number, manualRetry?: YoutubeManualRetry, titleHint?: string): Promise<FollowResult> {
  const playlistId = youtubePlaylistId(input);
  if (!playlistId) throw new Error("Enter a public YouTube playlist URL.");
  return providerRequest("youtube", `playlist:${playlistId}:${resumeCursor ?? "start"}:${focused ? "catalog" : "feed"}:${requestedLimit ?? "default"}:${manualRetry ? `manual-${manualRetry.revision}` : 'normal'}`, focused, async () => {
    const direct = await youtubeBrowseArchive(playlistId, requestedLimit ?? (focused ? LIBRARY_LIMITS.youtubePlaylistVideosPerPull : 80), resumeCursor, manualRetry);
    if (direct) {
      const folderId = `ytpl:${playlistId}`;
      const videos = direct.rows.map(entry => {
        const video = ytVideo({ id: entry.videoId!, title: rendererText(entry.title) || entry.videoId!, published: '', metadata: youtubeRendererMetadata(entry),
          thumb: entry.thumbnail?.thumbnails?.at(-1)?.url || `https://i.ytimg.com/vi/${entry.videoId}/hqdefault.jpg`,
          desc: 'Public YouTube playlist', channelId: 'playlist', channelName: rendererText(entry.shortBylineText) || 'YouTube' });
        video.id = `${folderId}:${entry.videoId}`; video.folderId = folderId; return video;
      });
      return { channel: { id: folderId, kind: 'youtube', handle: `https://www.youtube.com/playlist?list=${playlistId}`,
        title: direct.title || titleHint || `YouTube playlist ${playlistId.slice(0, 8)}`, thumb: videos[0]?.poster, lastCheckedAt: Date.now(), lastResponseCount: videos.length,
        ...(!resumeCursor ? { newestVideoId: direct.rows[0]?.videoId } : {}),
        ...(direct.failure ? { lastProviderFailure: classifyProviderFailure('youtube', direct.failure) } : {}),
        ...(focused ? { catalogCursor: direct.cursor ?? undefined, catalogCheckedAt: Date.now(), catalogExhaustedAt: direct.completed ? Date.now() : undefined } : {}),
      }, videos };
    }
    const html = await fetchText(`https://www.youtube.com/playlist?list=${encodeURIComponent(playlistId)}`, manualRetry);
    const root = youtubeInitialData(html);
    if (!root) throw new Error("This playlist did not return public metadata.");
    const limit = requestedLimit ?? (focused ? LIBRARY_LIMITS.youtubePlaylistVideosPerPull : 80);
    const found = resumeCursor ? [] : publicPlaylistEntries(root, Math.max(limit, 100));
    const seen = new Set(found.map((entry) => entry.id));
    const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
    const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
    let browseRoot: unknown = root;
    if (!found.length && !resumeCursor && apiKey) {
      try {
        const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(apiKey)}`, {
          method: "POST", headers: { "content-type": "application/json", "x-youtube-client-name": "1", "x-youtube-client-version": clientVersion },
          body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion } }, browseId: `VL${playlistId}` }), timeoutMs: 10_000, manualRetry,
        });
        if (response.ok) {
          browseRoot = await response.json() as unknown;
          for (const entry of publicPlaylistEntries(browseRoot, Math.max(limit, 100))) if (!seen.has(entry.id)) { seen.add(entry.id); found.push(entry); }
        }
      } catch { /* A public playlist can still be unavailable to this server. */ }
    }
    let continuation = resumeCursor ?? youtubeCatalogContinuation(browseRoot) ?? youtubeContinuation(browseRoot);
    let completed = !continuation && found.length > 0;
    for (let page = 0; continuation && apiKey && page < (focused ? LIBRARY_LIMITS.youtubePlaylistPagesPerPull : 1) && found.length < limit; page++) {
      try {
        const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(apiKey)}`, {
          method: "POST", headers: { "content-type": "application/json", "x-youtube-client-name": "1", "x-youtube-client-version": clientVersion },
          body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion } }, continuation }), timeoutMs: 10_000, manualRetry,
        });
        if (!response.ok) break;
        const pageData = await response.json() as unknown;
        // Keep the whole provider page: the next continuation starts after it.
        for (const entry of publicPlaylistEntries(pageData, Math.max(100, limit - found.length))) if (!seen.has(entry.id)) { seen.add(entry.id); found.push(entry); }
        const next = youtubeCatalogContinuation(pageData) ?? youtubeContinuation(pageData);
        if (next && next !== continuation) continuation = next;
        else { continuation = null; completed = true; }
        // Actual requests are paced once by the shared YouTube transport.
      } catch { break; }
    }
    if (!found.length) throw new Error("No public videos were found in that playlist.");
    const title = publicPlaylistTitle(browseRoot) || publicPlaylistTitle(root) || html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)/i)?.[1] || `YouTube playlist ${playlistId.slice(0, 8)}`;
    const folderId = `ytpl:${playlistId}`;
    const videos = found.map((entry) => {
      const video = ytVideo({ id: entry.id, title: entry.title, published: '', metadata: entry.metadata, thumb: entry.thumb?.startsWith("//") ? `https:${entry.thumb}` : entry.thumb || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`, desc: `${title} · public playlist`, channelId: "playlist", channelName: entry.channelName });
      video.id = `${folderId}:${entry.id}`;
      video.folderId = folderId;
      return video;
    });
    return { channel: { id: folderId, kind: "youtube", handle: `https://www.youtube.com/playlist?list=${playlistId}`, title, thumb: videos[0]?.poster, lastCheckedAt: Date.now(), newestVideoId: found[0]?.id, lastResponseCount: videos.length, ...(focused ? { catalogCursor: continuation ?? undefined, catalogCheckedAt: Date.now(), catalogExhaustedAt: completed ? Date.now() : undefined } : {}) }, videos };
  });
}

// Twitch GQL `videos(first:)` / `clips(first:)` accept 1..100 only. Values
// above 100 error the field while the channel shell still returns. Deeper
// archive/clip pages work with the Android/TV Client-ID; the web Client-ID
// fails page-2+ with "failed integrity check".
const TWITCH_ARCHIVE_PAGE_SIZE = Math.min(100, LIBRARY_LIMITS.twitchArchivePageSize);
const TWITCH_ARCHIVE_MAX_PAGES = LIBRARY_LIMITS.twitchArchiveMaxPages;
const TWITCH_FOCUSED_VOD_LIMIT = LIBRARY_LIMITS.twitchFocusedVodsPerChannel;
const TWITCH_REFRESH_VOD_LIMIT = LIBRARY_LIMITS.twitchRoutineVodsPerChannel;
const TWITCH_FOCUSED_CLIP_LIMIT = LIBRARY_LIMITS.twitchFocusedClipsPerChannel;
const TWITCH_REFRESH_CLIP_LIMIT = LIBRARY_LIMITS.twitchRoutineClipsPerChannel;
const TWITCH_CLIP_MAX_PAGES = LIBRARY_LIMITS.twitchClipMaxPages;
/** Android/TV public Client-ID — multi-page archives/clips without web integrity. */
const TWITCH_CLIENT_ID = "kd1unb4b3q4t58fwlpcbzcbnm76a8fp";
const TWITCH_CHANNEL_CACHE_TTL_MS = 3 * 60_000;
const TWITCH_CHANNEL_CACHE_LIMIT = 16;
const TWITCH_PAGE_GAP_MS = 180;
const twitchChannelCache = createProviderMetadataCache<{ at: number; result: FollowResult; telemetry: ProviderCacheSample }>({ maxEntries: TWITCH_CHANNEL_CACHE_LIMIT, maxBytes: PROVIDER_BUDGETS.twitchCacheBytes, maxEntryBytes: PROVIDER_BUDGETS.warmCacheEntryBytes, ttlMs: TWITCH_CHANNEL_CACHE_TTL_MS });
function twitchCacheResult(entry: { result: FollowResult; telemetry: ProviderCacheSample }, cacheHit = false): FollowResult {
  return { ...entry.result, channel: { ...entry.result.channel, cache: { ...entry.telemetry }, ...(entry.result.channel.twitchClipDiagnostics ? {twitchClipDiagnostics:{...entry.result.channel.twitchClipDiagnostics,cacheHit,servedAt:Date.now()}} : {}) } };
}

function twitchPageGap() {
  return new Promise<void>((resolve) => setTimeout(resolve, TWITCH_PAGE_GAP_MS));
}

type TwitchVideoNode = {
  id?: string;
  title?: string;
  description?: string;
  lengthSeconds?: number;
  viewCount?: number;
  previewThumbnailURL?: string;
  publishedAt?: string;
  game?: { name?: string };
};


type GqlUser = {
  id?: string;
  displayName?: string;
  profileImageURL?: string;
  stream?: {
    title?: string;
    viewersCount?: number;
    previewImageURL?: string;
    game?: { name?: string };
  } | null;
  videos?: {
    providerError?: string | boolean;
    pageInfo?: {
      hasNextPage?: boolean;
      endCursor?: string | null;
    };
    edges?: Array<{
      cursor?: string | null;
      broadcastType?: TwitchBroadcastType; observedAt?: number;
      node?: TwitchVideoNode;
    }>;
  };
  twitchArchiveCursor?: string;
  twitchArchiveExhaustedAt?: number;
  twitchArchiveDiagnostics?: TwitchPullDiagnostics;
};

type TwitchBroadcastType = "ARCHIVE" | "HIGHLIGHT" | "UPLOAD";

function twitchClampFirst(n: number) {
  return Math.max(1, Math.min(100, Math.floor(n)));
}

async function twitchGqlJson(query: string, variables: Record<string, unknown>) {
  const res = await fetchProviderMetadata("https://gql.twitch.tv/gql", {
    signal: AbortSignal.timeout(12000),
    method: "POST",
    headers: {
      "client-id": TWITCH_CLIENT_ID,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Twitch request failed: HTTP ${res.status}`);
  return (await res.json()) as {
    data?: { user?: GqlUser | null };
    errors?: Array<{ message?: string; path?:Array<string|number> }>;
  };
}

async function twitchUser(
  login: string,
  after?: string | null,
  archivePageSize: number = TWITCH_ARCHIVE_PAGE_SIZE,
  broadcastType: TwitchBroadcastType = "ARCHIVE",
): Promise<GqlUser | null> {
  const first = twitchClampFirst(archivePageSize);
  const json = await twitchGqlJson(
    `query($login:String!,$after:Cursor,$first:Int!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}} videos(first:$first,type:${broadcastType},after:$after){pageInfo{hasNextPage endCursor} edges{cursor node{id title description lengthSeconds viewCount publishedAt previewThumbnailURL(width:640,height:360) game{name}}}}}}`,
    { login, after: after ?? null, first },
  );
  if (!json) return null;
  const user = json.data?.user ?? null;
  // Never treat a challenged field as an exhausted public shelf.
  if (user && json.errors?.length) {
    return { ...user, videos: { providerError: json.errors.map(error => error.message ?? 'Provider error').join('; ').slice(0, 240), edges: [] } };
  }
  return user;
}

/** A live check must not inherit the three-minute archive cache or walk VOD
 * and clip pages. Twitch stream state has its own short freshness window. */
async function twitchLiveForFollow(channel: FollowedChannel): Promise<FollowResult> {
  const login = twitchLogin(channel.handle);
  if (!login) throw new Error("Enter a Twitch channel.");
  const json = await twitchGqlJson(
    `query($login:String!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}}}}`,
    { login },
  );
  const user = json?.data?.user;
  const streamFailure = json?.errors?.[0];
  if (streamFailure) throw new Error(`Twitch live check failed for ${login}: ${(streamFailure.message ?? 'provider error').slice(0, 180)}`);
  if (!user?.id) throw new Error(`Twitch could not resolve ${login} for live status`);
  if (user.stream === undefined) throw new Error(`Twitch returned a malformed live status for ${login}`);
  return twitchLiveObservation(channel,login,validateTwitchLiveUser(user));
}

function twitchLiveObservation(channel:FollowedChannel,login:string,rawUser:GqlUser,warning?:string):FollowResult {
   const user=validateTwitchLiveUser(rawUser);
  if(!user?.id || user.stream===undefined)throw new Error(`Twitch could not confirm live status for ${login}`);
  const now = Date.now();
  const videos = user.stream ? twitchVideos(login, { ...user, videos: { edges: [] } }, 0) : [];
  return {
    channel: {
      ...channel,
      id: channel.id,
      kind: "twitch",
      handle: login,
      channelId: user.id,
      title: user.displayName ?? channel.title ?? login,
      thumb: user.profileImageURL ?? channel.thumb,
      live: Boolean(user.stream),
      lastCheckedAt: now,
      liveCheckedAt: now,
      lastLiveFailure: undefined,
      lastLiveWarning: warning ? {at:now,message:warning} : undefined,
    },
    videos,
  };
}

/**
 * Twitch exposes archives as a cursor connection (`first` ≤100). With the
 * Android/TV Client-ID we can walk many pages toward the focused budget;
 * empty / integrity failures stop the loop (rate-limit friendly gap between
 * pages). Focused pulls also merge HIGHLIGHT + UPLOAD shelves.
 */
async function twitchArchive(login: string, limit: number, savedCursor?: string): Promise<GqlUser | null> {
  const maxPages = Math.max(1, Math.min(TWITCH_ARCHIVE_MAX_PAGES, Math.ceil(limit / Math.max(1, TWITCH_ARCHIVE_PAGE_SIZE)) + 1));
  const result = await walkTwitchArchive({ limit, maxPages, pageSize: TWITCH_ARCHIVE_PAGE_SIZE, savedCursor, gap: twitchPageGap,
    read: async (cursor, size) => {
      let page = await twitchUser(login, cursor.after, size, cursor.stage);
      if (page?.id && !page.videos?.providerError && !page.videos?.edges?.length && size > 30 && !cursor.after && cursor.stage === 'ARCHIVE') page = await twitchUser(login, null, 30, cursor.stage);
      return page;
    },
  });
  if (!result.first) return null;
  return {
    ...result.first,
    videos: { edges: result.edges },
    twitchArchiveCursor: result.cursor,
    twitchArchiveExhaustedAt: result.exhaustedAt,
    twitchArchiveDiagnostics: result.diagnostics,
  };
}

async function twitchClips(login: string, limit: number, savedCursor?: string, variety = false, recentOnly = false) {
  return walkTwitchClips({limit, maxPages: TWITCH_CLIP_MAX_PAGES, cursor: savedCursor, variety, recentOnly, gap: twitchPageGap,
    read: async (period, first, after) => {
      const criteria = period ? ', criteria:{period:' + period + '}' : '';
      const field = 'clips(first:$first, after:$after' + criteria + '){pageInfo{hasNextPage endCursor} edges{cursor node{id slug title viewCount durationSeconds createdAt thumbnailURL game{name}}}}';
      const json = await twitchGqlJson('query($login:String!,$first:Int!,$after:Cursor){user(login:$login){' + field + '}}', {login,first,after:after ?? null});
      if(json?.errors?.length) throw Error(json.errors.map(row=>row.message??'Provider error').join('; '));
      return (json?.data?.user as {clips?: import('./twitch-clips').TwitchClipConnection}|undefined)?.clips;
    }
  });
}

function twitchVideos(
  login: string,
  user: GqlUser,
  vodLimit: number = TWITCH_ARCHIVE_PAGE_SIZE,
  clips: TwitchClipNode[] = [],
): LibraryVideo[] {
  const title = user.displayName ?? login;
  const folderId = `tw:${login}`;
  const observedAt = Date.now();
  const out: LibraryVideo[] = [];
  if (user.stream) {
    out.push({
      id: `tw:${login}:live`,
      folderId,
      name: user.stream.title || `${title} live`,
      path: `twitch/${login}/live`,
      extension: "live",
      mime: "video/twitch",
      size: 0,
      addedAt: Date.now(),
      genre: user.stream.game?.name,
      tagline: `${title} is live`,
      poster: user.stream.previewImageURL,
      remote: {
        kind: "twitch",
        channelName: title,
        live: true,
        viewers: user.stream.viewersCount,
        observedAt,
        embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(login)}&autoplay=true`,
        watchUrl: `https://www.twitch.tv/${login}`,
      },
    });
  }
  for (const edge of (user.videos?.edges ?? []).slice(0, vodLimit)) {
    const node = edge.node;
    if (!node?.id) continue;
    const rawDuration = Number(node.lengthSeconds);
    const duration = Number.isFinite(rawDuration) && rawDuration > 0 && rawDuration <= 48 * 60 * 60 ? rawDuration : undefined;
    out.push({
      id: `tw:v:${node.id}`,
      folderId,
      name: node.title || "Twitch video",
      path: `twitch/${login}/${node.id}`,
      extension: "vod",
      mime: "video/twitch",
      size: 0,
      duration,
      addedAt: Date.parse(node.publishedAt ?? "") || Date.now(),
      genre: node.game?.name,
      poster: node.previewThumbnailURL,
      tagline: node.description?.slice(0, 180),
      description: node.description?.slice(0, 800),
      remote: {
        kind: "twitch",
        ...(edge.broadcastType ? {twitchContent:twitchContentEvidence(edge.broadcastType,node.id,edge.observedAt ?? observedAt)} : {}),
        videoId: node.id,
        channelId: user.id,
        ...(Number.isFinite(node.viewCount) && node.viewCount! >= 0 ? { views: node.viewCount } : {}),
        channelName: title,
        live: false,
        observedAt,
        embedUrl: `https://player.twitch.tv/?video=${encodeURIComponent(node.id)}&autoplay=true`,
        watchUrl: `https://www.twitch.tv/videos/${node.id}`,
      },
    });
  }
  for (const clip of clips) {
    const slug = clip.slug || clip.id;
    if (!slug) continue;
    const views = Number.isFinite(clip.viewCount) && clip.viewCount! >= 0 ? clip.viewCount : undefined;
    const rawDuration = Number(clip.durationSeconds);
    const duration = Number.isFinite(rawDuration) && rawDuration > 0 && rawDuration <= 60 * 60 ? rawDuration : undefined;
    out.push({
      id: `tw:c:${slug}`,
      folderId,
      name: clip.title || "Twitch clip",
      genre: clip.game?.name,
      path: `twitch/${login}/clip/${slug}`,
      extension: "clip",
      mime: "video/twitch",
      size: 0,
      duration,
      addedAt: (() => { const at = Date.parse(clip.createdAt ?? ""); return Number.isFinite(at) && at > 0 && at <= observedAt ? at : 0; })(),
      poster: clip.thumbnailURL,
      tagline: views !== undefined ? `${views.toLocaleString()} views · clip` : "Twitch clip",
      remote: {
        kind: "twitch",
        twitchContent:twitchContentEvidence('CLIPS',slug,observedAt),
        videoId: slug,
        channelId: user.id,
        channelName: title,
        live: false,
        views,
        observedAt,
        embedUrl: `https://clips.twitch.tv/embed?clip=${encodeURIComponent(slug)}&autoplay=true`,
        watchUrl: `https://www.twitch.tv/${login}/clip/${slug}`,
      },
    });
  }
  if (!out.length) {
    out.push({
      id: `tw:${login}:channel`,
      folderId,
      name: title,
      path: `twitch/${login}`,
      extension: "live",
      mime: "video/twitch",
      size: 0,
      addedAt: Date.now(),
      tagline: "Offline — open the channel anyway",
      remote: {
        kind: "twitch",
        channelName: title,
        live: false,
        observedAt,
        embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(login)}&autoplay=true`,
        watchUrl: `https://www.twitch.tv/${login}`,
      },
    });
  }
  return out;
}

async function followTwitchUncoalesced(query: string, compact = false, clipLimit?: number, archiveCursor?: string, clipCursor?: string, focusedVodLimit?: number): Promise<FollowResult> {
  const login = twitchLogin(query);
  if (!login) throw new Error("Enter a Twitch channel.");
  const vodLimit = compact ? TWITCH_REFRESH_VOD_LIMIT : focusedVodLimit ?? TWITCH_FOCUSED_VOD_LIMIT;
  const clipsWanted = clipLimit ?? (compact ? TWITCH_REFRESH_CLIP_LIMIT : archiveCursor ? 0 : TWITCH_FOCUSED_CLIP_LIMIT);
  const cacheKey = `${login}:${compact ? "r" : "f"}:${vodLimit}:${clipsWanted}:${archiveCursor ?? "start"}:${clipCursor ?? "clip-start"}`;
  const cached = twitchChannelCache.get(cacheKey);
  if (cached && Date.now() - cached.at < TWITCH_CHANNEL_CACHE_TTL_MS) { cached.telemetry.hits++; return twitchCacheResult(cached, true); }

  const liveObservedAt=Date.now();
  const user = await twitchArchive(login, vodLimit, compact ? undefined : archiveCursor);
  if (!user?.id) throw new Error(`Twitch could not resolve ${login}`);
  const clipResult = await twitchClips(login, clipsWanted, clipCursor, compact);
  const title = user.displayName ?? login;
  const videos = twitchVideos(login, user, vodLimit, clipResult.clips);
  for(const video of videos)if(video.remote?.live)video.remote.observedAt=liveObservedAt;else if(video.extension==='clip'&&video.remote)video.remote.observedAt=clipResult.diagnostics.at;
  const channel: FollowedChannel = {
    id: `tw:${login}`,
    kind: "twitch",
    handle: login,
    title,
    channelId: user?.id,
    thumb: user?.profileImageURL,
    live: Boolean(user?.stream),
    ...(user.stream!==undefined?{liveCheckedAt:liveObservedAt}:{}),
    lastCheckedAt: Date.now(),
    twitchArchiveCheckedAt: Date.now(),
    newestPublishedAt: Math.max(0, ...videos.filter((video) => !video.remote?.live).map((video) => video.addedAt)),
    lastResponseCount: videos.length,
    ...(!compact ? { twitchArchiveCursor: user.twitchArchiveCursor, twitchArchiveExhaustedAt: user.twitchArchiveExhaustedAt,
      twitchArchiveDiagnostics: user.twitchArchiveDiagnostics, twitchArchiveLastVideoId: user.twitchArchiveDiagnostics?.lastVideoId } : {}),
    ...(!compact && clipsWanted > 0 ? { twitchClipCursor: clipResult.cursor, twitchClipExhaustedAt: clipResult.exhaustedAt } : {}),
    lastProviderFailure: user.twitchArchiveDiagnostics?.error || clipResult.error ? classifyProviderFailure('twitch', user.twitchArchiveDiagnostics?.error ?? clipResult.error) : undefined,
  };
  const result = { channel, videos };
  const entry = { at: Date.now(), result, telemetry: { at: Date.now(), hits: 0, misses: 1, scope: 'catalog' as ProviderCacheSample['scope'], entries: videos.length, estimatedBytes: estimateProviderPayload(videos) } };
  // A focused retry should reach the provider after a partial page failure.
  if (channel.lastProviderFailure || videos.length > PROVIDER_BUDGETS.warmCacheRows || !twitchChannelCache.set(cacheKey, entry, entry.telemetry.estimatedBytes)) entry.telemetry.scope = 'uncached';
  return twitchCacheResult(entry);
}

/** Explicit clip updates never walk VODs or author live-state observations. */
async function followTwitchClips(query: string, mode: 'recent'|'archive', limit: number, cursor?: string, fresh = false): Promise<FollowResult> {
  const login = twitchLogin(query); if (!login) throw new Error('Enter a Twitch channel.');
  const key = login + ':clips:' + mode + ':' + limit + ':' + (mode === 'archive' ? cursor ?? 'start' : 'recent');
  const freshKey = providerKey('twitch', key + ':fresh');
  const pendingFresh = providerInflight.get(freshKey) as Promise<FollowResult> | undefined;
  if (pendingFresh) return pendingFresh;
  const prior = fresh ? providerInflight.get(providerKey('twitch',key)) : undefined;
  return providerRequest('twitch', key + (fresh ? ':fresh' : ''), true, async () => {
    // A requested fresh read waits behind any older read of this exact key.
    // Only this clip window is invalidated; sibling creators/lanes stay warm.
    if (fresh) { if (prior) await prior.catch(()=>undefined); twitchChannelCache.delete(key); }
    const cached = twitchChannelCache.get(key);
    if (cached && Date.now()-cached.at < (mode === 'recent' ? 45_000 : TWITCH_CHANNEL_CACHE_TTL_MS)) { cached.telemetry.hits++; return twitchCacheResult(cached, true); }
    const observedAt = Date.now();
    const json = await twitchGqlJson('query($login:String!){user(login:$login){id displayName profileImageURL(width:70)}}',{login});
    if (json.errors?.length) throw new Error(json.errors.map(row=>row.message??'Provider error').join('; '));
    const user = json.data?.user; if (!user?.id) throw new Error('Twitch could not resolve ' + login);
    const result = await twitchClips(login, limit, mode === 'archive' ? cursor : undefined, mode === 'recent', mode === 'recent');
    const videos = twitchVideos(login,user,0,result.clips).filter(video=>video.extension==='clip');
    result.diagnostics.at = observedAt;
    for (const video of videos) if (video.remote) video.remote.observedAt = observedAt;
    const at = Date.now();
    const channel: FollowedChannel = { id:'tw:'+login, kind:'twitch', handle:login, title:user.displayName??login, channelId:user.id, thumb:user.profileImageURL,
      lastResponseCount:videos.length, twitchClipDiagnostics:result.diagnostics,
      ...(mode === 'archive' ? {twitchClipCursor:result.cursor,twitchClipExhaustedAt:result.exhaustedAt}:{}),
      ...(result.error ? {lastClipFailure:classifyProviderFailure('twitch',result.error)} : {lastClipFailure:undefined,...(mode==='recent'?{twitchClipRecentCheckedAt:observedAt}:{twitchClipCheckedAt:observedAt})}) };
    const entry = {at,result:{channel,videos},telemetry:{at,hits:0,misses:1,scope:'catalog' as ProviderCacheSample['scope'],entries:videos.length,estimatedBytes:estimateProviderPayload(videos)}};
    if (result.error || !twitchChannelCache.set(key,entry,entry.telemetry.estimatedBytes)) entry.telemetry.scope='uncached';
    return twitchCacheResult(entry);
  },query);
}

function followTwitch(query: string, compact = false, clipLimit?: number, archiveCursor?: string, clipCursor?: string, focusedVodLimit?: number): Promise<FollowResult> {
  return providerRequest("twitch", `${query}:${compact ? "routine" : "focused"}:${focusedVodLimit ?? 'default'}:${clipLimit ?? "default"}:${archiveCursor ?? "start"}:${clipCursor ?? "clip-start"}`, !compact, () => followTwitchUncoalesced(query, compact, clipLimit, archiveCursor, clipCursor, focusedVodLimit), query);
}

export async function runFollowRemote(dataRaw: unknown): Promise<FollowResult> {
    applyYoutubePullPacing(dataRaw);
    const data = parseFollow(dataRaw);
    const kind = data.kind === "auto" ? guessKind(data.query) : data.kind;
    if (data.freshTwitchClips && kind !== "twitch") throw new Error("Fresh clip reads are only available for Twitch clips.");
    if (kind === "twitch" && data.twitchClipMode) return followTwitchClips(data.query, data.twitchClipMode, data.clipLimit ?? 50, data.twitchClipCursor, data.freshTwitchClips);
    if (kind === "twitch") return followTwitch(data.query, false, data.clipLimit, data.twitchArchiveCursor, data.twitchClipCursor, data.twitchVodLimit);
    if (youtubePlaylistId(data.query)) return youtubeFromPlaylist(data.query, true, data.catalogCursor, LIBRARY_LIMITS.youtubeManualRefreshVideosPerChannel);
    const videoId = ytVideoId(data.query);
    if (videoId) return youtubeFromVideo(videoId, /^https?:\/\/(?:www\.|m\.)?youtube\.com\/shorts\//i.test(data.query.trim()));
    // A new follow should paint promptly; the timed cursor sweep fills its
    // older archive rather than trying to return 100k cards in one response.
    return youtubeFromChannel(data.query, LIBRARY_LIMITS.youtubeManualRefreshVideosPerChannel, true, true, undefined, data.catalogCursor);
}

export async function runRefreshRemotes(dataRaw: unknown): Promise<RefreshResult> {
    applyYoutubePullPacing(dataRaw);
    const data = parseRefresh(dataRaw);
    const manualRetry = data.forceYoutube ? createYoutubeManualRetry() : undefined;
    const videos: LibraryVideo[] = [];
    const channels: FollowedChannel[] = [];
    const refreshedIds: string[] = [];
    const liveCheckedIds: string[] = [];
    const batchLogins=data.twitchLiveOnly?data.channels.filter(channel=>channel.kind==='twitch'&&(channel.twitchLiveRetry?.retryAt??0)<=Date.now()).map(channel=>twitchLogin(channel.handle)):[];
    const batched=batchLogins.length>1?await readTwitchLiveBatch(batchLogins,twitchGqlJson):undefined;
    await mapPool(data.channels, data.youtubeCatalog ? PROVIDER_BUDGETS.archiveWorkers : data.youtubeLiveOnly ? PROVIDER_BUDGETS.youtubeLiveWorkers : data.twitchLiveOnly || data.twitchRoutine ? PROVIDER_BUDGETS.liveWorkers : PROVIDER_BUDGETS.refreshWorkers, async (ch) => {
      try {
        if (ch.kind === "twitch") {
          const scope = data.twitchLiveOnly ? 'live' : data.twitchContinueArchive ? 'archive' : 'recent';
          if ((scope === 'recent' ? ch.recentPull?.retryAt ?? 0 : ch[scope === 'live' ? 'twitchLiveRetry' : 'twitchArchiveRetry']?.retryAt ?? 0) > Date.now()) { channels.push(ch); return; }
          if (data.twitchLiveOnly) {
            const observation=batched?.get(twitchLogin(ch.handle));
            if(observation?.error)throw observation.error;
            const next = observation ? twitchLiveObservation(ch,twitchLogin(ch.handle),observation.user as GqlUser,observation.warning) : await providerRequest("twitch", `live:${ch.handle}`, true, () => twitchLiveForFollow(ch), ch.handle);
            channels.push({ ...ch, ...next.channel, id: ch.id, ...twitchRetryPatch(ch, 'live') });
            videos.push(...next.videos.map((video) => ({ ...video, folderId: ch.id })));
            refreshedIds.push(ch.id);
            liveCheckedIds.push(ch.id);
            return;
          }
          // Scheduled Twitch work collects recent VODs and a varied clip sample
          // in addition to stream state. Keep it shallow; focused archive and
          // clip pulls carry their own resumable cursors for deeper history.
          if (data.twitchContinueArchive && ch.twitchArchiveExhaustedAt) { channels.push(ch); return; }
          const next = data.twitchContinueArchive
            ? await followTwitch(ch.handle, false, 0, ch.twitchArchiveCursor, undefined, TWITCH_REFRESH_VOD_LIMIT)
            : await followTwitch(ch.handle, true);
          const freshLive=(next.channel.liveCheckedAt??0)>=Math.max(ch.liveCheckedAt??0,ch.lastLiveFailure?.at??0)&&Boolean(next.channel.liveCheckedAt);
          if(freshLive)liveCheckedIds.push(ch.id);
          channels.push({ ...ch, ...next.channel, id: ch.id, ...(data.twitchContinueArchive ? { twitchArchiveCheckedAt: Date.now(), ...twitchRetryPatch(ch, 'archive', next.channel.lastProviderFailure) } : { twitchArchiveCheckedAt: ch.twitchArchiveCheckedAt, lastProviderFailure: ch.lastProviderFailure, recentPull: next.channel.lastProviderFailure ? recentPullFailure(ch, next.channel.lastProviderFailure) : recentPullSuccess(ch, next.channel) }), ...(freshLive?twitchRetryPatch(ch, 'live'):{live:ch.live,liveCheckedAt:ch.liveCheckedAt,lastLiveFailure:ch.lastLiveFailure}) });
          videos.push(...next.videos.filter(video=>freshLive||!video.remote?.live).map((video) => ({ ...video, folderId: ch.id })));
        } else if (data.youtubeLiveOnly) {
          if ((ch.lastLiveFailure?.at === undefined || ch.lastLiveFailure.at >= (ch.liveCheckedAt ?? 0)) && (ch.lastLiveFailure?.retryAt ?? 0) > Date.now()) { channels.push(ch); return; }
          const next = await youtubeLiveForFollow(ch);
          if (next.complete) liveCheckedIds.push(ch.id);
          channels.push({ ...ch, ...next.channel, id: ch.id });
          videos.push(...next.videos.map((video) => ({ ...video, folderId: ch.id })));
        } else {
          if (!data.youtubeCatalog && !recentPullReady(ch)) { channels.push(ch); return; }
          const id = ch.channelId ?? ch.id.match(/^yt:(UC[\w-]{20,})$/)?.[1];
          const q = id ? `https://www.youtube.com/channel/${id}` : ch.handle;
          // Public RSS only exposes a short recent window. It has no `after`
          // query parameter, so routine work reads that capped window and cuts
          // it at the last durable upload identity. Explicit and scheduled
          // archive sweeps resume the separate Videos-grid continuation.
          const next = ch.id.startsWith("ytpl:")
            ? await youtubeFromPlaylist(ch.handle, data.youtubeCatalog, data.youtubeCatalog ? ch.catalogCursor : undefined, data.youtubeVideoLimit, manualRetry, ch.title)
            : data.youtubeCatalog
              ? await youtubeFromChannel(q, data.youtubeVideoLimit ?? 100, true, true, undefined, ch.catalogCursor, manualRetry, ch.title)
              : await youtubeFromChannel(q, LIBRARY_LIMITS.youtubeRoutineVideosPerChannel, false, false, ch.recentPull?.newestVideoId ?? ch.newestVideoId);
          channels.push({ ...ch, ...next.channel, id: ch.id, handle: next.channel.handle || ch.handle, thumb: next.channel.thumb || ch.thumb, newestVideoId: ch.id.startsWith("ytpl:") && data.youtubeCatalog ? ch.newestVideoId ?? next.channel.newestVideoId : next.channel.newestVideoId ?? ch.newestVideoId, importNeedsReview: undefined, ...(data.youtubeCatalog ? { lastProviderFailure: next.channel.lastProviderFailure } : { lastProviderFailure: ch.lastProviderFailure, recentPull: next.channel.lastProviderFailure ? recentPullFailure(ch, next.channel.lastProviderFailure) : recentPullSuccess(ch, next.channel), newestVideoId: recentPullSuccess(ch, next.channel).newestVideoId ?? ch.newestVideoId }) });
          videos.push(...next.videos.map((video) => ({ ...video, folderId: ch.id })));
        }
        if (data.youtubeCatalog || data.twitchContinueArchive || data.youtubeLiveOnly || data.twitchLiveOnly || !channels.at(-1)?.recentPull?.failure) refreshedIds.push(ch.id);
      } catch (error) {
        if (ch.kind === 'twitch') {
          if (!data.twitchLiveOnly && !data.twitchContinueArchive) { channels.push({ ...ch, recentPull: recentPullFailure(ch, classifyTwitchFailure(error)) }); return; }
          channels.push({ ...ch, ...(!data.twitchLiveOnly ? { lastCheckedAt: Date.now() } : {}),
            ...(!data.twitchLiveOnly ? { twitchArchiveCheckedAt: Date.now() } : {}), ...twitchRetryPatch(ch, data.twitchLiveOnly ? 'live' : 'archive', classifyTwitchFailure(error)) });
          return;
        }
        if (!data.youtubeLiveOnly && !data.youtubeCatalog) { channels.push({ ...ch, recentPull: recentPullFailure(ch, classifyProviderFailure(ch.kind, error)) }); return; }
        // A failed archive attempt still consumes this creator's turn. Moving
        // its cursor timestamp prevents one offline channel from pinning every
        // later scheduled sweep while preserving its continuation and cache.
        channels.push({
          ...ch,
          lastCheckedAt: data.youtubeLiveOnly ? ch.lastCheckedAt : Date.now(),
          ...(ch.kind === "youtube" && data.youtubeCatalog ? { catalogCheckedAt: Date.now() } : {}),
          ...(ch.kind === "youtube" && data.youtubeLiveOnly ? { lastLiveFailure: youtubeLiveFailure(ch, classifyProviderFailure(ch.kind, error)), youtubeLiveEvidence: error instanceof YoutubeLiveEvidenceError ? error.evidence : {at:Date.now(),state:'unknown' as const,source:'unreadable' as const,complete:false,reason:'unreadable' as const} } : {}),
          lastProviderFailure: data.youtubeLiveOnly ? ch.lastProviderFailure : classifyProviderFailure(ch.kind, error),
        });
      }
    });
    const retryAt = Object.fromEntries(data.channels.flatMap((channel) => {
      const retry = channel.kind === "youtube" ? youtubeRetryAt(Date.now(), data.youtubeLiveOnly ? 'live' : data.youtubeCatalog ? 'catalog' : 'feed') ?? (!data.youtubeLiveOnly && !data.youtubeCatalog ? channels.find(row => row.id === channel.id)?.recentPull?.retryAt : channels.find(row => row.id === channel.id)?.[data.youtubeLiveOnly ? 'lastLiveFailure' : 'lastProviderFailure']?.retryAt) ?? (!data.youtubeLiveOnly ? retryAtFor(channel.kind, channel.handle) : undefined) : (!data.twitchLiveOnly && !data.twitchContinueArchive ? channels.find(row => row.id === channel.id)?.recentPull?.retryAt : channels.find(row => row.id === channel.id)?.[data.twitchLiveOnly ? 'twitchLiveRetry' : 'twitchArchiveRetry']?.retryAt);
      return retry ? [[channel.id, retry]] : [];
    }));
    const scope = data.youtubeLiveOnly ? 'live' : data.youtubeCatalog ? 'catalog' : 'feed';
    const deadline = youtubeRetryAt(Date.now(), scope);
    return { videos, channels, refreshedIds, liveCheckedIds, retryAt, ...(data.channels.some(channel => channel.kind === "youtube") && deadline ? { providerRetryAt: deadline, providerCooldownScope: youtubeCooldownScope(Date.now(), scope) } : {}) };
}

type ImportItemIn = { query: string; kind: "youtube" | "twitch" };

function parseImport(data: unknown): { items: ImportItemIn[] } {
  if (typeof data !== "object" || data === null) return { items: [] };
  const rec = data as { items?: unknown };
  if (!Array.isArray(rec.items)) return { items: [] };
  const items: ImportItemIn[] = [];
  for (const raw of rec.items) {
    if (!raw || typeof raw !== "object") continue;
    const row = raw as { query?: unknown; kind?: unknown };
    const query = asString(row.query).trim();
    if (!query) continue;
    items.push({
      query,
      kind: row.kind === "twitch" ? "twitch" : "youtube",
    });
  }
  return { items: items.slice(0, 80) };
}

async function mapPool<T, R>(items: T[], size: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  const workers = Array.from({ length: Math.min(size, items.length) }, async () => {
    while (i < items.length) {
      const idx = i;
      i += 1;
      const item = items[idx];
      if (item === undefined) continue;
      out[idx] = await fn(item);
    }
  });
  await Promise.all(workers);
  return out;
}

export type ImportBatchResult = {
  ok: FollowResult[];
  failed: number;
  failedQueries: string[];
  failedReasons?: Record<string, string>;
  failedFailures?: Record<string, ProviderFailure>;
  providerRetryAt?: number;
  providerCooldownScope?: YoutubeRequestScope;
};

export async function runImportChannels(dataRaw: unknown): Promise<ImportBatchResult> {
    applyYoutubePullPacing(dataRaw);
    const data = parseImport(dataRaw);
    const compact = data.items.length > 1 || data.items.some(item => item.kind === 'youtube');
    const failureReasons = new Map<string, string>();
    const failureDetails = new Map<string, ProviderFailure>();
    const rows = await mapPool(data.items, PROVIDER_BUDGETS.importWorkers, async (item) => {
      for (let attempt = 0; attempt < PROVIDER_BUDGETS.importAttempts; attempt += 1) {
        try {
          if (item.kind === "twitch") return await followTwitch(item.query, compact);
          // Bulk imports used to request only eight entries per creator, which
          // made a healthy library look arbitrarily capped. RSS availability
          // ultimately controls the ceiling, but ask for a practical window.
          let result: FollowResult;
          if (youtubePlaylistId(item.query)) result = await youtubeFromPlaylist(item.query, !compact);
          else {
            const channelId = await resolveYoutubeCreator(item.query);
            // Identity verification survives an empty/private/unavailable
            // uploads catalog. Keep its honest failure for the archive queue.
            result = await youtubeFromChannel(channelId, 24, false, true, undefined, undefined, undefined, item.query).catch(error => ({
              channel: { id: `yt:${channelId}`, kind: 'youtube' as const, handle: `https://www.youtube.com/channel/${channelId}`, channelId, title: item.query, lastResponseCount: 0, catalogCheckedAt: Date.now(), lastProviderFailure: classifyProviderFailure('youtube', error) }, videos: [],
            }));
          }
          return { ...result, channel: { ...result.channel, importQuery: item.query } };
        } catch (error) {
          const failure = classifyProviderFailure(item.kind, error);
          failureReasons.set(item.query, failure.message);
          failureDetails.set(item.query, failure);
          // A shared provider limit cannot recover by repeating the same
          // request 350ms later, or by trying the next imported handle.
          if (item.kind === 'youtube' && youtubeRetryAt()) break;
          if (item.kind === 'youtube' && failure.message.includes('unique exact')) break;
          if (failure.kind === 'response-budget') break;
          if (!attempt) await new Promise((resolve) => setTimeout(resolve, 350));
        }
      }
      return null;
    });
    const ok: FollowResult[] = [];
    const failedQueries: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (row) ok.push(row);
      else failedQueries.push(data.items[i]?.query ?? "");
    }
    return { ok, failed: failedQueries.length, failedQueries: failedQueries.filter(Boolean), failedReasons: Object.fromEntries(failedQueries.map(query => [query, failureReasons.get(query) ?? 'Public metadata unavailable'])), failedFailures: Object.fromEntries(failureDetails), ...(data.items.some(item => item.kind === 'youtube') && youtubeRetryAt() ? { providerRetryAt: youtubeRetryAt(), providerCooldownScope: youtubeCooldownScope() } : {}) };
}

type FollowList = {
  login: string;
  title: string;
  live?: boolean;
  privateList?: boolean;
};

function parseTwitchUser(data: unknown): { login: string } {
  if (typeof data !== "object" || data === null) throw new Error("Enter your Twitch name");
  const login = twitchLogin(asString((data as { login?: unknown }).login));
  if (!login) throw new Error("Enter your Twitch name");
  return { login };
}

async function twitchGql(query: string, variables: Record<string, string>) {
  const res = await fetchProviderMetadata("https://gql.twitch.tv/gql", {
    signal: AbortSignal.timeout(12000),
    method: "POST",
    headers: {
      "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) return null;
  return (await res.json()) as Record<string, unknown>;
}

export async function runFetchTwitchFollowing(dataRaw: unknown): Promise<{ channels: FollowList[]; privateList: boolean }> {
    const data = parseTwitchUser(dataRaw);
    const login = data.login;
    const userCheck = await twitchUser(login);
    if (!userCheck) throw new Error(`No Twitch channel named ${login}`);

    const queries = [
      `query($login:String!){user(login:$login){follows(first:100){edges{node{login displayName stream{id}}}}}}`,
      `query($login:String!){user(login:$login){followConnection(first:100){edges{node{login displayName stream{id}}}}}}`,
    ];
    for (const q of queries) {
      const json = await twitchGql(q, { login });
      const user = (json?.data as { user?: Record<string, unknown> } | undefined)?.user;
      if (!user) continue;
      const conn = (user.follows ?? user.followConnection) as
        | { edges?: Array<{ node?: { login?: string; displayName?: string; stream?: unknown } }> }
        | undefined;
      const edges = conn?.edges ?? [];
      if (!edges.length) continue;
      const channels: FollowList[] = [];
      for (const edge of edges) {
        const node = edge.node;
        const handle = node?.login;
        if (!handle) continue;
        channels.push({
          login: handle,
          title: node.displayName ?? handle,
          live: Boolean(node.stream),
        });
      }
      if (channels.length) return { channels, privateList: false };
    }
    return { channels: [], privateList: true };
}

/* --- Adult discovery (Eporner + RedTube + live cam official public lists) --- */

type AdultSearchIn = {
  query?: string;
  order?: string;
  page?: number;
  maxVideos?: number;
  append?: boolean;
  providers?: AdultPullProvider[] | "all";
  /** Per-provider resume pages (archive depth). Overrides shared `page` when set. */
  providerPages?: Partial<Record<AdultPullProvider, number>>;
  providerOffsets?: Partial<Record<AdultPullProvider, number>>;
  /** Optional user-managed Reddit list. When absent, rotate the curated catalog. */
  redditSources?: Array<{ subreddit: string; priority: number }>;
};

export type AdultPullDiagnostic = {
  provider: string;
  status: "loaded" | "empty" | "failed";
  titles: number;
  detail: string;
};

const EPORNER_ORDERS = new Set([
  "latest",
  "longest",
  "shortest",
  "top-rated",
  "most-popular",
  "top-weekly",
  "top-monthly",
]);

function parseAdultProviders(raw: unknown): AdultPullProvider[] {
  const known = new Set<AdultPullProvider>(ADULT_PULL_PROVIDERS);
  if (raw === "all" || raw == null) return [...ADULT_PULL_PROVIDERS];
  if (Array.isArray(raw)) {
    const out = raw.filter((p): p is AdultPullProvider => typeof p === "string" && known.has(p as AdultPullProvider));
    return out.length ? [...new Set(out)] : [...ADULT_PULL_PROVIDERS];
  }
  if (typeof raw === "string" && known.has(raw as AdultPullProvider)) return [raw as AdultPullProvider];
  return [...ADULT_PULL_PROVIDERS];
}

function parseProviderPages(raw: unknown): Partial<Record<AdultPullProvider, number>> {
  if (!raw || typeof raw !== "object") return {};
  const known = new Set<AdultPullProvider>(ADULT_PULL_PROVIDERS);
  const out: Partial<Record<AdultPullProvider, number>> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!known.has(key as AdultPullProvider)) continue;
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n) || n < 1) continue;
    out[key as AdultPullProvider] = Math.min(Math.floor(n), 100000);
  }
  return out;
}

type RedditSourcePreference = { subreddit: string; priority: 1 | 2 | 3 };
/** Allows the complete saved library collection while keeping request size bounded. */
const MAX_REDDIT_SOURCE_PREFERENCES = 720;

function parseRedditSources(raw: unknown): RedditSourcePreference[] {
  if (!Array.isArray(raw)) return [];
  const unique = new Map<string, RedditSourcePreference>();
  for (const value of raw.slice(0, MAX_REDDIT_SOURCE_PREFERENCES)) {
    const row = asRecord(value);
    const subreddit = asString(row?.subreddit).trim().replace(/^r\//i, "");
    // Reddit community names only use letters, numbers, and underscores.
    if (!/^[a-z0-9_]{3,48}$/i.test(subreddit)) continue;
    const rawPriority = Number(row?.priority);
    const priority: 1 | 2 | 3 = rawPriority >= 3 ? 3 : rawPriority <= 1 ? 1 : 2;
    unique.set(subreddit.toLowerCase(), { subreddit, priority });
  }
  return [...unique.values()];
}

type ParsedAdultSearch = Omit<Required<AdultSearchIn>, "providers" | "redditSources"> & {
  providers: AdultPullProvider[];
  redditSources: RedditSourcePreference[];
};

function parseAdultSearch(data: unknown): ParsedAdultSearch {
  const rec = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  const query = asString(rec.query).trim() || "all";
  const orderRaw = asString(rec.order).trim() || "top-weekly";
  const order = EPORNER_ORDERS.has(orderRaw) ? orderRaw : "top-weekly";
  const pageNum = typeof rec.page === "number" ? rec.page : Number(rec.page);
  const page = Number.isFinite(pageNum) && pageNum >= 1 ? Math.min(Math.floor(pageNum), 100000) : 1;
  const maxRaw = typeof rec.maxVideos === "number" ? rec.maxVideos : Number(rec.maxVideos);
  const maxVideos = Number.isFinite(maxRaw) && maxRaw > 0
    ? Math.max(1, Math.min(Math.floor(maxRaw), 1000))
    : 160;
  const append = Boolean(rec.append);
  return {
    query: query.slice(0, 80),
    order,
    page,
    maxVideos,
    append,
    providers: parseAdultProviders(rec.providers),
    providerPages: parseProviderPages(rec.providerPages),
    providerOffsets: Object.fromEntries(Object.entries(parseProviderPages(rec.providerOffsets)).map(([key, value]) => [key, Math.min(value!, 10_000)])),
    redditSources: parseRedditSources(rec.redditSources),
  };
}

type EpornerVideo = {
  id?: string;
  title?: string;
  keywords?: string;
  views?: number;
  url?: string;
  embed?: string;
  length_sec?: number;
  added?: string;
  default_thumb?: { src?: string };
};

function epornerVideo(row: EpornerVideo): LibraryVideo | null {
  const id = asString(row.id).trim();
  const title = asString(row.title).trim();
  const embed = asString(row.embed).trim();
  const watch = asString(row.url).trim();
  if (!id || !title || !embed) return null;
  if (!embed.startsWith("https://www.eporner.com/embed/")) return null;
  const added = Date.parse(asString(row.added)) || Date.now();
  const rawThumb = asString(row.default_thumb?.src);
  const thumbFallbacks = expandAdultThumbFallbacks(rawThumb);
  const thumb = thumbFallbacks[0] ?? (isUsableAdultThumb(rawThumb) ? rawThumb : "");
  const keywords = asString(row.keywords).trim();
  const views = typeof row.views === "number" && Number.isFinite(row.views) ? row.views : undefined;
  return {
    id: `eporner:${id}`,
    folderId: EPORNER_FOLDER_ID,
    name: title,
    path: `eporner/${title}`,
    extension: "eporner",
    mime: "video/eporner",
    size: 0,
    duration: typeof row.length_sec === "number" ? row.length_sec : undefined,
    addedAt: added,
    tagline: keywords.slice(0, 160) || undefined,
    description: keywords || undefined,
    poster: thumb || undefined,
    src: embed,
    remote: {
      kind: "eporner",
      videoId: id,
      channelName: "Eporner",
      views,
      observedAt: Date.now(),
      embedUrl: embed.endsWith("/") ? embed : `${embed}/`,
      watchUrl: watch || `https://www.eporner.com/video-${id}/`,
      previewUrl: (thumbFallbacks[1] ?? thumb) || undefined,
      thumbFallbacks: thumbFallbacks.length ? thumbFallbacks.slice(0, 6) : undefined,
    },
  };
}

async function fetchEpornerPageOnce(query: string, order: string, page: number, perPage: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  const params = new URLSearchParams({
    query,
    per_page: String(perPage),
    page: String(page),
    thumbsize: "medium",
    order,
    gay: "0",
    lq: "0",
    format: "json",
  });
  const url = `https://www.eporner.com/api/v2/video/search/?${params.toString()}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(8_000),
    cacheTtlMs: 12 * 60_000,
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai)",
    },
  });
  if (!res.ok) throw new Error(`Eporner API HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
  const json = (await res.json()) as {
    videos?: EpornerVideo[];
    total_pages?: number;
    total_count?: number;
  };
  const videos = (json.videos ?? [])
    .map(epornerVideo)
    .filter((v): v is LibraryVideo => v != null);
  return {
    videos,
    totalPages: typeof json.total_pages === "number" ? json.total_pages : page,
    totalCount: typeof json.total_count === "number" ? json.total_count : videos.length,
  };
}

async function fetchEpornerPage(query: string, order: string, page: number, perPage: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  try {
    const primary = await fetchEpornerPageOnce(query, order, page, perPage);
    if (primary.videos.length) return primary;
  } catch {
    // Fall through to alternate order / smaller page backup.
  }
  // Secondary path: different sort + smaller page keeps shelves filled when the
  // primary ranking edge is empty or rate-limited, without scraping HTML.
  const backupOrder = order === "latest" ? "top-weekly" : "latest";
  const backupPerPage = Math.min(perPage, 120);
  return fetchEpornerPageOnce(query, backupOrder, page, backupPerPage);
}

type RedtubeTag = { tag_name?: string } | { tag?: { tag_name?: string } };

type RedtubeVideo = {
  duration?: string;
  views?: number;
  video_id?: string | number;
  rating?: string | number;
  title?: string;
  url?: string;
  embed_url?: string;
  default_thumb?: unknown;
  thumb?: unknown;
  thumbs?: unknown;
  stars?: unknown;
  publish_date?: string;
  tags?: RedtubeTag[];
};

function parseClockDuration(raw: string): number | undefined {
  const parts = raw.trim().split(":").map((p) => Number(p));
  if (!parts.length || parts.some((n) => !Number.isFinite(n))) return undefined;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 1) return parts[0];
  return undefined;
}

function redtubeTagNames(tags: RedtubeTag[] | undefined): string[] {
  if (!Array.isArray(tags)) return [];
  const out: string[] = [];
  for (const row of tags) {
    const name =
      typeof row === "object" && row !== null
        ? "tag_name" in row
          ? asString((row as { tag_name?: string }).tag_name)
          : asString((row as { tag?: { tag_name?: string } }).tag?.tag_name)
        : "";
    const clean = name.trim();
    if (clean) out.push(clean);
  }
  return out;
}

function redtubeVideo(row: RedtubeVideo): LibraryVideo | null {
  const id = String(row.video_id ?? "").trim();
  const title = asString(row.title).trim();
  const embed = asString(row.embed_url).trim();
  const watch = asString(row.url).trim();
  if (!id || !title || !embed) return null;
  if (!embed.startsWith("https://embed.redtube.com/")) return null;
  const tags = redtubeTagNames(row.tags);
  const stars = redtubeStarNames(row.stars);
  const keywords = [...stars, ...tags].join(", ");
  const picked = pickRedtubeThumb(row);
  const thumb = picked.poster ?? "";
  const added = Date.parse(asString(row.publish_date)) || Date.now();
  const views = typeof row.views === "number" && Number.isFinite(row.views) ? row.views : undefined;
  const creator = stars[0] || "RedTube";
  return {
    id: `redtube:${id}`,
    folderId: REDTUBE_FOLDER_ID,
    name: title,
    path: `redtube/${title}`,
    extension: "redtube",
    mime: "video/redtube",
    size: 0,
    duration: parseClockDuration(asString(row.duration)),
    addedAt: added,
    tagline: keywords.slice(0, 160) || undefined,
    description: keywords || undefined,
    poster: thumb || undefined,
    src: embed,
    remote: {
      kind: "redtube",
      videoId: id,
      channelName: creator,
      views,
      observedAt: Date.now(),
      embedUrl: embed,
      watchUrl: watch || `https://www.redtube.com/${id}`,
      previewUrl: picked.previewUrl || thumb || undefined,
      thumbFallbacks: picked.thumbFallbacks,
    },
  };
}

function redtubeOrdering(order: string): { ordering: string; period?: string } {
  switch (order) {
    case "latest":
      return { ordering: "newest" };
    case "top-rated":
      return { ordering: "rating", period: "alltime" };
    case "most-popular":
      return { ordering: "mostviewed", period: "alltime" };
    case "top-monthly":
      return { ordering: "mostviewed", period: "monthly" };
    case "top-weekly":
    default:
      return { ordering: "mostviewed", period: "weekly" };
  }
}

async function fetchRedtubePage(query: string, order: string, page: number): Promise<{
  videos: LibraryVideo[];
  totalCount: number;
  totalPages: number;
}> {
  const { ordering, period } = redtubeOrdering(order);
  const params = new URLSearchParams({
    data: "redtube.Videos.searchVideos",
    output: "json",
    thumbsize: "big",
    page: String(page),
    ordering,
  });
  if (period) params.set("period", period);
  const q = query.trim();
  if (q && q.toLowerCase() !== "all") {
    params.set("search", q);
    params.append("stars[]", q);
  }
  const url = `https://api.redtube.com/?${params.toString()}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(20000),
    cacheTtlMs: 12 * 60_000,
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai)",
    },
  });
  if (!res.ok) throw new Error(`RedTube API HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
  const json = (await res.json()) as {
    videos?: Array<{ video?: RedtubeVideo } | RedtubeVideo>;
    count?: number;
    message?: string;
    code?: number;
  };
  if (json.message && json.code) throw new Error(json.message);
  const rows = json.videos ?? [];
  const videos = rows
    .map((row) => {
      const video = row && typeof row === "object" && "video" in row ? row.video : (row as RedtubeVideo);
      return video ? redtubeVideo(video) : null;
    })
    .filter((v): v is LibraryVideo => v != null);
  const totalCount = typeof json.count === "number" ? json.count : videos.length;
  const perPage = LIBRARY_LIMITS.redtubePageSize;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  return { videos, totalCount, totalPages };
}

const ADULT_CSAM = /loli|shota|lolicon|shotacon|\bchild\b|underage|\bcub\b|toddler|infant|\bbaby\b|pedo|preteen|young.?girl|young.?boy|jailbait/i;

function adultBlockedText(...parts: Array<string | undefined>) {
  return ADULT_CSAM.test(parts.filter(Boolean).join(" "));
}

type ChaturbateRoom = {
  username?: string;
  display_name?: string;
  room_subject?: string;
  tags?: string[];
  current_show?: string;
  num_users?: number;
  image_url?: string;
  image_url_360x270?: string;
  age?: number;
  chat_room_url?: string;
};

function chaturbateVideo(row: ChaturbateRoom): LibraryVideo | null {
  const username = asString(row.username).trim().toLowerCase();
  if (!username || !/^[a-z0-9_]+$/.test(username)) return null;
  const show = asString(row.current_show).trim().toLowerCase() || "public";
  if (show !== "public" && show !== "group") return null;
  if (typeof row.age === "number" && Number.isFinite(row.age) && row.age < 18) return null;
  const tags = Array.isArray(row.tags) ? row.tags.map((tag) => asString(tag).trim()).filter(Boolean) : [];
  const subject = asString(row.room_subject).trim();
  const display = asString(row.display_name).trim() || username;
  if (adultBlockedText(username, display, subject, tags.join(" "))) return null;
  const embed = `https://chaturbate.com/embed/${encodeURIComponent(username)}/`;
  const watch = asString(row.chat_room_url).trim() || `https://chaturbate.com/${encodeURIComponent(username)}/`;
  const thumb360 = asString(row.image_url_360x270).trim();
  const thumbOriginal = asString(row.image_url).trim();
  const thumb = thumb360 || thumbOriginal;
  const viewers = typeof row.num_users === "number" && Number.isFinite(row.num_users) ? row.num_users : undefined;
  return {
    id: `chaturbate:${username}`,
    folderId: CHATURBATE_FOLDER_ID,
    name: display,
    path: `chaturbate/${username}`,
    extension: "chaturbate",
    mime: "video/chaturbate",
    size: 0,
    addedAt: Date.now(),
    tagline: subject.slice(0, 160) || undefined,
    description: [subject, ...tags].filter(Boolean).join(", ") || undefined,
    poster: thumb || undefined,
    src: embed,
    remote: {
      kind: "chaturbate",
      videoId: username,
      channelName: username,
      live: true,
      viewers,
      observedAt: Date.now(),
      embedUrl: embed,
      watchUrl: watch,
      previewUrl: thumb || undefined,
      thumbFallbacks: [thumb360, thumbOriginal].filter(isUsableAdultThumb),
    },
  };
}

async function fetchChaturbateRooms(query: string, maxVideos: number, offset = 0) {
  // The legacy full roster now exceeds the metadata response budget. The v2
  // public directory provides bounded pages and the real continuation count.
  const limit = Math.max(1, Math.min(500, Math.floor(maxVideos)));
  const url = new URL('https://chaturbate.com/api/public/affiliates/onlinerooms/');
  url.search = new URLSearchParams({ wm: 'DkfRj', client_ip: 'request_ip', limit: String(limit), offset: String(offset) }).toString();
  const res = await cachedAdultFetch(url.href, { signal: AbortSignal.timeout(12_000), cacheTtlMs: 60_000, headers: { accept: 'application/json' } });
  if (!res.ok) throw new Error('Chaturbate rooms HTTP ' + res.status + (res.status === 429 ? ' (rate limited)' : ''));
  const data = await res.json() as { results?: ChaturbateRoom[]; count?: number };
  if (!Array.isArray(data.results) || !Number.isFinite(data.count)) throw new Error('Chaturbate returned an unreadable directory. Previous rooms were kept.');
  const checkedAt = Number(res.headers.get('x-reelcase-observed-at')) || Date.now();
  const needle = query.trim().toLowerCase();
  const videos = data.results.map(chaturbateVideo).filter((video): video is LibraryVideo => Boolean(video))
    .filter(video => !needle || needle === 'all' || (video.name + ' ' + (video.description ?? '') + ' ' + video.remote?.videoId).toLowerCase().includes(needle))
    .map(video => ({ ...video, remote: { ...video.remote!, observedAt: checkedAt } }));
  const totalCount = Math.max(0, Math.floor(data.count!));
  return { videos, totalPages: Math.ceil(totalCount / limit), totalCount, checkedAt,
    nextOffset: data.results.length && offset + data.results.length < totalCount ? offset + data.results.length : null };
}

let myfreecamsCache: { at: number; rooms: LibraryVideo[]; failedAt?: number; error?: string } | null = null;
const MYFREECAMS_CACHE_MS = 3 * 60_000;
const MYFREECAMS_PUBLIC_STATE = 0;
const MYFREECAMS_PROFILE_PREVIEWS_PER_REFRESH = 12;
const MYFREECAMS_PROFILE_PREVIEW_CONCURRENCY = 4;
const MYFREECAMS_PROFILE_SUCCESS_CACHE_MS = 20 * 60_000;
const MYFREECAMS_PROFILE_MISS_CACHE_MS = 4 * 60_000;

type MyFreeCamsPreview = { at: number; poster?: string; modelId?: string };
type MyFreeCamsListing = {
  rooms: LibraryVideo[];
  rows: number;
  publicRows: number;
  states: Map<number, number>;
};

const myfreecamsPreviewCache = new Map<string, MyFreeCamsPreview>();
let myfreecamsPreviewCursor = 0;

function myfreecamsWatchUrl(username: string) {
  // MFC's documented room route is hash-based. Keep the model's casing so a
  // copied destination exactly matches links such as #Leya4u.
  return `https://www.myfreecams.com/#${encodeURIComponent(username)}`;
}

function myfreecamsAppUrl(username: string) {
  return `https://app.myfreecams.com/${encodeURIComponent(username.toLowerCase())}`;
}

function myfreecamsVideo(username: string, status: number): LibraryVideo | null {
  // The public list uses MFC's video-state values: 0 is TX_IDLE, a free/public
  // broadcast. 2 is Away, 12–14 are private/group/club, and 90 is a viewer
  // state. Showing any of those as live creates dead room links.
  if (status !== MYFREECAMS_PUBLIC_STATE) return null;
  const name = username.trim();
  if (!/^[A-Za-z0-9_]{2,32}$/.test(name)) return null;
  if (adultBlockedText(name)) return null;
  const watch = myfreecamsWatchUrl(name);
  return {
    id: `myfreecams:${name.toLowerCase()}`,
    folderId: MYFREECAMS_FOLDER_ID,
    name,
    path: `myfreecams/${name}`,
    extension: "myfreecams",
    mime: "video/myfreecams",
    size: 0,
    addedAt: Date.now(),
    tagline: "Live on MyFreeCams",
    description: "live, cam, public room",
    src: watch,
    remote: {
      kind: "myfreecams",
      videoId: name,
      channelName: name,
      live: true,
      observedAt: Date.now(),
      watchUrl: watch,
    },
  };
}

function myfreecamsStateNumber(value: unknown) {
  if (typeof value !== "number" && typeof value !== "string") return null;
  const state = Number(value);
  return Number.isInteger(state) && state >= 0 && state <= 127 ? state : null;
}

function myfreecamsListing(payload: string): MyFreeCamsListing {
  // MFC currently responds with `Updated: …<br>username,0<br>…`. It has also
  // shipped object and tuple payloads, so retain tolerant parsing for a future
  // listing rollout instead of treating a healthy source as empty.
  const text = payload.replace(/\\u0022/gi, '"').replace(/\\"/g, '"');
  const pairs = new Map<string, { name: string; state: number }>();
  const add = (name: unknown, status: unknown) => {
    if (typeof name !== "string") return;
    const display = name.trim();
    const state = myfreecamsStateNumber(status);
    if (!/^[A-Za-z0-9_]{2,32}$/.test(display) || state == null) return;
    pairs.set(display.toLowerCase(), { name: display, state });
  };

  const walkJson = (value: unknown): void => {
    if (Array.isArray(value)) {
      if (typeof value[0] === "string" && myfreecamsStateNumber(value[1]) != null) add(value[0], value[1]);
      for (const item of value) walkJson(item);
      return;
    }
    if (!value || typeof value !== "object") return;
    const row = value as Record<string, unknown>;
    const name = row.username ?? row.user_name ?? row.model ?? row.model_name ?? row.name;
    const state = row.vs ?? row.video_state ?? row.videoState ?? row.status ?? row.state;
    if (typeof name === "string" && myfreecamsStateNumber(state) != null) add(name, state);
    for (const [key, nested] of Object.entries(row)) {
      if (myfreecamsStateNumber(nested) != null) add(key, nested);
      if (nested && typeof nested === "object") walkJson(nested);
    }
  };

  try {
    const trimmed = text.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) walkJson(JSON.parse(trimmed));
  } catch {
    // The line-oriented listing is still valid even when a response begins
    // with a non-JSON update marker.
  }

  for (const line of text.split(/<br\s*\/?>|\r?\n/gi)) {
    const match = line.replace(/<[^>]+>/g, " ").trim().match(/^([A-Za-z0-9_]{2,32})\s*[,|:]\s*(\d{1,3})\b/);
    if (match) add(match[1], match[2]);
  }
  for (const match of text.matchAll(/["']([A-Za-z0-9_]{2,32})["']\s*:\s*["']?(\d{1,3})\b/g)) add(match[1], match[2]);
  for (const match of text.matchAll(/(?:^|[\x5B,{;\s>])([A-Za-z0-9_]{2,32})\s*[,|\s:]\s*(\d{1,3})\b/gm)) add(match[1], match[2]);
  for (const match of text.matchAll(/["']([A-Za-z0-9_]{2,32})["']\s*,\s*["']?(\d{1,3})\b/g)) add(match[1], match[2]);

  const states = new Map<number, number>();
  for (const { state } of pairs.values()) states.set(state, (states.get(state) ?? 0) + 1);
  const rooms = [...pairs.values()]
    .map(({ name, state }) => myfreecamsVideo(name, state))
    .filter((video): video is LibraryVideo => video != null);
  return { rooms, rows: pairs.size, publicRows: states.get(MYFREECAMS_PUBLIC_STATE) ?? 0, states };
}

function myfreecamsImageFromAppPage(payload: string): Pick<MyFreeCamsPreview, "poster" | "modelId"> {
  const candidates: string[] = [];
  const attr = (tag: string, name: string) => {
    const match = new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i").exec(tag);
    return htmlDecode(match?.[1] ?? match?.[2] ?? match?.[3] ?? "").trim();
  };
  for (const tag of payload.match(/<meta\b[^>]*>/gi) ?? []) {
    const key = (attr(tag, "property") || attr(tag, "name")).toLowerCase();
    if (key === "og:image" || key === "twitter:image") candidates.push(attr(tag, "content"));
  }
  for (const match of payload.matchAll(/\b(?:src|data-src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
    candidates.push(htmlDecode(match[1] ?? match[2] ?? match[3] ?? "").trim());
  }
  const usable = [...new Set(candidates)].filter((url) => {
    try {
      const parsed = new URL(url);
      return parsed.protocol === "https:" && /^(?:img|snap)\.mfcimg\.com$/i.test(parsed.hostname);
    } catch {
      return false;
    }
  });
  const poster = usable.find((url) => /^https:\/\/snap\.mfcimg\.com\//i.test(url)) ?? usable[0];
  const modelId = poster?.match(/\/photos2\/\d+\/(\d+)\/|\/mfc_(\d+)/i)?.[1] ?? poster?.match(/\/mfc_(\d+)/i)?.[1];
  return { poster, modelId };
}

function myfreecamsPreviewFresh(preview: MyFreeCamsPreview, now: number) {
  return now - preview.at <= (preview.poster ? MYFREECAMS_PROFILE_SUCCESS_CACHE_MS : MYFREECAMS_PROFILE_MISS_CACHE_MS);
}

async function fetchMyFreeCamsPreview(username: string): Promise<MyFreeCamsPreview> {
  const key = username.toLowerCase();
  const now = Date.now();
  const cached = myfreecamsPreviewCache.get(key);
  if (cached && myfreecamsPreviewFresh(cached, now)) return cached;
  let next: MyFreeCamsPreview = { at: now };
  try {
    // The App route is publicly server-rendered with og:image metadata. It is
    // used only for a small rotating preview budget; the official online list
    // remains the source of truth for live status.
    const res = await cachedAdultFetch(myfreecamsAppUrl(username), {
      cacheTtlMs: MYFREECAMS_PROFILE_SUCCESS_CACHE_MS,
      cacheKey: `GET:mfc-profile:${key}`,
      signal: AbortSignal.timeout(3_500),
      headers: {
        accept: "text/html,application/xhtml+xml;q=0.9",
        "accept-language": "en-US,en;q=0.8",
        "user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai)",
      },
    });
    if (res.ok) next = { at: now, ...myfreecamsImageFromAppPage(await res.text()) };
  } catch {
    // A missing profile poster must never make the public live listing fail.
  }
  myfreecamsPreviewCache.set(key, next);
  return next;
}

function withMyFreeCamsPreview(video: LibraryVideo, preview?: MyFreeCamsPreview): LibraryVideo {
  if (!preview?.poster || !video.remote) return video;
  const thumbs = [...new Set([preview.poster, ...(video.remote.thumbFallbacks ?? [])])].filter(isUsableAdultThumb).slice(0, 4);
  return {
    ...video,
    poster: preview.poster,
    remote: {
      ...video.remote,
      channelId: preview.modelId ?? video.remote.channelId,
      previewUrl: preview.poster,
      thumbFallbacks: thumbs,
    },
  };
}

async function myfreecamsRoomsWithPreviews(rooms: LibraryVideo[]) {
  const now = Date.now();
  const previews = new Map<string, MyFreeCamsPreview>();
  for (const room of rooms) {
    const username = room.remote?.videoId ?? room.name;
    const cached = myfreecamsPreviewCache.get(username.toLowerCase());
    if (cached && myfreecamsPreviewFresh(cached, now)) previews.set(username.toLowerCase(), cached);
  }
  // The online roster is the live-source contract. Profile pages are much
  // slower and occasionally challenged, so never make hundreds of usable live
  // rooms wait for a handful of optional thumbnails. Cached artwork is applied
  // immediately; a later refresh can enrich newly cached profile art.
  return rooms.map((room) => withMyFreeCamsPreview(room, previews.get((room.remote?.videoId ?? room.name).toLowerCase())));
}

function myfreecamsStateSummary(states: Map<number, number>) {
  return [...states.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([state, count]) => `${state}: ${count}`)
    .join(", ");
}

async function fetchMyFreeCamsRooms(query: string, maxVideos: number, offset = 0) {
  if ((!myfreecamsCache || Date.now() - myfreecamsCache.at > MYFREECAMS_CACHE_MS) && (!myfreecamsCache?.failedAt || Date.now() - myfreecamsCache.failedAt > 60_000)) {
    const priorRooms = myfreecamsCache?.rooms ?? [];
    try {
      const res = await cachedAdultFetch("https://www.myfreecams.com/php/online_models.php", {
        cacheTtlMs: 3 * 60_000,
        signal: AbortSignal.timeout(12_000),
        headers: {
          accept: "text/plain, text/html;q=0.8",
          referer: "https://www.myfreecams.com/#Homepage",
          "accept-language": "en-US,en;q=0.8",
          "user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai)",
        },
      });
      if (!res.ok) throw new Error(`MyFreeCams public list HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
      const payload = await res.text();
      const listing = myfreecamsListing(payload);
      if (!listing.rows && !/^\s*(?:Updated:|\[)/i.test(payload)) throw new Error('MyFreeCams returned an unreadable public list. Previous rooms were kept.');
      if (!listing.rooms.length && listing.publicRows) {
        const states = myfreecamsStateSummary(listing.states);
        throw new Error(
          listing.publicRows
            ? `MyFreeCams listed ${listing.publicRows} public broadcast rows, but none had a usable safe room name.`
            : `MyFreeCams listed ${listing.rows} online rows but no public broadcasts (states: ${states || "unknown"}).`,
        );
      }
      const rooms = listing.rooms.length ? await myfreecamsRoomsWithPreviews(listing.rooms) : [];
      myfreecamsCache = { at: Number(res.headers.get('x-reelcase-observed-at')) || Date.now(), rooms };
      for (const room of rooms) if (room.remote) room.remote.observedAt = myfreecamsCache.at;
    } catch (error) {
      // Keep a short-lived last known public roster if MFC blocks, rate limits,
      // or changes a listing response. A cold start still returns the exact
      // reason so Pull sources can explain what happened.
      if (priorRooms.length) {
        myfreecamsCache = { ...myfreecamsCache!, rooms: priorRooms, failedAt: Date.now(), error: adultPullFailureDetail(error) };
      } else {
        throw error;
      }
    }
  }
  const needle = query.trim().toLowerCase();
  const filtered =
    !needle || needle === "all"
      ? myfreecamsCache.rooms
      : myfreecamsCache.rooms.filter((video) => video.name.toLowerCase().includes(needle));
  return { videos: filtered.slice(offset, offset + maxVideos), totalPages: Math.ceil(filtered.length / maxVideos), totalCount: filtered.length, checkedAt: myfreecamsCache!.at, stale: Boolean(myfreecamsCache!.error), error: myfreecamsCache!.error, retryAt: myfreecamsCache!.failedAt ? myfreecamsCache!.failedAt + 60_000 : undefined, nextOffset: offset + maxVideos < filtered.length ? offset + maxVideos : null };
}


const liveRoomInflight = new Map<string, Promise<LiveRoomPage>>();
export function runFetchLiveRooms(raw: unknown): Promise<LiveRoomPage> {
  const request = liveRoomRequest(raw), key = request.provider + ':' + request.offset + ':' + request.limit;
  const prior = liveRoomInflight.get(key); if (prior) return prior;
  const work = (async (): Promise<LiveRoomPage> => {
    const result = request.provider === 'chaturbate' ? await fetchChaturbateRooms('all', request.limit, request.offset) : await fetchMyFreeCamsRooms('all', request.limit, request.offset);
    return { provider: request.provider, videos: result.videos, offset: request.offset, nextOffset: result.nextOffset, total: result.totalCount, checkedAt: result.checkedAt,
      stale: 'stale' in result ? result.stale : false, ...('error' in result ? { error: result.error, retryAt: result.retryAt } : {}) };
  })().finally(() => liveRoomInflight.delete(key));
  liveRoomInflight.set(key, work); return work;
}

function htmlDecode(value: string) {
  const decoded = value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#32;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
  return decoded.replace(/&#(?:x([\da-f]+)|(\d+));/gi, (_all, hex: string | undefined, decimal: string | undefined) => {
    const codePoint = Number.parseInt(hex ?? decimal ?? "", hex ? 16 : 10);
    return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : _all;
  });
}

function xmlField(xml: string, pattern: RegExp) {
  return htmlDecode(pattern.exec(xml)?.[1] ?? "").trim();
}

/** Atom does not prescribe an attribute order. Reddit currently places `rel`
 * before `href`, so never assume the first attribute is the target URL. */
function redditPermalink(entry: string): string {
  const links = [...entry.matchAll(/<link\b[^>]*>/gi)];
  let first = "";
  for (const [tag] of links) {
    const href = xmlField(tag, /\bhref\s*=\s*["']([^"']+)["']/i);
    if (!href) continue;
    if (!first) first = href;
    const rel = xmlField(tag, /\brel\s*=\s*["']([^"']+)["']/i);
    if (/\balternate\b/i.test(rel)) return href;
  }
  return first;
}

function redgifsEmbedUrl(url: string | undefined): string | undefined {
  const slug = url?.match(/https?:\/\/(?:www\.)?redgifs\.com\/(?:watch|ifr)\/([a-z0-9_-]+)/i)?.[1]
    ?? url?.match(/https?:\/\/thumbs\d*\.redgifs\.com\/([a-z0-9_-]+)-(?:mobile|poster|thumb)\.(?:jpe?g|webp)/i)?.[1]
    ?? url?.match(/https?:\/\/(?:i|media)\.redgifs\.com\/([a-z0-9_-]+)(?:[._-]|$)/i)?.[1];
  return slug ? `https://www.redgifs.com/ifr/${encodeURIComponent(slug)}` : undefined;
}

function redditVideo(entry: string, subreddit: string): LibraryVideo | null {
  const id = xmlField(entry, /<id>([^<]+)<\/id>/i).replace(/^t3_/, "") || xmlField(entry, /\/comments\/([a-z0-9]+)\//i);
  const title = xmlField(entry, /<title>([^<]+)<\/title>/i);
  const permalink = redditPermalink(entry);
  const author = xmlField(entry, /<name>([^<]+)<\/name>/i).replace(/^\/u\//, "");
  const published = xmlField(entry, /<published>([^<]+)<\/published>/i);
  const content = xmlField(entry, /<content[^>]*>([\s\S]*?)<\/content>/i);
  if (!id || !title || !permalink) return null;
  const media = extractRedditMedia(entry, content);
  if (!shouldKeepRedditEntry(media, title)) return null;
  const flair = extractRedditFlair(entry, content);
  if (adultBlockedText(title, author, subreddit, flair, media.poster, media.src, media.watch)) return null;
  const addedAt = Date.parse(published);
  const poster = media.poster ?? media.thumbFallbacks?.[0];
  const isImage = media.kind === "image";
  const isVideo = media.kind === "video";
  const directMedia = media.src && /\.(?:mp4|webm|gifv)(?:\?|$)/i.test(media.src) ? media.src : undefined;
  const redgifsEmbed = redgifsEmbedUrl(media.watch ?? media.thumbFallbacks?.[0]);
  // v.redd.it does not expose an iframe-friendly media URL in Atom. Its post
  // embed does, while retaining the permalink for comments and link-out.
  const redditEmbed = isVideo
    ? `https://www.redditmedia.com/r/${encodeURIComponent(subreddit)}/comments/${encodeURIComponent(id)}/?ref_source=embed&ref=share&embed=true`
    : undefined;
  return {
    id: `reddit:${id}`,
    folderId: REDDIT_FOLDER_ID,
    name: title.slice(0, 160),
    path: `reddit/${subreddit}/${id}`,
    extension: isImage ? "image" : isVideo ? "reddit" : "reddit",
    mime: isImage ? "image/jpeg" : isVideo ? "video/reddit" : "text/html",
    size: 0,
    addedAt: Number.isFinite(addedAt) ? addedAt : Date.now(),
    tagline: `r/${subreddit}${author ? ` · u/${author}` : ""}${flair ? ` · ${flair}` : ""}${isVideo ? " · video" : isImage ? " · photo" : ""}`,
    description: `reddit, r/${subreddit}, ${subreddit.replace(/_/g, " ")}, ${title}, ${flair}, ${media.watch ?? ""}`,
    poster: poster || undefined,
    src: isImage ? media.src || poster || permalink : directMedia || undefined,
    remote: {
      kind: "reddit",
      sourceKinds: redgifsEmbed ? ["reddit", "redgifs"] : ["reddit"],
      videoId: id,
      channelName: author || `r/${subreddit}`,
      channelId: subreddit,
      observedAt: Date.now(),
      embedUrl: directMedia || redgifsEmbed || redditEmbed,
      // Keep a Reddit permalink here so comments and the official-post action
      // always point at the same post, even for an external media host.
      watchUrl: permalink,
      previewUrl: poster,
      thumbFallbacks: [poster, ...(media.thumbFallbacks ?? [])].filter((url): url is string => Boolean(url)).slice(0, 8),
    },
  };
}

/** Rotate through the curated catalog so refreshes sample many subs over time. */
function redditSubWindow(page: number, configuredSources: readonly RedditSourcePreference[] = []): { subs: string[]; start: number; totalPages: number } {
  const configured = configuredSources.length
    ? [...configuredSources]
        .sort((a, b) => b.priority - a.priority || a.subreddit.localeCompare(b.subreddit))
        .map((row) => row.subreddit)
    : (() => {
        // Priority media-heavy subs lead the curated rotate so Rule34 / gif
        // communities appear early without hammering every Atom feed at once.
        const priority = ADULT_REDDIT_PRIORITY_SUBS.map((sub) => sub.toLowerCase());
        const rest = ADULT_REDDIT_SUBS.filter((sub) => !priority.includes(sub.toLowerCase()));
        return [...ADULT_REDDIT_PRIORITY_SUBS, ...rest];
      })();
  const all = [...new Map(configured.map((sub) => [sub.toLowerCase(), sub])).values()];
  const size = Math.max(1, LIBRARY_LIMITS.redditSubsPerPull);
  const totalPages = Math.max(1, Math.ceil(all.length / size));
  // A saved source list is explicit user intent: walk it predictably, with
  // high-priority communities first. Curated discovery keeps its timed rotate.
  const tick = configured.length ? 0 : Math.floor(Date.now() / (20 * 60_000));
  const start = (((Math.max(1, page) - 1) * size) + (tick * 5)) % all.length;
  const subs: string[] = [];
  for (let i = 0; i < Math.min(size, all.length); i += 1) {
    subs.push(all[(start + i) % all.length]!);
  }
  return { subs, start, totalPages };
}


async function fetchRedditSubRss(sub: string, sort: "hot" | "new"): Promise<LibraryVideo[]> {
  const path = sort === "new" ? `/r/${encodeURIComponent(sub)}/new/.rss` : `/r/${encodeURIComponent(sub)}/.rss`;
  let xml = "";
  let failure = "";
  // Reddit's primary Atom edge intermittently stalls. The old-reddit Atom
  // endpoint is the same public feed with an independent cache path, giving a
  // real backup without scraping post pages or multiplying every list pull.
  const urls = [
    `https://www.reddit.com${path}?limit=${LIBRARY_LIMITS.redditPostsPerSub}`,
    `https://old.reddit.com${path}?limit=${LIBRARY_LIMITS.redditPostsPerSub}`,
  ];
  for (const url of urls) {
    try {
      const res = await cachedAdultFetch(url, {
        signal: AbortSignal.timeout(7_000),
        cacheTtlMs: 10 * 60_000,
        headers: {
          accept: "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8",
          "user-agent": "linux:reelcase:1.0 (by /u/reelcase)",
        },
      });
      if (res.ok) {
        xml = await res.text();
        break;
      }
      failure = res.status === 429 ? "rate limited" : `HTTP ${res.status}`;
      if (res.status === 429) break;
    } catch (err) {
      failure = err instanceof Error ? err.message : "network unavailable";
    }
    if (!xml) await new Promise((resolve) => setTimeout(resolve, 400));
  }
  if (!xml) throw new Error(failure || "empty feed");
  const posts: LibraryVideo[] = [];
  for (const match of xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi)) {
    const chunk = match[1] ?? "";
    const video = redditVideo(chunk, sub);
    if (video) posts.push(video);
  }
  return posts;
}

async function fetchRedditFeed(query: string, maxVideos: number, page = 1, configuredSources: readonly RedditSourcePreference[] = []): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
  nextPage: number | null;
}> {
  const configuredPages = configuredSources.length
    ? Math.max(1, Math.ceil(configuredSources.length / LIBRARY_LIMITS.redditSubsPerPull))
    : LIBRARY_LIMITS.redditWindowsPerPull;
  const windows = 1; // One stable community window per resumable request.
  const collected: LibraryVideo[] = [];
  const seen = new Set<string>();
  const errors: string[] = [];
  let lastTotalPages = 1;

  for (let offset = 0; offset < windows && collected.length < maxVideos; offset += 1) {
    const { subs, start, totalPages } = redditSubWindow(page + offset, configuredSources);
    lastTotalPages = totalPages;
    // One Atom request per community keeps the saved-list pull inside its
    // foreground deadline. Page rotation covers the whole list over time;
    // doing hot and new together was the main cause of Reddit timeouts.
    const jobs = subs.map((sub) => ({ sub, sort: "hot" as const }));
    const batches = await mapPool(jobs, LIBRARY_LIMITS.redditFetchConcurrency, async (job) => {
      try {
        return await fetchRedditSubRss(job.sub, job.sort);
      } catch (err) {
        const message = err instanceof Error ? err.message : "unavailable";
        errors.push(`r/${job.sub}/${job.sort}: ${message}`);
        return [] as LibraryVideo[];
      }
    });
    for (const batch of batches) {
      for (const video of batch) {
        if (seen.has(video.id)) continue;
        seen.add(video.id);
        collected.push(video);
        if (collected.length >= maxVideos) break;
      }
      if (collected.length >= maxVideos) break;
    }
  }

  const needle = query.trim().toLowerCase();
  const filtered =
    !needle || needle === "all"
      ? collected
      : collected.filter((video) => {
          const hay = `${video.name} ${video.tagline ?? ""} ${video.description ?? ""}`.toLowerCase();
          return hay.includes(needle);
        });
  const nextPage = page + windows <= lastTotalPages * 6 ? page + windows : null;
  return {
    videos: filtered.slice(0, maxVideos),
    totalPages: lastTotalPages,
    totalCount: filtered.length,
    nextPage,
  };
}


type BooruPost = {
  id?: number | string;
  preview_url?: string;
  sample_url?: string;
  file_url?: string;
  tags?: string;
  width?: number;
  height?: number;
  score?: number;
  owner?: string;
  creator?: string;
  uploader?: string;
};

const BOORU_HOSTS = [
  { id: "rule34", base: "https://rule34.xxx", apiBase: "https://api.rule34.xxx", postPath: "/index.php?page=post&s=view&id=" },
  { id: "gelbooru", base: "https://gelbooru.com", apiBase: "https://gelbooru.com", postPath: "/index.php?page=post&s=view&id=" },
  { id: "realbooru", base: "https://realbooru.com", postPath: "/index.php?page=post&s=view&id=" },
  { id: "xbooru", base: "https://xbooru.com", postPath: "/index.php?page=post&s=view&id=" },
  { id: "tbib", base: "https://tbib.org", postPath: "/index.php?page=post&s=view&id=" },
  { id: "hypnohub", base: "https://hypnohub.net", postPath: "/index.php?page=post&s=view&id=" },
] as const;

function normalizedBooruUrl(value: string, host: (typeof BOORU_HOSTS)[number]): string {
  const decoded = decodeBooruHtml(value).trim();
  if (!decoded) return "";
  if (decoded.startsWith("//")) return `https:${decoded}`;
  if (decoded.startsWith("/")) return `${host.base}${decoded}`;
  return decoded;
}

function booruVideo(row: BooruPost, host: (typeof BOORU_HOSTS)[number]): LibraryVideo | null {
  const id = asString(row.id).trim();
  const tags = asString(row.tags).trim();
  const owner = pickString(row.owner, row.creator, row.uploader).trim();
  const preview = normalizedBooruUrl(asString(row.preview_url), host);
  const sample = normalizedBooruUrl(asString(row.sample_url), host);
  const file = normalizedBooruUrl(asString(row.file_url), host);
  // Keep the original file for the explicit Download action while cards paint
  // the smaller preview first. This matters for high-resolution Rule34 posts.
  const image = file || sample || preview;
  if (!id || !image) return null;
  if (adultBlockedText(tags, owner)) return null;
  const title = (tags.split(/\s+/).filter(Boolean).slice(0, 8).join(" ") || `${host.id} #${id}`).slice(0, 160);
  const watch = `${host.base}${host.postPath}${encodeURIComponent(id)}`;
  return {
    id: `booru:${host.id}:${id}`,
    folderId: BOORU_FOLDER_ID,
    name: title,
    path: `booru/${host.id}/${id}`,
    extension: "image",
    mime: "image/jpeg",
    size: 0,
    addedAt: Date.now(),
    tagline: `${host.id} · photo${owner ? ` · ${owner}` : ""}`,
    description: tags.slice(0, 400),
    poster: sample || preview || undefined,
    src: image,
    remote: {
      kind: "booru",
      videoId: id,
      channelName: owner || host.id,
      channelId: host.id,
      observedAt: Date.now(),
      embedUrl: image,
      watchUrl: watch,
      previewUrl: sample || preview || undefined,
      thumbFallbacks: [sample, preview, file].filter(isUsableAdultThumb).slice(0, 4),
    },
  };
}

function decodeBooruHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function booruMarkupAttribute(markup: string, name: string): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = markup.match(new RegExp(`\\b${escaped}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, "i"));
  return match ? decodeBooruHtml(match[2] ?? "") : "";
}

function booruPostsFromXml(xml: string): BooruPost[] {
  const rows: BooruPost[] = [];
  for (const match of xml.matchAll(/<post\b([\s\S]*?)(?:\/>|>)/gi)) {
    const attrs = match[1] ?? "";
    const id = booruMarkupAttribute(attrs, "id");
    if (!id) continue;
    rows.push({
      id,
      preview_url: booruMarkupAttribute(attrs, "preview_url"),
      sample_url: booruMarkupAttribute(attrs, "sample_url"),
      file_url: booruMarkupAttribute(attrs, "file_url"),
      tags: booruMarkupAttribute(attrs, "tags"),
      owner: booruMarkupAttribute(attrs, "owner") || booruMarkupAttribute(attrs, "creator") || booruMarkupAttribute(attrs, "uploader"),
    });
  }
  return rows;
}

async function fetchBooruListing(host: (typeof BOORU_HOSTS)[number], tags: string, limit: number, pid: number): Promise<LibraryVideo[]> {
  const params = new URLSearchParams({ page: "post", s: "list", tags, pid: String(Math.max(0, pid)) });
  const res = await cachedAdultFetch(`${host.base}/index.php?${params.toString()}`, {
    signal: AbortSignal.timeout(15_000),
    cacheTtlMs: 10 * 60_000,
    headers: { accept: "text/html,application/xhtml+xml", "user-agent": "Mozilla/5.0 (compatible; Realhub/1.0)" },
  });
  if (!res.ok) throw new Error(`${host.id} HTTP ${res.status}`);
  const html = await res.text();
  const rows: BooruPost[] = [];
  // Gelbooru-style listings have changed attribute order a few times. Read
  // each card's image tag rather than requiring `src` and `alt` in one fixed
  // sequence, which also makes this a useful fallback for Rule34-like hosts.
  const cardPattern = /<(?:span|article|li)\b([^>]*\bid=["']s?(\d+)["'][^>]*)>([\s\S]*?)<\/(?:span|article|li)>/gi;
  for (const match of html.matchAll(cardPattern)) {
    const image = match[3]?.match(/<img\b([\s\S]*?)>/i)?.[1] ?? "";
    const preview = booruMarkupAttribute(image, "data-src") || booruMarkupAttribute(image, "src");
    const postId = match[2] ?? "";
    if (!postId || !preview) continue;
    rows.push({
      id: postId,
      preview_url: preview,
      tags: booruMarkupAttribute(image, "title") || booruMarkupAttribute(image, "alt"),
    });
    if (rows.length >= limit) break;
  }
  if (!rows.length) {
    const thumbPattern = /<span\s+id=["']s(\d+)["'][^>]*>[\s\S]*?<img\b([^>]*)>/gi;
    for (const match of html.matchAll(thumbPattern)) {
      const preview = booruMarkupAttribute(match[2] ?? "", "data-src") || booruMarkupAttribute(match[2] ?? "", "src");
      if (!preview) continue;
      rows.push({ id: match[1], preview_url: preview, tags: booruMarkupAttribute(match[2] ?? "", "title") || booruMarkupAttribute(match[2] ?? "", "alt") });
      if (rows.length >= limit) break;
    }
  }
  const videos = rows.map((row) => booruVideo(row, host)).filter((video): video is LibraryVideo => video != null);
  // Detail recovery is shared by preview and player, on demand. Walking nine
  // post pages for every HTML catalog page made large pulls unnecessarily slow.
  return videos;
}

function rule34PostIdFromQuery(query: string) {
  const direct = query.match(/(?:rule34\.xxx\/index\.php\?[^\s]*\bid=|(?:^|\s)rule34:)(\d+)/i)?.[1];
  return direct && /^\d+$/.test(direct) ? direct : null;
}

async function fetchRule34Post(host: (typeof BOORU_HOSTS)[number], id: string): Promise<LibraryVideo | null> {
  const res = await cachedAdultFetch(`${host.base}${host.postPath}${encodeURIComponent(id)}`, {
    signal: AbortSignal.timeout(15_000),
    cacheTtlMs: 30 * 60_000,
    headers: { accept: "text/html,application/xhtml+xml", "user-agent": "Mozilla/5.0 (compatible; Realhub/1.0)" },
  });
  if (!res.ok) throw new Error(`${host.id} post ${id} HTTP ${res.status}`);
  const html = await res.text();
  const found = booruPostImageUrls(html);
  const image = found.original || found.sample;
  const tags = html.match(/<img\b(?=[^>]*\bid="image")[^>]*\balt="([^"]*)"[^>]*>/i)?.[1] ?? "";
  if (!image) throw new Error(`${host.id} post ${id} has no public image`);
  return booruVideo({ id, file_url: decodeBooruHtml(image), preview_url: decodeBooruHtml(image), tags: decodeBooruHtml(tags) }, host);
}

async function fetchBooruJson(host: (typeof BOORU_HOSTS)[number], tags: string, limit: number, pid: number, postId?: string): Promise<LibraryVideo[]> {
  const params = new URLSearchParams({
    page: "dapi",
    s: "post",
    q: "index",
    json: "1",
    limit: String(limit),
    pid: String(Math.max(0, pid)),
    tags,
  });
  if (postId) params.set('id', postId);
  const url = `${("apiBase" in host ? host.apiBase : host.base)}/index.php?${params.toString()}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(postId ? 6_000 : 15_000),
    cacheTtlMs: 10 * 60_000,
    headers: { accept: "application/json,text/plain,*/*", "user-agent": "Realhub/1.0" },
  });
  if (!res.ok) throw new Error(`${host.id} HTTP ${res.status}`);
  const body = await res.text();
  let raw: unknown;
  try {
    raw = JSON.parse(body) as unknown;
  } catch {
    const rows = booruPostsFromXml(body);
    if (rows.length) return rows.map((row) => booruVideo(row, host)).filter((video): video is LibraryVideo => video != null);
    throw new Error(`${host.id} returned an unsupported public feed`);
  }
  const record = asRecord(raw);
  // Gelbooru-compatible servers use both a bare JSON array and wrappers such
  // as { post: [...] } / { posts: [...] }. Wrapped results are still valid.
  const rows = Array.isArray(raw) ? raw
    : Array.isArray(record?.post) ? record.post
    : Array.isArray(record?.posts) ? record.posts
    : [];
  const out: LibraryVideo[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const video = booruVideo(row as BooruPost, host);
    if (video) out.push(video);
  }
  return out;
}

async function fetchBooruHost(host: (typeof BOORU_HOSTS)[number], tags: string, limit: number, pid: number): Promise<LibraryVideo[]> {
  // Some booru hosts now reject anonymous JSON (Gelbooru) or return XML even
  // with json=1 (Realbooru). Prefer the structured endpoint, then recover from
  // a valid public HTML listing rather than reporting a misleading empty pull.
  try {
    const rows = await fetchBooruJson(host, tags, limit, pid);
    if (rows.length) return rows;
  } catch {
    // Public listing fallback below preserves a scoped provider diagnostic.
  }
  return fetchBooruListing(host, tags, limit, pid);
}

function booruTagsForHost(host: (typeof BOORU_HOSTS)[number], needle: string): string {
  const query = needle.trim();
  // Rule34-style catalogs are adult-only and commonly do not have an
  // `rating:explicit` tag. Sending that shared tag was the reason their
  // otherwise successful requests returned zero cards. Gelbooru supports the
  // rating syntax, so retain it there to keep mixed listings adult-scoped.
  if (host.id === "gelbooru") return ["rating:explicit", query].filter(Boolean).join(" ");
  return query;
}

export async function runBooruOriginal(data: unknown): Promise<string | null> {
  const input = asRecord(data);
  const id = String(input?.id ?? "");
  if (!/^\d{1,12}$/.test(id)) return null;
  const hostId = String(input?.host ?? 'tbib');
  const host = BOORU_HOSTS.find((item) => item.id === hostId);
  if (!host && hostId !== 'e621') return null;
  try {
    if (hostId === 'e621') {
      const response = await cachedAdultFetch(`https://e621.net/posts/${id}.json`, { signal: AbortSignal.timeout(10_000), cacheTtlMs: 30 * 60_000, headers: { accept: 'application/json', 'user-agent': 'Realhub/1.0' } });
      if (!response.ok) return null;
      const body = asRecord(await response.json());
      const url = asString(asRecord(asRecord(body?.post)?.file)?.url);
      return /^https:\/\//.test(url) ? url : null;
    }
    if (!host) return null;
    // Cached HTML-only cards need their file_url recovered. Some hosts allow
    // the post API while challenging their HTML pages, so try a single ID first.
    if (host.id !== 'tbib') {
      try {
        const cards = await fetchBooruJson(host, '', 1, 0, id);
        const file = cards.find(card => card.remote?.videoId === id)?.src;
        if (file && /^https:\/\//.test(file) && !/(?:thumbnails?|samples?|resized)\//i.test(file)) return file;
      } catch { /* Recover through the public post page below. */ }
    }
    const response = await cachedAdultFetch(`${host.base}${host.postPath}${id}`, { signal: AbortSignal.timeout(10_000), cacheTtlMs: 30 * 60_000, headers: { accept: "text/html", "user-agent": "Mozilla/5.0 (compatible; Realhub/1.0)" } });
    if (!response.ok) return null;
    const { original } = booruPostImageUrls(await response.text());
    const url = normalizedBooruUrl(original ?? "", host);
    return /^https:\/\//.test(url) ? url : null;
  } catch { return null; }
}


type E621Post = {
  id?: number | string;
  tags?: { general?: string[]; artist?: string[]; character?: string[]; copyright?: string[]; meta?: string[] } | string;
  file?: { url?: string; ext?: string; width?: number; height?: number };
  preview?: { url?: string; width?: number; height?: number };
  sample?: { url?: string; width?: number; height?: number };
  score?: { total?: number } | number;
  rating?: string;
};

function e621TagString(tags: E621Post["tags"]): string {
  if (!tags) return "";
  if (typeof tags === "string") return tags;
  return [tags.artist, tags.character, tags.copyright, tags.general, tags.meta]
    .flatMap((part) => (Array.isArray(part) ? part : []))
    .filter(Boolean)
    .join(" ");
}

function e621Video(row: E621Post): LibraryVideo | null {
  const id = asString(row.id).trim();
  if (!id) return null;
  const rating = asString(row.rating).trim().toLowerCase();
  if (rating && rating !== "e" && rating !== "explicit") return null;
  const tags = e621TagString(row.tags);
  const preview = asString(row.preview?.url).trim();
  const sample = asString(row.sample?.url).trim();
  const file = asString(row.file?.url).trim();
  const image = file || sample || preview;
  if (!image) return null;
  if (adultBlockedText(tags)) return null;
  const title = (tags.split(/\s+/).filter(Boolean).slice(0, 8).join(" ") || `e621 #${id}`).slice(0, 160);
  const watch = `https://e621.net/posts/${encodeURIComponent(id)}`;
  const thumbs = [preview, sample, file].filter(isUsableAdultThumb).slice(0, 4);
  return {
    id: `booru:e621:${id}`,
    folderId: BOORU_FOLDER_ID,
    name: title,
    path: `booru/e621/${id}`,
    extension: "image",
    mime: "image/jpeg",
    size: 0,
    addedAt: Date.now(),
    tagline: `e621 · photo`,
    description: tags.slice(0, 400),
    poster: thumbs[0] || preview || sample || undefined,
    src: image,
    remote: {
      kind: "booru",
      videoId: id,
      channelName: "e621",
      channelId: "e621",
      observedAt: Date.now(),
      embedUrl: image,
      watchUrl: watch,
      previewUrl: thumbs[0] || preview || sample || undefined,
      thumbFallbacks: thumbs.length ? thumbs : undefined,
    },
  };
}

async function fetchE621Page(tags: string, limit: number, page: number): Promise<LibraryVideo[]> {
  const params = new URLSearchParams({
    limit: String(Math.min(80, Math.max(1, limit))),
    page: String(Math.max(1, page)),
    tags,
  });
  const url = `https://e621.net/posts.json?${params.toString()}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(15_000),
    cacheTtlMs: 10 * 60_000,
    cacheKey: `GET:${url}:e621`,
    headers: {
      accept: "application/json",
      // e621 requires a descriptive UA; keep contact-style identity for their policy.
      "user-agent": "Realhub/1.0 (adult catalog; local library client)",
    },
  });
  if (!res.ok) throw new Error(`e621 HTTP ${res.status}`);
  const json: unknown = await res.json();
  const root = asRecord(json);
  const rows = Array.isArray(root?.posts) ? root.posts : Array.isArray(json) ? json : [];
  const out: LibraryVideo[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const video = e621Video(row as E621Post);
    if (video) out.push(video);
  }
  return out;
}

async function fetchBooruFeed(query: string, maxVideos: number, page: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  const needle = query.trim().toLowerCase();
  const directRule34Id = rule34PostIdFromQuery(query);
  if (directRule34Id) {
    const rule34 = BOORU_HOSTS.find((host) => host.id === "rule34")!;
    const video = await fetchRule34Post(rule34, directRule34Id);
    return { videos: video ? [video] : [], totalPages: page, totalCount: video ? 1 : 0 };
  }
  const booruQuery = !needle || needle === "all" ? "" : needle;
  const limit = LIBRARY_LIMITS.booruPageSize;
  const pid = Math.max(0, page - 1);
  const collected: LibraryVideo[] = [];
  const seen = new Set<string>();
  const errors: string[] = [];
  // Give Rule34 and each failover host a bounded share. The old sequential
  // fill could let the first host consume the entire window, leaving a healthy
  // Rule34 catalog invisible even when it had thousands of usable images.
  const hosts = [...BOORU_HOSTS];
  // Reserve one share for e621's documented JSON API (explicit rating only).
  // Rule34 gets a double share so its filter chip and shelves stay populated.
  const slotCount = hosts.length + 2;
  const share = Math.max(1, Math.min(limit, Math.ceil(maxVideos / slotCount)));
  const rotated = [...hosts.slice(pid % hosts.length), ...hosts.slice(0, pid % hosts.length)];
  const rule34 = rotated.find((host) => host.id === "rule34");
  const ordered = rule34
    ? [rule34, ...rotated.filter((host) => host.id !== "rule34")]
    : rotated;
  const e621Tags = !needle || needle === "all" ? "rating:e order:rank" : `rating:e ${needle}`;
  const batches = await Promise.allSettled([
    ...ordered.map((host) => fetchBooruHost(host, booruTagsForHost(host, booruQuery), host.id === "rule34" ? share * 2 : share, pid)),
    fetchE621Page(e621Tags, share, Math.max(1, page)),
  ]);
  for (const [index, result] of batches.entries()) {
    const label = index < ordered.length ? ordered[index]!.id : "e621";
    if (result.status !== "fulfilled") {
      errors.push(`${label}: ${result.reason instanceof Error ? result.reason.message : "unavailable"}`);
      continue;
    }
    for (const video of result.value) {
      if (seen.has(video.id)) continue;
      seen.add(video.id);
      collected.push(video);
      if (collected.length >= maxVideos) break;
    }
    if (collected.length >= maxVideos) break;
  }
  if (!collected.length && errors.length) throw new Error(`Booru unavailable (${errors.join("; ")}).`);
  // An empty explicit search is a valid provider result, not a failed all-source pull.
  return { videos: collected, totalPages: page + (collected.length >= limit ? 1 : 0), totalCount: collected.length };
}


function adultDataLinkApiKey() {
  return (process.env.ADULTDATALINK_API_KEY || process.env.ADL_API_KEY || "").trim();
}

type RedgifsRow = Record<string, unknown>;

function asRecord(value: unknown): RedgifsRow | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as RedgifsRow) : null;
}

function pickString(...values: unknown[]) {
  for (const value of values) {
    const s = asString(value).trim();
    if (s) return s;
  }
  return "";
}

/** Redgifs' embed boot is often slower than its public poster CDN. Keep the
 * API-provided poster first, then use the stable poster paths before an iframe
 * has to paint a preview. */
function redgifsPosterFallbacks(id: string): string[] {
  const slug = id.trim();
  if (!/^[a-z0-9_-]{2,128}$/i.test(slug)) return [];
  return [
    `https://thumbs2.redgifs.com/${encodeURIComponent(slug)}-mobile.jpg`,
    `https://thumbs2.redgifs.com/${encodeURIComponent(slug)}-poster.jpg`,
    `https://thumbs2.redgifs.com/${encodeURIComponent(slug)}-thumb.jpg`,
    `https://thumbs1.redgifs.com/${encodeURIComponent(slug)}-mobile.jpg`,
    `https://thumbs1.redgifs.com/${encodeURIComponent(slug)}-poster.jpg`,
  ];
}

function redgifsVideo(row: RedgifsRow): LibraryVideo | null {
  const id = pickString(row.id, row.gif_id, row.gifId, row.slug);
  if (!id) return null;
  // AdultDataLink has used a few Redgifs response shapes. Read the documented
  // media containers before falling back to a player, so posters and direct
  // playback keep working when a provider rolls out a field rename.
  const urls = {
    ...(asRecord(row.urls) ?? {}),
    ...(asRecord(row.media) ?? {}),
    ...(asRecord(row.gif) ?? {}),
    ...(asRecord(row.video) ?? {}),
  };
  const user = asRecord(row.user) ?? asRecord(row.creator) ?? {};
  const tagsRaw = row.tags ?? row.hashtags ?? row.niches;
  const tagList = Array.isArray(tagsRaw)
    ? tagsRaw.map((t) => (typeof t === "string" ? t : pickString(asRecord(t)?.name, asRecord(t)?.text))).filter(Boolean)
    : typeof tagsRaw === "string"
      ? tagsRaw.split(/[,;\s]+/).filter(Boolean)
      : [];
  const title = pickString(row.title, row.description, tagList.slice(0, 6).join(" "), id).slice(0, 160);
  const author = pickString(user.username, user.name, row.userName, row.username, row.author);
  const embed = pickString(urls.html, urls.player, row.embedUrl, row.embed_url, `https://www.redgifs.com/ifr/${encodeURIComponent(id)}`);
  const watch = pickString(urls.webUrl, urls.web_url, row.url, row.webUrl, `https://www.redgifs.com/watch/${encodeURIComponent(id)}`);
  const thumb = pickString(urls.poster, urls.thumbnail, urls.thumb, urls.preview, urls.posterUrl, urls.previewUrl, row.poster, row.thumbnail, row.thumb, row.previewUrl);
  // Keep every distinct CDN variant. Direct catalog rows and Reddit-linked
  // rows should get the same full poster recovery chain when a Redgifs edge
  // is slow, stale, or returns a placeholder.
  const thumbFallbacks = [...new Set([thumb, ...redgifsPosterFallbacks(id)])].filter(isUsableAdultThumb).slice(0, 6);
  const file = pickString(urls.hd, urls.sd, urls.silent, urls.mobile, urls.mp4, urls.giftiny, urls.gif, row.mp4, row.file);
  if (adultBlockedText(title, author, tagList.join(" "))) return null;
  return {
    id: `redgifs:${id}`,
    folderId: REDGIFS_FOLDER_ID,
    name: title || `Redgifs ${id}`,
    path: `redgifs/${id}`,
    extension: "redgifs",
    mime: "video/mp4",
    size: 0,
    addedAt: Date.now(),
    tagline: [author, ...tagList.slice(0, 8)].filter(Boolean).join(" · ").slice(0, 160) || undefined,
    description: tagList.join(", ") || title,
    poster: thumbFallbacks[0],
    // Direct media starts promptly and avoids waiting for the Redgifs iframe
    // boot path. Retain the iframe as a fallback when the API omits a file.
    src: file || embed || undefined,
    remote: {
      kind: "redgifs",
      videoId: id,
      channelName: author || "Redgifs",
      observedAt: Date.now(),
      embedUrl: embed || undefined,
      watchUrl: watch,
      previewUrl: thumbFallbacks[0],
      thumbFallbacks: thumbFallbacks.length ? thumbFallbacks : undefined,
    },
  };
}

function collectRedgifsRows(payload: unknown): RedgifsRow[] {
  if (Array.isArray(payload)) return payload.map(asRecord).filter((r): r is RedgifsRow => Boolean(r));
  const root = asRecord(payload);
  if (!root) return [];
  for (const key of ["gifs", "items", "data", "results", "trending", "feed"]) {
    const value = root[key];
    if (Array.isArray(value)) return value.map(asRecord).filter((r): r is RedgifsRow => Boolean(r));
    const nested = asRecord(value);
    if (nested) {
      for (const nestedKey of ["gifs", "items", "data", "results"]) {
        const inner = nested[nestedKey];
        if (Array.isArray(inner)) return inner.map(asRecord).filter((r): r is RedgifsRow => Boolean(r));
      }
    }
  }
  return [];
}

let redgifsAuth: { token: string; expiresAt: number } | null = null;

async function getRedgifsAccessToken(): Promise<string> {
  const now = Date.now();
  if (redgifsAuth && redgifsAuth.expiresAt > now + 60_000) return redgifsAuth.token;
  const res = await fetchProviderMetadata("https://api.redgifs.com/v2/auth/temporary", {
    headers: { accept: "application/json", "user-agent": "Realhub/1.0" },
    signal: AbortSignal.timeout(12_000),
  });
  if (!res.ok) throw new Error(`Redgifs auth HTTP ${res.status}`);
  const json = (await res.json()) as { token?: string };
  if (!json.token?.trim()) throw new Error("Redgifs auth missing token");
  // Temporary tokens last many hours; refresh hourly at most.
  redgifsAuth = { token: json.token.trim(), expiresAt: now + 60 * 60_000 };
  return redgifsAuth.token;
}

async function fetchRedgifsDirect(query: string, maxVideos: number, page: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  const token = await getRedgifsAccessToken();
  const count = Math.min(LIBRARY_LIMITS.redgifsPageSize, maxVideos);
  const needle = query.trim();
  const params = new URLSearchParams({
    count: String(count),
    page: String(Math.max(1, page)),
    order: "trending",
  });
  // Official search requires search_text; use a short discovery token for "all".
  params.set("search_text", needle && needle.toLowerCase() !== "all" ? needle.slice(0, 64) : "a");
  const url = `https://api.redgifs.com/v2/gifs/search?${params.toString()}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(20_000),
    cacheTtlMs: 6 * 60_000,
    cacheKey: `GET:${url}:rg`,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${token}`,
      "user-agent": "Realhub/1.0",
    },
  });
  if (!res.ok) throw new Error(`Redgifs HTTP ${res.status}`);
  const json: unknown = await res.json();
  const videos = collectRedgifsRows(json)
    .map(redgifsVideo)
    .filter((video): video is LibraryVideo => video != null)
    .slice(0, maxVideos);
  return {
    videos,
    totalPages: page + (videos.length >= count ? 1 : 0),
    totalCount: videos.length,
  };
}

async function fetchRedgifsViaAdultDataLink(query: string, maxVideos: number, page: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  const key = adultDataLinkApiKey();
  if (!key) return { videos: [], totalPages: page, totalCount: 0 };
  const params = new URLSearchParams({
    parameter: "gif",
    page: String(Math.max(1, page)),
    count: String(Math.min(LIBRARY_LIMITS.redgifsPageSize, maxVideos)),
  });
  const needle = query.trim();
  if (needle && needle.toLowerCase() !== "all") params.set("search", needle.slice(0, 64));
  const url = `https://api.adultdatalink.com/redgifs/trending?${params.toString()}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(20000),
    cacheTtlMs: 8 * 60_000,
    cacheKey: `GET:${url}:adl`,
    headers: {
      accept: "application/json",
      authorization: `Bearer ${key}`,
      "x-api-key": key,
      "user-agent": "Realhub/1.0",
    },
  });
  if (!res.ok) throw new Error(`AdultDataLink Redgifs HTTP ${res.status}`);
  const json: unknown = await res.json();
  const videos = collectRedgifsRows(json)
    .map(redgifsVideo)
    .filter((video): video is LibraryVideo => video != null)
    .slice(0, maxVideos);
  return {
    videos,
    totalPages: page + (videos.length >= Math.min(LIBRARY_LIMITS.redgifsPageSize, maxVideos) ? 1 : 0),
    totalCount: videos.length,
  };
}

async function fetchRedgifsFeed(query: string, maxVideos: number, page: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  // Prefer the official public temporary-token API so Redgifs shelves fill
  // without AdultDataLink. Keep AdultDataLink as a secondary path when a key
  // is configured and the direct feed is empty or unavailable.
  try {
    const direct = await fetchRedgifsDirect(query, maxVideos, page);
    if (direct.videos.length) return direct;
  } catch {
    // Fall through to AdultDataLink / empty.
  }
  try {
    const viaAdl = await fetchRedgifsViaAdultDataLink(query, maxVideos, page);
    if (viaAdl.videos.length) return viaAdl;
  } catch {
    // Optional secondary path.
  }
  return { videos: [], totalPages: page, totalCount: 0 };
}

function liveRoomLimit(provider: AdultPullProvider) {
  if (provider === "chaturbate") return LIBRARY_LIMITS.chaturbateRoomsPerPull;
  if (provider === "myfreecams") return LIBRARY_LIMITS.myfreecamsRoomsPerPull;
  return 0;
}

function providerPageBudget(provider: AdultPullProvider) {
  // A direct RedTube pull used to walk up to 300 pages serially before the
  // request could resolve. Keep deep archive cursors, but cap one foreground
  // batch so the catalog paints partial results promptly.
  if (provider === "redtube") return { maxPages: Math.min(LIBRARY_LIMITS.redtubePagesPerPull, 24), perPage: LIBRARY_LIMITS.redtubePageSize };
  const live = liveRoomLimit(provider);
  if (live) return { maxPages: 1, perPage: live };
  return { maxPages: LIBRARY_LIMITS.epornerPagesPerPull, perPage: LIBRARY_LIMITS.epornerPageSize };
}

/** A mixed foreground pull should return its healthy providers promptly. A
 * slow public feed is reported as partial work instead of freezing the whole
 * Adults screen behind its retry window. */
async function withinAdultPullDeadline<T>(work: Promise<T>, provider: AdultPullProvider): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      work,
      new Promise<T>((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`${provider} timed out; try it alone or Load more.`)), 18_000);
      }),
    ]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function adultPullFailureDetail(error: unknown): string {
  const message = error instanceof Error ? error.message.trim() : "";
  if (!message || /^(?:failed to fetch|fetch failed|networkerror)$/i.test(message)) {
    return "Network request failed; the provider may be offline, blocked, or rate limited.";
  }
  if (/abort(?:ed|error)?|timeout/i.test(message)) return "Request timed out before the provider responded.";
  return message.slice(0, 280);
}

async function pullProviderPages(
  provider: AdultPullProvider, query: string, order: string, startPage: number,
  maxVideos: number, redditSources: readonly RedditSourcePreference[] = [], startOffset = 0,
): Promise<{ videos: LibraryVideo[]; page: number; nextPage: number | null; nextOffset: number; totalCount: number }> {
  if (provider === "chaturbate" || provider === "myfreecams") {
    const batch = provider === "chaturbate" ? await fetchChaturbateRooms(query, maxVideos) : await fetchMyFreeCamsRooms(query, maxVideos);
    return { videos: batch.videos, page: 1, nextPage: null, nextOffset: 0, totalCount: batch.totalCount };
  }
  const videos: LibraryVideo[] = [], seen = new Set<string>();
  let page = startPage, offset = startOffset, totalCount = 0, nextPage: number | null = page, nextOffset = offset;
  const started = Date.now();
  // A request is a small archive step, never an unbounded hidden keyword sweep.
  const maxPages = provider === 'eporner' || provider === 'reddit' || provider === 'booru' ? 1 : 4;
  for (let step = 0; step < maxPages && videos.length < maxVideos && Date.now() - started < 12_000; step++) {
    let rows: LibraryVideo[], following: number | null;
    if (provider === 'reddit') {
      const batch = await fetchRedditFeed(query, 1000, page, redditSources);
      rows = batch.videos; following = batch.nextPage; totalCount = batch.totalCount;
    } else if (provider === 'booru') {
      const batch = await fetchBooruFeed(query, 400, page);
      rows = batch.videos; following = rows.length ? page + 1 : null; totalCount = batch.totalCount;
    } else if (provider === 'redgifs') {
      const batch = await fetchRedgifsFeed(query, LIBRARY_LIMITS.redgifsPageSize, page);
      rows = batch.videos; following = page < batch.totalPages ? page + 1 : null; totalCount = batch.totalCount;
    } else {
      const varietyOrders = ["top-weekly", "latest", "top-rated", "most-popular", "top-monthly"];
      const sort = query.trim().toLowerCase() === 'all' ? varietyOrders[(page - 1) % varietyOrders.length]! : order;
      const batch = provider === 'redtube' ? await fetchRedtubePage(query, sort, page) : await fetchEpornerPage(query, sort, page, LIBRARY_LIMITS.epornerPageSize);
      rows = batch.videos; following = page < batch.totalPages ? page + 1 : null; totalCount = batch.totalCount;
    }
    const window = archivePageWindow(rows, page, offset, maxVideos - videos.length, following);
    for (const video of window.rows) if (!seen.has(video.id)) { seen.add(video.id); videos.push(video); }
    nextPage = window.nextPage; nextOffset = window.nextOffset;
    if (!rows.length || nextPage == null || nextPage === page) break;
    page = nextPage; offset = 0;
  }
  return { videos, page: startPage, nextPage, nextOffset, totalCount };
}

export async function runSearchAdultVideos(dataRaw: unknown): Promise<{
    videos: LibraryVideo[];
    source: string;
    note: string;
    page: number;
    nextPage: number | null;
    totalCount: number;
    providers: AdultPullProvider[];
    providerNextPages: Partial<Record<AdultPullProvider, number | null>>;
    providerNextOffsets: Partial<Record<AdultPullProvider, number>>;
    providerDiagnostics: AdultPullDiagnostic[];
  }> {
    const data = parseAdultSearch(dataRaw);
    const providers = [...data.providers].sort((a, b) => (a === "reddit" ? -1 : b === "reddit" ? 1 : 0));
    const share = Math.max(1, Math.floor(data.maxVideos / Math.max(1, providers.length)));
    const leftovers = data.maxVideos - share * providers.length;
    const collected: LibraryVideo[] = [];
    let nextPage: number | null = null;
    let totalCount = 0;
    const errors: string[] = [];
    const providerNextPages: Partial<Record<AdultPullProvider, number | null>> = {};
    const providerNextOffsets: Partial<Record<AdultPullProvider, number>> = {};
    const providerDiagnostics: AdultPullDiagnostic[] = [];

    const batches = await Promise.allSettled(providers.map(async (provider) => {
      const budget = share + (provider === providers[0] ? leftovers : 0);
      const startPage = data.providerPages?.[provider] ?? data.page;
      const batch = await withinAdultPullDeadline(
        pullProviderPages(provider, data.query, data.order, startPage, budget, data.redditSources, data.providerOffsets[provider] ?? 0),
        provider,
      );
      return { provider, batch };
    }));

    const seen = new Set<string>();
    for (const result of batches) {
      if (result.status === "fulfilled") {
        const { provider, batch } = result.value;
        for (const video of batch.videos) {
          if (seen.has(video.id)) continue;
          seen.add(video.id);
          collected.push(video);
        }
        totalCount += batch.totalCount;
        providerNextPages[provider] = batch.nextPage;
        providerNextOffsets[provider] = batch.nextOffset;
        providerDiagnostics.push({
          provider,
          status: batch.videos.length ? "loaded" : "empty",
          titles: batch.videos.length,
          detail: batch.videos.length
            ? `${batch.videos.length.toLocaleString()} titles from page ${batch.page}${batch.nextPage != null ? ` · next page ${batch.nextPage}` : ""}`
            : "The provider responded, but had no matching public results.",
        });
        if (batch.nextPage != null) nextPage = nextPage == null ? batch.nextPage : Math.min(nextPage, batch.nextPage);
        continue;
      }
      const provider = providers[batches.indexOf(result)]!;
      const message = adultPullFailureDetail(result.reason);
      errors.push(`${provider}: ${message}`);
      // Failed providers keep their last accepted archive cursor.
      providerDiagnostics.push({ provider, status: "failed", titles: 0, detail: message });
    }

    if (!collected.length && errors.length) {
      throw new Error(`Adult pulls failed (${errors.join("; ")}).`);
    }

    return {
      videos: collected.slice(0, data.maxVideos),
      source: providers.join("+"),
      note:
        errors.length
          ? `Partial adult pull — ${errors.join("; ")}. Remaining official APIs still returned titles.`
          : "Pulled via official public APIs and public Reddit Atom feeds. Playback uses public embeds, room deep-links, or Reddit permalinks; keywords/tags become local source + fetish tags.",
      page: data.page,
      nextPage,
      totalCount,
      providers,
      providerNextPages,
      providerNextOffsets,
      providerDiagnostics,
    };
}


/* --- Provider comments (real public feeds only; no fake comments) --- */

export type AdultComment = { id: string; author?: string; body: string; score?: number; kind?: "comment" | "chat" };

function parseRedditCommentEntries(xml: string): AdultComment[] {
  const out: AdultComment[] = [];
  for (const chunk of xml.split(/<entry>/i).slice(1).slice(0, 40)) {
    const id = xmlField(chunk, /<id>([^<]+)<\/id>/i) || `c${out.length}`;
    const title = xmlField(chunk, /<title>([^<]+)<\/title>/i);
    const author = xmlField(chunk, /<name>([^<]+)<\/name>/i).replace(/^\/u\//, "");
    const content = xmlField(chunk, /<content[^>]*>([\s\S]*?)<\/content>/i)
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, " ")
      .trim();
    const body = (content || title).slice(0, 400);
    if (!body || body.length < 2) continue;
    if (adultBlockedText(body, author)) continue;
    out.push({ id, author: author || undefined, body });
  }
  return out;
}

function youtubeText(value: unknown): string {
  if (typeof value === "string") return value.trim();
  if (!value || typeof value !== "object") return "";
  const record = value as Record<string, unknown>;
  if (typeof record.simpleText === "string") return record.simpleText.trim();
  if (!Array.isArray(record.runs)) return "";
  return record.runs
    .map((run) => (run && typeof run === "object" && typeof (run as Record<string, unknown>).text === "string" ? (run as Record<string, unknown>).text as string : ""))
    .join("")
    .trim();
}

function youtubeCommentScore(value: unknown): number | undefined {
  const parsed = Number(youtubeText(value).replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : undefined;
}

function youtubeCommentEntities(root: unknown, limit: number): AdultComment[] {
  const out: AdultComment[] = [];
  const seen = new Set<string>();
  const stack: unknown[] = [root];
  while (stack.length && out.length < limit) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) { stack.push(...current); continue; }
    const record = current as Record<string, unknown>;
    const payload = record.commentEntityPayload as {
      properties?: { commentId?: string; content?: { content?: string } };
      author?: { displayName?: string };
      toolbar?: { likeCountNotliked?: string };
    } | undefined;
    if (payload?.properties?.content?.content) {
      const id = payload.properties.commentId || `ytc${out.length}`;
      if (!seen.has(id)) {
        seen.add(id);
        const scoreRaw = Number(String(payload.toolbar?.likeCountNotliked ?? "").replace(/,/g, ""));
        out.push({
          id,
          author: payload.author?.displayName?.replace(/^@/, "") || undefined,
          body: payload.properties.content.content.slice(0, 500),
          score: Number.isFinite(scoreRaw) ? scoreRaw : undefined,
        });
      }
    }
    // Innertube serves the entity payload above on newer WEB responses, but
    // still uses the long-lived commentRenderer shape for some videos and
    // continuations. Accept both so an otherwise healthy public thread does
    // not look empty merely because YouTube switched response envelopes.
    const renderer = record.commentRenderer as Record<string, unknown> | undefined;
    if (renderer) {
      const id = asString(renderer.commentId).trim() || `ytc-legacy-${out.length}`;
      const body = youtubeText(renderer.contentText).slice(0, 500);
      if (body && !seen.has(id)) {
        seen.add(id);
        out.push({
          id,
          author: youtubeText(renderer.authorText).replace(/^@/, "") || undefined,
          body,
          score: youtubeCommentScore(renderer.voteCount ?? renderer.likeCount),
        });
      }
    }
    for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
  }
  return out;
}

/** Public Reddit comment listings use the same t1 tree on the JSON endpoint. */
function parseRedditCommentJson(payload: unknown): AdultComment[] {
  const out: AdultComment[] = [];
  const seen = new Set<string>();
  const visit = (value: unknown) => {
    if (!value || out.length >= 40) return;
    if (Array.isArray(value)) {
      for (const item of value) visit(item);
      return;
    }
    if (typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    const data = record.data && typeof record.data === "object" ? record.data as Record<string, unknown> : undefined;
    if (record.kind === "t1" && data) {
      const id = String(data.name ?? data.id ?? "").trim();
      const author = String(data.author ?? "").trim();
      const body = String(data.body ?? "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 400);
      if (id && body.length >= 2 && !seen.has(id) && !adultBlockedText(body, author)) {
        seen.add(id);
        const score = Number(data.score ?? data.ups);
        out.push({ id, author: author || undefined, body, score: Number.isFinite(score) ? score : undefined });
      }
    }
    if (data?.replies) visit(data.replies);
    if (data?.children) visit(data.children);
    if (record.children) visit(record.children);
  };
  visit(payload);
  return out;
}

function youtubeCommentContinuation(root: unknown): string | null {
  const stack: unknown[] = [root];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) { stack.push(...current); continue; }
    const record = current as Record<string, unknown>;
    const panel = record.engagementPanelSectionListRenderer as { panelIdentifier?: string } | undefined;
    if (panel?.panelIdentifier === "engagement-panel-comments-section") {
      const inner: unknown[] = [record];
      while (inner.length) {
        const node = inner.pop();
        if (!node || typeof node !== "object") continue;
        if (Array.isArray(node)) { inner.push(...node); continue; }
        const row = node as Record<string, unknown>;
        const token = (row.continuationEndpoint as { continuationCommand?: { token?: string } } | undefined)?.continuationCommand?.token
          ?? (row.continuationCommand as { token?: string } | undefined)?.token;
        if (token) return token;
        for (const value of Object.values(row)) if (value && typeof value === "object") inner.push(value);
      }
    }
    for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
  }
  return null;
}

function youtubeNextCommentToken(root: unknown): string | null {
  const endpoints = (root as { onResponseReceivedEndpoints?: Array<Record<string, unknown>> })?.onResponseReceivedEndpoints ?? [];
  for (const endpoint of endpoints) {
    const reload = endpoint.reloadContinuationItemsCommand as { continuationItems?: unknown[] } | undefined;
    const append = endpoint.appendContinuationItemsAction as { continuationItems?: unknown[] } | undefined;
    const items = reload?.continuationItems ?? append?.continuationItems ?? [];
    for (const item of items) {
      if (!item || typeof item !== "object") continue;
      const cont = (item as { continuationItemRenderer?: { continuationEndpoint?: { continuationCommand?: { token?: string } } } }).continuationItemRenderer;
      const token = cont?.continuationEndpoint?.continuationCommand?.token;
      if (token) return token;
    }
  }
  // Some current `next` payloads put their continuation item directly in the
  // response tree instead of beneath onResponseReceivedEndpoints.
  const stack: unknown[] = [root];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) { stack.push(...current); continue; }
    const record = current as Record<string, unknown>;
    const cont = record.continuationItemRenderer as { continuationEndpoint?: { continuationCommand?: { token?: string } } } | undefined;
    const token = cont?.continuationEndpoint?.continuationCommand?.token;
    if (token) return token;
    for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
  }
  return null;
}

async function fetchYoutubeComments(videoId: string, limit: number): Promise<{ comments: AdultComment[]; note: string }> {
  const id = videoId.replace(/^yt:/, "").slice(0, 11);
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
    return { comments: [], note: "Not a YouTube video id." };
  }
  try {
    const html = await fetchText(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`);
    const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
    const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
    if (!apiKey) return { comments: [], note: "YouTube Innertube key unavailable." };

    const postNext = async (body: Record<string, unknown>) => {
      const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/next?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-youtube-client-name": "1",
          "x-youtube-client-version": clientVersion,
        },
        body: JSON.stringify({
          context: { client: { clientName: "WEB", clientVersion, hl: "en", gl: "US" } },
          ...body,
        }),
        timeoutMs: 15_000,
      });
      if (!response.ok) return null;
      return await response.json() as unknown;
    };

    const initialData = youtubeInitialData(html);
    const watch = await postNext({ videoId: id });
    if (!watch) return { comments: [], note: "YouTube comments endpoint unavailable." };
    let continuation = youtubeCommentContinuation(watch) ?? (initialData ? youtubeCommentContinuation(initialData) : null);
    if (!continuation) return { comments: [], note: "No public YouTube comment panel for this video." };

    const comments: AdultComment[] = [];
    const seen = new Set<string>();
    // Two public pages normally satisfy the 40-thread on-demand limit. Keeping
    // this short prevents a temporary YouTube slowdown from holding the whole
    // player side panel open behind several serial continuation requests.
    for (let page = 0; page < LIBRARY_LIMITS.youtubeCommentPagesPerPull && comments.length < limit && continuation; page += 1) {
      const pageData = await postNext({ continuation });
      if (!pageData) break;
      for (const row of youtubeCommentEntities(pageData, limit - comments.length)) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        comments.push(row);
      }
      continuation = youtubeNextCommentToken(pageData);
    }
    return {
      comments: comments.slice(0, limit),
      note: comments.length
        ? "YouTube comments via public Innertube (on-demand, not routine refresh)."
        : "No public YouTube comments returned for this video.",
    };
  } catch (err) {
    return { comments: [], note: err instanceof Error ? err.message : "YouTube comments unavailable." };
  }
}


const YOUTUBE_CHAT_PAGE_GAP_MS = 200;

function youtubeChatPageGap() {
  return new Promise<void>((resolve) => setTimeout(resolve, YOUTUBE_CHAT_PAGE_GAP_MS));
}

function youtubeRunsText(runs: unknown): string {
  if (!Array.isArray(runs)) return "";
  return runs
    .map((run) => (run && typeof run === "object" && typeof (run as { text?: string }).text === "string" ? (run as { text: string }).text : ""))
    .join("")
    .trim();
}

function youtubeLiveChatToken(root: unknown): { token: string; isReplay: boolean } | null {
  const stack: unknown[] = [root];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) { stack.push(...current); continue; }
    const record = current as Record<string, unknown>;
    const renderer = record.liveChatRenderer as {
      isReplay?: boolean;
      continuations?: Array<Record<string, { continuation?: string } | undefined>>;
    } | undefined;
    if (renderer?.continuations?.length) {
      for (const cont of renderer.continuations) {
        for (const value of Object.values(cont)) {
          const token = value?.continuation;
          if (token) return { token, isReplay: Boolean(renderer.isReplay) };
        }
      }
    }
    for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
  }
  return null;
}

function youtubeChatMessages(root: unknown, limit: number): AdultComment[] {
  const out: AdultComment[] = [];
  const seen = new Set<string>();
  const stack: unknown[] = [root];
  while (stack.length && out.length < limit) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) { stack.push(...current); continue; }
    const record = current as Record<string, unknown>;
    const textRenderer = record.liveChatTextMessageRenderer as {
      id?: string;
      authorName?: { simpleText?: string };
      message?: { runs?: unknown };
      timestampUsec?: string;
    } | undefined;
    const paidRenderer = record.liveChatPaidMessageRenderer as {
      id?: string;
      authorName?: { simpleText?: string };
      message?: { runs?: unknown };
    } | undefined;
    const renderer = textRenderer ?? paidRenderer;
    if (renderer) {
      const body = youtubeRunsText(renderer.message?.runs).slice(0, 400);
      if (body) {
        const id = renderer.id || `ytchat${out.length}`;
        if (!seen.has(id)) {
          seen.add(id);
          out.push({
            id,
            author: renderer.authorName?.simpleText?.replace(/^@/, "") || undefined,
            body: paidRenderer && !textRenderer ? `[Super Chat] ${body}` : body,
            kind: "chat",
          });
        }
      }
    }
    // Prefer walking actions / nested chat items first for ordering, but a full
    // object walk still finds messages wherever Innertube nests them.
    for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
  }
  return out;
}

function youtubeChatNextToken(root: unknown, preferReplay: boolean): string | null {
  const stack: unknown[] = [root];
  while (stack.length) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) { stack.push(...current); continue; }
    const record = current as Record<string, unknown>;
    const replay = record.liveChatReplayContinuationData as { continuation?: string } | undefined;
    const timed = record.timedContinuationData as { continuation?: string } | undefined;
    const invalidation = record.invalidationContinuationData as { continuation?: string } | undefined;
    const reload = record.reloadContinuationData as { continuation?: string } | undefined;
    if (preferReplay && replay?.continuation) return replay.continuation;
    if (timed?.continuation) return timed.continuation;
    if (invalidation?.continuation) return invalidation.continuation;
    if (reload?.continuation) return reload.continuation;
    if (replay?.continuation) return replay.continuation;
    for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
  }
  return null;
}

async function fetchYoutubeChat(videoId: string, limit: number): Promise<{ comments: AdultComment[]; note: string }> {
  const id = videoId.replace(/^yt:/, "").slice(0, 11);
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
    return { comments: [], note: "Not a YouTube video id." };
  }
  try {
    const html = await fetchText(`https://www.youtube.com/watch?v=${encodeURIComponent(id)}`);
    const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
    const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
    if (!apiKey) return { comments: [], note: "YouTube Innertube key unavailable for chat." };

    const postJson = async (path: string, body: Record<string, unknown>) => {
      const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/${path}?key=${encodeURIComponent(apiKey)}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-youtube-client-name": "1",
          "x-youtube-client-version": clientVersion,
        },
        body: JSON.stringify({
          context: { client: { clientName: "WEB", clientVersion, hl: "en", gl: "US" } },
          ...body,
        }),
        timeoutMs: 15_000,
      });
      if (!response.ok) return null;
      return await response.json() as unknown;
    };

    let seed = youtubeLiveChatToken(youtubeInitialData(html));
    if (!seed) {
      const watch = await postJson("next", { videoId: id });
      if (watch) seed = youtubeLiveChatToken(watch);
    }
    if (!seed) {
      return { comments: [], note: "No public YouTube live chat / chat replay for this video." };
    }

    const endpoint = seed.isReplay ? "live_chat/get_live_chat_replay" : "live_chat/get_live_chat";
    const comments: AdultComment[] = [];
    const seen = new Set<string>();
    let continuation: string | null = seed.token;
    const maxPages = LIBRARY_LIMITS.youtubeChatMaxPages;

    for (let page = 0; page < maxPages && comments.length < limit && continuation; page += 1) {
      if (page > 0) await youtubeChatPageGap();
      const pageData = await postJson(endpoint, { continuation });
      if (!pageData) break;
      for (const row of youtubeChatMessages(pageData, limit - comments.length)) {
        if (seen.has(row.id)) continue;
        seen.add(row.id);
        comments.push(row);
      }
      const next = youtubeChatNextToken(pageData, seed.isReplay);
      continuation = next && next !== continuation ? next : null;
      // Live chat is a live poll — one page is enough for an on-demand snapshot.
      if (!seed.isReplay) break;
    }

    return {
      comments: comments.slice(0, limit),
      note: comments.length
        ? (seed.isReplay
          ? "YouTube chat replay via public Innertube (on-demand, not routine refresh)."
          : "YouTube live chat snapshot via public Innertube (on-demand, not live IRC scrape).")
        : "No public YouTube chat messages returned for this video.",
    };
  } catch (err) {
    return { comments: [], note: err instanceof Error ? err.message : "YouTube chat unavailable." };
  }
}

async function fetchTwitchVodComments(videoId: string, limit: number): Promise<{ comments: AdultComment[]; note: string }> {
  const id = videoId.replace(/^tw:v:/, "").replace(/^v/, "").trim();
  if (!/^\d+$/.test(id)) {
    return { comments: [], note: "Twitch clips do not expose VOD chat replay; open a VOD." };
  }
  try {
    const comments: AdultComment[] = [];
    const seen = new Set<string>();
    let cursor: string | null = null;
    let offset = 0;
    for (let page = 0; page < 6 && comments.length < limit; page += 1) {
      if (page > 0) await twitchPageGap();
      const variables = cursor
        ? { videoID: id, cursor }
        : { videoID: id, contentOffsetSeconds: offset };
      const res = await fetchProviderMetadata("https://gql.twitch.tv/gql", {
        method: "POST",
        headers: { "client-id": TWITCH_CLIENT_ID, "content-type": "application/json" },
        body: JSON.stringify([{
          operationName: "VideoCommentsByOffsetOrCursor",
          variables,
          extensions: {
            persistedQuery: {
              version: 1,
              sha256Hash: "b70a3591ff0f4e0313d126c6a1502d79a1c02baebb288227c582044aa76adf6a",
            },
          },
        }]),
        signal: AbortSignal.timeout(12_000),
      });
      if (!res.ok) {
        return { comments, note: comments.length ? "Partial Twitch VOD chat (rate limited)." : `Twitch VOD chat HTTP ${res.status}.` };
      }
      const json = await res.json() as Array<{
        data?: {
          video?: {
            comments?: {
              pageInfo?: { hasNextPage?: boolean };
              edges?: Array<{
                cursor?: string;
                node?: {
                  id?: string;
                  commenter?: { displayName?: string; login?: string } | null;
                  message?: { fragments?: Array<{ text?: string | null }> };
                };
              }>;
            } | null;
          } | null;
        };
      }>;
      const connection = json?.[0]?.data?.video?.comments;
      if (!connection?.edges?.length) break;
      for (const edge of connection.edges) {
        const node = edge.node;
        if (!node?.id || seen.has(node.id)) continue;
        const body = (node.message?.fragments ?? []).map((fragment) => fragment.text ?? "").join("").trim().slice(0, 400);
        if (!body) continue;
        seen.add(node.id);
        comments.push({
          id: node.id,
          author: node.commenter?.displayName || node.commenter?.login || undefined,
          body,
        });
        if (comments.length >= limit) break;
      }
      if (!connection.pageInfo?.hasNextPage) break;
      cursor = connection.edges.at(-1)?.cursor ?? null;
      if (!cursor) break;
    }
    return {
      comments: comments.slice(0, limit),
      note: comments.length
        ? "Twitch VOD chat replay via public GQL (on-demand; not live IRC scrape)."
        : "No public Twitch VOD chat returned for this video.",
    };
  } catch (err) {
    return { comments: [], note: err instanceof Error ? err.message : "Twitch comments unavailable." };
  }
}

async function fetchRedditComments(videoId: string, watchUrl: string): Promise<{ comments: AdultComment[]; note: string }> {
  const id = videoId.replace(/^t3_/, "");
  const canonical = `https://www.reddit.com/comments/${encodeURIComponent(id)}.rss?limit=40`;
  const oldCanonical = `https://old.reddit.com/comments/${encodeURIComponent(id)}.rss?limit=40`;
  const permalink = watchUrl.match(/^https:\/\/www\.reddit\.com\/r\/[^/]+\/comments\/[a-z0-9]+/i)?.[0];
  const oldPermalink = permalink?.replace(/^https:\/\/www\.reddit\.com/i, "https://old.reddit.com");
  const publicPost = permalink ?? `https://www.reddit.com/comments/${encodeURIComponent(id)}`;
  const oldPost = oldPermalink ?? `https://old.reddit.com/comments/${encodeURIComponent(id)}`;
  // A bounded route ladder keeps an unavailable discussion from holding the
  // player open for a minute: Atom primary, then two public JSON variants,
  // then old-Reddit Atom as a final independent cache path.
  const urls: Array<{ url: string; format: "rss" | "json" }> = [
    { url: permalink ? `${publicPost}.rss?limit=40` : canonical, format: "rss" },
    { url: `${publicPost}.json?limit=40&raw_json=1`, format: "json" },
    { url: `${oldPost}.json?limit=40&raw_json=1`, format: "json" },
    { url: oldCanonical, format: "rss" },
  ];
  let lastStatus = 0;
  let sawPublicResponse = false;
  for (const endpoint of urls) {
    const res = await cachedAdultFetch(endpoint.url, {
      signal: AbortSignal.timeout(8_000),
      cacheTtlMs: 15 * 60_000,
      cacheKey: `GET:reddit-comments:${endpoint.url}`,
      headers: {
        accept: endpoint.format === "json" ? "application/json, text/javascript;q=0.9, */*;q=0.8" : "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8",
        "user-agent": "web:reelcase:1.0 (public comment viewer)",
      },
    });
    lastStatus = res.status;
    if (res.status === 429) continue;
    if (!res.ok) continue;
    sawPublicResponse = true;
    const body = await res.text();
    let comments: AdultComment[] = [];
    if (endpoint.format === "rss") comments = parseRedditCommentEntries(body);
    else {
      try { comments = parseRedditCommentJson(JSON.parse(body)); }
      catch { continue; }
    }
    if (comments.length) return { comments, note: endpoint.format === "rss" ? "Live Reddit comments via public Atom RSS." : "Live Reddit comments via the public post listing." };
  }
  if (sawPublicResponse) return { comments: [], note: "No public comments returned for this post." };
  return { comments: [], note: lastStatus === 429 ? "Reddit comment requests are rate-limited — try again later." : `Reddit comments unavailable (HTTP ${lastStatus || "network"}).` };
}

export async function runFetchAdultComments(dataRaw: unknown): Promise<{ comments: AdultComment[]; note: string }> {
  const data = (() => {
    const data = dataRaw;
    const rec = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
    return {
      kind: asString(rec.kind).trim(),
      videoId: asString(rec.videoId).trim(),
      watchUrl: asString(rec.watchUrl).trim(),
    };
  })();
  if (!data.videoId) {
    return { comments: [], note: "Missing video id for comments." };
  }
  if (data.kind === "reddit") {
    try {
      return await fetchRedditComments(data.videoId, data.watchUrl);
    } catch (err) {
      return { comments: [], note: err instanceof Error ? err.message : "Comments unavailable." };
    }
  }
  if (data.kind === "youtube") {
    const [threads, chat] = await Promise.all([
      fetchYoutubeComments(data.videoId, LIBRARY_LIMITS.youtubeCommentsPerPull),
      fetchYoutubeChat(data.videoId, LIBRARY_LIMITS.youtubeChatPerPull),
    ]);
    const comments = [
      ...chat.comments,
      ...threads.comments.map((row) => ({ ...row, kind: row.kind ?? ("comment" as const) })),
    ];
    const notes = [chat.note, threads.note].filter((note) => note && !note.startsWith("No public"));
    const fallback = comments.length
      ? "YouTube chat + comments via public Innertube (on-demand)."
      : (chat.note.includes("No public YouTube live chat") && threads.note.includes("No public YouTube comment")
        ? "No public YouTube chat or comments for this video."
        : [chat.note, threads.note].filter(Boolean).join(" · "));
    return {
      comments,
      note: notes.length ? notes.join(" · ") : fallback,
    };
  }
  if (data.kind === "twitch") {
    return fetchTwitchVodComments(data.videoId, LIBRARY_LIMITS.twitchCommentsPerPull);
  }
  return { comments: [], note: "This provider does not expose a public comment feed." };
}


export async function runSearchRedtubeStars(dataRaw: unknown): Promise<{ stars: { name: string; thumb?: string; url?: string }[]; note: string }> {
    const data = (() => {
    const data = dataRaw;
    const rec = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
    const page = Number(rec.page);
    return {
      query: asString(rec.query).trim(),
      page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
    };
  })();
    const params = new URLSearchParams({
      data: "redtube.Stars.getStarDetailedList",
      output: "json",
      page: String(data.page),
    });
    const url = `https://api.redtube.com/?${params.toString()}`;
    const res = await cachedAdultFetch(url, {
      signal: AbortSignal.timeout(20000),
      cacheTtlMs: 30 * 60_000,
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (compatible; Realhub/1.0; +https://grok.x.ai)",
      },
    });
    if (!res.ok) throw new Error(`RedTube star API HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
    const json = (await res.json()) as { stars?: unknown[]; message?: string; code?: number };
    if (json.message && json.code) throw new Error(json.message);
    const stars: { name: string; thumb?: string; url?: string }[] = [];
    for (const row of json.stars ?? []) {
      if (!row || typeof row !== "object") continue;
      const rec = row as Record<string, unknown>;
      const inner = (rec.star && typeof rec.star === "object" ? rec.star : rec) as Record<string, unknown>;
      const name = asString(inner.star_name) || asString(inner.star) || asString(rec.star_name);
      const clean = name.trim();
      if (!clean) continue;
      stars.push({
        name: clean,
        thumb: asString(inner.star_thumb) || asString(inner.thumb) || undefined,
        url: asString(inner.star_url) || asString(inner.url) || undefined,
      });
    }
    const needle = data.query.toLowerCase();
    const filtered = needle ? stars.filter((star) => star.name.toLowerCase().includes(needle)) : stars;
    return {
      stars: filtered.slice(0, LIBRARY_LIMITS.redtubeStarsPerPage),
      note: filtered.length ? "Official RedTube star list." : "No matching RedTube creators on this page.",
    };
}
