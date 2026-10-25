import { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { catalogTurn } from '@/lib/catalog-turn';
import { useSessionPhase } from '@/lib/use-session-phase';
import { useLibrary } from '@/lib/videos/store';
import { filterHistory, historyExportBlob, prepareHistoryIndex, prepareHistoryTags,
  type HistoryIndex, type HistorySource, type HistoryWindow } from '@/lib/videos/history-browse';
import type { HistoryEntry, LibraryVideo } from '@/lib/videos/types';

const EMPTY_INDEX: HistoryIndex = { history: [], videos: [], byId: new Map(), playedAt: {}, lastDay: 0, orphans: 0,
  recovery: { sources: { open: 0, progress: 0, watchRoom: 0 }, resumable: 0 } };
const EMPTY_SELECTION = { entries: [] as HistoryEntry[], videos: [] as LibraryVideo[] };
const EMPTY_TAGS: [string, number][] = [];

export function useHistoryBrowse(active: boolean, history: HistoryEntry[], videos: LibraryVideo[], tags: Record<string, string[]>, source: HistorySource, window: HistoryWindow) {
  const phase = useSessionPhase(), viewer = useLibrary(state => Boolean(state.activeId || state.previewId));
  const scope = useMemo(() => ({ history, videos }), [history, videos]);
  const [packet, setPacket] = useState<{ scope: typeof scope; value: HistoryIndex }>();
  const [selection, setSelection] = useState<{ index: HistoryIndex; source: HistorySource; window: HistoryWindow; value: typeof EMPTY_SELECTION }>();
  const [tagPacket, setTagPacket] = useState<{ history: HistoryEntry[]; tags: typeof tags; value: typeof EMPTY_TAGS }>();
  const [failure, setFailure] = useState<{ scope: typeof scope; source: HistorySource; window: HistoryWindow; message: string }>();
  const index = active && packet?.scope === scope ? packet.value : undefined;
  const unfiltered = source === 'all' && window === 'all';
  const ready = !!index && (unfiltered || selection?.index === index && selection.source === source && selection.window === window);
  const chosen = ready ? unfiltered ? { entries: index.history, videos: index.videos } : selection!.value : EMPTY_SELECTION;
  const error = active && failure?.scope === scope && failure.source === source && failure.window === window ? failure.message : '';
  useEffect(() => {
    if (!active) { setPacket(undefined); return; }
    if (phase !== 'active' || viewer || packet?.scope === scope) return;
    const controller = new AbortController();
    void prepareHistoryIndex(history, videos, Date.now(), catalogTurn(controller.signal)).then(value => {
      if (!controller.signal.aborted) startTransition(() => { setPacket({ scope, value }); setFailure(undefined); });
    }).catch(error => { if (!controller.signal.aborted) setFailure({ scope, source, window, message: String(error) }); });
    return () => controller.abort();
  }, [active, scope, phase, viewer]);
  useEffect(() => {
    if (!active || !index || unfiltered) { setSelection(undefined); return; }
    if (phase !== 'active' || viewer || ready) return;
    const controller = new AbortController();
    void filterHistory(index, source, window, Date.now(), catalogTurn(controller.signal)).then(value => {
      if (!controller.signal.aborted) startTransition(() => { setSelection({ index, source, window, value }); setFailure(undefined); });
    }).catch(error => { if (!controller.signal.aborted) setFailure({ scope, source, window, message: String(error) }); });
    return () => controller.abort();
  }, [active, index, source, window, phase, viewer]);
  // Tag enrichment is independent: it never invalidates a filter or export.
  useEffect(() => {
    if (!active) { setTagPacket(undefined); return; }
    if (phase !== 'active' || viewer || tagPacket?.history === history && tagPacket.tags === tags) return;
    const controller = new AbortController();
    void prepareHistoryTags(history, tags, catalogTurn(controller.signal)).then(value => {
      if (!controller.signal.aborted) startTransition(() => setTagPacket({ history, tags, value }));
    }).catch(() => {});
    return () => controller.abort();
  }, [active, history, tags, phase, viewer]);

  const exporting = useRef<AbortController | undefined>(undefined);
  const [exportState, setExportState] = useState({ busy: false, error: '' });
  useEffect(() => {
    exporting.current?.abort(); exporting.current = undefined;
    setExportState(state => state.busy || state.error ? { busy: false, error: '' } : state);
    return () => { exporting.current?.abort(); exporting.current = undefined; };
  }, [active, index, source, window, phase, viewer]);
  const cancelExport = () => { exporting.current?.abort(); exporting.current = undefined; setExportState({ busy: false, error: '' }); };
  const exportVisible = async () => {
    if (!active || !ready || !index || exporting.current || phase !== 'active' || viewer) return;
    const controller = new AbortController(); exporting.current = controller;
    setExportState({ busy: true, error: '' });
    try {
      const blob = await historyExportBlob(chosen.entries, index.byId, catalogTurn(controller.signal));
      controller.signal.throwIfAborted();
      const link = document.createElement('a'), href = URL.createObjectURL(blob);
      link.href = href; link.download = `reelcase-history-${new Date().toISOString().slice(0, 10)}.json`;
      try { link.click(); } finally { globalThis.setTimeout(() => URL.revokeObjectURL(href), 0); }
    } catch (error) {
      if (!controller.signal.aborted) setExportState({ busy: false, error: error instanceof Error ? error.message : 'Could not export history.' });
    } finally {
      if (exporting.current === controller) { exporting.current = undefined; setExportState(state => ({ ...state, busy: false })); }
    }
  };
  const readers = useMemo(() => ({ videos: () => chosen.videos, playedAt: () => index?.playedAt ?? EMPTY_INDEX.playedAt }), [chosen.videos, index]);
  return { index: index ?? EMPTY_INDEX, entries: chosen.entries, readers, pending: active && !ready && !error, ready, error,
    topTags: active && tagPacket?.history === history ? tagPacket.value : EMPTY_TAGS, exportVisible, cancelExport, exportState };
}
