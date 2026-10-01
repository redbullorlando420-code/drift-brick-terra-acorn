import { useEffect, useMemo, useState } from 'react';
import { loadCatalogVideo } from '@/lib/videos/persist';
import { withCatalogDetails } from '@/lib/videos/catalog-card';
import type { LibraryVideo } from '@/lib/videos/types';
// Keep only a handful of opened full records, never another provider catalog.
const details = new Map<string, LibraryVideo>();
const MAX_DETAILS = 12;
export function clearVideoDetailCache() { details.clear(); }
export function useVideoDetails(card: LibraryVideo | undefined) {
  const [loaded, setLoaded] = useState<LibraryVideo>();
  useEffect(() => {
    if (!card?.detailsOnDisk) { setLoaded(undefined); return; }
    let cancelled = false;
    const cached = details.get(card.id);
    if (cached) { setLoaded(cached); return; }
    void loadCatalogVideo(card.id).then(video => {
      if (cancelled || !video) return;
      // Giant transcripts remain usable for the current viewer, but are not
      // retained in the reusable detail cache afterwards.
      const weight = (video.description?.length ?? 0) + (video.remote?.comments ?? []).reduce((sum, row) => sum + row.body.length, 0);
      if (weight < 128_000) {
        details.set(video.id, video);
        while (details.size > MAX_DETAILS) details.delete(details.keys().next().value!);
      }
      setLoaded(video);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [card?.id, card?.detailsOnDisk]);
  return useMemo(() => card && loaded?.id === card.id ? withCatalogDetails(card, loaded) : card, [card, loaded]);
}
const onVisibility = () => { if (document.hidden) clearVideoDetailCache(); };
const onDetailsChanged = (event: Event) => { details.delete((event as CustomEvent<string>).detail); };
if (typeof window !== 'undefined') {
  window.addEventListener('reelcase:video-details-changed', onDetailsChanged);
  window.addEventListener('pagehide', clearVideoDetailCache);
  document.addEventListener('visibilitychange', onVisibility);
  import.meta.hot?.dispose(() => {
    window.removeEventListener('reelcase:video-details-changed', onDetailsChanged);
    window.removeEventListener('pagehide', clearVideoDetailCache);
    document.removeEventListener('visibilitychange', onVisibility);
    clearVideoDetailCache();
  });
}
