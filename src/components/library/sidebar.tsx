import type { ReactNode } from "react";
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
  ShoppingBag,
  Box,
  MonitorPlay,
  Users,
  X as XIcon,
  X,
  Youtube,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { DEMO_FOLDER_ID } from "@/lib/videos/samples";
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
  const favCount = useLibrary(
    (s) =>
      Object.keys(s.favorites).filter((id) => {
        const v = s.videos.find((x) => x.id === id);
        return v && !isAdultVideo(v, s.folders);
      }).length,
  );
  const continueCount = useLibrary((s) => {
    return s.videos.filter((v) => {
      if (isAdultVideo(v, s.folders)) return false;
      const p = s.progress[v.id];
      if (!p || p.d <= 0) return false;
      const r = p.t / p.d;
      return r > 0.04 && r < 0.96 && !(s.hideDemo && v.isSample);
    }).length;
  });
  const historyCount = useLibrary((s) => {
    return s.history.filter((h) => {
      const v = s.videos.find((x) => x.id === h.id);
      return v && !isAdultVideo(v, s.folders) && !(s.hideDemo && v.isSample);
    }).length;
  });
  const adultCount = useLibrary((s) => {
    if (!s.adultsUnlocked) return undefined;
    return s.videos.filter((v) => isAdultVideo(v, s.folders)).length;
  });
  const ytCount = useLibrary((s) => s.videos.filter((v) => v.remote?.kind === "youtube").length);
  const twitchCount = useLibrary((s) => s.videos.filter((v) => v.remote?.kind === "twitch").length);
  const liveCount = useLibrary((s) => s.videos.filter((v) => v.remote?.live).length);

  const go = (id: SourceId) => {
    setSource(id);
    onNavigate?.();
  };

  const publicFolders = folders.filter(
    (f) => f.kind !== "demo" && f.kind !== "youtube" && f.kind !== "twitch" && !f.adult,
  );
  const networkFolders = folders.filter(
    (f) => (f.kind === "youtube" || f.kind === "twitch") && f.id !== "youtube:featured",
  );
  const adultFolders = folders.filter((f) => f.adult);
  const demo = folders.find((f) => f.kind === "demo" && !hideDemo);
  const publicCount = videos.filter(
    (v) => !isAdultVideo(v, folders) && !(hideDemo && v.isSample),
  ).length;

  return (
    <div className="flex h-full flex-col">
      <div className="px-2 pt-1 pb-4">
        <p className="font-display text-2xl leading-none tracking-tight text-fg">Reelcase</p>
        <p className="mt-1 text-xs text-muted">Vault · networks · live</p>
      </div>
      <nav className="flex flex-col gap-0.5 px-1">
        <NavItem
          active={sourceId === "home"}
          onClick={() => go("home")}
          icon={Clapperboard}
          label="Home"
          count={publicCount}
        />
        <NavItem
          active={sourceId === "movies"}
          onClick={() => go("movies")}
          icon={Film}
          label="Movies"
        />
        <NavItem
          active={sourceId === "youtube"}
          onClick={() => go("youtube")}
          icon={Youtube}
          label="YouTube"
          count={ytCount}
        />
        <NavItem
          active={sourceId === "twitch"}
          onClick={() => go("twitch")}
          icon={Radio}
          label="Twitch"
          count={twitchCount}
        />
        <NavItem
          active={sourceId === "live"}
          onClick={() => go("live")}
          icon={Radio}
          label="Live"
          count={liveCount}
        />
        <NavItem
          active={sourceId === "favorites"}
          onClick={() => go("favorites")}
          icon={Heart}
          label="Favorites"
          count={favCount}
        />
        <NavItem
          active={sourceId === "continue"}
          onClick={() => go("continue")}
          icon={Clock3}
          label="Continue"
          count={continueCount}
        />
        <NavItem
          active={sourceId === "history"}
          onClick={() => go("history")}
          icon={History}
          label="History"
          count={historyCount}
        />
        <NavItem
          active={sourceId === "adults"}
          onClick={() => go("adults")}
          icon={adultsUnlocked ? LockOpen : Lock}
          label="Adults"
          count={adultCount}
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
          active={sourceId === "social"}
          onClick={() => go("social")}
          icon={XIcon}
          label="X accounts"
        />
        <NavItem
          active={sourceId === "settings"}
          onClick={() => go("settings")}
          icon={Settings2}
          label="Settings"
        />
      </nav>
      <Separator className="my-4" />
      <p className="px-3 pb-2 text-xs font-medium tracking-wide text-subtle uppercase">Sources</p>
      <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-1">
        {demo && (
          <NavItem
            active={sourceId === demo.id}
            onClick={() => go(demo.id)}
            icon={Film}
            label={demo.name}
            count={demo.videoCount}
          />
        )}
        {publicFolders.map((folder) => (
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
        {networkFolders.length > 0 && (
          <>
            <p className="mt-3 px-2 pb-1 text-xs font-medium tracking-wide text-subtle uppercase">
              Following
            </p>
            {networkFolders.map((folder) => (
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
