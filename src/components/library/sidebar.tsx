import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Clapperboard,
  Clock3,
  Film,
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { isAdultVideo, useLibrary } from "@/lib/videos/store";
import type { Folder, SourceId } from "@/lib/videos/types";

function NavItem({
  active,
  onClick,
  icon: Icon,
  label,
  count,
  trailing,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof FolderIcon;
  label: string;
  count?: number;
  trailing?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-10 w-full items-center gap-2.5 rounded-md px-2.5 text-sm transition-[background-color,color] duration-150 ease-[var(--ease-out)]",
        active ? "bg-elevated text-fg" : "text-muted hover:bg-elevated/70 hover:text-fg",
      )}
    >
      <Icon className="size-4 shrink-0" />
      <span className="min-w-0 flex-1 truncate text-left">{label}</span>
      {typeof count === "number" && (
        <span className="font-mono text-xs tabular-nums text-subtle">{count}</span>
      )}
      {trailing}
    </button>
  );
}

export function SidebarNav({
  onAddFolder,
  onNavigate,
}: {
  onAddFolder: (adult?: boolean) => void;
  onNavigate?: () => void;
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
  const adultsUnlocked = useLibrary((s) => s.adultsUnlocked);
  const lockAdults = useLibrary((s) => s.lockAdults);
  const favorites = useLibrary((s) => s.favorites);
  const progress = useLibrary((s) => s.progress);
  const history = useLibrary((s) => s.history);
  const [followingOpen, setFollowingOpen] = useState(false);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [followingLimit, setFollowingLimit] = useState(48);
  const [sourceLimit, setSourceLimit] = useState(80);
  useEffect(() => { try { setFollowingOpen(localStorage.getItem("reelcase.sidebar.following-open") === "true"); setSourcesOpen(localStorage.getItem("reelcase.sidebar.sources-open") === "true"); } catch { /* defaults */ } }, []);
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

  const { publicFolders, networkFolders, adultFolders, counts } = useMemo(() => {
    const publicFolders: Folder[] = [];
    const networkFolders: Folder[] = [];
    const adultFolders: Folder[] = [];
    const folderById = new Map(folders.map((folder) => [folder.id, folder]));
    let publicCount = 0, adultCount = 0, ytCount = 0, twitchCount = 0, liveCount = 0, continueCount = 0;
    const videosById = new Map(videos.map((video) => [video.id, video]));
    for (const folder of folders) {
      if (folder.adult) adultFolders.push(folder);
      else if ((folder.kind === "youtube" || folder.kind === "twitch") && folder.id !== "youtube:featured") networkFolders.push(folder);
      else if (folder.kind !== "demo" && folder.kind !== "youtube" && folder.kind !== "twitch") publicFolders.push(folder);
    }
    for (const video of videos) {
      const adult = Boolean(folderById.get(video.folderId)?.adult);
      if (adult) { adultCount += 1; continue; }
      if (!(hideDemo && video.isSample)) {
        publicCount += 1;
        const mark = progress[video.id];
        if (mark?.d && mark.t / mark.d > 0.04 && mark.t / mark.d < 0.96) continueCount += 1;
      }
      if (video.remote?.kind === "youtube") ytCount += 1;
      if (video.remote?.kind === "twitch") twitchCount += 1;
      if (video.remote?.live) liveCount += 1;
    }
    let favCount = 0, historyCount = 0;
    for (const id of Object.keys(favorites)) if (videosById.get(id) && !folderById.get(videosById.get(id)!.folderId)?.adult) favCount += 1;
    for (const entry of history) { const video = videosById.get(entry.id); if (video && !folderById.get(video.folderId)?.adult && !(hideDemo && video.isSample)) historyCount += 1; }
    return { publicFolders, networkFolders, adultFolders, counts: { publicCount, adultCount: adultsUnlocked ? adultCount : undefined, ytCount, twitchCount, liveCount, continueCount, favCount, historyCount } };
  }, [adultsUnlocked, favorites, folders, hideDemo, history, progress, videos]);
  const demo = folders.find((f) => f.kind === "demo" && !hideDemo);
  const youtubeFollowing = networkFolders.filter((folder) => folder.kind === "youtube");
  const twitchFollowing = networkFolders.filter((folder) => folder.kind === "twitch");

  return (
    <div className="flex min-h-full flex-col">
      <div className="px-2 pt-1 pb-4">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-accent text-accent-fg shadow-border"><Clapperboard className="size-5" /></span>
          <p className="font-display text-2xl leading-none tracking-tight text-fg">Reelcase</p>
        </div>
        <p className="mt-1 text-xs text-muted">Vault · networks · live</p>
      </div>
      <nav className="flex flex-col gap-0.5 px-1">
        <NavItem
          active={sourceId === "home"}
          onClick={() => go("home")}
          icon={Clapperboard}
          label="Home"
          count={counts.publicCount}
        />
        <NavItem
          active={sourceId === "movies"}
          onClick={() => go("movies")}
          icon={Film}
          label="Movies"
        />
        <NavItem
          active={sourceId === "genres"}
          onClick={() => go("genres")}
          icon={Film}
          label="Topics"
        />
        <NavItem
          active={sourceId === "youtube"}
          onClick={() => go("youtube")}
          icon={Youtube}
          label="YouTube"
          count={counts.ytCount}
        />
        <NavItem
          active={sourceId === "twitch"}
          onClick={() => go("twitch")}
          icon={Radio}
          label="Twitch"
          count={counts.twitchCount}
        />
        <NavItem
          active={sourceId === "live"}
          onClick={() => go("live")}
          icon={Radio}
          label="Live"
          count={counts.liveCount}
        />
        <NavItem
          active={sourceId === "favorites"}
          onClick={() => go("favorites")}
          icon={Heart}
          label="Favorites"
          count={counts.favCount}
        />
        <NavItem
          active={sourceId === "continue"}
          onClick={() => go("continue")}
          icon={Clock3}
          label="Continue"
          count={counts.continueCount}
        />
        <NavItem
          active={sourceId === "history"}
          onClick={() => go("history")}
          icon={History}
          label="History"
          count={counts.historyCount}
        />
        <NavItem
          active={sourceId === "adults"}
          onClick={() => go("adults")}
          icon={adultsUnlocked ? LockOpen : Lock}
          label="Adults"
          count={counts.adultCount}
          trailing={
            adultsUnlocked ? (
              <span
                role="button"
                tabIndex={0}
                aria-label="Lock Adults"
                onClick={(e) => {
                  e.stopPropagation();
                  lockAdults();
                  onNavigate?.();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    lockAdults();
                  }
                }}
                className="flex size-7 items-center justify-center rounded-sm text-subtle hover:bg-bg hover:text-fg"
              >
                <Lock className="size-3.5" />
              </span>
            ) : undefined
          }
        />
        <NavItem
          active={sourceId === "photos"}
          onClick={() => go("photos")}
          icon={Images}
          label="Photos"
        />
        <NavItem
          active={sourceId === "spotify"}
          onClick={() => go("spotify")}
          icon={Music2}
          label="Spotify"
        />
        <NavItem
          active={sourceId === "prints"}
          onClick={() => go("prints")}
          icon={Box}
          label="3D prints"
        />
        <NavItem
          active={sourceId === "games"}
          onClick={() => go("games")}
          icon={Gamepad2}
          label="Games"
        />
        <NavItem
          active={sourceId === "shop"}
          onClick={() => go("shop")}
          icon={ShoppingBag}
          label="Shop"
        />
        <NavItem
          active={sourceId === "streaming"}
          onClick={() => go("streaming")}
          icon={MonitorPlay}
          label="Streaming"
        />
        <NavItem
          active={sourceId === "watch-room"}
          onClick={() => go("watch-room")}
          icon={Users}
          label="Watch room"
        />
        <NavItem
          active={sourceId === "connection"}
          onClick={() => go("connection")}
          icon={Wifi}
          label="Connection guide"
        />
        <NavItem
          active={sourceId === "find-phone"}
          onClick={() => go("find-phone")}
          icon={Smartphone}
          label="Find my phone"
        />
        <NavItem
          active={sourceId === "social"}
          onClick={() => go("social")}
          icon={XIcon}
          label="X accounts"
        />
        <NavItem
          active={sourceId === "assistant"}
          onClick={() => go("assistant")}
          icon={Sparkles}
          label="AI guide"
        />
        <NavItem
          active={sourceId === "mission-plan"}
          onClick={() => go("mission-plan")}
          icon={Clapperboard}
          label="Mission plan"
        />
        <NavItem
          active={sourceId === "settings"}
          onClick={() => go("settings")}
          icon={Settings2}
          label="Settings"
        />
        <NavItem
          active={sourceId === "stats"}
          onClick={() => go("stats")}
          icon={BarChart3}
          label="Stats"
        />
      </nav>
      <Separator className="my-4" />
      <button type="button" onClick={toggleSources} className="flex items-center justify-between px-3 pb-2 text-xs font-medium tracking-wide text-subtle uppercase"><span>Local sources</span><span>{sourcesOpen ? "Hide" : `${publicFolders.length}`}</span></button>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1">
        {sourcesOpen && demo && (
          <NavItem
            active={sourceId === demo.id}
            onClick={() => go(demo.id)}
            icon={Film}
            label={demo.name}
            count={demo.videoCount}
          />
        )}
        {sourcesOpen && publicFolders.slice(0, sourceLimit).map((folder) => (
          <FolderRow
            key={folder.id}
            folder={folder}
            active={sourceId === folder.id}
            onClick={() => {
              if (folder.needsPermission) void restoreOne(folder.id);
              else go(folder.id);
            }}
            onRemove={() => void removeFolder(folder.id)}
            onToggleAdult={() => setFolderAdult(folder.id, true)}
          />
        ))}
        {sourcesOpen && publicFolders.length > sourceLimit && <Button variant="ghost" size="sm" className="mx-1 mt-1" onClick={() => setSourceLimit((value) => value + 80)}>Show 80 more sources</Button>}
        {networkFolders.length > 0 && (
          <>
            <button type="button" onClick={toggleFollowing} className="mt-3 flex items-center justify-between px-2 pb-1 text-xs font-medium tracking-wide text-subtle uppercase"><span>Following</span><span>{followingOpen ? "Hide" : networkFolders.length}</span></button>
            {followingOpen && <p className="px-2 pt-1 text-[10px] font-medium tracking-wide text-subtle uppercase">YouTube · {youtubeFollowing.length}</p>}
            {followingOpen && youtubeFollowing.slice(0, followingLimit).map((folder) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                active={sourceId === folder.id}
                onClick={() => go(folder.id)}
                onRemove={() => unfollow(folder.id)}
                onToggleAdult={() => {}}
                hideAdult
              />
            ))}
            {followingOpen && <p className="px-2 pt-3 text-[10px] font-medium tracking-wide text-subtle uppercase">Twitch · {twitchFollowing.length}</p>}
            {followingOpen && twitchFollowing.slice(0, followingLimit).map((folder) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                active={sourceId === folder.id}
                onClick={() => go(folder.id)}
                onRemove={() => unfollow(folder.id)}
                onToggleAdult={() => {}}
                hideAdult
              />
            ))}
            {followingOpen && (youtubeFollowing.length > followingLimit || twitchFollowing.length > followingLimit) && <Button variant="ghost" size="sm" className="mx-1 mt-1" onClick={() => setFollowingLimit((value) => value + 48)}>Show 48 more follows</Button>}
          </>
        )}
        {adultsUnlocked && adultFolders.length > 0 && (
          <>
            <p className="mt-3 px-2 pb-1 text-xs font-medium tracking-wide text-subtle uppercase">
              Private
            </p>
            {adultFolders.map((folder) => (
              <FolderRow
                key={folder.id}
                folder={folder}
                active={sourceId === folder.id}
                onClick={() => {
                  if (folder.needsPermission) void restoreOne(folder.id);
                  else go("adults");
                }}
                onRemove={() => void removeFolder(folder.id)}
                onToggleAdult={() => setFolderAdult(folder.id, false)}
              />
            ))}
          </>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-2 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <Button className="w-full" onClick={() => onAddFolder(false)}>
          <FolderPlus className="size-4" />
          Add folder
        </Button>
        {sourceId === "adults" && adultsUnlocked && (
          <Button variant="secondary" className="w-full" onClick={() => onAddFolder(true)}>
            <Lock className="size-4" />
            Private folder
          </Button>
        )}
      </div>
    </div>
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
    <div className="group relative">
      <NavItem
        active={active}
        onClick={onClick}
        icon={folder.adult ? Lock : FolderIcon}
        label={folder.needsPermission ? `${folder.name} (restore)` : folder.name}
        count={folder.needsPermission ? undefined : folder.videoCount}
        trailing={
          <span className="flex items-center">
            {folder.health && <span title={folder.health === "healthy" ? "Source checked" : folder.health === "cached" ? "Cached catalog" : "Source needs attention"} className={cn("mr-1 size-2 rounded-full", folder.health === "healthy" ? "bg-accent" : folder.health === "cached" ? "bg-muted" : "bg-danger")} />}
            {!hideAdult && (
              <span
                role="button"
                tabIndex={0}
                aria-label={
                  folder.adult ? `Move ${folder.name} to library` : `Move ${folder.name} to Adults`
                }
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAdult();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onToggleAdult();
                  }
                }}
                className="flex size-7 items-center justify-center rounded-sm text-subtle opacity-0 transition-opacity duration-150 hover:bg-bg hover:text-fg group-hover:opacity-100 focus-visible:opacity-100"
              >
                {folder.adult ? <LockOpen className="size-3.5" /> : <Lock className="size-3.5" />}
              </span>
            )}
            <span
              role="button"
              tabIndex={0}
              aria-label={`Remove ${folder.name}`}
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }
              }}
              className="flex size-7 items-center justify-center rounded-sm text-subtle opacity-0 transition-opacity duration-150 hover:bg-bg hover:text-fg group-hover:opacity-100 focus-visible:opacity-100"
            >
              <X className="size-3.5" />
            </span>
          </span>
        }
      />
    </div>
  );
}

