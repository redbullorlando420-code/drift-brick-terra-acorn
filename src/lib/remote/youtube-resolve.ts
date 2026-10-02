import { youtubePublicRequest } from './youtube-browse';
import { exactYoutubeChannelData } from './youtube-channel-search';
import type { YoutubeManualRetry } from './youtube-transport';

/** Names are search queries, never guessed handles. Explicit links must return
 * a channel browse endpoint rather than a video/playlist/recommended channel. */
export async function resolveYoutubeCreator(query: string, retry?: YoutubeManualRetry): Promise<string> {
  const text = query.trim().replaceAll('\\_', '_');
  if (/^UC[A-Za-z0-9_-]{22}$/.test(text)) return text;
  const explicit = /^(?:@|https?:\/\/|(?:www\.)?youtube\.com\/)/i.test(text);
  let id: string | null = null;
  if (explicit) {
    const url = text.startsWith('@') ? `https://www.youtube.com/${text}` : /^https?:\/\//i.test(text) ? text : `https://${text}`;
    const parsed = new URL(url);
    if (!/(^|\.)youtube\.com$/i.test(parsed.hostname)) throw new Error('Use a YouTube channel URL or @handle.');
    const direct = parsed.pathname.match(/^\/channel\/(UC[A-Za-z0-9_-]{22})(?:\/|$)/)?.[1];
    if (direct) return direct;
    const data = await youtubePublicRequest('navigation/resolve_url', { url }, retry);
    id = data.endpoint?.browseEndpoint?.browseId ?? null;
  } else {
    const data = await youtubePublicRequest('search', { query: text, params: 'EgIQAg==' }, retry);
    id = exactYoutubeChannelData(data, text);
  }
  if (!id || !/^UC[A-Za-z0-9_-]{22}$/.test(id)) throw new Error('No unique exact YouTube channel match. Paste the creator’s @handle or channel URL; its videos were kept.');
  return id;
}
