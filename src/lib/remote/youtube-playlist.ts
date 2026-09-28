export function youtubePlaylistId(input: string): string | null {
  try {
    const url = new URL(input.trim());
    if (!/(^|\.)youtube\.com$/i.test(url.hostname)) return null;
    const id = url.searchParams.get("list") ?? "";
    return /^[A-Za-z0-9_-]{10,80}$/.test(id) ? id : null;
  } catch { return null; }
}

type TextRuns = { simpleText?: string; runs?: Array<{ text?: string }> };
function text(value?: TextRuns) { return value?.simpleText ?? value?.runs?.map((run) => run.text ?? "").join("") ?? ""; }

export type PublicPlaylistEntry = { id: string; title: string; channelName: string; channelId?: string; thumb?: string };
export function publicPlaylistEntries(root: unknown, limit: number): PublicPlaylistEntry[] {
  const out: PublicPlaylistEntry[] = [];
  const seen = new Set<string>();
  const stack: unknown[] = [root];
  while (stack.length && out.length < limit) {
    const item = stack.pop();
    if (!item || typeof item !== "object") continue;
    if (Array.isArray(item)) { for (let i = item.length - 1; i >= 0; i--) stack.push(item[i]); continue; }
    const record = item as Record<string, unknown>;
    const renderer = (record.playlistVideoRenderer ?? record.playlistPanelVideoRenderer) as {
      videoId?: string; title?: TextRuns; shortBylineText?: TextRuns;
      thumbnail?: { thumbnails?: Array<{ url?: string }> };
      navigationEndpoint?: { commandMetadata?: { webCommandMetadata?: { url?: string } } };
    } | undefined;
    if (renderer?.videoId && !seen.has(renderer.videoId)) {
      seen.add(renderer.videoId);
      out.push({ id: renderer.videoId, title: text(renderer.title) || renderer.videoId, channelName: text(renderer.shortBylineText) || "YouTube", thumb: renderer.thumbnail?.thumbnails?.at(-1)?.url });
    }
    const lockup = record.lockupViewModel as {
      contentId?: string; contentType?: string;
      contentImage?: { thumbnailViewModel?: { image?: { sources?: Array<{ url?: string }> } } };
      metadata?: { lockupMetadataViewModel?: { title?: { content?: string }; metadata?: { contentMetadataViewModel?: { metadataRows?: Array<{ metadataParts?: Array<{ text?: { content?: string } }> }> } } } };
    } | undefined;
    if (lockup?.contentType === "LOCKUP_CONTENT_TYPE_VIDEO" && lockup.contentId && !seen.has(lockup.contentId)) {
      seen.add(lockup.contentId);
      out.push({
        id: lockup.contentId,
        title: lockup.metadata?.lockupMetadataViewModel?.title?.content || lockup.contentId,
        channelName: lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows?.[0]?.metadataParts?.[0]?.text?.content || "YouTube",
        thumb: lockup.contentImage?.thumbnailViewModel?.image?.sources?.at(-1)?.url,
      });
    }
    for (const value of Object.values(record).reverse()) if (value && typeof value === "object") stack.push(value);
  }
  return out;
}

export function publicPlaylistTitle(root: unknown): string | null {
  const stack: unknown[] = [root];
  while (stack.length) {
    const item = stack.pop();
    if (!item || typeof item !== "object") continue;
    if (Array.isArray(item)) { stack.push(...item); continue; }
    const record = item as Record<string, unknown>;
    const header = (record.playlistHeaderRenderer ?? record.pageHeaderViewModel ?? record.pageHeaderRenderer) as { title?: TextRuns | { dynamicTextViewModel?: { text?: { content?: string } } }; pageTitle?: string } | undefined;
    if (header?.title) {
      const title = text(header.title as TextRuns) || (header.title as { dynamicTextViewModel?: { text?: { content?: string } } }).dynamicTextViewModel?.text?.content;
      if (title) return title;
    }
    if (header?.pageTitle) return header.pageTitle;
    stack.push(...Object.values(record).filter((value) => value && typeof value === "object"));
  }
  return null;
}
