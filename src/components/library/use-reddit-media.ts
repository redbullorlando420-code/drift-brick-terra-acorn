import { useEffect, useState } from 'react';
import { inspectRedditImage } from '@/lib/remote/functions';
import { isRemovedRedditVideo } from '@/lib/videos/reddit-removed';
import { useLibrary } from '@/lib/videos/store';
import type { LibraryVideo } from '@/lib/videos/types';

export function useRedditMedia(video: LibraryVideo | undefined) {
  const [removedId, setRemovedId] = useState('');
  const markUnavailable = useLibrary(s => s.markUnavailable);
  const known = Boolean(video && isRemovedRedditVideo(video));
  const src = video?.src || video?.remote?.embedUrl || video?.remote?.previewUrl || video?.poster;
  const redditPhoto = video?.remote?.kind === 'reddit' && /^image\//.test(video.mime ?? '');
  useEffect(() => {
    if (!video || !redditPhoto || !src) return;
    let cancelled = false;
    const hide = () => { if (!cancelled) { setRemovedId(video.id); markUnavailable(video.id, 'Removed by Reddit'); } };
    if (known) hide();
    else void inspectRedditImage({ data: src }).then(result => { if (result.removed) hide(); }).catch(() => undefined);
    return () => { cancelled = true; };
  }, [video?.id, redditPhoto, src, known, markUnavailable]);
  return known || Boolean(video && removedId === video.id);
}
