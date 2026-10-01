import { useEffect, useState } from 'react';
import { resolveBooruOriginal } from '@/lib/remote/functions';
import { cachedBooruOriginal } from '@/lib/videos/booru-original-cache';
import type { LibraryVideo } from '@/lib/videos/types';

/** Shared by preview and player; resolving the selected image never scans a shelf. */
export function useBooruOriginal(video?: LibraryVideo) {
  const remote = video?.remote;
  const host = remote?.kind === 'booru' ? remote.channelId : undefined;
  const id = host ? remote?.videoId : undefined;
  const key = host && id ? `${host}:${id}` : '';
  const [result, setResult] = useState({ key: '', url: null as string | null, loading: false });
  useEffect(() => {
    if (!host || !id) return;
    let active = true;
    setResult({ key, url: null, loading: true });
    void cachedBooruOriginal(host, id, () => resolveBooruOriginal({ data: { host, id } })).then(url => {
      if (active) setResult({ key, url, loading: false });
    });
    return () => { active = false; };
  }, [host, id, key]);
  return {
    original: result.key === key ? result.url : null,
    loading: Boolean(key) && (result.key !== key || result.loading),
    failed: () => setResult({ key, url: null, loading: false }),
  };
}
