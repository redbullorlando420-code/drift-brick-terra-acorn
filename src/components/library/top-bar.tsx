import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PullPauseButton } from "./pull-pause-button";
import { Clock3, LayoutGrid, List, Menu, Search, Upload, X, Sparkles, FolderSearch, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { NoticeBell } from "./notice-center";
import { useLibrary } from "@/lib/videos/store";
import { searchWorkerIndex } from "@/lib/videos/search-worker-index";
import { collectSearchSuggestions } from '@/lib/videos/search-suggestions';
import { getInteractionPriorityDelay, scheduleBackgroundWork } from '@/lib/interaction-budget';
import { yieldCatalogTask } from '@/lib/catalog-work';
import type { LibraryVideo, SortKey } from "@/lib/videos/types";
import { allowAutomaticRefresh } from "@/lib/session-activity";
import { useSessionPhase } from "@/lib/use-session-phase";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "added", label: "Date added" },
  { key: "recent", label: "Recently played" },
  { key: "size", label: "Size" },
  { key: "duration", label: "Duration" },
  { key: "type", label: "File type" },
  { key: "folder", label: "Folder" },
  { key: "path", label: "Full path" },
];

export function TopBar({
  onMenu,
  onAddFolder,
  menuOpen,
  sidebarCollapsed,
  onToggleSidebar,
}: {
  onMenu: () => void;
  onAddFolder: () => void;
  menuOpen: boolean;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const query = useLibrary((s) => s.query);
  const setStoreQuery = useLibrary((s) => s.setQuery);
  const localCommit = useRef<string | null>(null);
  const setQuery = useCallback((value: string) => { localCommit.current = value; setStoreQuery(value); }, [setStoreQuery]);
  const sourceId = useLibrary((s) => s.sourceId);
  const [draft, setDraft] = useState(query);
  const [lookup, setLookup] = useState(query);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    // A debounced commit must not overwrite keystrokes entered since that
    // commit was scheduled. External tag/navigation searches still sync here.
    if (query !== localCommit.current) setDraft(query);
  }, [query]);
  useEffect(() => { const id = window.setTimeout(() => setLookup(draft), 140); return () => window.clearTimeout(id); }, [draft]);
  useEffect(() => {
    if (draft === query) return;
    // On Adults, live typing must not flip browsing=false (Search desk).
    // Enter / Related tags commit through applyAdultTagStay instead.
    if (sourceId === "adults" || sourceId === "adult-fetishes") return;
    const t = window.setTimeout(() => setQuery(draft), 180);
    return () => window.clearTimeout(t);
  }, [draft, query, setQuery, sourceId]);
  useEffect(() => { setNow(new Date()); const id = window.setInterval(() => { if (allowAutomaticRefresh()) setNow(new Date()); }, 15_000); return () => window.clearInterval(id); }, []);
  const view = useLibrary((s) => s.view);
  const setView = useLibrary((s) => s.setView);
  const sort = useLibrary((s) => s.sort);
  const setSort = useLibrary((s) => s.setSort);
  const scanning = useLibrary((s) => s.scanning);
  const folders = useLibrary((s) => s.folders);
  const videos = useLibrary((s) => s.videos);
  const openPreview = useLibrary((s) => s.openPreview);
  const setSource = useLibrary((s) => s.setSource);
  const tags = useLibrary((s) => s.tags);
  const categories = useLibrary(s => s.categories);
  const hiddenVideos = useLibrary(s => s.hiddenVideos);
  const hideDemo = useLibrary(s => s.hideDemo);
  const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
  const [focused, setFocused] = useState(false);
  const sessionPhase = useSessionPhase();
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("reelcase.search.recent") ?? "[]") as string[]; } catch { return []; }
  });
  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Name";
  const sourceLabel = sourceId === "live" ? "Live" : sourceId === "home" ? "Home" : sourceId === "landing" ? "Landing page" : sourceId === "movies" ? "Movies" : sourceId === "photos" ? "Photos" : sourceId === "twitch" ? "Twitch" : sourceId === "youtube" ? "YouTube" : folders.find((folder) => folder.id === sourceId)?.name ?? "Library";
  const sourceCount = sourceId === "home" ? videos.length : folders.find((folder) => folder.id === sourceId)?.videoCount;
  const needle = lookup.trim().toLowerCase();
  const lookupActive = Boolean(needle) && focused && sessionPhase === "active";
  const [hits, setHits] = useState<LibraryVideo[]>([]);
  const [searchIndexStatus, setSearchIndexStatus] = useState(searchWorkerIndex.getStatus());
  useEffect(() => searchWorkerIndex.subscribe(setSearchIndexStatus), []);
  useEffect(() => {
    setHits([]);
    if (!lookupActive) return;
    const controller = new AbortController();
    let cancelTurn = () => {}, rejectTurn: ((reason: Error) => void) | undefined;
    const turn = async () => {
      await yieldCatalogTask();
      if (controller.signal.aborted) throw new Error('Suggestion replaced');
      if (document.hidden || getInteractionPriorityDelay() > 0) await new Promise<void>((resolve, reject) => {
        rejectTurn = reject;
        cancelTurn = scheduleBackgroundWork(() => { rejectTurn = undefined; resolve(); });
      });
      if (controller.signal.aborted) throw new Error('Suggestion replaced');
    };
    void (async () => {
      await turn();
      // A six-row dropdown must not wait for the first full-library index.
      // The Search desk owns that index; suggestions catch up when it is ready.
      const ids = searchIndexStatus === 'ready' ? await searchWorkerIndex.search(needle, controller.signal) : null;
      if (controller.signal.aborted) return;
      const result = await collectSearchSuggestions({ videos, folders, tags, categories, hidden: hiddenVideos,
        hideDemo, sourceId, adultsUnlocked, query: needle, ids }, turn);
      if (!controller.signal.aborted) setHits(result);
    })().catch(() => { /* Blur, typing, or navigation replaces this lookup. */ });
    return () => { controller.abort(); cancelTurn(); rejectTurn?.(new Error('Suggestion replaced')); };
  }, [adultsUnlocked, categories, folders, hiddenVideos, hideDemo, lookupActive, needle, sourceId, tags, videos, searchIndexStatus]);
  const suggestionTags = useMemo(() => [...new Set(hits.flatMap((video) => tags[video.id] ?? []))].filter((tag) => tag.length >= 3).slice(0, 5), [hits, tags]);
  const applyAdultTagStay = (raw: string) => {
    const tag = raw.trim().replace(/^#/, "");
    if (!tag) return;
    setDraft("");
    setQuery("");
    window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag } }));
    setFocused(false);
  };
  const onAdultDesk = sourceId === "adults" || sourceId === "adult-fetishes";
  const commit = (value = draft) => {
    const clean = value.trim();
    // Tag chips / #tags on Adults must filter in-place — never open Search desk.
    if (onAdultDesk && clean) {
      applyAdultTagStay(clean);
      if (clean) {
        const next = [clean.replace(/^#/, ""), ...recent.filter((item) => item !== clean.replace(/^#/, ""))].slice(0, 5);
        setRecent(next);
        localStorage.setItem("reelcase.search.recent", JSON.stringify(next));
      }
      return;
    }
    setQuery(clean);
    if (clean) {
      const next = [clean, ...recent.filter((item) => item !== clean)].slice(0, 5);
      setRecent(next);
      localStorage.setItem("reelcase.search.recent", JSON.stringify(next));
    }
    setFocused(false);
  };

  return (
    <header className="grid gap-3 border-b border-border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 2xl:grid-cols-[minmax(10rem,0.55fr)_minmax(12rem,1.4fr)_auto]">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Open menu"
          aria-expanded={menuOpen}
          aria-controls="mobile-sidebar-navigation"
          onClick={onMenu}
        >
          <Menu className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="hidden size-11 shrink-0 lg:flex" onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!sidebarCollapsed} aria-controls="desktop-sidebar-navigation" title="Toggle sidebar (Ctrl+B)">
          {sidebarCollapsed ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
        </Button>
        <div className="min-w-0"><p className="truncate font-display text-lg leading-none text-fg">{sourceLabel}</p><p className="mt-1 text-xs text-muted">{typeof sourceCount === "number" ? `${sourceCount.toLocaleString()} indexed` : "Control room"}</p></div>
      </div>
      <div className="relative min-w-0 sm:col-span-2 sm:row-start-2 2xl:col-span-1 2xl:row-start-1 2xl:max-w-3xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-accent" />
        <Input
          type="search"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setFocused(false);
          }}
          onFocus={() => setFocused(true)}
          placeholder={onAdultDesk ? "Find Adult tags — e.g. role play or creator…" : "Search your entire media desk…"}
          className="h-12 border-border bg-elevated pl-11 pr-10 text-base shadow-border"
          aria-label="Global media search"
        />
        {draft && <button type="button" aria-label="Clear search" onClick={() => { setDraft(""); setQuery(""); if (sourceId === "adults" || sourceId === "adult-fetishes") window.dispatchEvent(new CustomEvent("reelcase:adult-tag", { detail: { tag: "All" } })); }} className="absolute top-1/2 right-3 -translate-y-1/2 text-subtle hover:text-fg"><X className="size-4" /></button>}
        {focused && (
          <div className="absolute top-[calc(100%+0.5rem)] z-40 w-full overflow-hidden rounded-lg bg-surface p-2 shadow-lift shadow-border">
            {searchIndexStatus === "building" && <p className="px-3 py-2 text-xs text-muted">Preparing search… you can keep browsing.</p>}
            {onAdultDesk && <p className="px-3 py-2 text-xs text-muted">Use plain words or #tags. Adult tag searches stay on this desk and match saved creator, source, and interest labels.</p>}
            {hits.length ? <>
              <p className="px-3 py-2 text-xs font-medium tracking-[0.14em] text-accent uppercase">{sourceId === "youtube" ? "YouTube matches" : sourceId === "twitch" ? "Twitch matches" : "Best matches"}</p>
              {hits.map((video) => <button key={video.id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { openPreview(video.id); setFocused(false); }} className="flex w-full items-center gap-3 rounded-sm px-3 py-2 text-left hover:bg-elevated"><span className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-bg/60 text-accent"><FolderSearch className="size-4" /></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-fg">{video.name}</span><span className="block truncate text-xs text-muted">{video.remote?.channelName ?? video.path}</span></span></button>)}
              {suggestionTags.length > 0 && <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2"><span className="self-center text-xs text-muted">Related tags</span>{suggestionTags.map((tag) => <Button key={tag} size="sm" variant="secondary" onMouseDown={(event) => event.preventDefault()} onClick={() => { setDraft(tag); commit(tag); }}>#{tag}</Button>)}</div>}
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => commit()} className="mt-1 flex w-full items-center gap-2 rounded-sm px-3 py-2 text-sm text-accent hover:bg-elevated"><Search className="size-4" /> See all results for “{draft}”</button>
            </> : <>
              <p className="px-3 py-2 text-xs font-medium tracking-[0.14em] text-accent uppercase">Search everywhere</p>
              <div className="flex flex-wrap gap-2 px-3 py-2">{["favorites", "4k", "documentary", "watch later"].map((term) => <Button key={term} size="sm" variant="secondary" onMouseDown={(event) => event.preventDefault()} onClick={() => { setDraft(term); commit(term); }}>{term}</Button>)}</div>
              {recent.length > 0 && <div className="border-t border-border px-3 pt-2"><p className="text-xs text-muted">Recent</p>{recent.map((term) => <button key={term} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setDraft(term); commit(term); }} className="mt-1 flex w-full items-center gap-2 py-1 text-left text-sm text-fg hover:text-accent"><Sparkles className="size-3.5" />{term}</button>)}</div>}
            </>}
            <div className="mt-2 flex gap-2 border-t border-border px-3 pt-2"><Button size="sm" variant="ghost" onMouseDown={(event) => event.preventDefault()} onClick={() => setSource("home")}>Library</Button><Button size="sm" variant="ghost" onMouseDown={(event) => event.preventDefault()} onClick={() => setSource("youtube")}>YouTube</Button><Button size="sm" variant="ghost" onMouseDown={(event) => event.preventDefault()} onClick={() => setSource("twitch")}>Twitch</Button></div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5 sm:col-start-2 sm:row-start-1 sm:justify-end 2xl:col-start-3">
        {scanning && (
          <span className="mr-2 hidden truncate text-xs text-muted sm:inline">
            Scanning {scanning.folderName} · {scanning.found}
          </span>
        )}
        {sourceId !== "history" && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                {sortLabel}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {SORTS.map((s) => (
                <DropdownMenuItem key={s.key} onSelect={() => setSort(s.key)}>
                  {s.key === sort ? "· " : "  "}
                  {s.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <span className="hidden items-center gap-1.5 px-2 text-xs tabular-nums text-muted xl:flex"><Clock3 className="size-3.5" />{now ? now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "--:--"}</span>
        <PullPauseButton />
        <NoticeBell />
        <div className="flex rounded-md bg-elevated p-0.5 shadow-border">
          <button
            type="button"
            aria-label="Grid view"
            onClick={() => setView("grid")}
            className={cn(
              "flex size-9 items-center justify-center rounded-sm transition-colors duration-150",
              view === "grid" ? "bg-surface text-fg" : "text-muted hover:text-fg",
            )}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            aria-label="List view"
            onClick={() => setView("list")}
            className={cn(
              "flex size-9 items-center justify-center rounded-sm transition-colors duration-150",
              view === "list" ? "bg-surface text-fg" : "text-muted hover:text-fg",
            )}
          >
            <List className="size-4" />
          </button>
        </div>
        <Button variant="secondary" size="sm" onClick={onAddFolder} className="hidden sm:inline-flex">
          <Upload className="size-3.5" />
          Folder
        </Button>
      </div>
    </header>
  );
}
