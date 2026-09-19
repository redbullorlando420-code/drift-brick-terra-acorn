import type { FollowedChannel, FollowKind, LibraryVideo } from "@/lib/videos/types";
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

type FollowInput = { query: string; kind: "auto" | FollowKind; clipLimit?: number };
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
  const rawClips = typeof rec.clipLimit === "number" ? rec.clipLimit : Number(rec.clipLimit);
  const clipLimit = Number.isFinite(rawClips) && rawClips > 0
    ? Math.min(LIBRARY_LIMITS.twitchFocusedClipsPerChannel, Math.floor(rawClips))
    : undefined;
  return { query, kind, ...(clipLimit ? { clipLimit } : {}) };
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
const YOUTUBE_CHANNEL_CACHE_LIMIT = 12;
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
  // Do not retain a second server-side graph for focused multi-thousand title pulls.
  // Routine windows remain cached briefly to protect rotating refreshes.
  if (boundedLimit <= LIBRARY_LIMITS.youtubeRoutineVideosPerChannel) {
    youtubeChannelCache.set(channelId, { at: Date.now(), result });
    while (youtubeChannelCache.size > YOUTUBE_CHANNEL_CACHE_LIMIT) youtubeChannelCache.delete(youtubeChannelCache.keys().next().value!);
  }
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
const twitchChannelCache = new Map<string, { at: number; result: FollowResult }>();

function twitchPageGap() {
  return new Promise<void>((resolve) => setTimeout(resolve, TWITCH_PAGE_GAP_MS));
}

type TwitchVideoNode = {
  id?: string;
  title?: string;
  description?: string;
  lengthSeconds?: number;
  previewThumbnailURL?: string;
  publishedAt?: string;
  game?: { name?: string };
};

type TwitchClipNode = {
  id?: string;
  slug?: string;
  title?: string;
  viewCount?: number;
  durationSeconds?: number;
  createdAt?: string;
  thumbnailURL?: string;
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
    pageInfo?: {
      hasNextPage?: boolean;
      endCursor?: string | null;
    };
    edges?: Array<{
      cursor?: string | null;
      node?: TwitchVideoNode;
    }>;
  };
};

type TwitchBroadcastType = "ARCHIVE" | "HIGHLIGHT" | "UPLOAD";

function twitchClampFirst(n: number) {
  return Math.max(1, Math.min(100, Math.floor(n)));
}

async function twitchGqlJson(query: string, variables: Record<string, unknown>) {
  const res = await fetch("https://gql.twitch.tv/gql", {
    signal: AbortSignal.timeout(12000),
    method: "POST",
    headers: {
      "client-id": TWITCH_CLIENT_ID,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) return null;
  return (await res.json()) as {
    data?: { user?: GqlUser | null };
    errors?: Array<{ message?: string }>;
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
    `query($login:String!,$after:Cursor,$first:Int!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}} videos(first:$first,type:${broadcastType},after:$after){pageInfo{hasNextPage endCursor} edges{cursor node{id title description lengthSeconds publishedAt previewThumbnailURL(width:640,height:360) game{name}}}}}}`,
    { login, after: after ?? null, first },
  );
  if (!json) return null;
  const user = json.data?.user ?? null;
  // A GraphQL field error on `videos` still returns the user shell. Treat that
  // as an empty page so callers can retry with a smaller `first`.
  if (user && json.errors?.some((error) => /videos|first/i.test(error.message ?? ""))) {
    return { ...user, videos: { pageInfo: { hasNextPage: false, endCursor: null }, edges: [] } };
  }
  return user;
}

/**
 * Twitch exposes archives as a cursor connection (`first` ≤100). With the
 * Android/TV Client-ID we can walk many pages toward the focused budget;
 * empty / integrity failures stop the loop (rate-limit friendly gap between
 * pages). Focused pulls also merge HIGHLIGHT + UPLOAD shelves.
 */
async function twitchArchive(login: string, limit: number): Promise<GqlUser | null> {
  let after: string | null | undefined;
  let first: GqlUser | null = null;
  const edges: NonNullable<NonNullable<GqlUser["videos"]>["edges"]> = [];
  const seen = new Set<string>();
  const maxPages = Math.max(1, Math.min(TWITCH_ARCHIVE_MAX_PAGES, Math.ceil(limit / Math.max(1, TWITCH_ARCHIVE_PAGE_SIZE)) + 1));

  const takePage = async (pageSize: number, cursor: string | null | undefined, type: TwitchBroadcastType) => {
    let page = await twitchUser(login, cursor, pageSize, type);
    // Backup: if the capped page came back empty, retry once at 30 (still valid).
    if (page?.id && !(page.videos?.edges?.length) && pageSize > 30 && !cursor && type === "ARCHIVE") {
      page = await twitchUser(login, null, 30, type);
    }
    return page;
  };

  for (let pageIndex = 0; pageIndex < maxPages && edges.length < limit; pageIndex += 1) {
    if (pageIndex > 0) await twitchPageGap();
    const page = await takePage(Math.min(TWITCH_ARCHIVE_PAGE_SIZE, limit - edges.length), after, "ARCHIVE");
    if (!page) return first;
    if (!first) first = page;
    const before = edges.length;
    for (const edge of page.videos?.edges ?? []) {
      const id = edge.node?.id;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      edges.push(edge);
      if (edges.length >= limit) break;
    }
    const pageInfo = page.videos?.pageInfo;
    const nextCursor = pageInfo?.endCursor ?? page.videos?.edges?.at(-1)?.cursor ?? null;
    if (edges.length === before || !pageInfo?.hasNextPage || !nextCursor || nextCursor === after) break;
    after = nextCursor;
  }

  // Supplement with public highlight + upload shelves (paged lightly).
  if (first && edges.length < limit) {
    for (const type of ["HIGHLIGHT", "UPLOAD"] as const) {
      let typeAfter: string | null | undefined;
      for (let pageIndex = 0; pageIndex < 3 && edges.length < limit; pageIndex += 1) {
        if (pageIndex > 0) await twitchPageGap();
        const page = await takePage(Math.min(TWITCH_ARCHIVE_PAGE_SIZE, limit - edges.length), typeAfter, type);
        const before = edges.length;
        for (const edge of page?.videos?.edges ?? []) {
          const id = edge.node?.id;
          if (!id || seen.has(id)) continue;
          seen.add(id);
          edges.push(edge);
          if (edges.length >= limit) break;
        }
        const pageInfo = page?.videos?.pageInfo;
        const nextCursor = pageInfo?.endCursor ?? page?.videos?.edges?.at(-1)?.cursor ?? null;
        if (edges.length === before || !pageInfo?.hasNextPage || !nextCursor || nextCursor === typeAfter) break;
        typeAfter = nextCursor;
      }
      if (edges.length >= limit) break;
    }
  }

  if (!first) return null;
  return { ...first, videos: { edges } };
}

const TWITCH_CLIP_PERIODS = [null, "LAST_WEEK", "LAST_MONTH", "ALL_TIME"] as const;

type TwitchClipsConnection = {
  pageInfo?: { hasNextPage?: boolean; endCursor?: string | null };
  edges?: Array<{ cursor?: string | null; node?: TwitchClipNode }>;
};

async function twitchClips(login: string, limit: number): Promise<TwitchClipNode[]> {
  if (limit <= 0) return [];
  const out: TwitchClipNode[] = [];
  const seen = new Set<string>();
  const maxPages = Math.max(1, Math.min(TWITCH_CLIP_MAX_PAGES, Math.ceil(limit / 100) + 1));

  // Prefer ALL_TIME with cursor paging when the budget is large; otherwise
  // sample across periods for a diverse short shelf without burning pages.
  const periods = limit > 100 ? (["ALL_TIME"] as const) : TWITCH_CLIP_PERIODS;

  for (const period of periods) {
    if (out.length >= limit) break;
    let after: string | null | undefined;
    for (let pageIndex = 0; pageIndex < maxPages && out.length < limit; pageIndex += 1) {
      if (pageIndex > 0) await twitchPageGap();
      const first = twitchClampFirst(Math.min(100, limit - out.length));
      const field = period
        ? `clips(first:$first, after:$after, criteria:{period:${period}}){pageInfo{hasNextPage endCursor} edges{cursor node{id slug title viewCount durationSeconds createdAt thumbnailURL}}}`
        : `clips(first:$first, after:$after){pageInfo{hasNextPage endCursor} edges{cursor node{id slug title viewCount durationSeconds createdAt thumbnailURL}}}`;
      const json = await twitchGqlJson(
        `query($login:String!,$first:Int!,$after:Cursor){user(login:$login){${field}}}`,
        { login, first, after: after ?? null },
      );
      const clipUser = json?.data?.user as (GqlUser & { clips?: TwitchClipsConnection }) | null | undefined;
      const connection = clipUser?.clips;
      const edges = connection?.edges ?? [];
      const before = out.length;
      for (const edge of edges) {
        const node = edge.node;
        const key = node?.slug || node?.id;
        if (!key || seen.has(key)) continue;
        seen.add(key);
        out.push(node!);
        if (out.length >= limit) break;
      }
      const nextCursor = connection?.pageInfo?.endCursor ?? edges.at(-1)?.cursor ?? null;
      if (out.length === before || !connection?.pageInfo?.hasNextPage || !nextCursor || nextCursor === after) break;
      after = nextCursor;
    }
  }
  return out;
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
        videoId: node.id,
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
    const rawDuration = Number(clip.durationSeconds);
    const duration = Number.isFinite(rawDuration) && rawDuration > 0 && rawDuration <= 60 * 60 ? rawDuration : undefined;
    out.push({
      id: `tw:c:${slug}`,
      folderId,
      name: clip.title || "Twitch clip",
      path: `twitch/${login}/clip/${slug}`,
      extension: "clip",
      mime: "video/twitch",
      size: 0,
      duration,
      addedAt: Date.parse(clip.createdAt ?? "") || Date.now(),
      poster: clip.thumbnailURL,
      tagline: clip.viewCount ? `${clip.viewCount.toLocaleString()} views · clip` : "Twitch clip",
      remote: {
        kind: "twitch",
        videoId: slug,
        channelName: title,
        live: false,
        views: clip.viewCount,
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

async function followTwitchUncoalesced(query: string, compact = false, clipLimit?: number): Promise<FollowResult> {
  const login = twitchLogin(query);
  if (!login) throw new Error("Enter a Twitch channel.");
  const vodLimit = compact ? TWITCH_REFRESH_VOD_LIMIT : TWITCH_FOCUSED_VOD_LIMIT;
  const clipsWanted = clipLimit ?? (compact ? TWITCH_REFRESH_CLIP_LIMIT : TWITCH_FOCUSED_CLIP_LIMIT);
  const cacheKey = `${login}:${compact ? "r" : "f"}:${vodLimit}:${clipsWanted}`;
  const cached = twitchChannelCache.get(cacheKey);
  if (cached && Date.now() - cached.at < TWITCH_CHANNEL_CACHE_TTL_MS) return cached.result;

  const user = await twitchArchive(login, vodLimit);
  if (!user?.id) throw new Error(`Twitch could not resolve ${login}`);
  const clips = await twitchClips(login, clipsWanted);
  const title = user.displayName ?? login;
  const videos = twitchVideos(login, user, vodLimit, clips);
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
  const result = { channel, videos };
  twitchChannelCache.set(cacheKey, { at: Date.now(), result });
  while (twitchChannelCache.size > TWITCH_CHANNEL_CACHE_LIMIT) {
    twitchChannelCache.delete(twitchChannelCache.keys().next().value!);
  }
  return result;
}

function followTwitch(query: string, compact = false, clipLimit?: number): Promise<FollowResult> {
  return providerRequest("twitch", query, !compact, () => followTwitchUncoalesced(query, compact, clipLimit));
}

export async function runFollowRemote(dataRaw: unknown): Promise<FollowResult> {
    const data = parseFollow(dataRaw);
    const kind = data.kind === "auto" ? guessKind(data.query) : data.kind;
    if (kind === "twitch") return followTwitch(data.query, false, data.clipLimit);
    const videoId = ytVideoId(data.query);
    if (videoId) return youtubeFromVideo(videoId);
    return youtubeFromChannel(data.query);
}

export async function runRefreshRemotes(dataRaw: unknown): Promise<RefreshResult> {
    const data = parseRefresh(dataRaw);
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
};

export async function runImportChannels(dataRaw: unknown): Promise<ImportBatchResult> {
    const data = parseImport(dataRaw);
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
      "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
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
      "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
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
    if (!res.ok) throw new Error(`Chaturbate rooms HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
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


let myfreecamsCache: { at: number; rooms: LibraryVideo[] } | null = null;
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
        "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
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

async function fetchMyFreeCamsRooms(query: string, maxVideos: number): Promise<{
  videos: LibraryVideo[];
  totalPages: number;
  totalCount: number;
}> {
  if (!myfreecamsCache || Date.now() - myfreecamsCache.at > MYFREECAMS_CACHE_MS) {
    const priorRooms = myfreecamsCache?.rooms ?? [];
    try {
      const res = await cachedAdultFetch("https://www.myfreecams.com/php/online_models.php", {
        cacheTtlMs: 3 * 60_000,
        signal: AbortSignal.timeout(12_000),
        headers: {
          accept: "text/plain, text/html;q=0.8",
          referer: "https://www.myfreecams.com/#Homepage",
          "accept-language": "en-US,en;q=0.8",
          "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
        },
      });
      if (!res.ok) throw new Error(`MyFreeCams public list HTTP ${res.status}${res.status === 429 ? " (rate limited)" : ""}`);
      const listing = myfreecamsListing(await res.text());
      if (!listing.rooms.length && listing.rows) {
        const states = myfreecamsStateSummary(listing.states);
        throw new Error(
          listing.publicRows
            ? `MyFreeCams listed ${listing.publicRows} public broadcast rows, but none had a usable safe room name.`
            : `MyFreeCams listed ${listing.rows} online rows but no public broadcasts (states: ${states || "unknown"}).`,
        );
      }
      const rooms = listing.rooms.length ? await myfreecamsRoomsWithPreviews(listing.rooms) : [];
      myfreecamsCache = { at: Date.now(), rooms: rooms.length ? rooms : priorRooms };
    } catch (error) {
      // Keep a short-lived last known public roster if MFC blocks, rate limits,
      // or changes a listing response. A cold start still returns the exact
      // reason so Pull sources can explain what happened.
      if (priorRooms.length) {
        myfreecamsCache = { at: Date.now(), rooms: priorRooms };
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
  return { videos: filtered.slice(0, maxVideos), totalPages: 1, totalCount: filtered.length };
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
  const windows = Math.min(Math.max(1, LIBRARY_LIMITS.redditWindowsPerPull), configuredPages);
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

function booruVideo(row: BooruPost, host: (typeof BOORU_HOSTS)[number]): LibraryVideo | null {
  const id = asString(row.id).trim();
  const tags = asString(row.tags).trim();
  const owner = pickString(row.owner, row.creator, row.uploader).trim();
  const preview = asString(row.preview_url).trim();
  const sample = asString(row.sample_url).trim();
  const file = asString(row.file_url).trim();
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
      thumbFallbacks: [preview, sample, file].filter(isUsableAdultThumb).slice(0, 4),
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

async function fetchRule34Listing(host: (typeof BOORU_HOSTS)[number], tags: string, limit: number, pid: number): Promise<LibraryVideo[]> {
  const params = new URLSearchParams({ page: "post", s: "list", tags, pid: String(Math.max(0, pid)) });
  const res = await cachedAdultFetch(`${host.base}/index.php?${params.toString()}`, {
    signal: AbortSignal.timeout(15_000),
    cacheTtlMs: 10 * 60_000,
    headers: { accept: "text/html,application/xhtml+xml", "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0)" },
  });
  if (!res.ok) throw new Error(`${host.id} HTTP ${res.status}`);
  const html = await res.text();
  const rows: BooruPost[] = [];
  const thumbPattern = /<span\s+id="s(\d+)"[^>]*>[\s\S]*?<img\s+src="([^"]+)"[\s\S]*?\balt="([^"]*)"/gi;
  for (const match of html.matchAll(thumbPattern)) {
    rows.push({ id: match[1], preview_url: decodeBooruHtml(match[2] ?? ""), tags: decodeBooruHtml(match[3] ?? "") });
    if (rows.length >= limit) break;
  }
  return rows.map((row) => booruVideo(row, host)).filter((video): video is LibraryVideo => video != null);
}

function rule34PostIdFromQuery(query: string) {
  const direct = query.match(/(?:rule34\.xxx\/index\.php\?[^\s]*\bid=|(?:^|\s)rule34:)(\d+)/i)?.[1];
  return direct && /^\d+$/.test(direct) ? direct : null;
}

async function fetchRule34Post(host: (typeof BOORU_HOSTS)[number], id: string): Promise<LibraryVideo | null> {
  const res = await cachedAdultFetch(`${host.base}${host.postPath}${encodeURIComponent(id)}`, {
    signal: AbortSignal.timeout(15_000),
    cacheTtlMs: 30 * 60_000,
    headers: { accept: "text/html,application/xhtml+xml", "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0)" },
  });
  if (!res.ok) throw new Error(`${host.id} post ${id} HTTP ${res.status}`);
  const html = await res.text();
  const image = html.match(/<img\b(?=[^>]*\bid="image")[^>]*\bsrc="([^"]+)"[^>]*>/i)?.[1];
  const tags = html.match(/<img\b(?=[^>]*\bid="image")[^>]*\balt="([^"]*)"[^>]*>/i)?.[1] ?? "";
  if (!image) throw new Error(`${host.id} post ${id} has no public image`);
  return booruVideo({ id, file_url: decodeBooruHtml(image), preview_url: decodeBooruHtml(image), tags: decodeBooruHtml(tags) }, host);
}

async function fetchBooruJson(host: (typeof BOORU_HOSTS)[number], tags: string, limit: number, pid: number): Promise<LibraryVideo[]> {
  const params = new URLSearchParams({
    page: "dapi",
    s: "post",
    q: "index",
    json: "1",
    limit: String(limit),
    pid: String(Math.max(0, pid)),
    tags,
  });
  const url = `${("apiBase" in host ? host.apiBase : host.base)}/index.php?${params.toString()}`;
  const res = await cachedAdultFetch(url, {
    signal: AbortSignal.timeout(15_000),
    cacheTtlMs: 10 * 60_000,
    headers: { accept: "application/json,text/plain,*/*", "user-agent": "Reelcase/1.0" },
  });
  if (!res.ok) throw new Error(`${host.id} HTTP ${res.status}`);
  const raw: unknown = await res.json();
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
  // Rule34 documents a Gelbooru-compatible JSON dapi. Prefer that for speed and
  // stable preview URLs; keep the HTML listing as a real backup when JSON is
  // empty, rate-limited, or briefly unavailable.
  if (host.id === "rule34") {
    try {
      const jsonRows = await fetchBooruJson(host, tags, limit, pid);
      if (jsonRows.length) return jsonRows;
    } catch {
      // Fall through to HTML listing backup.
    }
    return fetchRule34Listing(host, tags, limit, pid);
  }
  return fetchBooruJson(host, tags, limit, pid);
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
      "user-agent": "Reelcase/1.0 (adult catalog; local library client)",
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
  const tagQuery = !needle || needle === "all" ? "rating:explicit" : `rating:explicit ${needle}`;
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
    ...ordered.map((host) => fetchBooruHost(host, tagQuery, host.id === "rule34" ? share * 2 : share, pid)),
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
  const res = await fetch("https://api.redgifs.com/v2/auth/temporary", {
    headers: { accept: "application/json", "user-agent": "Reelcase/1.0" },
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
      "user-agent": "Reelcase/1.0",
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
  provider: AdultPullProvider,
  query: string,
  order: string,
  startPage: number,
  maxVideos: number,
  redditSources: readonly RedditSourcePreference[] = [],
): Promise<{ videos: LibraryVideo[]; page: number; nextPage: number | null; totalCount: number }> {
  if (provider === "reddit") {
    const batch = await fetchRedditFeed(query, maxVideos, startPage, redditSources);
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
    const collected: LibraryVideo[] = [];
    const seen = new Set<string>();
    let page = startPage;
    let totalCount = 0;
    let hasNext = false;
    // Pull enough documented API pages to meet the Redgifs budget. This keeps
    // its representation comparable with the other catalog providers.
    const pages = Math.max(1, Math.ceil(maxVideos / LIBRARY_LIMITS.redgifsPageSize));
    for (let index = 0; index < pages && collected.length < maxVideos; index += 1) {
      const batch = await fetchRedgifsFeed(query, Math.min(LIBRARY_LIMITS.redgifsPageSize, maxVideos - collected.length), page);
      totalCount += batch.totalCount;
      for (const video of batch.videos) {
        if (seen.has(video.id)) continue;
        seen.add(video.id);
        collected.push(video);
      }
      if (batch.videos.length < LIBRARY_LIMITS.redgifsPageSize) break;
      page += 1;
      hasNext = true;
    }
    return {
      videos: collected,
      page: startPage,
      nextPage: collected.length && hasNext ? page : null,
      totalCount,
    };
  }
  if (provider === "chaturbate" || provider === "myfreecams") {
    const batch = provider === "chaturbate"
      ? await fetchChaturbateRooms(query, maxVideos)
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

  // Rotate RedTube/Eporner orderings every few pages so "all" pulls are not
  // one weekly ranking slice — newest, rated, and popular archives mix in.
  const varietyOrders = ["top-weekly", "latest", "top-rated", "most-popular", "top-monthly"] as const;
  while (collected.length < maxVideos && pagesFetched < maxPages) {
    const varietyOrder = provider === "redtube" || provider === "eporner"
      ? (query.trim().toLowerCase() === "all"
          ? varietyOrders[(page - 1) % varietyOrders.length]!
          : order)
      : order;
    const batch =
      provider === "redtube"
        ? await fetchRedtubePage(query, varietyOrder, page)
        : await fetchEpornerPage(query, varietyOrder, page, perPage);
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

export async function runSearchAdultVideos(dataRaw: unknown): Promise<{
    videos: LibraryVideo[];
    source: string;
    note: string;
    page: number;
    nextPage: number | null;
    totalCount: number;
    providers: AdultPullProvider[];
    providerNextPages: Partial<Record<AdultPullProvider, number | null>>;
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
    const providerDiagnostics: AdultPullDiagnostic[] = [];

    const batches = await Promise.allSettled(providers.map(async (provider) => {
      const rawBudget = share + (provider === "reddit" ? leftovers : 0);
      const live = liveRoomLimit(provider);
      const redditFloor = Math.min(
        LIBRARY_LIMITS.redditVideosPerPull,
        Math.max(rawBudget, Math.min(480, Math.floor(data.maxVideos * 0.45))),
      );
      const underrepresentedFloor = Math.min(160, Math.max(rawBudget, Math.floor(data.maxVideos * 0.2)));
      const budget = provider === "reddit"
        ? redditFloor
        : provider === "booru"
          ? Math.min(LIBRARY_LIMITS.booruVideosPerPull, underrepresentedFloor)
          : provider === "redgifs"
            ? Math.min(LIBRARY_LIMITS.redgifsVideosPerPull, underrepresentedFloor)
        // Keep the established Eporner / RedTube allocation. Smaller live
        // providers receive a viable sample when every source is selected.
        : live ? Math.min(live, underrepresentedFloor) : rawBudget;
      const startPage = data.providerPages?.[provider] ?? data.page;
      const batch = await withinAdultPullDeadline(
        pullProviderPages(provider, data.query, data.order, startPage, budget, data.redditSources),
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
      providerNextPages[provider] = null;
      providerDiagnostics.push({ provider, status: "failed", titles: 0, detail: message });
    }

    const redditHave = collected.filter((video) => video.remote?.kind === "reddit").length;
    const redditWant = Math.min(LIBRARY_LIMITS.redditVideosPerPull, Math.max(240, Math.min(480, Math.floor(data.maxVideos * 0.45))));
    // A saved list is fully covered by its first deterministic pass. Repeating
    // it only replays the same cached Atom window and prolongs the spinner.
    if (providers.includes("reddit") && !data.redditSources.length && redditHave < redditWant) {
      const extraPage = (data.providerPages?.reddit ?? data.page) + LIBRARY_LIMITS.redditWindowsPerPull;
      try {
        const batch = await pullProviderPages("reddit", data.query, data.order, extraPage, redditWant - redditHave, data.redditSources);
        for (const video of batch.videos) {
          if (seen.has(video.id)) continue;
          seen.add(video.id);
          collected.push(video);
        }
        totalCount += batch.totalCount;
        if (batch.nextPage != null) providerNextPages.reddit = batch.nextPage;
      } catch (err) {
        const message = adultPullFailureDetail(err);
        errors.push(`reddit/extra: ${message}`);
        providerDiagnostics.push({ provider: "reddit extra", status: "failed", titles: 0, detail: message });
      }
    }

    // When browsing "all", deepen official video APIs with curated fetish
    // keyword pages so shelves pick up DP / roleplay / milf / feet and more.
    // Leave headroom so RedTube/Eporner cannot refill the entire catalog after Reddit.
    if (data.append && data.query.toLowerCase() === "all" && collected.length < data.maxVideos) {
      const fetishQueries = adultDeepenQueriesForPage(data.page, 12);
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
            const message = adultPullFailureDetail(err);
            errors.push(`${provider}/${fetish}: ${message}`);
            providerDiagnostics.push({ provider: `${provider} · ${fetish}`, status: "failed", titles: 0, detail: message });
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
      providerDiagnostics,
    };
}


/* --- Provider comments (real public feeds only; no fake comments) --- */

export type AdultComment = { id: string; author?: string; body: string; score?: number };

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
    for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
  }
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
      const response = await fetch(`https://www.youtube.com/youtubei/v1/next?key=${encodeURIComponent(apiKey)}`, {
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
        signal: AbortSignal.timeout(15_000),
      });
      if (!response.ok) return null;
      return await response.json() as unknown;
    };

    const watch = await postNext({ videoId: id });
    if (!watch) return { comments: [], note: "YouTube comments endpoint unavailable." };
    let continuation = youtubeCommentContinuation(watch);
    if (!continuation) return { comments: [], note: "No public YouTube comment panel for this video." };

    const comments: AdultComment[] = [];
    const seen = new Set<string>();
    for (let page = 0; page < 4 && comments.length < limit && continuation; page += 1) {
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
      const res = await fetch("https://gql.twitch.tv/gql", {
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
  const urls = permalink ? [`${permalink}.rss?limit=40`, oldPermalink ? `${oldPermalink}.rss?limit=40` : oldCanonical, canonical, oldCanonical] : [canonical, oldCanonical];
  let lastStatus = 0;
  for (const url of urls) {
    const res = await cachedAdultFetch(url, { signal: AbortSignal.timeout(12_000), cacheTtlMs: 15 * 60_000, headers: { accept: "application/atom+xml, application/rss+xml, application/xml;q=0.9, */*;q=0.8", "user-agent": "linux:reelcase:1.0 (by /u/reelcase)" } });
    lastStatus = res.status;
    if (res.status === 429) continue;
    if (!res.ok) continue;
    const comments = parseRedditCommentEntries(await res.text());
    return { comments, note: comments.length ? "Live Reddit comments via public Atom RSS." : "No public comments returned for this post." };
  }
  return { comments: [], note: lastStatus === 429 ? "Reddit comment RSS rate-limited — try again later." : `Reddit comments unavailable (HTTP ${lastStatus || "network"}).` };
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
    return fetchYoutubeComments(data.videoId, LIBRARY_LIMITS.youtubeCommentsPerPull);
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
        "user-agent": "Mozilla/5.0 (compatible; Reelcase/1.0; +https://grok.x.ai)",
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
