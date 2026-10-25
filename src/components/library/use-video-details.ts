import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import { loadCatalogVideo } from '@/lib/videos/persist';
import { withCatalogDetails } from '@/lib/videos/catalog-card';
import type { LibraryVideo } from '@/lib/videos/types';
import { viewerDetails } from '@/lib/videos/viewer-details';
export function clearVideoDetailCache() { viewerDetails.clearCache(); }
export function useVideoDetails(card: LibraryVideo | undefined) {
  const [loaded, setLoaded] = useState<LibraryVideo>();
  const subscribe = useCallback((listener: () => void) => viewerDetails.subscribe(card?.id, listener), [card?.id]);
  const comments = useSyncExternalStore(subscribe, () => viewerDetails.commentsFor(card?.id), () => undefined);
  useEffect(() => {
    if (!card?.detailsOnDisk) { setLoaded(undefined); return; }
    let cancelled = false;
    void viewerDetails.load(card.id, () => loadCatalogVideo(card.id)).then(video => {
      if (cancelled || !video) return;
      setLoaded(video);
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [card]);
  return useMemo(() => {
    const video = card && loaded?.id === card.id ? withCatalogDetails(card, loaded) : card;
    return video?.remote && comments !== undefined ? { ...video, remote: { ...video.remote, comments } } : video;
  }, [card, loaded, comments]);
}
const onVisibility = () => { if (document.hidden) clearVideoDetailCache(); };
const onPageHide = () => viewerDetails.clear();
const onDetailsChanged = (event: Event) => { viewerDetails.invalidate((event as CustomEvent<string>).detail); };
if (typeof window !== 'undefined') {
  window.addEventListener('reelcase:video-details-changed', onDetailsChanged);
  window.addEventListener('pagehide', onPageHide);
  document.addEventListener('visibilitychange', onVisibility);
  import.meta.hot?.dispose(() => {
    window.removeEventListener('reelcase:video-details-changed', onDetailsChanged);
    window.removeEventListener('pagehide', onPageHide);
    document.removeEventListener('visibilitychange', onVisibility);
    clearVideoDetailCache();
  });
}
