import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Box,
  Clapperboard,
  Download,
  ExternalLink,
  Gamepad2,
  Images,
  ImagePlus,
  MessageCircle,
  Music2,
  MonitorPlay,
  PackageSearch,
  Pause,
  Play,
  Radio,
  Rocket,
  Search,
  Settings2,
  Lightbulb,
  ShoppingBag,
  Users,
  Wifi,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLibrary } from "@/lib/videos/store";
import { useP2PRoom } from "@/lib/multiplayer";
import type { LibraryVideo } from "@/lib/videos/types";

type LocalItem = { name: string; path: string; size: number; addedAt: number; launchUrl?: string; iconData?: string };
type HubStore = { prints: LocalItem[]; games: LocalItem[] };
const HUB_KEY = "reelcase.hub.v1";
const PREFERENCE_GROUPS = {
  Playback: ["Autoplay next video", "Resume playback", "Skip intros", "Skip credits", "Remember volume", "Default playback speed", "Prefer captions", "Caption styling", "Prefer dubbed audio", "Picture in picture", "Theater mode", "Dim room lights", "Hardware decode", "Data saver", "High quality on Wi-Fi", "Play trailers muted", "Ask before autoplay", "Loop short videos", "Show chapter markers", "Keep player controls visible"],
  Library: ["Show hidden files", "Group by folder", "Remember folder view", "Compact list view", "Show file paths", "Show file size", "Show media details", "Index new folders", "Hide duplicate titles", "Prefer poster artwork", "Show unwatched badge", "Show progress bar", "Show date added", "Show runtime", "Open preview before play", "Keep last search", "Search tags", "Search notes", "Search exact titles", "Clear recent searches"],
  Discovery: ["Local recommendations", "Use favorites for picks", "Use watch history for picks", "Use tags for picks", "Surface short films", "Surface live channels", "Show channel uploads", "Show random pick", "Refresh public channels", "Include open-source films", "Prefer familiar genres", "Try new genres", "Show trending shelf", "Show recently added", "Show because-you-watched", "Show top picks", "Show trailers", "Show creator details", "Show similar titles", "Hide already watched"],
  WatchRoom: ["Watch-room notices", "Room clock correction", "Send periodic timeline ticks", "Require guest consent", "Show guest ping", "Show connection quality", "Keep chat history", "Allow queue edits", "Auto play next queue item", "Default compact stage", "Remember stage size", "Share playback speed", "Pause when host leaves", "Show ready check", "Copy room code on create", "Allow reaction messages", "Show queue duration", "Show room activity", "Mute room notifications", "Show Roku handoff"],
  Privacy: ["Reduce motion", "Hide demo media", "Private search history", "Clear history on exit", "Lock adult library on exit", "Hide private titles from picks", "Keep notes local", "Keep tags local", "Ask before external links", "Ask before file sharing", "Do not preload remote media", "Mask local file paths", "Hide viewing activity", "Do not use watch history", "Do not use likes", "Do not use ratings", "Export metadata only", "Remember device permissions", "Show privacy reminders", "Reset local preferences"],
} as const;
const PREFERENCES = Object.entries(PREFERENCE_GROUPS).flatMap(([group, labels]) => labels.map((label) => ({ key: `${group}-${label}`.toLowerCase().replaceAll(" ", "-"), group, label, detail: `${group} preference saved locally.` })));

function readHub(): HubStore {
  const samples: LocalItem[] = [
    {
      name: "Calibration cube.stl",
      path: "Reelcase samples/Calibration cube.stl",
      size: 182400,
      addedAt: 1,
    },
    { name: "Cable clip.3mf", path: "Reelcase samples/Cable clip.3mf", size: 94100, addedAt: 2 },
    { name: "OpenSCAD phone stand.stl", path: "Open-source examples/OpenSCAD phone stand.stl", size: 512400, addedAt: 4 },
    { name: "Gridfinity bin.3mf", path: "Open-source examples/Gridfinity bin.3mf", size: 784200, addedAt: 5 },
    { name: "Benchy calibration.stl", path: "Open-source examples/Benchy calibration.stl", size: 643100, addedAt: 6 },
    { name: "Parametric drawer label.stl", path: "Open-source examples/Parametric drawer label.stl", size: 229100, addedAt: 7 },
    {
      name: "Tool tray.gcode",
      path: "Reelcase samples/Tool tray.gcode",
      size: 1248000,
      addedAt: 3,
    },
  ];
  try {
    const raw = localStorage.getItem(HUB_KEY);
    if (!raw) return { prints: samples, games: [] };
    return JSON.parse(raw) as HubStore;
  } catch {
    return { prints: samples, games: [] };
  }
}
function writeHub(next: HubStore) {
  localStorage.setItem(HUB_KEY, JSON.stringify(next));
}
function filesToItems(files: FileList, gamesOnly = false): LocalItem[] {
  return [...files]
    .filter((file) => !gamesOnly || /\.(exe|lnk|url|appref-ms)$/i.test(file.name))
    .filter((file) => !/^(uninstall|setup|crashreporter)/i.test(file.name))
    .map((file) => ({
      name: file.name,
      path: file.webkitRelativePath || file.name,
      size: file.size,
      addedAt: Date.now(),
    }));
}
function bytes(value: number) {
  return value < 1024 * 1024
    ? `${Math.max(1, Math.round(value / 1024))} KB`
    : `${(value / 1024 / 1024).toFixed(1)} MB`;
}

export function SettingsSection() {
  const [hub, setHub] = useState<HubStore>({ prints: [], games: [] });
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [preferenceGroup, setPreferenceGroup] = useState<keyof typeof PREFERENCE_GROUPS>("Playback");
  useEffect(() => setHub(readHub()), []);
  useEffect(() => { try { setPreferences(JSON.parse(localStorage.getItem("reelcase.settings.v1") ?? "{}") as Record<string, boolean>); } catch { setPreferences({}); } }, []);
  const togglePreference = (key: string) => { const next = { ...preferences, [key]: !preferences[key] }; setPreferences(next); localStorage.setItem("reelcase.settings.v1", JSON.stringify(next)); };
  const exportLocal = () => {
    const state = useLibrary.getState();
    const payload = {
      exportedAt: new Date().toISOString(),
      note: "Reelcase library metadata only. Original local files and browser permission handles are never exported.",
      library: {
        folders: state.folders,
        videos: state.videos,
        favorites: Object.keys(state.favorites),
        likes: Object.keys(state.likes),
        tags: state.tags,
        categories: state.categories,
        progress: state.progress,
        history: state.history,
        follows: state.follows,
        notices: state.notices,
      },
      hub,
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `reelcase-export-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <HubShell
      eyebrow="Library control"
      icon={<Settings2 className="size-4" />}
      title="Settings & local export"
      copy="Your Reelcase library stays in this browser. Export a portable metadata backup whenever you need it."
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Video entries" value={useLibrary((s) => s.videos.length)} />
        <Stat label="Followed channels" value={useLibrary((s) => s.follows.length)} />
        <Stat label="Saved hub items" value={hub.prints.length + hub.games.length} />
      </div>
      <div className="mt-6 flex flex-col gap-4 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl text-fg">Export local metadata</h2>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Downloads your catalog, favorites, likes, tags, watch history, follows, notifications,
            print list, and game list. Your original media and any browser file permissions remain
            private on this device.
          </p>
        </div>
        <Button onClick={exportLocal}>
          <Download className="size-4" /> Export JSON
        </Button>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InfoCard
          icon={<Clapperboard className="size-5" />}
          title="Local edit workspace"
          copy="The player has reliable native playback and metadata tools today. A non-destructive OpenShot-style timeline requires a dedicated browser media engine; keep it local-first and never upload media by default."
        />
        <InfoCard
          icon={<Bot className="size-5" />}
          title="AI recommendations, later"
          copy="Your tags, likes, categories, history, and export file are the future recommendation signal. Add a server endpoint and explicit consent screen before any assistant can read it."
        />
        <InfoCard
          icon={<Bot className="size-5" />}
          title="AI tools directory"
          copy="Prepare future connectors for recommendations, metadata cleanup, captioning, and watch-list suggestions. Keep every connection opt-in and scoped to only the library data you select."
        />
        <InfoCard
          icon={<Settings2 className="size-5" />}
          title="Privacy defaults"
          copy="Local cataloging, tags, ratings, and history stay on this device. Export is metadata-only; no source videos, print files, game files, or browser permissions are included."
        />
        <InfoCard
          icon={<PackageSearch className="size-5" />}
          title="How Reelcase works"
          copy="Folders and files are cataloged locally; channel follows use their public pages; Watch Room sends direct peer events; and external services open only when you choose them. See PROJECT_GUIDE.md and LAN_WATCH_ROOM.md in the repository for the complete maintainer guide."
        />
        <AlexaLightControl />
      </div>
      <div className="mt-4 rounded-lg bg-elevated p-5 shadow-border"><div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="font-display text-2xl text-fg">100 local preferences</h2><p className="mt-1 text-sm text-muted">Organized controls for playback, library management, discovery, rooms, and privacy.</p></div><p className="text-xs text-muted">{Object.values(preferences).filter(Boolean).length} enabled</p></div><div className="mt-4 flex flex-wrap gap-2">{(Object.keys(PREFERENCE_GROUPS) as Array<keyof typeof PREFERENCE_GROUPS>).map((group) => <Button key={group} size="sm" variant={preferenceGroup === group ? "default" : "secondary"} onClick={() => setPreferenceGroup(group)}>{group} · {PREFERENCE_GROUPS[group].length}</Button>)}</div><div className="mt-4 grid gap-3 sm:grid-cols-2">{PREFERENCES.filter((item) => item.group === preferenceGroup).map((item) => <button key={item.key} type="button" onClick={() => togglePreference(item.key)} className="flex min-h-16 items-center justify-between gap-4 rounded-md bg-bg/45 px-4 text-left shadow-border"><span><span className="block text-sm font-medium text-fg">{item.label}</span><span className="mt-0.5 block text-xs text-muted">{item.detail}</span></span><span className={`flex h-6 w-11 items-center rounded-full p-0.5 transition-[background-color] duration-150 ${preferences[item.key] ? "bg-accent justify-end" : "bg-surface justify-start"}`}><span className={`size-5 rounded-full ${preferences[item.key] ? "bg-accent-fg" : "bg-muted"}`} /></span></button>)}</div></div>
    </HubShell>
  );
}

export function PrintsSection() {
  return (
    <LocalCatalog
      kind="prints"
      eyebrow="Maker shelf"
      icon={<Box className="size-4" />}
      title="3D prints"
      copy="Keep a lightweight catalog of print-ready files. Add STL, OBJ, 3MF, or G-code files to track what is ready for the printer."
      accept=".stl,.obj,.3mf,.gcode"
      footer={<div className="mt-5 grid gap-3 sm:grid-cols-2"><ServiceLink name="Printables" href="https://www.printables.com/" copy="Browse community-shared printable models."/><ServiceLink name="OpenSCAD" href="https://openscad.org/" copy="Build and customize open parametric models."/></div>}
    />
  );
}

export function SpotifySection() {
  const [saved, setSaved] = useState(() => {
    if (typeof window === "undefined") return "";
    try {
      return localStorage.getItem("reelcase.spotify.playlist") ?? "";
    } catch {
      return "";
    }
  });
  const [playlistUrl, setPlaylistUrl] = useState(saved);
  return <HubShell eyebrow="Music companion" icon={<Music2 className="size-4" />} title="Spotify, beside your library." copy="Keep music separate from video playback. Connect through Spotify’s official player or save a playlist link locally for your next listening session.">
    <div className="mt-6 rounded-lg bg-elevated p-5 shadow-border"><p className="text-sm font-medium text-fg">Open Spotify</p><p className="mt-1 text-sm text-muted">Account sign-in and playback remain on Spotify’s official site or app. Reelcase does not collect your Spotify password or tokens.</p><div className="mt-4 flex flex-wrap gap-2"><a href="https://open.spotify.com/" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">Open Spotify <ExternalLink className="ml-2 size-4" /></a></div></div><div className="mt-4 rounded-lg bg-elevated p-5 shadow-border"><p className="text-sm font-medium text-fg">Save a playlist shortcut</p><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={playlistUrl} onChange={(event) => setPlaylistUrl(event.target.value)} placeholder="https://open.spotify.com/playlist/..." aria-label="Spotify playlist link"/><Button disabled={!playlistUrl.includes("spotify.com")} onClick={() => { localStorage.setItem("reelcase.spotify.playlist", playlistUrl.trim()); setSaved(playlistUrl.trim()); }}>Save shortcut</Button></div>{saved && <a className="mt-3 inline-flex text-sm text-accent hover:text-fg" href={saved} target="_blank" rel="noreferrer">Open saved playlist <ExternalLink className="ml-1 size-4" /></a>}</div>
  </HubShell>;
}

function AlexaLightControl() {
  const [scene, setScene] = useState("Movie night");
  const [saved, setSaved] = useState(false);
  return <div className="rounded-lg bg-elevated p-5 shadow-border"><span className="text-accent"><Lightbulb className="size-5" /></span><h2 className="mt-3 font-display text-2xl text-fg">Alexa light scenes</h2><p className="mt-2 text-sm leading-6 text-muted">Set a preferred scene locally, then ask Alexa to run that scene. Direct device control needs an authorized Alexa Smart Home skill, which is not connected here.</p><div className="mt-3 flex flex-wrap gap-2">{["Movie night", "Bright", "Warm", "Pause lights"].map((item) => <Button key={item} size="sm" variant={scene === item ? "default" : "secondary"} onClick={() => setScene(item)}>{item}</Button>)}</div><Button size="sm" className="mt-3" onClick={() => { localStorage.setItem("reelcase.alexa.scene", scene); setSaved(true); }}>Save preferred scene</Button>{saved && <p className="mt-2 text-xs text-accent">Saved. Say “Alexa, {scene}.” after creating that scene in the Alexa app.</p>}</div>;
}
type LocalPhoto = { id: string; name: string; url: string; people: string[]; album: string; favorite: boolean; addedAt: number };

export function PhotosSection() {
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [selectedPerson, setSelectedPerson] = useState("All photos");
  const [photoSearch, setPhotoSearch] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [newestFirst, setNewestFirst] = useState(true);
  const [photoFolders, setPhotoFolders] = useState<string[]>([]);
  const addPhotos = (files: FileList | null, folderName = "Unsorted") => {
    if (!files) return;
    const next = [...files].filter((file) => file.type.startsWith("image/")).slice(0, 120).map((file) => ({ id: `${file.name}-${file.lastModified}`, name: file.name, url: URL.createObjectURL(file), people: [], album: folderName, favorite: false, addedAt: file.lastModified }));
    setPhotos((current) => [...current, ...next]);
  };
  const addPhotoFolder = (files: FileList | null) => { if (!files?.length) return; const first = [...files].find((file) => file.webkitRelativePath)?.webkitRelativePath.split("/")[0] ?? "Photo folder"; setPhotoFolders((folders) => folders.includes(first) ? folders : [...folders, first]); addPhotos(files, first); };
  const people = [...new Set(photos.flatMap((photo) => photo.people))];
  const albums = [...new Set(photos.map((photo) => photo.album))];
  const visible = photos.filter((photo) => (selectedPerson === "All photos" || photo.people.includes(selectedPerson)) && (!favoritesOnly || photo.favorite) && `${photo.name} ${photo.people.join(" ")} ${photo.album}`.toLowerCase().includes(photoSearch.toLowerCase())).sort((a, b) => newestFirst ? b.addedAt - a.addedAt : a.name.localeCompare(b.name));
  return <HubShell eyebrow="Photo viewer" icon={<Images className="size-4" />} title="A private people shelf." copy="Add photos from this device, then group them by people yourself. Nothing uploads from this browser. Google Photos remains a separate, opt-in destination.">
    <div className="mt-6 flex flex-col gap-3 rounded-lg bg-elevated p-5 shadow-border sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-medium text-fg">Your local photo selection</p><p className="mt-1 text-xs text-muted">Photo folders become albums here; people labels are local notes, ready to map to XMP/IPTC subject metadata later.</p></div><div className="flex flex-wrap gap-2"><label><input className="sr-only" type="file" accept="image/*" multiple onChange={(event) => addPhotos(event.target.files)} /><span className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">Add photos</span></label><label><input className="sr-only" type="file" multiple {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(event) => addPhotoFolder(event.target.files)} /><span className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border">Add photo folder</span></label><a href="https://photos.google.com/" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border">Open Google Photos</a><a href="https://www.google.com/android/find/" target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center rounded-sm bg-bg/50 px-4 text-sm text-fg shadow-border">Find my phone</a></div></div>
    <div className="mt-5 flex flex-col gap-3 rounded-lg bg-elevated p-4 shadow-border"><div className="flex flex-wrap gap-2"><Button size="sm" variant={selectedPerson === "All photos" ? "default" : "secondary"} onClick={() => setSelectedPerson("All photos")}>All photos</Button>{people.map((name) => <Button key={name} size="sm" variant={selectedPerson === name ? "default" : "secondary"} onClick={() => setSelectedPerson(name)}>{name}</Button>)}{albums.map((album) => <span key={album} className="rounded-sm bg-bg/45 px-2 py-1 text-xs text-muted">{album}</span>)}</div>{photoFolders.length > 0 && <p className="text-xs text-muted">Sources · {photoFolders.join(" · ")}</p>}<div className="flex flex-col gap-2 sm:flex-row"><Input value={photoSearch} onChange={(event) => setPhotoSearch(event.target.value)} placeholder="Search names, people, albums" aria-label="Search photos"/><Button size="sm" variant={favoritesOnly ? "default" : "secondary"} onClick={() => setFavoritesOnly((value) => !value)}>Favorites</Button><Button size="sm" variant="secondary" onClick={() => setNewestFirst((value) => !value)}>{newestFirst ? "Newest" : "A–Z"}</Button></div></div>
    {!photos.length ? <div className="mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border"><Images className="mx-auto size-7 text-accent" /><p className="mt-3 font-display text-2xl text-fg">Start with a few favorites</p><p className="mt-2 text-sm text-muted">Add photos here to make private people sections without connecting an account.</p></div> : <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">{visible.map((photo) => <div key={photo.id} className="overflow-hidden rounded-md bg-elevated shadow-border"><img src={photo.url} alt={photo.name} className="aspect-square w-full object-cover"/><div className="p-3"><div className="flex items-center gap-2"><p className="min-w-0 flex-1 truncate text-sm text-fg">{photo.name}</p><Button size="sm" variant={photo.favorite ? "default" : "secondary"} onClick={() => setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, favorite: !item.favorite } : item))}>♥</Button></div><Input className="mt-2 h-9" placeholder="People: Alex, Sam" value={photo.people.join(", ")} onChange={(event) => { const names = event.target.value.split(",").map((value) => value.trim()).filter(Boolean); setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, people: names } : item)); }} /><Input className="mt-2 h-9" placeholder="Album, e.g. Summer 2026" value={photo.album} onChange={(event) => setPhotos((items) => items.map((item) => item.id === photo.id ? { ...item, album: event.target.value || "Unsorted" } : item))} /></div></div>)}</div>}
  </HubShell>;
}
export function GamesSection() {
  const [games, setGames] = useState<LocalItem[]>([]);
  const [filter, setFilter] = useState("");
  const [removeGame, setRemoveGame] = useState<string | null>(null);
  useEffect(() => setGames(readHub().games), []);
  const saveGames = (next: LocalItem[]) => {
    setGames(next);
    const hub = readHub();
    writeHub({ ...hub, games: next });
  };
  const add = async (files: FileList | null, allowWebShortcut = false) => {
    if (!files) return;
    const source = [...files].filter((file) => allowWebShortcut ? /\.(exe|lnk|url|appref-ms)$/i.test(file.name) : /\.(exe|lnk|appref-ms)$/i.test(file.name));
    const next = await Promise.all(source.map(async (file) => {
      let launchUrl: string | undefined;
      if (/\.url$/i.test(file.name)) {
        const match = (await file.text()).match(/^URL=(https?:\/\/\S+)$/im);
        launchUrl = match?.[1];
      }
      return { name: file.name, path: file.webkitRelativePath || file.name, size: file.size, addedAt: Date.now(), launchUrl };
    }));
    setGames((current) => {
      const merged = [...current, ...next.filter((item) => !current.some((game) => game.path === item.path))];
      const hub = readHub(); writeHub({ ...hub, games: merged });
      return merged;
    });
  };
  const visible = games.filter((game) => game.name.toLowerCase().includes(filter.toLowerCase()));
  return <HubShell eyebrow="Desktop game shelf" icon={<Gamepad2 className="size-4" />} title="A clearer game drawer." copy="Choose a dedicated games folder, add custom cover icons, and explicitly import web game shortcuts. Desktop executables stay protected by your browser and need a native companion to start.">
    <div className="mt-6 flex flex-col gap-3 sm:flex-row"><label><input className="sr-only" type="file" multiple accept=".url" onChange={(event) => void add(event.target.files, true)} /><span className="inline-flex min-h-10 items-center rounded-sm bg-accent px-4 text-sm font-medium text-accent-fg">Add web game shortcut</span></label><label><input className="sr-only" type="file" multiple {...({ webkitdirectory: "", directory: "" } as Record<string, string>)} onChange={(event) => void add(event.target.files)} /><span className="inline-flex min-h-10 items-center rounded-sm bg-elevated px-4 text-sm text-fg shadow-border">Choose game folder</span></label><Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter your games" aria-label="Filter games" /></div>
    {visible.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{visible.map((game) => <div key={game.path} className="flex items-center gap-4 rounded-lg bg-elevated p-4 shadow-border"><div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-md bg-bg/50 text-accent">{game.iconData ? <img src={game.iconData} alt="" className="size-full object-cover"/> : <Gamepad2 className="size-6" />}</div><div className="min-w-0 flex-1"><p className="truncate text-base font-medium text-fg">{game.name.replace(/\.(exe|lnk|url|appref-ms)$/i, "")}</p><p className="mt-1 truncate text-xs text-muted">{game.launchUrl ? "Web shortcut ready to launch" : game.path}</p><div className="mt-3 flex flex-wrap items-center gap-3">{game.launchUrl ? <a target="_blank" rel="noreferrer" href={game.launchUrl} className="inline-flex items-center text-xs font-medium text-accent hover:text-fg"><Rocket className="mr-1 size-3" />Launch shortcut</a> : <span className="text-xs text-subtle">Desktop launcher cataloged</span>}<label className="inline-flex cursor-pointer items-center text-xs text-muted hover:text-fg"><ImagePlus className="mr-1 size-3" /> Set icon<input className="sr-only" type="file" accept="image/*" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = () => saveGames(games.map((item) => item.path === game.path ? { ...item, iconData: String(reader.result) } : item)); reader.readAsDataURL(file); }} /></label><a target="_blank" rel="noreferrer" href={`https://store.steampowered.com/search/?term=${encodeURIComponent(game.name.replace(/\..*$/, ""))}`} className="inline-flex text-xs text-muted hover:text-fg">Store page <ExternalLink className="ml-1 size-3" /></a><button type="button" className="text-xs text-muted hover:text-danger" onClick={() => removeGame === game.path ? (saveGames(games.filter((item) => item.path !== game.path)), setRemoveGame(null)) : setRemoveGame(game.path)}>{removeGame === game.path ? "Confirm remove" : "Remove"}</button></div></div></div>)}</div> : <div className="mt-5 rounded-lg bg-elevated px-5 py-14 text-center shadow-border"><Gamepad2 className="mx-auto size-7 text-accent"/><p className="mt-3 font-display text-2xl text-fg">Build your launch list</p><p className="mt-2 text-sm text-muted">Add `.url` shortcuts to launch their approved web destination, or catalog desktop launchers and choose a custom cover icon.</p></div>}
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><ServiceLink name="Nexus Mods" href="https://www.nexusmods.com/" copy="Browse mod pages and collections."/><ServiceLink name="Vortex" href="https://www.nexusmods.com/about/vortex/" copy="Open the official mod manager page."/></div>
  </HubShell>;
}

function LocalCatalog({
  kind,
  eyebrow,
  icon,
  title,
  copy,
  accept,
  directory,
  footer,
}: {
  kind: "prints" | "games";
  eyebrow: string;
  icon: ReactNode;
  title: string;
  copy: string;
  accept?: string;
  directory?: boolean;
  footer?: ReactNode;
}) {
  const [hub, setHub] = useState<HubStore>({ prints: [], games: [] });
  useEffect(() => setHub(readHub()), []);
  const items = hub[kind];
  const change = (files: FileList | null) => {
    if (!files?.length) return;
    const next = { ...hub, [kind]: filesToItems(files, kind === "games") };
    setHub(next);
    writeHub(next);
  };
  return (
    <HubShell eyebrow={eyebrow} icon={icon} title={title} copy={copy}>
      <label className="mt-6 flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-border bg-elevated/40 px-5 text-center transition-[background-color,border-color] duration-150 hover:border-fg/30 hover:bg-elevated">
        <PackageSearch className="size-7 text-accent" />
        <span className="mt-3 text-sm font-medium text-fg">
          {directory ? "Choose Desktop games folder" : "Add print files"}
        </span>
        <span className="mt-1 text-xs text-muted">
          {directory
            ? "Keeps only game launchers and shortcuts; folders and support files stay out."
            : "STL, OBJ, 3MF, and G-code are supported."}
        </span>
        <input
          type="file"
          multiple
          accept={accept}
          className="sr-only"
          {...(directory ? ({ webkitdirectory: "", directory: "" } as Record<string, string>) : {})}
          onChange={(event) => change(event.target.files)}
        />
      </label>
      {items.length > 0 && (
        <div className="mt-6 overflow-hidden rounded-lg shadow-border">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="text-sm font-medium text-fg">
              {items.length} saved {kind === "prints" ? "print files" : "games"}
            </p>
            <p className="text-xs text-subtle">Stored as names only</p>
          </div>
          {items.slice(0, 80).map((item) => (
            <div
              key={`${item.path}:${item.addedAt}`}
              className="flex items-center justify-between gap-4 border-b border-border/70 px-4 py-3 last:border-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm text-fg">{item.name}</p>
                <p className="truncate text-xs text-muted">{item.path}</p>
              </div>
              <p className="shrink-0 font-mono text-xs text-subtle">{bytes(item.size)}</p>
            </div>
          ))}
        </div>
      )}
      {footer}
    </HubShell>
  );
}

export function ShopSection() {
  const [query, setQuery] = useState("");
  const encoded = encodeURIComponent(query.trim());
  const stores = useMemo(
    () => [
      { name: "Amazon", href: `https://www.amazon.com/s?k=${encoded}`, detail: "Search Amazon" },
      {
        name: "Walmart",
        href: `https://www.walmart.com/search?q=${encoded}`,
        detail: "Search Walmart",
      },
    ],
    [encoded],
  );
  return (
    <HubShell
      eyebrow="Shopping shortcuts"
      icon={<ShoppingBag className="size-4" />}
      title="Find gear for your setup"
      copy="Search major retailers from one clean starting point. Listings, prices, checkout, and account activity stay on the retailer’s site."
    >
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search film gear, printer parts, controllers…"
            className="pl-9"
          />
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {stores.map((store) => (
          <a
            key={store.name}
            href={store.href}
            target="_blank"
            rel="noreferrer"
            className="group rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover"
          >
            <p className="font-display text-2xl text-fg">{store.name}</p>
            <p className="mt-1 text-sm text-muted">
              {query.trim() ? `${store.detail} for “${query.trim()}”` : store.detail}
            </p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
              Open search <ExternalLink className="size-4" />
            </span>
          </a>
        ))}
      </div>
    </HubShell>
  );
}

export function StreamingSection() {
  const services = [
    { name: "Netflix", href: "https://www.netflix.com/", copy: "Movies & series" },
    { name: "Hulu", href: "https://www.hulu.com/", copy: "TV & films" },
    { name: "Crunchyroll", href: "https://www.crunchyroll.com/", copy: "Anime streaming" },
    {
      name: "Internet Archive",
      href: "https://archive.org/details/feature_films",
      copy: "Open & public-domain films",
    },
  ];
  return (
    <HubShell
      eyebrow="Movie streaming"
      icon={<Clapperboard className="size-4" />}
      title="Streaming destinations"
      copy="Keep watch sources separate from shopping. These official services and public collections open in their own sites."
    >
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {services.map((service) => (
          <ServiceLink key={service.name} {...service} />
        ))}
      </div>
    </HubShell>
  );
}

export function SocialSection() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [handle, setHandle] = useState("");
  const [active, setActive] = useState("");
  useEffect(() => {
    try {
      setAccounts(JSON.parse(localStorage.getItem("reelcase.x-accounts") ?? "[]") as string[]);
    } catch {
      setAccounts([]);
    }
  }, []);
  const add = () => {
    const next = [...new Set([...accounts, handle.trim().replace(/^@/, "")].filter(Boolean))].slice(
      0,
      12,
    );
    setAccounts(next);
    localStorage.setItem("reelcase.x-accounts", JSON.stringify(next));
    setActive(next.at(-1) ?? "");
    setHandle("");
  };
  return (
    <HubShell
      eyebrow="Social browser"
      icon={<X className="size-4" />}
      title="X account shelf"
      copy="Save public handles locally and browse a selected public profile in this workspace. Reelcase does not read credentials, messages, or account data."
    >
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Input
          value={handle}
          onChange={(event) => setHandle(event.target.value)}
          placeholder="@account"
          aria-label="X account handle"
        />
        <Button disabled={!handle.trim()} onClick={add}>
          Add account
        </Button>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {accounts.length ? (
          accounts.map((account) => (
            <button
              key={account}
              type="button"
              onClick={() => setActive(account)}
              className={`rounded-lg p-5 text-left shadow-border transition-[background-color,color,transform] duration-150 hover:-translate-y-0.5 ${active === account ? "bg-accent text-accent-fg" : "bg-elevated text-fg"}`}
            >
              <p className="font-display text-2xl">@{account}</p>
              <p className="mt-1 text-sm opacity-70">Browse public profile</p>
            </button>
          ))
        ) : (
          <p className="rounded-lg bg-elevated px-4 py-8 text-sm text-muted shadow-border sm:col-span-2">
            Add public handles to keep a local launch list.
          </p>
        )}
      </div>
      {active && (
        <div className="mt-5 overflow-hidden rounded-lg bg-elevated shadow-border">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm text-fg">Browsing @{active}</p>
            <a
              href={`https://x.com/${encodeURIComponent(active)}`}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-accent hover:text-fg"
            >
              Open in X <ExternalLink className="ml-1 inline size-3.5" />
            </a>
          </div>
          <iframe
            title={`X profile ${active}`}
            src={`https://x.com/${encodeURIComponent(active)}`}
            className="h-120 w-full bg-bg"
          />
          <p className="px-4 py-3 text-xs text-subtle">
            If X blocks an embedded profile, use “Open in X”; that restriction is controlled by X.
          </p>
        </div>
      )}
    </HubShell>
  );
}

export function WatchRoomSection() {
  const [roomCode, setRoomCode] = useState(() => `RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`);
  const [roomInput, setRoomInput] = useState("");
  const [name, setName] = useState("Host");
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [guestAccess, setGuestAccess] = useState(false);
  const [localVideo, setLocalVideo] = useState<File | null>(null);
  const [rokuAddress, setRokuAddress] = useState("");
  const [rokuReady, setRokuReady] = useState(false);
  const [queue, setQueue] = useState<string[]>([]);
  const [stageSize, setStageSize] = useState<"compact" | "theater" | "cinema">("compact");
  const [playback, setPlayback] = useState({ playing: false, position: 0 });
  const [chat, setChat] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const videos = useLibrary((s) => s.videos);
  const [sharedVideoId, setSharedVideoId] = useState(() => videos.find((video) => Boolean(video.src || video.remote?.embedUrl))?.id ?? "");
  const sharedVideo = videos.find((video) => video.id === sharedVideoId);
  const roomVideoRef = useRef<HTMLVideoElement>(null);
  const lastRoomTick = useRef(0);
  const room = activeRoom ?? "";
  const p2p = useP2PRoom(room, name.trim() || "Guest");
  useEffect(() => p2p.onMessage((from, raw) => {
    const data = raw as { type?: string; text?: string; name?: string; playing?: boolean; position?: number; videoId?: string; queue?: string[] };
    if (data.type === "chat" && data.text) setChat((rows) => [...rows, `${data.name ?? from}: ${data.text}`].slice(-50));
    if (data.type === "sync") setPlayback({ playing: Boolean(data.playing), position: Number(data.position) || 0 });
    if (data.type === "video" && data.videoId) setSharedVideoId(data.videoId);
    if (data.type === "queue" && Array.isArray(data.queue)) setQueue(data.queue);
  }), [p2p.onMessage]);
  const sync = (next: { playing: boolean; position: number }) => {
    setPlayback(next); p2p.send({ type: "sync", ...next });
  };
  useEffect(() => {
    const media = roomVideoRef.current;
    if (!media || !sharedVideo || sharedVideo.remote) return;
    const driftLimit = playback.playing ? 0.65 : 0.1;
    if (Math.abs(media.currentTime - playback.position) > driftLimit) media.currentTime = playback.position;
    if (playback.playing && media.paused) void media.play().catch(() => {});
    if (!playback.playing && !media.paused) media.pause();
  }, [playback, sharedVideo]);
  const chooseVideo = (video: LibraryVideo) => { setSharedVideoId(video.id); setPlayback({ playing: false, position: 0 }); p2p.send({ type: "video", videoId: video.id }); p2p.send({ type: "sync", playing: false, position: 0 }); };
  const updateQueue = (next: string[]) => { setQueue(next); p2p.send({ type: "queue", queue: next }); };
  const queueVideo = (video: LibraryVideo) => { if (video.id !== sharedVideoId && !queue.includes(video.id)) updateQueue([...queue, video.id]); };
  const playNext = () => { const nextId = queue[0]; if (!nextId) return; const next = videos.find((video) => video.id === nextId); updateQueue(queue.slice(1)); if (next) chooseVideo(next); };
  const send = () => {
    const text = message.trim();
    if (!text) return;
    setChat((rows) => [...rows, `You: ${text}`].slice(-50));
    p2p.send({ type: "chat", text, name: name.trim() || "Guest" });
    setMessage("");
  };
  if (!activeRoom) return (
    <HubShell eyebrow="LAN watch room" icon={<Users className="size-4" />} title="Watch together, on your terms." copy="Create a private room code or join one on the same network. Peers connect directly; names, chat, and playback commands stay in the room.">
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Create a room</p><p className="mt-3 font-mono text-3xl tracking-[0.16em] text-fg">{roomCode}</p><p className="mt-2 text-sm text-muted">Share this code only with people you want in your watch room.</p><Button className="mt-5 w-full" onClick={() => setActiveRoom(roomCode)}><Wifi className="size-4" /> Start room</Button></div>
        <div className="rounded-lg bg-elevated p-5 shadow-border"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Join a room</p><Input className="mt-3" value={roomInput} onChange={(event) => setRoomInput(event.target.value.toUpperCase())} placeholder="Enter room code" aria-label="Watch room code"/><Input className="mt-2" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your display name" aria-label="Your display name"/><Button variant="secondary" className="mt-3 w-full" disabled={!roomInput.trim()} onClick={() => setActiveRoom(roomInput.trim())}>Join room</Button></div>
      </div>
    </HubShell>
  );
  return (
    <HubShell
      eyebrow="Connected watch room"
      icon={<Users className="size-4" />}
      title={`Room ${activeRoom}`}
      copy="Direct peer connection for your selected guests. Playback events are synchronized across connected devices."
    >
      <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-lg bg-elevated p-5 shadow-border">
          <div className="flex items-center justify-between gap-3"><p className="text-xs font-medium tracking-[0.14em] text-accent uppercase">Synchronized playback</p><span className="flex items-center gap-1.5 text-xs text-muted"><Radio className={`size-3 ${p2p.joined ? "text-accent" : "text-subtle"}`} />{p2p.joined ? "Signaling online" : "Connecting…"}</span></div>
          <h2 className="mt-2 font-display text-3xl text-fg">{playback.playing ? "Playing together" : "Paused together"}</h2>
          <p className="mt-2 text-sm text-muted">Timeline {Math.floor(playback.position / 60)}:{String(Math.floor(playback.position % 60)).padStart(2, "0")} · controls are sent to every connected guest.</p>
          <div className="mt-5 flex flex-wrap gap-2"><Button onClick={() => sync({ ...playback, playing: !playback.playing })}>{playback.playing ? <Pause className="size-4" /> : <Play className="size-4" />}{playback.playing ? "Pause" : "Play"}</Button><Button variant="secondary" onClick={() => sync({ ...playback, position: Math.max(0, playback.position - 15) })}>−15 sec</Button><Button variant="secondary" onClick={() => sync({ ...playback, position: playback.position + 15 })}>+15 sec</Button><Button variant="ghost" size="sm" disabled={!queue.length} onClick={playNext}>Play next {queue.length ? `(${queue.length})` : ""}</Button></div>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted"><span>Stage size</span>{(["compact", "theater", "cinema"] as const).map((size) => <Button key={size} size="sm" variant={stageSize === size ? "default" : "secondary"} onClick={() => setStageSize(size)}>{size}</Button>)}</div>
          <div className={`mt-3 mx-auto w-full overflow-hidden rounded-md bg-bg shadow-border ${stageSize === "compact" ? "max-w-2xl" : stageSize === "theater" ? "max-w-4xl" : "max-w-5xl"}`}>{sharedVideo?.remote?.embedUrl ? <iframe title={sharedVideo.name} src={`${sharedVideo.remote.embedUrl}${sharedVideo.remote.embedUrl.includes("?") ? "&" : "?"}autoplay=0&rel=0`} className="aspect-video w-full border-0" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : sharedVideo?.src ? <video ref={roomVideoRef} className="aspect-video w-full bg-bg" src={sharedVideo.src} controls onEnded={playNext} onPlay={() => sync({ playing: true, position: roomVideoRef.current?.currentTime ?? 0 })} onPause={() => sync({ playing: false, position: roomVideoRef.current?.currentTime ?? 0 })} onSeeked={() => sync({ playing: roomVideoRef.current ? !roomVideoRef.current.paused : false, position: roomVideoRef.current?.currentTime ?? 0 })} onTimeUpdate={() => { const media = roomVideoRef.current; if (!media || media.paused || Date.now() - lastRoomTick.current < 900) return; lastRoomTick.current = Date.now(); sync({ playing: true, position: media.currentTime }); }} /> : <div className="flex aspect-video items-center justify-center px-6 text-center text-sm text-muted">Choose a starter movie or an online video to show it to the room.</div>}</div>
          {sharedVideo?.remote?.embedUrl ? <p className="mt-2 text-xs text-subtle">Embedded services show the selected title for everyone; exact timestamp sync is available for local and library video files.</p> : null}
          <div className="mt-3 flex gap-2 overflow-x-auto pb-2">{videos.filter((video) => Boolean(video.src || video.remote?.embedUrl)).slice(0, 18).map((video) => <button key={video.id} type="button" onClick={() => chooseVideo(video)} className={`w-36 shrink-0 overflow-hidden rounded-sm text-left shadow-border ${video.id === sharedVideoId ? "bg-accent text-accent-fg" : "bg-bg/45 text-fg"}`}>{video.poster ? <img src={video.poster} alt="" className="aspect-video w-full object-cover" /> : null}<span className="block truncate px-2 py-2 text-xs">{video.name}</span></button>)}</div>
          <div className="mt-3 rounded-md bg-bg/45 p-3 shadow-border"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-fg">Up next queue</p><span className="text-xs text-muted">Hosts can order the room playlist</span></div>{queue.length ? <div className="mt-2 space-y-2">{queue.map((id, index) => { const video = videos.find((item) => item.id === id); return <div key={id} className="flex items-center justify-between gap-3 rounded-sm bg-elevated px-3 py-2"><span className="min-w-0 truncate text-sm text-fg">{index + 1}. {video?.name ?? "Unavailable title"}</span><div className="flex gap-1"><Button size="sm" variant="ghost" disabled={index === 0} onClick={() => { const next = [...queue]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; updateQueue(next); }}>↑</Button><Button size="sm" variant="ghost" onClick={() => updateQueue(queue.filter((item) => item !== id))}>Remove</Button></div></div>; })}</div> : <p className="mt-2 text-xs text-muted">Choose “Add next” below to build the shared queue.</p>}<div className="mt-3 flex gap-2 overflow-x-auto pb-1">{videos.filter((video) => Boolean(video.src || video.remote?.embedUrl) && video.id !== sharedVideoId).slice(0, 12).map((video) => <Button key={video.id} size="sm" variant="secondary" disabled={queue.includes(video.id)} onClick={() => queueVideo(video)}>Add next · {video.name}</Button>)}</div></div>
          <div className="mt-5 rounded-md bg-bg/45 p-4 shadow-border"><div className="flex items-center gap-2"><MonitorPlay className="size-4 text-accent"/><p className="text-sm font-medium text-fg">Share local video</p></div><p className="mt-1 text-xs text-muted">Choose a file only when every guest has permission to view it. Guests confirm access before you start sharing.</p><label className="mt-3 block"><input className="sr-only" type="file" accept="video/*" onChange={(event) => setLocalVideo(event.target.files?.[0] ?? null)} /><span className="inline-flex min-h-10 items-center rounded-sm bg-elevated px-3 text-sm text-fg shadow-border">{localVideo ? localVideo.name : "Choose local video"}</span></label><label className="mt-3 flex items-start gap-2 text-xs text-muted"><input type="checkbox" checked={guestAccess} onChange={(event) => setGuestAccess(event.target.checked)} /><span>I confirm guests have access to this video and may receive this direct share.</span></label><Button size="sm" className="mt-3" disabled={!localVideo || !guestAccess || !p2p.peers.length} onClick={() => p2p.send({ type: "share-ready", name: localVideo?.name })}>Send sharing request</Button></div>
          <div className="mt-3 rounded-md bg-bg/45 p-4 shadow-border"><p className="flex items-center gap-2 text-sm font-medium text-fg"><MonitorPlay className="size-4 text-accent" />Roku handoff</p><ol className="mt-2 space-y-1 text-xs text-muted"><li><span className="mr-2 text-accent">1.</span>On Roku, open Settings → Network → About and copy its IP address.</li><li><span className="mr-2 text-accent">2.</span>Enter it below to save this TV as a trusted handoff target.</li><li><span className="mr-2 text-accent">3.</span>Launch the channel and copy the room invitation to your Roku browser or companion app.</li></ol><div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={rokuAddress} onChange={(event) => { setRokuAddress(event.target.value); setRokuReady(false); }} placeholder="Roku IP address, e.g. 192.168.1.24" aria-label="Roku IP address"/><Button variant="secondary" disabled={!rokuAddress.trim()} onClick={() => { setRokuReady(true); localStorage.setItem("reelcase.roku", rokuAddress.trim()); }}>Save & pair TV</Button></div>{rokuReady && <div className="mt-3 rounded-sm bg-elevated p-3"><span className="text-xs text-accent">Step 3 ready · {rokuAddress}</span><div className="mt-2 flex flex-wrap gap-2"><Button size="sm" onClick={() => { const url = `${window.location.origin}${window.location.pathname}?room=${encodeURIComponent(activeRoom)}`; window.open(`http://${rokuAddress}:8060/launch/837`, "_blank", "noopener"); navigator.clipboard?.writeText(url).catch(() => {}); }}>Launch & copy room link</Button><Button size="sm" variant="ghost" onClick={() => { setRokuReady(false); localStorage.removeItem("reelcase.roku"); }}>Forget TV</Button></div></div>}</div>
        </div>
        <div className="rounded-lg bg-elevated p-4 shadow-border">
          <p className="flex items-center gap-2 text-sm font-medium text-fg">
            <MessageCircle className="size-4 text-accent" /> Room chat
          </p>
          <div className="mt-3 max-h-48 space-y-2 overflow-y-auto text-sm text-muted">
            {chat.map((row, index) => (
              <p key={`${row}-${index}`} className="rounded-sm bg-bg/45 px-3 py-2">
                {row}
              </p>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") send();
              }}
              placeholder="Say something"
              aria-label="Room chat message"
            />
            <Button size="sm" onClick={send}>
              Send
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-lg bg-elevated p-4 shadow-border"><p className="text-sm font-medium text-fg">Guests & connection status</p><div className="mt-2 flex flex-wrap gap-2"><span className="rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted">You · {p2p.joined ? "ready" : "joining"}</span>{p2p.peers.length ? p2p.peers.map((peer) => <span key={peer.id} className="rounded-sm bg-bg/45 px-3 py-2 text-xs text-muted">{peer.name || "Guest"} · {peer.connectionState}{peer.rttMs ? ` · ${peer.rttMs}ms` : ""}</span>) : <span className="text-xs text-subtle">Waiting for guests to join with the room code.</span>}</div><div className="mt-4 flex flex-wrap gap-2"><Input value={name} onChange={(event) => setName(event.target.value)} aria-label="Display name" className="max-w-56"/><Button variant="ghost" size="sm" onClick={() => { setActiveRoom(null); setRoomCode(`RC${Math.random().toString(36).slice(2, 7).toUpperCase()}`); }}>Leave room</Button></div></div>
    </HubShell>
  );
}

function HubShell({
  eyebrow,
  icon,
  title,
  copy,
  children,
}: {
  eyebrow: string;
  icon: ReactNode;
  title: string;
  copy: string;
  children: ReactNode;
}) {
  return (
    <section className="mx-auto max-w-4xl rounded-xl bg-surface p-5 shadow-border sm:p-8">
      <p className="flex items-center gap-2 text-xs font-medium tracking-[0.16em] text-accent uppercase">
        {icon} {eyebrow}
      </p>
      <h1 className="mt-3 font-display text-4xl leading-none tracking-tight text-fg sm:text-5xl">
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted sm:text-base">{copy}</p>
      {children}
    </section>
  );
}
function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-elevated px-4 py-4 shadow-border">
      <p className="font-mono text-2xl tabular-nums text-fg">{value}</p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}
function ServiceLink({ name, href, copy }: { name: string; href: string; copy: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="rounded-lg bg-elevated p-5 shadow-border transition-[transform,box-shadow] duration-150 hover:-translate-y-0.5 hover:shadow-border-hover"
    >
      <p className="font-display text-2xl text-fg">{name}</p>
      <p className="mt-1 text-sm text-muted">{copy}</p>
      <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent">
        Open <ExternalLink className="size-4" />
      </span>
    </a>
  );
}
function InfoCard({ icon, title, copy }: { icon: ReactNode; title: string; copy: string }) {
  return (
    <div className="rounded-lg bg-elevated p-5 shadow-border">
      <span className="text-accent">{icon}</span>
      <h2 className="mt-3 font-display text-2xl text-fg">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
    </div>
  );
}
