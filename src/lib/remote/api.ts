import { createServerFn } from "@tanstack/react-start";
import type { FollowedChannel, FollowKind, LibraryVideo } from "@/lib/videos/types";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import { cachedAdultFetch } from "@/lib/remote/adult-pull-cache";
import {
  ADULT_DEEPEN_FETISH_QUERIES,
  ADULT_PULL_PROVIDERS,
  CAMSODA_FOLDER_ID,
  CHATURBATE_FOLDER_ID,
  EPORNER_FOLDER_ID,
  MYFREECAMS_FOLDER_ID,
  REDDIT_FOLDER_ID,
  BOORU_FOLDER_ID,
  REDGIFS_FOLDER_ID,
  REDTUBE_FOLDER_ID,
  ADULT_REDDIT_SUBS,
  type AdultPullProvider,
} from "@/lib/videos/adult-sites";
import { extractRedditMedia, shouldKeepRedditEntry } from "@/lib/videos/adult-reddit-media";
import { pickRedtubeThumb, redtubeStarNames } from "@/lib/videos/adult-thumbs";

type FollowInput = { query: string; kind: "auto" | FollowKind };
type RefreshInput = { channels: FollowedChannel[] };

export type FollowResult = {
  channel: FollowedChannel;
  videos: LibraryVideo[];
};

export type RefreshResult = {
  videos: LibraryVideo[];
  channels: FollowedChannel[];
  refreshedIds: string[];
  /** Exact next eligible time for a provider/channel cooling down after failures. */
  retryAt: Record<string, number>;
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

/** Share identical work across browser tabs and suppress only background retries. */
async function providerRequest<T>(provider: ProviderName, handle: string, focused: boolean, work: () => Promise<T>): Promise<T> {
  const key = providerKey(provider, handle);
  const cooling = providerFailures.get(key);
  if (!focused && cooling && cooling.retryAt > Date.now()) {
    throw new Error(`${provider} is retrying after ${new Date(cooling.retryAt).toLocaleTimeString()}`);
  }
  const existing = providerInflight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const pending = work().then((result) => {
    providerFailures.delete(key);
    return result;
  }).catch((error) => {
    const previous = providerFailures.get(key);
    const attempts = Math.min(8, (previous?.attempts ?? 0) + 1);
    // 15s → 30s → … → 5m keeps a failing provider from pinning six workers.
    providerFailures.set(key, { attempts, retryAt: Date.now() + Math.min(300_000, 15_000 * 2 ** (attempts - 1)) });
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
  return { query, kind };
}

function parseRefresh(data: unknown): RefreshInput {
  if (typeof data !== "object" || data === null) return { channels: [] };
  const rec = data as Record<string, unknown>;
  const channels = Array.isArray(rec.channels) ? (rec.channels as FollowedChannel[]) : [];
  // Keep a sizeable saved list live after restore; the refresh worker remains
  // concurrency-limited below so this does not flood providers.
  return { channels: channels.slice(0, 80) };
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
  const rss = text.match(/channel_id=([A-Za-z0-9_-]{16,})/);
  if (rss) return rss[1];
  const json = text.match(/"channelId":"(UC[A-Za-z0-9_-]{20,})"/);
  if (json) return json[1];
  const canon = text.match(/youtube\.com\/channel\/(UC[A-Za-z0-9_-]{20,})/);
  return canon ? canon[1] : null;
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

async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(12000),
    headers: {
      "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai) AppleWebKit/537.36",
      accept: "text/html,application/xhtml+xml,application/xml,application/json",
    },
  });
  if (!res.ok) throw new Error(`Could not reach ${url}`);
  return res.text();
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
}): LibraryVideo {
  const published = Date.parse(entry.published) || Date.now();
  return {
    id: `yt:${entry.id}`,
    folderId: `yt:${entry.channelId}`,
    name: entry.title,
    path: `youtube/${entry.channelName}/${entry.title}`,
    extension: "yt",
    mime: "video/youtube",
    size: 0,
    duration: entry.duration,
    addedAt: published,
    tagline: entry.desc.slice(0, 180),
    description: entry.desc.slice(0, 4_000),
    poster: entry.thumb || `https://i.ytimg.com/vi/${entry.id}/hqdefault.jpg`,
    src: `https://www.youtube.com/embed/${entry.id}`,
    remote: {
      kind: "youtube",
      videoId: entry.id,
      channelId: entry.channelId,
      channelName: entry.channelName,
      live: entry.live,
      views: entry.views,
      embedUrl: `https://www.youtube.com/embed/${entry.id}`,
      watchUrl: `https://www.youtube.com/watch?v=${entry.id}`,
      previewUrl: `https://i.ytimg.com/an_webp/${entry.id}/mqdefault_6s.webp`,
    },
  };
}

type YoutubeRenderer = {
  videoId?: string;
  title?: { simpleText?: string; runs?: Array<{ text?: string }> };
  viewCountText?: { simpleText?: string; runs?: Array<{ text?: string }> };
  descriptionSnippet?: { simpleText?: string; runs?: Array<{ text?: string }> };
};

// A deep channel fetch is expensive public metadata work. Keep a short bounded
// server cache so opening a creator, refreshing its shelf, and retrying an
// embed do not fan out into identical page reads.
const YOUTUBE_CHANNEL_CACHE_TTL_MS = 4 * 60_000;
const YOUTUBE_CHANNEL_CACHE_LIMIT = 64;
const youtubeChannelCache = new Map<string, { at: number; result: FollowResult }>();

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

function youtubeInitialData(html: string): unknown | null {
  const match = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
  if (!match?.[1]) return null;
  try {
    return JSON.parse(match[1]) as unknown;
  } catch { return null; }
}

function youtubeRenderers(root: unknown, maximum: number): YoutubeRenderer[] {
  const found: YoutubeRenderer[] = [];
  const stack: unknown[] = [root];
  while (stack.length && found.length < maximum) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) { stack.push(...current); continue; }
    const record = current as Record<string, unknown>;
    const renderer = record.videoRenderer as YoutubeRenderer | undefined;
    if (renderer?.videoId) found.push(renderer);
    for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
  }
  return found;
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
    if (Array.isArray(current)) { stack.push(...current); continue; }
    const record = current as Record<string, unknown>;
    const command = record.continuationCommand;
    if (command && typeof command === "object" && typeof (command as Record<string, unknown>).token === "string") return (command as Record<string, string>).token;
    for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
  }
  return null;
}

function youtubeBrowseConfig(html: string, root: unknown) {
  const apiKey = html.match(/"INNERTUBE_API_KEY":"([^"]+)"/)?.[1];
  const clientVersion = html.match(/"INNERTUBE_CLIENT_VERSION":"([^"]+)"/)?.[1] ?? "2.20250101.00.00";
  const continuation = youtubeContinuation(root);
  return apiKey && continuation ? { apiKey, clientVersion, continuation } : null;
}

async function youtubeContinuationBackfill(html: string, knownIds: Set<string>, channelId: string, channelName: string, limit: number): Promise<LibraryVideo[]> {
  const root = youtubeInitialData(html);
  const config = root ? youtubeBrowseConfig(html, root) : null;
  if (!config || limit <= 0) return [];
  const seen = new Set(knownIds);
  const videos: LibraryVideo[] = [];
  let continuation: string | null = config.continuation;
  for (let page = 0; continuation && page < LIBRARY_LIMITS.youtubeArchivePagesPerPull && videos.length < limit; page += 1) {
    try {
      const response = await fetch(`https://www.youtube.com/youtubei/v1/browse?key=${encodeURIComponent(config.apiKey)}`, {
        method: "POST",
        headers: { "content-type": "application/json", "x-youtube-client-name": "1", "x-youtube-client-version": config.clientVersion },
        body: JSON.stringify({ context: { client: { clientName: "WEB", clientVersion: config.clientVersion } }, continuation }),
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) break;
      const pageData = await response.json() as unknown;
      for (const renderer of youtubeRenderers(pageData, limit - videos.length)) {
        const id = renderer.videoId;
        if (!id || seen.has(id)) continue;
        seen.add(id);
        videos.push(ytVideo({ id, title: rendererText(renderer.title) || `${channelName} video`, published: "1970-01-01T00:00:00.000Z", thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, desc: rendererText(renderer.descriptionSnippet) || `${channelName} public channel catalog item.`, channelId, channelName, views: parsePublicViewCount(rendererText(renderer.viewCountText)) }));
      }
      const next = youtubeContinuation(pageData);
      continuation = next && next !== continuation ? next : null;
    } catch { break; }
  }
  return videos;
}

async function youtubeChannelBackfill(channelId: string, channelName: string, knownIds: Set<string>, limit: number): Promise<LibraryVideo[]> {
  try {
    const html = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`);
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

async function youtubeFromVideo(id: string): Promise<FollowResult> {
  const oembed = await fetch(
    `https://www.youtube.com/oembed?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}&format=json`,
    { signal: AbortSignal.timeout(12000) },
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
    published: new Date().toISOString(),
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

async function youtubeLiveFromChannel(channelId: string, channelName: string): Promise<LibraryVideo | null> {
  try {
    // /live can include upcoming broadcasts. "isLiveContent" alone is not
    // enough: require the page's actual live-now state so scheduled streams do
    // not leak into the Live shelf.
    const html = await fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/live`);
    const match = html.match(/"videoId":"([A-Za-z0-9_-]{11})"[\s\S]{0,3200}?"isLiveNow":true/)
      ?? html.match(/"isLiveNow":true[\s\S]{0,3200}?"videoId":"([A-Za-z0-9_-]{11})"/);
    if (!match?.[1]) return null;
    const id = match[1];
    const windowStart = Math.max(0, (match.index ?? 0) - 1_200);
    const liveWindow = html.slice(windowStart, (match.index ?? 0) + 4_000);
    const watchingText = liveWindow.match(/"viewCountText":\{"simpleText":"([^"]+)"/)?.[1]
      ?? liveWindow.match(/"viewCountText":\{"runs":\[\{"text":"([^"]+)"/)?.[1]
      ?? "";
    const video = ytVideo({ id, title: `${channelName} live`, published: new Date().toISOString(), thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, desc: `${channelName} is live on YouTube.`, channelId, channelName, live: true, views: parsePublicViewCount(watchingText) });
    if (video.remote) video.remote.viewers = video.remote.views;
    video.tagline = `${channelName} is live now`;
    return video;
  } catch {
    return null;
  }
}

function boundedFollowResult(result: FollowResult, limit: number): FollowResult {
  const live = result.videos.filter((video) => video.remote?.live);
  const catalog = result.videos.filter((video) => !video.remote?.live).slice(0, limit);
  const videos = [...live, ...catalog];
  return { ...result, channel: { ...result.channel, lastResponseCount: videos.length }, videos };
}

async function youtubeFromChannelUncoalesced(query: string, limit: number = LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, deepCatalog = true): Promise<FollowResult> {
  let channelId = "";
  const trimmed = query.trim();
  if (/^UC[\w-]{20,}$/.test(trimmed)) channelId = trimmed;
  const asUrl = query.startsWith("http") ? query : "";
  if (asUrl.includes("/channel/")) {
    channelId = asUrl.split("/channel/")[1]?.split(/[/?#]/)[0] ?? "";
  }
  if (!channelId) {
    const handle = ytHandle(query) ?? query.replace(/^@/, "");
    const page = `https://www.youtube.com/@${encodeURIComponent(handle)}`;
    const html = await fetchText(page);
    channelId = ytChannelIdFromText(html) ?? "";
    if (!channelId) throw new Error("Could not find that YouTube channel.");
  }
  const boundedLimit = Math.max(24, Math.min(LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, Math.floor(limit)));
  const cached = youtubeChannelCache.get(channelId);
  if (cached && Date.now() - cached.at < YOUTUBE_CHANNEL_CACHE_TTL_MS && cached.result.videos.length >= Math.min(144, boundedLimit)) return boundedFollowResult(cached.result, boundedLimit);
  const [xml, channelPage] = await Promise.all([
    fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`),
    deepCatalog ? fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`).catch(() => "") : Promise.resolve(""),
  ]);
  const title = tag(xml, "title") || "YouTube";
  const author = tag(xml, "name") || title;
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, boundedLimit);

  const videos = entries.map((m) => {
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
  const feedIds = new Set(videos.map((video) => video.remote?.videoId).filter((id): id is string => Boolean(id)));
  const backfill = deepCatalog && channelPage ? await (async () => {
    const seen = new Set(feedIds);
    const rows: LibraryVideo[] = [];
    for (const renderer of channelPageRenderers(channelPage)) {
      const id = renderer.videoId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      rows.push(ytVideo({ id, title: rendererText(renderer.title) || `${author} video`, published: "1970-01-01T00:00:00.000Z", thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, desc: rendererText(renderer.descriptionSnippet) || `${author} public channel catalog item.`, channelId, channelName: author, views: parsePublicViewCount(rendererText(renderer.viewCountText)) }));
      if (rows.length >= Math.max(0, boundedLimit - videos.length)) break;
    }
    if (rows.length < Math.max(0, boundedLimit - videos.length)) {
      rows.push(...await youtubeContinuationBackfill(channelPage, new Set([...feedIds, ...rows.map((video) => video.remote?.videoId).filter((id): id is string => Boolean(id))]), channelId, author, Math.max(0, boundedLimit - videos.length - rows.length)));
    }
    return rows;
  })() : deepCatalog ? await youtubeChannelBackfill(channelId, author, feedIds, Math.max(0, boundedLimit - videos.length)) : [];
  videos.push(...backfill);
  const live = await youtubeLiveFromChannel(channelId, author);
  if (live && !videos.some((video) => video.id === live.id)) videos.unshift(live);
  const channel: FollowedChannel = {
    id: `yt:${channelId}`,
    kind: "youtube",
    handle: author,
    title: author,
    channelId,
    lastCheckedAt: Date.now(),
    newestPublishedAt: Math.max(0, ...videos.filter((video) => !video.remote?.live).map((video) => video.addedAt)),
    lastResponseCount: videos.length,
  };
  const result = { channel, videos };
  youtubeChannelCache.set(channelId, { at: Date.now(), result });
  while (youtubeChannelCache.size > YOUTUBE_CHANNEL_CACHE_LIMIT) youtubeChannelCache.delete(youtubeChannelCache.keys().next().value!);
  return boundedFollowResult(result, boundedLimit);
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

function youtubeFromChannel(query: string, limit: number = LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, focused = true, deepCatalog = focused): Promise<FollowResult> {
  return providerRequest("youtube", query, focused, () => youtubeFromChannelUncoalesced(query, limit, deepCatalog));
}

type GqlUser = {
  displayName?: string;
  id?: string;
  profileImageURL?: string;
  stream?: {
    title?: string;
    viewersCount?: number;
    previewImageURL?: string;
    game?: { name?: string };
  } | null;
  videos?: {
    pageInfo?: {
      hasNextPage?: boolean;
      endCursor?: string | null;
    };
    edges?: Array<{
      cursor?: string | null;
      node?: {
        id?: string;
        title?: string;
        description?: string;
        lengthSeconds?: number;
        previewThumbnailURL?: string;
        publishedAt?: string;
        game?: { name?: string };
      };
    }>;
  };
};

// Twitch accepts a 160-row initial archive window without its web-client
// integrity proof. Keep that established baseline; deeper cursor pages are
// attempted only for focused pulls and fall back to this window if challenged.
const TWITCH_ARCHIVE_PAGE_SIZE = LIBRARY_LIMITS.twitchArchivePageSize;
const TWITCH_FOCUSED_VOD_LIMIT = LIBRARY_LIMITS.twitchFocusedVodsPerChannel;
const TWITCH_REFRESH_VOD_LIMIT = LIBRARY_LIMITS.twitchRoutineVodsPerChannel;

async function twitchUser(login: string, after?: string | null, archivePageSize: number = TWITCH_ARCHIVE_PAGE_SIZE): Promise<GqlUser | null> {
  const res = await fetch("https://gql.twitch.tv/gql", {
    signal: AbortSignal.timeout(12000),
    method: "POST",
    headers: {
      "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `query($login:String!,$after:Cursor,$first:Int!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}} videos(first:$first,type:ARCHIVE,after:$after){pageInfo{hasNextPage endCursor} edges{cursor node{id title description lengthSeconds publishedAt previewThumbnailURL(width:640,height:360) game{name}}}}}}`,
      variables: { login, after: after ?? null, first: archivePageSize },
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { user?: GqlUser | null } };
  return json.data?.user ?? null;
}

/**
 * Twitch exposes archives as a cursor connection. Reading only its first page
 * made a busy creator look as though they had about 160 VODs, and a later
 * focused refresh then overwrote the locally retained history with that page.
 * Deep reads are reserved for a user-initiated channel pull; rotating live
 * refreshes intentionally keep their small first-page window.
 */
async function twitchArchive(login: string, limit: number): Promise<GqlUser | null> {
  let after: string | null | undefined;
  let first: GqlUser | null = null;
  const edges: NonNullable<NonNullable<GqlUser["videos"]>["edges"]> = [];
  const seen = new Set<string>();

  while (edges.length < limit) {
    const page = await twitchUser(login, after, Math.min(TWITCH_ARCHIVE_PAGE_SIZE, limit - edges.length));
    if (!page) return first;
    if (!first) first = page;
    for (const edge of page.videos?.edges ?? []) {
      const id = edge.node?.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      edges.push(edge);
      if (edges.length >= limit) break;
    }
    const pageInfo = page.videos?.pageInfo;
    // Twitch's public connection currently reports a null `endCursor` even
    // when there is another page. Its final edge carries the usable cursor.
    const nextCursor = pageInfo?.endCursor ?? page.videos?.edges?.at(-1)?.cursor;
    if (!pageInfo?.hasNextPage || !nextCursor || nextCursor === after) break;
    after = nextCursor;
  }

  if (!first) return null;
  return { ...first, videos: { edges } };
}

// Keep a useful VOD window per channel. The public query asks for 160 rows;
// retaining 96 gives large follow lists enough history without sending the
// entire archive through every rotating background refresh.
function twitchVideos(login: string, user: GqlUser, vodLimit: number = TWITCH_ARCHIVE_PAGE_SIZE): LibraryVideo[] {
  const title = user.displayName ?? login;
  const folderId = `tw:${login}`;
  // One observation timestamp is shared by all facts in this provider reply.
  // It lets the client reject a delayed response without guessing from card age.
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
    // Public Twitch rows occasionally contain zero or corrupt durations. Keep
    // an unknown duration unknown rather than turning it into a fake short clip.
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
      description: node.description?.slice(0, 4_000),
      remote: {
        kind: "twitch",
        videoId: node.id,
        channelName: title,
        live: false,
        observedAt,
        embedUrl: `https://player.twitch.tv/?video=${encodeURIComponent(node.id)}&autoplay=true`,
        watchUrl: `https://www.twitch.tv/videos/${node.id}`,
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

async function followTwitchUncoalesced(query: string, compact = false): Promise<FollowResult> {
  const login = twitchLogin(query);
  if (!login) throw new Error("Enter a Twitch channel.");
  const user = await twitchArchive(login, compact ? TWITCH_REFRESH_VOD_LIMIT : TWITCH_FOCUSED_VOD_LIMIT);
  // Do not manufacture an offline placeholder for an account that Twitch did
  // not resolve. It looks like a successful follow and causes repeated cards.
  if (!user?.id) throw new Error(`Twitch could not resolve ${login}`);
  const title = user.displayName ?? login;
  // Bulk import previously kept only 12 rows, which made healthy channels look
  // empty until each one happened to receive a later focused refresh.
  const videos = twitchVideos(login, user, compact ? TWITCH_REFRESH_VOD_LIMIT : TWITCH_FOCUSED_VOD_LIMIT);
  const channel: FollowedChannel = {
    id: `tw:${login}`,
    kind: "twitch",
    handle: login,
    title,
    channelId: user?.id,
    thumb: user?.profileImageURL,
    live: Boolean(user?.stream),
    lastCheckedAt: Date.now(),
    newestPublishedAt: Math.max(0, ...videos.filter((video) => !video.remote?.live).map((video) => video.addedAt)),
    lastResponseCount: videos.length,
  };
  return { channel, videos };
}

function followTwitch(query: string, compact = false): Promise<FollowResult> {
  return providerRequest("twitch", query, !compact, () => followTwitchUncoalesced(query, compact));
}

export const followRemote = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseFollow(data))
  .handler(async ({ data }): Promise<FollowResult> => {
    const kind = data.kind === "auto" ? guessKind(data.query) : data.kind;
    if (kind === "twitch") return followTwitch(data.query);
    const videoId = ytVideoId(data.query);
    if (videoId) return youtubeFromVideo(videoId);
    return youtubeFromChannel(data.query);
  });

export const refreshRemotes = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseRefresh(data))
  .handler(async ({ data }): Promise<RefreshResult> => {
    const videos: LibraryVideo[] = [];
    const channels: FollowedChannel[] = [];
    const refreshedIds: string[] = [];
    await mapPool(data.channels, 6, async (ch) => {
      try {
        if (ch.kind === "twitch") {
          // A rotating refresh is for current live state and new VODs. Keep it
          // shallow so it cannot turn one scheduled refresh into thousands of
          // provider requests; the merge path preserves older archive cards.
          const next = await followTwitch(ch.handle, true);
          channels.push({ ...ch, ...next.channel, id: ch.id });
          videos.push(...next.videos.map((video) => ({ ...video, folderId: ch.id })));
        } else {
          const q = ch.channelId ? `https://www.youtube.com/channel/${ch.channelId}` : ch.handle;
          // RSS only exposes a short recent window. Include the public channel
          // catalog so a routine refresh can backfill older uploads up to the
          // configured per-channel budget; server coalescing/cache protects
          // repeated refreshes from duplicating this work.
          const next = await youtubeFromChannel(q, LIBRARY_LIMITS.youtubeRoutineVideosPerChannel, false, true);
          channels.push({ ...ch, ...next.channel, id: ch.id });
          videos.push(...next.videos.map((video) => ({ ...video, folderId: ch.id })));
        }
        refreshedIds.push(ch.id);
      } catch {
        channels.push(ch);
      }
    });
    const retryAt = Object.fromEntries(data.channels.flatMap((channel) => {
      const retry = retryAtFor(channel.kind, channel.handle);
      return retry ? [[channel.id, retry]] : [];
    }));
    return { videos, channels, refreshedIds, retryAt };
  });

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
};

export const importChannels = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseImport(data))
  .handler(async ({ data }): Promise<ImportBatchResult> => {
    const compact = data.items.length > 1;
    const rows = await mapPool(data.items, 6, async (item) => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          if (item.kind === "twitch") return await followTwitch(item.query, compact);
          // Bulk imports used to request only eight entries per creator, which
          // made a healthy library look arbitrarily capped. RSS availability
          // ultimately controls the ceiling, but ask for a practical window.
          return await youtubeFromChannel(item.query, compact ? LIBRARY_LIMITS.youtubeBulkImportVideosPerChannel : LIBRARY_LIMITS.youtubeFocusedVideosPerChannel, true, !compact);
        } catch {
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
    return { ok, failed: failedQueries.length, failedQueries: failedQueries.filter(Boolean) };
  });

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
  const res = await fetch("https://gql.twitch.tv/gql", {
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

export const fetchTwitchFollowing = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseTwitchUser(data))
  .handler(async ({ data }): Promise<{ channels: FollowList[]; privateList: boolean }> => {
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
  });

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

function parseAdultSearch(data: unknown): Required<AdultSearchIn> & { providers: AdultPullProvider[] } {
  const rec = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
  const query = asString(rec.query).trim() || "all";
  const orderRaw = asString(rec.order).trim() || "top-weekly";
  const order = EPORNER_ORDERS.has(orderRaw) ? orderRaw : "top-weekly";
  const pageNum = typeof rec.page === "number" ? rec.page : Number(rec.page);
  const page = Number.isFinite(pageNum) && pageNum >= 1 ? Math.min(Math.floor(pageNum), 100000) : 1;
  const maxRaw = typeof rec.maxVideos === "number" ? rec.maxVideos : Number(rec.maxVideos);
  const maxVideos = Number.isFinite(maxRaw) && maxRaw > 0
    ? Math.min(Math.floor(maxRaw), LIBRARY_LIMITS.epornerVideosPerPull)
    : LIBRARY_LIMITS.epornerVideosPerPull;
  const append = Boolean(rec.append);
  return {
    query: query.slice(0, 80),
    order,
    page,
    maxVideos,
    append,
    providers: parseAdultProviders(rec.providers),
    providerPages: parseProviderPages(rec.providerPages),
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
  const thumb = asString(row.default_thumb?.src);
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
      previewUrl: thumb || undefined,
    },
  };
}

async function fetchEpornerPage(query: string, order: string, page: number, perPage: number): Promise<{
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
    signal: AbortSignal.timeout(20000),
    cacheTtlMs: 12 * 60_000,
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
    },
  });
  if (!res.ok) throw new Error("Eporner search is unavailable right now.");
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
    thumbsize: "medium",
    page: String(page),
    ordering,
  });
  if (period) params.set("period", period);
  const q = query.trim();
  if (q && q.toLowerCase() !== "all") params.set("search", q);
  const url = `https://api.redtube.com/?${params.toString()}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(20000),
    cacheTtlMs: 12 * 60_000,
    headers: {
      accept: "application/json",
      "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
    },
  });
  if (!res.ok) throw new Error("RedTube search is unavailable right now.");
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

let chaturbateCache: { at: number; rooms: LibraryVideo[] } | null = null;
const CHATURBATE_CACHE_MS = 3 * 60_000;

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
  const thumb = asString(row.image_url_360x270) || asString(row.image_url);
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
    },
  };
}

async function fetchChaturbateRooms(query: string, maxVideos: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  if (!chaturbateCache || Date.now() - chaturbateCache.at > CHATURBATE_CACHE_MS) {
    const url = "https://chaturbate.com/affiliates/api/onlinerooms/?format=json&wm=DkfRj";
    const res = await cachedAdultFetch(url, {
      signal: AbortSignal.timeout(25000),
      cacheTtlMs: 3 * 60_000,
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
      },
    });
    if (!res.ok) throw new Error("Chaturbate rooms are unavailable right now.");
    const json = (await res.json()) as ChaturbateRoom[];
    const rooms = (Array.isArray(json) ? json : [])
      .map(chaturbateVideo)
      .filter((video): video is LibraryVideo => video != null);
    chaturbateCache = { at: Date.now(), rooms };
  }
  const needle = query.trim().toLowerCase();
  const filtered =
    !needle || needle === "all"
      ? chaturbateCache.rooms
      : chaturbateCache.rooms.filter((video) => {
          const hay = `${video.name} ${video.description ?? ""} ${video.remote?.videoId ?? ""}`.toLowerCase();
          return hay.includes(needle);
        });
  return {
    videos: filtered.slice(0, maxVideos),
    totalPages: 1,
    totalCount: filtered.length,
  };
}


const CAMSODA_TPL = [
  "user_id",
  "username",
  "display_name",
  "status",
  "connections",
  "sort_value",
  "subject_html",
  "stream_name",
  "gender",
  "edge_servers",
  "thumb",
  "pvt_rating",
  "bitrate",
  "control_her",
  "standby",
  "offline_picture",
] as const;

function asTplMap(tpl: unknown): Record<string, unknown> {
  if (Array.isArray(tpl)) return Object.fromEntries(tpl.map((value, index) => [String(index), value]));
  if (tpl && typeof tpl === "object") return tpl as Record<string, unknown>;
  return {};
}

function camsodaValue(tpl: Record<string, unknown>, field: (typeof CAMSODA_TPL)[number]) {
  return tpl[String(CAMSODA_TPL.indexOf(field))];
}

function stripMarkup(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function camsodaVideo(row: { tpl?: unknown }): LibraryVideo | null {
  const tpl = asTplMap(row.tpl);
  const username = asString(camsodaValue(tpl, "username")).trim().toLowerCase();
  if (!username || !/^[a-z0-9_-]+$/.test(username)) return null;
  const status = asString(camsodaValue(tpl, "status")).trim().toLowerCase();
  if (status && /private|offline|away|hidden/.test(status)) return null;
  const display = asString(camsodaValue(tpl, "display_name")).trim() || username;
  const subject = stripMarkup(asString(camsodaValue(tpl, "subject_html")));
  if (adultBlockedText(username, display, subject)) return null;
  const thumb = asString(camsodaValue(tpl, "thumb")).trim();
  const connections = camsodaValue(tpl, "connections");
  const viewers = typeof connections === "number" && Number.isFinite(connections) ? connections : undefined;
  const watch = `https://www.camsoda.com/${encodeURIComponent(username)}`;
  return {
    id: `camsoda:${username}`,
    folderId: CAMSODA_FOLDER_ID,
    name: display,
    path: `camsoda/${username}`,
    extension: "camsoda",
    mime: "video/camsoda",
    size: 0,
    addedAt: Date.now(),
    tagline: subject.slice(0, 160) || "Live on CamSoda",
    description: ["live", "cam", subject].filter(Boolean).join(", ") || undefined,
    poster: thumb || undefined,
    src: watch,
    remote: {
      kind: "camsoda",
      videoId: username,
      channelName: display,
      live: true,
      viewers,
      observedAt: Date.now(),
      embedUrl: watch,
      watchUrl: watch,
      previewUrl: thumb || undefined,
    },
  };
}

let camsodaCache: { at: number; rooms: LibraryVideo[] } | null = null;
const CAMSODA_CACHE_MS = 3 * 60_000;

async function fetchCamSodaRooms(query: string, maxVideos: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  if (!camsodaCache || Date.now() - camsodaCache.at > CAMSODA_CACHE_MS) {
    const res = await cachedAdultFetch("https://www.camsoda.com/api/v1/browse/online", {
      cacheTtlMs: 3 * 60_000,
      signal: AbortSignal.timeout(25000),
      headers: {
        accept: "application/json",
        "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
      },
    });
    if (!res.ok) throw new Error("CamSoda rooms are unavailable right now.");
    const json = (await res.json()) as { results?: Array<{ tpl?: unknown }> };
    const rooms = (Array.isArray(json.results) ? json.results : [])
      .map(camsodaVideo)
      .filter((video): video is LibraryVideo => video != null);
    camsodaCache = { at: Date.now(), rooms };
  }
  const needle = query.trim().toLowerCase();
  const filtered =
    !needle || needle === "all"
      ? camsodaCache.rooms
      : camsodaCache.rooms.filter((video) => {
          const hay = `${video.name} ${video.description ?? ""} ${video.remote?.videoId ?? ""}`.toLowerCase();
          return hay.includes(needle);
        });
  return { videos: filtered.slice(0, maxVideos), totalPages: 1, totalCount: filtered.length };
}

let myfreecamsCache: { at: number; rooms: LibraryVideo[] } | null = null;
const MYFREECAMS_CACHE_MS = 3 * 60_000;

function myfreecamsVideo(username: string, status: number): LibraryVideo | null {
  // 0 = public live, 2 = listed/online-adjacent. 90 is offline; 12+ is private/group.
  if (status !== 0 && status !== 2) return null;
  const name = username.trim();
  if (!/^[A-Za-z0-9_]{2,32}$/.test(name)) return null;
  if (adultBlockedText(name)) return null;
  const watch = `https://www.myfreecams.com/#${encodeURIComponent(name)}`;
  return {
    id: `myfreecams:${name.toLowerCase()}`,
    folderId: MYFREECAMS_FOLDER_ID,
    name,
    path: `myfreecams/${name}`,
    extension: "myfreecams",
    mime: "video/myfreecams",
    size: 0,
    addedAt: Date.now(),
    tagline: status === 0 ? "Live on MyFreeCams" : "Listed on MyFreeCams",
    description: "live, cam",
    src: watch,
    remote: {
      kind: "myfreecams",
      videoId: name,
      channelName: name,
      live: status === 0,
      observedAt: Date.now(),
      embedUrl: watch,
      watchUrl: watch,
    },
  };
}

async function fetchMyFreeCamsRooms(query: string, maxVideos: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  if (!myfreecamsCache || Date.now() - myfreecamsCache.at > MYFREECAMS_CACHE_MS) {
    const res = await cachedAdultFetch("https://www.myfreecams.com/php/online_models.php", {
      cacheTtlMs: 3 * 60_000,
      signal: AbortSignal.timeout(25000),
      headers: {
        accept: "text/plain, text/html;q=0.8",
        "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
      },
    });
    if (!res.ok) throw new Error("MyFreeCams rooms are unavailable right now.");
    const text = await res.text();
    const rooms: LibraryVideo[] = [];
    for (const line of text.split(/\r?\n/)) {
      const match = line.match(/^([A-Za-z0-9_]{2,32}),(\d+)$/);
      if (!match) continue;
      const video = myfreecamsVideo(match[1], Number(match[2]));
      if (video) rooms.push(video);
    }
    myfreecamsCache = { at: Date.now(), rooms };
  }
  const needle = query.trim().toLowerCase();
  const filtered =
    !needle || needle === "all"
      ? myfreecamsCache.rooms
      : myfreecamsCache.rooms.filter((video) => video.name.toLowerCase().includes(needle));
  return { videos: filtered.slice(0, maxVideos), totalPages: 1, totalCount: filtered.length };
}


function htmlDecode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#32;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#39;/g, "'");
}

function xmlField(xml: string, pattern: RegExp) {
  return htmlDecode(pattern.exec(xml)?.[1] ?? "").trim();
}

function redditVideo(entry: string, subreddit: string): LibraryVideo | null {
  const id = xmlField(entry, /<id>([^<]+)<\/id>/i).replace(/^t3_/, "") || xmlField(entry, /\/comments\/([a-z0-9]+)\//i);
  const title = xmlField(entry, /<title>([^<]+)<\/title>/i);
  const permalink = xmlField(entry, /<link href="([^"]+)"/i);
  const author = xmlField(entry, /<name>([^<]+)<\/name>/i).replace(/^\/u\//, "");
  const published = xmlField(entry, /<published>([^<]+)<\/published>/i);
  const content = xmlField(entry, /<content[^>]*>([\s\S]*?)<\/content>/i);
  if (!id || !title || !permalink) return null;
  const media = extractRedditMedia(entry, content);
  if (!shouldKeepRedditEntry(media, title)) return null;
  if (adultBlockedText(title, author, subreddit, media.poster, media.src, media.watch)) return null;
  const addedAt = Date.parse(published);
  const poster = media.poster;
  const isImage = media.kind === "image";
  const isVideo = media.kind === "video";
  return {
    id: `reddit:${id}`,
    folderId: REDDIT_FOLDER_ID,
    name: title.slice(0, 160),
    path: `reddit/${subreddit}/${id}`,
    extension: isImage ? "image" : isVideo ? "reddit" : "reddit",
    mime: isImage ? "image/jpeg" : isVideo ? "video/reddit" : "text/html",
    size: 0,
    addedAt: Number.isFinite(addedAt) ? addedAt : Date.now(),
    tagline: `r/${subreddit}${author ? ` · u/${author}` : ""}${isVideo ? " · video" : isImage ? " · photo" : ""}`,
    description: `reddit, r/${subreddit}, ${subreddit.replace(/_/g, " ")}, ${title}, ${media.watch ?? ""}`,
    poster: poster || undefined,
    src: media.src || poster || permalink,
    remote: {
      kind: "reddit",
      videoId: id,
      channelName: author || `r/${subreddit}`,
      channelId: subreddit,
      observedAt: Date.now(),
      embedUrl: media.src || media.watch || undefined,
      watchUrl: media.watch && !/reddit\.com\/r\//i.test(media.watch) ? media.watch : permalink,
      previewUrl: poster || undefined,
    },
  };
}

/** Rotate through the curated catalog so refreshes sample many subs over time. */
function redditSubWindow(page: number): { subs: string[]; start: number; totalPages: number } {
  const all = ADULT_REDDIT_SUBS as readonly string[];
  const size = Math.max(1, LIBRARY_LIMITS.redditSubsPerPull);
  const totalPages = Math.max(1, Math.ceil(all.length / size));
  const tick = Math.floor(Date.now() / (20 * 60_000));
  const start = (((Math.max(1, page) - 1) * size) + (tick * 5)) % all.length;
  const subs: string[] = [];
  for (let i = 0; i < size; i += 1) {
    subs.push(all[(start + i) % all.length]!);
  }
  return { subs, start, totalPages };
}


async function fetchRedditSubRss(sub: string, sort: "hot" | "new"): Promise<LibraryVideo[]> {
  const path = sort === "new" ? `/r/${encodeURIComponent(sub)}/new/.rss` : `/r/${encodeURIComponent(sub)}/.rss`;
  const url = `https://www.reddit.com${path}?limit=${LIBRARY_LIMITS.redditPostsPerSub}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(12000),
    cacheTtlMs: 6 * 60_000,
    headers: {
      accept: "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8",
      "user-agent": "linux:reelcase:1.0 (by /u/reelcase)",
    },
  });
  if (res.status === 429) throw new Error("rate limited");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const xml = await res.text();
  const posts: LibraryVideo[] = [];
  for (const chunk of xml.split(/<entry>/i).slice(1)) {
    const video = redditVideo(chunk, sub);
    if (video) posts.push(video);
  }
  return posts;
}

async function fetchRedditFeed(query: string, maxVideos: number, page = 1): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
  nextPage: number | null;
}> {
  const windows = Math.max(1, LIBRARY_LIMITS.redditWindowsPerPull);
  const collected: LibraryVideo[] = [];
  const seen = new Set<string>();
  const errors: string[] = [];
  let lastTotalPages = 1;
  let lastStart = 0;

  for (let offset = 0; offset < windows && collected.length < maxVideos; offset += 1) {
    const { subs, start, totalPages } = redditSubWindow(page + offset);
    lastTotalPages = totalPages;
    lastStart = start;
    const jobs = subs.flatMap((sub) => [
      { sub, sort: "hot" as const },
      { sub, sort: "new" as const },
    ]);
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

  if (!collected.length && errors.length) throw new Error(`Reddit RSS unavailable (${errors.slice(0, 6).join("; ")}).`);

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
};

const BOORU_HOSTS = [
  { id: "xbooru", base: "https://xbooru.com", postPath: "/index.php?page=post&s=view&id=" },
  { id: "tbib", base: "https://tbib.org", postPath: "/index.php?page=post&s=view&id=" },
  { id: "hypnohub", base: "https://hypnohub.net", postPath: "/index.php?page=post&s=view&id=" },
] as const;

function booruVideo(row: BooruPost, host: (typeof BOORU_HOSTS)[number]): LibraryVideo | null {
  const id = asString(row.id).trim();
  const tags = asString(row.tags).trim();
  const owner = asString(row.owner).trim();
  const preview = asString(row.preview_url).trim();
  const sample = asString(row.sample_url).trim();
  const file = asString(row.file_url).trim();
  const image = sample || preview || file;
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
    poster: preview || sample || undefined,
    src: image,
    remote: {
      kind: "booru",
      videoId: id,
      channelName: owner || host.id,
      channelId: host.id,
      observedAt: Date.now(),
      embedUrl: image,
      watchUrl: watch,
      previewUrl: preview || sample || undefined,
    },
  };
}

async function fetchBooruHost(host: (typeof BOORU_HOSTS)[number], tags: string, limit: number, pid: number): Promise<LibraryVideo[]> {
  const params = new URLSearchParams({
    page: "dapi",
    s: "post",
    q: "index",
    json: "1",
    limit: String(limit),
    pid: String(Math.max(0, pid)),
    tags,
  });
  const url = `${host.base}/index.php?${params.toString()}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(15000),
    cacheTtlMs: 10 * 60_000,
    headers: { accept: "application/json,text/plain,*/*", "user-agent": "Reelcase/1.0" },
  });
  if (!res.ok) throw new Error(`${host.id} HTTP ${res.status}`);
  const raw: unknown = await res.json();
  const rows = Array.isArray(raw) ? raw : [];
  const out: LibraryVideo[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const video = booruVideo(row as BooruPost, host);
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
  const tagQuery = !needle || needle === "all" ? "rating:explicit" : `rating:explicit ${needle}`;
  const limit = LIBRARY_LIMITS.booruPageSize;
  const pid = Math.max(0, page - 1);
  const collected: LibraryVideo[] = [];
  const seen = new Set<string>();
  const errors: string[] = [];
  for (const host of BOORU_HOSTS) {
    if (collected.length >= maxVideos) break;
    try {
      const batch = await fetchBooruHost(host, tagQuery, Math.min(limit, maxVideos - collected.length), pid);
      for (const video of batch) {
        if (seen.has(video.id)) continue;
        seen.add(video.id);
        collected.push(video);
        if (collected.length >= maxVideos) break;
      }
    } catch (err) {
      errors.push(`${host.id}: ${err instanceof Error ? err.message : "unavailable"}`);
    }
  }
  if (!collected.length && errors.length) throw new Error(`Booru unavailable (${errors.join("; ")}).`);
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

function redgifsVideo(row: RedgifsRow): LibraryVideo | null {
  const id = pickString(row.id, row.gif_id, row.gifId, row.slug);
  if (!id) return null;
  const urls = asRecord(row.urls) ?? {};
  const user = asRecord(row.user) ?? asRecord(row.creator) ?? {};
  const tagsRaw = row.tags ?? row.hashtags ?? row.niches;
  const tagList = Array.isArray(tagsRaw)
    ? tagsRaw.map((t) => (typeof t === "string" ? t : pickString(asRecord(t)?.name, asRecord(t)?.text))).filter(Boolean)
    : typeof tagsRaw === "string"
      ? tagsRaw.split(/[,;\s]+/).filter(Boolean)
      : [];
  const title = pickString(row.title, row.description, tagList.slice(0, 6).join(" "), id).slice(0, 160);
  const author = pickString(user.username, user.name, row.username, row.userName, row.author);
  const embed = pickString(urls.html, urls.player, row.embedUrl, row.embed_url, `https://www.redgifs.com/ifr/${encodeURIComponent(id)}`);
  const watch = pickString(urls.webUrl, urls.web_url, row.url, row.webUrl, `https://www.redgifs.com/watch/${encodeURIComponent(id)}`);
  const thumb = pickString(urls.thumbnail, urls.poster, urls.posterUrl, row.thumbnail, row.poster, row.previewUrl);
  const file = pickString(urls.hd, urls.sd, urls.silent, urls.giftiny, urls.gif, row.mp4, row.file);
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
    poster: thumb || undefined,
    src: embed || file || undefined,
    remote: {
      kind: "redgifs",
      videoId: id,
      channelName: author || "Redgifs",
      observedAt: Date.now(),
      embedUrl: embed || undefined,
      watchUrl: watch,
      previewUrl: thumb || undefined,
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

async function fetchRedgifsFeed(query: string, maxVideos: number, page: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  const key = adultDataLinkApiKey();
  if (!key) {
    throw new Error("AdultDataLink key missing — set ADULTDATALINK_API_KEY to enable Redgifs pulls.");
  }
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
      "user-agent": "Reelcase/1.0",
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

function liveRoomLimit(provider: AdultPullProvider) {
  if (provider === "chaturbate") return LIBRARY_LIMITS.chaturbateRoomsPerPull;
  if (provider === "camsoda") return LIBRARY_LIMITS.camsodaRoomsPerPull;
  if (provider === "myfreecams") return LIBRARY_LIMITS.myfreecamsRoomsPerPull;
  return 0;
}

function providerPageBudget(provider: AdultPullProvider) {
  if (provider === "redtube") return { maxPages: LIBRARY_LIMITS.redtubePagesPerPull, perPage: LIBRARY_LIMITS.redtubePageSize };
  const live = liveRoomLimit(provider);
  if (live) return { maxPages: 1, perPage: live };
  return { maxPages: LIBRARY_LIMITS.epornerPagesPerPull, perPage: LIBRARY_LIMITS.epornerPageSize };
}

async function pullProviderPages(
  provider: AdultPullProvider,
  query: string,
  order: string,
  startPage: number,
  maxVideos: number,
): Promise<{ videos: LibraryVideo[]; page: number; nextPage: number | null; totalCount: number }> {
  if (provider === "reddit") {
    const batch = await fetchRedditFeed(query, maxVideos, startPage);
    return {
      videos: batch.videos,
      page: startPage,
      nextPage: batch.nextPage,
      totalCount: batch.totalCount,
    };
  }
  if (provider === "booru") {
    const batch = await fetchBooruFeed(query, maxVideos, startPage);
    return {
      videos: batch.videos,
      page: startPage,
      nextPage: batch.videos.length ? startPage + 1 : null,
      totalCount: batch.totalCount,
    };
  }
  if (provider === "redgifs") {
    const batch = await fetchRedgifsFeed(query, maxVideos, startPage);
    return {
      videos: batch.videos,
      page: startPage,
      nextPage: batch.videos.length ? startPage + 1 : null,
      totalCount: batch.totalCount,
    };
  }
  if (provider === "chaturbate" || provider === "camsoda" || provider === "myfreecams") {
    const batch =
      provider === "chaturbate"
        ? await fetchChaturbateRooms(query, maxVideos)
        : provider === "camsoda"
          ? await fetchCamSodaRooms(query, maxVideos)
          : await fetchMyFreeCamsRooms(query, maxVideos);
    return {
      videos: batch.videos,
      page: 1,
      nextPage: null,
      totalCount: batch.totalCount,
    };
  }
  const collected: LibraryVideo[] = [];
  const seen = new Set<string>();
  let page = startPage;
  let totalPages = page;
  let totalCount = 0;
  let pagesFetched = 0;
  const { maxPages, perPage } = providerPageBudget(provider);

  while (collected.length < maxVideos && pagesFetched < maxPages) {
    const batch =
      provider === "redtube"
        ? await fetchRedtubePage(query, order, page)
        : await fetchEpornerPage(query, order, page, perPage);
    totalPages = batch.totalPages;
    totalCount = batch.totalCount;
    pagesFetched += 1;
    if (!batch.videos.length) break;
    for (const video of batch.videos) {
      if (seen.has(video.id)) continue;
      seen.add(video.id);
      collected.push(video);
      if (collected.length >= maxVideos) break;
    }
    if (page >= totalPages) break;
    page += 1;
  }

  const computedNext = startPage + pagesFetched;
  return {
    videos: collected,
    page: startPage,
    nextPage: computedNext <= totalPages && collected.length ? computedNext : null,
    totalCount,
  };
}

export const searchAdultVideos = createServerFn({ method: "POST" })
  .validator((data: unknown) => parseAdultSearch(data))
  .handler(async ({ data }): Promise<{
    videos: LibraryVideo[];
    source: string;
    note: string;
    page: number;
    nextPage: number | null;
    totalCount: number;
    providers: AdultPullProvider[];
    providerNextPages: Partial<Record<AdultPullProvider, number | null>>;
  }> => {
    const providers = [...data.providers].sort((a, b) => (a === "reddit" ? -1 : b === "reddit" ? 1 : 0));
    const share = Math.max(1, Math.floor(data.maxVideos / Math.max(1, providers.length)));
    const leftovers = data.maxVideos - share * providers.length;
    const collected: LibraryVideo[] = [];
    let nextPage: number | null = null;
    let totalCount = 0;
    const errors: string[] = [];
    const providerNextPages: Partial<Record<AdultPullProvider, number | null>> = {};

    const seen = new Set<string>();
    for (let i = 0; i < providers.length; i += 1) {
      const provider = providers[i];
      const rawBudget = share + (provider === "reddit" ? leftovers : 0);
      const live = liveRoomLimit(provider);
      const redditFloor = Math.min(
        LIBRARY_LIMITS.redditVideosPerPull,
        Math.max(rawBudget, Math.floor(data.maxVideos * 0.35), 480),
      );
      const budget = provider === "reddit"
        ? redditFloor
        : provider === "booru"
          ? Math.min(LIBRARY_LIMITS.booruVideosPerPull, rawBudget)
          : provider === "redgifs"
            ? Math.min(LIBRARY_LIMITS.redgifsVideosPerPull, rawBudget)
        : live ? Math.min(live, rawBudget) : rawBudget;
      const startPage = data.providerPages?.[provider] ?? data.page;
      try {
        const batch = await pullProviderPages(provider, data.query, data.order, startPage, budget);
        for (const video of batch.videos) {
          if (seen.has(video.id)) continue;
          seen.add(video.id);
          collected.push(video);
        }
        totalCount += batch.totalCount;
        providerNextPages[provider] = batch.nextPage;
        if (batch.nextPage != null) nextPage = nextPage == null ? batch.nextPage : Math.min(nextPage, batch.nextPage);
      } catch (err) {
        const message = err instanceof Error ? err.message : "unavailable";
        errors.push(`${provider}: ${message}`);
        providerNextPages[provider] = null;
      }
    }

    const redditHave = collected.filter((video) => video.remote?.kind === "reddit").length;
    const redditWant = Math.min(LIBRARY_LIMITS.redditVideosPerPull, Math.max(480, Math.floor(data.maxVideos * 0.35)));
    if (providers.includes("reddit") && redditHave < redditWant) {
      const extraPage = (data.providerPages?.reddit ?? data.page) + LIBRARY_LIMITS.redditWindowsPerPull;
      try {
        const batch = await pullProviderPages("reddit", data.query, data.order, extraPage, redditWant - redditHave);
        for (const video of batch.videos) {
          if (seen.has(video.id)) continue;
          seen.add(video.id);
          collected.push(video);
        }
        totalCount += batch.totalCount;
        if (batch.nextPage != null) providerNextPages.reddit = batch.nextPage;
      } catch (err) {
        const message = err instanceof Error ? err.message : "unavailable";
        errors.push(`reddit/extra: ${message}`);
      }
    }

    // When browsing "all", deepen official video APIs with curated fetish
    // keyword pages so shelves pick up DP / roleplay / milf / feet and more.
    // Leave headroom so RedTube/Eporner cannot refill the entire catalog after Reddit.
    if (data.query.toLowerCase() === "all" && collected.length < data.maxVideos) {
      const fetishQueries = ADULT_DEEPEN_FETISH_QUERIES;
      const deepenProviders = providers.filter((p) => p === "eporner" || p === "redtube");
      const remaining = Math.max(0, data.maxVideos - collected.length);
      const slots = Math.max(1, fetishQueries.length * Math.max(1, deepenProviders.length));
      const perQuery = Math.max(20, Math.floor(remaining / slots));
      for (const fetish of fetishQueries) {
        for (const provider of deepenProviders) {
          if (collected.length >= data.maxVideos) break;
          try {
            const batch = await pullProviderPages(provider, fetish, data.order, 1, perQuery);
            for (const video of batch.videos) {
              if (seen.has(video.id)) continue;
              seen.add(video.id);
              collected.push(video);
              if (collected.length >= data.maxVideos) break;
            }
            totalCount += batch.totalCount;
          } catch (err) {
            const message = err instanceof Error ? err.message : "unavailable";
            errors.push(`${provider}/${fetish}: ${message}`);
          }
        }
        if (collected.length >= data.maxVideos) break;
      }
    }

    if (!collected.length && errors.length) {
      throw new Error(`Adult pulls failed (${errors.join("; ")}).`);
    }

    return {
      videos: collected,
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
    };
  });


/* --- Adult comments (real provider data only; no fake comments) --- */

export type AdultComment = { id: string; author?: string; body: string; score?: number };

function parseRedditCommentEntries(xml: string): AdultComment[] {
  const out: AdultComment[] = [];
  for (const chunk of xml.split(/<entry>/i).slice(1).slice(0, 24)) {
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

export const fetchAdultComments = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const rec = typeof data === "object" && data !== null ? (data as Record<string, unknown>) : {};
    return {
      kind: asString(rec.kind).trim(),
      videoId: asString(rec.videoId).trim(),
      watchUrl: asString(rec.watchUrl).trim(),
    };
  })
  .handler(async ({ data }): Promise<{ comments: AdultComment[]; note: string }> => {
    if (data.kind !== "reddit" || !data.videoId) {
      return { comments: [], note: "This provider does not expose a public comment feed." };
    }
    const id = data.videoId.replace(/^t3_/, "");
    const url = `https://www.reddit.com/comments/${encodeURIComponent(id)}.rss?limit=20`;
    try {
      const res = await cachedAdultFetch(url, {
        signal: AbortSignal.timeout(12000),
        cacheTtlMs: 15 * 60_000,
        headers: {
          accept: "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8",
          "user-agent": "linux:reelcase:1.0 (by /u/reelcase)",
        },
      });
      if (res.status === 429) return { comments: [], note: "Reddit comment RSS rate-limited — try again later." };
      if (!res.ok) return { comments: [], note: `Reddit comments unavailable (HTTP ${res.status}).` };
      const xml = await res.text();
      const comments = parseRedditCommentEntries(xml);
      return {
        comments,
        note: comments.length
          ? "Live Reddit comments via public Atom RSS."
          : "No comments returned for this post.",
      };
    } catch (err) {
      return { comments: [], note: err instanceof Error ? err.message : "Comments unavailable." };
    }
  });
