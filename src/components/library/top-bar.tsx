import { PullPauseButton } from './pull-pause-button';
import { LayoutGrid, List, Menu, Upload, PanelLeftOpen, PanelLeftClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { NoticeBell } from './notice-center';
import { useLibrary } from '@/lib/videos/store';
import type { SortKey } from '@/lib/videos/types';
import { GlobalSearch } from './global-search';
import { HeaderClock } from './header-clock';
import { navigationSourceLabel } from '@/lib/library-navigation';

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
  const sourceId = useLibrary(s => s.sourceId);
  const view = useLibrary(s => s.view);
  const setView = useLibrary(s => s.setView);
  const sort = useLibrary(s => s.sort);
  const setSort = useLibrary(s => s.setSort);
  const scanning = useLibrary(s => s.scanning);
  const folders = useLibrary(s => s.folders);
  const videoCount = useLibrary(s => s.sourceId === 'home' ? s.videos.length : undefined);
  const sortLabel = SORTS.find(s => s.key === sort)?.label ?? 'Name';
  const sourceLabel = navigationSourceLabel(sourceId, folders);
  const sourceCount = sourceId === 'home' ? videoCount : folders.find(folder => folder.id === sourceId)?.videoCount;

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
      <GlobalSearch />
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
        <HeaderClock />
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
