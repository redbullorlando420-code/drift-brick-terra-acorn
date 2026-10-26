import { shortcutBlocked, shortcutEnabled } from '@/lib/keyboard-commands';
import { memo, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { FolderSearch, Search, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLibrary } from '@/lib/videos/store';
import type { Folder, LibraryVideo } from '@/lib/videos/types';
import { searchWorkerIndex } from '@/lib/videos/search-worker-index';
import { collectSearchSuggestions } from '@/lib/videos/search-suggestions';
import { getInteractionPriorityDelay, scheduleBackgroundWork } from '@/lib/interaction-budget';
import { yieldCatalogTask } from '@/lib/catalog-work';
import { useSessionPhase } from '@/lib/use-session-phase';
import { searchResultSource } from '@/lib/library-navigation';
import * as Popover from '@radix-ui/react-popover';
import { queueSearchDraft, searchEditorShortcut } from '@/lib/search-editor';

const EMPTY_VIDEOS: LibraryVideo[] = [];
const EMPTY_TAGS: Record<string, string[]> = {};
const EMPTY_CATEGORIES: Record<string, string> = {};
const EMPTY_FLAGS: Record<string, true> = {};
const EMPTY_FOLDERS: Folder[] = [];

/** Closed suggestions keep only query/actions, not a subscription to catalog
 * arrays or enrichment maps. Their work is discarded on every dismissal. */
export const GlobalSearch = memo(function GlobalSearch() {
  const query = useLibrary(s => s.query);
  const sourceId = useLibrary(s => s.sourceId);
  const setStoreQuery = useLibrary(s => s.setQuery);
  const setSource = useLibrary(s => s.setSource);
  const openPreview = useLibrary(s => s.openPreview);
  const viewerOpen = useLibrary(s => Boolean(s.activeId || s.previewId));
  const sessionPhase = useSessionPhase();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const tabExit = useRef<HTMLElement | null>(null);
  const panelId = useId();
  const localCommit = useRef<string | null>(null);
  const setQuery = useCallback((value: string) => { localCommit.current = value; setStoreQuery(value); }, [setStoreQuery]);
  const [draft, setDraft] = useState(query);
  const [lookup, setLookup] = useState(query);
  const [expanded, setExpanded] = useState(false);
  const editorActive = useRef(false);
  const panelOpen = expanded && !viewerOpen && sessionPhase === 'active';
  useEffect(() => {
    if (!panelOpen) return;
    const state = useLibrary.getState();
    searchWorkerIndex.sync(state.videos, state.tags, state.categories);
    return () => searchWorkerIndex.retire();
  }, [panelOpen]);
  const onAdultDesk = sourceId === 'adults' || sourceId === 'adult-fetishes';
  const needle = lookup.trim().toLowerCase();
  const lookupActive = panelOpen && Boolean(needle) && lookup === draft;
  const videos = useLibrary(s => lookupActive ? s.videos : EMPTY_VIDEOS);
  const tags = useLibrary(s => lookupActive ? s.tags : EMPTY_TAGS);
  const categories = useLibrary(s => lookupActive ? s.categories : EMPTY_CATEGORIES);
  const hidden = useLibrary(s => lookupActive ? s.hiddenVideos : EMPTY_FLAGS);
  const unavailable = useLibrary(s => lookupActive ? s.unavailable : EMPTY_FLAGS);
  const folders = useLibrary(s => lookupActive ? s.folders : EMPTY_FOLDERS);
  const hideDemo = useLibrary(s => lookupActive && s.hideDemo);
  const adultsUnlocked = useLibrary(s => lookupActive && s.adultsUnlocked);
  const [recent, setRecent] = useState<string[]>([]);
  const [packet, setPacket] = useState<{ query: string; videos: LibraryVideo[]; hits: LibraryVideo[] }>();
  const suggestionsCurrent = lookupActive && packet?.query === needle && packet.videos === videos;
  const hits = suggestionsCurrent ? packet.hits : EMPTY_VIDEOS;
  const [indexStatus, setIndexStatus] = useState(searchWorkerIndex.getStatus());

  const dismiss = useCallback(() => {
    editorActive.current = false;
    setExpanded(false);
    setPacket(undefined);
    setDraft(useLibrary.getState().query);
  }, []);
  const finish = dismiss;
  const openEditor = useCallback(() => {
    const current = useLibrary.getState().query;
    editorActive.current = true;
    setDraft(current); setLookup(current); setExpanded(true);
  }, []);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      const editing = event.target instanceof Element && Boolean(event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])'));
      const state = useLibrary.getState();
      if (!shortcutBlocked(event) && shortcutEnabled("search") && !state.activeId && !state.previewId && searchEditorShortcut(event, editing)) {
        event.preventDefault(); openEditor(); input.current?.focus();
      }
    };
    window.addEventListener('keydown', shortcut);
    return () => window.removeEventListener('keydown', shortcut);
  }, [openEditor]);
  useEffect(() => {
    try {
      const saved: unknown = JSON.parse(localStorage.getItem('reelcase.search.recent') ?? '[]');
      if (Array.isArray(saved)) setRecent(saved.filter((item): item is string => typeof item === 'string' && item.length <= 300).slice(0, 5));
    } catch { /* Search remains usable without optional recent history. */ }
  }, []);
  useEffect(() => {
    if (!editorActive.current || query !== localCommit.current) { setDraft(query); dismiss(); }
  }, [query, dismiss]);
  useEffect(() => {
    if (!panelOpen || lookup === draft) return;
    const timer = window.setTimeout(() => setLookup(draft), 140);
    return () => window.clearTimeout(timer);
  }, [draft, lookup, panelOpen]);
  useEffect(() => {
    if (!panelOpen || draft === query || onAdultDesk) return;
    return queueSearchDraft({ draft, query, sourceId, active: () => editorActive.current, get: useLibrary.getState,
      commit: setQuery, schedule: work => { const timer = window.setTimeout(work, 180); return () => window.clearTimeout(timer); } });
  }, [draft, query, setQuery, onAdultDesk, panelOpen, sourceId]);
  useEffect(() => { dismiss(); }, [sourceId, dismiss]);
  useEffect(() => {
    if (viewerOpen || sessionPhase !== 'active') dismiss();
  }, [viewerOpen, sessionPhase, dismiss]);
  useEffect(() => {
    if (!lookupActive) return;
    setIndexStatus(searchWorkerIndex.getStatus());
    return searchWorkerIndex.subscribe(setIndexStatus);
  }, [lookupActive]);
  useEffect(() => {
    setPacket(undefined);
    if (!lookupActive) return;
    const controller = new AbortController();
    let cancelTurn = () => {}, rejectTurn: ((reason: Error) => void) | undefined;
    const turn = async () => {
      await yieldCatalogTask();
      controller.signal.throwIfAborted();
      if (document.hidden || getInteractionPriorityDelay() > 0) await new Promise<void>((resolve, reject) => {
        rejectTurn = reject;
        cancelTurn = scheduleBackgroundWork(() => { rejectTurn = undefined; resolve(); });
      });
      controller.signal.throwIfAborted();
    };
    void (async () => {
      await turn();
      // Suggestions never build another index; the Search desk owns it.
      const matches = indexStatus === 'ready' ? await searchWorkerIndex.searchMatches(needle, controller.signal) : null;
      const ids = matches?.videos === videos ? matches.ids : null;
      controller.signal.throwIfAborted();
      const result = await collectSearchSuggestions({ videos, folders, tags, categories, hidden, unavailable,
        hideDemo, sourceId, adultsUnlocked, query: needle, ids, positions: matches?.videos === videos ? matches.positions : undefined }, turn);
      if (!controller.signal.aborted) setPacket({ query: needle, videos, hits: result });
    })().catch(() => {
      if (!controller.signal.aborted) setPacket({ query: needle, videos, hits: [] });
    });
    return () => { controller.abort(); cancelTurn(); rejectTurn?.(new Error('Suggestion replaced')); };
  }, [adultsUnlocked, categories, folders, hidden, unavailable, hideDemo, lookupActive, needle, sourceId, tags, videos, indexStatus]);
  const suggestionTags = useMemo(() => [...new Set(hits.flatMap(video => tags[video.id] ?? []))].filter(tag => tag.length >= 3).slice(0, 5), [hits, tags]);
  const commit = (value = draft) => {
    const clean = value.trim();
    const destination = searchResultSource(sourceId);
    if (clean && destination !== sourceId) setSource(destination);
    setDraft(onAdultDesk ? '' : clean);
    setQuery(onAdultDesk ? '' : clean);
    if (onAdultDesk && clean) window.dispatchEvent(new CustomEvent('reelcase:adult-tag', { detail: { tag: clean.replace(/^#/, '') } }));
    if (clean) {
      const term = onAdultDesk ? clean.replace(/^#/, '') : clean;
      const next = [term, ...recent.filter(item => item !== term)].slice(0, 5);
      setRecent(next);
      try { localStorage.setItem('reelcase.search.recent', JSON.stringify(next)); } catch { /* Optional history cannot block search. */ }
    }
    finish();
  };

  const clearQuery = () => {
    setDraft(''); setQuery('');
    if (onAdultDesk) window.dispatchEvent(new CustomEvent('reelcase:adult-tag', { detail: { tag: 'All' } }));
    finish();
  };
  return <div className="flex min-w-0 items-center gap-1">
    <Popover.Root open={panelOpen} onOpenChange={open => { if (open) openEditor(); else finish(); }}>
      <Popover.Trigger asChild><Button ref={trigger} variant="secondary" className="h-11 min-w-11 max-w-52" aria-label="Open search" title={query ? `Search: ${query} · Ctrl+K` : 'Search your library (Ctrl+K or /)'}>
        <Search className="size-4 shrink-0" /><span className="max-w-36 truncate">{query || 'Search'}</span>
      </Button></Popover.Trigger>
      <Popover.Portal><Popover.Content align="end" sideOffset={8} collisionPadding={16} className="search-editor-panel z-40 rounded-lg border border-border bg-surface p-3 shadow-lift outline-none" aria-label="Search editor"
        onOpenAutoFocus={event => { event.preventDefault(); input.current?.focus(); }}
        onCloseAutoFocus={event => { if (tabExit.current) { event.preventDefault(); tabExit.current.focus(); tabExit.current = null; } }}
        onKeyDownCapture={event => {
          if (event.key !== 'Tab' || event.ctrlKey || event.metaKey || event.altKey) return;
          const controls = event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),a[href],[tabindex="0"]');
          if (event.target !== controls[event.shiftKey ? 0 : controls.length - 1]) return;
          // Radix loops Tab within popovers, even nonmodal ones. Let a search
          // editor boundary return to the header and release its catalog work.
          event.preventDefault();
          const headerControls = [...(trigger.current?.closest('header')?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href]') ?? [])];
          const index = headerControls.indexOf(trigger.current!);
          tabExit.current = event.shiftKey ? trigger.current : headerControls[index + 1] ?? trigger.current;
          finish();
        }}
        onEscapeKeyDown={finish} onInteractOutside={finish}>
    <div ref={root} className="relative min-w-0">
    <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-accent" />
    <Input ref={input} type="search" enterKeyHint="search" value={draft} onChange={event => setDraft(event.target.value)}
      onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) { event.preventDefault(); commit(); } }}
      placeholder={onAdultDesk ? 'Find Adult tags — e.g. role play or creator…' : 'Search your entire media desk…'}
      className="h-12 border-border bg-elevated pl-11 pr-12 text-base shadow-border [&::-webkit-search-cancel-button]:hidden" aria-label="Global media search"
      aria-expanded={panelOpen} aria-controls={panelOpen ? panelId : undefined} />
    {draft && <button type="button" aria-label="Clear search" onMouseDown={event => event.preventDefault()} onClick={clearQuery} className="absolute top-1/2 right-0 flex size-11 -translate-y-1/2 items-center justify-center text-subtle hover:text-fg"><X className="size-4" /></button>}
    </div>
    {panelOpen&&indexStatus==='failed'&&<div role="status" className="p-3 text-xs leading-5 text-muted">Search worker stopped; suggestions use a cooperative scan.<Button variant="secondary" className="mt-2 min-h-11" onClick={()=>{const state=useLibrary.getState();searchWorkerIndex.retry(state.videos,state.tags,state.categories);}}>Retry search index</Button></div>}
    {panelOpen && <section id={panelId} aria-label="Search suggestions" className="search-suggestions-scroll mt-2 w-full overflow-y-auto">
      <div className="flex items-center justify-between gap-2 px-3"><p className="text-xs font-medium text-muted">Search suggestions</p><Button size="icon" variant="ghost" className="size-11 shrink-0" aria-label="Dismiss search suggestions" onMouseDown={event => event.preventDefault()} onClick={finish}><X className="size-4" /></Button></div>
      <div className="mb-2 flex gap-2 border-b border-border px-3 pb-2">{[['home', 'Library'], ['youtube', 'YouTube'], ['twitch', 'Twitch']].map(([id, label]) => <Button key={id} size="sm" className="min-h-11" variant="ghost" onMouseDown={event => event.preventDefault()} onClick={() => { finish(); setSource(id); }}>{label}</Button>)}</div>
      {onAdultDesk && <p className="px-3 py-2 text-xs text-muted">Use plain words or #tags. Adult tag searches stay on this desk.</p>}
      {hits.length ? <>
        <p className="px-3 py-2 text-xs font-medium tracking-widest text-accent uppercase">{sourceId === 'youtube' ? 'YouTube matches' : sourceId === 'twitch' ? 'Twitch matches' : 'Best matches'}</p>
        {hits.map(video => <button key={video.id} type="button" onMouseDown={event => event.preventDefault()} onClick={() => { finish(); openPreview(video.id); }} className="flex min-h-11 w-full items-center gap-3 rounded-sm px-3 py-2 text-left hover:bg-elevated"><span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-bg/60 text-accent"><FolderSearch className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-fg">{video.name}</span><span className="block truncate text-xs text-muted">{video.remote?.channelName ?? video.path}</span></span></button>)}
        {suggestionTags.length > 0 && <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2"><span className="self-center text-xs text-muted">Related tags</span>{suggestionTags.map(tag => <Button key={tag} size="sm" className="min-h-11" variant="secondary" onMouseDown={event => event.preventDefault()} onClick={() => commit(tag)}>#{tag}</Button>)}</div>}
      </> : draft.trim() ? <p role="status" className="px-3 py-2 text-xs text-muted">{!suggestionsCurrent ? 'Looking for matches…' : 'No quick matches. Search the full catalog below.'}</p> : <>
        <p className="px-3 py-2 text-xs font-medium tracking-widest text-accent uppercase">Search everywhere</p>
        <div className="flex flex-wrap gap-2 px-3 py-2">{['favorites', '4k', 'documentary', 'watch later'].map(term => <Button key={term} size="sm" className="min-h-11" variant="secondary" onMouseDown={event => event.preventDefault()} onClick={() => commit(term)}>{term}</Button>)}</div>
        {recent.length > 0 && <div className="border-t border-border px-3 pt-2"><p className="text-xs text-muted">Recent</p>{recent.map(term => <button key={term} type="button" onMouseDown={event => event.preventDefault()} onClick={() => commit(term)} className="flex min-h-11 w-full items-center gap-2 py-1 text-left text-sm text-fg hover:text-accent"><Sparkles className="size-3.5" />{term}</button>)}</div>}
      </>}
      {draft.trim() && <button type="button" onMouseDown={event => event.preventDefault()} onClick={() => commit()} className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm text-accent hover:bg-elevated"><Search className="size-4 shrink-0" /><span className="truncate">See all results for “{draft}”</span></button>}
    </section>}
      </Popover.Content></Popover.Portal>
    </Popover.Root>
    {query && !expanded && <Button variant="ghost" size="icon" className="size-11 shrink-0" aria-label="Clear search" onClick={clearQuery}><X className="size-4" /></Button>}
  </div>;
});
