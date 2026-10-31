import { parseProviderJson } from './provider-json.ts';
import { ProviderBudgetError } from '../provider-budgets.ts';
import { validateYoutubeLiveContent } from './youtube-contract.ts';
export function pageJson(html: string, name: string): any | undefined {
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
    else if (c === "}" && --depth === 0) { try { return parseProviderJson(html.slice(start, i + 1)); } catch(error) { if(error instanceof ProviderBudgetError)throw error;return; } }
  }
}

function label(value: any): string {
  return (typeof value === 'string' ? value : value?.simpleText ?? value?.content ?? value?.runs?.map((run: any) => run.text ?? '').join('') ?? '').slice(0, 512);
}

/** Only an explicitly concurrent label counts. Lifetime views and waiting
 * audiences must never be relabeled as people currently watching. */
export function youtubeConcurrentViewers(value: unknown): number | undefined {
  const text = label(value).replace(/[\u00a0\u202f]/g, ' ');
  const match = /(?:^|\s)(\d[\d,. ]*?)\s*([KMB])?\s+(?:watching(?: now)?|concurrent viewers|viewers)(?:\b|$)/i.exec(text);
  if (!match || /waiting|scheduled|starts? in/i.test(text)) return;
  const base = Number(match[1].replace(/[, ]/g, ''));
  if (!match[2] && !Number.isInteger(base)) return;
  const amount = base * ({ K: 1e3, M: 1e6, B: 1e9 }[match[2]?.toUpperCase() ?? ''] ?? 1);
  return Number.isSafeInteger(Math.round(amount)) && amount >= 0 ? Math.round(amount) : undefined;
}

function rendererViewers(renderer: any) {
  for (const value of [renderer.viewCountText, renderer.shortViewCountText, renderer.viewCount?.videoViewCountRenderer?.viewCount]) {
    const count = youtubeConcurrentViewers(value); if (count !== undefined) return count;
  }
}

function lockupViewers(lockup: any) {
  const rows = lockup.metadata?.lockupMetadataViewModel?.metadata?.contentMetadataViewModel?.metadataRows ?? [];
  for (const row of rows) for (const part of row.metadataParts ?? []) {
    const count = youtubeConcurrentViewers(part.text); if (count !== undefined) return count;
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
    const initial = pageJson(html, 'ytInitialData');
    const primary = initial?.contents?.twoColumnWatchNextResults?.results?.results?.contents?.find((row: any) => row.videoPrimaryInfoRenderer)?.videoPrimaryInfoRenderer;
    return { id: details.videoId, title: details.title, viewers: primary ? rendererViewers(primary) : undefined };
  }
  const initial = pageJson(html, "ytInitialData");
  if (!initial) throw new Error("YouTube returned an unreadable live page. The previous live observation was kept.");
  return youtubeLiveData(initial, channelId)[0] ?? null;
}

export type YoutubeLiveObservation = { id: string; title?: string; viewers?: number };
/** Only explicit upcoming metadata is accepted; relative labels and waiting
 * counts are not a schedule or concurrent audience. */
export function youtubeUpcomingData(initial: any, channelId: string): import('../videos/youtube-events').UpcomingObservation[] {
  if(initial?.metadata?.channelMetadataRenderer?.externalId!==channelId)return [];
  const selected=initial.contents?.twoColumnBrowseResultsRenderer?.tabs?.find((row:any)=>row.tabRenderer?.selected)?.tabRenderer;
  const stack:any[]=[selected?.content],rows=new Map<string,import('../videos/youtube-events').UpcomingObservation>();
  while(stack.length){
    const node=stack.pop();if(!node||typeof node!=='object')continue;
    const r=node.videoRenderer??node.gridVideoRenderer;
    const lockup=node.lockupViewModel;
    if(r&&/^[\w-]{11}$/.test(r.videoId??'')){
      const upcoming=!!r.upcomingEventData||r.thumbnailOverlays?.some((o:any)=>o.thumbnailOverlayTimeStatusRenderer?.style==='UPCOMING')
        ||r.badges?.some((b:any)=>b.metadataBadgeRenderer?.style==='BADGE_STYLE_TYPE_UPCOMING_EVENT');
      const byline=r.ownerText??r.shortBylineText??r.longBylineText;
      const owner=byline?.runs?.find((x:any)=>x.navigationEndpoint?.browseEndpoint?.browseId)?.navigationEndpoint?.browseEndpoint?.browseId;
      if(upcoming&&(!owner||owner===channelId)){
        const raw=r.upcomingEventData?.startTime;
        const seconds=typeof raw==='string'&&/^\d{9,12}$/.test(raw)?Number(raw):NaN;
        const scheduledAt=seconds*1000;
        rows.set(r.videoId,{id:r.videoId,title:label(r.title),...(Number.isSafeInteger(scheduledAt)&&scheduledAt>=Date.UTC(2000,0,1)&&scheduledAt<Date.UTC(2200,0,1)?{scheduledAt}:{})});
      }
    }
    if(lockup&&/^[\w-]{11}$/.test(lockup.contentId??'')&&lockup.contentImage?.thumbnailViewModel?.overlays?.some((o:any)=>o.thumbnailBottomOverlayViewModel?.badges?.some((b:any)=>b.thumbnailBadgeViewModel?.badgeStyle==='THUMBNAIL_OVERLAY_BADGE_STYLE_UPCOMING')))
      rows.set(lockup.contentId,{id:lockup.contentId,title:label(lockup.metadata?.lockupMetadataViewModel?.title)});
    for(const value of Object.values(node))if(value&&typeof value==='object')stack.push(value);
  }
  return [...rows.values()].slice(0,64);
}
export function youtubeLiveData(initial: any, channelId: string): YoutubeLiveObservation[] {
  if (!initial || typeof initial !== 'object' || !initial.contents) throw new Error('YouTube returned an unreadable live catalog. The previous live observation was kept.');
  const owner = initial.metadata?.channelMetadataRenderer?.externalId;
  if (owner && owner !== channelId) throw new Error("YouTube returned a different creator's live page.");
  const tabs = initial.contents.twoColumnBrowseResultsRenderer?.tabs;
  const selected = tabs?.find((tab: any) => tab.tabRenderer?.selected)?.tabRenderer;
  validateYoutubeLiveContent(selected ? selected.content : initial.contents);
  const stack: any[] = [selected ? selected.content : initial.contents];
  const results: YoutubeLiveObservation[] = [], seen = new Set<string>();
  while (stack.length) {
    const node = stack.pop();
    if (!node || typeof node !== "object") continue;
    const renderer = node.videoRenderer ?? node.gridVideoRenderer;
    const lockup = node.lockupViewModel;
    if (lockup && /^[A-Za-z0-9_-]{11}$/.test(lockup.contentId ?? "")) {
      const overlays = lockup.contentImage?.thumbnailViewModel?.overlays ?? [];
      const viewers = lockupViewers(lockup);
      const live = viewers !== undefined || overlays.some((overlay: any) => overlay.thumbnailBottomOverlayViewModel?.badges?.some((badge: any) => badge.thumbnailBadgeViewModel?.badgeStyle === "THUMBNAIL_OVERLAY_BADGE_STYLE_LIVE"));
      const upcoming=overlays.some((overlay:any)=>overlay.thumbnailBottomOverlayViewModel?.badges?.some((badge:any)=>badge.thumbnailBadgeViewModel?.badgeStyle==='THUMBNAIL_OVERLAY_BADGE_STYLE_UPCOMING'));
      if (live && !upcoming && !seen.has(lockup.contentId)) { seen.add(lockup.contentId); results.push({ id: lockup.contentId, title: lockup.metadata?.lockupMetadataViewModel?.title?.content, ...(viewers !== undefined ? { viewers } : {}) }); }
    }
    if (renderer && /^[A-Za-z0-9_-]{11}$/.test(renderer.videoId ?? "")) {
      const viewers = rendererViewers(renderer);
      const live = viewers !== undefined || renderer.thumbnailOverlays?.some((overlay: any) => overlay.thumbnailOverlayTimeStatusRenderer?.style === "LIVE")
        || renderer.badges?.some((badge: any) => badge.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW");
      const byline = renderer.ownerText ?? renderer.shortBylineText ?? renderer.longBylineText;
      const rowOwner = byline?.runs?.find((run: any) => run.navigationEndpoint?.browseEndpoint?.browseId)?.navigationEndpoint?.browseEndpoint?.browseId;
      const upcoming=renderer.upcomingEventData||renderer.thumbnailOverlays?.some((o:any)=>o.thumbnailOverlayTimeStatusRenderer?.style==='UPCOMING')||renderer.badges?.some((b:any)=>b.metadataBadgeRenderer?.style==='BADGE_STYLE_TYPE_UPCOMING_EVENT');
      if (live && !upcoming && (!rowOwner || rowOwner === channelId) && !seen.has(renderer.videoId)) { seen.add(renderer.videoId); results.push({ id: renderer.videoId, title: renderer.title?.simpleText ?? renderer.title?.runs?.map((r: any) => r.text ?? "").join(""), ...(viewers !== undefined ? { viewers } : {}) }); }
    }
    for (const value of Object.values(node)) if (value && typeof value === "object") stack.push(value);
  }
  return results.slice(0, 64);
}
