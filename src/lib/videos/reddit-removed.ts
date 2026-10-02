import type { LibraryVideo } from './types';

/** Exact removal notices, rather than ordinary titles discussing moderation. */
export function isRedditRemovalText(value: string): boolean {
  const text = value.replace(/&(?:lt|gt);/g, ' ').replace(/<[^>]*>/g, ' ').replace(/&#(?:32|160);|&nbsp;/g, ' ').trim();
  return /^\[(?:removed|deleted)\]$/i.test(text)
    || /\[\s*removed by reddit\s*\]/i.test(text)
    || (/<svg\b/i.test(value) && /\bremoved by reddit\b/i.test(text))
    || /^\s*(?:#\s*)?\[?\s*removed by reddit\s*\]?(?:\s|$)/i.test(text)
    || /this post was removed because it violated\s+(?:reddit\s+)?rule\s*8\b/i.test(text)
    || /this (?:post|content) (?:has been|was) removed by reddit/i.test(text);
}

export function isRedditRemovalUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return /^(?:i|preview|external-preview)\.redd\.it$/.test(url.hostname)
      && /(?:\/(?:removed|deleted|unavailable)(?:[._/-]|$)|\.svg$)/i.test(url.pathname);
  } catch { return false; }
}

export function isRemovedRedditVideo(video: LibraryVideo): boolean {
  if (video.remote?.kind !== 'reddit' && !video.remote?.sourceKinds?.includes('reddit')) return false;
  return isRedditRemovalText(video.name) || isRedditRemovalText(video.description ?? video.tagline ?? '')
    || [video.src, video.poster, video.remote?.embedUrl, video.remote?.previewUrl].some(isRedditRemovalUrl);
}
