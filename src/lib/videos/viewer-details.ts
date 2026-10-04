import type { LibraryVideo, RemoteRef } from './types';
type Comments = RemoteRef['comments'];
const MAX_ENTRIES = 12, MAX_BYTES = 512_000, MAX_ENTRY_BYTES = 128_000;
function detailBytes(video: LibraryVideo) {
  let bytes = 512;
  for (const value of Object.values(video)) if (typeof value === 'string') bytes += value.length * 2;
  for (const value of Object.values(video.remote ?? {})) {
    if (typeof value === 'string') bytes += value.length * 2;
    else if (Array.isArray(value)) for (const item of value) if (typeof item === 'string') bytes += item.length * 2 + 16;
  }
  for (const row of video.remote?.comments ?? []) {
    bytes += 128;
    for (const value of Object.values(row)) if (typeof value === 'string') bytes += value.length * 2;
  }
  return bytes;
}
/** Viewer-only details never change the browse catalog. One current transcript,
 * a byte-bounded reuse cache, and coalesced disk reads keep memory predictable. */
export function createViewerDetails() {
  const cache = new Map<string, { video: LibraryVideo; bytes: number }>();
  const pending = new Map<string, { promise: Promise<LibraryVideo | undefined> }>();
  const listeners = new Map<string, Set<() => void>>();
  let bytes = 0, current: { id: string; comments: Comments } | undefined;
  const notify = (id: string | undefined) => { if (id) for (const listener of listeners.get(id) ?? []) listener(); };
  const invalidate = (id: string) => {
    const row = cache.get(id); if (row) bytes -= row.bytes;
    cache.delete(id); pending.delete(id);
  };
  const clearCache = () => { cache.clear(); pending.clear(); bytes = 0; };
  const releaseComments = () => { const id = current?.id; current = undefined; notify(id); };
  return {
    invalidate, clearCache, releaseComments,
    releaseCommentsExcept(id: string | null) { if (current && current.id !== id) releaseComments(); },
    clear() { clearCache(); releaseComments(); },
    commentsFor(id: string | undefined) { return current?.id === id ? current?.comments : undefined; },
    setComments(id: string, comments: Comments) {
      const previousId = current?.id;
      invalidate(id); current = { id, comments };
      if (previousId !== id) notify(previousId);
      notify(id);
    },
    subscribe(id: string | undefined, listener: () => void) {
      if (!id) return () => {};
      let group = listeners.get(id); if (!group) { group = new Set(); listeners.set(id, group); }
      group.add(listener);
      return () => { group.delete(listener); if (!group.size) listeners.delete(id); };
    },
    load(id: string, read: () => Promise<LibraryVideo | undefined>): Promise<LibraryVideo | undefined> {
      const hit = cache.get(id);
      if (hit) { cache.delete(id); cache.set(id, hit); return Promise.resolve(hit.video); }
      const existing = pending.get(id); if (existing) return existing.promise;
      // Only a small number of viewers can be preparing. Forgotten requests
      // may finish for their caller but cannot repopulate the cache afterwards.
      while (pending.size >= 4) pending.delete(pending.keys().next().value!);
      const job = { promise: undefined as unknown as Promise<LibraryVideo | undefined> };
      job.promise = Promise.resolve().then(read).then(video => {
        if (pending.get(id) !== job || !video || video.id !== id) return video;
        const weight = detailBytes(video);
        if (weight <= MAX_ENTRY_BYTES) {
          cache.set(id, { video, bytes: weight }); bytes += weight;
          while (cache.size > MAX_ENTRIES || bytes > MAX_BYTES) {
            const oldest = cache.keys().next().value!; bytes -= cache.get(oldest)!.bytes; cache.delete(oldest);
          }
        }
        return video;
      }).finally(() => { if (pending.get(id) === job) pending.delete(id); });
      pending.set(id, job); return job.promise;
    },
    diagnostics() { return { entries: cache.size, estimatedBytes: bytes, maxEntries: MAX_ENTRIES, maxBytes: MAX_BYTES, pending: pending.size, activeTranscripts: current ? 1 : 0, subscribers: listeners.size }; },
  };
}
export const viewerDetails = createViewerDetails();
