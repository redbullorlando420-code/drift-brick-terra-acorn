import { createServerFn } from "@tanstack/react-start";
import type { FollowedChannel, FollowKind, LibraryVideo, RemoteKind } from "@/lib/videos/types";
import { LIBRARY_LIMITS } from "@/lib/library-limits";
import { EPORNER_FOLDER_ID, REDTUBE_FOLDER_ID } from "@/lib/videos/adult-sites";

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

/* --- Adult discovery (Eporner + RedTube official public APIs + embeds) --- */

type AdultPullProvider = "eporner" | "redtube";

type AdultSearchIn = {
  query?: string;
  order?: string;
  page?: number;
  maxVideos?: number;
  append?: boolean;
  providers?: AdultPullProvider[] | "all";
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
  if (raw === "all" || raw == null) return ["eporner", "redtube"];
  if (Array.isArray(raw)) {
    const out = raw.filter((p): p is AdultPullProvider => p === "eporner" || p === "redtube");
    return out.length ? [...new Set(out)] : ["eporner", "redtube"];
  }
  if (raw === "eporner" || raw === "redtube") return [raw];
  return ["eporner", "redtube"];
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
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
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
  default_thumb?: string;
  thumb?: string;
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
  const keywords = tags.join(", ");
  const thumb = asString(row.default_thumb) || asString(row.thumb);
  const added = Date.parse(asString(row.publish_date)) || Date.now();
  const views = typeof row.views === "number" && Number.isFinite(row.views) ? row.views : undefined;
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
      channelName: "RedTube",
      views,
      observedAt: Date.now(),
      embedUrl: embed,
      watchUrl: watch || `https://www.redtube.com/${id}`,
      previewUrl: thumb || undefined,
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
  const res = await fetch(url, {
    signal: AbortSignal.timeout(20000),
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

async function pullProviderPages(
  provider: AdultPullProvider,
  query: string,
  order: string,
  startPage: number,
  maxVideos: number,
): Promise<{ videos: LibraryVideo[]; page: number; nextPage: number | null; totalCount: number }> {
  const collected: LibraryVideo[] = [];
  const seen = new Set<string>();
  let page = startPage;
  let totalPages = page;
  let totalCount = 0;
  let pagesFetched = 0;
  const maxPages =
    provider === "redtube" ? LIBRARY_LIMITS.redtubePagesPerPull : LIBRARY_LIMITS.epornerPagesPerPull;
  const perPage = provider === "redtube" ? LIBRARY_LIMITS.redtubePageSize : LIBRARY_LIMITS.epornerPageSize;

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
  }> => {
    const providers = data.providers;
    const share = Math.max(1, Math.floor(data.maxVideos / providers.length));
    const leftovers = data.maxVideos - share * providers.length;
    const collected: LibraryVideo[] = [];
    let nextPage: number | null = null;
    let totalCount = 0;

    const seen = new Set<string>();
    for (let i = 0; i < providers.length; i += 1) {
      const provider = providers[i];
      const budget = share + (i === 0 ? leftovers : 0);
      const batch = await pullProviderPages(provider, data.query, data.order, data.page, budget);
      for (const video of batch.videos) {
        if (seen.has(video.id)) continue;
        seen.add(video.id);
        collected.push(video);
      }
      totalCount += batch.totalCount;
      if (batch.nextPage != null) nextPage = nextPage == null ? batch.nextPage : Math.min(nextPage, batch.nextPage);
    }

    // When browsing "all", deepen RedTube fetish coverage with a few official
    // tag/search pages so the adult library receives richer keyword tags.
    if (providers.includes("redtube") && data.query.toLowerCase() === "all" && collected.length < data.maxVideos) {
      const fetishQueries = ["anal", "lesbian", "milf", "gangbang", "cuckold", "masturbation", "voyeur", "amateur"];
      const remaining = data.maxVideos - collected.length;
      const perQuery = Math.max(20, Math.floor(remaining / fetishQueries.length));
      for (const fetish of fetishQueries) {
        if (collected.length >= data.maxVideos) break;
        const batch = await pullProviderPages("redtube", fetish, data.order, 1, perQuery);
        for (const video of batch.videos) {
          if (seen.has(video.id)) continue;
          seen.add(video.id);
          collected.push(video);
          if (collected.length >= data.maxVideos) break;
        }
        totalCount += batch.totalCount;
      }
    }

    return {
      videos: collected,
      source: providers.join("+"),
      note:
        "Pulled via official public APIs (Eporner API v2 and/or RedTube webmaster API). Playback uses public iframe embeds; keywords/tags become local source + fetish tags for browse/filter.",
      page: data.page,
      nextPage,
      totalCount,
      providers,
    };
  });
