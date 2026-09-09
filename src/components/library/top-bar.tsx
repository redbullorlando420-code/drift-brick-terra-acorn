import { useEffect, useMemo, useState } from "react";
import { Clock3, LayoutGrid, List, Menu, Search, Upload, X, Sparkles, FolderSearch } from "lucide-react";
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
import { librarySearchIndex } from "@/lib/videos/search-index";
import type { SortKey } from "@/lib/videos/types";

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
}: {
  onMenu: () => void;
  onAddFolder: () => void;
}) {
  const query = useLibrary((s) => s.query);
  const setQuery = useLibrary((s) => s.setQuery);
  const [draft, setDraft] = useState(query);
  const [lookup, setLookup] = useState(query);
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setDraft(query);
  }, [query]);
  useEffect(() => { const id = window.setTimeout(() => setLookup(draft), 140); return () => window.clearTimeout(id); }, [draft]);
  useEffect(() => {
    if (draft === query) return;
    const t = window.setTimeout(() => setQuery(draft), 180);
    return () => window.clearTimeout(t);
  }, [draft, query, setQuery]);
  useEffect(() => { setNow(new Date()); const id = window.setInterval(() => setNow(new Date()), 15_000); return () => window.clearInterval(id); }, []);
  const view = useLibrary((s) => s.view);
  const setView = useLibrary((s) => s.setView);
  const sort = useLibrary((s) => s.sort);
  const setSort = useLibrary((s) => s.setSort);
  const scanning = useLibrary((s) => s.scanning);
  const sourceId = useLibrary((s) => s.sourceId);
  const folders = useLibrary((s) => s.folders);
  const videos = useLibrary((s) => s.videos);
  const openPreview = useLibrary((s) => s.openPreview);
  const setSource = useLibrary((s) => s.setSource);
  const tags = useLibrary((s) => s.tags);
  const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
  const [focused, setFocused] = useState(false);
  const [recent, setRecent] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem("reelcase.search.recent") ?? "[]") as string[]; } catch { return []; }
  });
  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Name";
  const sourceLabel = sourceId === "home" ? "Home" : sourceId === "movies" ? "Movies" : sourceId === "photos" ? "Photos" : sourceId === "twitch" ? "Twitch" : sourceId === "youtube" ? "YouTube" : folders.find((folder) => folder.id === sourceId)?.name ?? "Library";
  const sourceCount = sourceId === "home" ? videos.length : folders.find((folder) => folder.id === sourceId)?.videoCount;
  const needle = lookup.trim().toLowerCase();
  const videoById = useMemo(() => new Map(videos.map((video) => [video.id, video])), [videos]);
  const hits = useMemo(() => {
    if (!needle) return [];
    const indexedIds = librarySearchIndex.search(needle);
    // The index covers title, creator, description, tags, category, source,
    // and local path.  A short fallback keeps search useful during its first
    // background build without making every keystroke the normal slow path.
    const candidates = indexedIds ? Array.from(indexedIds, (id) => videoById.get(id)).filter((video): video is NonNullable<typeof video> => Boolean(video)) : videos;
    return candidates.filter((video) => {
        const folder = folders.find((item) => item.id === video.folderId);
        if (folder?.adult && !(sourceId === "adults" && adultsUnlocked)) return false;
        return indexedIds ? true : `${video.name} ${video.path} ${video.description ?? ""} ${video.remote?.channelName ?? ""} ${(tags[video.id] ?? []).join(" ")}`.toLowerCase().includes(needle);
      }).sort((a, b) => b.addedAt - a.addedAt).slice(0, 6);
  }, [adultsUnlocked, folders, needle, sourceId, tags, videoById, videos]);
  const suggestionTags = useMemo(() => [...new Set(hits.flatMap((video) => tags[video.id] ?? []))].filter((tag) => tag.length >= 3).slice(0, 5), [hits, tags]);
  const commit = (value = draft) => {
    const clean = value.trim();
    setQuery(clean);
    if (clean) {
      const next = [clean, ...recent.filter((item) => item !== clean)].slice(0, 5);
      setRecent(next);
      localStorage.setItem("reelcase.search.recent", JSON.stringify(next));
    }
    setFocused(false);
  };

  return (
    <header className="grid gap-3 border-b border-border px-4 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-6 xl:grid-cols-[minmax(13rem,0.55fr)_minmax(20rem,1.4fr)_auto]">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={onMenu}
        >
          <Menu className="size-5" />
        </Button>
        <div className="min-w-0"><p className="truncate font-display text-lg leading-none text-fg">{sourceLabel}</p><p className="mt-1 text-xs text-muted">{typeof sourceCount === "number" ? `${sourceCount.toLocaleString()} indexed` : "Control room"}</p></div>
      </div>
      <div className="relative min-w-0 xl:max-w-3xl">
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
          placeholder="Search your entire media desk…"
          className="h-12 border-border bg-elevated pl-11 pr-10 text-base shadow-border"
          aria-label="Global media search"
        />
        {draft && <button type="button" aria-label="Clear search" onClick={() => { setDraft(""); setQuery(""); }} className="absolute top-1/2 right-3 -translate-y-1/2 text-subtle hover:text-fg"><X className="size-4" /></button>}
        {focused && (
          <div className="absolute top-[calc(100%+0.5rem)] z-40 w-full overflow-hidden rounded-lg bg-surface p-2 shadow-lift shadow-border">
            {hits.length ? <>
              <p className="px-3 py-2 text-xs font-medium tracking-[0.14em] text-accent uppercase">Best matches</p>
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
      <div className="flex items-center gap-1.5 sm:justify-end">
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
