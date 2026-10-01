/** Extract the balanced JSON value rather than depending on script spacing or
 * the closing script immediately following ytInitialData. */
export function youtubeInitialData(html: string): unknown | null {
  const marker = /(?:var\s+ytInitialData\s*=|window\[\s*["']ytInitialData["']\s*\]\s*=|ytInitialData\s*=)\s*/g;
  const match = marker.exec(html);
  if (!match) return null;
  const start = marker.lastIndex;
  if (html[start] !== "{") return null;
  let depth = 0, quoted = false, escaped = false;
  for (let index = start; index < html.length; index++) {
    const char = html[index];
    if (quoted) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') quoted = false;
    } else if (char === '"') quoted = true;
    else if (char === "{") depth++;
    else if (char === "}" && --depth === 0) {
      try { return JSON.parse(html.slice(start, index + 1)); } catch { return null; }
    }
  }
  return null;
}

/** The page owner's metadata must win over recommended channels embedded in
 * the same document. Avoid the first arbitrary channelId in a large page. */
export function youtubePageChannelId(html: string): string | null {
  const root = youtubeInitialData(html) as { metadata?: { channelMetadataRenderer?: { externalId?: string } }; header?: { c4TabbedHeaderRenderer?: { channelId?: string } } } | null;
  const owner = root?.metadata?.channelMetadataRenderer?.externalId ?? root?.header?.c4TabbedHeaderRenderer?.channelId;
  if (owner && /^UC[\w-]{20,}$/.test(owner)) return owner;
  return html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/(?:www\.)?youtube\.com\/channel\/(UC[\w-]{20,})/i)?.[1]
    ?? html.match(/"externalId"\s*:\s*"(UC[\w-]{20,})"/)?.[1]
    ?? html.match(/channel_id=(UC[\w-]{20,})/)?.[1]
    ?? null;
}

export type YoutubeRenderer = {
  videoId?: string;
  title?: { simpleText?: string; runs?: Array<{ text?: string }> };
  viewCountText?: { simpleText?: string; runs?: Array<{ text?: string }> };
  descriptionSnippet?: { simpleText?: string; runs?: Array<{ text?: string }> };
  thumbnail?: { thumbnails?: Array<{ url?: string }> };
};

/** Only traverse the requested catalog boundary. Playlist rows and Shorts
 * have different renderers from the long-form Videos grid. */
export function youtubeVideoRenderers(items: unknown, maximum: number): YoutubeRenderer[] {
  const found: YoutubeRenderer[] = [], seen = new Set<string>(), stack: unknown[] = [items];
  while (stack.length && found.length < maximum) {
    const current = stack.pop();
    if (!current || typeof current !== "object") continue;
    if (Array.isArray(current)) { for (let index = current.length - 1; index >= 0; index--) stack.push(current[index]); continue; }
    const record = current as Record<string, any>;
    const renderer = record.videoRenderer ?? record.gridVideoRenderer ?? record.playlistVideoRenderer ?? record.reelItemRenderer;
    const lockup = record.lockupViewModel;
    const short = record.shortsLockupViewModel;
    const normalized: YoutubeRenderer | undefined = renderer ?? (lockup?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" ? {
      videoId: lockup.contentId,
      title: { simpleText: lockup.metadata?.lockupMetadataViewModel?.title?.content },
      thumbnail: { thumbnails: lockup.contentImage?.thumbnailViewModel?.image?.sources },
    } : short ? {
      videoId: short.onTap?.innertubeCommand?.reelWatchEndpoint?.videoId,
      title: { simpleText: short.overlayMetadata?.primaryText?.content ?? short.accessibilityText },
      thumbnail: { thumbnails: short.thumbnail?.sources },
    } : undefined);
    if (normalized?.videoId && !seen.has(normalized.videoId)) { seen.add(normalized.videoId); found.push(normalized); }
    for (const value of Object.values(record).reverse()) if (value && typeof value === "object") stack.push(value);
  }
  return found;
}
