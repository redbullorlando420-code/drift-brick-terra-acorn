/** Keep URL strings, not decoded images; release failed resolutions promptly. */
const cache = new Map<string, { at: number; promise: Promise<string | null> }>();
export function cachedBooruOriginal(host: string, id: string, resolve: () => Promise<string | null>) {
  const key = `${host}:${id}`, now = Date.now(), saved = cache.get(key);
  if (saved && now - saved.at < 30 * 60_000) return saved.promise;
  const promise = Promise.resolve().then(resolve).then(url => { if (!url && cache.get(key)?.promise === promise) cache.delete(key); return url; }, () => { if (cache.get(key)?.promise === promise) cache.delete(key); return null; });
  cache.set(key, { at: now, promise });
  while (cache.size > 128) cache.delete(cache.keys().next().value!);
  return promise;
}
