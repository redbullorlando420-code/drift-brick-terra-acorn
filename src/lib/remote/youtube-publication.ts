import { exactYoutubePublished } from '../videos/youtube-metadata.ts';
/** Read only the selected video's player metadata, never a recommendation date. */
export function youtubeWatchPublication(html: string, videoId: string): string | undefined {
  const marker = /(?:var\s+ytInitialPlayerResponse\s*=|ytInitialPlayerResponse\s*=)\s*/g;
  if (marker.exec(html)) {
    const start = marker.lastIndex; let depth = 0, quoted = false, escaped = false;
    for (let i = start; i < html.length; i++) {
      const c = html[i];
      if (quoted) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === '"') quoted = false; }
      else if (c === '"') quoted = true;
      else if (c === '{') depth++;
      else if (c === '}' && --depth === 0) {
        try {
          const data = JSON.parse(html.slice(start, i + 1));
          if (data.videoDetails?.videoId !== videoId || data.videoDetails?.isLive === true || data.videoDetails?.isUpcoming === true) return;
          const micro = data.microformat?.playerMicroformatRenderer;
          if (micro?.liveBroadcastDetails?.isLiveNow === true) return;
          return exactYoutubePublished(micro?.publishDate) ?? exactYoutubePublished(micro?.uploadDate);
        } catch { break; }
      }
    }
  }
  // Canonical identity protects the HTML-only fallback from redirects/consent pages.
  if (!html.includes(`watch?v=${videoId}`)) return;
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (!/itemprop\s*=\s*["']datePublished["']/i.test(tag)) continue;
    return exactYoutubePublished(tag.match(/content\s*=\s*["']([^"']+)["']/i)?.[1]);
  }
}
