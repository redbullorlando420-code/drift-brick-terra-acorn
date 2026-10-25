import { useEffect, useState } from 'react';
import { youtubeCoverageIndexAsync, type YoutubeCoverageIndex } from '@/lib/remote/youtube-coverage';
import type { LibraryVideo } from '@/lib/videos/types';
import { useBrowseLibrary } from './use-browse-library';

const EMPTY: LibraryVideo[] = [];
const EMPTY_INDEX: YoutubeCoverageIndex = { bySource: new Map(), byChannel: new Map(), overlap: new Map(), newestBySource: new Map(), newestByChannel: new Map(), ownerSamples: new Map(), distinctVideos: 0, duplicateRows: 0, duplicateGroups: 0 };
export function useYoutubeCoverage(enabled: boolean) {
  // Count the saved catalog, including hidden entries. Visibility filters are
  // shelf preferences and cannot turn a populated source into an empty one.
  const videos = useBrowseLibrary(state => enabled ? state.videos : EMPTY);
  const [snapshot, setSnapshot] = useState<{ videos: LibraryVideo[]; index: YoutubeCoverageIndex }>({ videos: EMPTY, index: EMPTY_INDEX });
  useEffect(() => {
    if (!enabled) { setSnapshot({ videos: EMPTY, index: EMPTY_INDEX }); return; }
    const controller = new AbortController();
    void youtubeCoverageIndexAsync(videos, controller.signal).then(index => {
      if (!controller.signal.aborted) setSnapshot({ videos, index });
    }).catch(() => { /* A replaced catalog or closed desk releases its scan. */ });
    return () => controller.abort();
  }, [enabled, videos]);
  return { index: snapshot.index, updating: enabled && snapshot.videos !== videos };
}
