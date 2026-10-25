import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchLiveRooms } from '@/lib/remote/functions';
import { LIVE_ROOM_PAGE_SIZE, type LiveRoomPage, type LiveRoomProvider } from '@/lib/remote/live-rooms';
import { registerPeriodicTask } from '@/lib/periodic-work';
import { getPullSettings } from '@/lib/pull-settings';
import { catalogPullAvailable, subscribePullAvailability } from '@/lib/pull-control';

type State = { page: LiveRoomPage | null; index: number; busy: boolean; error?: string; retryAt?: number };
/** Only six small directory pages are retained. Navigation aborts obsolete
 * requests; a failed Next keeps the current page and its continuation usable. */
export function useLiveRoomPage(provider: LiveRoomProvider, enabled: boolean) {
  const [state, setState] = useState<State>({ page: null, index: 0, busy: false });
  const [clock, setClock] = useState(Date.now);
  const latest = useRef(state); latest.current = state;
  const cache = useRef(new Map<number, LiveRoomPage>()), offsets = useRef([0]);
  const revision = useRef(0), active = useRef<AbortController | null>(null);
  const load = useCallback(async (offset: number, index: number, fresh = false) => {
    if (!enabled) return;
    if ((latest.current.retryAt ?? 0) > Date.now()) return;
    const token = ++revision.current; active.current?.abort();
    const cached = cache.current.get(offset);
    if (!fresh && cached && !cached.stale && Date.now() - cached.checkedAt < 120_000) {
      setState({ page: cached, index, busy: false }); return;
    }
    const controller = new AbortController(); active.current = controller;
    setState(previous => ({ ...previous, busy: true, error: undefined }));
    try {
      const page = await fetchLiveRooms({ data: { provider, offset, limit: LIVE_ROOM_PAGE_SIZE }, signal: controller.signal });
      if (controller.signal.aborted || token !== revision.current) return;
      if (!page || page.provider !== provider || !Array.isArray(page.videos) || page.offset !== offset) throw new Error('The live directory returned an unreadable page. Retry this source.');
      cache.current.delete(offset); cache.current.set(offset, page);
      while (cache.current.size > 6) cache.current.delete(cache.current.keys().next().value!);
      offsets.current[index] = offset;
      if (page.nextOffset !== null) offsets.current[index + 1] = page.nextOffset;
      offsets.current.length = index + (page.nextOffset === null ? 1 : 2);
      setState({ page, index, busy: false, error: page.error, retryAt: page.retryAt });
    } catch (error) {
      if (controller.signal.aborted || token !== revision.current) return;
      const message = error instanceof Error ? error.message : 'This live source could not be reached.';
      setState(previous => ({ ...previous, busy: false, error: message, retryAt: /429|rate.limit/i.test(message) ? Date.now() + 60_000 : undefined }));
    }
  }, [provider, enabled]);
  useEffect(() => {
    if (!enabled) { setState(previous => previous.busy ? { ...previous, busy: false } : previous); return; }
    if (!latest.current.page || Date.now() - latest.current.page.checkedAt >= 120_000) void load(0, 0, true);
    const task = registerPeriodicTask({ name: provider + ' live directory', everyMs: 120_000, firstMs: 120_000, mode: 'visible',
      enabled: () => getPullSettings().automaticPulls && catalogPullAvailable(true, true) && navigator.onLine,
      work: () => { const current = latest.current; if (catalogPullAvailable(false, true) && !current.busy && (!current.page || Date.now() - current.page.checkedAt >= 120_000)) return load(current.page?.offset ?? 0, current.index, true); } });
    const off = subscribePullAvailability(task.wake);
    return () => { revision.current++; active.current?.abort(); task.cancel(); off(); };
  }, [enabled, load, provider]);
  useEffect(() => {
    if (!state.page) return;
    const timer = setTimeout(() => setClock(Date.now()), Math.max(1, state.page.checkedAt + 180_001 - Date.now()));
    return () => clearTimeout(timer);
  }, [state.page]);
  return { ...state, stale: Boolean(state.page && (state.page.stale || Math.max(clock, Date.now()) - state.page.checkedAt > 180_000)), previous: () => load(offsets.current[Math.max(0, state.index - 1)] ?? 0, Math.max(0, state.index - 1)),
    next: () => state.page?.nextOffset !== null && state.page?.nextOffset !== undefined ? load(state.page.nextOffset, state.index + 1) : undefined,
    refresh: () => { cache.current.clear(); return load(0, 0, true); } };
}
