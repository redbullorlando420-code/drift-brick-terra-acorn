import { LayoutGrid, List, Menu, Search, Upload } from "lucide-react";
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
import type { SortKey } from "@/lib/videos/types";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "name", label: "Name" },
  { key: "added", label: "Date added" },
  { key: "recent", label: "Recently played" },
  { key: "size", label: "Size" },
  { key: "duration", label: "Duration" },
];

export function TopBar({
  onMenu,
  onAddFiles,
}: {
  onMenu: () => void;
  onAddFiles: () => void;
}) {
  const query = useLibrary((s) => s.query);
  const setQuery = useLibrary((s) => s.setQuery);
  const view = useLibrary((s) => s.view);
  const setView = useLibrary((s) => s.setView);
  const sort = useLibrary((s) => s.sort);
  const setSort = useLibrary((s) => s.setSort);
  const scanning = useLibrary((s) => s.scanning);
  const sourceId = useLibrary((s) => s.sourceId);
  const sortLabel = SORTS.find((s) => s.key === sort)?.label ?? "Name";

  return (
    <header className="flex flex-col gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:px-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          aria-label="Open menu"
          onClick={onMenu}
        >
          <Menu className="size-5" />
        </Button>
        <p className="font-display text-lg leading-none lg:hidden">Reelcase</p>
      </div>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search titles, channels, paths"
          className="pl-9"
          aria-label="Search videos"
        />
      </div>
      <div className="flex items-center gap-1.5">
        {scanning && (
          <span className="mr-2 hidden truncate text-xs text-muted sm:inline">
            Scanning {scanning.folderName} · {scanning.found}
          </span>
        )}
        {sourceId !== "history" && sourceId !== "home" && sourceId !== "movies" && sourceId !== "adults" && (
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
        <Button variant="secondary" size="sm" onClick={onAddFiles} className="hidden sm:inline-flex">
          <Upload className="size-3.5" />
          Files
        </Button>
      </div>
    </header>
  );
}
