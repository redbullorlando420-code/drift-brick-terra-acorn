import { LIBRARY_LIMITS } from '../library-limits';
import { youtubeCatalogContinuation, youtubeCatalogItems } from './youtube-catalog';
import { youtubeVideoRenderers, type YoutubeRenderer } from './youtube-page-data';
import { fetchYoutubeResponse, YoutubeRequestError, type YoutubeManualRetry } from './youtube-transport';

// Public WEB metadata, also used by YouTube.js. Catalog requests do not need
// a player, cookies, or a channel HTML page to obtain an API key.
export const YOUTUBE_WEB_VERSION = '2.20260623.01.00';
export const youtubePlaylistBrowseId = (playlistId: string) => playlistId.startsWith('VL') ? playlistId : `VL${playlistId}`;

export async function youtubePublicRequest(endpoint: string, target: object, manualRetry?: YoutubeManualRetry, live = false): Promise<any> {
  const response = await fetchYoutubeResponse(`https://www.youtube.com/youtubei/v1/${endpoint}?prettyPrint=false&alt=json`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-youtube-client-name': '1', 'x-youtube-client-version': YOUTUBE_WEB_VERSION },
    body: JSON.stringify({ context: { client: { clientName: 'WEB', clientVersion: YOUTUBE_WEB_VERSION, hl: 'en', gl: 'US' } }, ...target }),
    timeoutMs: 15_000, manualRetry, ...(live ? { scope: 'live' as const } : {}),
  });
  return response.json();
}
export const browseYoutubeCatalog = (target: { browseId?: string; continuation?: string; params?: string }, manualRetry?: YoutubeManualRetry, live = false) => youtubePublicRequest('browse', target, manualRetry, live);

type Archive = { rows: YoutubeRenderer[]; cursor: string | null; completed: boolean; failure?: unknown; author?: string; title?: string };

/** Read complete provider pages, retaining the unconsumed token on every
 * failure. Resumed pulls start with the saved token, without fetching HTML,
 * RSS or the first hundred uploads again. */
export async function youtubeBrowseArchive(playlistId: string, limit: number, resumeCursor?: string, manualRetry?: YoutubeManualRetry): Promise<Archive | null> {
  const browseId = youtubePlaylistBrowseId(playlistId);
  const rows: YoutubeRenderer[] = [], seen = new Set<string>(), visited = new Set<string>();
  let cursor: string | null = resumeCursor ?? null, completed = false, reset = false, author: string | undefined, title: string | undefined;
  const deadline = Date.now() + (limit <= 100 ? 30_000 : 120_000);
  const budget = Math.min(LIBRARY_LIMITS.youtubeArchivePagesPerPull, Math.max(2, Math.ceil(limit / 30) + 2));
  for (let page = 0; page < budget && rows.length < limit; page++) {
    if (Date.now() >= deadline || cursor && visited.has(cursor)) break;
    const requesting = cursor;
    try {
      const root = await browseYoutubeCatalog(cursor ? { continuation: cursor } : { browseId }, manualRetry);
      title ??= (root as { metadata?: { playlistMetadataRenderer?: { title?: string } } })?.metadata?.playlistMetadataRenderer?.title;
      const items = youtubeCatalogItems(root);
      if (!items) {
        const alert = (root as { alerts?: Array<{ alertRenderer?: { type?: string; text?: { simpleText?: string; runs?: Array<{ text?: string }> } } }> })?.alerts?.find(row => row.alertRenderer?.type === 'ERROR')?.alertRenderer;
        if (alert) throw new Error(`YouTube catalog unavailable: ${alert.text?.simpleText ?? alert.text?.runs?.map(run => run.text ?? '').join('') ?? 'No public uploads.'}`);
        if (!rows.length) return null; // Unrecognized layouts retain HTML recovery.
        throw new Error('YouTube returned an unreadable catalog page; the archive position was preserved.');
      }
      const pageRows = youtubeVideoRenderers(items, 500);
      for (const row of pageRows) if (row.videoId && !seen.has(row.videoId)) { seen.add(row.videoId); rows.push(row); }
      if (!author) {
        const byline = (pageRows[0] as YoutubeRenderer & { shortBylineText?: { simpleText?: string; runs?: Array<{ text?: string }> } })?.shortBylineText;
        author = byline?.simpleText ?? byline?.runs?.map(run => run.text ?? '').join('');
      }
      const next = youtubeCatalogContinuation(root);
      if (requesting) visited.add(requesting);
      if (next === requesting && next) break;
      cursor = next;
      completed = !next;
      if (completed) break;
    } catch (error) {
      if (requesting === resumeCursor && !reset && error instanceof YoutubeRequestError && (error.status === 400 || error.status === 404)) {
        reset = true; cursor = null; continue;
      }
      if (rows.length) return { rows, cursor, completed: false, failure: error, author, title };
      if (error instanceof SyntaxError || error instanceof YoutubeRequestError && (error.status === 400 || error.status === 404) && !resumeCursor) return null;
      throw error;
    }
  }
  return { rows, cursor, completed, author, title };
}

export const youtubeUploadsArchive = (channelId: string, limit: number, resumeCursor?: string, manualRetry?: YoutubeManualRetry) =>
  youtubeBrowseArchive(`UU${channelId.slice(2)}`, limit, resumeCursor, manualRetry);
