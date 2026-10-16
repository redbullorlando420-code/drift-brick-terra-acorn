import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { scheduleBackgroundWork } from '@/lib/interaction-budget';
import { yieldNavigationTask } from '@/lib/navigation-work';
import { useLibrary } from '@/lib/videos/store';
import { prepareYoutubeTopics, releaseYoutubeTopics } from '@/lib/remote/youtube-discovery';
import { prepareYoutubeExploreShelves, prepareYoutubePrimaryShelves, prepareYoutubeWatchedCreators, type YoutubeShelfInputs } from '@/lib/remote/youtube-shelves';
import type { LibraryVideo } from '@/lib/videos/types';

/** Build off the render path. At most one cancellable job and one result are
 * retained per shelf group; stale filter/pull results never reach the screen. */
function usePrepared<T, R>(enabled: boolean, input: T, prepare: (input: T, signal: AbortSignal, turn: () => Promise<void>) => Promise<R>) {
  const viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const [packet, setPacket] = useState<{ input: T; value: R }>();
  const [failed, setFailed] = useState<T>();
  useEffect(() => {
    if (!enabled) { setPacket(undefined); setFailed(undefined); return; }
    if (viewer || packet?.input === input) return;
    const controller = new AbortController();
    const turn = () => yieldNavigationTask(controller.signal);
    const cancel = scheduleBackgroundWork(() => {
      void prepare(input, controller.signal, turn).then(value => {
        if (!controller.signal.aborted) startTransition(() => { setPacket({ input, value }); setFailed(undefined); });
      }).catch(() => { if (!controller.signal.aborted) setFailed(input); });
    });
    return () => { controller.abort(); cancel(); };
  }, [enabled, input, prepare, viewer, packet?.input]);
  return { value: enabled && packet?.input === input ? packet.value : undefined, pending: enabled && packet?.input !== input && failed !== input, failed: enabled && failed === input };
}

const topics = (input: { videos: LibraryVideo[]; tags: Record<string, string[]> }, signal: AbortSignal, turn: () => Promise<void>) => prepareYoutubeTopics(input.videos, input.tags, signal, turn);
const EMPTY_HISTORY: YoutubeShelfInputs['history'] = [];
const EMPTY_VIEWS: YoutubeShelfInputs['viewCounts'] = {};
function useShelfInputs(input: YoutubeShelfInputs, primary: boolean) {
  const previous = useRef<YoutubeShelfInputs['follows']>([]);
  const selected = useMemo(() => input.follows.filter(row => row.kind === 'youtube' && (!primary || row.id.startsWith('ytpl:'))), [input.follows, primary]);
  // Provider progress updates lastCheckedAt/retryAt frequently. They do not
  // change playlist membership or discovery identity, and must not restart
  // a catalog-sized job every time the pull status changes.
  if (selected.length !== previous.current.length || selected.some((row, i) => {
    const old = previous.current[i]; return old.id !== row.id || old.title !== row.title || !primary && old.channelId !== row.channelId;
  })) previous.current = selected;
  const follows = previous.current, history = primary ? EMPTY_HISTORY : input.history, viewCounts = primary ? EMPTY_VIEWS : input.viewCounts;
  return useMemo(() => ({ catalog: input.catalog, videos: input.videos, seed: input.seed, follows, history, viewCounts }), [input.catalog, input.videos, input.seed, follows, history, viewCounts]);
}
export function useYoutubeTopics(enabled: boolean, input: Parameters<typeof topics>[0]) {
  useEffect(() => { if (enabled) return () => releaseYoutubeTopics(input.videos, input.tags); }, [enabled, input]);
  return usePrepared(enabled, input, topics);
}
export function useYoutubePrimaryShelves(enabled: boolean, input: YoutubeShelfInputs) { return usePrepared(enabled, useShelfInputs(input, true), prepareYoutubePrimaryShelves); }
export function useYoutubeExploreShelves(enabled: boolean, input: YoutubeShelfInputs) { return usePrepared(enabled, useShelfInputs(input, false), prepareYoutubeExploreShelves); }
export function useYoutubeWatchedCreators(enabled: boolean, input: Parameters<typeof prepareYoutubeWatchedCreators>[0]) { return usePrepared(enabled, input, prepareYoutubeWatchedCreators); }
