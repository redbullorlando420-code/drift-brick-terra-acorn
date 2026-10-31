import { parseProviderJson } from './provider-json.ts';
import { ProviderBudgetError } from '../provider-budgets.ts';
import { exactYoutubePublished } from '../videos/youtube-metadata.ts';
/** Read only the selected video's player metadata, never a recommendation date. */
export function youtubeWatchPublication(html: string, videoId: string): string | undefined {
  if(!/^[\w-]{11}$/.test(videoId))return;
  const marker = /(?:var\s+ytInitialPlayerResponse\s*=|ytInitialPlayerResponse\s*=)\s*/g;
  if (marker.exec(html)) {
    const start = marker.lastIndex; let depth = 0, quoted = false, escaped = false;
    for (let i = start; i < Math.min(html.length,start+2_000_000); i++) {
      const c = html[i];
      if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
      else if (c === '"') quoted = true;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) {
        try {
          const data = parseProviderJson(html.slice(start, i + 1));
          if (data.playabilityStatus?.status && data.playabilityStatus.status!=='OK')return;
           if (data.videoDetails?.videoId !== videoId || data.videoDetails?.isLive === true || data.videoDetails?.isUpcoming === true) return;
          const micro = data.microformat?.playerMicroformatRenderer;
          if (micro?.liveBroadcastDetails?.isLiveNow === true) return;
          return exactYoutubePublished(micro?.publishDate) ?? exactYoutubePublished(micro?.uploadDate);
        } catch(error) { if(error instanceof ProviderBudgetError)throw error;return; }
      }
    }
  }
  // Canonical identity protects the HTML-only fallback from redirects/consent pages.
  const canonical=(html.match(/<link\b[^>]*>/gi)??[]).some(tag=>{
    if(!/rel\s*=\s*["']canonical["']/i.test(tag))return false;
    const href=tag.match(/href\s*=\s*["']([^"']+)["']/i)?.[1];
    try{const url=new URL(href?.replaceAll('&amp;','&')??'');return url.protocol==='https:'&&['www.youtube.com','youtube.com','m.youtube.com'].includes(url.hostname)&&url.pathname==='/watch'&&url.searchParams.get('v')===videoId;}catch{return false;}
  });
  if(!canonical)return;
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!/itemprop\s*=\s*["']datePublished["']/i.test(tag)) continue;
    return exactYoutubePublished(tag.match(/content\s*=\s*["']([^"']+)["']/i)?.[1]);
  }
}
