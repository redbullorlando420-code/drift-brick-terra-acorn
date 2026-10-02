function pageJson(html: string, name: string): any | undefined {
  const marker = new RegExp(`(?:var\\s+)?${name}\\s*=\\s*|window\\["${name}"\\]\\s*=\\s*`).exec(html);
  if (!marker) return;
  const start = html.indexOf("{", marker.index + marker[0].length);
  if (start < 0) return;
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quoted) { if (escaped) escaped = false; else if (c === "\\") escaped = true; else if (c === '"') quoted = false; continue; }
    if (c === '"') quoted = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) { try { return JSON.parse(html.slice(start, i + 1)); } catch { return; } }
  }
}

/** Bind live evidence to one video, never a nearby recommendation or scheduled broadcast. */
export function youtubeLivePage(html: string, channelId: string): { id: string; title?: string; viewers?: number } | null {
  const player = pageJson(html, "ytInitialPlayerResponse");
  if (player) {
    const details = player.videoDetails;
    const broadcast = player.microformat?.playerMicroformatRenderer?.liveBroadcastDetails;
    if (!details && player.playabilityStatus?.status !== "OK") throw new Error("YouTube could not confirm this creator's live state. Retry the live check.");
    if (broadcast?.isLiveNow !== true) return null;
    if (!/^[A-Za-z0-9_-]{11}$/.test(details?.videoId ?? "") || (details.channelId && details.channelId !== channelId)) return null;
    const views = Number(details.viewCount);
    return { id: details.videoId, title: details.title, viewers: Number.isFinite(views) && views >= 0 ? views : undefined };
  }
  const initial = pageJson(html, "ytInitialData");
  if (!initial) throw new Error("YouTube returned an unreadable live page. The previous live observation was kept.");
  return youtubeLiveData(initial, channelId)[0] ?? null;
}

export type YoutubeLiveObservation = { id: string; title?: string; viewers?: number };
export function youtubeLiveData(initial: any, channelId: string): YoutubeLiveObservation[] {
  if (!initial || typeof initial !== 'object' || !initial.contents) throw new Error('YouTube returned an unreadable live catalog. The previous live observation was kept.');
  const owner = initial.metadata?.channelMetadataRenderer?.externalId;
  if (owner && owner !== channelId) throw new Error("YouTube returned a different creator's live page.");
  const tabs = initial.contents.twoColumnBrowseResultsRenderer?.tabs;
  const selected = tabs?.find((tab: any) => tab.tabRenderer?.selected)?.tabRenderer;
  const stack: any[] = [selected ? selected.content : initial.contents];
  const results: YoutubeLiveObservation[] = [], seen = new Set<string>();
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    const renderer = node.videoRenderer ?? node.gridVideoRenderer;
    const lockup = node.lockupViewModel;
    if (lockup && /^[A-Za-z0-9_-]{11}$/.test(lockup.contentId ?? "")) {
      const overlays = lockup.contentImage?.thumbnailViewModel?.overlays ?? [];
      const live = overlays.some((overlay: any) => overlay.thumbnailBottomOverlayViewModel?.badges?.some((badge: any) => badge.thumbnailBadgeViewModel?.badgeStyle === "THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE"));
      if (live && !seen.has(lockup.contentId)) { seen.add(lockup.contentId); results.push({ id: lockup.contentId, title: lockup.metadata?.lockupMetadataViewModel?.title?.content }); }
    }
    if (renderer && /^[A-Za-z0-9_-]{11}$/.test(renderer.videoId ?? "")) {
      const live = renderer.thumbnailOverlays?.some((overlay: any) => overlay.thumbnailOverlayTimeStatusRenderer?.style === "LIVE")
        || renderer.badges?.some((badge: any) => badge.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW");
      const byline = renderer.ownerText ?? renderer.shortBylineText ?? renderer.longBylineText;
      const rowOwner = byline?.runs?.find((run: any) => run.navigationEndpoint?.browseEndpoint?.browseId)?.navigationEndpoint?.browseEndpoint?.browseId;
      if (live && !renderer.upcomingEventData && (!rowOwner || rowOwner === channelId) && !seen.has(renderer.videoId)) { seen.add(renderer.videoId); results.push({ id: renderer.videoId, title: renderer.title?.simpleText ?? renderer.title?.runs?.map((r: any) => r.text ?? "").join("") }); }
    }
    for (const value of Object.values(node)) if (value && typeof value === "object") stack.push(value);
  }
  return results.slice(0, 64);
}
