import { parseProviderJson } from './provider-json.ts';
import { ProviderBudgetError } from '../provider-budgets.ts';
import { exactYoutubePublished } from '../videos/youtube-metadata.ts';

export type YoutubeVideoMetadata = { id: string; description?: string; keywords?: string[]; date?: string; duration?: number };
/** Parse one bounded, identity-checked player response. Recommendations and
 * consent/error pages must never contribute another video's tags. */
export function youtubeWatchMetadata(html: string, id: string): YoutubeVideoMetadata | undefined {
  if (!/^[\w-]{11}$/.test(id)) return;
  const marker = /(?:var\s+ytInitialPlayerResponse\s*=|window\[\s*["']ytInitialPlayerResponse["']\s*\]\s*=|ytInitialPlayerResponse\s*=)\s*/g;
  if (!marker.exec(html)) return;
  const start = marker.lastIndex;
  if (html[start] !== '{') return;
  let depth = 0, quoted = false, escaped = false;
  for (let i = start; i < Math.min(html.length, start + 2_000_000); i++) {
    const c = html[i];
    if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
    else if (c === '"') quoted = true;
    else if (c === '{') depth++;
    else if (c === '}' && --depth === 0) {
      try {
        const data = parseProviderJson(html.slice(start, i + 1)), details = data.videoDetails;
        if (details?.videoId !== id || data.playabilityStatus?.status && data.playabilityStatus.status !== 'OK') return;
        const micro = data.microformat?.playerMicroformatRenderer;
        const live = details.isLive === true || details.isUpcoming === true || micro?.liveBroadcastDetails?.isLiveNow === true;
        const keywords = Array.isArray(details.keywords) ? [...new Set<string>(details.keywords.slice(0, 80)
          .filter((word: unknown): word is string => typeof word === 'string')
          .map((word: string) => word.normalize('NFKC').trim().slice(0, 80)).filter(Boolean))].slice(0, 40) : undefined;
        const description = typeof details.shortDescription === 'string' ? details.shortDescription.slice(0, 16_000) : undefined;
        return { id, ...(description !== undefined ? { description } : {}), ...(keywords ? { keywords } : {}),
          ...(!live && Number.isFinite(Number(details.lengthSeconds)) && Number(details.lengthSeconds) > 0 && Number(details.lengthSeconds) <= 31_536_000 ? { duration: Number(details.lengthSeconds) } : {}),
          ...(!live ? { date: exactYoutubePublished(micro?.publishDate) ?? exactYoutubePublished(micro?.uploadDate) } : {}) };
      } catch(error) { if(error instanceof ProviderBudgetError)throw error;return; }
    }
  }
}
