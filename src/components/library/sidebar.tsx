import { useEffect, useMemo, useState } from "react";
import {
  Clapperboard,
  Clock3,
  Film,
  Flame,
  Folder as FolderIcon,
  FolderPlus,
  Gamepad2,
  Heart,
  History,
  Lock,
  LockOpen,
  Radio,
  Settings2,
  Sparkles,
  ShoppingBag,
  Box,
  BarChart3,
  Images,
  MonitorPlay,
  Music2,
  Users,
  Wifi,
  Smartphone,
  X as XIcon,
  X,
  Youtube,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { selectContinue, useLibrary } from "@/lib/videos/store";
import type { Folder, SourceId } from "@/lib/videos/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DEFAULT_SIDEBAR_GROUPS, SIDEBAR_GROUPS_KEY, restoreSidebarGroups, type SidebarGroup } from "@/lib/sidebar-state";
import { scheduleBackgroundWork } from "@/lib/interaction-budget";
import { useCatalogCounts } from "./use-catalog-counts";

const NAV_GROUPS = [
  { id: "library", label: "Library", items: [
    ["home", "Home", Clapperboard], ["landing", "Landing page", Sparkles, "publicCount"], ["movies", "Movies", Film], ["anime", "Anime", Clapperboard], ["genres", "Topics", Film],
    ["youtube", "YouTube", Youtube, "ytCount"], ["twitch", "Twitch", Radio, "twitchCount"], ["live", "Live", Radio, "liveCount"],
    ["favorites", "Favorites", Heart, "favCount"], ["continue", "Continue", Clock3, "continueCount"], ["history", "History", History, "historyCount"],
    ["adults", "Adults", Flame, "adultCount"], ["adult-fetishes", "Fetish Explorer", Sparkles],
  ] },
  { id: "workspace", label: "Workspace", items: [
    ["photos", "Photos", Images], ["spotify", "Spotify", Music2], ["prints", "3D prints", Box], ["games", "Games", Gamepad2],
    ["shop", "Shop", ShoppingBag], ["streaming", "Streaming", MonitorPlay], ["watch-room", "Watch room", Users], ["social", "X accounts", XIcon],
  ] },
  { id: "tools", label: "Tools", items: [
    ["connection", "Connection guide", Wifi], ["find-phone", "Find my phone", Smartphone], ["assistant", "AI guide", Sparkles],
    ["mission-plan", "Mission plan", Clapperboard], ["settings", "Settings", Settings2], ["stats", "Stats", BarChart3],
  ] },
] as const;

function NavItem({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  compact = false,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FolderIcon;
  label: string;
  count?: number;
  compact?: boolean;
}) {
  const button = (
    <button
      type="button"
      onClick={onClick}
      aria-label={compact ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-11 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-[background-color,color] duration-150 focus-visible:outline-2 focus-visible:outline-accent",
        compact && "justify-center px-0",
        active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/70 hover:text-fg",
      )}
    >
      <Icon className={cn("shrink-0", compact ? "size-5" : "size-4")} />
      {!compact && <span className="min-w-0 flex-1 truncate text-left">{label}</span>}
      {!compact && typeof count === "number" && (
        <span className="font-mono text-xs tabular-nums text-subtle">{count}</span>
      )}
    </button>
  );
  return compact ? <Tooltip><TooltipTrigger asChild>{button}</TooltipTrigger><TooltipContent side="right">{label}{typeof count === "number" ? ` · ${count.toLocaleString()}` : ""}</TooltipContent></Tooltip> : button;
}

export function SidebarNav({
  onAddFolder,
  onNavigate,
  compact = false,
  onToggleCompact,
}: {
  onAddFolder: (adult?: boolean) => void;
  onNavigate?: () => void;
  compact?: boolean;
  onToggleCompact?: () => void;
}) {
  const folders = useLibrary((s) => s.folders);
  const videos = useLibrary((s) => s.videos);
  const sourceId = useLibrary((s) => s.sourceId);
  const hideDemo = useLibrary((s) => s.hideDemo);
  const setSource = useLibrary((s) => s.setSource);
  const removeFolder = useLibrary((s) => s.removeFolder);
  const restoreOne = useLibrary((s) => s.restoreOne);
  const setFolderAdult = useLibrary((s) => s.setFolderAdult);
  const unfollow = useLibrary((s) => s.unfollow);
  const favorites = useLibrary((s) => s.favorites);
  const likes = useLibrary((s) => s.likes);
  const progress = useLibrary((s) => s.progress);
  const resumeProgress = useLibrary((s) => s.resumeProgress);
  const hiddenVideos = useLibrary((s) => s.hiddenVideos);
  const history = useLibrary((s) => s.history);
  // Continue is a large derived selector. The library page computes it when
  // opened; running the same full-catalog pass in the sidebar on every route
  // change needlessly delays Home and the other desks.
  const activeContinueCount = useLibrary(s => s.sourceId === "continue" ? selectContinue(s, false).length : null);
  const [lastContinueCount, setLastContinueCount] = useState<number | null>(null);
  useEffect(() => { if (activeContinueCount !== null) setLastContinueCount(activeContinueCount); }, [activeContinueCount]);
  useEffect(() => {
    if (activeContinueCount !== null || sourceId === "home") return;
    return scheduleBackgroundWork(
      () => setLastContinueCount(selectContinue(useLibrary.getState(), false).length),
      { timeoutMs: 2_000, fallbackDelayMs: 350 },
    );
  }, [sourceId, activeContinueCount, folders, hideDemo, hiddenVideos, history, progress, resumeProgress, videos]);
  const continueCount = activeContinueCount ?? lastContinueCount;
  const counts = useCatalogCounts(videos, folders, favorites, likes, history, hiddenVideos, hideDemo);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [followingLimit] = useState(12);
  const [sourceLimit, setSourceLimit] = useState(80);
  const [groups, setGroups] = useState({ ...DEFAULT_SIDEBAR_GROUPS });
  const [privateOpen, setPrivateOpen] = useState(false);
  useEffect(() => { try { setGroups(restoreSidebarGroups(localStorage.getItem(SIDEBAR_GROUPS_KEY))); } catch { /* session defaults */ } }, []);
  useEffect(() => {
    const group = NAV_GROUPS.find(group => group.items.some(item => item[0] === sourceId));
    if (group) setGroups(current => current[group.id] ? current : { ...current, [group.id]: true });
  }, [sourceId]);
  const toggleGroup = (group: SidebarGroup) => setGroups(current => {
    const next = { ...current, [group]: !current[group] };
    try { localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(next)); } catch { /* session */ }
    return next;
  });
  useEffect(() => { try { setFollowingOpen(localStorage.getItem("reelcase.sidebar.following-open") === "true"); setSourcesOpen(localStorage.getItem("reelcase.sidebar.sources-open") === "true"); setPrivateOpen(localStorage.getItem("reelcase.sidebar.private-open") === "true"); } catch { /* defaults */ } }, []);
  const toggleFollowing = () => setFollowingOpen((open) => { const next = !open; try { localStorage.setItem("reelcase.sidebar.following-open", String(next)); } catch { /* session */ } return next; });
  const toggleSources = () => setSourcesOpen((open) => { const next = !open; try { localStorage.setItem("reelcase.sidebar.sources-open", String(next)); } catch { /* session */ } return next; });

  const go = (id: SourceId) => {
    setSource(id);
    // Hub pages such as Find My Phone can be much shorter than a media shelf.
    // Reset the document position so selecting one never leaves the user at a
    // blank lower scroll position from the page they just left.
    window.scrollTo({ top: 0, behavior: "smooth" });
    onNavigate?.();
  };

  const { publicFolders, networkFolders, adultFolders } = useMemo(() => {
    const publicFolders: Folder[] = [], networkFolders: Folder[] = [], adultFolders: Folder[] = [];
    for (const folder of folders) {
      if (folder.adult) adultFolders.push(folder);
      else if ((folder.kind === "youtube" || folder.kind === "twitch") && folder.id !== "youtube:featured") networkFolders.push(folder);
      else if (folder.kind !== "demo" && folder.kind !== "youtube" && folder.kind !== "twitch") publicFolders.push(folder);
    }
    return { publicFolders, networkFolders, adultFolders };
  }, [folders]);
  const demo = folders.find((f) => f.kind === "demo" && !hideDemo);
  const youtubeFollowing = networkFolders.filter((folder) => folder.kind === "youtube");
  const twitchFollowing = networkFolders.filter((folder) => folder.kind === "twitch");

  const badges: Record<string, number> = { ...counts, ...(continueCount === null ? {} : { continueCount }) };
  const folderRows = (items: Folder[], limit: number) => {
    const selected = items.find(folder => folder.id === sourceId);
    const shown = items.slice(0, limit);
    if (selected && !shown.includes(selected)) shown.splice(Math.max(0, shown.length - 1), 1, selected);
    return shown;
  };
  const sectionToggle = (label: string, open: boolean, count: number, onClick: () => void, id: string) => (
    <button type="button" onClick={onClick} aria-expanded={open} aria-controls={id}
      className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-xs font-medium text-muted hover:bg-elevated hover:text-fg">
      <ChevronDown className={cn("size-3.5 shrink-0 transition-transform duration-150 motion-reduce:transition-none", !open && "-rotate-90")} />
      <span className="flex-1 text-left">{label}</span><span className="font-mono text-subtle">{count}</span>
    </button>
  );

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 flex-col">
        <div className={cn("flex shrink-0 items-center gap-2 border-b border-border pb-3", compact ? "flex-col" : "px-1")}>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-fg shadow-border"><Clapperboard className="size-5" /></span>
          {!compact && <div className="min-w-0 flex-1"><p className="font-display text-xl tracking-tight text-fg">Realhub</p><p className="text-xs text-muted">Vault · networks · live</p></div>}
          {onToggleCompact && <Button variant="ghost" size="icon" className="size-11 shrink-0" onClick={onToggleCompact}
            aria-label={compact ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!compact} aria-controls="desktop-sidebar-navigation" title="Toggle sidebar (Ctrl+B)">
            {compact ? <PanelLeftOpen className="size-5" /> : <PanelLeftClose className="size-5" />}
          </Button>}
        </div>
        <div id={onToggleCompact ? "desktop-sidebar-navigation" : "mobile-sidebar-navigation"} className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-2">
          <nav aria-label="Library navigation" className="space-y-2">
            {NAV_GROUPS.map(group => {
              const selected = group.items.find(item => item[0] === sourceId);
              return <section key={group.id} className={cn(compact && "border-b border-border pb-2")}>
                {!compact && <button type="button" onClick={() => toggleGroup(group.id)} aria-expanded={groups[group.id]} aria-controls={`nav-${onToggleCompact ? "desktop" : "mobile"}-${group.id}`}
                  className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-xs font-medium text-muted hover:bg-elevated hover:text-fg">
                  <ChevronDown className={cn("size-3.5 transition-transform duration-150 motion-reduce:transition-none", !groups[group.id] && "-rotate-90")} />
                  <span className="flex-1 text-left">{group.label}</span>{!groups[group.id] && selected && <span className="max-w-28 truncate text-accent">{selected[1]}</span>}
                </button>}
                {(compact || groups[group.id]) && <div id={`nav-${onToggleCompact ? "desktop" : "mobile"}-${group.id}`} className="space-y-0.5">
                  {group.items.map(item => {
                    const [id, label, Icon, badge] = item as readonly [SourceId, string, typeof FolderIcon, string?];
                    return <NavItem key={id} active={sourceId === id} onClick={() => go(id)} icon={Icon} label={label} count={badge ? badges[badge] : undefined} compact={compact} />;
                  })}
                </div>}
              </section>;
            })}
          </nav>
          <Separator className="my-2" />
          {compact ? <div className="space-y-1">
            <NavItem active={publicFolders.some(folder => folder.id === sourceId)} icon={FolderIcon} label="Local sources" count={publicFolders.length} compact onClick={() => { setSourcesOpen(true); onToggleCompact?.(); }} />
            {networkFolders.length > 0 && <NavItem active={networkFolders.some(folder => folder.id === sourceId)} icon={Users} label="Following" count={networkFolders.length} compact onClick={() => { setFollowingOpen(true); onToggleCompact?.(); }} />}
          </div> : <>
            {sectionToggle("Local sources", sourcesOpen, publicFolders.length, toggleSources, "sidebar-sources")}
            {sourcesOpen && <div id="sidebar-sources" className="space-y-0.5">
              {demo && <NavItem active={sourceId === demo.id} onClick={() => go(demo.id)} icon={Film} label={demo.name} count={demo.videoCount} />}
              {folderRows(publicFolders, sourceLimit).map(folder => <FolderRow key={folder.id} folder={folder} active={sourceId === folder.id}
                onClick={() => { if (folder.needsPermission) void restoreOne(folder.id); else go(folder.id); }}
                onRemove={() => void removeFolder(folder.id)} onToggleAdult={() => setFolderAdult(folder.id, true)} />)}
              {publicFolders.length > sourceLimit && <Button variant="ghost" size="sm" onClick={() => setSourceLimit(value => value + 80)}>Show 80 more sources</Button>}
            </div>}
            {networkFolders.length > 0 && <>
              {sectionToggle("Following", followingOpen, networkFolders.length, toggleFollowing, "sidebar-following")}
              {followingOpen && <div id="sidebar-following" className="space-y-0.5">
                {[{ label: "YouTube", items: youtubeFollowing }, { label: "Twitch", items: twitchFollowing }].filter(group => group.items.length).map(group => <div key={group.label}>
                  <p className="px-2 py-2 text-xs text-subtle">{group.label} · {group.items.length}</p>
                  {folderRows(group.items, followingLimit).map(folder => <FolderRow key={folder.id} folder={folder} active={sourceId === folder.id} onClick={() => go(folder.id)} onRemove={() => unfollow(folder.id)} onToggleAdult={() => {}} hideAdult />)}
                </div>)}
                {(youtubeFollowing.length > followingLimit || twitchFollowing.length > followingLimit) && <Button variant="ghost" size="sm" onClick={() => go(youtubeFollowing.length > followingLimit ? "youtube" : "twitch")}>Manage all follows</Button>}
              </div>}
            </>}
            {adultFolders.length > 0 && <>
              {sectionToggle("Private sources", privateOpen, adultFolders.length, () => setPrivateOpen(value => { const next = !value; try { localStorage.setItem("reelcase.sidebar.private-open", String(next)); } catch { /* session */ } return next; }), "sidebar-private")}
              {privateOpen && <div id="sidebar-private" className="space-y-0.5">
                {folderRows(adultFolders, sourceLimit).map(folder => <FolderRow key={folder.id} folder={folder} active={sourceId === folder.id}
                  onClick={() => { if (folder.needsPermission) void restoreOne(folder.id); else go("adults"); }}
                  onRemove={() => void removeFolder(folder.id)} onToggleAdult={() => setFolderAdult(folder.id, false)} />)}
                {adultFolders.length > sourceLimit && <Button variant="ghost" size="sm" onClick={() => setSourceLimit(value => value + 80)}>Show more private sources</Button>}
              </div>}
            </>}
          </>}
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-border pt-3 pb-1">
          <Button className="h-11 w-full" aria-label="Add folder" title={compact ? "Add folder" : undefined} onClick={() => onAddFolder(false)}><FolderPlus className="size-4" />{!compact && "Add folder"}</Button>
          {(sourceId === "adults" || sourceId === "adult-fetishes") && <Button variant="secondary" className="h-11 w-full" aria-label="Add private folder" title={compact ? "Add private folder" : undefined} onClick={() => onAddFolder(true)}><Lock className="size-4" />{!compact && "Private folder"}</Button>}
        </div>
      </div>
    </TooltipProvider>
  );
}

function FolderRow({
  folder,
  active,
  onClick,
  onRemove,
  onToggleAdult,
  hideAdult,
}: {
  folder: Folder;
  active: boolean;
  onClick: () => void;
  onRemove: () => void;
  onToggleAdult: () => void;
  hideAdult?: boolean;
}) {
  return (
    <div className="group flex min-w-0 items-center gap-0.5">
      <div className="min-w-0 flex-1"><NavItem active={active} onClick={onClick} icon={folder.adult ? Lock : FolderIcon}
        label={folder.needsPermission ? `${folder.name} (restore)` : folder.name} count={folder.needsPermission ? undefined : folder.videoCount} /></div>
      {folder.health && <span title={folder.health === "healthy" ? "Source checked" : folder.health === "cached" ? "Cached catalog" : "Source needs attention"} className={cn("size-1.5 shrink-0 rounded-full", folder.health === "healthy" ? "bg-accent" : folder.health === "cached" ? "bg-muted" : "bg-danger")} />}
      {!hideAdult && <button type="button" aria-label={folder.adult ? `Move ${folder.name} to library` : `Move ${folder.name} to Adults`} onClick={onToggleAdult}
        className="flex size-11 shrink-0 items-center justify-center rounded-sm text-subtle hover:bg-elevated hover:text-fg focus-visible:outline-accent">
        {folder.adult ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
      </button>}
      <button type="button" aria-label={`Remove ${folder.name}`} onClick={onRemove}
        className="flex size-11 shrink-0 items-center justify-center rounded-sm text-subtle hover:bg-elevated hover:text-fg focus-visible:outline-accent"><X className="size-3.5" /></button>
    </div>
  );
}
