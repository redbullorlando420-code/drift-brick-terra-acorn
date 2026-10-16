import { useEffect, useState } from 'react';
import type { LibraryVideo, ResumeMark } from '@/lib/videos/types';
import { buildFavoriteRails, emptyFavoriteRails } from '@/lib/videos/favorite-rails';
import { yieldCatalogTask } from '@/lib/catalog-work';

export function useFavoriteRails(enabled: boolean, videos: LibraryVideo[], progress: Record<string, ResumeMark>, favorites: Record<string, true>, likes: Record<string, true>) {
  const [result, setResult] = useState<{ videos: LibraryVideo[]; favorites: Record<string, true>; likes: Record<string, true>; value: ReturnType<typeof emptyFavoriteRails> } | null>(null);
  useEffect(() => {
    if (!enabled) { setResult(null); return; }
    let cancelled = false;
    const turn = async () => { await yieldCatalogTask(); if (cancelled) throw new Error('Favorite shelves replaced'); };
    void buildFavoriteRails(videos, progress, turn, favorites, likes).then(value => { if (!cancelled) setResult({ videos, favorites, likes, value }); }).catch(() => {});
    return () => { cancelled = true; };
  }, [enabled, videos, progress, favorites, likes]);
  const ready = enabled && result?.videos === videos && result.favorites === favorites && result.likes === likes;
  return { ...(ready ? result.value : emptyFavoriteRails()), ready };
}
