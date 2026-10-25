import { createServerFn } from '@tanstack/react-start';
import { fetchYoutubeResponse } from './youtube-transport';
import { youtubeWatchPublication } from './youtube-publication';
import { youtubeWatchMetadata, type YoutubeVideoMetadata } from './youtube-video-metadata';
const cache = new Map<string, { metadata?: YoutubeVideoMetadata; expires: number }>();
const pending = new Map<string, Promise<YoutubeVideoMetadata | undefined>>();
async function read(id: string) {
  const cached = cache.get(id); if (cached && cached.expires > Date.now()) return cached.metadata;
  if (pending.has(id)) return pending.get(id);
  const task = (async () => {
    const response = await fetchYoutubeResponse(`https://www.youtube.com/watch?v=${id}`, { timeoutMs: 12000 });
    if (!response.ok) throw new Error(`YouTube returned HTTP ${response.status}.`);
    const html = await response.text();
    const metadata = youtubeWatchMetadata(html, id) ?? (youtubeWatchPublication(html, id) ? { id, date: youtubeWatchPublication(html, id) } : undefined);
    const hasDetails = metadata?.description !== undefined || metadata?.keywords !== undefined || metadata?.duration !== undefined;
    cache.delete(id); cache.set(id, { metadata, expires: Date.now() + (hasDetails ? 6 * 60 * 60_000 : 5 * 60_000) });
    while (cache.size > 256) cache.delete(cache.keys().next().value!);
    return metadata;
  })().finally(() => pending.delete(id));
  pending.set(id, task); return task;
}
export const fetchYoutubePublication = createServerFn({ method: 'POST' }).validator((data: unknown) => {
  const ids = (data as { ids?: unknown })?.ids;
  if (!Array.isArray(ids) || ids.length > 5 || ids.some(id => typeof id !== 'string' || !/^[\w-]{11}$/.test(id))) throw new Error('Choose one to five YouTube videos.');
  return [...new Set(ids)] as string[];
}).handler(async ({ data }) => {
  const results: { id: string; date?: string; error?: string }[] = [];
  for (const id of data) { try { results.push({ id, date: (await read(id))?.date }); } catch (cause) { results.push({ id, error: cause instanceof Error ? cause.message : 'YouTube date unavailable.' }); break; } }
  return results;
});

/** Explicit, one-video request: cancellation between rows never fans out five
 * queued watch pages. The same serial transport/cache serves date checks. */
export const fetchYoutubeVideoMetadata = createServerFn({ method: 'POST' }).validator((data: unknown) => {
  const id = (data as { id?: unknown })?.id;
  if (typeof id !== 'string' || !/^[\w-]{11}$/.test(id)) throw new Error('Choose a valid YouTube video.');
  return id;
}).handler(async ({ data }) => {
  const metadata = await read(data);
  if (!metadata || metadata.description === undefined && metadata.keywords === undefined && metadata.duration === undefined) throw new Error('YouTube did not expose a runtime, tags or a description. Saved metadata was kept. Sign-in, age restrictions or a consent page can prevent public metadata access.');
  return metadata;
});
