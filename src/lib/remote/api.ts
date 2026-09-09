import { createServerFn } from "@tanstack/react-start";
import type { FollowedChannel, LibraryVideo, RemoteKind } from "@/lib/videos/types";

type FollowInput = { query: string; kind: "auto" | RemoteKind };
type RefreshInput = { channels: FollowedChannel[] };

export type FollowResult = {
  channel: FollowedChannel;
  videos: LibraryVideo[];
};

export type RefreshResult = {
  videos: LibraryVideo[];
  channels: FollowedChannel[];
  refreshedIds: string[];
};

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

function guessKind(query: string): RemoteKind {
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
};

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

function channelPageRenderers(html: string): YoutubeRenderer[] {
  const match = html.match(/var ytInitialData\s*=\s*({[\s\S]*?});<\/script>/);
  if (!match?.[1]) return [];
  try {
    const root = JSON.parse(match[1]) as unknown;
    const found: YoutubeRenderer[] = [];
    const stack: unknown[] = [root];
    while (stack.length && found.length < 240) {
      const current = stack.pop();
      if (!current || typeof current !== "object") continue;
      if (Array.isArray(current)) { stack.push(...current); continue; }
      const record = current as Record<string, unknown>;
      const renderer = record.videoRenderer as YoutubeRenderer | undefined;
      if (renderer?.videoId) found.push(renderer);
      for (const value of Object.values(record)) if (value && typeof value === "object") stack.push(value);
    }
    return found;
  } catch { return []; }
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
        desc: `${channelName} public channel catalog item.`,
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

async function youtubeFromChannel(query: string, limit = 180): Promise<FollowResult> {
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
  const [xml, channelPage] = await Promise.all([
    fetchText(`https://www.youtube.com/feeds/videos.xml?channel_id=${encodeURIComponent(channelId)}`),
    fetchText(`https://www.youtube.com/channel/${encodeURIComponent(channelId)}/videos`).catch(() => ""),
  ]);
  const title = tag(xml, "title") || "YouTube";
  const author = tag(xml, "name") || title;
  const entries = [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].slice(0, limit);

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
  const backfill = channelPage ? await (async () => {
    const seen = new Set(feedIds);
    const rows: LibraryVideo[] = [];
    for (const renderer of channelPageRenderers(channelPage)) {
      const id = renderer.videoId;
      if (!id || seen.has(id)) continue;
      seen.add(id);
      rows.push(ytVideo({ id, title: rendererText(renderer.title) || `${author} video`, published: "1970-01-01T00:00:00.000Z", thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, desc: `${author} public channel catalog item.`, channelId, channelName: author, views: parsePublicViewCount(rendererText(renderer.viewCountText)) }));
      if (rows.length >= Math.max(0, limit - videos.length)) break;
    }
    return rows;
  })() : await youtubeChannelBackfill(channelId, author, feedIds, Math.max(0, limit - videos.length));
  videos.push(...backfill);
  const live = await youtubeLiveFromChannel(channelId, author);
  if (live && !videos.some((video) => video.id === live.id)) videos.unshift(live);
  const channel: FollowedChannel = {
    id: `yt:${channelId}`,
    kind: "youtube",
    handle: author,
    title: author,
    channelId,
  };
  return { channel, videos };
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
    edges?: Array<{
      node?: {
        id?: string;
        title?: string;
        description?: string;
        lengthSeconds?: number;
        previewThumbnailURL?: string;
        publishedAt?: string;
      };
    }>;
  };
};

async function twitchUser(login: string): Promise<GqlUser | null> {
  const res = await fetch("https://gql.twitch.tv/gql", {
    signal: AbortSignal.timeout(12000),
    method: "POST",
    headers: {
      "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      query: `query($login:String!){user(login:$login){id displayName profileImageURL(width:70) stream{title viewersCount previewImageURL(width:640,height:360) game{name}} videos(first:80,type:ARCHIVE){edges{node{id title description lengthSeconds publishedAt previewThumbnailURL(width:640,height:360)}}}}}`,
      variables: { login },
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { data?: { user?: GqlUser | null } };
  return json.data?.user ?? null;
}

function twitchVideos(login: string, user: GqlUser, vodLimit = 36): LibraryVideo[] {
  const title = user.displayName ?? login;
  const folderId = `tw:${login}`;
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
        embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(login)}&autoplay=true`,
        watchUrl: `https://www.twitch.tv/${login}`,
      },
    });
  }
  for (const edge of (user.videos?.edges ?? []).slice(0, vodLimit)) {
    const node = edge.node;
    if (!node?.id) continue;
    out.push({
      id: `tw:v:${node.id}`,
      folderId,
      name: node.title || "Twitch video",
      path: `twitch/${login}/${node.id}`,
      extension: "vod",
      mime: "video/twitch",
      size: 0,
      duration: node.lengthSeconds,
      addedAt: Date.parse(node.publishedAt ?? "") || Date.now(),
      poster: node.previewThumbnailURL,
      tagline: node.description?.slice(0, 180),
      description: node.description?.slice(0, 4_000),
      remote: {
        kind: "twitch",
        videoId: node.id,
        channelName: title,
        live: false,
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
        embedUrl: `https://player.twitch.tv/?channel=${encodeURIComponent(login)}&autoplay=true`,
        watchUrl: `https://www.twitch.tv/${login}`,
      },
    });
  }
  return out;
}

async function followTwitch(query: string, compact = false): Promise<FollowResult> {
  const login = twitchLogin(query);
  if (!login) throw new Error("Enter a Twitch channel.");
  const user = await twitchUser(login);
  // Do not manufacture an offline placeholder for an account that Twitch did
  // not resolve. It looks like a successful follow and causes repeated cards.
  if (!user?.id) throw new Error(`Twitch could not resolve ${login}`);
  const title = user.displayName ?? login;
  const channel: FollowedChannel = {
    id: `tw:${login}`,
    kind: "twitch",
    handle: login,
    title,
    channelId: user?.id,
    thumb: user?.profileImageURL,
    live: Boolean(user?.stream),
  };
  const videos = twitchVideos(login, user, compact ? 12 : 48);
  return { channel, videos };
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
          const next = await followTwitch(ch.handle);
          channels.push({ ...ch, ...next.channel, id: ch.id });
          videos.push(...next.videos.map((video) => ({ ...video, folderId: ch.id })));
        } else {
          const q = ch.channelId ? `https://www.youtube.com/channel/${ch.channelId}` : ch.handle;
          const next = await youtubeFromChannel(q);
          channels.push({ ...ch, ...next.channel, id: ch.id });
          videos.push(...next.videos.map((video) => ({ ...video, folderId: ch.id })));
        }
        refreshedIds.push(ch.id);
      } catch {
        channels.push(ch);
      }
    });
    return { videos, channels, refreshedIds };
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
          return await youtubeFromChannel(item.query, compact ? 96 : 180);
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
